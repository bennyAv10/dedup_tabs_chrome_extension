# Duplicate Tab Closer Chrome Extension

This Chrome extension helps you declutter your browser by finding and closing duplicate tabs.

---

## How it Works

The extension scans all open tabs, identifies those with identical URLs, and closes all but the first tab it finds for each unique URL.

---

## How to configure and use the extension

### Configuration
Open the extension options page from manage Extensions page
From the extension tile, choose details, then open Extension Options
 * You can disable tabs auto close. In which case you'll need to click the extension icon and click Close Duplicate tabs (If you prefer manual mode, I recommend pinning the extension for easy access)
 * Enable duplicate tabs closure across windows. If enabled, duplicate tabs will get closed even if they're on a diffrent window
 * Show Notificatioon
 * Use Query parameters
### Usage
- If auto close is enabled (Default), n further action is needed.
- You'll see the "Duplicate Tab Closer" icon in your Chrome toolbar.
- Click the icon to open the popup.
- Click the **"Close Duplicate Tabs"** button to run the script.

The extension will then display how many duplicate tabs were found and closed.

---

## How to Install the extension from source

### 1. Download Files

Ensure all project files (manifest.json, background.js, popup.html, popup.js, styles.css, and the images folder) are in a single folder on your computer.

### 2. Open Chrome Extensions

Open Google Chrome and go to **chrome://extensions**.

### 3. Enable Developer Mode

In the top right corner, toggle the **"Developer mode"** switch on.

### 4. Load the Extension

Click the **"Load unpacked"** button and select the folder containing the extension files.

