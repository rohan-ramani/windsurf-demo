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

describe('Game initialization', () => {
    beforeEach(() => {
        gameState.playerCells = [];
        gameState.aiPlayers = [];
        gameState.food = [];
        jest.clearAllMocks();
    });

    test('sets up input handlers correctly', async () => {
        const { default: gameModule } = await import('../game.js');
        
        expect(mockCanvas.addEventListener).toHaveBeenCalledWith('mousemove', expect.any(Function));
        expect(mockCanvas.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
        expect(global.window.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    });

    test('verifies game state correctly', async () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        
        // Test with empty game state
        gameState.playerCells = [];
        gameState.aiPlayers = [];
        gameState.food = [];
        
        await import('../game.js');
        
        expect(consoleErrorSpy).toHaveBeenCalledWith('No player cells found!');
        expect(consoleErrorSpy).toHaveBeenCalledWith('No AI players found!');
        expect(consoleErrorSpy).toHaveBeenCalledWith('No food found!');
        
        consoleSpy.mockRestore();
        consoleErrorSpy.mockRestore();
    });
});

describe('Game loop', () => {
    beforeEach(() => {
        gameState.playerCells = [{ x: 100, y: 100, score: 100 }];
        gameState.aiPlayers = [{ x: 200, y: 200, score: 50 }];
        gameState.food = [{ x: 150, y: 150 }];
        jest.clearAllMocks();
    });

    test('calls all update functions in correct order', async () => {
        const { updatePlayer } = await import('../entities.js');
        const { updateAI } = await import('../entities.js');
        const { handleFoodCollisions } = await import('../collisions.js');
        const { drawGame } = await import('../renderer.js');
        
        // Mock requestAnimationFrame to prevent infinite loop
        global.requestAnimationFrame = jest.fn();
        
        await import('../game.js');
        
        expect(updatePlayer).toHaveBeenCalled();
        expect(updateAI).toHaveBeenCalled();
        expect(handleFoodCollisions).toHaveBeenCalled();
        expect(drawGame).toHaveBeenCalled();
    });
});
