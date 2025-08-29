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
        minimap.style.transform = `translate(${minimapDrag.offsetX - 20}px, ${-minimapDrag.offsetY + 20}px)`;
    }
    
    function constrainToViewport() {
        const rect = minimap.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        minimapDrag.offsetX = Math.max(0, Math.min(minimapDrag.offsetX, viewportWidth - rect.width));
        minimapDrag.offsetY = Math.max(0, Math.min(minimapDrag.offsetY, viewportHeight - rect.height));
    }
    
    minimap.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        minimapDrag.isDragging = true;
        minimapDrag.startX = e.clientX - minimapDrag.offsetX;
        minimapDrag.startY = e.clientY - minimapDrag.offsetY;
        
        minimap.style.cursor = 'grabbing';
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!minimapDrag.isDragging) return;
        
        minimapDrag.offsetX = e.clientX - minimapDrag.startX;
        minimapDrag.offsetY = e.clientY - minimapDrag.startY;
        
        constrainToViewport();
        updateMinimapPosition();
    });
    
    document.addEventListener('mouseup', () => {
        if (minimapDrag.isDragging) {
            minimapDrag.isDragging = false;
            minimap.style.cursor = 'grab';
        }
    });
    
    minimap.style.cursor = 'grab';
    updateMinimapPosition();
}
