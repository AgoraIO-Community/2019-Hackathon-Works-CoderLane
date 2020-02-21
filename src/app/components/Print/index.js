import React from 'react';
import TerminalPrint from './TerminalPrint';
import Loading from './Loading';
import './style.scss';

class Print extends React.Component {
  render() {
    const { socketConnect } = this.props;

    return (
      <div className="print">
        <Loading show={socketConnect} />
        <TerminalPrint />
      </div>
    )
  }
}

export default Print;
