// UI Controls

function loadDarkMode() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : '');
    document.getElementById('dark-mode-toggle').checked = isDarkMode;
}

function saveDarkMode(isDarkMode) {
    localStorage.setItem('darkMode', isDarkMode);
}

let minimapDragState = {
    isDragging: false,
    dragOffset: { x: 0, y: 0 },
    position: { x: 20, y: 20 }
};

function loadMinimapPosition() {
    const savedPosition = localStorage.getItem('minimapPosition');
    if (savedPosition) {
        minimapDragState.position = JSON.parse(savedPosition);
    }
}

function saveMinimapPosition() {
    localStorage.setItem('minimapPosition', JSON.stringify(minimapDragState.position));
}

function updateMinimapPosition(minimap) {
    minimap.style.transform = `translate(${minimapDragState.position.x - 20}px, ${minimapDragState.position.y - 20}px)`;
}

function constrainMinimapPosition(minimap) {
    const rect = minimap.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    minimapDragState.position.x = Math.max(0, Math.min(viewportWidth - rect.width, minimapDragState.position.x));
    minimapDragState.position.y = Math.max(0, Math.min(viewportHeight - rect.height, minimapDragState.position.y));
}

function initMinimapDrag() {
    const minimap = document.getElementById('minimap');
    if (!minimap) return;
    
    loadMinimapPosition();
    updateMinimapPosition(minimap);
    
    minimap.style.cursor = 'move';
    
    minimap.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        minimapDragState.isDragging = true;
        const rect = minimap.getBoundingClientRect();
        minimapDragState.dragOffset.x = e.clientX - rect.left;
        minimapDragState.dragOffset.y = e.clientY - rect.top;
        
        minimap.style.cursor = 'grabbing';
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!minimapDragState.isDragging) return;
        
        e.preventDefault();
        
        minimapDragState.position.x = e.clientX - minimapDragState.dragOffset.x;
        minimapDragState.position.y = e.clientY - minimapDragState.dragOffset.y;
        
        constrainMinimapPosition(minimap);
        updateMinimapPosition(minimap);
    });
    
    document.addEventListener('mouseup', () => {
        if (minimapDragState.isDragging) {
            minimapDragState.isDragging = false;
            minimap.style.cursor = 'move';
            saveMinimapPosition();
        }
    });
    
    window.addEventListener('resize', () => {
        constrainMinimapPosition(minimap);
        updateMinimapPosition(minimap);
        saveMinimapPosition();
    });
}

export function initUI() {
    const settingsIcon = document.getElementById('settings-icon');
    const settingsPanel = document.getElementById('settings-panel');
    const darkModeToggle = document.getElementById('dark-mode-toggle');

    // Load dark mode preference
    loadDarkMode();

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

    initMinimapDrag();
}
