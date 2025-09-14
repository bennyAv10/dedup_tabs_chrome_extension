// This script runs in the background and contains the core logic.

// Helper function to find and close duplicate tabs in a window
function closeDuplicateTabsInWindow(windowId, keepTabId, callback) {
  chrome.tabs.query({windowId: windowId}, (tabs) => {
    const urlToTabIds = new Map();
    tabs.forEach(tab => {
      if (!tab.url) return;
      const url_str = tab.url.split('#')[0];
      if (!urlToTabIds.has(url_str)) urlToTabIds.set(url_str, []);
      urlToTabIds.get(url_str).push(tab.id);
    });

    let tabsToClose = [];
    let duplicatesClosed = 0;
    urlToTabIds.forEach(tabIds => {
      if (tabIds.length > 1 && tabIds.includes(keepTabId)) {
        // Keep the triggering tab, close all others
        tabsToClose.push(...tabIds.filter(id => id !== keepTabId));
        duplicatesClosed += tabIds.length - 1;
      }
    });

    if (tabsToClose.length > 0) {
      chrome.tabs.remove(tabsToClose, () => {
        if (callback) callback({ status: "success", count: duplicatesClosed });
      });
    } else {
      if (callback) callback({ status: "no_duplicates", count: 0 });
    }
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "closeDuplicateTabs") {
    chrome.tabs.query({currentWindow: true}, (tabs) => {
      if (tabs.length === 0) {
        sendResponse({ status: "no_duplicates", count: 0 });
        return;
      }
      // For manual close, keep the oldest tab for each URL and close all others
      const urlToTabIds = new Map();
      tabs.forEach(tab => {
        if (!tab.url) return;
        const url_str = tab.url.split('#')[0];
        if (!urlToTabIds.has(url_str)) urlToTabIds.set(url_str, []);
        urlToTabIds.get(url_str).push(tab.id);
      });

      let tabsToClose = [];
      let duplicatesClosed = 0;
      urlToTabIds.forEach(tabIds => {
        if (tabIds.length > 1) {
          // Keep the newest tab (highest tab id), close the rest
          tabIds.sort((a, b) => b - a);
          tabsToClose.push(...tabIds.slice(1));
          duplicatesClosed += tabIds.length - 1;
        }
      });

      if (tabsToClose.length > 0) {
        chrome.tabs.remove(tabsToClose, () => {
          sendResponse({ status: "success", count: duplicatesClosed });
        });
      } else {
        sendResponse({ status: "no_duplicates", count: 0 });
      }
    });
    // Return true to indicate that the response is sent asynchronously.
    return true;
  }
});
// Auto close logic: Listen for new tab creation
chrome.tabs.onCreated.addListener(function(newTab) {
  chrome.storage.sync.get({ autoClose: false }, function(items) {
    if (!items.autoClose) return;
  // Use the helper to close duplicates, keeping the new tab
  closeDuplicateTabsInWindow(newTab.windowId, newTab.id);
  });
});

// Also handle when a tab's URL is updated (e.g., user enters a URL in an existing tab)
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.url) {
    chrome.storage.sync.get({ autoClose: false }, function(items) {
      if (!items.autoClose) return;
  // Use the helper to close duplicates, keeping the updated tab
  closeDuplicateTabsInWindow(tab.windowId, tabId);
    });
  }
});
