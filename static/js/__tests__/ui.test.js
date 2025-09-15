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
    getElementById: jest.fn((id) => mockElements[id]),
    addEventListener: jest.fn(),
    documentElement: { setAttribute: jest.fn() }
};

describe('UI Controls', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockLocalStorage.getItem.mockReturnValue('false');
        mockElements['dark-mode-toggle'].checked = false;
    });

    test('initUI sets up event listeners', async () => {
        const { initUI } = await import('../ui.js');
        initUI();
        
        expect(mockElements['settings-icon'].addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
        expect(mockElements['dark-mode-toggle'].addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
        expect(global.document.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
        expect(mockElements['settings-panel'].addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    });

    test('loads dark mode preference from localStorage', async () => {
        mockLocalStorage.getItem.mockReturnValue('true');
        const { initUI } = await import('../ui.js');
        initUI();
        
        expect(mockLocalStorage.getItem).toHaveBeenCalledWith('darkMode');
        expect(global.document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
        expect(mockElements['dark-mode-toggle'].checked).toBe(true);
    });

    test('saves dark mode preference when toggled', async () => {
        const { initUI } = await import('../ui.js');
        initUI();
        
        // Simulate dark mode toggle event
        const changeHandler = mockElements['dark-mode-toggle'].addEventListener.mock.calls
            .find(call => call[0] === 'change')[1];
        
        changeHandler({ target: { checked: true } });
        
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('darkMode', true);
        expect(global.document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
    });

    test('toggles settings panel visibility', async () => {
        const { initUI } = await import('../ui.js');
        initUI();
        
        // Simulate settings icon click
        const clickHandler = mockElements['settings-icon'].addEventListener.mock.calls
            .find(call => call[0] === 'click')[1];
        
        const mockEvent = { stopPropagation: jest.fn() };
        clickHandler(mockEvent);
        
        expect(mockEvent.stopPropagation).toHaveBeenCalled();
        expect(mockElements['settings-panel'].classList.toggle).toHaveBeenCalledWith('visible');
    });
});
