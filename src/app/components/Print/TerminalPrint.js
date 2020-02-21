import React from 'react';
import { Terminal } from 'xterm';
import * as fit from 'xterm/lib/addons/fit/fit';

Terminal.applyAddon(fit);

class TerminalPrint extends React.Component {
  constructor(props) {
    super(props);
    this.term = null;
  }
  componentDidMount() {
    this.initPrint();
  }
  initPrint() {
    this.term = new Terminal({
      cursorBlink: true,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      lineHeight: 1.4,
      fontSize: 12,
      theme: {
        background: '#1c2022'
      },
    });
    this.term.open(this.terminalEl);
    window.__term__ = this.term; // debugger
  }
  getTerminal = el => {
    this.terminalEl = el;
  }
  render() {
    return (
      <div style={{ width: '100%', height: '100%' }} ref={this.getTerminal} />
    )
  }
}

export default TerminalPrint;