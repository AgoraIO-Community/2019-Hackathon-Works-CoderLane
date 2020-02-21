import React from 'react';

class LiveVideo extends React.Component {
  constructor(props) {
    super(props);
    const { stream } = props;
    this.state = {
      id: stream.getId(),
    }
  }
  componentDidMount() {
    this.props.stream.play(`video-stream-${this.state.id}`);
  }
  componentWillUnmount() {
    
  }
  render() {
    const { id } = this.state;

    return (
      <div className="live__item" id={`video-stream-${id}`}></div>
    )
  }
}

export default LiveVideo;