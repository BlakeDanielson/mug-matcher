import { PointsConfig, DEFAULT_CONFIG } from '../core/types';

/**
 * ScoreDisplay class
 * Handles displaying and animating scores in the UI
 */
export class ScoreDisplay {
  // DOM elements
  private currentScoreElement: HTMLElement | null = null;
  private highScoreElement: HTMLElement | null = null;
  private animationContainer: HTMLElement | null = null;
  
  // Configuration
  private config: PointsConfig['display'];
  
  /**
   * Constructor
   * @param currentScoreSelector CSS selector for current score element
   * @param highScoreSelector CSS selector for high score element
   * @param animationContainerSelector CSS selector for animation container
   * @param config Display configuration
   */
  constructor(
    currentScoreSelector: string,
    highScoreSelector: string,
    animationContainerSelector: string,
    config: Partial<PointsConfig['display']> = {}
  ) {
    // Merge provided config with defaults
    this.config = {
      ...DEFAULT_CONFIG.display,
      ...config
    };
    
    // Initialize DOM elements when available
    if (typeof document !== 'undefined') {
      this.currentScoreElement = document.querySelector(currentScoreSelector);
      this.highScoreElement = document.querySelector(highScoreSelector);
      this.animationContainer = document.querySelector(animationContainerSelector);
      
      // Log warning if elements not found
      if (!this.currentScoreElement) {
        console.warn(`Current score element not found: ${currentScoreSelector}`);
      }
      
      if (!this.highScoreElement) {
        console.warn(`High score element not found: ${highScoreSelector}`);
      }
      
      if (!this.animationContainer) {
        console.warn(`Animation container not found: ${animationContainerSelector}`);
      }
    }
  }
  
  /**
   * Update displayed scores
   * @param current Current score
   * @param high High score
   */
  public updateScores(current: number, high: number): void {
    // Update current score element
    if (this.currentScoreElement) {
      this.currentScoreElement.textContent = current.toString();
      
      // Add ARIA live region for accessibility
      this.currentScoreElement.setAttribute('aria-live', 'polite');
      this.currentScoreElement.setAttribute('aria-label', `Current score: ${current}`);
    }
    
    // Update high score element
    if (this.highScoreElement) {
      this.highScoreElement.textContent = high.toString();
      
      // Add ARIA live region for accessibility
      this.highScoreElement.setAttribute('aria-live', 'polite');
      this.highScoreElement.setAttribute('aria-label', `High score: ${high}`);
    }
  }
  
  /**
   * Animate points being added or subtracted
   * @param points Points to animate
   * @param isBonus Whether this is a bonus (true) or penalty (false)
   */
  public animatePoints(points: number, isBonus: boolean): void {
    // Skip if no animation container or points is 0
    if (!this.animationContainer || points === 0 || typeof document === 'undefined') {
      return;
    }
    
    // Create animation element
    const animElement = document.createElement('div');
    animElement.className = `points-animation ${isBonus ? 'bonus' : 'penalty'}`;
    animElement.textContent = `${isBonus ? '+' : ''}${points}`;
    
    // Set ARIA attributes for accessibility
    animElement.setAttribute('aria-live', 'polite');
    animElement.setAttribute(
      'aria-label',
      `${isBonus ? 'Bonus' : 'Penalty'} points: ${points}`
    );
    
    // Style the animation element
    Object.assign(animElement.style, {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      fontSize: '2rem',
      fontWeight: 'bold',
      color: isBonus ? '#4CAF50' : '#F44336',
      opacity: '0',
      transition: `all ${this.config.animationDuration}ms ease-out`,
      pointerEvents: 'none',
      zIndex: '1000',
      textShadow: '0 0 10px rgba(0, 0, 0, 0.5)'
    });
    
    // Add to container
    this.animationContainer.appendChild(animElement);
    
    // Trigger animation
    requestAnimationFrame(() => {
      // Start animation
      Object.assign(animElement.style, {
        opacity: '1',
        transform: 'translate(-50%, -100%)'
      });
      
      // Remove element after animation completes
      setTimeout(() => {
        if (animElement.parentNode) {
          animElement.parentNode.removeChild(animElement);
        }
      }, this.config.animationDuration);
    });
  }
  
  /**
   * Show error message
   * @param message Error message to display
   */
  public showError(message: string): void {
    // Skip if no animation container
    if (!this.animationContainer || typeof document === 'undefined') {
      console.error(message);
      return;
    }
    
    // Create error element
    const errorElement = document.createElement('div');
    errorElement.className = 'points-error';
    errorElement.textContent = message;
    
    // Set ARIA attributes for accessibility
    errorElement.setAttribute('aria-live', 'assertive');
    errorElement.setAttribute('role', 'alert');
    
    // Style the error element
    Object.assign(errorElement.style, {
      position: 'absolute',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: 'rgba(244, 67, 54, 0.9)',
      color: 'white',
      padding: '10px 20px',
      borderRadius: '4px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
      opacity: '0',
      transition: 'opacity 0.3s ease',
      zIndex: '1000'
    });
    
    // Add to container
    this.animationContainer.appendChild(errorElement);
    
    // Trigger animation
    requestAnimationFrame(() => {
      // Show error
      errorElement.style.opacity = '1';
      
      // Remove after timeout
      setTimeout(() => {
        // Fade out
        errorElement.style.opacity = '0';
        
        // Remove element after fade out
        setTimeout(() => {
          if (errorElement.parentNode) {
            errorElement.parentNode.removeChild(errorElement);
          }
        }, 300);
      }, this.config.errorTimeout);
    });
  }
}