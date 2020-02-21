import { handleActions } from 'redux-actions';
import { defaultLang } from '../configs/constants';
import { updateLang, runStatus, updateSandbox, updateSandboxAll } from '../actions';

export const initializeState = {
  lang: defaultLang,      // 默认 node
  runStatus: false,       // 运行状态
  name: '',               // 保存的名称
  events: [],             // 编辑事件, 未保存时使用
};

const sandbox = handleActions(
  {
    [updateLang]: (state, { payload }) => {
      return { ...state, lang: payload };
    },
    [runStatus]: (state, { payload }) => ({...state, runStatus: payload }),
    [updateSandbox]: (state, { payload: { key, value } }) => ({...state, [key]: value }),
    [updateSandboxAll]: (state, { payload }) => (payload)
  },
  initializeState
)

export default sandbox;
