import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { If, Default } from 'react-statements';
import Setting from '../Setting';
import UserMenu from '../UserMenu';
import './style.scss';
import logo from '../images/logo.png';

class Header extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      settingIsOpen: false,
    };
  }
  handleSignin = () => {
    window.location.href = '/auth/github';
  }
  handleSettingOpen = () => {
    this.setState({ settingIsOpen: true });
  }
  handleSettingClose = () => {
    this.setState({ settingIsOpen: false });
  }
  handleRun = () => {
    this.props.onRun();
  }
  handleNew = () => {
    const { onNew } = this.props;
    onNew && onNew(true);
  }
  handleNameChange = (e) => {
    const { updateSandbox } = this.props;
    const name = e.target.value;
    updateSandbox({ key: 'name', value: name });
  }
  handleNameKeyUp = (e) => {
    const value = e.target.value
    if (e.keyCode === 13 && value) {
      this.props.nameChange(e.target.value);
    }
  }
  handleLive = () => {
    this.props.openLive();
  }
  getRunIcon() {
    const { sandbox: { runStatus } } = this.props;

    return runStatus ? <path d="M64 64h384v384h-384z"></path> : <path d="M96 64l320 192-320 192z"></path>
  }
  render() {
    const { settingIsOpen } = this.state;
    const { user, sandbox: { name, _id }, sandboxAction } = this.props;

    return (
      <div className="header">
        <div className="d-flex">
          <div className="header__item header__item--nohover">
            <img src={logo} alt="" width="32" height="32" />
          </div>
          <div className="header__item" onClick={this.handleNew}>
            <i className="icon">
              <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.9 8.6c-.1-.1-.1-.2-.2-.3l-7-7c-.1-.1-.2-.2-.3-.2-.1-.1-.3-.1-.4-.1H6C4.3 1 3 2.3 3 4v16c0 1.7 1.3 3 3 3h12c1.7 0 3-1.3 3-3V9c0-.1 0-.3-.1-.4zM14 4.4L17.6 8H14V4.4zM18 21H6c-.6 0-1-.4-1-1V4c0-.6.4-1 1-1h6v6c0 .6.4 1 1 1h6v10c0 .6-.4 1-1 1z"></path>
              </svg>
            </i>
            <span>New</span>
          </div>
          <If when={_id}>
          <div className="header__item" onClick={this.handleLive}>
            <i className="icon">
              <svg width="1em" height="1em" viewBox="0 0 512 512" fill="currentColor">
                <path d="M384 385.306v-26.39c35.249-19.864 64-69.386 64-118.916 0-79.529 0-144-96-144s-96 64.471-96 144c0 49.53 28.751 99.052 64 118.916v26.39c-108.551 8.874-192 62.21-192 126.694h448c0-64.484-83.449-117.82-192-126.694z"></path>
                <path d="M163.598 397.664c27.655-18.075 62.040-31.818 99.894-40.207-7.527-8.892-14.354-18.811-20.246-29.51-15.207-27.617-23.246-58.029-23.246-87.947 0-43.021 0-83.655 15.3-116.881 14.853-32.252 41.564-52.248 79.611-59.744-8.457-38.24-30.97-63.375-90.911-63.375-96 0-96 64.471-96 144 0 49.53 28.751 99.052 64 118.916v26.39c-108.551 8.874-192 62.21-192 126.694h139.503c7.259-6.455 15.298-12.586 24.095-18.336z"></path>
              </svg>
            </i>
            <span>Live</span>
          </div>
          </If>
          <div className="split" />
          <div className="rename">
            <input
              type="text"
              value={name}
              placeholder="Enter and save"
              onChange={this.handleNameChange}
              onKeyUp={this.handleNameKeyUp}
            />
          </div>
          <div className="split" />
          <div
            className="header__item header__item--hover"
            onClick={this.handleRun}
          >
            <i className="icon">
              <svg width="1em" height="1em" viewBox="0 0 512 512" fill="currentColor">
                {this.getRunIcon()}
              </svg>
            </i>
            <span>Run</span>
          </div>
        </div>
        <Setting isOpen={settingIsOpen} closeModal={this.handleSettingClose} />
        <div className="d-flex">
          <div className="header__item" onClick={this.handleSettingOpen}>
            <i className="icon">
              <svg width="1em" height="1em" viewBox="0 0 512 512" fill="currentColor">
                <path d="M466.895 305.125c-26.863-46.527-10.708-106.152 36.076-133.244l-50.313-87.146c-14.375 8.427-31.088 13.259-48.923 13.259-53.768 0-97.354-43.873-97.354-97.995h-100.629c0.133 16.705-4.037 33.641-12.979 49.126-26.862 46.528-86.578 62.351-133.431 35.379l-50.312 87.146c14.485 8.236 27.025 20.294 35.943 35.739 26.819 46.454 10.756 105.96-35.854 133.112l50.313 87.146c14.325-8.348 30.958-13.127 48.7-13.127 53.598 0 97.072 43.596 97.35 97.479h100.627c-0.043-16.537 4.136-33.285 12.983-48.609 26.818-46.453 86.388-62.297 133.207-35.506l50.313-87.145c-14.39-8.233-26.846-20.249-35.717-35.614zM256 359.666c-57.254 0-103.668-46.412-103.668-103.667 0-57.254 46.413-103.667 103.668-103.667s103.666 46.413 103.666 103.667c-0.001 57.255-46.412 103.667-103.666 103.667z"></path>
              </svg>
            </i>
            <span>Setting</span>
          </div>
          <If when={!!user}>
            <div className="header__item header__item--hover header__item--noactive">
              <UserMenu user={user} sandboxAction={sandboxAction}  />
            </div>
            <Default>
              <div className="header__item" onClick={this.handleSignin}>
                <i className="icon">
                  <svg width="1em" height="1em" viewBox="0 0 512 512" fill="currentColor">
                    <path d="M256.004 6.321c-141.369 0-256.004 114.609-256.004 255.999 0 113.107 73.352 209.066 175.068 242.918 12.793 2.369 17.496-5.555 17.496-12.316 0-6.102-0.24-26.271-0.348-47.662-71.224 15.488-86.252-30.205-86.252-30.205-11.641-29.588-28.424-37.458-28.424-37.458-23.226-15.889 1.755-15.562 1.755-15.562 25.7 1.805 39.238 26.383 39.238 26.383 22.836 39.135 59.888 27.82 74.502 21.279 2.294-16.543 8.926-27.84 16.253-34.232-56.865-6.471-116.638-28.425-116.638-126.516 0-27.949 10.002-50.787 26.38-68.714-2.658-6.45-11.427-32.486 2.476-67.75 0 0 21.503-6.876 70.42 26.245 20.418-5.674 42.318-8.518 64.077-8.617 21.751 0.099 43.668 2.943 64.128 8.617 48.867-33.122 70.328-26.245 70.328-26.245 13.936 35.264 5.175 61.3 2.518 67.75 16.41 17.928 26.347 40.766 26.347 68.714 0 98.327-59.889 119.975-116.895 126.312 9.182 7.945 17.362 23.523 17.362 47.406 0 34.254-0.298 61.822-0.298 70.254 0 6.814 4.611 14.797 17.586 12.283 101.661-33.888 174.921-129.813 174.921-242.884 0-141.39-114.617-255.999-255.996-255.999z"></path>
                  </svg>
                </i>
                <span>Sign in</span>
              </div>
            </Default>
          </If>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
  sandbox: state.sandbox,
});

export default connect(mapStateToProps)(Header);
