import { ScoreDisplay } from '../ScoreDisplay';

// Mock the animations module
jest.mock('../animations', () => ({
  animatePointsChange: jest.fn().mockResolvedValue(undefined),
  animateHighScoreChange: jest.fn().mockResolvedValue(undefined),
  animatePointsEarned: jest.fn().mockResolvedValue(undefined)
}));

describe('ScoreDisplay', () => {
  let scoreDisplay: ScoreDisplay;
  let container: HTMLElement;
  
  beforeEach(() => {
    // Create a container element
    container = document.createElement('div');
    container.innerHTML = `
      <div id="current-points">0</div>
      <div id="high-score">0</div>
      <div id="points-animation-container"></div>
    `;
    document.body.appendChild(container);
    
    // Create a score display
    scoreDisplay = new ScoreDisplay(
      '#current-points',
      '#high-score',
      '#points-animation-container'
    );
    
    // Reset mocks
    jest.clearAllMocks();
  });
  
  afterEach(() => {
    // Clean up
    document.body.removeChild(container);
  });
  
  describe('updateScores', () => {
    it('should update the display with current points and high score', () => {
      // Act
      scoreDisplay.updateScores(200, 600);
      
      // Assert
      const currentPointsElement = document.getElementById('current-points');
      const highScoreElement = document.getElementById('high-score');
      
      expect(currentPointsElement?.textContent).toBe('200');
      expect(highScoreElement?.textContent).toBe('600');
      
      // Check ARIA attributes
      expect(currentPointsElement?.getAttribute('aria-live')).toBe('polite');
      expect(currentPointsElement?.getAttribute('aria-label')).toBe('Current score: 200');
      expect(highScoreElement?.getAttribute('aria-live')).toBe('polite');
      expect(highScoreElement?.getAttribute('aria-label')).toBe('High score: 600');
    });
    
    it('should handle missing elements gracefully', () => {
      // Arrange
      // Remove elements from the DOM
      container.innerHTML = '';
      
      // Act & Assert
      expect(() => {
        scoreDisplay.updateScores(200, 600);
      }).not.toThrow();
    });
  });
  
  describe('animatePoints', () => {
    it('should create and animate a bonus points element', () => {
      // Arrange
      const appendChildSpy = jest.spyOn(
        document.getElementById('points-animation-container')!,
        'appendChild'
      );
      
      // Mock requestAnimationFrame
      jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
        cb(0);
        return 0;
      });
      
      // Mock setTimeout
      jest.spyOn(window, 'setTimeout').mockImplementation(cb => {
        cb();
        return 0 as any;
      });
      
      // Act
      scoreDisplay.animatePoints(150, true);
      
      // Assert
      expect(appendChildSpy).toHaveBeenCalled();
      const animElement = appendChildSpy.mock.calls[0][0] as HTMLElement;
      
      expect(animElement.className).toBe('points-animation bonus');
      expect(animElement.textContent).toBe('+150');
      expect(animElement.getAttribute('aria-live')).toBe('polite');
      expect(animElement.getAttribute('aria-label')).toBe('Bonus points: 150');
      
      // Verify style properties
      expect(animElement.style.color).toBe('rgb(76, 175, 80)');
    });
    
    it('should create and animate a penalty points element', () => {
      // Arrange
      const appendChildSpy = jest.spyOn(
        document.getElementById('points-animation-container')!,
        'appendChild'
      );
      
      // Mock requestAnimationFrame
      jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
        cb(0);
        return 0;
      });
      
      // Mock setTimeout
      jest.spyOn(window, 'setTimeout').mockImplementation(cb => {
        cb();
        return 0 as any;
      });
      
      // Act
      scoreDisplay.animatePoints(-50, false);
      
      // Assert
      expect(appendChildSpy).toHaveBeenCalled();
      const animElement = appendChildSpy.mock.calls[0][0] as HTMLElement;
      
      expect(animElement.className).toBe('points-animation penalty');
      expect(animElement.textContent).toBe('-50');
      expect(animElement.getAttribute('aria-live')).toBe('polite');
      expect(animElement.getAttribute('aria-label')).toBe('Penalty points: -50');
      
      // Verify style properties
      expect(animElement.style.color).toBe('rgb(244, 67, 54)');
    });
    
    it('should handle missing animation container gracefully', () => {
      // Arrange
      // Remove the animation container
      const animContainer = document.getElementById('points-animation-container');
      animContainer?.parentNode?.removeChild(animContainer);
      
      // Act & Assert
      expect(() => {
        scoreDisplay.animatePoints(150, true);
      }).not.toThrow();
    });
    
    it('should not animate when points is 0', () => {
      // Arrange
      const appendChildSpy = jest.spyOn(
        document.getElementById('points-animation-container')!,
        'appendChild'
      );
      
      // Act
      scoreDisplay.animatePoints(0, true);
      
      // Assert
      expect(appendChildSpy).not.toHaveBeenCalled();
    });
  });
  
  describe('showError', () => {
    it('should create and show an error message', () => {
      // Arrange
      const appendChildSpy = jest.spyOn(
        document.getElementById('points-animation-container')!,
        'appendChild'
      );
      
      // Mock requestAnimationFrame
      jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
        cb(0);
        return 0;
      });
      
      // Mock setTimeout
      jest.spyOn(window, 'setTimeout').mockImplementation(cb => {
        cb();
        return 0 as any;
      });
      
      // Act
      scoreDisplay.showError('Test error message');
      
      // Assert
      expect(appendChildSpy).toHaveBeenCalled();
      const errorElement = appendChildSpy.mock.calls[0][0] as HTMLElement;
      
      expect(errorElement.className).toBe('points-error');
      expect(errorElement.textContent).toBe('Test error message');
      expect(errorElement.getAttribute('aria-live')).toBe('assertive');
      expect(errorElement.getAttribute('role')).toBe('alert');
      
      // Verify style properties
      expect(errorElement.style.backgroundColor).toBe('rgba(244, 67, 54, 0.9)');
    });
    
    it('should handle missing animation container gracefully', () => {
      // Arrange
      // Create a new ScoreDisplay with no animation container
      const displayWithoutAnimContainer = new ScoreDisplay(
        '#current-points',
        '#high-score',
        '#non-existent-container'
      );
      
      // Mock console.error
      const consoleErrorSpy = jest.spyOn(console, 'error');
      
      // Act
      displayWithoutAnimContainer.showError('Test error message');
      
      // Assert
      // The implementation doesn't call console.error directly with the message
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      // Cleanup
      consoleErrorSpy.mockRestore();
    });
  });
});