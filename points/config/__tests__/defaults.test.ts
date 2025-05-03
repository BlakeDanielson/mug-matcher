import { 
  DEFAULT_CONFIG, 
  SCORING_CONSTANTS, 
  getScoreLevel, 
  formatPoints 
} from '../defaults';

describe('Default Configuration', () => {
  describe('DEFAULT_CONFIG', () => {
    it('should have valid scoring configuration', () => {
      // Assert
      expect(DEFAULT_CONFIG.scoring).toBeDefined();
      expect(typeof DEFAULT_CONFIG.scoring.basePoints).toBe('number');
      expect(DEFAULT_CONFIG.scoring.basePoints).toBeGreaterThan(0);
      
      expect(typeof DEFAULT_CONFIG.scoring.timeBonus).toBe('number');
      expect(DEFAULT_CONFIG.scoring.timeBonus).toBeGreaterThanOrEqual(0);
      
      expect(typeof DEFAULT_CONFIG.scoring.timeBonusThreshold).toBe('number');
      expect(DEFAULT_CONFIG.scoring.timeBonusThreshold).toBeGreaterThan(0);
      
      expect(typeof DEFAULT_CONFIG.scoring.attemptPenalty).toBe('number');
      expect(DEFAULT_CONFIG.scoring.attemptPenalty).toBeGreaterThanOrEqual(0);
    });
    
    it('should have valid storage configuration', () => {
      // Assert
      expect(DEFAULT_CONFIG.storage).toBeDefined();
      expect(typeof DEFAULT_CONFIG.storage.autoSaveInterval).toBe('number');
      expect(DEFAULT_CONFIG.storage.autoSaveInterval).toBeGreaterThanOrEqual(0);
      
      expect(typeof DEFAULT_CONFIG.storage.storageKey).toBe('string');
      expect(DEFAULT_CONFIG.storage.storageKey.length).toBeGreaterThan(0);
    });
    
    it('should have valid display configuration', () => {
      // Assert
      expect(DEFAULT_CONFIG.display).toBeDefined();
      expect(typeof DEFAULT_CONFIG.display.animationDuration).toBe('number');
      expect(DEFAULT_CONFIG.display.animationDuration).toBeGreaterThanOrEqual(0);
      
      expect(typeof DEFAULT_CONFIG.display.errorTimeout).toBe('number');
      expect(DEFAULT_CONFIG.display.errorTimeout).toBeGreaterThanOrEqual(0);
    });
  });
  
  describe('SCORING_CONSTANTS', () => {
    it('should define score levels', () => {
      // Assert
      expect(SCORING_CONSTANTS).toBeDefined();
      expect(SCORING_CONSTANTS.SCORE_LEVELS).toBeDefined();
      expect(typeof SCORING_CONSTANTS.SCORE_LEVELS).toBe('object');
      
      // Check score levels
      expect(SCORING_CONSTANTS.SCORE_LEVELS).toHaveProperty('BEGINNER');
      expect(SCORING_CONSTANTS.SCORE_LEVELS).toHaveProperty('INTERMEDIATE');
      expect(SCORING_CONSTANTS.SCORE_LEVELS).toHaveProperty('ADVANCED');
      expect(SCORING_CONSTANTS.SCORE_LEVELS).toHaveProperty('EXPERT');
      
      // Check types
      expect(typeof SCORING_CONSTANTS.SCORE_LEVELS.BEGINNER).toBe('number');
      expect(typeof SCORING_CONSTANTS.SCORE_LEVELS.INTERMEDIATE).toBe('number');
      expect(typeof SCORING_CONSTANTS.SCORE_LEVELS.ADVANCED).toBe('number');
      expect(typeof SCORING_CONSTANTS.SCORE_LEVELS.EXPERT).toBe('number');
    });
    
    it('should have levels in ascending order by threshold', () => {
      // Assert
      const { BEGINNER, INTERMEDIATE, ADVANCED, EXPERT } = SCORING_CONSTANTS.SCORE_LEVELS;
      expect(BEGINNER).toBeLessThan(INTERMEDIATE);
      expect(INTERMEDIATE).toBeLessThan(ADVANCED);
      expect(ADVANCED).toBeLessThan(EXPERT);
    });
  });
  
  describe('getScoreLevel', () => {
    it('should return the correct level for a given score', () => {
      // Arrange
      const { BEGINNER, INTERMEDIATE, ADVANCED, EXPERT } = SCORING_CONSTANTS.SCORE_LEVELS;
      
      // Test each level
      expect(getScoreLevel(BEGINNER)).toBe('Beginner');
      expect(getScoreLevel(INTERMEDIATE)).toBe('Intermediate');
      expect(getScoreLevel(ADVANCED)).toBe('Advanced');
      expect(getScoreLevel(EXPERT)).toBe('Expert');
      
      // Test boundaries
      expect(getScoreLevel(BEGINNER - 1)).toBe('Novice');
      expect(getScoreLevel(BEGINNER + 1)).toBe('Beginner');
      expect(getScoreLevel(INTERMEDIATE - 1)).toBe('Beginner');
      expect(getScoreLevel(INTERMEDIATE + 1)).toBe('Intermediate');
      expect(getScoreLevel(ADVANCED - 1)).toBe('Intermediate');
      expect(getScoreLevel(ADVANCED + 1)).toBe('Advanced');
      expect(getScoreLevel(EXPERT - 1)).toBe('Advanced');
      expect(getScoreLevel(EXPERT + 1)).toBe('Expert');
    });
    
    it('should return "Novice" for negative scores', () => {
      // Assert
      expect(getScoreLevel(-100)).toBe('Novice');
    });
    
    it('should return "Expert" for very high scores', () => {
      // Assert
      expect(getScoreLevel(SCORING_CONSTANTS.SCORE_LEVELS.EXPERT + 10000)).toBe('Expert');
    });
  });
  
  describe('formatPoints', () => {
    it('should format points with commas for thousands', () => {
      // Assert
      expect(formatPoints(1000)).toBe('1,000');
      expect(formatPoints(1234567)).toBe('1,234,567');
    });
    
    it('should handle negative numbers', () => {
      // Assert
      expect(formatPoints(-1000)).toBe('-1,000');
    });
    
    it('should handle zero', () => {
      // Assert
      expect(formatPoints(0)).toBe('0');
    });
    
    it('should handle decimal numbers', () => {
      // Assert
      expect(formatPoints(1000.5)).toBe('1,000.5');
      expect(formatPoints(1000.4)).toBe('1,000.4');
    });
  });
});