import React from 'react';
import PropTypes from 'prop-types';

class HoverMenu extends React.Component {
  componentDidMount() {
    document.addEventListener('click', this.handleDocumentClick);
  }
  componentWillUnmount() {
    document.removeEventListener('click', this.handleDocumentClick);
  }
  handleDocumentClick = () => {
    this.props.onClose();
  }
  handleClick = (e) => {
    e.stopPropagation();
    this.props.onClose();
  }
  render() {
    const { children } = this.props;

    return (
      <div onClick={this.handleClick}>
        {children}
      </div>
    )
  }
}

HoverMenu.propTypes = {
  onClose: PropTypes.func.isRequired
}

export default HoverMenu;
