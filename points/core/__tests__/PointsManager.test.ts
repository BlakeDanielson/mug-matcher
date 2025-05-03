import { PointsManager } from '../PointsManager';
import { PointsStorage } from '../../storage/PointsStorage';
import { MatchResult, PointsState, PointsConfig } from '../types';

// Mock the PointsStorage implementation
class MockStorage implements PointsStorage {
  private state: PointsState = {
    currentPoints: 0,
    highScore: 0,
    lastUpdated: new Date()
  };
  
  public saveCount = 0;
  public loadCount = 0;
  public clearCount = 0;
  public shouldFail = false;
  
  async savePoints(state: PointsState): Promise<void> {
    this.saveCount++;
    if (this.shouldFail) {
      throw new Error('Mock storage save failure');
    }
    this.state = { ...state };
  }
  
  async loadPoints(): Promise<PointsState> {
    this.loadCount++;
    if (this.shouldFail) {
      throw new Error('Mock storage load failure');
    }
    return { ...this.state };
  }
  
  async clearPoints(): Promise<void> {
    this.clearCount++;
    if (this.shouldFail) {
      throw new Error('Mock storage clear failure');
    }
    this.state = {
      currentPoints: 0,
      highScore: 0,
      lastUpdated: new Date()
    };
  }
  
  // Helper to set initial state for testing
  setInitialState(state: PointsState): void {
    this.state = { ...state };
  }
}

describe('PointsManager', () => {
  let pointsManager: PointsManager;
  let mockStorage: MockStorage;
  
  beforeEach(() => {
    // Create a new mock storage for each test
    mockStorage = new MockStorage();
    
    // Create a new points manager with the mock storage
    pointsManager = new PointsManager({}, mockStorage);
    
    // Reset the window mock
    jest.clearAllMocks();
  });
  
  describe('initialization', () => {
    it('should initialize with default values', () => {
      expect(pointsManager.currentPoints).toBe(0);
      expect(pointsManager.highScore).toBe(0);
    });
    
    it('should load saved state on initialization', async () => {
      // Arrange
      mockStorage.setInitialState({
        currentPoints: 100,
        highScore: 500,
        lastUpdated: new Date()
      });
      
      // Act
      await pointsManager.initialize();
      
      // Assert
      expect(pointsManager.currentPoints).toBe(100);
      expect(pointsManager.highScore).toBe(500);
      expect(mockStorage.loadCount).toBe(1);
    });
    
    it('should handle storage errors during initialization', async () => {
      // Arrange
      mockStorage.shouldFail = true;
      
      // Act
      await pointsManager.initialize();
      
      // Assert
      expect(pointsManager.currentPoints).toBe(0);
      expect(pointsManager.highScore).toBe(0);
      // Should not throw, just log warning and use defaults
    });
    
    it('should start auto-save interval on initialization', async () => {
      // Act
      await pointsManager.initialize();
      
      // Assert
      expect(global.setInterval).toHaveBeenCalled();
    });
  });
  
  describe('addPoints', () => {
    it('should add points for correct match', () => {
      // Arrange
      const matchResult: MatchResult = {
        correct: true,
        timeElapsed: 3000,
        attemptCount: 1
      };
      
      // Act
      const pointsEarned = pointsManager.addPoints(matchResult);
      
      // Assert
      expect(pointsEarned).toBe(150); // Base (100) + time bonus (50)
      expect(pointsManager.currentPoints).toBe(150);
    });
    
    it('should update high score when current points exceed it', () => {
      // Arrange
      const matchResult1: MatchResult = {
        correct: true,
        timeElapsed: 3000,
        attemptCount: 1
      };
      
      const matchResult2: MatchResult = {
        correct: true,
        timeElapsed: 3000,
        attemptCount: 1
      };
      
      // Act
      pointsManager.addPoints(matchResult1); // 150 points
      pointsManager.addPoints(matchResult2); // Another 150 points
      
      // Assert
      expect(pointsManager.currentPoints).toBe(300);
      expect(pointsManager.highScore).toBe(300);
    });
    
    it('should not update high score when current points are lower', async () => {
      // Arrange
      mockStorage.setInitialState({
        currentPoints: 0,
        highScore: 500,
        lastUpdated: new Date()
      });
      await pointsManager.initialize();
      
      const matchResult: MatchResult = {
        correct: true,
        timeElapsed: 3000,
        attemptCount: 1
      };
      
      // Act
      pointsManager.addPoints(matchResult); // 150 points
      
      // Assert
      expect(pointsManager.currentPoints).toBe(150);
      expect(pointsManager.highScore).toBe(500); // Unchanged
    });
    
    it('should handle calculation errors', () => {
      // Arrange
      const invalidMatchResult: MatchResult = {
        correct: true,
        timeElapsed: -1000, // Invalid
        attemptCount: 1
      };
      
      // Act & Assert
      expect(() => {
        pointsManager.addPoints(invalidMatchResult);
      }).toThrow();
    });
  });
  
  describe('resetSession', () => {
    it('should reset current points to zero', () => {
      // Arrange
      const matchResult: MatchResult = {
        correct: true,
        timeElapsed: 3000,
        attemptCount: 1
      };
      pointsManager.addPoints(matchResult); // 150 points
      
      // Act
      pointsManager.resetSession();
      
      // Assert
      expect(pointsManager.currentPoints).toBe(0);
    });
    
    it('should not reset high score', () => {
      // Arrange
      const matchResult: MatchResult = {
        correct: true,
        timeElapsed: 3000,
        attemptCount: 1
      };
      pointsManager.addPoints(matchResult); // 150 points
      
      // Act
      pointsManager.resetSession();
      
      // Assert
      expect(pointsManager.highScore).toBe(150); // Unchanged
    });
  });
  
  describe('saveState', () => {
    it('should save current state to storage', async () => {
      // Arrange
      const matchResult: MatchResult = {
        correct: true,
        timeElapsed: 3000,
        attemptCount: 1
      };
      pointsManager.addPoints(matchResult); // 150 points
      
      // Act
      await pointsManager.saveState();
      
      // Assert
      expect(mockStorage.saveCount).toBe(1);
      
      // Verify saved state by loading it back
      mockStorage.loadCount = 0; // Reset counter
      await pointsManager.loadSavedState();
      expect(pointsManager.currentPoints).toBe(150);
      expect(pointsManager.highScore).toBe(150);
    });
    
    it('should handle storage errors during save', async () => {
      // Arrange
      mockStorage.shouldFail = true;
      
      // Act & Assert
      await expect(pointsManager.saveState()).rejects.toThrow();
    });
  });
  
  describe('loadSavedState', () => {
    it('should load state from storage', async () => {
      // Arrange
      mockStorage.setInitialState({
        currentPoints: 200,
        highScore: 600,
        lastUpdated: new Date()
      });
      
      // Act
      await pointsManager.loadSavedState();
      
      // Assert
      expect(pointsManager.currentPoints).toBe(200);
      expect(pointsManager.highScore).toBe(600);
    });
    
    it('should handle storage errors during load', async () => {
      // Arrange
      mockStorage.shouldFail = true;
      
      // Act
      await pointsManager.loadSavedState();
      
      // Assert
      expect(pointsManager.currentPoints).toBe(0);
      expect(pointsManager.highScore).toBe(0);
      // Should not throw, just log warning and use defaults
    });
  });
  
  describe('clearAllData', () => {
    it('should clear storage and reset points', async () => {
      // Arrange
      const matchResult: MatchResult = {
        correct: true,
        timeElapsed: 3000,
        attemptCount: 1
      };
      pointsManager.addPoints(matchResult); // 150 points
      
      // Act
      await pointsManager.clearAllData();
      
      // Assert
      expect(mockStorage.clearCount).toBe(1);
      expect(pointsManager.currentPoints).toBe(0);
      expect(pointsManager.highScore).toBe(0);
    });
    
    it('should handle storage errors during clear', async () => {
      // Arrange
      mockStorage.shouldFail = true;
      
      // Act & Assert
      await expect(pointsManager.clearAllData()).rejects.toThrow();
    });
  });
  
  describe('cleanup', () => {
    it('should stop auto-save interval and save state', async () => {
      // Arrange
      await pointsManager.initialize(); // Start auto-save
      
      // Act
      await pointsManager.cleanup();
      
      // Assert
      expect(global.clearInterval).toHaveBeenCalled();
      expect(mockStorage.saveCount).toBe(1);
    });
    
    it('should handle storage errors during cleanup', async () => {
      // Arrange
      await pointsManager.initialize(); // Start auto-save
      mockStorage.shouldFail = true;
      
      // Act
      await pointsManager.cleanup();
      
      // Assert
      expect(global.clearInterval).toHaveBeenCalled();
      // Should not throw, just log warning
    });
  });
  
  describe('custom configuration', () => {
    it('should use custom configuration', () => {
      // Arrange
      const customConfig: Partial<PointsConfig> = {
        scoring: {
          basePoints: 200,
          timeBonus: 100,
          timeBonusThreshold: 2000,
          attemptPenalty: 10
        }
      };
      
      const customManager = new PointsManager(customConfig, mockStorage);
      
      const matchResult: MatchResult = {
        correct: true,
        timeElapsed: 1500, // Below custom threshold
        attemptCount: 1
      };
      
      // Act
      const pointsEarned = customManager.addPoints(matchResult);
      
      // Assert
      expect(pointsEarned).toBe(300); // Custom base (200) + custom time bonus (100)
    });
    
    it('should use custom auto-save interval', async () => {
      // Arrange
      const customConfig: Partial<PointsConfig> = {
        storage: {
          autoSaveInterval: 60000, // 1 minute
          storageKey: 'custom-key'
        }
      };
      
      const customManager = new PointsManager(customConfig, mockStorage);
      
      // Act
      await customManager.initialize();
      
      // Assert
      expect(global.setInterval).toHaveBeenCalledWith(
        expect.any(Function),
        60000
      );
    });
  });
});