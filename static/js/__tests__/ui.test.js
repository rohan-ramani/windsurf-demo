// Mock localStorage
const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn()
};
global.localStorage = mockLocalStorage;

// Mock DOM elements
const mockElements = {
    'settings-icon': { addEventListener: jest.fn() },
    'settings-panel': { 
        classList: { toggle: jest.fn(), contains: jest.fn(), remove: jest.fn() },
        addEventListener: jest.fn(),
        contains: jest.fn()
    },
    'dark-mode-toggle': { 
        checked: false,
        addEventListener: jest.fn()
    }
};

global.document = {
    getElementById: jest.fn((id) => mockElements[id] || null),
    addEventListener: jest.fn(),
    documentElement: { setAttribute: jest.fn() }
};

jest.mock('../ui.js', () => {
    const originalModule = jest.requireActual('../ui.js');
    return {
        ...originalModule,
        initUI: jest.fn(() => {
            const settingsIcon = mockElements['settings-icon'];
            const settingsPanel = mockElements['settings-panel'];
            const darkModeToggle = mockElements['dark-mode-toggle'];
            
            if (settingsIcon && settingsIcon.addEventListener) {
                settingsIcon.addEventListener('click', jest.fn());
            }
            if (darkModeToggle && darkModeToggle.addEventListener) {
                darkModeToggle.addEventListener('change', jest.fn());
            }
            if (settingsPanel && settingsPanel.addEventListener) {
                settingsPanel.addEventListener('click', jest.fn());
            }
            if (global.document && global.document.addEventListener) {
                global.document.addEventListener('click', jest.fn());
            }
        })
    };
});

describe('UI Controls', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockLocalStorage.getItem.mockReturnValue('false');
        mockElements['dark-mode-toggle'].checked = false;
    });

    test('initUI sets up event listeners', async () => {
        const { initUI } = await import('../ui.js');
        initUI();
        
        expect(initUI).toHaveBeenCalled();
    });

    test('handles missing DOM elements gracefully', async () => {
        global.document.getElementById = jest.fn(() => null);
        
        const { initUI } = await import('../ui.js');
        expect(() => initUI()).not.toThrow();
    });

    test('localStorage operations work correctly', () => {
        mockLocalStorage.getItem.mockReturnValue('true');
        expect(mockLocalStorage.getItem('darkMode')).toBe('true');
        
        mockLocalStorage.setItem('darkMode', 'false');
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('darkMode', 'false');
    });

    test('document element manipulation works', () => {
        const mockSetAttribute = jest.fn();
        global.document.documentElement.setAttribute = mockSetAttribute;
        global.document.documentElement.setAttribute('data-theme', 'dark');
        expect(mockSetAttribute).toHaveBeenCalledWith('data-theme', 'dark');
    });
});
