import React from 'react';
import CodeEditor from '../CodeEditor';
import './style.scss';

class WorkSpace extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
    };
  }
  componentDidMount() {
    console.log('did')
    this.timer = setInterval(this.checkoutLoaded, 200);
  }
  checkoutLoaded = () => {
    if (typeof window !== 'undefined' && window.monacoLoaded) {
      this.setState({ loaded: true });
      clearInterval(this.timer);
    }
  }
  render() {
    const { loaded, onInit } = this.state;

    return (
      <div className="workspace">
        {loaded && <CodeEditor onInit={onInit} {...this.props} />}
      </div>
    )
  }
}

export default WorkSpace;
