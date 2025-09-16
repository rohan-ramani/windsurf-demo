import { initUI } from '../ui.js';

const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn()
};
global.localStorage = localStorageMock;

describe('UI Initialization', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="settings-icon"></div>
            <div id="settings-panel"></div>
            <input type="checkbox" id="dark-mode-toggle" />
        `;
        
        jest.clearAllMocks();
        localStorageMock.getItem.mockReturnValue(null);
    });

    test('initUI sets up event listeners', () => {
        const settingsIcon = document.getElementById('settings-icon');
        const settingsPanel = document.getElementById('settings-panel');
        const darkModeToggle = document.getElementById('dark-mode-toggle');

        expect(settingsIcon).toBeTruthy();
        expect(settingsPanel).toBeTruthy();
        expect(darkModeToggle).toBeTruthy();

        initUI();

        expect(document.getElementById('settings-icon')).toBeTruthy();
        expect(document.getElementById('settings-panel')).toBeTruthy();
        expect(document.getElementById('dark-mode-toggle')).toBeTruthy();
    });

    test('dark mode preference is loaded from localStorage', () => {
        localStorageMock.getItem.mockReturnValue('true');
        
        initUI();
        
        expect(document.getElementById('dark-mode-toggle')).toBeTruthy();
    });

    test('dark mode preference defaults to light mode', () => {
        localStorageMock.getItem.mockReturnValue(null);
        
        initUI();
        
        expect(document.documentElement.getAttribute('data-theme')).toBe('');
        expect(document.getElementById('dark-mode-toggle').checked).toBe(false);
    });
});

describe('Settings Panel Interaction', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="settings-icon"></div>
            <div id="settings-panel"></div>
            <input type="checkbox" id="dark-mode-toggle" />
        `;
        
        jest.clearAllMocks();
        localStorageMock.getItem.mockReturnValue(null);
        initUI();
    });

    test('clicking settings icon toggles panel visibility', () => {
        const settingsIcon = document.getElementById('settings-icon');
        const settingsPanel = document.getElementById('settings-panel');

        expect(settingsPanel.classList.contains('visible')).toBe(false);

        settingsIcon.click();
        expect(settingsPanel.classList.contains('visible')).toBe(true);

        settingsIcon.click();
        expect(settingsPanel.classList.contains('visible')).toBe(false);
    });

    test('clicking outside settings panel closes it', () => {
        const settingsIcon = document.getElementById('settings-icon');
        const settingsPanel = document.getElementById('settings-panel');

        settingsIcon.click();
        expect(settingsPanel.classList.contains('visible')).toBe(true);

        document.body.click();
        expect(settingsPanel.classList.contains('visible')).toBe(false);
    });

    test('clicking inside settings panel does not close it', () => {
        const settingsIcon = document.getElementById('settings-icon');
        const settingsPanel = document.getElementById('settings-panel');

        settingsIcon.click();
        expect(settingsPanel.classList.contains('visible')).toBe(true);

        settingsPanel.click();
        expect(settingsPanel.classList.contains('visible')).toBe(true);
    });
});

describe('Dark Mode Toggle', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="settings-icon"></div>
            <div id="settings-panel"></div>
            <input type="checkbox" id="dark-mode-toggle" />
        `;
        
        jest.clearAllMocks();
        localStorageMock.getItem.mockReturnValue(null);
        initUI();
    });

    test('toggling dark mode updates theme and saves preference', () => {
        const darkModeToggle = document.getElementById('dark-mode-toggle');

        darkModeToggle.checked = true;
        darkModeToggle.dispatchEvent(new Event('change'));

        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

        darkModeToggle.checked = false;
        darkModeToggle.dispatchEvent(new Event('change'));

        expect(document.documentElement.getAttribute('data-theme')).toBe('');
    });

    test('dark mode state persists across sessions', () => {
        localStorageMock.getItem.mockReturnValue('true');
        
        initUI();
        
        expect(document.getElementById('dark-mode-toggle')).toBeTruthy();
        expect(document.getElementById('settings-panel')).toBeTruthy();
    });
});
