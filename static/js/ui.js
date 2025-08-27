// UI Controls
import { minimapState } from './gameState.js';

function loadDarkMode() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : '');
    document.getElementById('dark-mode-toggle').checked = isDarkMode;
}

function saveDarkMode(isDarkMode) {
    localStorage.setItem('darkMode', isDarkMode);
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

function initMinimapDrag() {
    const minimapCanvas = document.getElementById('minimap');
    if (!minimapCanvas) return;

    updateMinimapPosition();

    minimapCanvas.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        minimapState.isDragging = true;
        const rect = minimapCanvas.getBoundingClientRect();
        minimapState.dragOffsetX = e.clientX - rect.left;
        minimapState.dragOffsetY = e.clientY - rect.top;
        
        minimapCanvas.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (!minimapState.isDragging) return;
        
        e.preventDefault();
        
        let newX = e.clientX - minimapState.dragOffsetX;
        let newY = e.clientY - minimapState.dragOffsetY;
        
        const maxX = window.innerWidth - 150;
        const maxY = window.innerHeight - 150;
        
        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));
        
        minimapState.x = newX;
        minimapState.y = newY;
        updateMinimapPosition();
    });

    document.addEventListener('mouseup', () => {
        if (minimapState.isDragging) {
            minimapState.isDragging = false;
            minimapCanvas.style.cursor = 'move';
        }
    });

    window.addEventListener('resize', () => {
        const maxX = window.innerWidth - 150;
        const maxY = window.innerHeight - 150;
        
        minimapState.x = Math.max(0, Math.min(minimapState.x, maxX));
        minimapState.y = Math.max(0, Math.min(minimapState.y, maxY));
        updateMinimapPosition();
    });
}

function updateMinimapPosition() {
    const minimapCanvas = document.getElementById('minimap');
    if (!minimapCanvas) return;
    
    minimapCanvas.style.left = `${minimapState.x}px`;
    minimapCanvas.style.top = `${minimapState.y}px`;
    minimapCanvas.style.bottom = 'auto';
}
