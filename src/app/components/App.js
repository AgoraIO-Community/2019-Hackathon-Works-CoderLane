import React from "react";
import { connect } from "react-redux";
import { Route, Redirect, Switch, withRouter } from "react-router-dom";
import { Context, paths } from '../configs/constants';
import Home from './Home/Home';
import './App.scss';

const App = (props) => {
  const { app, user, setting, dispatch } = props;
  
  return (
    <Context.Provider value={{...app, user, setting, dispatch}}>
      <Switch>
        <Route exact path={paths.SANDBOX} component={Home} />
        <Redirect to="/" />
      </Switch>
    </Context.Provider>
  );
}

function mapStateToProps(state) {
  const { app, user, setting } = state;

  return {
    app,
    user,
    setting,
  };
}
export default withRouter(connect(mapStateToProps)(App));