// UI Controls

let isDragging = false;
let dragOffset = { x: 0, y: 0 };
let minimapElement = null;

function loadDarkMode() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : '');
    document.getElementById('dark-mode-toggle').checked = isDarkMode;
}

function saveDarkMode(isDarkMode) {
    localStorage.setItem('darkMode', isDarkMode);
}

function loadMinimapPosition() {
    const savedPosition = localStorage.getItem('minimapPosition');
    if (savedPosition) {
        const position = JSON.parse(savedPosition);
        if (minimapElement) {
            minimapElement.style.left = position.x + 'px';
            minimapElement.style.top = position.y + 'px';
            minimapElement.style.bottom = 'auto';
        }
    }
}

function saveMinimapPosition(x, y) {
    localStorage.setItem('minimapPosition', JSON.stringify({ x, y }));
}

function setupMinimapDrag() {
    minimapElement = document.getElementById('minimap');
    if (!minimapElement) return;

    minimapElement.addEventListener('mousedown', (e) => {
        e.preventDefault();
        isDragging = true;
        
        const rect = minimapElement.getBoundingClientRect();
        dragOffset.x = e.clientX - rect.left;
        dragOffset.y = e.clientY - rect.top;
        
        minimapElement.style.cursor = 'grabbing';
        document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        e.preventDefault();
        
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        
        const minimapWidth = 150;
        const minimapHeight = 150;
        const maxX = window.innerWidth - minimapWidth;
        const maxY = window.innerHeight - minimapHeight;
        
        const constrainedX = Math.max(0, Math.min(maxX, newX));
        const constrainedY = Math.max(0, Math.min(maxY, newY));
        
        minimapElement.style.left = constrainedX + 'px';
        minimapElement.style.top = constrainedY + 'px';
        minimapElement.style.bottom = 'auto';
        
        saveMinimapPosition(constrainedX, constrainedY);
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            minimapElement.style.cursor = 'grab';
            document.body.style.userSelect = '';
        }
    });

    minimapElement.style.cursor = 'grab';
    loadMinimapPosition();
}

export function initUI() {
    const settingsIcon = document.getElementById('settings-icon');
    const settingsPanel = document.getElementById('settings-panel');
    const darkModeToggle = document.getElementById('dark-mode-toggle');

    // Load dark mode preference
    loadDarkMode();

    setupMinimapDrag();

    // Toggle settings panel
    settingsIcon.addEventListener('click', (e) => {
        e.stopPropagation();  // Prevent click from propagating to document
        settingsPanel.classList.toggle('visible');
    });

    // Close settings when clicking outside
    document.addEventListener('click', (e) => {
        if (!settingsPanel.contains(e.target) && settingsPanel.classList.contains('visible')) {
            settingsPanel.classList.remove('visible');
        }
    });

    // Prevent game controls when interacting with settings
    settingsPanel.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Handle dark mode toggle
    darkModeToggle.addEventListener('change', (e) => {
        const isDarkMode = e.target.checked;
        document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : '');
        saveDarkMode(isDarkMode);
    });
}
