import { PointsManager } from '../core/PointsManager';
import { PointsCalculator } from '../core/PointsCalculator';
import { LocalStorage } from '../storage/LocalStorage';
import { MemoryStorage } from '../storage/MemoryStorage';
import { MatchResult, PointsState, PointsConfig } from '../core/types';

describe('Points System Integration Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Reset mocks
    jest.clearAllMocks();
  });
  
  describe('Game Component Integration', () => {
    it('should handle a complete game flow', async () => {
      // Arrange
      const storage = new MemoryStorage();
      const pointsManager = new PointsManager({}, storage);
      
      // Initialize points system
      await pointsManager.initialize();
      
      // Simulate multiple match results
      const matchResults: MatchResult[] = [
        { correct: true, timeElapsed: 3000, attemptCount: 1 }, // 150 points (base + time bonus)
        { correct: false, timeElapsed: 4000, attemptCount: 2 }, // 0 points (incorrect)
        { correct: true, timeElapsed: 6000, attemptCount: 3 }, // 50 points (base - penalties)
        { correct: true, timeElapsed: 2000, attemptCount: 1 }  // 150 points (base + time bonus)
      ];
      
      // Act - Process match results
      let totalPointsEarned = 0;
      for (const result of matchResults) {
        const pointsEarned = pointsManager.addPoints(result);
        totalPointsEarned += pointsEarned;
      }
      
      // Save state
      await pointsManager.saveState();
      
      // Assert
      expect(totalPointsEarned).toBe(350); // Sum of all points earned
      expect(pointsManager.currentPoints).toBe(350); // Current points
      expect(pointsManager.highScore).toBe(350); // High score should match current points
      
      // Reset session
      pointsManager.resetSession();
      
      // Verify reset
      expect(pointsManager.currentPoints).toBe(0); // Reset to 0
      expect(pointsManager.highScore).toBe(350); // High score should be preserved
      
      // Cleanup
      await pointsManager.cleanup();
    });
    
    it('should persist high score across sessions', async () => {
      // Arrange
      const storageKey = 'test-persistence';
      const localStorage = new LocalStorage(storageKey);
      
      // First session
      const firstSession = new PointsManager({
        storage: {
          storageKey,
          autoSaveInterval: 30000
        }
      }, localStorage);
      
      await firstSession.initialize();
      
      // Add points in first session
      firstSession.addPoints({ correct: true, timeElapsed: 3000, attemptCount: 1 }); // 150 points
      await firstSession.saveState();
      await firstSession.cleanup();
      
      // Second session
      const secondSession = new PointsManager({
        storage: {
          storageKey,
          autoSaveInterval: 30000
        }
      }, localStorage);
      
      // Act
      await secondSession.initialize();
      
      // Assert initial state after loading
      expect(secondSession.currentPoints).toBe(150); // Loaded from first session
      expect(secondSession.highScore).toBe(150); // High score from previous session
      
      // Add more points in second session
      secondSession.addPoints({ correct: true, timeElapsed: 4000, attemptCount: 2 }); // 75 points
      
      // Assert after adding points
      expect(secondSession.currentPoints).toBe(275); // 150 + 125 (base + time bonus)
      expect(secondSession.highScore).toBe(275); // Updated high score
      
      // Cleanup
      await secondSession.cleanup();
    });
  });
  
  describe('Storage Fallback', () => {
    it('should fall back to MemoryStorage when LocalStorage is unavailable', async () => {
      // Arrange
      // Mock localStorage to be unavailable
      const originalLocalStorage = global.localStorage;
      // @ts-ignore - intentionally setting to undefined for testing
      global.localStorage = undefined;
      
      // Create points manager without explicit storage
      const pointsManager = new PointsManager();
      
      // Act
      await pointsManager.initialize();
      
      // Add points
      pointsManager.addPoints({ correct: true, timeElapsed: 3000, attemptCount: 1 }); // 150 points
      
      // Save state
      await pointsManager.saveState();
      
      // Assert
      expect(pointsManager.currentPoints).toBe(150); // Points added
      expect(pointsManager.highScore).toBe(150); // High score should match
      
      // Reset session
      pointsManager.resetSession();
      
      // Assert after reset
      expect(pointsManager.currentPoints).toBe(0); // Reset to 0
      expect(pointsManager.highScore).toBe(150); // High score should be preserved in memory
      
      // Cleanup
      await pointsManager.cleanup();
      global.localStorage = originalLocalStorage;
    });
  });
  
  describe('Configuration Integration', () => {
    it('should apply custom configuration across components', async () => {
      // Arrange
      const customConfig: Partial<PointsConfig> = {
        scoring: {
          basePoints: 200,
          timeBonus: 100,
          timeBonusThreshold: 2000,
          attemptPenalty: 50
        },
        storage: {
          autoSaveInterval: 60000,
          storageKey: 'custom-storage-key'
        }
      };
      
      const storage = new MemoryStorage();
      const pointsManager = new PointsManager(customConfig, storage);
      
      // Act
      await pointsManager.initialize();
      
      // Test with custom scoring rules
      const quickMatch: MatchResult = {
        correct: true,
        timeElapsed: 1500, // Below custom threshold
        attemptCount: 1
      };
      
      const slowMatch: MatchResult = {
        correct: true,
        timeElapsed: 3000, // Above custom threshold
        attemptCount: 2 // 1 additional attempt
      };
      
      const quickPoints = pointsManager.addPoints(quickMatch);
      const slowPoints = pointsManager.addPoints(slowMatch);
      
      // Assert
      expect(quickPoints).toBe(300); // Custom base (200) + custom time bonus (100)
      expect(slowPoints).toBe(150); // Custom base (200) - custom penalty (50)
      expect(pointsManager.currentPoints).toBe(450); // Sum of both
      
      // Verify auto-save interval
      expect(global.setInterval).toHaveBeenCalledWith(
        expect.any(Function),
        60000
      );
      
      // Cleanup
      await pointsManager.cleanup();
    });
  });
  
  describe('Error Handling Integration', () => {
    it('should handle storage errors gracefully', async () => {
      // Arrange
      // Create a failing storage implementation
      const failingStorage = {
        savePoints: jest.fn().mockRejectedValue(new Error('Storage failure')),
        loadPoints: jest.fn().mockRejectedValue(new Error('Storage failure')),
        clearPoints: jest.fn().mockRejectedValue(new Error('Storage failure'))
      };
      
      const pointsManager = new PointsManager({}, failingStorage as any);
      
      // Act & Assert - Initialize should not throw
      await pointsManager.initialize();
      expect(pointsManager.currentPoints).toBe(0);
      expect(pointsManager.highScore).toBe(0);
      
      // Add points should work
      const pointsEarned = pointsManager.addPoints({
        correct: true,
        timeElapsed: 3000,
        attemptCount: 1
      });
      expect(pointsEarned).toBe(150);
      
      // Save should throw
      await expect(pointsManager.saveState()).rejects.toThrow();
      
      // Clear should throw
      await expect(pointsManager.clearAllData()).rejects.toThrow();
      
      // Cleanup should not throw
      await pointsManager.cleanup();
    });
  });
  
  describe('UI Updates Integration', () => {
    it('should update UI when points change', async () => {
      // Arrange
      const mockUpdateUI = jest.fn();
      
      // Create a custom event listener
      const eventListener = (event: Event) => {
        if (event instanceof CustomEvent && event.type === 'pointsUpdated') {
          mockUpdateUI(event.detail);
        }
      };
      
      // Add event listener
      window.addEventListener('pointsUpdated', eventListener);
      
      // Create a points manager that dispatches events
      class EventDispatchingManager extends PointsManager {
        addPoints(matchResult: MatchResult): number {
          const pointsEarned = super.addPoints(matchResult);
          
          // Dispatch custom event
          const event = new CustomEvent('pointsUpdated', {
            detail: {
              currentPoints: this.currentPoints,
              highScore: this.highScore,
              pointsEarned
            }
          });
          window.dispatchEvent(event);
          
          return pointsEarned;
        }
      }
      
      const pointsManager = new EventDispatchingManager();
      
      // Act
      await pointsManager.initialize();
      
      // Add points to trigger event
      pointsManager.addPoints({
        correct: true,
        timeElapsed: 3000,
        attemptCount: 1
      });
      
      // Assert
      expect(mockUpdateUI).toHaveBeenCalledWith({
        currentPoints: 150,
        highScore: 150,
        pointsEarned: 150
      });
      
      // Cleanup
      window.removeEventListener('pointsUpdated', eventListener);
      await pointsManager.cleanup();
    });
  });
});