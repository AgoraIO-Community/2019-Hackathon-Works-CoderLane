import path from 'path';
import _ from 'lodash';
import write from 'write';
import fse from 'fs-extra';
import uuidv1 from 'uuid/v1';
import Model from './models';
const { spawn } = require('child_process');
const nodePty = require('node-pty')

/**
 * { dockerId: { key:val } }
 */
const cs = {};
const cwd = process.cwd();
const ws = '/root'; // docker 工作目录

function sandbox(io) {
  io.on('connection', (socket) => {
    const query = _.get(socket, 'handshake.query');
    const { session, username } = query;
    const room = session || socket.id;        // 以session或socket.id为房间号

    socket.join(room);
    
    /************事件绑定***********/
    socket.on('env', async (data, ackFn) => {
      const { lang } = data;
      const containerId = get('containerId');
      const path = `${cwd}/codes/${containerId}`;

      set('lang', lang);
      await stopContainer();
      dockerRun(lang);
      ackFn('success'); // ack
    });
    socket.on('execute', async data => {
      const { lang } = data;
      const containerId = get('containerId');
      const stopped = get('stopped');
      let runId = uuidv1();
      let pty = null;
      let runExecute = null;
      let startMate = null;
      let startTime = null;
      let endTime = null;
      let shellOutput = [];
      // 内存
      let runMemory = '50m';
      let runSwap = '60m';
      // 写文件
      let uuid, suffix, path, filePath;
      console.log('>>>>>>>>>>>', data)
      if (!containerId) console.log('没有容器id > ', containerId);
      if (stopped) return;
      set('lang', lang);
      runId = runId.split('-');
      // 开始运行动作处理
      startMate = { id: runId[0], color: data.color, msg: data.msg };
      toRoom('started', startMate);
      shellOutput.push({ started: startMate });
      // if (isSave) {
      //   await saveEvent({ action: 'started', event: startMate });
      // }
      suffix = mapLanguageSuffix[lang];
      path = `${cwd}/codes/${containerId}`;
      filePath = `${path}/Main.${suffix}`;
      await wrtieFile(filePath, data.code);
      if(!isDynamic(lang)) {
        runExecute = dockerExec(lang);
        runExecute.stdout.on('data', (data) => {
          io.sockets.to(room).emit('output', runExecuteOut(data));
        });
        runExecute.stderr.on('data', (data) => {
          io.sockets.to(room).emit('output', runExecuteOut(data));
        });
        function runExecuteOut(data) {
          data = data.toString('utf8');
          shellOutput.push({ output: data });
          // if (isSave) {
          //   saveEvent({ action: 'output', event: data }); // 静态语言输出日志
          // }
          io.sockets.to(room).emit('output', data);
        }
      } else {
        if (get('runPty')) killREPl(get('runPty'), lang);

        pty = dockerExec(lang, true);

        pty.on('data', (data) => {
          io.sockets.to(room).emit('output', data);
          shellOutput.push({ output: data });
          // if (isSave) {
          //   saveEvent({ action: 'output', event: data });
          // }
        });

        console.log('-------lang > ', lang)
        runExecute = dockerExec(lang);
        set('runPty', pty); // 记录当前pty，下次执行会销毁它
        set('pty', pty);
      }
      remove('stopped');
      set('runExecute', runExecute);
      startTime = new Date();
      runExecute.on('close', async (e) => {
        remove('runExecute');
        endTime = new Date();
        // 完成动作处理
        const finishedMate = { id: runId[0], time: endTime - startTime };
        io.sockets.to(room).emit('finished', finishedMate);
        shellOutput.push({ finished: finishedMate });
        // if (isSave) {
        //   await saveEvent({ action: 'finished', event: finishedMate });
        // }
        // if (isSave) {
        //   const laneMeta = await Lane.findOne({ session: session })
        //   let lastEvent = _.nth(laneMeta.events, _.findLastIndex(laneMeta.events, v => v.action === 'editor'));
        //   lastEvent.output = [...lastEvent.output, ...shellOutput];
        //   console.log('save output > ', lastEvent);
        //   await laneMeta.save();
        // }
        // fse.remove(path); // 删除执行后的文件夹
      });
    });
    // TODO:在前端停止时可能存在遗留的文件夹未被删除
    socket.on('stop', async () => {
      const lang = get('lang');
      const runExecute = get('runExecute');
      const stopped = get('stopped');

      console.log('当前容器停止状态 > ', stopped);

      set('stopped', 'processing');

      console.log('开始停止容器 >')
      if (runExecute) {
        runExecute.kill('SIGHUP');
      }
      // 如果是动态语言才进行pty连接
      if (isDynamic(lang)) {
        if (get('runPty')) {
          killREPl(get('runPty'), lang);
          await stopContainer();
          console.log('停止容器成功 > ');

          dockerRun(lang)
          remove('stopped')
        }
      } else {
        remove('stopped')
      }
      toRoom('stopped')
    });
    socket.on('input', input => {
      const pty = get('pty');
      pty && pty.write(input);
    });
    // 编辑事件
    socket.on('event', async (data, ackFn) => {
      try {
        session && await saveEvent(data);
      } catch (e) {
        console.log('保存event失败 > %O', e);
      }
      broadcast('event', data);
      ackFn('success'); // ack
    });
    // 光标同步
    socket.on('cursorChange', (data) => {
      broadcast('cursorChange', data);
    });
    /**********事件绑定结束***********/
    /**
     * 保存事件
     * @param {*} data  => { action: 类型, data, event: 数据 }
     */
    async function saveEvent(data) {
      const sandbox = await Model.Sandbox.findOne({ _id: session })
      sandbox.events.push(data)
      return sandbox.save();
    }

    function toClient(type, data) {
      io.sockets.to(socket.id).emit(type, data);
    }
    // 广播事件除自己外
    function broadcast(type, data) {
      const rooms = io.sockets.adapter.rooms[room];
      const sockets = Object.keys(rooms.sockets).filter((item) => item !== socket.id);
      let sendTo = null;
  
      sockets.forEach((s) => {
        sendTo = io.to(s);
      });
      sendTo && sendTo.emit(type, data);

    }
    // 向房间所有用户广播包括自己
    function toRoom(type, data) {
      io.sockets.to(room).emit(type, data);
    }
  
    // 移除pty所有事件
    function removeListener() {
      const pty = get('pty');
      try {
        if (!pty) return;
        pty.removeAllListeners('data');
        pty.removeAllListeners('exit');
        pty.kill();
      } catch(e) {
        plog('停止事件失败 %O', e);
      }
    }
    /**
     * 通过命令退出repl
     */
    function killREPl(pty, lang) {
      const killMap = {
        'ruby': 'exit()\n',
        'python': 'exit()\n',
        'node': '.exit\n',
      };
  
      if (!pty) {
        console.log('killREPl 没找到 pty');
        return;
      }
      try {
        if (!pty) return;
        pty.removeAllListeners('data');
        pty.removeAllListeners('exit');
        pty.write(killMap[lang]);
        pty.kill();
      } catch(e) {
        console.log('停止事件失败 > ', e);
      }
    }
    /**
     * 动态语言运行代码
     * @param {*} lang 语言
     * @param {*} isPty 是否创建pty
     */
    function dockerExec(lang, isPty) {
      const containerId = get('containerId');
      let execParams = [];

      execParams.push('exec');
      if (isPty) {
        execParams.push('-it');
      } else {
        execParams.push('-t');
      }
      // execParams.push('--user', 'coderlane');
      // if (isDynamic(lang)) {
      //   execParams.push('--user', 'coderlane');
      // }
      execParams.push('-w', ws, containerId);
      if (isDynamic(lang) && isPty) {
        execParams.push(...replParams(lang)); // 动态语言运行
      } else {
        execParams.push(...replParams(lang, true)); // 动态语言运行
      }
      // console.log('dockerExec 参数 > ', execParams);
      if (isDynamic(lang) && isPty) { // 动态语言需要pty
        return nodePty.spawn('docker', execParams);
      } else { // 不需要pty，直接执行
        // console.log('静态语言 >>> ', execParams.join(' '))
        return spawn('docker', execParams);
      }
    }

    /**
     * 创建容器(docker run)，如果可以附加pty
     * @param {*} lang 
     */
    function dockerRun(lang) {
      const containerId = uuidv1();
      const path = `${cwd}/codes/${containerId}`;
      let pty = null;
      let runParams = [
        'run',
      ];

      if (lang === 'html') {
        return;
      }

      set('containerId', containerId); // 保存容器的id

      if (isDynamic(lang)) { // 容器运行方式
        runParams.push('-it'); // 动态语言
      } else {
        runParams.push('-itd'); // 静态语言
      }

      runParams.push('--rm', '-m', '300m', '--memory-swap', '320m');

      // runParams.push('-u', 'coderlane');
      // if (isDynamic(lang)) { // 动态语言设置容器运行用户
      //   runParams.push('-u', 'coderlane');
      // }

      runParams.push('--name', containerId);
      runParams.push('-w', ws); // 工作目录
      runParams.push('-v', `${path}:${ws}`); // 挂载路径

      if (getMount(lang)) { // 挂载文件
        runParams = runParams.concat(getMount(lang));
      }

      runParams.push(`coderlane-${lang}`); // 镜像名称
      runParams.push(getCommand(lang)); // 容器运行命令

      pty = nodePty.spawn('docker', runParams);

      // console.log('dockerRun 参数 > ', runParams);
      if (!isDynamic(lang)) { // 如果是静态语言返回不绑定pty
        return;
      }

      pty.on('data', (data) => {
        io.sockets.to(room).emit('output', data);
        // isSave && saveEvent({ action: 'output', event: data });
      })
      pty.on('close', code => {
        console.log('原始pty退出 id > ', containerId);
        // 创建容器时的哪个pyt关闭代表容器关闭
        fse.remove(path); // 删除执行后的文件夹
      });
      set('pty', pty);
    }
    // 停止容器
    function stopContainer() {
      return new Promise((resolve, reject) => {
        const containerId = get('containerId');
        const path = `${cwd}/codes/${containerId}`;
        if (containerId) {
          // 移除老的容器
          const run = spawn(
            'docker',
            ['kill', get('containerId')]
          );
          run.on('close', () => {
            fse.remove(path);
            remove('containerId');
            resolve();
          })
          run.on('error', function(e) {
            reject('停止容器错误 > ', e);
          })
        } else {
          resolve();
        }
      });
    }
    function get(key, defaultValue) {
      return _.get(cs, `${room}.${key}`, defaultValue);
    }
    function set(key, val) {
      return _.set(cs, `${room}.${key}`, val);
    }
    function remove(key) {
      return _.set(cs, `${room}.${key}`, undefined);
    }
  });
}

const mapLanguageSuffix = {
  'cpp': 'cpp',
  'java': 'java',
  'go': 'go',

  'node': 'js',
  'ruby': 'rb',
  'python': 'py',
  'python3': 'py',
  'bash': 'sh',
  'php': 'php',
  'mysql': 'sql',
}

/**
 * 获取repl参数
 * @param {*} lang
 * @params {*} isRun 是否运行代码, 如果为true则直接执行代码, 如果为false则运行+pty
 */
function replParams(lang, isRun) {
  const suffix = mapLanguageSuffix[lang];
  const fileName = `./Main.${suffix}`;

  if (!isRun) { // pty模式
    switch(lang) {
      case 'node':
        return ['node', '--harmony', 'repl.js', fileName];
      case 'bash':
        return ['bash', '--rcfile', fileName];
      case 'python':
      case 'python3':
        return ['ipython', '-i', fileName];
      case 'ruby':
        return ['rescue', '-i', fileName];
      default:
        return '';
    }
  } else { 
    switch(lang) { // 运行代码模式
      case 'node':
      case 'bash':
      case 'python':
      case 'ruby':
        return [lang, `${fileName}`];
      case 'java':
        return ['sh', '-c', "javac -classpath /root/package/*:. Main.java && java -classpath /root/package/*:. Main"];
      case 'cpp':
        return ['sh', '-c', "g++ Main.cpp -o Main -O2 -std=c++17 -lcurl && ./Main"];
      case 'go':
        return ['sh', '-c', "go run ./Main.go"];
      case 'php':
          return ['sh', '-c', "php ./Main.php"];
      default:
        return '';
    }
  }
}

/**
 * 写文件
 * @param {*} filePath 文件路径
 * @param {*} data 文件数据
 */
async function wrtieFile(filePath, data) {
  try {
    await fse.ensureFile(filePath);
    await write(filePath, data);
  } catch(e) {
    console.log('创建文件夹和文件夹失败 > ', e);
  }
}

/**
 * 获取需要挂在的文件
 * @param {*} lang 
 */
function getMount(lang) {
  switch(lang) {
    case 'node':
      return [
        '-v', `${replPath(lang)}/repl.js:${ws}/repl.js`,
      ];
    case 'bash':
      return [
        '-v', `${replPath(lang)}/.bashrc:${ws}/.bashrc`,
      ]
    case 'python':
    case 'python3':
      return [
        '-v', `${replPath(lang)}/ipython_config.py:${ws}/.ipython/profile_default/ipython_config.py`,
      ];
    case 'ruby':
      return [
        '-v', `${replPath(lang)}/.pryrc:${ws}/.pryrc`,
      ]
    default:
      return '';
  }
}

/**
 * 获取给定语言是否是动态语言
 * @param {*} language 给定的语言
 * @return {Boolean} true为动态语言, false为静态语言
 */
function isDynamic(language) {
  switch(language) {
    case 'node':
    case 'ruby':
    case 'bash':
    case 'python':
    case 'python3':
    case 'postgres':
    case 'mysql':
      return true;
    default:
      return false;
  }
}

/**
 * 获取给定语言的命令行工具
 * @param {*} lang 
 */
function getCommand(lang) {
  switch(lang) {
    case 'node':
      return 'node';
    case 'python':
    case 'python3':
      return 'ipython';
    case 'ruby':
      return 'pry';
    default:
      return 'bash'; // 静态语言以bash运行
  }
}

/**
 * 根据语言获取repl
 * @param {*} lang 
 */
function replPath(lang) {
  switch(lang) {
    case 'node':
    case 'ruby':
    case 'python':
    case 'python3':
    case 'bash':
      return `${cwd}/dockers/repl/${lang}`;
    default:
      return `${cwd}/dockers/repl/empty`;
  }
}

export default sandbox;