import { gameState, mouse } from './gameState.js';
import { initRenderer, resizeCanvas, drawGame, drawMinimap, updateLeaderboard } from './renderer.js';
import { updatePlayer, updateAI, initEntities, handlePlayerSplit } from './entities.js';
import { handleFoodCollisions, handlePlayerAICollisions, handleAIAICollisions, respawnEntities } from './collisions.js';
import { initUI } from './ui.js';

function setupInputHandlers() {
    const canvas = document.getElementById('gameCanvas');
    
    // Mouse movement
    canvas.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    // Mouse click for splitting
    canvas.addEventListener('click', (e) => {
        handlePlayerSplit();
    });

    // Window resize
    window.addEventListener('resize', () => {
        resizeCanvas();
    });
}

function setupMinimapDragHandlers() {
    const minimapCanvas = document.getElementById('minimap');
    
    minimapCanvas.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        
        gameState.minimap.isDragging = true;
        const rect = minimapCanvas.getBoundingClientRect();
        gameState.minimap.dragOffset.x = e.clientX - rect.left;
        gameState.minimap.dragOffset.y = e.clientY - rect.top;
        
        minimapCanvas.style.cursor = 'grabbing';
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!gameState.minimap.isDragging) return;
        
        e.preventDefault();
        
        const newX = e.clientX - gameState.minimap.dragOffset.x;
        const newY = e.clientY - gameState.minimap.dragOffset.y;
        
        const maxX = window.innerWidth - minimapCanvas.width;
        const maxY = window.innerHeight - minimapCanvas.height;
        
        gameState.minimap.position.x = Math.max(0, Math.min(newX, maxX));
        gameState.minimap.position.y = Math.max(0, Math.min(newY, maxY));
        
        minimapCanvas.style.left = gameState.minimap.position.x + 'px';
        minimapCanvas.style.top = gameState.minimap.position.y + 'px';
        minimapCanvas.style.bottom = 'auto';
    });
    
    document.addEventListener('mouseup', (e) => {
        if (gameState.minimap.isDragging) {
            gameState.minimap.isDragging = false;
            minimapCanvas.style.cursor = 'grab';
        }
    });
    
    minimapCanvas.style.cursor = 'grab';
}

function checkCollisions() {
    handleFoodCollisions();
    handlePlayerAICollisions();
    handleAIAICollisions();
    respawnEntities();
}

function verifyGameState() {
    console.log('Verifying game state...');
    console.log('Player cells:', gameState.playerCells);
    console.log('AI players:', gameState.aiPlayers);
    console.log('Food count:', gameState.food.length);

    if (gameState.playerCells.length === 0) {
        console.error('No player cells found!');
    }
    if (gameState.aiPlayers.length === 0) {
        console.error('No AI players found!');
    }
    if (gameState.food.length === 0) {
        console.error('No food found!');
    }
}

function gameLoop() {
    updatePlayer();
    updateAI();
    checkCollisions();
    updateLeaderboard();
    drawGame();
    drawMinimap();
    requestAnimationFrame(gameLoop);
}

async function initGame() {
    try {
        console.log('Initializing game...');
        
        // Get DOM elements
        const elements = {
            gameCanvas: document.getElementById('gameCanvas'),
            minimapCanvas: document.getElementById('minimap'),
            scoreElement: document.getElementById('score'),
            leaderboardContent: document.getElementById('leaderboard-content')
        };

        // Verify all elements are found
        Object.entries(elements).forEach(([key, element]) => {
            if (!element) {
                throw new Error(`Could not find element: ${key}`);
            }
        });

        console.log('DOM elements found');

        // Initialize game components in order
        initRenderer(elements);
        console.log('Renderer initialized');
        
        setupInputHandlers();
        console.log('Input handlers set up');
        
        setupMinimapDragHandlers();
        console.log('Minimap drag handlers set up');
        
        initEntities();
        console.log('Entities initialized');

        initUI();
        console.log('UI initialized');

        // Verify game state
        verifyGameState();

        // Start game loop
        console.log('Starting game loop');
        gameLoop();
    } catch (error) {
        console.error('Error initializing game:', error);
    }
}

// Start the game when the DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}
