# Points System Specification

## Overview
System for tracking, persisting and displaying points earned in the mugshot matching game.

## Core Components

### PointsManager
```typescript
interface PointsManager {
  // Current game session points
  currentPoints: number;
  
  // Historical high score
  highScore: number;
  
  // Add points for correct match
  addPoints(matchResult: MatchResult): void;
  
  // Reset points for current session
  resetSession(): void;
  
  // Load persisted points/high score
  loadSavedState(): Promise<void>;
  
  // Save current state
  saveState(): Promise<void>;
}

interface MatchResult {
  correct: boolean;
  timeElapsed: number; // ms
  attemptCount: number;
}
```

### Points Calculator
```typescript
interface PointsCalculator {
  // Calculate points earned for a match
  calculatePoints(matchResult: MatchResult): number;
  
  // Validate points are within allowed range
  validatePoints(points: number): boolean;
}

// Default scoring rules
const DEFAULT_SCORING = {
  CORRECT_MATCH: 100,
  TIME_BONUS_THRESHOLD: 5000, // ms
  TIME_BONUS: 50,
  ATTEMPT_PENALTY: -25,
  MIN_POINTS: 0,
  MAX_POINTS: 1000000
};
```

### Storage Interface
```typescript
interface PointsStorage {
  // Save points state
  savePoints(state: PointsState): Promise<void>;
  
  // Load points state
  loadPoints(): Promise<PointsState>;
  
  // Clear stored points
  clearPoints(): Promise<void>;
}

interface PointsState {
  currentPoints: number;
  highScore: number;
  lastUpdated: Date;
}
```

### Display Components
```typescript
interface ScoreDisplay {
  // Update displayed scores
  updateScores(current: number, high: number): void;
  
  // Show points animation
  animatePoints(points: number, isBonus: boolean): void;
  
  // Display error state
  showError(message: string): void;
}
```

## Error Handling

### Error Types
```typescript
enum PointsError {
  INVALID_POINTS = 'INVALID_POINTS',
  STORAGE_ERROR = 'STORAGE_ERROR',
  CALCULATION_ERROR = 'CALCULATION_ERROR'
}

interface PointsSystemError extends Error {
  code: PointsError;
  details?: any;
}
```

### Validation Rules
- Points must be non-negative integers
- Points must not exceed MAX_POINTS
- Time values must be positive
- Attempt counts must be positive integers

## Integration Points

### Game Integration
```typescript
interface GameIntegration {
  // Initialize points system
  initializePoints(): Promise<void>;
  
  // Handle match completion
  onMatchComplete(result: MatchResult): void;
  
  // Handle game reset
  onGameReset(): void;
  
  // Clean up points system
  cleanup(): void;
}
```

### Storage Implementation
- Use localStorage for web persistence
- Fall back to memory storage if localStorage unavailable
- Implement periodic auto-save
- Handle storage quota exceeded errors

## Configuration

### Config Interface
```typescript
interface PointsConfig {
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
```

## Test Cases

### Core Logic Tests
1. Points calculation
   - Correct match within time bonus
   - Correct match with multiple attempts
   - Edge cases (0 points, max points)

2. State management
   - Session reset
   - High score updates
   - Points persistence

### Error Cases
1. Invalid points values
2. Storage failures
3. Calculation errors
4. Network/async errors

### Integration Tests
1. Game event handling
2. UI updates
3. Storage integration
4. Config validation

## Implementation Notes

1. Performance Considerations
   - Minimize storage operations
   - Batch UI updates
   - Cache calculated values

2. Security
   - Validate all stored data
   - Sanitize displayed values
   - Handle tampering attempts

3. Accessibility
   - Screen reader support for scores
   - High contrast score displays
   - Keyboard navigation support