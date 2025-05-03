import { MemoryStorage } from '../MemoryStorage';
import { PointsState } from '../../core/types';

describe('MemoryStorage', () => {
  let storage: MemoryStorage;
  
  beforeEach(() => {
    // Create a new storage instance for each test
    storage = new MemoryStorage();
  });
  
  describe('savePoints', () => {
    it('should save points state to memory', async () => {
      // Arrange
      const state: PointsState = {
        currentPoints: 150,
        highScore: 500,
        lastUpdated: new Date('2025-01-01T12:00:00Z')
      };
      
      // Act
      await storage.savePoints(state);
      
      // Assert - verify by loading
      const loadedState = await storage.loadPoints();
      expect(loadedState.currentPoints).toBe(150);
      expect(loadedState.highScore).toBe(500);
      expect(loadedState.lastUpdated instanceof Date).toBe(true);
      expect(loadedState.lastUpdated.toISOString()).toBe('2025-01-01T12:00:00.000Z');
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
      
      // Verify state wasn't changed
      const loadedState = await storage.loadPoints();
      expect(loadedState.currentPoints).toBe(0); // Default value
    });
    
    it('should convert string date to Date object', async () => {
      // Arrange
      const state = {
        currentPoints: 150,
        highScore: 500,
        lastUpdated: '2025-01-01T12:00:00Z' // String date
      };
      
      // Act
      await storage.savePoints(state as any);
      
      // Assert
      const loadedState = await storage.loadPoints();
      expect(loadedState.lastUpdated instanceof Date).toBe(true);
    });
  });
  
  describe('loadPoints', () => {
    it('should load points state from memory', async () => {
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
    
    it('should return default state initially', async () => {
      // Act
      const loadedState = await storage.loadPoints();
      
      // Assert
      expect(loadedState.currentPoints).toBe(0);
      expect(loadedState.highScore).toBe(0);
      expect(loadedState.lastUpdated instanceof Date).toBe(true);
    });
    
    it('should return a copy of the state, not a reference', async () => {
      // Arrange
      const initialState: PointsState = {
        currentPoints: 150,
        highScore: 500,
        lastUpdated: new Date()
      };
      
      // Save initial state
      await storage.savePoints(initialState);
      
      // Act
      const loadedState = await storage.loadPoints();
      
      // Modify loaded state
      loadedState.currentPoints = 300;
      
      // Load again
      const reloadedState = await storage.loadPoints();
      
      // Assert
      expect(reloadedState.currentPoints).toBe(150); // Original value, not modified
    });
  });
  
  describe('clearPoints', () => {
    it('should clear points from memory', async () => {
      // Arrange
      const state: PointsState = {
        currentPoints: 150,
        highScore: 500,
        lastUpdated: new Date()
      };
      
      // Save initial state
      await storage.savePoints(state);
      
      // Verify initial state was saved
      let loadedState = await storage.loadPoints();
      expect(loadedState.currentPoints).toBe(150);
      
      // Act
      await storage.clearPoints();
      
      // Assert
      loadedState = await storage.loadPoints();
      expect(loadedState.currentPoints).toBe(0);
      expect(loadedState.highScore).toBe(0);
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
      // Mock the Date constructor to throw an error
      const originalDate = global.Date;
      const mockDateConstructor = jest.fn().mockImplementation((value) => {
        if (value === 'invalid-date') {
          throw new Error('Invalid date');
        }
        return new originalDate(value);
      });
      
      // Replace the Date constructor
      global.Date = mockDateConstructor as any;
      
      const invalidState = {
        currentPoints: 100,
        highScore: 500,
        lastUpdated: 'invalid-date'
      };
      
      // Act & Assert
      expect(() => {
        (storage as any).validateState(invalidState);
      }).toThrow('Last updated must be a valid Date or date string');
      
      // Restore the original Date constructor
      global.Date = originalDate;
    });
    
    it('should accept valid date strings', () => {
      // Arrange
      const validState = {
        currentPoints: 100,
        highScore: 500,
        lastUpdated: '2025-01-01T12:00:00Z'
      };
      
      // Act & Assert
      expect(() => {
        (storage as any).validateState(validState);
      }).not.toThrow();
    });
  });
});