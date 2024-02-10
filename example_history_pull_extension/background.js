chrome.tabs.onCreated.addListener(tab => {
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

