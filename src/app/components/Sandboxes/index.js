import React from 'react';
import Modal from 'react-modal';
import { connect } from "react-redux";
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

class Sandboxes extends React.Component {
  handleClose = () => {
    this.props.onClose(false);
  }
  handleToSandbox = id => e => {
    window.location.href = `/sandbox/${id}`;
  }
  render() {
    const { isOpen, app: { sandboxes } } = this.props;

    return (
      <Modal
        isOpen={isOpen}
        onRequestClose={this.handleClose}
        style={modalStyle}
      >
        <div className="sandboxes">
          <h3>My Sandboxes</h3>
          <div className="sandboxes__container">
            <ul>
              {sandboxes.map(v => {
                return <li key={v._id} onClick={this.handleToSandbox(v._id)}>{v.name}</li>
              })}
            </ul>
          </div>
        </div>
      </Modal>
    )
  }
}

const mapStateToProps = ({ app }) => ({
  app,
});

export default connect(mapStateToProps)(Sandboxes);
