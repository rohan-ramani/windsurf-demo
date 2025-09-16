import { gameState, mouse } from '../gameState.js';
import { updatePlayer, updateAI, initEntities } from '../entities.js';
import { handleFoodCollisions, handlePlayerAICollisions } from '../collisions.js';
import { getSize, getDistance, calculateCenterOfMass } from '../utils.js';

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

global.document = {
    getElementById: jest.fn(() => mockCanvas),
    addEventListener: jest.fn()
};

global.window = {
    addEventListener: jest.fn(),
    innerWidth: 1024,
    innerHeight: 768,
    requestAnimationFrame: jest.fn()
};

describe('Game Integration Tests', () => {
    beforeEach(() => {
        gameState.playerCells = [];
        gameState.aiPlayers = [];
        gameState.food = [];
        mouse.x = 0;
        mouse.y = 0;
    });

    test('complete game flow: player movement and food consumption', () => {
        gameState.playerCells = [{ x: 100, y: 100, score: 100, velocityX: 0, velocityY: 0 }];
        gameState.food = [{ x: 110, y: 110 }];
        
        mouse.x = 110;
        mouse.y = 110;
        
        updatePlayer();
        
        const initialScore = gameState.playerCells[0].score;
        handleFoodCollisions();
        
        expect(gameState.food.length).toBe(0);
        expect(gameState.playerCells[0].score).toBeGreaterThan(initialScore);
    });

    test('player vs AI collision mechanics', () => {
        gameState.playerCells = [{ x: 100, y: 100, score: 400 }];
        gameState.aiPlayers = [{ x: 100, y: 100, score: 100 }];
        
        const initialPlayerScore = gameState.playerCells[0].score;
        
        handlePlayerAICollisions();
        
        expect(gameState.aiPlayers.length).toBe(0);
        expect(gameState.playerCells[0].score).toBeGreaterThan(initialPlayerScore);
    });

    test('utility functions work together correctly', () => {
        const cells = [
            { x: 0, y: 0, score: 100 },
            { x: 200, y: 200, score: 300 }
        ];
        
        const center = calculateCenterOfMass(cells);
        expect(center.x).toBeCloseTo(150);
        expect(center.y).toBeCloseTo(150);
        
        const size1 = getSize(100);
        const size2 = getSize(300);
        expect(size2).toBeGreaterThan(size1);
        
        const distance = getDistance(cells[0], cells[1]);
        expect(distance).toBeCloseTo(282.84, 1);
    });

    test('game state consistency during complex interactions', () => {
        gameState.playerCells = [
            { x: 100, y: 100, score: 200, velocityX: 0, velocityY: 0 },
            { x: 150, y: 150, score: 150, velocityX: 0, velocityY: 0 }
        ];
        gameState.aiPlayers = [
            { x: 200, y: 200, score: 100 },
            { x: 300, y: 300, score: 250 }
        ];
        gameState.food = [
            { x: 120, y: 120 },
            { x: 180, y: 180 }
        ];
        
        const initialTotalScore = gameState.playerCells.reduce((sum, cell) => sum + cell.score, 0);
        
        mouse.x = 200;
        mouse.y = 200;
        updatePlayer();
        updateAI();
        handleFoodCollisions();
        handlePlayerAICollisions();
        
        expect(gameState.playerCells.length).toBeGreaterThan(0);
        expect(gameState.aiPlayers.length).toBeGreaterThanOrEqual(0);
        expect(gameState.food.length).toBeGreaterThanOrEqual(0);
        
        const finalTotalScore = gameState.playerCells.reduce((sum, cell) => sum + cell.score, 0);
        expect(finalTotalScore).toBeGreaterThanOrEqual(initialTotalScore);
    });

    test('edge case: empty game state handling', () => {
        expect(() => {
            updatePlayer();
            updateAI();
            handleFoodCollisions();
            handlePlayerAICollisions();
        }).not.toThrow();
        
        expect(gameState.playerCells.length).toBeGreaterThanOrEqual(0);
        expect(gameState.aiPlayers.length).toBeGreaterThanOrEqual(0);
        expect(gameState.food.length).toBeGreaterThanOrEqual(0);
    });
});
