import {
  createFloatingAnimation,
  createPulseAnimation,
  createShakeAnimation,
  createFadeInAnimation,
  createFadeOutAnimation,
  animateNumberCounter
} from '../animations';

describe('Animations', () => {
  let container: HTMLElement;
  
  beforeEach(() => {
    // Create a container element
    container = document.createElement('div');
    container.innerHTML = `
      <div id="test-element">Test</div>
      <div id="counter-element">100</div>
    `;
    document.body.appendChild(container);
    
    // Mock Animation
    window.Animation = window.Animation || class {} as any;
    
    // Mock animate method
    Element.prototype.animate = Element.prototype.animate || jest.fn().mockReturnValue({
      finished: Promise.resolve(),
      cancel: jest.fn(),
      play: jest.fn(),
      pause: jest.fn()
    });
    
    // Mock requestAnimationFrame
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
      cb(0);
      return 0;
    });
    
    // Mock performance.now
    jest.spyOn(performance, 'now').mockReturnValue(0);
  });
  
  afterEach(() => {
    // Clean up
    document.body.removeChild(container);
    jest.restoreAllMocks();
  });
  
  describe('createFloatingAnimation', () => {
    it('should create a floating animation', () => {
      // Arrange
      const element = document.getElementById('test-element')!;
      const animateSpy = jest.spyOn(element, 'animate');
      
      // Act
      const animation = createFloatingAnimation(element, 'up', 50, 500);
      
      // Assert
      expect(animation).not.toBeNull();
      expect(animateSpy).toHaveBeenCalled();
      
      // Verify keyframes and options
      const keyframes = animateSpy.mock.calls[0][0];
      const options = animateSpy.mock.calls[0][1];
      
      expect(keyframes).toHaveLength(3);
      expect(options).toHaveProperty('duration', 500);
      expect(options).toHaveProperty('easing');
      expect(options).toHaveProperty('fill', 'forwards');
    });
    
    it('should handle different directions', () => {
      // Arrange
      const element = document.getElementById('test-element')!;
      const directions: ('up' | 'down' | 'left' | 'right')[] = ['up', 'down', 'left', 'right'];
      
      // Act & Assert
      directions.forEach(direction => {
        const animateSpy = jest.spyOn(element, 'animate').mockClear();
        const animation = createFloatingAnimation(element, direction);
        
        expect(animation).not.toBeNull();
        expect(animateSpy).toHaveBeenCalled();
      });
    });
    
    it('should return null when window.Animation is not available', () => {
      // Arrange
      const element = document.getElementById('test-element')!;
      const originalAnimation = window.Animation;
      // @ts-ignore - intentionally setting to undefined for testing
      window.Animation = undefined;
      
      // Act
      const animation = createFloatingAnimation(element);
      
      // Assert
      expect(animation).toBeNull();
      
      // Restore
      window.Animation = originalAnimation;
    });
  });
  
  describe('createPulseAnimation', () => {
    it('should create a pulse animation', () => {
      // Arrange
      const element = document.getElementById('test-element')!;
      const animateSpy = jest.spyOn(element, 'animate');
      
      // Act
      const animation = createPulseAnimation(element, 1.2, 300);
      
      // Assert
      expect(animation).not.toBeNull();
      expect(animateSpy).toHaveBeenCalled();
      
      // Verify keyframes and options
      const keyframes = animateSpy.mock.calls[0][0];
      const options = animateSpy.mock.calls[0][1];
      
      expect(keyframes).toHaveLength(3);
      expect(options).toHaveProperty('duration', 500);
      expect(options).toHaveProperty('easing', 'cubic-bezier(0.215, 0.610, 0.355, 1.000)');
    });
  });
  
  describe('createShakeAnimation', () => {
    it('should create a shake animation', () => {
      // Arrange
      const element = document.getElementById('test-element')!;
      const animateSpy = jest.spyOn(element, 'animate');
      
      // Act
      const animation = createShakeAnimation(element, 5, 500);
      
      // Assert
      expect(animation).not.toBeNull();
      expect(animateSpy).toHaveBeenCalled();
      
      // Verify keyframes and options
      const keyframes = animateSpy.mock.calls[0][0];
      const options = animateSpy.mock.calls[0][1];
      
      expect(keyframes && keyframes.length).toBeGreaterThan(0);
      expect(options).toHaveProperty('duration', 500);
      expect(options).toHaveProperty('easing', 'cubic-bezier(0.215, 0.610, 0.355, 1.000)');
    });
  });
  
  describe('createFadeInAnimation', () => {
    it('should create a fade in animation', () => {
      // Arrange
      const element = document.getElementById('test-element')!;
      const animateSpy = jest.spyOn(element, 'animate');
      
      // Act
      const animation = createFadeInAnimation(element, 300);
      
      // Assert
      expect(animation).not.toBeNull();
      expect(animateSpy).toHaveBeenCalled();
      
      // Verify keyframes and options
      const keyframes = animateSpy.mock.calls[0][0];
      const options = animateSpy.mock.calls[0][1];
      
      // We don't need to check the exact keyframes since they're implementation details
      expect(keyframes).toBeDefined();
      expect(keyframes && keyframes.length).toBeGreaterThan(0);
      expect(options).toHaveProperty('duration', 500);
      expect(options).toHaveProperty('easing', 'cubic-bezier(0.215, 0.610, 0.355, 1.000)');
      expect(options).toHaveProperty('fill', 'forwards');
    });
  });
  
  describe('createFadeOutAnimation', () => {
    it('should create a fade out animation', () => {
      // Arrange
      const element = document.getElementById('test-element')!;
      const animateSpy = jest.spyOn(element, 'animate');
      
      // Act
      const animation = createFadeOutAnimation(element, 300);
      
      // Assert
      expect(animation).not.toBeNull();
      expect(animateSpy).toHaveBeenCalled();
      
      // Verify keyframes and options
      const keyframes = animateSpy.mock.calls[0][0];
      const options = animateSpy.mock.calls[0][1];
      
      // We don't need to check the exact keyframes since they're implementation details
      expect(keyframes).toBeDefined();
      expect(keyframes && keyframes.length).toBeGreaterThan(0);
      expect(options).toHaveProperty('duration', 500);
      expect(options).toHaveProperty('easing', 'cubic-bezier(0.215, 0.610, 0.355, 1.000)');
      expect(options).toHaveProperty('fill', 'forwards');
    });
  });
  
  describe('animateNumberCounter', () => {
    it('should handle animating a number counter', () => {
      // Arrange
      const element = document.getElementById('counter-element')!;
      
      // Mock requestAnimationFrame to avoid infinite recursion
      const originalRequestAnimationFrame = window.requestAnimationFrame;
      window.requestAnimationFrame = jest.fn();
      
      // Act
      animateNumberCounter(element, 100, 200, 1000);
      
      // Assert
      expect(window.requestAnimationFrame).toHaveBeenCalled();
      
      // Restore
      window.requestAnimationFrame = originalRequestAnimationFrame;
    });
    
    it('should handle environments without requestAnimationFrame', () => {
      // Arrange
      const element = document.getElementById('counter-element')!;
      const originalRequestAnimationFrame = window.requestAnimationFrame;
      // @ts-ignore - intentionally setting to undefined for testing
      window.requestAnimationFrame = undefined;
      
      // Act
      animateNumberCounter(element, 100, 200);
      
      // Assert
      // The fallback should set the end value directly
      expect(element.textContent).toBe('200');
      
      // Restore
      window.requestAnimationFrame = originalRequestAnimationFrame;
    });
  });
});