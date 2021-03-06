import './App.css';

import Route from '../route';
import ContextApp from '../store/ContextApp';

function App() {
  return (
    <div className="App">
      <ContextApp>
        <Route />
      </ContextApp>
    </div>
  );
}

export default App;
