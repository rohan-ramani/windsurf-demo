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
        const { left, bottom } = JSON.parse(savedPosition);
        const minimap = document.getElementById('minimap');
        minimap.style.left = left + 'px';
        minimap.style.bottom = bottom + 'px';
    }
}

function saveMinimapPosition(left, bottom) {
    localStorage.setItem('minimapPosition', JSON.stringify({ left, bottom }));
}

function initMinimapDrag() {
    const minimap = document.getElementById('minimap');
    
    minimap.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        minimapDrag.isDragging = true;
        
        const rect = minimap.getBoundingClientRect();
        minimapDrag.startX = e.clientX;
        minimapDrag.startY = e.clientY;
        minimapDrag.offsetX = e.clientX - rect.left;
        minimapDrag.offsetY = e.clientY - rect.top;
        
        minimap.style.cursor = 'grabbing';
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!minimapDrag.isDragging) return;
        
        e.preventDefault();
        
        const newLeft = e.clientX - minimapDrag.offsetX;
        const newBottom = window.innerHeight - (e.clientY - minimapDrag.offsetY) - minimap.offsetHeight;
        
        const boundedLeft = Math.max(0, Math.min(window.innerWidth - minimap.offsetWidth, newLeft));
        const boundedBottom = Math.max(0, Math.min(window.innerHeight - minimap.offsetHeight, newBottom));
        
        minimap.style.left = boundedLeft + 'px';
        minimap.style.bottom = boundedBottom + 'px';
    });
    
    document.addEventListener('mouseup', () => {
        if (minimapDrag.isDragging) {
            minimapDrag.isDragging = false;
            minimap.style.cursor = 'grab';
            
            const left = parseInt(minimap.style.left);
            const bottom = parseInt(minimap.style.bottom);
            saveMinimapPosition(left, bottom);
        }
    });
    
    minimap.style.cursor = 'grab';
}

export function initUI() {
    const settingsIcon = document.getElementById('settings-icon');
    const settingsPanel = document.getElementById('settings-panel');
    const darkModeToggle = document.getElementById('dark-mode-toggle');

    // Load dark mode preference
    loadDarkMode();
    
    // Load minimap position preference
    loadMinimapPosition();
    
    initMinimapDrag();

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
