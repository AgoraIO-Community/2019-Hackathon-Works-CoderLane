import React from 'react';
import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import async from 'async';
import { updateSettig } from 'app/utils';
import { Context } from 'app/configs/constants';
import { updateApp } from 'app/actions';

class MonacoEditor extends React.Component {
  static contextType = Context
  constructor(props) {
    super(props);
    this.monaco = null;
    this.editorQueue = async.queue((data, callback) => {
      if (data.action === 'editor') {
        window.__socket__.emit('event', { action: 'editor', event: data.event }, (data) => {
          callback();
        });
      }
    }, 1);
  }
  componentDidMount() {
    // https://github.com/microsoft/monaco-editor/blob/master/test/playground.generated/customizing-the-appearence-exposed-colors.html
    monaco.editor.defineTheme('myTheme', {
      base: 'vs-dark',
      inherit: true,
      rules: [{ background: '1c2022' }],
      colors: {
        'scrollbar.shadow': '#000000',
      }
    });
    monaco.editor.setTheme('myTheme');
    this.initMonaco();
  }
  componentDidUpdate(prevProps) {
    const { width, height } = this.props;
    const { width: prevWidth, height: prevHeight } = prevProps;

    if (width !== prevWidth || height !== prevHeight) {
      this.monaco.layout({
        width,
        height
      });
    }
  }
  getElement = el => {
    this.el = el;
  }
  initMonaco() {
    const { updateAppAction, onInit } = this.props;

    window.__monaco__ = this.monaco = monaco.editor.create(this.el, {
      language: 'javascript',
      theme: 'myTheme',
      minimap: {
        maxColumn: 50, // 迷你地图宽度
      },
      scrollbar: {
        useShadows: false,
      },
      contextmenu: false,
    });
    this.monaco.onDidChangeModelContent(change => {
      const { sandbox: { _id } } = this.props;
      
      if (window.ignoreRemoteEvent || !_id) return;
      this.editorQueue.push({
        action: 'editor',
        event: change,
      }, () => ({}));
    });
    this.monaco.onDidChangeCursorPosition((cursorChange) => {
      const { sandbox: { _id } } = this.props;

      if (window.ignoreRemoteEvent || !_id) return;
      if (cursorChange.source !== 'api') {
        window.__socket__.emit('cursorChange', cursorChange);
      }
    })
    updateSettig(this.context.setting);
    updateAppAction({ key: 'monaco', value: this.monaco });
    onInit && onInit(this.monaco);
  }
  render() {
    const { width, height } = this.props;

    return (
      <div
        ref={this.getElement}
        style={{
          width,
          height,
          overflow: 'hidden',
          position: 'absolute'
        }}
      />
    )
  }
}

const mapStateToProps = ({ sandbox }) => ({
  sandbox,
});

const mapDispatchToProps = dispatch => ({
  updateAppAction: bindActionCreators(updateApp, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(MonacoEditor);
