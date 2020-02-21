import axios from 'axios';
import { debug, updateSettig } from 'app/utils';
import { settingUpdate } from '../actions';

const saveConfig = store => next => action => {
  next(action);
  const { setting, user } = store.getState();
  const isUpdate = action.type === settingUpdate().type;
  if (isUpdate && user) {
    axios.post('/api/setting', setting).then(result => {
      debug('/api/setting success > ', result);
    }).catch(error => {
      debug('/api/setting error > ', error);
    });
  }
  if (isUpdate && window.__monaco__) {
    const { payload: { key, value } } = action;
    if (!key) return;
    updateSettig({ [key]: value });
  }
}

export default saveConfig;
