import { 
    WORLD_SIZE, 
    FOOD_SIZE, 
    STARTING_SCORE, 
    AI_STARTING_SCORE,
    FOOD_SCORE,
    FOOD_COUNT,
    AI_COUNT,
    COLLISION_THRESHOLD,
    MIN_SPLIT_SCORE,
    SPLIT_VELOCITY,
    MAX_PLAYER_CELLS,
    COLORS
} from '../config.js';

describe('Configuration validation', () => {
    test('world size is positive', () => {
        expect(WORLD_SIZE).toBeGreaterThan(0);
        expect(typeof WORLD_SIZE).toBe('number');
    });

    test('food configuration is valid', () => {
        expect(FOOD_SIZE).toBeGreaterThan(0);
        expect(FOOD_SCORE).toBeGreaterThan(0);
        expect(FOOD_COUNT).toBeGreaterThan(0);
        expect(typeof FOOD_SIZE).toBe('number');
        expect(typeof FOOD_SCORE).toBe('number');
        expect(typeof FOOD_COUNT).toBe('number');
    });

    test('player configuration is valid', () => {
        expect(STARTING_SCORE).toBeGreaterThan(0);
        expect(AI_STARTING_SCORE).toBeGreaterThan(0);
        expect(AI_COUNT).toBeGreaterThan(0);
        expect(typeof STARTING_SCORE).toBe('number');
        expect(typeof AI_STARTING_SCORE).toBe('number');
        expect(typeof AI_COUNT).toBe('number');
    });

    test('collision threshold is reasonable', () => {
        expect(COLLISION_THRESHOLD).toBeGreaterThan(1);
        expect(COLLISION_THRESHOLD).toBeLessThan(2);
        expect(typeof COLLISION_THRESHOLD).toBe('number');
    });

    test('split mechanics are valid', () => {
        expect(MIN_SPLIT_SCORE).toBeGreaterThan(0);
        expect(SPLIT_VELOCITY).toBeGreaterThan(0);
        expect(MAX_PLAYER_CELLS).toBeGreaterThan(1);
        expect(typeof MIN_SPLIT_SCORE).toBe('number');
        expect(typeof SPLIT_VELOCITY).toBe('number');
        expect(typeof MAX_PLAYER_CELLS).toBe('number');
    });

    test('colors are properly defined', () => {
        expect(typeof COLORS.PLAYER).toBe('string');
        expect(COLORS.PLAYER).toMatch(/^#[0-9a-fA-F]{6}$/);
        expect(typeof COLORS.MINIMAP.PLAYER).toBe('string');
        expect(typeof COLORS.MINIMAP.TOP_PLAYER).toBe('string');
        expect(typeof COLORS.MINIMAP.OTHER).toBe('string');
    });

    test('configuration relationships are logical', () => {
        // Starting score should be greater than minimum split score
        expect(STARTING_SCORE).toBeGreaterThan(MIN_SPLIT_SCORE);
        
        // AI starting score should be reasonable compared to player
        expect(AI_STARTING_SCORE).toBeLessThanOrEqual(STARTING_SCORE);
        
        // Food score should be reasonable
        expect(FOOD_SCORE).toBeLessThan(STARTING_SCORE);
    });
});
