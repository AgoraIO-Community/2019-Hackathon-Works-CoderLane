import React from 'react';
import VSCode from './VSCode';

class CodeEditor extends React.Component {
  render() {
    const { width, height, style, onInit } = this.props;
    return (
      <div
        style={{
          width: width || '100%',
          height: height || '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          ...style
        }}
      >
        <VSCode {...this.props} onInit={onInit} />
      </div>
    )
  }
}

export default CodeEditor;
