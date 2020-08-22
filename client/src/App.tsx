import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchUser } from './store/reducer';
import { Layout } from './comonents/Layout/Layout';
import { Switch, Route } from 'react-router-dom';
import { urls } from 'services/urls';
import PrivateRoute from 'comonents/PrivateRoute';
import { SyncRequestForm } from 'scenes/SyncRequestForm/SyncRequestForm';
import { LoginWithGoogle } from 'scenes/Login/components/LoginWithGoogle';

function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchUser());
  }, [dispatch]);

  return <Layout>
      <Switch>
        <Route exact path={urls.login} component={LoginWithGoogle} />
        <PrivateRoute path={urls.home} component={SyncRequestForm} />
      </Switch>
    </Layout>
};

export default App;
