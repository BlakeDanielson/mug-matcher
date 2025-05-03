import { LocalStorage } from '../LocalStorage';
import { PointsState, PointsError } from '../../core/types';

describe('LocalStorage', () => {
  let storage: LocalStorage;
  const testKey = 'test-points-storage';
  
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Create a new storage instance with test key
    storage = new LocalStorage(testKey);
  });
  
  describe('savePoints', () => {
    it('should save points state to localStorage', async () => {
      // Arrange
      const state: PointsState = {
        currentPoints: 150,
        highScore: 500,
        lastUpdated: new Date('2025-01-01T12:00:00Z')
      };
      
      // Act
      await storage.savePoints(state);
      
      // Assert
      const savedData = localStorage.getItem(testKey);
      expect(savedData).not.toBeNull();
      
      const parsedData = JSON.parse(savedData!);
      expect(parsedData.currentPoints).toBe(150);
      expect(parsedData.highScore).toBe(500);
      expect(parsedData.lastUpdated).toBe('2025-01-01T12:00:00.000Z');
    });
    
    it('should throw error for invalid state', async () => {
      // Arrange
      const invalidState = {
        currentPoints: 'not a number', // Invalid
        highScore: 500,
        lastUpdated: new Date()
      };
      
      // Act & Assert
      await expect(storage.savePoints(invalidState as any)).rejects.toThrow();
    });
    
    it('should validate state before saving', async () => {
      // Arrange
      const invalidState = {
        currentPoints: -10, // Invalid negative value
        highScore: 500,
        lastUpdated: new Date()
      };
      
      // Act & Assert
      await expect(storage.savePoints(invalidState as any)).rejects.toThrow();
      expect(localStorage.getItem(testKey)).toBeNull(); // Nothing should be saved
    });
  });
  
  describe('loadPoints', () => {
    it('should load points state from localStorage', async () => {
      // Arrange
      const initialState: PointsState = {
        currentPoints: 150,
        highScore: 500,
        lastUpdated: new Date('2025-01-01T12:00:00Z')
      };
      
      // Save initial state
      await storage.savePoints(initialState);
      
      // Act
      const loadedState = await storage.loadPoints();
      
      // Assert
      expect(loadedState.currentPoints).toBe(150);
      expect(loadedState.highScore).toBe(500);
      expect(loadedState.lastUpdated instanceof Date).toBe(true);
      expect(loadedState.lastUpdated.toISOString()).toBe('2025-01-01T12:00:00.000Z');
    });
    
    it('should return default state when no data exists', async () => {
      // Act
      const loadedState = await storage.loadPoints();
      
      // Assert
      expect(loadedState.currentPoints).toBe(0);
      expect(loadedState.highScore).toBe(0);
      expect(loadedState.lastUpdated instanceof Date).toBe(true);
    });
    
    it('should handle corrupted data by returning default state', async () => {
      // Arrange
      // Save corrupted data
      localStorage.setItem(testKey, 'not valid json');
      
      // Act
      const loadedState = await storage.loadPoints();
      
      // Assert
      expect(loadedState.currentPoints).toBe(0);
      expect(loadedState.highScore).toBe(0);
      expect(loadedState.lastUpdated instanceof Date).toBe(true);
      
      // Should clear corrupted data
      expect(localStorage.getItem(testKey)).toBeNull();
    });
    
    it('should validate loaded state', async () => {
      // Arrange
      // Save invalid state directly to localStorage
      localStorage.setItem(testKey, JSON.stringify({
        currentPoints: 'invalid',
        highScore: 500,
        lastUpdated: new Date().toISOString()
      }));
      
      // Act & Assert
      await expect(storage.loadPoints()).rejects.toThrow();
    });
  });
  
  describe('clearPoints', () => {
    it('should clear points from localStorage', async () => {
      // Arrange
      const state: PointsState = {
        currentPoints: 150,
        highScore: 500,
        lastUpdated: new Date()
      };
      
      // Save initial state
      await storage.savePoints(state);
      expect(localStorage.getItem(testKey)).not.toBeNull();
      
      // Act
      await storage.clearPoints();
      
      // Assert
      expect(localStorage.getItem(testKey)).toBeNull();
    });
  });
  
  describe('validateState', () => {
    it('should not throw for valid state', () => {
      // Arrange
      const validState: PointsState = {
        currentPoints: 150,
        highScore: 500,
        lastUpdated: new Date()
      };
      
      // Act & Assert
      expect(() => {
        (storage as any).validateState(validState);
      }).not.toThrow();
    });
    
    it('should throw for missing state', () => {
      // Act & Assert
      expect(() => {
        (storage as any).validateState(null);
      }).toThrow('Points state is required');
    });
    
    it('should throw for invalid currentPoints', () => {
      // Arrange
      const invalidStates = [
        { currentPoints: 'not a number', highScore: 500, lastUpdated: new Date() },
        { currentPoints: -10, highScore: 500, lastUpdated: new Date() },
        { currentPoints: 10.5, highScore: 500, lastUpdated: new Date() }
      ];
      
      // Act & Assert
      invalidStates.forEach(state => {
        expect(() => {
          (storage as any).validateState(state);
        }).toThrow('Current points must be a non-negative integer');
      });
    });
    
    it('should throw for invalid highScore', () => {
      // Arrange
      const invalidStates = [
        { currentPoints: 100, highScore: 'not a number', lastUpdated: new Date() },
        { currentPoints: 100, highScore: -10, lastUpdated: new Date() },
        { currentPoints: 100, highScore: 10.5, lastUpdated: new Date() }
      ];
      
      // Act & Assert
      invalidStates.forEach(state => {
        expect(() => {
          (storage as any).validateState(state);
        }).toThrow('High score must be a non-negative integer');
      });
    });
    
    it('should throw for invalid lastUpdated', () => {
      // Arrange
      const invalidState = {
        currentPoints: 100,
        highScore: 500,
        lastUpdated: {} // Object that's not a Date or string
      };
      
      // Act & Assert
      expect(() => {
        (storage as any).validateState(invalidState);
      }).toThrow('Last updated must be a Date or date string');
    });
  });
});