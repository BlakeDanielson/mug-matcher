import { PointsState, PointsError, PointsSystemError } from '../core/types';
import { PointsStorage } from './PointsStorage';

/**
 * LocalStorage implementation of PointsStorage
 * Uses browser's localStorage for persistence
 */
export class LocalStorage implements PointsStorage {
  private storageKey: string;
  
  /**
   * Constructor
   * @param storageKey Key to use for localStorage
   */
  constructor(storageKey: string = 'mugshot-matcher-points') {
    this.storageKey = storageKey;
  }
  
  /**
   * Save points state to localStorage
   * @param state Points state to save
   * @returns Promise that resolves when save is complete
   * @throws PointsSystemError if save fails
   */
  public async savePoints(state: PointsState): Promise<void> {
    try {
      // Validate and normalize state before saving
      const validatedState: PointsState = {
        currentPoints: this.validateNumber(state.currentPoints, 0, 1000000),
        highScore: this.validateNumber(state.highScore, 0, 1000000),
        lastUpdated: this.validateDate(state.lastUpdated)
      };

      // Ensure high score is at least current points
      if (validatedState.highScore < validatedState.currentPoints) {
        validatedState.highScore = validatedState.currentPoints;
      }

      // Convert Date to ISO string for storage
      const storableState = {
        ...validatedState,
        lastUpdated: validatedState.lastUpdated.toISOString()
      };
      
      // Save to localStorage
      localStorage.setItem(this.storageKey, JSON.stringify(storableState));
    } catch (error) {
      // On any validation or save error, clear data and throw
      await this.clearPoints();
      if (error instanceof Error) {
        throw this.createError(PointsError.STORAGE_ERROR, `Failed to save points: ${error.message}`, error);
      }
      throw this.createError(PointsError.STORAGE_ERROR, 'Failed to save points');
    }
  }
  
  /**
   * Load points state from localStorage
   * @returns Promise that resolves with loaded points state
   * @throws PointsSystemError if load fails
   */
  public async loadPoints(): Promise<PointsState> {
    try {
      // Check if localStorage is available
      if (!this.isLocalStorageAvailable()) {
        return this.getDefaultState();
      }
      
      // Get data from localStorage
      const data = localStorage.getItem(this.storageKey);
      
      // If no data, return default state
      if (!data) {
        return this.getDefaultState();
      }
      
      try {
        // Parse data
        const parsedData = JSON.parse(data);
        
        // Basic structure validation
        if (!parsedData || typeof parsedData !== 'object') {
          throw new Error('Invalid data structure');
        }

        // Convert ISO string back to Date and validate fields
        const state: PointsState = {
          currentPoints: this.validateNumber(parsedData.currentPoints, 0, 1000000),
          highScore: this.validateNumber(parsedData.highScore, 0, 1000000),
          lastUpdated: this.validateDate(parsedData.lastUpdated)
        };

        // Additional validation
        if (state.highScore < state.currentPoints) {
          state.highScore = state.currentPoints;
        }

        return state;
      } catch (parseError) {
        // On any validation or parsing error, clear data and return default
        await this.clearPoints();
        return this.getDefaultState();
      }
    } catch (error) {
      return this.getDefaultState();
    }
  }

  /**
   * Validate a number is within range
   * @param value Value to validate
   * @param min Minimum allowed value
   * @param max Maximum allowed value
   * @returns Validated number
   */
  private validateNumber(value: any, min: number, max: number): number {
    const num = Number(value);
    if (isNaN(num) || !Number.isInteger(num) || num < min || num > max) {
      return min;
    }
    return num;
  }

  /**
   * Validate a date string or Date object
   * @param value Value to validate
   * @returns Valid Date object
   */
  private validateDate(value: any): Date {
    try {
      const date = new Date(value);
      if (isNaN(date.getTime()) || date > new Date()) {
        return new Date();
      }
      return date;
    } catch {
      return new Date();
    }
  }
  
  /**
   * Clear stored points from localStorage
   * @returns Promise that resolves when clear is complete
   * @throws PointsSystemError if clear fails
   */
  public async clearPoints(): Promise<void> {
    try {
      // Check if localStorage is available
      if (!this.isLocalStorageAvailable()) {
        throw new Error('localStorage is not available');
      }
      
      // Remove data from localStorage
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      if (error instanceof Error) {
        throw this.createError(PointsError.STORAGE_ERROR, `Failed to clear points: ${error.message}`, error);
      }
      throw this.createError(PointsError.STORAGE_ERROR, 'Failed to clear points');
    }
  }
  
  /**
   * Check if localStorage is available
   * @returns True if localStorage is available, false otherwise
   */
  private isLocalStorageAvailable(): boolean {
    try {
      // Try to access localStorage
      if (typeof window === 'undefined' || !window.localStorage) {
        return false;
      }
      
      // Try to use localStorage
      const testKey = '__test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
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
  private validateState(state: PointsState): boolean {
    try {
      // Check if state is defined
      if (!state) {
        return false;
      }
      
      // Check if currentPoints is valid
      if (typeof state.currentPoints !== 'number' ||
          !Number.isInteger(state.currentPoints) ||
          state.currentPoints < 0 ||
          state.currentPoints > 1000000) {
        return false;
      }
      
      // Check if highScore is valid
      if (typeof state.highScore !== 'number' ||
          !Number.isInteger(state.highScore) ||
          state.highScore < 0 ||
          state.highScore > 1000000 ||
          state.highScore < state.currentPoints) {
        return false;
      }
      
      // Check if lastUpdated is valid
      if (!(state.lastUpdated instanceof Date) && typeof state.lastUpdated !== 'string') {
        return false;
      }

      // Check if lastUpdated is not in the future
      const lastUpdated = state.lastUpdated instanceof Date ?
        state.lastUpdated :
        new Date(state.lastUpdated);
      
      if (isNaN(lastUpdated.getTime()) || lastUpdated > new Date()) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
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