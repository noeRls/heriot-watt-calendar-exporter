import React, { useEffect } from 'react';
import { Home } from './scenes/Homepage';
import { useDispatch } from 'react-redux';
import { fetchUser } from './store/reducer';
import { Layout } from './comonents/Layout/Layout';

function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchUser());
  }, [dispatch]);

  return <Layout>
      <Home />
    </Layout>
};

export default App;
