import { handleActions } from 'redux-actions';
import { settingUpdate, settingUpdateAll } from '../actions';

export const initializeState = {
  autoIndent: false,  // 自动缩进
  lineNumbers: true,  // 显示行号
  tabSize: 2,         // tab大小
  fontSize: 14,       // 字体大小
}; // setting key => value

const setting = handleActions(
  {
    [settingUpdate]: (state, { payload: { key, value } }) => {
      return { ...state, [key]: value };
    },
    [settingUpdateAll]: (state, { payload }) => {
      return { ...payload };
    }
  },
  initializeState
)

export default setting;
