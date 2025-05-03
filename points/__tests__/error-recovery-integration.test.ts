import { PointsManager } from '../core/PointsManager';
import { LocalStorage } from '../storage/LocalStorage';
import { MemoryStorage } from '../storage/MemoryStorage';
import { PointsStorage } from '../storage/PointsStorage';
import { PointsState, PointsError } from '../core/types';

class UnreliableStorage implements PointsStorage {
  private storage: PointsStorage;
  private failureRate: number;
  private failureCount: number = 0;
  private networkDelay: number;

  constructor(baseStorage: PointsStorage, failureRate: number = 0.5, networkDelay: number = 1) {
    this.storage = baseStorage;
    this.failureRate = failureRate;
    this.networkDelay = networkDelay;
  }

  private shouldFail(): boolean {
    this.failureCount++;
    return Math.random() < this.failureRate;
  }

  private simulateNetworkDelay(): void {
    // Synchronous delay using a busy wait
    const start = Date.now();
    while (Date.now() - start < this.networkDelay) {
      // Busy wait
    }
  }

  async savePoints(state: PointsState): Promise<void> {
    this.simulateNetworkDelay();
    if (this.shouldFail()) {
      throw new Error('Network error during save');
    }
    return this.storage.savePoints(state);
  }

  async loadPoints(): Promise<PointsState> {
    this.simulateNetworkDelay();
    if (this.shouldFail()) {
      throw new Error('Network error during load');
    }
    return this.storage.loadPoints();
  }

  async clearPoints(): Promise<void> {
    this.simulateNetworkDelay();
    if (this.shouldFail()) {
      throw new Error('Network error during clear');
    }
    return this.storage.clearPoints();
  }

  getFailureCount(): number {
    return this.failureCount;
  }
}

// No need for extended timeout with synchronous delays

describe('Points System Error Recovery Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Network Failure Recovery', () => {
    it('should handle intermittent storage failures', async () => {
      const baseStorage = new MemoryStorage();
      const unreliableStorage = new UnreliableStorage(baseStorage, 0.5);
      const pointsManager = new PointsManager({
        storage: {
          autoSaveInterval: 1000,
          storageKey: 'test-network'
        }
      }, unreliableStorage);

      await pointsManager.initialize();

      // Perform multiple operations with potential failures
      const operations = Array(10).fill(null).map(async () => {
        try {
          const points = pointsManager.addPoints({
            correct: true,
            timeElapsed: 1000,
            attemptCount: 1
          });
          await pointsManager.saveState();
          return { success: true, points };
        } catch (error) {
          return { success: false, error };
        }
      });

      const results = await Promise.all(operations);
      
      // Some operations should succeed despite failures
      expect(results.some(r => r.success)).toBe(true);
      expect(unreliableStorage.getFailureCount()).toBeGreaterThan(0);

      await pointsManager.cleanup();
    });

    it('should recover from complete storage failure', async () => {
      const baseStorage = new MemoryStorage();
      const unreliableStorage = new UnreliableStorage(baseStorage, 1.0); // 100% failure rate
      const pointsManager = new PointsManager({
        storage: {
          autoSaveInterval: 1000,
          storageKey: 'test-recovery'
        }
      }, unreliableStorage);

      // Should initialize even with storage failure
      await pointsManager.initialize();
      expect(pointsManager.currentPoints).toBe(0);

      // Should continue working in memory
      const points = pointsManager.addPoints({
        correct: true,
        timeElapsed: 1000,
        attemptCount: 1
      });

      expect(points).toBeGreaterThan(0);
      expect(pointsManager.currentPoints).toBe(points);

      // Cleanup should not throw despite storage failure
      await expect(pointsManager.cleanup()).resolves.not.toThrow();
    });
  });

  describe('Data Corruption Recovery', () => {
    it('should handle corrupted storage data', async () => {
      const storageKey = 'test-corruption';
      const localStorage = new LocalStorage(storageKey);
      
      // Set up initial valid state
      const pointsManager = new PointsManager({
        storage: {
          autoSaveInterval: 30000,
          storageKey
        }
      }, localStorage);

      await pointsManager.initialize();
      pointsManager.addPoints({ correct: true, timeElapsed: 1000, attemptCount: 1 });
      await pointsManager.saveState();

      // Corrupt the stored data
      window.localStorage.setItem(storageKey, 'corrupted{data:123');

      // Create new manager to load corrupted data
      const newManager = new PointsManager({
        storage: {
          autoSaveInterval: 30000,
          storageKey
        }
      }, localStorage);

      // Should recover with default state
      await newManager.initialize();
      expect(newManager.currentPoints).toBe(0);
      expect(newManager.highScore).toBe(0);

      // Should be able to continue operating
      const points = newManager.addPoints({
        correct: true,
        timeElapsed: 1000,
        attemptCount: 1
      });
      expect(points).toBeGreaterThan(0);

      await newManager.cleanup();
    });

    it('should handle partial data corruption', async () => {
      const storageKey = 'test-partial-corruption';
      const localStorage = new LocalStorage(storageKey);
      
      // Set up initial state
      const pointsManager = new PointsManager({
        storage: {
          autoSaveInterval: 30000,
          storageKey
        }
      }, localStorage);

      await pointsManager.initialize();
      pointsManager.addPoints({ correct: true, timeElapsed: 1000, attemptCount: 1 });
      await pointsManager.saveState();

      // Partially corrupt the data (invalid lastUpdated)
      const data = JSON.parse(window.localStorage.getItem(storageKey) || '{}');
      data.lastUpdated = 'invalid-date';
      window.localStorage.setItem(storageKey, JSON.stringify(data));

      // Create new manager to load partially corrupted data
      const newManager = new PointsManager({
        storage: {
          autoSaveInterval: 30000,
          storageKey
        }
      }, localStorage);

      // Should recover with default state
      await newManager.initialize();
      // With partial corruption, should reset to default state
      expect(newManager.currentPoints).toBe(0);

      await newManager.cleanup();
    });
  });

  describe('Error Propagation', () => {
    it('should properly propagate storage errors', async () => {
      const failingStorage = {
        savePoints: jest.fn().mockRejectedValue(new Error('Storage unavailable')),
        loadPoints: jest.fn().mockRejectedValue(new Error('Storage unavailable')),
        clearPoints: jest.fn().mockRejectedValue(new Error('Storage unavailable'))
      };

      const pointsManager = new PointsManager({
        storage: {
          autoSaveInterval: 30000,
          storageKey: 'test-errors'
        }
      }, failingStorage as any);

      // Initialize should not throw
      await expect(pointsManager.initialize()).resolves.not.toThrow();

      // Save should throw storage error
      let error: any;
      try {
        await pointsManager.saveState();
      } catch (e) {
        error = e;
      }
      expect(error).toBeDefined();
      expect(error.code).toBe(PointsError.STORAGE_ERROR);
      expect(error.message).toMatch(/storage unavailable/i);

      // Operations should still work in memory
      expect(() => pointsManager.addPoints({
        correct: true,
        timeElapsed: 1000,
        attemptCount: 1
      })).not.toThrow();

      await pointsManager.cleanup();
    });
  });
});