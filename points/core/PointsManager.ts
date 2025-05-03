import { MatchResult, PointsState, PointsConfig, PointsError, PointsSystemError, DEFAULT_CONFIG } from './types';
import { PointsCalculator } from './PointsCalculator';
import { PointsStorage } from '../storage/PointsStorage';
import { LocalStorage } from '../storage/LocalStorage';
import { MemoryStorage } from '../storage/MemoryStorage';

/**
 * PointsManager class
 * Main class for managing points in the mugshot matching game
 */
export class PointsManager {
  // Current game session points
  private _currentPoints: number = 0;
  
  // Historical high score
  private _highScore: number = 0;
  
  // Points calculator
  private calculator: PointsCalculator;
  
  // Points storage
  private storage: PointsStorage;
  
  // Auto-save interval ID
  private autoSaveIntervalId: number | null = null;
  
  // Configuration
  private config: PointsConfig;
  
  // Rate limiting
  private pointsHistory: { timestamp: number; points: number }[] = [];
  private readonly RATE_LIMIT_WINDOW = 60000; // 1 minute
  private readonly RATE_LIMIT_MAX_POINTS = 1000; // Maximum points per minute
  
  /**
   * Constructor
   * @param config Configuration for points system
   * @param storage Storage implementation (defaults to LocalStorage with fallback to MemoryStorage)
   */
  constructor(config: Partial<PointsConfig> = {}, storage?: PointsStorage) {
    // Merge provided config with defaults
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      scoring: {
        ...DEFAULT_CONFIG.scoring,
        ...(config.scoring || {})
      },
      storage: {
        ...DEFAULT_CONFIG.storage,
        ...(config.storage || {})
      },
      display: {
        ...DEFAULT_CONFIG.display,
        ...(config.display || {})
      }
    };
    
    // Initialize calculator with scoring config
    this.calculator = new PointsCalculator(
      this.config.scoring.basePoints,
      this.config.scoring.timeBonus,
      this.config.scoring.timeBonusThreshold,
      this.config.scoring.attemptPenalty
    );
    
    // Initialize storage
    if (storage) {
      this.storage = storage;
    } else {
      // Try to use LocalStorage, fall back to MemoryStorage if not available
      try {
        this.storage = new LocalStorage(this.config.storage.storageKey);
      } catch (error) {
        console.warn('LocalStorage not available, falling back to MemoryStorage');
        this.storage = new MemoryStorage();
      }
    }
  }
  
  /**
   * Get current points
   */
  public get currentPoints(): number {
    return this._currentPoints;
  }
  
  /**
   * Get high score
   */
  public get highScore(): number {
    return this._highScore;
  }
  
  /**
   * Initialize points manager
   * Loads saved state and starts auto-save interval
   * @returns Promise that resolves when initialization is complete
   */
  public async initialize(): Promise<void> {
    // Load saved state
    await this.loadSavedState();
    
    // Start auto-save interval
    this.startAutoSave();
  }
  
  /**
   * Add points for correct match
   * @param matchResult Match result
   * @returns Points earned
   * @throws PointsSystemError if points calculation fails
   */
  public addPoints(matchResult: MatchResult): number {
    try {
      // Calculate points
      const pointsEarned = this.calculator.calculatePoints(matchResult);
      
      // Apply rate limiting
      const adjustedPoints = this.applyRateLimit(pointsEarned);
      
      // Update current points
      this._currentPoints += adjustedPoints;
      
      // Update high score if needed
      if (this._currentPoints > this._highScore) {
        this._highScore = this._currentPoints;
      }
      
      return adjustedPoints;
    } catch (error) {
      if (error instanceof Error) {
        throw this.createError(PointsError.CALCULATION_ERROR, `Failed to add points: ${error.message}`, error);
      }
      throw this.createError(PointsError.CALCULATION_ERROR, 'Failed to add points');
    }
  }
  
  /**
   * Reset points for current session
   */
  public resetSession(): void {
    this._currentPoints = 0;
  }
  
  /**
   * Load persisted points/high score
   * @returns Promise that resolves when load is complete
   * @throws PointsSystemError if load fails
   */
  public async loadSavedState(): Promise<void> {
    try {
      // Load state from storage
      const state = await this.storage.loadPoints();
      
      // Validate loaded points
      if (!this.validateLoadedState(state)) {
        throw new Error('Invalid state loaded from storage');
      }
      
      // Update current points and high score
      this._currentPoints = state.currentPoints;
      this._highScore = state.highScore;
    } catch (error) {
      // If storage error or invalid state, initialize with default values
      this._currentPoints = 0;
      this._highScore = 0;
      
      if (error instanceof Error) {
        console.warn(`Failed to load points: ${error.message}`);
      }
    }
  }

  /**
   * Validate loaded state
   * @param state State to validate
   * @returns true if state is valid, false otherwise
   */
  private validateLoadedState(state: PointsState): boolean {
    if (!state || typeof state !== 'object') return false;

    // Validate points are within allowed range
    if (typeof state.currentPoints !== 'number' ||
        !Number.isInteger(state.currentPoints) ||
        state.currentPoints < 0 ||
        state.currentPoints > 1000000) {
      return false;
    }

    if (typeof state.highScore !== 'number' ||
        !Number.isInteger(state.highScore) ||
        state.highScore < 0 ||
        state.highScore > 1000000 ||
        state.highScore < state.currentPoints) {
      return false;
    }

    // Validate lastUpdated
    if (!(state.lastUpdated instanceof Date) && typeof state.lastUpdated !== 'string') {
      return false;
    }

    const lastUpdated = state.lastUpdated instanceof Date ?
      state.lastUpdated :
      new Date(state.lastUpdated);

    if (isNaN(lastUpdated.getTime()) || lastUpdated > new Date()) {
      return false;
    }

    return true;
  }
  
  /**
   * Save current state
   * @returns Promise that resolves when save is complete
   * @throws PointsSystemError if save fails
   */
  public async saveState(): Promise<void> {
    try {
      // Create state object
      const state: PointsState = {
        currentPoints: this._currentPoints,
        highScore: this._highScore,
        lastUpdated: new Date()
      };
      
      // Save state to storage
      await this.storage.savePoints(state);
    } catch (error) {
      if (error instanceof Error) {
        throw this.createError(PointsError.STORAGE_ERROR, `Failed to save points: ${error.message}`, error);
      }
      throw this.createError(PointsError.STORAGE_ERROR, 'Failed to save points');
    }
  }
  
  /**
   * Clear all points data
   * @returns Promise that resolves when clear is complete
   * @throws PointsSystemError if clear fails
   */
  public async clearAllData(): Promise<void> {
    try {
      // Clear storage
      await this.storage.clearPoints();
      
      // Reset current points and high score
      this._currentPoints = 0;
      this._highScore = 0;
    } catch (error) {
      if (error instanceof Error) {
        throw this.createError(PointsError.STORAGE_ERROR, `Failed to clear points: ${error.message}`, error);
      }
      throw this.createError(PointsError.STORAGE_ERROR, 'Failed to clear points');
    }
  }
  
  /**
   * Start auto-save interval
   */
  private startAutoSave(): void {
    // Clear existing interval if any
    this.stopAutoSave();
    
    // Start new interval
    if (typeof window !== 'undefined' && this.config.storage.autoSaveInterval > 0) {
      this.autoSaveIntervalId = window.setInterval(async () => {
        try {
          await this.saveState();
        } catch (error) {
          console.warn('Auto-save failed:', error);
        }
      }, this.config.storage.autoSaveInterval);
    }
  }
  
  /**
   * Stop auto-save interval
   */
  private stopAutoSave(): void {
    if (this.autoSaveIntervalId !== null && typeof window !== 'undefined') {
      window.clearInterval(this.autoSaveIntervalId);
      this.autoSaveIntervalId = null;
    }
  }
  
  /**
   * Clean up resources
   * Stops auto-save interval and saves current state
   * @returns Promise that resolves when cleanup is complete
   */
  public async cleanup(): Promise<void> {
    // Stop auto-save interval
    this.stopAutoSave();
    
    // Save current state
    try {
      await this.saveState();
    } catch (error) {
      console.warn('Failed to save state during cleanup:', error);
    }
  }

  /**
   * Apply rate limiting to points earned
   * @param points Points to check against rate limit
   * @returns Adjusted points after rate limiting
   */
  private applyRateLimit(points: number): number {
    const now = Date.now();
    
    // Remove old entries outside the window
    this.pointsHistory = this.pointsHistory.filter(
      entry => now - entry.timestamp < this.RATE_LIMIT_WINDOW
    );
    
    // Calculate total points in current window
    const totalPoints = this.pointsHistory.reduce(
      (sum, entry) => sum + entry.points,
      0
    );
    
    // If under limit, add full points
    if (totalPoints < this.RATE_LIMIT_MAX_POINTS) {
      this.pointsHistory.push({ timestamp: now, points });
      return points;
    }
    
    // If over limit, reduce points
    const reduction = Math.min(1, (this.RATE_LIMIT_MAX_POINTS / (totalPoints + points)));
    const adjustedPoints = Math.floor(points * reduction);
    
    if (adjustedPoints > 0) {
      this.pointsHistory.push({ timestamp: now, points: adjustedPoints });
    }
    
    return adjustedPoints;
  }
  
  /**
   * Create a points system error
   * @param code Error code
   * @param message Error message
   * @param originalError Original error if available
   * @returns PointsSystemError
   */
  private createError(
    code: PointsError,
    message: string,
    originalError?: Error
  ): PointsSystemError {
    const error = new Error(message) as PointsSystemError;
    error.code = code;
    error.details = originalError;
    return error;
  }
}