import { MatchResult, PointsError, PointsSystemError, SCORING } from './types';

/**
 * PointsCalculator class
 * Handles calculation of points based on match results
 */
export class PointsCalculator {
  private basePoints: number;
  private timeBonus: number;
  private timeBonusThreshold: number;
  private attemptPenalty: number;

  /**
   * Constructor
   * @param basePoints Base points for correct match
   * @param timeBonus Bonus points for quick matches
   * @param timeBonusThreshold Time threshold for bonus (ms)
   * @param attemptPenalty Penalty for multiple attempts
   */
  constructor(
    basePoints: number = 100,
    timeBonus: number = 50,
    timeBonusThreshold: number = 5000,
    attemptPenalty: number = 25
  ) {
    this.basePoints = basePoints;
    this.timeBonus = timeBonus;
    this.timeBonusThreshold = timeBonusThreshold;
    this.attemptPenalty = attemptPenalty;
  }

  /**
   * Calculate points for a match result
   * @param matchResult The match result
   * @returns Calculated points
   * @throws PointsSystemError if calculation fails
   */
  public calculatePoints(matchResult: MatchResult): number {
    try {
      // Validate match result
      this.validateMatchResult(matchResult);

      // No points for incorrect matches
      if (!matchResult.correct) {
        return 0;
      }

      // Start with base points
      let points = this.basePoints;

      // Add time bonus if applicable
      if (matchResult.timeElapsed < this.timeBonusThreshold) {
        points += this.timeBonus;
      }

      // Apply attempt penalty if applicable
      if (matchResult.attemptCount > 1) {
        // Apply penalty for each additional attempt beyond the first
        const penalty = this.attemptPenalty * (matchResult.attemptCount - 1);
        points = Math.max(0, points - penalty);
      }

      // Validate final points
      return this.validatePoints(points);
    } catch (error) {
      if (error instanceof Error) {
        throw this.createError(PointsError.CALCULATION_ERROR, error.message, error);
      }
      throw this.createError(PointsError.CALCULATION_ERROR, 'Unknown calculation error');
    }
  }

  /**
   * Validate points are within allowed range
   * @param points Points to validate
   * @returns Validated points
   * @throws PointsSystemError if points are invalid
   */
  public validatePoints(points: number): number {
    // Check if points are a number
    if (typeof points !== 'number' || isNaN(points)) {
      throw this.createError(PointsError.INVALID_POINTS, 'Points must be a number');
    }

    // Check if points are an integer
    if (!Number.isInteger(points)) {
      // Round to nearest integer
      points = Math.round(points);
    }

    // Check if points are within allowed range
    if (points < SCORING.MIN_POINTS) {
      return SCORING.MIN_POINTS;
    }

    if (points > SCORING.MAX_POINTS) {
      return SCORING.MAX_POINTS;
    }

    return points;
  }

  /**
   * Validate match result
   * @param matchResult Match result to validate
   * @throws PointsSystemError if match result is invalid
   */
  private validateMatchResult(matchResult: MatchResult): void {
    // Check if match result is defined
    if (!matchResult) {
      throw this.createError(PointsError.CALCULATION_ERROR, 'Match result is required');
    }

    // Check if correct is a boolean
    if (typeof matchResult.correct !== 'boolean') {
      throw this.createError(PointsError.CALCULATION_ERROR, 'Match result correct must be a boolean');
    }

    // Check if time elapsed is a positive number
    if (typeof matchResult.timeElapsed !== 'number' ||
        !Number.isFinite(matchResult.timeElapsed) ||
        matchResult.timeElapsed <= 0) {
      throw this.createError(
        PointsError.CALCULATION_ERROR,
        'Time elapsed must be a positive number'
      );
    }

    // Check if attempt count is a positive integer
    if (typeof matchResult.attemptCount !== 'number' ||
        !Number.isInteger(matchResult.attemptCount) ||
        matchResult.attemptCount <= 0) {
      throw this.createError(
        PointsError.CALCULATION_ERROR,
        'Attempt count must be a positive integer'
      );
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