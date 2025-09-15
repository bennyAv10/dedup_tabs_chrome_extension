document.addEventListener('DOMContentLoaded', () => {
    const closeTabsBtn = document.getElementById('closeTabsBtn');
    const closeTabsAllBtn = document.getElementById('closeTabsAllBtn');
    const statusMessage = document.getElementById('statusMessage');

    closeTabsBtn.addEventListener('click', () => {
        statusMessage.textContent = 'Searching for duplicate tabs in current window...';
        closeTabsBtn.disabled = true;
        closeTabsAllBtn.disabled = true;
        chrome.runtime.sendMessage({ action: "closeDuplicateTabs" }, (response) => {
            if (chrome.runtime.lastError) {
                statusMessage.textContent = 'Error: ' + chrome.runtime.lastError.message;
            } else if (response) {
                if (response.status === "success") {
                    if (response.count > 0) {
                        statusMessage.textContent = `Success! Closed ${response.count} duplicate tab(s) in current window.`;
                    }
                } else if (response.status === "no_duplicates") {
                    statusMessage.textContent = 'No duplicate tabs found in current window.';
                }
            }
            closeTabsBtn.disabled = false;
            closeTabsAllBtn.disabled = false;
        });
    });

    closeTabsAllBtn.addEventListener('click', () => {
        statusMessage.textContent = 'Searching for duplicate tabs in all windows...';
        closeTabsBtn.disabled = true;
        closeTabsAllBtn.disabled = true;
        chrome.runtime.sendMessage({ action: "closeDuplicateTabsAcrossWindows" }, (response) => {
            if (chrome.runtime.lastError) {
                statusMessage.textContent = 'Error: ' + chrome.runtime.lastError.message;
            } else if (response) {
                if (response.status === "success") {
                    if (response.count > 0) {
                        statusMessage.textContent = `Success! Closed ${response.count} duplicate tab(s) across all windows.`;
                    }
                } else if (response.status === "no_duplicates") {
                    statusMessage.textContent = 'No duplicate tabs found across all windows.';
                }
            }
            closeTabsBtn.disabled = false;
            closeTabsAllBtn.disabled = false;
        });
    });
});
