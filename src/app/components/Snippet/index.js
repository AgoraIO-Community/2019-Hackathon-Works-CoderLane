import React from 'react';
import Modal from 'react-modal';
import SnippetItem from './SnippetItem';
import './style.scss';

Modal.setAppElement('#app');

const modalStyle = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    overflowY: 'auto',
    zIndex: 30,
    transform: 'translate3d(0px, 0px, 0px)'
  },
  content: {
    position: 'relative',
    top: '20vh',
    left: 0,
    right: 0,
    bottom: 40,
    overflow: 'hidden',
    border: 'none',
    borderRadius: 8,
    outline: 'none',
    padding: 0,
    maxWidth: 540,
    margin: '0px auto 20vh',
    backgroundColor: '#1c2022',
  }
}

class Snippet extends React.Component {
  handleClose = () => {
    this.props.onClose(false);
  }
  handleClick = (lang) => {
    window.localStorage.setItem('lang', lang);
    location.href = '/sandbox';
  }
  render() {
    const { isOpen } = this.props;

    return (
      <Modal
        isOpen={isOpen}
        onRequestClose={this.handleClose}
        style={modalStyle}
      >
        <div className="snippet">
          <h3>New Snippet</h3>
          <div className="snippet__container">
            <SnippetItem title="node" onClick={this.handleClick} />
            <SnippetItem title="ruby" onClick={this.handleClick} />
            <SnippetItem title="go" onClick={this.handleClick} />
          </div>
        </div>
      </Modal>
    )
  }
}

export default Snippet;