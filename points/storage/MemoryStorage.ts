import { PointsState, PointsError, PointsSystemError } from '../core/types';
import { PointsStorage } from './PointsStorage';

/**
 * MemoryStorage implementation of PointsStorage
 * Uses in-memory storage as a fallback when localStorage is not available
 */
export class MemoryStorage implements PointsStorage {
  private state: PointsState;
  
  /**
   * Constructor
   * Initializes with default state
   */
  constructor() {
    this.state = this.getDefaultState();
  }
  
  /**
   * Save points state to memory
   * @param state Points state to save
   * @returns Promise that resolves when save is complete
   * @throws PointsSystemError if save fails
   */
  public async savePoints(state: PointsState): Promise<void> {
    try {
      // Validate state before saving
      this.validateState(state);
      
      // Save to memory
      this.state = {
        ...state,
        // Ensure lastUpdated is a Date
        lastUpdated: state.lastUpdated instanceof Date ? state.lastUpdated : new Date(state.lastUpdated)
      };
    } catch (error) {
      if (error instanceof Error) {
        throw this.createError(PointsError.STORAGE_ERROR, `Failed to save points: ${error.message}`, error);
      }
      throw this.createError(PointsError.STORAGE_ERROR, 'Failed to save points');
    }
  }
  
  /**
   * Load points state from memory
   * @returns Promise that resolves with loaded points state
   */
  public async loadPoints(): Promise<PointsState> {
    return { ...this.state };
  }
  
  /**
   * Clear stored points from memory
   * @returns Promise that resolves when clear is complete
   */
  public async clearPoints(): Promise<void> {
    this.state = this.getDefaultState();
  }
  
  /**
   * Get default points state
   * @returns Default points state
   */
  private getDefaultState(): PointsState {
    return {
      currentPoints: 0,
      highScore: 0,
      lastUpdated: new Date()
    };
  }
  
  /**
   * Validate points state
   * @param state Points state to validate
   * @throws Error if state is invalid
   */
  private validateState(state: PointsState): void {
    // Check if state is defined
    if (!state) {
      throw new Error('Points state is required');
    }
    
    // Check if currentPoints is a non-negative integer
    if (typeof state.currentPoints !== 'number' || !Number.isInteger(state.currentPoints) || state.currentPoints < 0) {
      throw new Error('Current points must be a non-negative integer');
    }
    
    // Check if highScore is a non-negative integer
    if (typeof state.highScore !== 'number' || !Number.isInteger(state.highScore) || state.highScore < 0) {
      throw new Error('High score must be a non-negative integer');
    }
    
    // Check if lastUpdated is a Date or can be converted to one
    if (!(state.lastUpdated instanceof Date)) {
      try {
        new Date(state.lastUpdated);
      } catch (e) {
        throw new Error('Last updated must be a valid Date or date string');
      }
    }
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