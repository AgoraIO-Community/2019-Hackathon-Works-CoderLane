import passport from 'passport';
import _ from 'lodash';
import { Strategy } from 'passport-github';
import { debug } from 'app/utils';
import Model from './models';

const configurePassport = () => {
  passport.serializeUser(function(user, done) {
    done(null, user);
  });
  passport.deserializeUser(function(obj, done) {
    done(null, obj);
  });

  passport.use(new Strategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: `${process.env.ROOT_URL}/auth/github/callback`
  }, async (accessToken, refreshToken, profile, cb) => {
    try {
      const user = await Model.User.findOne({ id: profile.id });
      if (user) {
        cb(null, user);
      } else {
        const newUser = {
          id: profile.id,
          displayName: profile.displayName,
          username: profile.username,
          url: _.get(profile, '_json.html_url'),
          emial: _.get(profile, '_json.email'),
          avatar: _.get(profile, '_json.avatar_url'),
          bio: _.get(profile, '_json.bio')
        };
        await Model.User.create(newUser);
        cb(null, newUser);
      }
    } catch(e) {
      debug(`${process.env.ROOT_URL}/auth/github/callback error > ${e}`);
      cb(e);
    };
  }));
}

export default configurePassport;
