import { minimapState } from '../gameState.js';

const mockCanvas = {
    style: {},
    addEventListener: jest.fn(),
    getBoundingClientRect: jest.fn(() => ({
        left: 20,
        top: 20,
        width: 150,
        height: 150
    }))
};

const mockSettingsIcon = {
    addEventListener: jest.fn()
};

const mockSettingsPanel = {
    classList: {
        toggle: jest.fn(),
        contains: jest.fn(() => false),
        remove: jest.fn()
    },
    addEventListener: jest.fn(),
    contains: jest.fn(() => false)
};

const mockDarkModeToggle = {
    checked: false,
    addEventListener: jest.fn()
};

Object.defineProperty(global, 'document', {
    value: {
        getElementById: jest.fn((id) => {
            switch(id) {
                case 'minimap': return mockCanvas;
                case 'settings-icon': return mockSettingsIcon;
                case 'settings-panel': return mockSettingsPanel;
                case 'dark-mode-toggle': return mockDarkModeToggle;
                default: return null;
            }
        }),
        addEventListener: jest.fn(),
        documentElement: {
            setAttribute: jest.fn()
        }
    },
    writable: true
});

Object.defineProperty(global, 'window', {
    value: {
        innerWidth: 1024,
        innerHeight: 768,
        addEventListener: jest.fn()
    },
    writable: true
});

Object.defineProperty(global, 'localStorage', {
    value: {
        getItem: jest.fn(() => 'false'),
        setItem: jest.fn()
    },
    writable: true
});

import { initUI } from '../ui.js';

describe('Minimap Drag Functionality', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        
        minimapState.x = 20;
        minimapState.y = 20;
        minimapState.isDragging = false;
        minimapState.dragOffsetX = 0;
        minimapState.dragOffsetY = 0;
        
        mockCanvas.style = {};
        
        initUI();
    });

    describe('initMinimapDrag', () => {
        test('sets up event listeners on minimap canvas', () => {
            expect(document.getElementById).toHaveBeenCalledWith('minimap');
            expect(mockCanvas.addEventListener).toHaveBeenCalledWith('mousedown', expect.any(Function));
            expect(document.addEventListener).toHaveBeenCalledWith('mousemove', expect.any(Function));
            expect(document.addEventListener).toHaveBeenCalledWith('mouseup', expect.any(Function));
            expect(window.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
        });

        test('sets initial minimap position', () => {
            expect(mockCanvas.style.left).toBe('20px');
            expect(mockCanvas.style.top).toBe('20px');
            expect(mockCanvas.style.bottom).toBe('auto');
        });
    });

    describe('mousedown event handling', () => {
        test('starts dragging on mousedown', () => {
            const mousedownHandler = mockCanvas.addEventListener.mock.calls
                .find(call => call[0] === 'mousedown')[1];
            
            const mockEvent = {
                preventDefault: jest.fn(),
                stopPropagation: jest.fn(),
                clientX: 100,
                clientY: 100
            };

            mousedownHandler(mockEvent);

            expect(mockEvent.preventDefault).toHaveBeenCalled();
            expect(mockEvent.stopPropagation).toHaveBeenCalled();
            expect(minimapState.isDragging).toBe(true);
            expect(minimapState.dragOffsetX).toBe(80);
            expect(minimapState.dragOffsetY).toBe(80);
            expect(mockCanvas.style.cursor).toBe('grabbing');
        });
    });

    describe('mousemove event handling', () => {
        test('updates position during drag', () => {
            minimapState.isDragging = true;
            minimapState.dragOffsetX = 50;
            minimapState.dragOffsetY = 50;

            const mousemoveHandler = document.addEventListener.mock.calls
                .find(call => call[0] === 'mousemove')[1];
            
            const mockEvent = {
                preventDefault: jest.fn(),
                clientX: 200,
                clientY: 200
            };

            mousemoveHandler(mockEvent);

            expect(mockEvent.preventDefault).toHaveBeenCalled();
            expect(minimapState.x).toBe(150);
            expect(minimapState.y).toBe(150);
            expect(mockCanvas.style.left).toBe('150px');
            expect(mockCanvas.style.top).toBe('150px');
        });

        test('does not update position when not dragging', () => {
            minimapState.isDragging = false;
            const originalX = minimapState.x;
            const originalY = minimapState.y;

            const mousemoveHandler = document.addEventListener.mock.calls
                .find(call => call[0] === 'mousemove')[1];
            
            const mockEvent = {
                preventDefault: jest.fn(),
                clientX: 200,
                clientY: 200
            };

            mousemoveHandler(mockEvent);

            expect(minimapState.x).toBe(originalX);
            expect(minimapState.y).toBe(originalY);
        });
    });

    describe('boundary constraints', () => {
        test('constrains position to minimum bounds (0, 0)', () => {
            minimapState.isDragging = true;
            minimapState.dragOffsetX = 50;
            minimapState.dragOffsetY = 50;

            const mousemoveHandler = document.addEventListener.mock.calls
                .find(call => call[0] === 'mousemove')[1];
            
            const mockEvent = {
                preventDefault: jest.fn(),
                clientX: -100,
                clientY: -100
            };

            mousemoveHandler(mockEvent);

            expect(minimapState.x).toBe(0);
            expect(minimapState.y).toBe(0);
            expect(mockCanvas.style.left).toBe('0px');
            expect(mockCanvas.style.top).toBe('0px');
        });

        test('constrains position to maximum bounds', () => {
            minimapState.isDragging = true;
            minimapState.dragOffsetX = 50;
            minimapState.dragOffsetY = 50;

            const mousemoveHandler = document.addEventListener.mock.calls
                .find(call => call[0] === 'mousemove')[1];
            
            const mockEvent = {
                preventDefault: jest.fn(),
                clientX: 2000,
                clientY: 2000
            };

            mousemoveHandler(mockEvent);

            expect(minimapState.x).toBe(874);
            expect(minimapState.y).toBe(618);
            expect(mockCanvas.style.left).toBe('874px');
            expect(mockCanvas.style.top).toBe('618px');
        });
    });

    describe('mouseup event handling', () => {
        test('stops dragging on mouseup', () => {
            minimapState.isDragging = true;

            const mouseupHandler = document.addEventListener.mock.calls
                .find(call => call[0] === 'mouseup')[1];
            
            mouseupHandler();

            expect(minimapState.isDragging).toBe(false);
            expect(mockCanvas.style.cursor).toBe('move');
        });

        test('does nothing when not dragging', () => {
            minimapState.isDragging = false;
            const originalCursor = mockCanvas.style.cursor;

            const mouseupHandler = document.addEventListener.mock.calls
                .find(call => call[0] === 'mouseup')[1];
            
            mouseupHandler();

            expect(minimapState.isDragging).toBe(false);
            expect(mockCanvas.style.cursor).toBe(originalCursor);
        });
    });

    describe('window resize handling', () => {
        test('adjusts position when window is resized', () => {
            minimapState.x = 900;
            minimapState.y = 700;

            window.innerWidth = 800;
            window.innerHeight = 600;

            const resizeHandler = window.addEventListener.mock.calls
                .find(call => call[0] === 'resize')[1];
            
            resizeHandler();

            expect(minimapState.x).toBe(650);
            expect(minimapState.y).toBe(450);
            expect(mockCanvas.style.left).toBe('650px');
            expect(mockCanvas.style.top).toBe('450px');
        });
    });

    describe('minimapState integration', () => {
        test('maintains state consistency during drag operations', () => {
            const mousedownHandler = mockCanvas.addEventListener.mock.calls
                .find(call => call[0] === 'mousedown')[1];
            
            mousedownHandler({
                preventDefault: jest.fn(),
                stopPropagation: jest.fn(),
                clientX: 100,
                clientY: 100
            });

            expect(minimapState.isDragging).toBe(true);

            const mousemoveHandler = document.addEventListener.mock.calls
                .find(call => call[0] === 'mousemove')[1];
            
            mousemoveHandler({
                preventDefault: jest.fn(),
                clientX: 200,
                clientY: 200
            });

            expect(minimapState.x).toBe(120);
            expect(minimapState.y).toBe(120);

            const mouseupHandler = document.addEventListener.mock.calls
                .find(call => call[0] === 'mouseup')[1];
            
            mouseupHandler();

            expect(minimapState.isDragging).toBe(false);
            expect(minimapState.x).toBe(120);
            expect(minimapState.y).toBe(120);
        });
    });
});
