import { PointsState } from '../core/types';

/**
 * PointsStorage interface
 * Defines the contract for points storage implementations
 */
export interface PointsStorage {
  /**
   * Save points state
   * @param state Points state to save
   * @returns Promise that resolves when save is complete
   */
  savePoints(state: PointsState): Promise<void>;
  
  /**
   * Load points state
   * @returns Promise that resolves with loaded points state
   */
  loadPoints(): Promise<PointsState>;
  
  /**
   * Clear stored points
   * @returns Promise that resolves when clear is complete
   */
  clearPoints(): Promise<void>;
}