import mongoose from 'mongoose';
import user from './user';
import setting from './setting';
import sandbox from './sandbox';

const userSchema = new mongoose.Schema(user);
const User = mongoose.model('User', userSchema);

const settingSchema = new mongoose.Schema(setting);
const Setting = mongoose.model('Setting', settingSchema);

const sandboxSchema = new mongoose.Schema(sandbox);
const Sandbox = mongoose.model('Sandbox', sandboxSchema);

export default {
  User,
  Setting,
  Sandbox,
};