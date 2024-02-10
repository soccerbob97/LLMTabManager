// // chrome.browserAction.onClicked.addListener((tab) => {
// //     chrome.tabs.executeScript({
// //       target: {tabId: tab.id},
// //       files: ['content.js']
// //     });
// //   });


// chrome.browserAction.onClicked.addListener(function(activeTab) {
//     chrome.tabs.executeScript(null, {file: "content.js"});
// });



chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"]
    });
  });



  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "openOrFocus") {
        const url = request.url;
        chrome.tabs.query({}, function(tabs) {
            const tab = tabs.find(tab => tab.url && new URL(tab.url).hostname === new URL(url).hostname && new URL(tab.url).pathname === new URL(url).pathname);
            if (tab) {
                chrome.tabs.update(tab.id, {active: true});
                chrome.windows.update(tab.windowId, {focused: true});
                sendResponse({result: "Tab focused"});
            } else {
                chrome.tabs.create({url: url});
                sendResponse({result: "New tab opened"});
            }
        });
        return true; // indicates you wish to send a response asynchronously
    }
});