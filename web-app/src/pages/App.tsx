import './App.css';

import React from 'react';

import Route from '../route';
import ContextApp from '../store/ContextApp';
import Loading from './loading';

function App() {
  return (
    <div className="App">
      <ContextApp>
        <Route />
        <Loading />
      </ContextApp>
    </div>
  );
}

export default App;
