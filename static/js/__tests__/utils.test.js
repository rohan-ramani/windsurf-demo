import { getSize, getDistance, calculateCenterOfMass, getRandomPosition, findSafeSpawnLocation } from '../utils.js';

describe('getSize', () => {
  test('returns correct size for score 0', () => {
    expect(getSize(0)).toBe(20);  // sqrt(0) + 20
  });

  test('returns correct size for score 100', () => {
    expect(getSize(100)).toBe(30);  // sqrt(100) + 20
  });

  test('returns correct size for score 400', () => {
    expect(getSize(400)).toBe(40);  // sqrt(400) + 20
  });
});

describe('getDistance', () => {
  test('returns 0 for same point', () => {
    const point = { x: 10, y: 10 };
    expect(getDistance(point, point)).toBe(0);
  });

  test('returns correct horizontal distance', () => {
    const point1 = { x: 0, y: 0 };
    const point2 = { x: 3, y: 0 };
    expect(getDistance(point1, point2)).toBe(3);
  });

  test('returns correct vertical distance', () => {
    const point1 = { x: 0, y: 0 };
    const point2 = { x: 0, y: 4 };
    expect(getDistance(point1, point2)).toBe(4);
  });

  test('returns correct diagonal distance', () => {
    const point1 = { x: 0, y: 0 };
    const point2 = { x: 3, y: 4 };
    expect(getDistance(point1, point2)).toBe(5);  // 3-4-5 triangle
  });
});

describe('calculateCenterOfMass', () => {
  test('returns center for single cell', () => {
    const cells = [{ x: 10, y: 20, score: 100 }];
    const center = calculateCenterOfMass(cells);
    expect(center).toEqual({ x: 10, y: 20 });
  });

  test('returns weighted center for multiple cells', () => {
    const cells = [
      { x: 0, y: 0, score: 100 },
      { x: 10, y: 10, score: 300 }
    ];
    const center = calculateCenterOfMass(cells);
    expect(center.x).toBeCloseTo(7.5);
    expect(center.y).toBeCloseTo(7.5);
  });

  test('getRandomPosition returns position within world bounds', () => {
    const pos = getRandomPosition();
    expect(pos.x).toBeGreaterThanOrEqual(0);
    expect(pos.x).toBeLessThanOrEqual(2000);
    expect(pos.y).toBeGreaterThanOrEqual(0);
    expect(pos.y).toBeLessThanOrEqual(2000);
  });
  
  test('getRandomPosition returns different positions on multiple calls', () => {
    const pos1 = getRandomPosition();
    const pos2 = getRandomPosition();
    expect(pos1.x !== pos2.x || pos1.y !== pos2.y).toBe(true);
  });

  test('findSafeSpawnLocation returns safe position away from players', () => {
    const gameState = {
      playerCells: [{ x: 100, y: 100, score: 100 }],
      aiPlayers: [{ x: 200, y: 200, score: 100 }]
    };
    
    const safePos = findSafeSpawnLocation(gameState, 50);
    expect(safePos).toHaveProperty('x');
    expect(safePos).toHaveProperty('y');
    expect(safePos.x).toBeGreaterThanOrEqual(0);
    expect(safePos.y).toBeGreaterThanOrEqual(0);
  });
  
  test('findSafeSpawnLocation handles empty game state', () => {
    const gameState = { playerCells: [], aiPlayers: [] };
    const safePos = findSafeSpawnLocation(gameState);
    expect(safePos).toHaveProperty('x');
    expect(safePos).toHaveProperty('y');
  });

  test('returns {x: 0, y: 0} for empty cells array', () => {
    expect(calculateCenterOfMass([])).toEqual({ x: 0, y: 0 });
  });

  test('returns {x: 0, y: 0} for cells with zero total score', () => {
    const cells = [
      { x: 10, y: 20, score: 0 },
      { x: 30, y: 40, score: 0 }
    ];
    expect(calculateCenterOfMass(cells)).toEqual({ x: 0, y: 0 });
  });
});

describe('getRandomPosition', () => {
  test('returns position within world bounds', () => {
    const pos = getRandomPosition();
    expect(pos.x).toBeGreaterThanOrEqual(0);
    expect(pos.x).toBeLessThanOrEqual(2000);
    expect(pos.y).toBeGreaterThanOrEqual(0);
    expect(pos.y).toBeLessThanOrEqual(2000);
  });
  
  test('returns different positions on multiple calls', () => {
    const pos1 = getRandomPosition();
    const pos2 = getRandomPosition();
    expect(pos1.x !== pos2.x || pos1.y !== pos2.y).toBe(true);
  });
});

describe('findSafeSpawnLocation', () => {
  test('returns safe position away from players', () => {
    const gameState = {
      playerCells: [{ x: 100, y: 100, score: 100 }],
      aiPlayers: [{ x: 200, y: 200, score: 100 }]
    };
    
    const safePos = findSafeSpawnLocation(gameState, 50);
    expect(safePos).toHaveProperty('x');
    expect(safePos).toHaveProperty('y');
    expect(safePos.x).toBeGreaterThanOrEqual(0);
    expect(safePos.y).toBeGreaterThanOrEqual(0);
  });
  
  test('handles empty game state', () => {
    const gameState = { playerCells: [], aiPlayers: [] };
    const safePos = findSafeSpawnLocation(gameState);
    expect(safePos).toHaveProperty('x');
    expect(safePos).toHaveProperty('y');
  });
  
  test('returns fallback position when no safe spot found', () => {
    const gameState = {
      playerCells: Array(50).fill({ x: 1000, y: 1000, score: 1000 }),
      aiPlayers: Array(50).fill({ x: 1000, y: 1000, score: 1000 })
    };
    
    const safePos = findSafeSpawnLocation(gameState, 2000);
    expect(safePos).toHaveProperty('x');
    expect(safePos).toHaveProperty('y');
  });
});
