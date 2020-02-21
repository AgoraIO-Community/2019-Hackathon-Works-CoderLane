import _ from 'lodash';
import pathToRegexp from 'path-to-regexp';
import { paths } from 'app/configs/constants';
import { initializeState as initSetting } from 'app/reducers/setting';
import Model from './models';

const fetchData = async (req, res, next) => {
  const regexpSandbox = pathToRegexp(paths.SANDBOX);
  const matchSandBox = regexpSandbox.exec(req.url);

  req.initialState = {};
  if (_.get(matchSandBox, '[1]')) {
    const meta = await Model.Sandbox.findOne({ _id: matchSandBox[1]});
    if (meta) req.initialState.sandbox = { ...meta._doc };
  }
  if (req.user) {
    req.initialState.user = req.user;
    const setting = await Model.Setting.findOne({ id: req.user.id })
    const sandboxes = await Model.Sandbox.find({ id: req.user.id })

    req.initialState.app = {
      userMenuOpen: false,
      sandboxes,
    };
    if (!setting) return next();
    // 合并默认值和数据库setting.value的值
    req.initialSetting = _.merge(initSetting, setting.value);
  }
  next();
}

export default fetchData;