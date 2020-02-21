import React from 'react';
import Modal from 'react-modal';
import { Context } from 'app/configs/constants';
import { settingUpdate } from 'app/actions';
import SettingItem from './SettingItem';
import SubDescription from './SubDescription';
import Split from './Split';
import './style.scss';

Modal.setAppElement('#app')

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

class Setting extends React.Component {
  static contextType = Context
  bindVaue = key => {
    const { setting, dispatch } = this.context;
    return {
      value: setting[key],
      setValue: value => dispatch(settingUpdate({ key, value })),
    }
  }
  render() {
    const { isOpen } = this.props;

    return (
      <Modal
        isOpen={isOpen}
        onRequestClose={this.props.closeModal}
        style={modalStyle}
      >
        <div className="setting">
          <h3>Settings</h3>
          <SettingItem
            title="Line numbers"
            type="boolean"
            {...this.bindVaue('lineNumbers')}
          />
          <SubDescription>
            Controls whether to show line numbers. Defaults to true.
          </SubDescription>
          <Split />
          
          <SettingItem
            title="Auto Indent"
            type="boolean"
            {...this.bindVaue('autoIndent')}
          />
          <SubDescription>
            Enable auto indentation adjustment. Defaults to false.
          </SubDescription>
          <Split />

          <SettingItem
            title="Tab Size"
            type="number"
            {...this.bindVaue('tabSize')}
          />
          <SubDescription>
            Number of spaces per indentation level. Inherited by all formatters.
          </SubDescription>
          <Split />

          <SettingItem
            title="Font Size"
            type="number"
            {...this.bindVaue('fontSize')}
          />
          <SubDescription>
            Controls the font size in pixels
          </SubDescription>

        </div>
      </Modal>
    )
  }
}

export default Setting;
