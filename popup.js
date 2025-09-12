document.addEventListener('DOMContentLoaded', () => {
    const closeTabsBtn = document.getElementById('closeTabsBtn');
    const statusMessage = document.getElementById('statusMessage');

    closeTabsBtn.addEventListener('click', () => {
        statusMessage.textContent = 'Searching for duplicate tabs...';
        closeTabsBtn.disabled = true;

        // Send a message to the background script to start the process
        chrome.runtime.sendMessage({ action: "closeDuplicateTabs" }, (response) => {
            if (chrome.runtime.lastError) {
                // Handle errors
                statusMessage.textContent = 'Error: ' + chrome.runtime.lastError.message;
            } else if (response) {
                if (response.status === "success") {
                    if (response.count > 0) {
                       statusMessage.textContent = `Success! Closed ${response.count} duplicate tab(s).`;
                    }
                } else if (response.status === "no_duplicates") {
                    statusMessage.textContent = 'No duplicate tabs found.';
                }
            }
            closeTabsBtn.disabled = false;
        });
    });
});
