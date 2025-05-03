import { PointsConfig, PointsError, PointsSystemError } from '../core/types';
import { DEFAULT_CONFIG } from './defaults';

/**
 * Validate points configuration
 * @param config Configuration to validate
 * @returns Validated configuration
 * @throws PointsSystemError if configuration is invalid
 */
export function validateConfig(config: Partial<PointsConfig>): PointsConfig {
  try {
    // Start with default config
    const validatedConfig: PointsConfig = {
      ...DEFAULT_CONFIG,
      scoring: { ...DEFAULT_CONFIG.scoring },
      storage: { ...DEFAULT_CONFIG.storage },
      display: { ...DEFAULT_CONFIG.display }
    };
    
    // Validate and merge scoring config
    if (config.scoring) {
      validatedConfig.scoring = validateScoringConfig({
        ...validatedConfig.scoring,
        ...config.scoring
      });
    }
    
    // Validate and merge storage config
    if (config.storage) {
      validatedConfig.storage = validateStorageConfig({
        ...validatedConfig.storage,
        ...config.storage
      });
    }
    
    // Validate and merge display config
    if (config.display) {
      validatedConfig.display = validateDisplayConfig({
        ...validatedConfig.display,
        ...config.display
      });
    }
    
    return validatedConfig;
  } catch (error) {
    if (error instanceof Error) {
      throw createError(PointsError.CALCULATION_ERROR, `Invalid configuration: ${error.message}`, error);
    }
    throw createError(PointsError.CALCULATION_ERROR, 'Invalid configuration');
  }
}

/**
 * Validate scoring configuration
 * @param config Scoring configuration to validate
 * @returns Validated scoring configuration
 * @throws Error if configuration is invalid
 */
function validateScoringConfig(config: PointsConfig['scoring']): PointsConfig['scoring'] {
  // Validate basePoints
  if (typeof config.basePoints !== 'number' || config.basePoints < 0) {
    throw new Error('Base points must be a non-negative number');
  }
  
  // Validate timeBonus
  if (typeof config.timeBonus !== 'number' || config.timeBonus < 0) {
    throw new Error('Time bonus must be a non-negative number');
  }
  
  // Validate timeBonusThreshold
  if (typeof config.timeBonusThreshold !== 'number' || config.timeBonusThreshold <= 0) {
    throw new Error('Time bonus threshold must be a positive number');
  }
  
  // Validate attemptPenalty
  if (typeof config.attemptPenalty !== 'number' || config.attemptPenalty < 0) {
    throw new Error('Attempt penalty must be a non-negative number');
  }
  
  return {
    basePoints: Math.round(config.basePoints),
    timeBonus: Math.round(config.timeBonus),
    timeBonusThreshold: Math.round(config.timeBonusThreshold),
    attemptPenalty: Math.round(config.attemptPenalty)
  };
}

/**
 * Validate storage configuration
 * @param config Storage configuration to validate
 * @returns Validated storage configuration
 * @throws Error if configuration is invalid
 */
function validateStorageConfig(config: PointsConfig['storage']): PointsConfig['storage'] {
  // Validate autoSaveInterval
  if (typeof config.autoSaveInterval !== 'number' || config.autoSaveInterval < 0) {
    throw new Error('Auto-save interval must be a non-negative number');
  }
  
  // Validate storageKey
  if (typeof config.storageKey !== 'string' || config.storageKey.trim() === '') {
    throw new Error('Storage key must be a non-empty string');
  }
  
  return {
    autoSaveInterval: Math.round(config.autoSaveInterval),
    storageKey: config.storageKey.trim()
  };
}

/**
 * Validate display configuration
 * @param config Display configuration to validate
 * @returns Validated display configuration
 * @throws Error if configuration is invalid
 */
function validateDisplayConfig(config: PointsConfig['display']): PointsConfig['display'] {
  // Validate animationDuration
  if (typeof config.animationDuration !== 'number' || config.animationDuration < 0) {
    throw new Error('Animation duration must be a non-negative number');
  }
  
  // Validate errorTimeout
  if (typeof config.errorTimeout !== 'number' || config.errorTimeout < 0) {
    throw new Error('Error timeout must be a non-negative number');
  }
  
  return {
    animationDuration: Math.round(config.animationDuration),
    errorTimeout: Math.round(config.errorTimeout)
  };
}

/**
 * Create a points system error
 * @param code Error code
 * @param message Error message
 * @param originalError Original error if available
 * @returns PointsSystemError
 */
function createError(
  code: PointsError,
  message: string,
  originalError?: Error
): PointsSystemError {
  const error = new Error(message) as PointsSystemError;
  error.code = code;
  error.details = originalError;
  return error;
}