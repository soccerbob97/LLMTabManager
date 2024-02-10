import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      change
      <button className="btn btn-primary" onClick={() => {console.log('posting...'); window.parent.postMessage('Hello World', '*'); console.log('posted.')}}>Click Me</button>
    </div>
  );
}

export default App;
