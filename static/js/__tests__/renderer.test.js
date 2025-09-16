import { initRenderer, resizeCanvas, drawGame, drawMinimap, updateLeaderboard } from '../renderer.js';
import { gameState } from '../gameState.js';

const mockContext = {
    clearRect: jest.fn(),
    beginPath: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    fillRect: jest.fn(),
    strokeRect: jest.fn(),
    fillText: jest.fn(),
    strokeText: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    set fillStyle(value) { this._fillStyle = value; },
    get fillStyle() { return this._fillStyle; },
    set strokeStyle(value) { this._strokeStyle = value; },
    get strokeStyle() { return this._strokeStyle; },
    set font(value) { this._font = value; },
    get font() { return this._font; },
    set textAlign(value) { this._textAlign = value; },
    get textAlign() { return this._textAlign; },
    set textBaseline(value) { this._textBaseline = value; },
    get textBaseline() { return this._textBaseline; },
    set lineWidth(value) { this._lineWidth = value; },
    get lineWidth() { return this._lineWidth; }
};

HTMLCanvasElement.prototype.getContext = jest.fn(() => mockContext);

Object.defineProperty(window, 'innerWidth', { value: 800, writable: true });
Object.defineProperty(window, 'innerHeight', { value: 600, writable: true });

describe('Renderer Initialization', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <canvas id="gameCanvas"></canvas>
            <canvas id="minimap" width="150" height="150"></canvas>
            <div id="score">Score: 0</div>
            <div id="leaderboard-content"></div>
        `;
        
        jest.clearAllMocks();
    });

    test('initRenderer sets up canvas elements', () => {
        const elements = {
            gameCanvas: document.getElementById('gameCanvas'),
            minimapCanvas: document.getElementById('minimap'),
            scoreElement: document.getElementById('score'),
            leaderboardContent: document.getElementById('leaderboard-content')
        };

        initRenderer(elements);
        
        expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalledWith('2d');
    });

    test('resizeCanvas updates canvas dimensions', () => {
        const canvas = document.getElementById('gameCanvas');
        initRenderer({
            gameCanvas: canvas,
            minimapCanvas: document.getElementById('minimap'),
            scoreElement: document.getElementById('score'),
            leaderboardContent: document.getElementById('leaderboard-content')
        });

        resizeCanvas();
        
        expect(canvas.width).toBe(window.innerWidth);
        expect(canvas.height).toBe(window.innerHeight);
    });
});

describe('Game Rendering', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <canvas id="gameCanvas"></canvas>
            <canvas id="minimap" width="150" height="150"></canvas>
            <div id="score">Score: 0</div>
            <div id="leaderboard-content"></div>
        `;

        const elements = {
            gameCanvas: document.getElementById('gameCanvas'),
            minimapCanvas: document.getElementById('minimap'),
            scoreElement: document.getElementById('score'),
            leaderboardContent: document.getElementById('leaderboard-content')
        };

        initRenderer(elements);
        
        gameState.playerCells = [{
            x: 1000,
            y: 1000,
            score: 100,
            velocityX: 0,
            velocityY: 0
        }];
        gameState.food = [{ x: 500, y: 500, color: 'red' }];
        gameState.aiPlayers = [{ 
            x: 800, 
            y: 800, 
            score: 75, 
            color: 'blue',
            name: 'TestAI'
        }];
        gameState.camera = { x: 0, y: 0 };
        gameState.playerName = 'TestPlayer';
        
        jest.clearAllMocks();
    });

    test('drawGame clears canvas and renders entities', () => {
        drawGame();
        
        expect(mockContext.clearRect).toHaveBeenCalled();
        expect(mockContext.beginPath).toHaveBeenCalled();
        expect(mockContext.arc).toHaveBeenCalled();
        expect(mockContext.fill).toHaveBeenCalled();
    });

    test('drawMinimap renders minimap elements', () => {
        drawMinimap();
        
        expect(mockContext.fillRect).toHaveBeenCalled();
        expect(mockContext.strokeRect).toHaveBeenCalled();
        expect(mockContext.arc).toHaveBeenCalled();
    });

    test('updateLeaderboard updates leaderboard content', () => {
        updateLeaderboard();
        
        const leaderboardContent = document.getElementById('leaderboard-content');
        expect(leaderboardContent.innerHTML).toContain('TestPlayer');
        expect(leaderboardContent.innerHTML).toContain('TestAI');
    });

    test('score display is updated', () => {
        drawGame();
        
        const scoreElement = document.getElementById('score');
        expect(scoreElement.textContent).toContain('Score: 100');
    });
});

describe('Rendering Edge Cases', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <canvas id="gameCanvas"></canvas>
            <canvas id="minimap" width="150" height="150"></canvas>
            <div id="score">Score: 0</div>
            <div id="leaderboard-content"></div>
        `;

        const elements = {
            gameCanvas: document.getElementById('gameCanvas'),
            minimapCanvas: document.getElementById('minimap'),
            scoreElement: document.getElementById('score'),
            leaderboardContent: document.getElementById('leaderboard-content')
        };

        initRenderer(elements);
        jest.clearAllMocks();
    });

    test('handles empty game state', () => {
        gameState.playerCells = [];
        gameState.food = [];
        gameState.aiPlayers = [];
        gameState.camera = { x: 0, y: 0 };

        expect(() => {
            drawGame();
            drawMinimap();
            updateLeaderboard();
        }).not.toThrow();
    });

    test('handles multiple player cells', () => {
        gameState.playerCells = [
            { x: 1000, y: 1000, score: 100, velocityX: 0, velocityY: 0 },
            { x: 1100, y: 1100, score: 50, velocityX: 0, velocityY: 0 }
        ];
        gameState.food = [];
        gameState.aiPlayers = [];
        gameState.camera = { x: 0, y: 0 };
        gameState.playerName = 'TestPlayer';

        expect(() => {
            drawGame();
            updateLeaderboard();
        }).not.toThrow();

        const scoreElement = document.getElementById('score');
        expect(scoreElement.textContent).toContain('Score: 150'); // 100 + 50
    });
});
