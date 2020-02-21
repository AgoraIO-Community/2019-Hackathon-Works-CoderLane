import { combineReducers } from "redux";
import app from './app';
import user from './user';
import setting from './setting';
import sandbox from './sandbox';

export default combineReducers({
  app,
  user,
  setting,
  sandbox,
});
