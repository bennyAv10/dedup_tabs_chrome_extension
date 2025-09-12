// Saves options to chrome.storage
function saveOptions(e) {
    e.preventDefault();
    chrome.storage.sync.set({
        autoClose: document.getElementById('autoClose').checked,
        notifyUser: document.getElementById('notifyUser').checked
    }, function() {
        document.getElementById('status').textContent = 'Options saved.';
        setTimeout(() => {
            document.getElementById('status').textContent = '';
        }, 1500);
    });
}

// Restores checkbox state using values from chrome.storage
function restoreOptions() {
    chrome.storage.sync.get({
        autoClose: false,
        notifyUser: true
    }, function(items) {
        document.getElementById('autoClose').checked = items.autoClose;
        document.getElementById('notifyUser').checked = items.notifyUser;
    });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('options-form').addEventListener('submit', saveOptions);
