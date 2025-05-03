/**
 * Points System Public API
 */

// Import types and classes we need for function signatures
import { PointsManager } from './core/PointsManager';
import { PointsCalculator } from './core/PointsCalculator';
import {
  MatchResult,
  PointsState,
  PointsConfig,
  PointsError,
  PointsSystemError,
  DEFAULT_CONFIG,
  SCORING
} from './core/types';
import { ScoreDisplay } from './display/ScoreDisplay';

// Core exports
export { PointsManager } from './core/PointsManager';
export { PointsCalculator } from './core/PointsCalculator';
export { PointsError } from './core/types';
export { DEFAULT_CONFIG, SCORING } from './core/types';
// Type exports
export type {
  MatchResult,
  PointsState,
  PointsConfig,
  PointsSystemError
} from './core/types';

// Storage exports
export { LocalStorage } from './storage/LocalStorage';
export { MemoryStorage } from './storage/MemoryStorage';
export type { PointsStorage } from './storage/PointsStorage';

// Display exports
export { ScoreDisplay } from './display/ScoreDisplay';
export {
  createFloatingAnimation,
  createPulseAnimation,
  createShakeAnimation,
  createFadeInAnimation,
  createFadeOutAnimation,
  animateNumberCounter
} from './display/animations';

// Config exports
export {
  DEFAULT_CONFIG as DEFAULT_POINTS_CONFIG,
  SCORING_CONSTANTS,
  getScoreLevel,
  formatPoints
} from './config/defaults';
export { validateConfig } from './config/validation';

/**
 * Create a points manager with default configuration
 * @returns Initialized PointsManager instance
 */
export async function createPointsManager(
  config: Partial<PointsConfig> = {}
): Promise<PointsManager> {
  const manager = new PointsManager(config);
  await manager.initialize();
  return manager;
}

/**
 * Game integration helpers
 */

/**
 * Initialize points system
 * @param config Configuration options
 * @returns Promise that resolves with initialized PointsManager
 */
export async function initializePoints(
  config: Partial<PointsConfig> = {}
): Promise<PointsManager> {
  return createPointsManager(config);
}

/**
 * Create a match result object
 * @param correct Whether the match was correct
 * @param timeElapsed Time elapsed in milliseconds
 * @param attemptCount Number of attempts
 * @returns MatchResult object
 */
export function createMatchResult(
  correct: boolean,
  timeElapsed: number,
  attemptCount: number
): MatchResult {
  return {
    correct,
    timeElapsed,
    attemptCount
  };
}

/**
 * Handle match completion
 * @param pointsManager PointsManager instance
 * @param matchResult Match result
 * @param scoreDisplay Optional ScoreDisplay for animations
 * @returns Points earned
 */
export function handleMatchComplete(
  pointsManager: PointsManager,
  matchResult: MatchResult,
  scoreDisplay?: ScoreDisplay
): number {
  // Calculate and add points
  const pointsEarned = pointsManager.addPoints(matchResult);
  
  // Update display if provided
  if (scoreDisplay) {
    scoreDisplay.updateScores(pointsManager.currentPoints, pointsManager.highScore);
    
    // Animate points if earned
    if (pointsEarned > 0) {
      scoreDisplay.animatePoints(pointsEarned, true);
    }
  }
  
  // Save state
  pointsManager.saveState().catch((error: Error) => {
    console.warn('Failed to save points state:', error);
  });
  
  return pointsEarned;
}

/**
 * Handle game reset
 * @param pointsManager PointsManager instance
 * @param scoreDisplay Optional ScoreDisplay for updates
 */
export function handleGameReset(
  pointsManager: PointsManager,
  scoreDisplay?: ScoreDisplay
): void {
  // Reset session
  pointsManager.resetSession();
  
  // Update display if provided
  if (scoreDisplay) {
    scoreDisplay.updateScores(pointsManager.currentPoints, pointsManager.highScore);
  }
}

/**
 * Clean up points system
 * @param pointsManager PointsManager instance
 * @returns Promise that resolves when cleanup is complete
 */
export function cleanupPointsSystem(
  pointsManager: PointsManager
): Promise<void> {
  return pointsManager.cleanup();
}