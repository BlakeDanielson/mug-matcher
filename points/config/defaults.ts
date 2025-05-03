import { PointsConfig } from '../core/types';

/**
 * Default configuration for points system
 */
export const DEFAULT_CONFIG: PointsConfig = {
  scoring: {
    basePoints: 100,
    timeBonus: 50,
    timeBonusThreshold: 5000, // ms
    attemptPenalty: 25
  },
  storage: {
    autoSaveInterval: 30000, // ms
    storageKey: 'mugshot-matcher-points'
  },
  display: {
    animationDuration: 500, // ms
    errorTimeout: 3000 // ms
  }
};

/**
 * Scoring constants
 */
export const SCORING_CONSTANTS = {
  MIN_POINTS: 0,
  MAX_POINTS: 1000000,
  
  // Thresholds for different score levels
  SCORE_LEVELS: {
    BEGINNER: 500,
    INTERMEDIATE: 2000,
    ADVANCED: 5000,
    EXPERT: 10000
  }
};

/**
 * Get score level based on points
 * @param points Current points
 * @returns Score level string
 */
export function getScoreLevel(points: number): string {
  const { BEGINNER, INTERMEDIATE, ADVANCED, EXPERT } = SCORING_CONSTANTS.SCORE_LEVELS;
  
  if (points >= EXPERT) {
    return 'Expert';
  } else if (points >= ADVANCED) {
    return 'Advanced';
  } else if (points >= INTERMEDIATE) {
    return 'Intermediate';
  } else if (points >= BEGINNER) {
    return 'Beginner';
  } else {
    return 'Novice';
  }
}

/**
 * Format points with commas for thousands
 * @param points Points to format
 * @returns Formatted points string
 */
export function formatPoints(points: number): string {
  return points.toLocaleString();
}