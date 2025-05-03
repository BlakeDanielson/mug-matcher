// Import jest-dom for DOM element assertions
require('@testing-library/jest-dom');

// Mock localStorage
class LocalStorageMock {
  constructor() {
    this.store = {};
  }

  clear() {
    this.store = {};
  }

  getItem(key) {
    return this.store[key] || null;
  }

  setItem(key, value) {
    this.store[key] = String(value);
  }

  removeItem(key) {
    delete this.store[key];
  }
}

// Set up localStorage mock
global.localStorage = new LocalStorageMock();

// Mock window.setInterval and window.clearInterval
global.setInterval = jest.fn((callback, interval) => {
  return 123; // Mock interval ID
});

global.clearInterval = jest.fn();

// Mock console.warn to avoid cluttering test output
global.console.warn = jest.fn();