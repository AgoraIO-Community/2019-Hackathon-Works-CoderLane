import React from 'react';
import './style.scss';

const Menu = (props) => {
  return (
    <div className="usermenu__container">
      <div className="usermenu__item" onClick={() => props.sandboxAction(true)}>
        My Sandboxes
      </div>
      {/* <div className="usermenu__item">About</div>
      <hr className="usermenu__separator" />
      <div className="usermenu__item">Sign out</div> */}
    </div>
  )
}

export default Menu;
