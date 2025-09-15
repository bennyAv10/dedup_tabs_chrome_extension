// This script runs in the background and contains the core logic.

// Unified function to close duplicate tabs
// scope: "current" for current window, "all" for all windows
function closeDuplicateTabs({scope = "current", windowId = null, keepTabId = null, callback = null, preferWindowId = null} = {}) {
  const query = scope === "current" ? {windowId: windowId} : {};
  chrome.tabs.query(query, (tabs) => {
    const urlToTabObjs = new Map();
    tabs.forEach(tab => {
      if (!tab.url) return;
      const url_str = tab.url.split('#')[0];
      if (!urlToTabObjs.has(url_str)) urlToTabObjs.set(url_str, []);
      urlToTabObjs.get(url_str).push(tab);
    });

    let tabsToClose = [];
    let duplicatesClosed = 0;
    urlToTabObjs.forEach(tabObjs => {
      if (tabObjs.length > 1) {
        let tabToKeep;
        if (scope === "current" && keepTabId !== null) {
          // Keep the triggering tab, close all others
          if (tabObjs.some(t => t.id === keepTabId)) {
            tabToKeep = keepTabId;
          }
        } else if (scope === "all" && preferWindowId !== null) {
          // Prefer to keep tab in preferWindowId if present
          const tabInPreferredWindow = tabObjs.find(t => t.windowId === preferWindowId);
          if (tabInPreferredWindow) {
            tabToKeep = tabInPreferredWindow.id;
          } else {
            tabObjs.sort((a, b) => b.id - a.id);
            tabToKeep = tabObjs[0].id;
          }
        } else {
          // Default: keep the newest tab (highest tab id)
          tabObjs.sort((a, b) => b.id - a.id);
          tabToKeep = tabObjs[0].id;
        }
        tabsToClose.push(...tabObjs.filter(t => t.id !== tabToKeep).map(t => t.id));
        duplicatesClosed += tabObjs.length - 1;
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
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs.length > 0) {
        const winId = tabs[0].windowId;
        closeDuplicateTabs({scope: "current", windowId: winId, callback: sendResponse});
      } else {
        sendResponse({ status: "no_duplicates", count: 0 });
      }
    });
    return true;
  }
  if (request.action === "closeDuplicateTabsAcrossWindows") {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      const currentWindowId = tabs.length > 0 ? tabs[0].windowId : null;
      closeDuplicateTabs({scope: "all", preferWindowId: currentWindowId, callback: sendResponse});
    });
    return true;
  }
});
// Auto close logic: Listen for new tab creation
chrome.tabs.onCreated.addListener(function(newTab) {
  chrome.storage.sync.get({ autoClose: false }, function(items) {
    console.log(newTab.windowId)
    if (!items.autoClose) return;
    closeDuplicateTabs({scope: "current", windowId: newTab.windowId, keepTabId: newTab.id});
  });
});

// Also handle when a tab's URL is updated (e.g., user enters a URL in an existing tab)
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.url) {
    chrome.storage.sync.get({ autoClose: false }, function(items) {
      if (!items.autoClose) return;
      closeDuplicateTabs({scope: "current", windowId: tab.windowId, keepTabId: tabId});
    });
  }
});
