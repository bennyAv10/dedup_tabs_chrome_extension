// Default settings
const DEFAULT_SETTINGS = {
    autoClose: true,
    notifyUser: true,
    keepNewest: false,
    compareFullUrl: false
};

// Load saved settings when the options page loads
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    setupEventListeners();
});

// Load settings from Chrome storage
function loadSettings() {
    chrome.storage.sync.get(DEFAULT_SETTINGS, (items) => {
        // Set checkbox states based on saved settings
        document.getElementById('autoClose').checked = items.autoClose;
        document.getElementById('notifyUser').checked = items.notifyUser;
        document.getElementById('keepNewest').checked = items.keepNewest;
        document.getElementById('compareFullUrl').checked = items.compareFullUrl;
    });
}

// Setup event listeners
function setupEventListeners() {
    // Form submission
    document.getElementById('options-form').addEventListener('submit', saveSettings);
    
    // Reset button
    document.getElementById('reset-btn').addEventListener('click', resetSettings);
    
    // Footer links
    document.getElementById('help-link').addEventListener('click', (e) => {
        e.preventDefault();
        openHelpPage();
    });
    
    document.getElementById('feedback-link').addEventListener('click', (e) => {
        e.preventDefault();
        openFeedbackPage();
    });
    
    document.getElementById('version-link').addEventListener('click', (e) => {
        e.preventDefault();
        showVersionInfo();
    });
    
    // Add change listeners to update UI immediately
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            // Optional: Add visual feedback when toggling
            const optionGroup = checkbox.closest('.option-group');
            optionGroup.style.transform = 'scale(0.98)';
            setTimeout(() => {
                optionGroup.style.transform = '';
            }, 150);
        });
    });
}

// Save settings to Chrome storage
function saveSettings(e) {
    e.preventDefault();
    
    const settings = {
        autoClose: document.getElementById('autoClose').checked,
        notifyUser: document.getElementById('notifyUser').checked,
        keepNewest: document.getElementById('keepNewest').checked,
        compareFullUrl: document.getElementById('compareFullUrl').checked
    };
    
    chrome.storage.sync.set(settings, () => {
        // Show success message
        showStatus('Settings saved successfully!', 'success');
        
        // Send message to background script to update settings
        chrome.runtime.sendMessage({
            action: 'settingsUpdated',
            settings: settings
        });
    });
}

// Reset settings to defaults
function resetSettings() {
    // Confirm before resetting
    if (confirm('Are you sure you want to reset all settings to default?')) {
        // Reset checkboxes to default values
        document.getElementById('autoClose').checked = DEFAULT_SETTINGS.autoClose;
        document.getElementById('notifyUser').checked = DEFAULT_SETTINGS.notifyUser;
        document.getElementById('keepNewest').checked = DEFAULT_SETTINGS.keepNewest;
        document.getElementById('compareFullUrl').checked = DEFAULT_SETTINGS.compareFullUrl;
        
        // Save default settings
        chrome.storage.sync.set(DEFAULT_SETTINGS, () => {
            showStatus('Settings reset to default!', 'success');
            
            // Send message to background script
            chrome.runtime.sendMessage({
                action: 'settingsUpdated',
                settings: DEFAULT_SETTINGS
            });
        });
    }
}

// Show status message
function showStatus(message, type = 'success') {
    const statusElement = document.getElementById('status');
    
    // Set message and style
    statusElement.textContent = message;
    statusElement.className = `status ${type} show`;
    
    // Hide after 3 seconds
    setTimeout(() => {
        statusElement.classList.remove('show');
    }, 3000);
}

// Open help page
function openHelpPage() {
    // You can either open a new tab with help documentation
    // or show a modal with help content
    chrome.tabs.create({
        url: 'https://github.com/yourusername/dedup-tabs/wiki/Help'
    });
}

// Open feedback page
function openFeedbackPage() {
    // Open feedback form or email
    chrome.tabs.create({
        url: 'https://github.com/yourusername/dedup-tabs/issues/new'
    });
}

// Show version information
function showVersionInfo() {
    const manifest = chrome.runtime.getManifest();
    const versionInfo = `
Dedup Tabs Extension
Version: ${manifest.version}
Author: ${manifest.author || 'Your Name'}

Features:
• Automatically detect and close duplicate tabs
• Customizable notification settings
• Advanced URL comparison options
• Lightweight and fast performance

Last Updated: ${new Date().toLocaleDateString()}
    `;
    
    alert(versionInfo);
}

// Listen for keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        document.getElementById('options-form').dispatchEvent(new Event('submit'));
    }
    
    // Ctrl/Cmd + R to reset
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        resetSettings();
    }
});

// Export settings (for debugging or backup)
function exportSettings() {
    chrome.storage.sync.get(null, (items) => {
        const dataStr = JSON.stringify(items, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'dedup-tabs-settings.json';
        link.click();
        
        URL.revokeObjectURL(url);
        showStatus('Settings exported!', 'success');
    });
}

// Import settings (for debugging or restore)
function importSettings(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const settings = JSON.parse(e.target.result);
            chrome.storage.sync.set(settings, () => {
                loadSettings();
                showStatus('Settings imported successfully!', 'success');
            });
        } catch (error) {
            showStatus('Failed to import settings!', 'error');
        }
    };
    reader.readAsText(file);
}

// Optional: Add debug mode for development
if (chrome.runtime.getManifest().version_name === 'dev') {
    console.log('Debug mode enabled');
    
    // Add export/import buttons in debug mode
    const debugContainer = document.createElement('div');
    debugContainer.style.marginTop = '20px';
    debugContainer.innerHTML = `
        <button id="export-btn" class="btn btn-secondary">Export Settings</button>
        <button id="import-btn" class="btn btn-secondary">Import Settings</button>
        <input type="file" id="import-file" accept=".json" style="display: none;">
    `;
    
    document.querySelector('.container').appendChild(debugContainer);
    
    document.getElementById('export-btn').addEventListener('click', exportSettings);
    document.getElementById('import-btn').addEventListener('click', () => {
        document.getElementById('import-file').click();
    });
    document.getElementById('import-file').addEventListener('change', (e) => {
        if (e.target.files[0]) {
            importSettings(e.target.files[0]);
        }
    });
}