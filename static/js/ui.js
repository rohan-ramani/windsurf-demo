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
    
    setupMinimapDrag();
}

function setupMinimapDrag() {
    const minimap = document.getElementById('minimap');
    
    function updateMinimapPosition() {
        minimap.style.left = `${minimapState.position.x}px`;
        minimap.style.bottom = `${minimapState.position.y}px`;
    }
    
    minimap.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        minimapState.isDragging = true;
        const rect = minimap.getBoundingClientRect();
        minimapState.dragOffset.x = e.clientX - rect.left;
        minimapState.dragOffset.y = e.clientY - rect.top;
        
        minimap.style.cursor = 'grabbing';
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!minimapState.isDragging) return;
        
        e.preventDefault();
        
        const newX = e.clientX - minimapState.dragOffset.x;
        const newY = window.innerHeight - (e.clientY - minimapState.dragOffset.y) - minimap.offsetHeight;
        
        const maxX = window.innerWidth - minimap.offsetWidth;
        const maxY = window.innerHeight - minimap.offsetHeight;
        
        minimapState.position.x = Math.max(0, Math.min(newX, maxX));
        minimapState.position.y = Math.max(0, Math.min(newY, maxY));
        
        updateMinimapPosition();
    });
    
    document.addEventListener('mouseup', () => {
        if (minimapState.isDragging) {
            minimapState.isDragging = false;
            minimap.style.cursor = 'move';
        }
    });
    
    updateMinimapPosition();
}
