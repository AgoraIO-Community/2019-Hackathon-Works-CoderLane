import React from 'react';
import Switch from '../Switch';

class SettingSwitch extends React.Component {
  handleClick = () => {
    this.props.setValue(!this.props.value);
  }
  render() {
    const { value } = this.props;

    return (
      <Switch
        onClick={this.handleClick}
        right={value}
        offMode
        small
      />
    )
  }
}

export default SettingSwitch;
