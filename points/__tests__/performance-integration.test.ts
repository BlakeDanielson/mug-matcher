import { PointsManager } from '../core/PointsManager';
import { LocalStorage } from '../storage/LocalStorage';
import { MemoryStorage } from '../storage/MemoryStorage';
import { MatchResult } from '../core/types';

describe('Points System Performance Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Auto-save Performance', () => {
    it('should handle frequent state changes with auto-save', async () => {
      const storage = new MemoryStorage();
      const saveSpy = jest.spyOn(storage, 'savePoints');
      
      const pointsManager = new PointsManager({
        storage: {
          autoSaveInterval: 1000,
          storageKey: 'test-autosave'
        }
      }, storage);

      await pointsManager.initialize();

      // Simulate rapid point accumulation
      for (let i = 0; i < 50; i++) {
        pointsManager.addPoints({
          correct: true,
          timeElapsed: 1000,
          attemptCount: 1
        });
      }

      // Fast-forward time to trigger auto-saves
      jest.advanceTimersByTime(5000);

      // Should have attempted ~5 auto-saves (5000ms / 1000ms interval)
      expect(saveSpy).toHaveBeenCalledTimes(5);

      await pointsManager.cleanup();
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle multiple async operations correctly', async () => {
      const storage = new MemoryStorage();
      const pointsManager = new PointsManager({
        storage: {
          autoSaveInterval: 30000,
          storageKey: 'test-concurrent'
        }
      }, storage);

      await pointsManager.initialize();

      // Simulate concurrent point additions and saves
      const operations = Array(10).fill(null).map(async () => {
        const points = pointsManager.addPoints({
          correct: true,
          timeElapsed: 1000,
          attemptCount: 1
        });
        await pointsManager.saveState();
        return points;
      });

      const results = await Promise.all(operations);
      
      // All operations should have completed successfully
      expect(results).toHaveLength(10);
      expect(pointsManager.currentPoints).toBe(results.reduce((a, b) => a + b, 0));

      await pointsManager.cleanup();
    });
  });

  describe('Load Testing', () => {
    it('should handle large number of operations efficiently', async () => {
      const storage = new MemoryStorage();
      const pointsManager = new PointsManager({
        storage: {
          autoSaveInterval: 30000,
          storageKey: 'test-load'
        }
      }, storage);

      await pointsManager.initialize();

      const startTime = performance.now();
      const operationCount = 1000;

      // Perform many point calculations
      for (let i = 0; i < operationCount; i++) {
        pointsManager.addPoints({
          correct: true,
          timeElapsed: Math.random() * 5000,
          attemptCount: Math.floor(Math.random() * 3) + 1
        });
      }

      const endTime = performance.now();
      const timePerOperation = (endTime - startTime) / operationCount;

      // Each operation should complete quickly (adjust threshold as needed)
      expect(timePerOperation).toBeLessThan(1); // Less than 1ms per operation

      await pointsManager.cleanup();
    });

    it('should maintain performance with large state history', async () => {
      const storage = new MemoryStorage();
      const pointsManager = new PointsManager({
        storage: {
          autoSaveInterval: 30000,
          storageKey: 'test-history'
        }
      }, storage);

      await pointsManager.initialize();

      // Build up large history
      for (let i = 0; i < 1000; i++) {
        pointsManager.addPoints({
          correct: true,
          timeElapsed: 1000,
          attemptCount: 1
        });
        if (i % 100 === 0) {
          await pointsManager.saveState();
        }
      }

      // Measure performance of operations with large history
      const startTime = performance.now();
      
      // Test typical operations
      pointsManager.addPoints({ correct: true, timeElapsed: 1000, attemptCount: 1 });
      await pointsManager.saveState();
      await pointsManager.loadSavedState();
      
      const endTime = performance.now();
      
      // Operations should complete quickly even with large history
      expect(endTime - startTime).toBeLessThan(100); // Less than 100ms total

      await pointsManager.cleanup();
    });
  });
});