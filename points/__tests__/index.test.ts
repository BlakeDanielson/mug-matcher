import { 
  createPointsManager,
  initializePoints,
  createMatchResult,
  handleMatchComplete,
  handleGameReset,
  cleanupPointsSystem,
  PointsManager,
  PointsCalculator,
  ScoreDisplay,
  LocalStorage,
  MemoryStorage,
  validateConfig,
  DEFAULT_CONFIG
} from '../index';

describe('Points System Index', () => {
  describe('createPointsManager', () => {
    it('should create a PointsManager instance with default config', async () => {
      // Act
      const manager = await createPointsManager();
      
      // Assert
      expect(manager).toBeInstanceOf(PointsManager);
    });
    
    it('should create a PointsManager instance with custom config', async () => {
      // Arrange
      const config = {
        scoring: {
          basePoints: 200,
          timeBonus: 100,
          timeBonusThreshold: 5000,
          attemptPenalty: 50
        }
      };
      
      // Act
      const manager = await createPointsManager(config);
      
      // Assert
      expect(manager).toBeInstanceOf(PointsManager);
    });
  });
  
  describe('initializePoints', () => {
    it('should initialize points system with default config', async () => {
      // Act
      const manager = await initializePoints();
      
      // Assert
      expect(manager).toBeInstanceOf(PointsManager);
    });
    
    it('should initialize points system with custom config', async () => {
      // Arrange
      const config = {
        scoring: {
          basePoints: 200,
          timeBonus: 100,
          timeBonusThreshold: 5000,
          attemptPenalty: 50
        }
      };
      
      // Act
      const manager = await initializePoints(config);
      
      // Assert
      expect(manager).toBeInstanceOf(PointsManager);
    });
  });
  
  describe('createMatchResult', () => {
    it('should create a match result object', () => {
      // Act
      const result = createMatchResult(true, 1500, 2);
      
      // Assert
      expect(result).toEqual({
        correct: true,
        timeElapsed: 1500,
        attemptCount: 2
      });
    });
  });
  
  describe('handleMatchComplete', () => {
    it('should handle match completion and return points earned', () => {
      // Arrange
      const pointsManager = new PointsManager();
      const matchResult = createMatchResult(true, 1500, 1);
      const addPointsSpy = jest.spyOn(pointsManager, 'addPoints').mockReturnValue(100);
      const saveStateSpy = jest.spyOn(pointsManager, 'saveState').mockResolvedValue();
      
      // Act
      const pointsEarned = handleMatchComplete(pointsManager, matchResult);
      
      // Assert
      expect(pointsEarned).toBe(100);
      expect(addPointsSpy).toHaveBeenCalledWith(matchResult);
      expect(saveStateSpy).toHaveBeenCalled();
    });
    
    it('should update score display if provided', () => {
      // Arrange
      const pointsManager = new PointsManager();
      const matchResult = createMatchResult(true, 1500, 1);
      jest.spyOn(pointsManager, 'addPoints').mockReturnValue(100);
      jest.spyOn(pointsManager, 'saveState').mockResolvedValue();
      
      // Mock ScoreDisplay
      const scoreDisplay = {
        updateScores: jest.fn(),
        animatePoints: jest.fn()
      } as unknown as ScoreDisplay;
      
      // Act
      handleMatchComplete(pointsManager, matchResult, scoreDisplay);
      
      // Assert
      expect(scoreDisplay.updateScores).toHaveBeenCalled();
      expect(scoreDisplay.animatePoints).toHaveBeenCalledWith(100, true);
    });
    
    it('should not animate points if none earned', () => {
      // Arrange
      const pointsManager = new PointsManager();
      const matchResult = createMatchResult(false, 1500, 3);
      jest.spyOn(pointsManager, 'addPoints').mockReturnValue(0);
      jest.spyOn(pointsManager, 'saveState').mockResolvedValue();
      
      // Mock ScoreDisplay
      const scoreDisplay = {
        updateScores: jest.fn(),
        animatePoints: jest.fn()
      } as unknown as ScoreDisplay;
      
      // Act
      handleMatchComplete(pointsManager, matchResult, scoreDisplay);
      
      // Assert
      expect(scoreDisplay.updateScores).toHaveBeenCalled();
      expect(scoreDisplay.animatePoints).not.toHaveBeenCalled();
    });
  });
  
  describe('handleGameReset', () => {
    it('should reset session', () => {
      // Arrange
      const pointsManager = new PointsManager();
      const resetSessionSpy = jest.spyOn(pointsManager, 'resetSession');
      
      // Act
      handleGameReset(pointsManager);
      
      // Assert
      expect(resetSessionSpy).toHaveBeenCalled();
    });
    
    it('should update score display if provided', () => {
      // Arrange
      const pointsManager = new PointsManager();
      jest.spyOn(pointsManager, 'resetSession');
      
      // Mock ScoreDisplay
      const scoreDisplay = {
        updateScores: jest.fn()
      } as unknown as ScoreDisplay;
      
      // Act
      handleGameReset(pointsManager, scoreDisplay);
      
      // Assert
      expect(scoreDisplay.updateScores).toHaveBeenCalled();
    });
  });
  
  describe('cleanupPointsSystem', () => {
    it('should call cleanup on points manager', async () => {
      // Arrange
      const pointsManager = new PointsManager();
      const cleanupSpy = jest.spyOn(pointsManager, 'cleanup').mockResolvedValue();
      
      // Act
      await cleanupPointsSystem(pointsManager);
      
      // Assert
      expect(cleanupSpy).toHaveBeenCalled();
    });
  });
  
  describe('Exported Classes and Functions', () => {
    it('should export PointsManager', () => {
      expect(PointsManager).toBeDefined();
    });
    
    it('should export PointsCalculator', () => {
      expect(PointsCalculator).toBeDefined();
    });
    
    it('should export ScoreDisplay', () => {
      expect(ScoreDisplay).toBeDefined();
    });
    
    it('should export LocalStorage', () => {
      expect(LocalStorage).toBeDefined();
    });
    
    it('should export MemoryStorage', () => {
      expect(MemoryStorage).toBeDefined();
    });
    
    it('should export validateConfig', () => {
      expect(validateConfig).toBeDefined();
    });
    
    it('should export DEFAULT_CONFIG', () => {
      expect(DEFAULT_CONFIG).toBeDefined();
    });
  });
});