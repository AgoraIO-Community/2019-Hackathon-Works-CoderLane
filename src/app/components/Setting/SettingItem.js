import React from 'react';
import SettingSwitch from './SettingSwitch';
import SettingNumber from './SettingNumber';

class SettingItem extends React.Component {
  getOptionComponent = () => {
    const { type, setValue, value } = this.props;
    if (type === 'boolean') {
      return (
        <SettingSwitch {...this.props} setValue={setValue} value={value} />
      )
    }
    if (type === 'number') {
      return (
        <SettingNumber {...this.props} setValue={setValue} value={value} />
      )
    }
  }
  render() {
    const { title } = this.props;

    return (
      <div className="d-flex justify-content-between align-items-center">
        <span>{title}</span>
        <div>{this.getOptionComponent()}</div>
      </div>
    )
  }
}

export default SettingItem;
