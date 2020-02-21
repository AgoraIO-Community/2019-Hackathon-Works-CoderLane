import React from "react";
import ReactDOM from "react-dom";
import thunk from 'redux-thunk';
import { createStore, applyMiddleware } from "redux";
import { Provider } from "react-redux";
import { composeWithDevTools } from "redux-devtools-extension";
import { BrowserRouter } from "react-router-dom";
import rootReducer from "./app/reducers";
import App from "./app/components/App";
import saveConfig from "./app/middleware/saveConfig";

const preloadedState = window.PRELOADED_STATE;
delete window.PRELOADED_STATE;

const store = createStore(
  rootReducer,
  preloadedState,
  composeWithDevTools(applyMiddleware(saveConfig, thunk))
);

ReactDOM.hydrate(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>,
  document.getElementById("app")
);