import { PointsCalculator } from '../PointsCalculator';
import { MatchResult, PointsError } from '../types';

describe('PointsCalculator', () => {
  let calculator: PointsCalculator;
  
  beforeEach(() => {
    // Create a new calculator with default values before each test
    calculator = new PointsCalculator();
  });
  
  describe('calculatePoints', () => {
    it('should return 0 for incorrect matches', () => {
      // Arrange
      const matchResult: MatchResult = {
        correct: false,
        timeElapsed: 3000,
        attemptCount: 1
      };
      
      // Act
      const points = calculator.calculatePoints(matchResult);
      
      // Assert
      expect(points).toBe(0);
    });
    
    it('should return base points for correct matches', () => {
      // Arrange
      const matchResult: MatchResult = {
        correct: true,
        timeElapsed: 6000, // Above time bonus threshold
        attemptCount: 1
      };
      
      // Act
      const points = calculator.calculatePoints(matchResult);
      
      // Assert
      expect(points).toBe(100); // Default base points
    });
    
    it('should add time bonus for quick matches', () => {
      // Arrange
      const matchResult: MatchResult = {
        correct: true,
        timeElapsed: 3000, // Below default threshold of 5000ms
        attemptCount: 1
      };
      
      // Act
      const points = calculator.calculatePoints(matchResult);
      
      // Assert
      expect(points).toBe(150); // Base points (100) + time bonus (50)
    });
    
    it('should apply attempt penalty for multiple attempts', () => {
      // Arrange
      const matchResult: MatchResult = {
        correct: true,
        timeElapsed: 6000, // Above time bonus threshold
        attemptCount: 3 // 2 additional attempts
      };
      
      // Act
      const points = calculator.calculatePoints(matchResult);
      
      // Assert
      expect(points).toBe(50); // Base points (100) - penalty (25 * 2)
    });
    
    it('should apply both time bonus and attempt penalty when applicable', () => {
      // Arrange
      const matchResult: MatchResult = {
        correct: true,
        timeElapsed: 3000, // Below default threshold
        attemptCount: 2 // 1 additional attempt
      };
      
      // Act
      const points = calculator.calculatePoints(matchResult);
      
      // Assert
      expect(points).toBe(125); // Base (100) + time bonus (50) - penalty (25)
    });
    
    it('should never return negative points', () => {
      // Arrange
      const matchResult: MatchResult = {
        correct: true,
        timeElapsed: 6000,
        attemptCount: 5 // 4 additional attempts, penalty would be 100
      };
      
      // Act
      const points = calculator.calculatePoints(matchResult);
      
      // Assert
      expect(points).toBe(0); // Should be capped at 0
    });
    
    it('should throw error for invalid match result', () => {
      // Arrange
      const invalidMatchResult = null;
      
      // Act & Assert
      expect(() => {
        // @ts-ignore - intentionally passing invalid input for testing
        calculator.calculatePoints(invalidMatchResult);
      }).toThrow();
    });
    
    it('should throw error for negative time elapsed', () => {
      // Arrange
      const matchResult: MatchResult = {
        correct: true,
        timeElapsed: -1000,
        attemptCount: 1
      };
      
      // Act & Assert
      expect(() => {
        calculator.calculatePoints(matchResult);
      }).toThrow();
    });
    
    it('should throw error for invalid attempt count', () => {
      // Arrange
      const matchResult: MatchResult = {
        correct: true,
        timeElapsed: 3000,
        attemptCount: 0 // Must be at least 1
      };
      
      // Act & Assert
      expect(() => {
        calculator.calculatePoints(matchResult);
      }).toThrow();
    });
  });
  
  describe('validatePoints', () => {
    it('should return the same value for valid points', () => {
      // Act & Assert
      expect(calculator.validatePoints(500)).toBe(500);
    });
    
    it('should round non-integer points', () => {
      // Act & Assert
      expect(calculator.validatePoints(100.6)).toBe(101);
      expect(calculator.validatePoints(100.2)).toBe(100);
    });
    
    it('should cap points at minimum value', () => {
      // Act & Assert
      expect(calculator.validatePoints(-50)).toBe(0);
    });
    
    it('should cap points at maximum value', () => {
      // Act & Assert
      expect(calculator.validatePoints(2000000)).toBe(1000000); // Max from SCORING constant
    });
    
    it('should throw error for non-numeric points', () => {
      // Act & Assert
      expect(() => {
        // @ts-ignore - intentionally passing invalid input for testing
        calculator.validatePoints('not a number');
      }).toThrow();
    });
    
    it('should throw error for NaN', () => {
      // Act & Assert
      expect(() => {
        calculator.validatePoints(NaN);
      }).toThrow();
    });
  });
  
  describe('custom configuration', () => {
    it('should use custom base points', () => {
      // Arrange
      const customCalculator = new PointsCalculator(200); // Custom base points
      const matchResult: MatchResult = {
        correct: true,
        timeElapsed: 6000,
        attemptCount: 1
      };
      
      // Act
      const points = customCalculator.calculatePoints(matchResult);
      
      // Assert
      expect(points).toBe(200);
    });
    
    it('should use custom time bonus', () => {
      // Arrange
      const customCalculator = new PointsCalculator(100, 100); // Custom time bonus
      const matchResult: MatchResult = {
        correct: true,
        timeElapsed: 3000,
        attemptCount: 1
      };
      
      // Act
      const points = customCalculator.calculatePoints(matchResult);
      
      // Assert
      expect(points).toBe(200); // Base (100) + custom time bonus (100)
    });
    
    it('should use custom time bonus threshold', () => {
      // Arrange
      const customCalculator = new PointsCalculator(100, 50, 2000); // Lower threshold
      
      // Test with time just above threshold (no bonus)
      const slowMatch: MatchResult = {
        correct: true,
        timeElapsed: 2100,
        attemptCount: 1
      };
      
      // Test with time below threshold (gets bonus)
      const quickMatch: MatchResult = {
        correct: true,
        timeElapsed: 1900,
        attemptCount: 1
      };
      
      // Act & Assert
      expect(customCalculator.calculatePoints(slowMatch)).toBe(100); // No bonus
      expect(customCalculator.calculatePoints(quickMatch)).toBe(150); // With bonus
    });
    
    it('should use custom attempt penalty', () => {
      // Arrange
      const customCalculator = new PointsCalculator(100, 50, 5000, 10); // Lower penalty
      const matchResult: MatchResult = {
        correct: true,
        timeElapsed: 6000,
        attemptCount: 3 // 2 additional attempts
      };
      
      // Act
      const points = customCalculator.calculatePoints(matchResult);
      
      // Assert
      expect(points).toBe(80); // Base (100) - custom penalty (10 * 2)
    });
  });
});