/*chrome.tabs.onCreated.addListener(tab => {
    console.log('New tab opened:', tab.id);
    chrome.history.search({text: '', maxResults: 100}, function(data) {
      data.forEach(function(page) {
        console.log(`Visited page: ${page.url} - ${page.title} - ${page.visitCount} times`);
        // Here, you can add the code to send this data to your backend
      });
    });
  });

chrome.tabs.onCreated.addListener(tab => {
    chrome.tabs.query({}, function(tabs) {
      tabs.forEach(function(tab) {
        console.log(`Open tab: ${tab.url} - ${tab.title}`);
      });
    });
});

chrome.tabs.onCreated.addListener((tab) => {
    chrome.bookmarks.getTree().then((bookmarks) => {
        logBookmarks(bookmarks);
    });
});

function logBookmarks(bookmarks) {
    bookmarks.forEach((bookmark) => {
        if (bookmark.url) {
        console.log(`Bookmark: ${bookmark.title} - ${bookmark.url}`);
        }
        if (bookmark.children) {
        logBookmarks(bookmark.children);
        }
    });
}
*/
function activateTab(tabId) {
  chrome.tabs.update(tabId, { active: true });
}

console.log("hello from background.js")

// on click activate example.com
chrome.action.onClicked.addListener(tab => {
  let text = "information";
  console.log("Button clicked")

  chrome.scripting.executeScript({
    target: {tabId: tab.id},
    files: ['highlightText.js']
  });

  // chrome.tabs.query({url: "https://example.com/*"}, function(tabs) {
  // if (tabs.length > 0) {
  //   let currentTab = tabs[0]; // Get the ID of the first tab that matches
  //   // this is incorrect if there is already a hash
  //   activateTab(currentTab.id); // Activate the tab
  //   // chrome.tabs.update(currentTab.id, { url: updatedUrl }); // Update the URL
  //   console.log("executing script")
  //   chrome.scripting.executeScript({
  //     target: {tabId: currentTab.id},
  //     files: ['highlightText.js'] // content script
  //   });
  //   console.log("script executed")
  //   }
  // });
});


// listen for messages from the content script
chrome.runtime.onMessage.addListener((message) => {
  console.log('background worker Message received:', message);
  // Here, you can add the code to send this data to your backend
  if (message.type === 'jump') {
    console.log(`new phrase, message ${message.url}`)
    //let query_url = message.url;
    chrome.tabs.query({}, function(tabs) {
      console.log("tabs ", tabs)
      if (tabs.length > 0) {
        let tab = tabs.find(tab => tab.url.includes(message.url));
        if (tab === undefined) {
          // Use chrome.tabs.create() to open a new tab
          chrome.tabs.create({url: message.url.concat("#:~:text=1000")});
        }
        console.log("tab ", tab)
        console.log(`matching tab found: ${tab.id}`)
        activateTab(tab.id); // Activate the tab
      }
    });
  }
});