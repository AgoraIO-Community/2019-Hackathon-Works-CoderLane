export function debug() {
  if (process.env.NODE_ENV !== 'production') {
    console.log.apply(this, arguments);
  }
};
/**
 * 更新monaco设置
 * @param {*} setting {tabSize: 4, fontSize: 12}
 */
export function updateSettig(setting) {
  Object.keys(setting).forEach(key => {
    const value = setting[key];

    switch(key) {
      case 'tabSize':
        // https://github.com/Microsoft/monaco-editor/issues/270#issuecomment-273263768
        window.__monaco__.getModel().updateOptions({ [key]: value })
        break;
      default:
        window.__monaco__.updateOptions({ [key]: value });
    }
  });
}

/**
 * 判断字符是否是~符号
 * @param {*} line 
 */
export function isWaveSymbal(line) {
  var first = line[0];
  var second = line[1];

  return first >> 18 == 4096 && "~" === second;
}

export function getFirstBuffer(buffer, index) {
  var indexLine = buffer.lines.get(index);
  for(var i = 0; i < indexLine.length; i++) {
    if (isWaveSymbal(indexLine.get(i))) {
      return i;
    }
  }
  return -1;
}
export function getLastBuffer(buffer, index) {
  var indexLine = buffer.lines.get(index);
  for(var i = indexLine.length; i > 0; i--) {
    if (isWaveSymbal(indexLine.get(i))) {
      return i;
    }
  }
  return -1;
}