const { spawn } = require('child_process');
const config = require('./config');

let len = config.length;
let i = 0;

build(i);
function build(index) {
  const name = config[index];
  const imageTag = `coderlane-${name}`;
  const dockerFile = `${__dirname}/Dockerfile-${name}`
  const child = spawn('docker', ['build', '-t', imageTag, '-f', dockerFile, '.'], {
    cwd: process.pwd,
    env: process.env
  });

  child.stdout.on('data', (data) => {
    process.stdout.write(data);
  });
  child.on('close', (code) => {
    if (i < len) {
      i++;
      build(i);
    }
    return 0;
  });
}

// TODO: 未知异常
// docker build -t coderlane-mysql -f ./Dockerfile-mysql .
// docker build -t coderlane-python -f ./Dockerfile-python .
// docker build -t coderlane-php -f ./Dockerfile-php .