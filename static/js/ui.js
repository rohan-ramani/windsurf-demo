// UI Controls
import { gameState } from './gameState.js';

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
    
    minimapCanvas.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        gameState.minimap.isDragging = true;
        
        const rect = minimapCanvas.getBoundingClientRect();
        gameState.minimap.dragOffset = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        
        minimapCanvas.style.cursor = 'grabbing';
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!gameState.minimap.isDragging) return;
        
        const newX = e.clientX - gameState.minimap.dragOffset.x;
        const newY = e.clientY - gameState.minimap.dragOffset.y;
        
        const maxX = window.innerWidth - 150;
        const maxY = window.innerHeight - 150;
        
        gameState.minimap.x = Math.max(0, Math.min(maxX, newX));
        gameState.minimap.y = Math.max(0, Math.min(maxY, newY));
        
        updateMinimapPosition();
    });
    
    document.addEventListener('mouseup', () => {
        if (gameState.minimap.isDragging) {
            gameState.minimap.isDragging = false;
            minimapCanvas.style.cursor = 'grab';
        }
    });
    
    minimapCanvas.style.cursor = 'grab';
    updateMinimapPosition();
}

function updateMinimapPosition() {
    const minimapCanvas = document.getElementById('minimap');
    minimapCanvas.style.left = `${gameState.minimap.x}px`;
    minimapCanvas.style.top = `${gameState.minimap.y}px`;
    minimapCanvas.style.bottom = 'auto';
}
