import { PointsManager } from '../core/PointsManager';
import { LocalStorage } from '../storage/LocalStorage';
import { MatchResult, PointsState } from '../core/types';

describe('Points System Security Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('Data Validation', () => {
    it('should reject invalid match results', () => {
      const pointsManager = new PointsManager({
        scoring: {
          basePoints: 100,
          timeBonus: 50,
          timeBonusThreshold: 5000,
          attemptPenalty: 25
        }
      });
      
      const invalidResults: MatchResult[] = [
        { correct: true, timeElapsed: -1000, attemptCount: 1 },
        { correct: true, timeElapsed: 1000, attemptCount: -1 },
        { correct: true, timeElapsed: NaN, attemptCount: 1 },
        { correct: true, timeElapsed: 1000, attemptCount: NaN },
        { correct: 'true' as any, timeElapsed: 1000, attemptCount: 1 }
      ];

      // Each invalid result should throw appropriate validation error
      invalidResults.forEach(result => {
        expect(() => pointsManager.addPoints(result)).toThrow(/failed to add points/i);
      });
    });

    it('should prevent points tampering via direct storage modification', async () => {
      const storageKey = 'test-tampering';
      const localStorage = new LocalStorage(storageKey);
      const pointsManager = new PointsManager({
        storage: {
          storageKey,
          autoSaveInterval: 30000
        }
      }, localStorage);

      // Initialize with legitimate points
      await pointsManager.initialize();
      pointsManager.addPoints({ correct: true, timeElapsed: 3000, attemptCount: 1 }); // 150 points
      await pointsManager.saveState();

      // Attempt to tamper with stored data
      const tampered: PointsState = {
        currentPoints: 999999,
        highScore: 999999,
        lastUpdated: new Date()
      };
      window.localStorage.setItem(storageKey, JSON.stringify(tampered));

      // Create new manager to load tampered data
      const newManager = new PointsManager({
        storage: {
          storageKey,
          autoSaveInterval: 30000
        }
      }, localStorage);
      await newManager.initialize();

      // Verify points were not tampered - should reset to 0 on invalid data
      expect(newManager.currentPoints).toBe(0);
      expect(newManager.highScore).toBe(0);
    });

    it('should handle malformed storage data', async () => {
      const storageKey = 'test-malformed';
      const localStorage = new LocalStorage(storageKey);
      const pointsManager = new PointsManager({
        storage: {
          storageKey,
          autoSaveInterval: 30000
        }
      }, localStorage);

      // Set malformed data
      window.localStorage.setItem(storageKey, 'not valid json');

      // Should initialize with default values
      await pointsManager.initialize();
      expect(pointsManager.currentPoints).toBe(0);
      expect(pointsManager.highScore).toBe(0);
    });
  });

  describe('Rate Limiting', () => {
    it('should prevent rapid point accumulation', async () => {
      const pointsManager = new PointsManager();
      await pointsManager.initialize();

      const startTime = Date.now();
      let totalPoints = 0;
      let attempts = 0;

      // Try to accumulate points rapidly
      while (Date.now() - startTime < 1000 && attempts < 100) {
        const points = pointsManager.addPoints({
          correct: true,
          timeElapsed: 1000,
          attemptCount: 1
        });
        totalPoints += points;
        attempts++;
      }

      // Each attempt should earn max 150 points (100 base + 50 time bonus)
      // With rate limiting, should earn significantly less
      const maxPointsPerAttempt = 150;
      const rateLimit = 0.5; // Expected rate limiting factor
      // With 100 attempts at 150 points each, total should be significantly less than maximum possible
      const maxPossiblePoints = attempts * maxPointsPerAttempt;
      expect(totalPoints).toBeLessThan(maxPossiblePoints * 0.75); // Should earn less than 75% of max possible
    });
  });
});