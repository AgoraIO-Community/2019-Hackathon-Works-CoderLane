import { createAction } from 'redux-actions';
import axios from 'axios';

export const userMenuOpen = createAction('USER_MENU_OPEN'); // 切换用户菜单
export const snippetOpen = createAction('SNIPPET_OPEN');    // 切换语言选择窗口
export const sandboxOpen = createAction('SANDBOX_OPEN');
export const socketConnect = createAction('SOCKET_CONNECT'); // socket连接状态 true在线, false离线
export const updateApp = createAction('UPDATE_APP');  // 更新app某一个值
export const updateToken = createAction('UPDATE_TOKEN'); // 更新视频token

export const settingUpdate = createAction('SETTING_UPDATE');  // 更新单个配置
export const settingUpdateAll = createAction('SETTING_UPDATE_ALL'); // 更新整个配置, 用于ssr

export const updateLang = createAction('UPDATE_LANG');        // 更新当前语言
export const runStatus = createAction('RUN_STATUS');          // 更新运行状态
export const updateSandbox = createAction('UPDATE_SANDBOX');  // 更新sandbox某一个值 {key:value}
export const updateSandboxAll = createAction('UPDATE_SANDBOX_ALL');   // 一次更新所有redux

export const openLive = createAction('OPEN_LIVE');  // 开始live

export const createSandboxAction = params => {
  return dispatch => {
    axios.post('/api/sandbox', params).then(({ data }) => {
      if (!params._id && !data.code) {
        window.location.href = `/sandbox/${data._id}`;
      }
    }).catch(e => {
      console.log('e > ', e);
    })
  }
}

export const getToken = params => {
  return dispatch => {
    axios.post('/api/token', params).then(({ data }) => {
      dispatch(updateToken(data.token));
    }).catch(e => {
      console.log('e > ', e);
    })
  }
}