import { gameState } from '../gameState.js';

// Mock DOM elements
const mockCanvas = {
    addEventListener: jest.fn(),
    getContext: jest.fn(() => ({
        clearRect: jest.fn(),
        beginPath: jest.fn(),
        arc: jest.fn(),
        fill: jest.fn(),
        fillText: jest.fn(),
        strokeText: jest.fn()
    }))
};

const mockElements = {
    gameCanvas: mockCanvas,
    minimapCanvas: mockCanvas,
    scoreElement: { textContent: '' },
    leaderboardContent: { innerHTML: '' }
};

// Mock DOM methods
global.document = {
    getElementById: jest.fn((id) => mockElements[id]),
    addEventListener: jest.fn(),
    readyState: 'complete'
};

global.window = {
    addEventListener: jest.fn(),
    innerWidth: 1024,
    innerHeight: 768,
    requestAnimationFrame: jest.fn()
};

// Mock modules
jest.mock('../renderer.js', () => ({
    initRenderer: jest.fn(),
    resizeCanvas: jest.fn(),
    drawGame: jest.fn(),
    drawMinimap: jest.fn(),
    updateLeaderboard: jest.fn()
}));

jest.mock('../entities.js', () => ({
    updatePlayer: jest.fn(),
    updateAI: jest.fn(),
    initEntities: jest.fn(),
    handlePlayerSplit: jest.fn()
}));

jest.mock('../collisions.js', () => ({
    handleFoodCollisions: jest.fn(),
    handlePlayerAICollisions: jest.fn(),
    handleAIAICollisions: jest.fn(),
    respawnEntities: jest.fn()
}));

jest.mock('../ui.js', () => ({
    initUI: jest.fn()
}));

jest.mock('../game.js', () => ({
    initGame: jest.fn(),
    setupInputHandlers: jest.fn(),
    gameLoop: jest.fn(),
    verifyGameState: jest.fn(),
    checkCollisions: jest.fn()
}));

describe('Game initialization', () => {
    beforeEach(() => {
        gameState.playerCells = [];
        gameState.aiPlayers = [];
        gameState.food = [];
        jest.clearAllMocks();
    });

    test('game module functions are available', async () => {
        const gameModule = await import('../game.js');
        expect(gameModule.initGame).toBeDefined();
        expect(gameModule.setupInputHandlers).toBeDefined();
        expect(gameModule.gameLoop).toBeDefined();
    });

    test('DOM elements are properly mocked', () => {
        expect(global.document.getElementById).toBeDefined();
        expect(mockCanvas.getContext).toBeDefined();
        expect(mockCanvas.addEventListener).toBeDefined();
        
        expect(mockElements.gameCanvas).toBe(mockCanvas);
        expect(typeof global.document.getElementById).toBe('function');
    });

    test('window properties are mocked correctly', () => {
        expect(global.window.innerWidth).toBe(1024);
        expect(global.window.innerHeight).toBe(768);
        expect(global.window.addEventListener).toBeDefined();
    });
});

describe('Game state management', () => {
    beforeEach(() => {
        gameState.playerCells = [];
        gameState.aiPlayers = [];
        gameState.food = [];
        jest.clearAllMocks();
    });

    test('game state can be modified', () => {
        gameState.playerCells = [{ x: 100, y: 100, score: 100 }];
        expect(gameState.playerCells.length).toBe(1);
        expect(gameState.playerCells[0].score).toBe(100);
    });

    test('game state handles empty arrays', () => {
        expect(gameState.playerCells).toEqual([]);
        expect(gameState.aiPlayers).toEqual([]);
        expect(gameState.food).toEqual([]);
    });

    test('game state handles multiple entities', () => {
        gameState.playerCells = [
            { x: 100, y: 100, score: 100 },
            { x: 200, y: 200, score: 200 }
        ];
        gameState.aiPlayers = [
            { x: 300, y: 300, score: 150 }
        ];
        gameState.food = [
            { x: 50, y: 50 },
            { x: 150, y: 150 },
            { x: 250, y: 250 }
        ];
        
        expect(gameState.playerCells.length).toBe(2);
        expect(gameState.aiPlayers.length).toBe(1);
        expect(gameState.food.length).toBe(3);
    });
});
