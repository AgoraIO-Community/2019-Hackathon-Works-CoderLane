import express from 'express';
import http from 'http';
import socket from 'socket.io';
import passport from 'passport';
import compression from "compression";
import session from 'express-session';
import mongoose from 'mongoose';
import connectMongo from 'connect-mongo';
import logger from "morgan";
import serveStatic from "express-static-gzip";
import favicon from 'serve-favicon';
import dotenv from 'dotenv';
import 'babel-polyfill';
import sandbox from './sandbox';
import renderComponent from './renderComponent';
import configurePassport from './configurePassport';
import auth from './routes/auth';
import api from './routes/api';
import fetchData from './fetchData';

dotenv.config(); // 加载.env环境变量
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useFindAndModify: false });

const app = express();
const MongoStore = connectMongo(session);
const port = process.env.PORT || '8888';

const server = http.Server(app);
const io = socket(server);
sandbox(io);
configurePassport();

app.use(logger("tiny"));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
// app.use(favicon("dist/public/favicons/favicon.ico"));
app.use("/static", serveStatic("dist/public", { enableBrotli: true, maxAge: "1y" }));
app.use("/static", serveStatic("packages", { enableBrotli: true, maxAge: "1y" }));
app.use('/auth', auth);
app.use('/api', api);
app.use(fetchData);
app.get("*", renderComponent);
// app.listen(port, () => console.log(`Server listening on port ${port}`));
server.listen(port, () => console.log(`Server listening on port ${port}`));
