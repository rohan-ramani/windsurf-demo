import { WORLD_SIZE, STARTING_SCORE } from './config.js';

export const gameState = {
    playerCells: [{
        x: WORLD_SIZE / 2,
        y: WORLD_SIZE / 2,
        score: STARTING_SCORE,
        velocityX: 0,
        velocityY: 0
    }],
    playerName: 'Windsurf',
    camera: {
        x: 0,
        y: 0
    },
    food: [],
    aiPlayers: [],
    minimap: {
        isDragging: false,
        dragOffset: { x: 0, y: 0 },
        position: { x: 20, y: 20 }
    }
};

export const mouse = { x: 0, y: 0 };
