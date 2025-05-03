/**
 * Points System Type Definitions
 */

/**
 * Match result interface for points calculation
 */
export interface MatchResult {
  correct: boolean;
  timeElapsed: number; // ms
  attemptCount: number;
}

/**
 * Points state interface for storage
 */
export interface PointsState {
  currentPoints: number;
  highScore: number;
  lastUpdated: Date;
}

/**
 * Configuration interface for points system
 */
export interface PointsConfig {
  // Scoring rules
  scoring: {
    basePoints: number;
    timeBonus: number;
    timeBonusThreshold: number;
    attemptPenalty: number;
  };
  
  // Storage settings
  storage: {
    autoSaveInterval: number; // ms
    storageKey: string;
  };
  
  // Display settings  
  display: {
    animationDuration: number;
    errorTimeout: number;
  };
}

/**
 * Error types for points system
 */
export enum PointsError {
  INVALID_POINTS = 'INVALID_POINTS',
  STORAGE_ERROR = 'STORAGE_ERROR',
  CALCULATION_ERROR = 'CALCULATION_ERROR'
}

/**
 * Custom error interface for points system
 */
export interface PointsSystemError extends Error {
  code: PointsError;
  details?: any;
}

/**
 * Default configuration for points system
 */
export const DEFAULT_CONFIG: PointsConfig = {
  scoring: {
    basePoints: 100,
    timeBonus: 50,
    timeBonusThreshold: 5000,
    attemptPenalty: 25
  },
  storage: {
    autoSaveInterval: 30000,
    storageKey: 'mugshot-matcher-points'
  },
  display: {
    animationDuration: 500,
    errorTimeout: 3000
  }
};

/**
 * Scoring constants
 */
export const SCORING = {
  MIN_POINTS: 0,
  MAX_POINTS: 1000000
};