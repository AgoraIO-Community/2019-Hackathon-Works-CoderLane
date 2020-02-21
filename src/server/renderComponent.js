import { readFileSync } from 'fs';
import React from 'react';
import { createStore } from "redux";
import { Provider } from "react-redux";
import { StaticRouter } from "react-router";
import { renderToString } from "react-dom/server";
import { settingUpdateAll } from 'app/actions';
import rootReducer from "app/reducers";
import App from "app/components/App";

const manifest = JSON.parse(readFileSync(`./dist/public/manifest.json`, "utf8"));
const css = readFileSync("./dist/public/main.css", "utf8");

const renderComponent = (req, res) => {
  const context = {};
  const store = createStore(rootReducer, req.initialState);
  // 用户登录则从数据库拿配置
  if(req.initialSetting) {
    store.dispatch(settingUpdateAll(req.initialSetting));
  }
  const appString = renderToString(
    <Provider store={store}>
      <StaticRouter location={req.url} context={context}>
        <App />
      </StaticRouter>
    </Provider>
  );
  const preloadedState = store.getState();
  const html = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="ie=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
      <style>${css}</style>
      
      <script src="${process.env.ROOT_URL}/static/agora/AgoraRTCSDK-2.8.0.js"></script>
      <script src="${process.env.ROOT_URL}/static/vscode-editor/min/vs/loader.js"></script>
      <script>
        require.config({ paths: { 'vs': '/static/vscode-editor/min/vs' }});
        require(['vs/editor/editor.main'], function() {
          window.monacoLoaded = true;
        });
      </script>
    </head>
    <body>
      <div id="app">${appString}</div>
    </body>
    <script>
      window.PRELOADED_STATE = ${JSON.stringify(preloadedState)}
    </script>
    <script src=${manifest["main.js"]}></script>
  </html>
  `
  res.send(html);
}

export default renderComponent;