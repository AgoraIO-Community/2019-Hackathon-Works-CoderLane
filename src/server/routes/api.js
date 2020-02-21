import { Router } from "express";
import { ensureLoggedIn } from 'connect-ensure-login';
import _ from 'lodash';
import { AccessToken } from 'agora-access-token';
import { debug } from 'app/utils';
import Model from '../models';

const router = Router();
const { Token, Priviledges } = AccessToken;
const expireTimestamp = 0;

router.post('/token', (req, res) => {
  let token;
  const { uid, channel } = req.body;
  if (!uid || !channel) return res.send({ token: '' });
  const key = new Token(process.env.AGORA_APP_ID, process.env.AGORA_APP_CERTIFICATE, channel, uid);

  key.addPriviledge(Priviledges.kJoinChannel, expireTimestamp);
  token = key.build();
  res.send({ token });
});

router.post(
  '/setting',
  ensureLoggedIn('/'),
  async (req, res) => {
    try {
      const setting = await Model.Setting.findOne({ id: req.user.id });
      
      if (!setting) {
        await Model.Setting.create({
          id: req.user.id,
          value: req.body
        });
      } else {
        await Model.Setting.update({ id: req.user.id }, { value: req.body });
      }
      res.send({ code: 1, setting: req.body });
    } catch (err) {
      debug('api/setting err > ', err);
      res.send({ code: -1, err });
    }
  }
);

router.post('/sandbox', ensureLoggedIn('/'), async (req, res) => {
  let { _id, lang, name } = req.body;
  let sandbox = null;
  
  if (!_.get(req, 'user.id')) {
    return res.send({ code: -1, msg: '请先登录后再试!' });
  }
  if (!_id) {
    sandbox = await Model.Sandbox.create({
      lang,
      name,
      id: req.user.id
    });
  } else {
    await Model.Sandbox.update({ _id }, { name });
  }
  res.send(sandbox);
});

export default router;