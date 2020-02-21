import React from 'react';
import _ from 'lodash';
import { bindActionCreators } from 'redux';
import { connect } from "react-redux";
import io from 'socket.io-client';
import SplitPane from 'react-split-pane';
import ReactNotification from "react-notifications-component";
import { If } from 'react-statements';
import {
  socketConnect,
  runStatus,
  snippetOpen,
  sandboxOpen,
  updateLang,
  createSandboxAction,
  updateSandbox,
} from 'app/actions';
import { getFirstBuffer, getLastBuffer, debug } from 'app/utils';
import Header from '../Header/Header';
import WorkSpace from '../WorkSpace';
import TopBar from '../WorkSpace/TopBar';
import Print from '../Print';
import Sandboxes from '../Sandboxes';
import Snippet from '../Snippet';
import Live from '../Live';

const splitPaneStyle = {
  overflow: 'visible'
};

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      width: 0,
      height: 0,
      openLive: false,
    };
    this.inited = false;
    this.notificationDOMRef = React.createRef();
  }
  componentDidMount() {
    const { socketConnectAction, sandbox: { _id } } = this.props;
    
    window.__socket__ = this.socket = io.connect(process.env.ROOT_URL, {
      query: {
        session: _id
      }
    });
    this.socket.on('connect', () => {
      if (this.socket.connected) { // 连接到服务器
        socketConnectAction(true);
      }
    });
    // 重新连接
    this.socket.on('reconnect_attempt', () => {
      const { sandbox: { _id } } = this.props;
      this.socket.query = {
        session: _id
      };
    });
    this.socket.on('reconnecting', () => {
      // 服务器断开客户端进行重新连接
      socketConnectAction(false);
    });
    this.socketEvents();
    window.addEventListener('resize', this.getEdit);
  }
  componentDidUpdate(prevProps) {
    const { sandbox: { lang: prevLang, _id: prevId }, app: { monaco: prevMonaco } } = prevProps;
    const { sandbox: { events, lang, _id }, app } = this.props;
    
    if (app.monaco && prevMonaco !== app.monaco && !this.inited) {
      this.inited = true;
      if (_.size(events)) {
        this.initMonacoEvent(events);
      }
    }
    if (prevLang !== lang) { // 切换语言
      const newModel = monaco.editor.createModel('', lang === 'node' ? 'javascript' : lang);
      app.monaco.setModel(newModel);
      __term__.reset();
      this.emit('env', { lang }, () => {
        debug('切换环境成功')
      });
    }
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.getEdit);
  }
  initMonacoEvent(events) {
    window.ignoreRemoteEvent = true;
    let i = 0;
    let len = events.length;

    for(; i < len; i++) {
      const item = events[i];
      const event = events[i].event;
      let j = 0;
      let jlen = event.changes.length;

      if (item.action === 'editor') {
        for(; j < jlen; j++) {
          const change = event.changes[j];
          // Refer to: https://github.com/Microsoft/monaco-editor/issues/432.
          try {
            this.executeEdits([
              {
                identifier: 'playback',
                range: new window.monaco.Range(
                  change.range.startLineNumber,
                  change.range.startColumn,
                  change.range.endLineNumber,
                  change.range.endColumn),
                text: change.text
              }
            ]);
          } catch (e) {
            console.log(e)
          }
        }
      }
    }
    window.ignoreRemoteEvent = false;
  }
  executeEdits = (edits, endCursorState) => {
    const { app } = this.props;
    app.monaco.getModel().pushEditOperations(app.monaco.getSelections(), edits, function() {
      return endCursorState ? endCursorState : null;
    });
    app.monaco.getModel().pushStackElement();
    if (endCursorState) {
      app.monaco.setSelections(endCursorState);
    }
  }
  handleRun = () => {
    const { sandbox: { lang, runStatus }, runStatusAction } = this.props;
    const line = __monaco__.getModel().getLineCount();
    let code = __monaco__.getValue();

    if (!_.trim(code)) return this.addNotification({message: 'Please enter some code to compile, first.'});
    // 代码运行中则停止
    if (runStatus) {
      runStatusAction(false);
      this.emit('stop');
      return;
    }
    runStatusAction(true);
    this.emit('execute', {
      lang: lang,
      code: code + '\n',
      color: '#dc322f',
      msg: ['Guest', ' ran ', line, ' lines of ', lang].join(''),
    });
  }
  socketEvents() {
    const {
      sandbox: { lang },
      runStatusAction
    } = this.props;

    this.emit('env', { lang }, () => {});
    this.socket.on('output', output => {
      this.write(output);
    });
    this.socket.on('started', data => {
      const { color, msg, id } = data;
      const escapeColor = [parseInt(color.slice(1, 3), 16), parseInt(color.slice(3, 5), 16), parseInt(color.slice(5, 7), 16)].join(";");
      let splitMsg = msg.split(' ');
      const name = splitMsg[0];
      
      splitMsg = splitMsg.splice(1);
      this.write([
        "\r\n\r\n[38;2;",
        escapeColor + 'm',
        name + "[0m ",
        splitMsg.join(' ') + '[8m;~',
        id + '~[0m\r\n\r\n'
      ].join(''));
    })
    this.socket.on('finished', data => {
      const { id, time } = data;
      runStatusAction(false);
      this.updateTime(id, time);
    });
    this.socket.on('event', data => {
      const { app: { monaco: monacoIns } } = this.props;
      const { event } = data;
      let i = 0;
      let len = event.changes.length;

      // 遍历所有monaco事件
      for(; i < len; i++) {
        const change = event.changes[i];
        // Refer to: https://github.com/Microsoft/monaco-editor/issues/432.
        try {
          window.ignoreRemoteEvent = true;
          monacoIns.executeEdits("", [
            {
              identifier: 'remote',
              range: new monaco.Range(
                change.range.startLineNumber,
                change.range.startColumn,
                change.range.endLineNumber,
                change.range.endColumn),
              text: change.text
            }
            ]);
        } finally {
          window.ignoreRemoteEvent = false;
        }
      }
    });
    this.socket.on('cursorChange', data => {
      const line = _.get(data, 'position.lineNumber', 0);
      const column = _.get(data, 'position.column', 0);
      window.ignoreRemoteEvent = true;
      this.moveCursorTo(line, column);
      window.ignoreRemoteEvent = false;
    });
    __term__.on('data', data => {
      this.emit('input', data); // from client xterm to socket
    });
  }
  emit = (type, data, fn) => {
    if (fn) return this.socket.emit(type, data, fn);
    this.socket.emit(type, data);
  }
  write = (data) => {
    __term__.write(data);
  }
  writeln = (data) => {
    this.write('\r\n' + data + '\r\n');
  }
  getEdit = el => {
    if (el) {
      this.el = this.el || el;
    }
    if (this.el) {
      const { width, height } = this.el.getBoundingClientRect();
      if (width !== this.state.width || height !== this.state.height) {
        this.setState({ width, height });
      }
    }
    if (window.__term__) {
      window.__term__.fit();
    }
  }
  moveCursorTo = (line, column) => {
    const { app: { monaco: monacoIns }} = this.props;

    // Refer to: https://github.com/Microsoft/monaco-editor/issues/898.
    monacoIns.setSelection(new monaco.Selection(line, column, line, column));
  }
  handleSplitPaneChange = () => {
    requestAnimationFrame(() => {
      this.getEdit();
    })
  }
  nameChange = (name) => {
    const {
      sandbox: { lang, _id },
      user,
      createSandboxAction
    } = this.props;

    if (!user) return this.addNotification({ message: 'Please log in first before operating' });
    createSandboxAction({ _id, name, lang });
  }
  addNotification = ({title, message}) => {
    const defaultOpts = {
      insert: "bottom-right",
      dismiss: { duration: 3000 },
      dismissable: { click: true },
      type: "success",
      container: "bottom-right",
      animationIn: ["animated", "fadeIn"],
      animationOut: ["animated", "fadeOut"],
    }
    this.notificationDOMRef.current.addNotification({
      ...defaultOpts,
      title,
      message,
    });
  }
  updateTime = (id, time) => {
    const DEFAULT_ATTR = 131328;

    const buffer = __term__._core.buffer;
    let index = 0;
    for(; index < buffer.lines.length; index ++) {
      const indexLine = buffer.lines.get(index);
      const firstWave = getFirstBuffer(buffer, index);
      const lastWave = getLastBuffer(buffer, index);

      if (lastWave > firstWave) {
        // firstWave + 1 去除波浪符号
        const findId = _.range(firstWave + 1, lastWave).map(function(index) {
          return indexLine.get(index)[1];
        });
        if (findId.join('') === id) {
          time = time > 1000 ? (time / 1000).toFixed(2) + "s" : time + "ms";
          const finishStr = ' (finished in ' + time + '):';
          // 循环完成时间字符串
          for (let fi = 0; fi < finishStr.length; fi++) {
            const singleStr = finishStr[fi];
            const tempIndex = firstWave - 1 + fi;
            if (tempIndex >= indexLine.length) {
              break;
            }
            indexLine.set(
              tempIndex,
              [DEFAULT_ATTR, singleStr, 1, singleStr.charCodeAt(0)]
            );
          }
          return __term__.refresh(0, index);
        }
      }
    }
  }
  handleInitedMonaco = () => {
    const { updateLangAction } = this.props;
    const createLang = window.localStorage.getItem('lang');

    if (createLang) {
      updateLangAction(createLang);
      localStorage.removeItem('lang');
    }
  }
  openLive = () => {
    const { openLive } = this.state;

    !openLive && this.setState({ openLive: true });
  }
  render() {
    const { width, height, openLive } = this.state;
    const {
      sandbox: { lang },
      app: { socketConnect, snippetOpen, sandboxOpen },
      snippetOpenAction,
      sandboxAction,
      updateSandbox,
    } = this.props;

    return (
      <div>
        <Header
          onRun={this.handleRun}
          onNew={snippetOpenAction}
          sandboxAction={sandboxAction}
          nameChange={this.nameChange}
          updateSandbox={updateSandbox}
          openLive={this.openLive}
        />
        <SplitPane
          maxSize={-100}
          split="vertical"
          defaultSize={'50%'}
          style={splitPaneStyle}
          pane2Style={{
            overflow: 'hidden'
          }}
          onChange={this.handleSplitPaneChange}
        >
          <div className="w-100 h-100">
            <TopBar name={lang} />
            <div
              ref={this.getEdit}
              style={{
                height: 'calc(100% - 36px)',
                width: '100%',
                position: 'relative'
              }}
            >
              <WorkSpace
                width={width}
                height={height}
                onInit={this.handleInitedMonaco}
              />
            </div>
          </div>
          <div className="w-100 h-100">
            <TopBar name="ball" tip="Shell Terminal" socketConnect={socketConnect} />
            <div
              ref={this.getEdit}
              className="print__wrap"
            >
              <Print socketConnect={!socketConnect} />
            </div>
          </div>
        </SplitPane>
        <Snippet isOpen={snippetOpen} onClose={snippetOpenAction} />
        <Sandboxes isOpen={sandboxOpen} onClose={sandboxAction} />
        <ReactNotification ref={this.notificationDOMRef} />
        <If when={openLive}>
          <Live />
        </If>
      </div>
    )
  }
}

const mapStateToProps = ({ app, sandbox, user }) => ({
  app,
  user,
  sandbox,
});

const mapDispatchToProps = dispatch => ({
  socketConnectAction: bindActionCreators(socketConnect, dispatch),
  runStatusAction: bindActionCreators(runStatus, dispatch),
  snippetOpenAction: bindActionCreators(snippetOpen, dispatch),
  sandboxAction: bindActionCreators(sandboxOpen, dispatch),
  updateLangAction: bindActionCreators(updateLang, dispatch),
  createSandboxAction: bindActionCreators(createSandboxAction, dispatch),
  updateSandbox: bindActionCreators(updateSandbox, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(Home);
