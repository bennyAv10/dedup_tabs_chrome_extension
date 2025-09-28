function getBadgeClass(count) {
    if (count >= 5) return '';
    if (count >= 3) return 'medium';
    return 'low';
}

function formatUrl(url) {
    try {
        const urlObj = new URL(url);
        let display = urlObj.hostname;
        if (urlObj.pathname !== '/') {
            display += urlObj.pathname;
        }
        if (display.length > 45) {
            display = display.substring(0, 42) + '...';
        }
        return display;
    } catch {
        return url.length > 45 ? url.substring(0, 42) + '...' : url;
    }
}

function loadDuplicateStats() {
    chrome.runtime.sendMessage({ action: "getDuplicateStats" }, (response) => {
        if (chrome.runtime.lastError) {
            console.error('Error:', chrome.runtime.lastError.message);
            return;
        }

        const tableBody = document.getElementById('statsTableBody');
        const totalUrls = document.getElementById('totalUrls');
        const currentWindowDupes = document.getElementById('currentWindowDupes');
        const allWindowsDupes = document.getElementById('allWindowsDupes');

        if (!response || !response.stats || response.stats.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="3" class="no-duplicates">No duplicate tabs found! 🎉</td></tr>';
            totalUrls.textContent = '0';
            currentWindowDupes.textContent = '0';
            allWindowsDupes.textContent = '0';
            return;
        }

        // Update summary
        totalUrls.textContent = response.stats.length;
        currentWindowDupes.textContent = response.summary.currentWindowTotal;
        allWindowsDupes.textContent = response.summary.allWindowsTotal;

        // Update table
        tableBody.innerHTML = response.stats.map(stat => `
            <tr>
                <td class="url-cell" title="${stat.url}">${formatUrl(stat.url)}</td>
                <td>
                    ${stat.currentWindow > 1 ? 
                        `<span class="count-badge ${getBadgeClass(stat.currentWindow)}">${stat.currentWindow}</span>` : 
                        '1'
                    }
                </td>
                <td>
                    ${stat.allWindows > 1 ? 
                        `<span class="count-badge ${getBadgeClass(stat.allWindows)}">${stat.allWindows}</span>` : 
                        '1'
                    }
                </td>
            </tr>
        `).join('');
    });
}

// Set up event listeners when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Load stats initially
    loadDuplicateStats();
    
    // Set up refresh button
    document.getElementById('refreshBtn').addEventListener('click', loadDuplicateStats);
    
    // Set up close button
    document.getElementById('closeBtn').addEventListener('click', () => {
        window.close();
    });
});