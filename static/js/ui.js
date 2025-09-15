// UI Controls
import { minimapDrag } from './gameState.js';

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
        const { x, y } = JSON.parse(savedPosition);
        const minimap = document.getElementById('minimap');
        minimap.style.left = `${x}px`;
        minimap.style.top = `${y}px`;
    }
}

function saveMinimapPosition(x, y) {
    localStorage.setItem('minimapPosition', JSON.stringify({ x, y }));
}

function setupMinimapDrag() {
    const minimap = document.getElementById('minimap');
    
    minimap.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        minimapDrag.isDragging = true;
        const rect = minimap.getBoundingClientRect();
        minimapDrag.startX = e.clientX - rect.left;
        minimapDrag.startY = e.clientY - rect.top;
        
        minimap.style.cursor = 'grabbing';
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!minimapDrag.isDragging) return;
        
        e.preventDefault();
        
        const newX = e.clientX - minimapDrag.startX;
        const newY = e.clientY - minimapDrag.startY;
        
        const maxX = window.innerWidth - minimap.offsetWidth;
        const maxY = window.innerHeight - minimap.offsetHeight;
        
        const constrainedX = Math.max(0, Math.min(newX, maxX));
        const constrainedY = Math.max(0, Math.min(newY, maxY));
        
        minimap.style.left = `${constrainedX}px`;
        minimap.style.top = `${constrainedY}px`;
    });
    
    document.addEventListener('mouseup', () => {
        if (minimapDrag.isDragging) {
            minimapDrag.isDragging = false;
            minimap.style.cursor = 'grab';
            
            const rect = minimap.getBoundingClientRect();
            saveMinimapPosition(rect.left, rect.top);
        }
    });
    
    minimap.style.cursor = 'grab';
}

export function initUI() {
    const settingsIcon = document.getElementById('settings-icon');
    const settingsPanel = document.getElementById('settings-panel');
    const darkModeToggle = document.getElementById('dark-mode-toggle');

    loadDarkMode();
    loadMinimapPosition();

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

    setupMinimapDrag();
}
