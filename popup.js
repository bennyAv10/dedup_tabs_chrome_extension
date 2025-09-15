document.addEventListener('DOMContentLoaded', () => {
    const dedupCurrentBtn = document.getElementById('dedupCurrent');
    const dedupAllBtn = document.getElementById('dedupAll');
    const resultDiv = document.getElementById('result');

    dedupCurrentBtn.addEventListener('click', () => {
        resultDiv.textContent = 'Searching for duplicate tabs in current window...';
        dedupCurrentBtn.disabled = true;
        dedupAllBtn.disabled = true;
        chrome.runtime.sendMessage({ action: "closeDuplicateTabs" }, (response) => {
            if (chrome.runtime.lastError) {
                resultDiv.textContent = 'Error: ' + chrome.runtime.lastError.message;
            } else if (response) {
                if (response.status === "success") {
                    if (response.count > 0) {
                        resultDiv.textContent = `Success! Closed ${response.count} duplicate tab(s) in current window.`;
                    } else {
                        resultDiv.textContent = 'No duplicate tabs found in current window.';
                    }
                } else if (response.status === "no_duplicates") {
                    resultDiv.textContent = 'No duplicate tabs found in current window.';
                }
            }
            dedupCurrentBtn.disabled = false;
            dedupAllBtn.disabled = false;
        });
    });

    dedupAllBtn.addEventListener('click', () => {
        resultDiv.textContent = 'Searching for duplicate tabs in all windows...';
        dedupCurrentBtn.disabled = true;
        dedupAllBtn.disabled = true;
        chrome.runtime.sendMessage({ action: "closeDuplicateTabsAcrossWindows" }, (response) => {
            if (chrome.runtime.lastError) {
                resultDiv.textContent = 'Error: ' + chrome.runtime.lastError.message;
            } else if (response) {
                if (response.status === "success") {
                    if (response.count > 0) {
                        resultDiv.textContent = `Success! Closed ${response.count} duplicate tab(s) across all windows.`;
                    } else {
                        resultDiv.textContent = 'No duplicate tabs found across all windows.';
                    }
                } else if (response.status === "no_duplicates") {
                    resultDiv.textContent = 'No duplicate tabs found across all windows.';
                }
            }
            dedupCurrentBtn.disabled = false;
            dedupAllBtn.disabled = false;
        });
    });
});
