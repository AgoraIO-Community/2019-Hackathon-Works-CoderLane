import React, { useContext } from 'react';
import { If } from 'react-statements';
import * as actions from 'app/actions';
import { Context } from '../../configs/constants';
import HoverMenu from '../HoverMenu';
import Menu from './Menu';

function UserMenu(props) {
  const { userMenuOpen, user: { avatar }, dispatch } = useContext(Context);
  const handleUserMenuOpened = () => dispatch(actions.userMenuOpen(true));
  const handleMenuClose = () => dispatch(actions.userMenuOpen(false));

  return (
    <div className="usermenu position-relative">
      <div onClick={handleUserMenuOpened}>
        <img src={avatar} width="32" height="32" />
      </div>
      <If when={userMenuOpen}>
        <HoverMenu
          onClose={handleMenuClose}
        >
          <Menu sandboxAction={props.sandboxAction} />
        </HoverMenu>
      </If>
    </div>
  )
}

export default UserMenu;
