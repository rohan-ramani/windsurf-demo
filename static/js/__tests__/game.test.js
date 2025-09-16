import { gameState } from '../gameState.js';

Object.defineProperty(window, 'innerWidth', { value: 800, writable: true });
Object.defineProperty(window, 'innerHeight', { value: 600, writable: true });
Object.defineProperty(window, 'requestAnimationFrame', { 
    value: jest.fn(cb => setTimeout(cb, 16)),
    writable: true 
});

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
    restore: jest.fn()
};

HTMLCanvasElement.prototype.getContext = jest.fn(() => mockContext);

global.console = {
    ...console,
    log: jest.fn(),
    error: jest.fn()
};

describe('Game Initialization', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <canvas id="gameCanvas"></canvas>
            <canvas id="minimap" width="150" height="150"></canvas>
            <div id="score">Score: 0</div>
            <div id="leaderboard-content"></div>
        `;
        
        gameState.playerCells = [{
            x: 1000,
            y: 1000,
            score: 100,
            velocityX: 0,
            velocityY: 0
        }];
        gameState.food = [];
        gameState.aiPlayers = [];
        
        jest.clearAllMocks();
    });

    test('DOM elements exist for game initialization', () => {
        expect(document.getElementById('gameCanvas')).toBeTruthy();
        expect(document.getElementById('minimap')).toBeTruthy();
        expect(document.getElementById('score')).toBeTruthy();
        expect(document.getElementById('leaderboard-content')).toBeTruthy();
    });

    test('game state is properly initialized', () => {
        expect(gameState.playerCells).toHaveLength(1);
        expect(gameState.playerCells[0]).toHaveProperty('x');
        expect(gameState.playerCells[0]).toHaveProperty('y');
        expect(gameState.playerCells[0]).toHaveProperty('score');
        expect(gameState.playerCells[0]).toHaveProperty('velocityX');
        expect(gameState.playerCells[0]).toHaveProperty('velocityY');
    });

    test('canvas context is accessible', () => {
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        expect(ctx).toBeTruthy();
        expect(ctx.clearRect).toBeDefined();
        expect(ctx.beginPath).toBeDefined();
        expect(ctx.arc).toBeDefined();
    });

    test('minimap canvas is properly sized', () => {
        const minimap = document.getElementById('minimap');
        expect(minimap.width).toBe(150);
        expect(minimap.height).toBe(150);
    });
});

describe('Game State Management', () => {
    beforeEach(() => {
        gameState.playerCells = [{
            x: 1000,
            y: 1000,
            score: 100,
            velocityX: 0,
            velocityY: 0
        }];
        gameState.food = [];
        gameState.aiPlayers = [];
    });

    test('player cells can be modified', () => {
        gameState.playerCells[0].score = 200;
        expect(gameState.playerCells[0].score).toBe(200);
    });

    test('food array can be populated', () => {
        gameState.food.push({ x: 100, y: 100, color: 'red' });
        expect(gameState.food).toHaveLength(1);
        expect(gameState.food[0]).toHaveProperty('color', 'red');
    });

    test('AI players array can be populated', () => {
        gameState.aiPlayers.push({ 
            x: 200, 
            y: 200, 
            score: 50, 
            color: 'blue',
            name: 'TestAI'
        });
        expect(gameState.aiPlayers).toHaveLength(1);
        expect(gameState.aiPlayers[0]).toHaveProperty('name', 'TestAI');
    });
});
