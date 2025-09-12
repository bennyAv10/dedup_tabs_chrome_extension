// This script runs in the background and contains the core logic.

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "closeDuplicateTabs") {
    chrome.tabs.query({}, (tabs) => {
      const urls = new Map();
      let duplicatesClosed = 0;
      let tabsToClose = [];

      tabs.forEach((tab) => {
        if (urls.has(tab.url)) {
          // If the URL is already in our map, it's a duplicate.
          // We keep the first tab we found (the one in the map) and close this one.
          tabsToClose.push(tab.id);
          duplicatesClosed++;
        } else {
          // It's the first time we see this URL, so we add it to our map.
          urls.set(tab.url, tab.id);
        }
      });

      if (tabsToClose.length > 0) {
        chrome.tabs.remove(tabsToClose, () => {
          sendResponse({
            status: "success",
            count: duplicatesClosed
          });
        });
      } else {
        sendResponse({
          status: "no_duplicates",
          count: 0
        });
      }
    });
    // Return true to indicate that the response is sent asynchronously.
    return true;
  }
});
