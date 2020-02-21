import { handleActions } from 'redux-actions';
import { userMenuOpen, socketConnect, snippetOpen, sandboxOpen, updateApp, openLive, updateToken } from '../actions';

const initializeState = {
  userMenuOpen: false,    // 用户菜单是否打开
  snippetOpen: false,     // 新建片段
  sandboxOpen: false,     // sandboxes窗口
  socketConnect: false,   // socket是否在线
  monaco: null,           // monaco ins
  sandboxes: [],
  token: '',
}

const app = handleActions(
  {
    [userMenuOpen]: (state, { payload }) => ({ ...state, userMenuOpen: payload }),
    [socketConnect]: (state, { payload }) => ({ ...state, socketConnect: payload }),
    [snippetOpen]: (state, { payload }) => ({ ...state, snippetOpen: payload }),
    [sandboxOpen]: (state, { payload }) => ({ ...state, sandboxOpen: payload }),
    [updateApp]: (state, { payload: { key, value } }) => ({...state, [key]: value }),
    [updateToken]: (state, { payload }) => ({ ...state, token: payload }),
  },
  initializeState
)

export default app;
