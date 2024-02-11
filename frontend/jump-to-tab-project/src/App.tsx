import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  const [url, setUrlValue] = useState('');
  const changeTab = () => {
    // Example: Fetching all tabs
    chrome.tabs.query({}, (tabs) => {
      console.log(tabs); // Do something with the tabs
    });
    const page_number = 2
    console.log("hello")
    if (url.includes(".pdf")) {
      setUrlValue(`${url}#page=${page_number}`);
      console.log("new pdf url", url)
    }
    if (url) {
      chrome.tabs.query({}, function(tabs) {
        console.log("url ", url)
        const tab = tabs.find(tab => tab.url && tab.url.includes(url));
        console.log("tab ", tab)
        if (tab && tab.id != undefined) {
          chrome.tabs.update(tab.id, {active: true});
          chrome.windows.update(tab.windowId, {focused: true});
        } else {
          alert("No tab with the specified URL is open.");
        }
      });
    }
  }
  return (
    <div className="App">
      <input className='input' type="text" value={url} onChange={(e) => setUrlValue(e.target.value)} />
      <button onClick={changeTab}>Default</button>

    </div>

  );
}

export default App;
