import { gameState } from '../gameState.js';

// Mock canvas context
const mockCtx = {
    clearRect: jest.fn(),
    beginPath: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    fillText: jest.fn(),
    strokeText: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    strokeRect: jest.fn()
};

const mockCanvas = {
    getContext: jest.fn(() => mockCtx),
    width: 1024,
    height: 768
};

global.window = {
    innerWidth: 1024,
    innerHeight: 768
};

describe('Renderer', () => {
    beforeEach(() => {
        gameState.playerCells = [{ x: 100, y: 100, score: 100 }];
        gameState.aiPlayers = [{ x: 200, y: 200, score: 50, color: '#ff0000', name: 'AI1' }];
        gameState.food = [{ x: 150, y: 150, color: '#00ff00' }];
        gameState.camera = { x: 0, y: 0 };
        gameState.playerName = 'TestPlayer';
        jest.clearAllMocks();
    });

    test('initRenderer sets up canvas contexts', async () => {
        const { initRenderer } = await import('../renderer.js');
        const elements = {
            gameCanvas: mockCanvas,
            minimapCanvas: mockCanvas,
            scoreElement: { textContent: '' },
            leaderboardContent: { innerHTML: '' }
        };
        
        initRenderer(elements);
        expect(mockCanvas.getContext).toHaveBeenCalledWith('2d');
    });

    test('resizeCanvas updates canvas dimensions', async () => {
        const { resizeCanvas } = await import('../renderer.js');
        const { initRenderer } = await import('../renderer.js');
        
        const elements = {
            gameCanvas: mockCanvas,
            minimapCanvas: mockCanvas,
            scoreElement: { textContent: '' },
            leaderboardContent: { innerHTML: '' }
        };
        
        initRenderer(elements);
        resizeCanvas();
        
        expect(mockCanvas.width).toBe(1024);
        expect(mockCanvas.height).toBe(768);
    });

    test('drawGame clears canvas and draws entities', async () => {
        const { drawGame, initRenderer } = await import('../renderer.js');
        
        const elements = {
            gameCanvas: mockCanvas,
            minimapCanvas: mockCanvas,
            scoreElement: { textContent: '' },
            leaderboardContent: { innerHTML: '' }
        };
        
        initRenderer(elements);
        drawGame();
        
        expect(mockCtx.clearRect).toHaveBeenCalledWith(0, 0, 1024, 768);
        expect(mockCtx.arc).toHaveBeenCalled();
        expect(mockCtx.fill).toHaveBeenCalled();
    });

    test('updateLeaderboard creates leaderboard HTML', async () => {
        const { updateLeaderboard, initRenderer } = await import('../renderer.js');
        
        const mockLeaderboardContent = { innerHTML: '' };
        const elements = {
            gameCanvas: mockCanvas,
            minimapCanvas: mockCanvas,
            scoreElement: { textContent: '' },
            leaderboardContent: mockLeaderboardContent
        };
        
        initRenderer(elements);
        updateLeaderboard();
        
        expect(mockLeaderboardContent.innerHTML).toContain('TestPlayer');
        expect(mockLeaderboardContent.innerHTML).toContain('AI1');
    });
});
