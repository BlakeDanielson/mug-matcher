# Points System Integration Guide

## Setup Instructions

### 1. Installation

```typescript
import { PointsManager, LocalStorage, PointsConfig } from '@/points';

// Create storage instance
const storage = new LocalStorage('your-storage-key');

// Optional: Configure points system
const config: Partial<PointsConfig> = {
  scoring: {
    basePoints: 100,
    timeBonus: 50,
    timeBonusThreshold: 5000,
    attemptPenalty: 25
  },
  storage: {
    autoSaveInterval: 30000,
    storageKey: 'your-storage-key'
  }
};

// Initialize points manager
const pointsManager = new PointsManager(config, storage);
await pointsManager.initialize();
```

### 2. Basic Integration

```typescript
// Handle match completion
const matchResult = {
  correct: true,
  timeElapsed: 3000, // milliseconds
  attemptCount: 1
};

// Add points for match
const pointsEarned = pointsManager.addPoints(matchResult);

// Save state (auto-save is also configured)
await pointsManager.saveState();
```

### 3. UI Integration

```typescript
// Listen for points updates
window.addEventListener('pointsUpdated', (event: CustomEvent) => {
  const { currentPoints, highScore, pointsEarned } = event.detail;
  
  // Update UI elements
  updateScoreDisplay(currentPoints, highScore);
  showPointsAnimation(pointsEarned);
});
```

## Usage Examples

### 1. Complete Game Flow

```typescript
class GameComponent {
  private pointsManager: PointsManager;
  
  async initialize() {
    // Initialize points system
    this.pointsManager = new PointsManager();
    await this.pointsManager.initialize();
    
    // Load existing state
    const currentPoints = this.pointsManager.currentPoints;
    const highScore = this.pointsManager.highScore;
    
    // Update initial UI
    this.updateScoreDisplay(currentPoints, highScore);
  }
  
  handleMatchComplete(matchData: MatchResult) {
    // Calculate and add points
    const pointsEarned = this.pointsManager.addPoints(matchData);
    
    // Update UI
    this.showPointsEarned(pointsEarned);
    this.updateScoreDisplay(
      this.pointsManager.currentPoints,
      this.pointsManager.highScore
    );
  }
  
  async handleGameReset() {
    // Reset session points
    this.pointsManager.resetSession();
    
    // Update UI
    this.updateScoreDisplay(0, this.pointsManager.highScore);
  }
  
  async cleanup() {
    // Save final state
    await this.pointsManager.saveState();
    
    // Cleanup points system
    await this.pointsManager.cleanup();
  }
}
```

### 2. Custom Storage Implementation

```typescript
class CustomStorage implements PointsStorage {
  async savePoints(state: PointsState): Promise<void> {
    // Custom save implementation
    await this.database.save('points', state);
  }
  
  async loadPoints(): Promise<PointsState> {
    // Custom load implementation
    const state = await this.database.load('points');
    return state || this.getDefaultState();
  }
  
  async clearPoints(): Promise<void> {
    // Custom clear implementation
    await this.database.delete('points');
  }
  
  private getDefaultState(): PointsState {
    return {
      currentPoints: 0,
      highScore: 0,
      lastUpdated: new Date()
    };
  }
}
```

### 3. Advanced Configuration

```typescript
const advancedConfig: PointsConfig = {
  scoring: {
    basePoints: 200,
    timeBonus: 100,
    timeBonusThreshold: 2000,
    attemptPenalty: 50
  },
  storage: {
    autoSaveInterval: 60000,
    storageKey: 'custom-storage-key'
  },
  display: {
    animationDuration: 500,
    errorTimeout: 3000
  }
};

const pointsManager = new PointsManager(advancedConfig);
```

## Best Practices

### 1. State Management

- Always initialize the points system before use
- Handle state persistence properly
- Clean up resources when done
- Use proper error handling

```typescript
try {
  await pointsManager.initialize();
  // Use points system
} catch (error) {
  handleError(error);
} finally {
  await pointsManager.cleanup();
}
```

### 2. Performance Optimization

- Batch UI updates
- Use appropriate auto-save intervals
- Clean up event listeners
- Cache calculated values

```typescript
// Batch UI updates
let pendingUpdates = [];
const batchSize = 5;

function handleUpdate(update) {
  pendingUpdates.push(update);
  
  if (pendingUpdates.length >= batchSize) {
    updateUI(pendingUpdates);
    pendingUpdates = [];
  }
}
```

### 3. Error Handling

```typescript
function handlePointsError(error: PointsSystemError) {
  switch (error.code) {
    case PointsError.STORAGE_ERROR:
      // Handle storage errors
      showStorageErrorMessage();
      break;
      
    case PointsError.CALCULATION_ERROR:
      // Handle calculation errors
      logCalculationError(error);
      break;
      
    case PointsError.INVALID_POINTS:
      // Handle validation errors
      showValidationError(error.message);
      break;
      
    default:
      // Handle unknown errors
      logUnknownError(error);
  }
}
```

### 4. Testing Integration

```typescript
describe('Points Integration', () => {
  let pointsManager: PointsManager;
  
  beforeEach(async () => {
    // Use MemoryStorage for tests
    const storage = new MemoryStorage();
    pointsManager = new PointsManager({}, storage);
    await pointsManager.initialize();
  });
  
  afterEach(async () => {
    await pointsManager.cleanup();
  });
  
  it('should handle match completion', () => {
    const result = {
      correct: true,
      timeElapsed: 3000,
      attemptCount: 1
    };
    
    const points = pointsManager.addPoints(result);
    expect(points).toBe(150);
  });
});
```

## Error Handling

### Common Errors

1. **Storage Errors**
   - Storage unavailable
   - Quota exceeded
   - Corrupted data
   
2. **Calculation Errors**
   - Invalid match results
   - Point calculation failures
   - Validation errors
   
3. **State Errors**
   - Initialization failures
   - Save/load failures
   - Reset errors

### Error Recovery

```typescript
async function initializeWithRecovery() {
  try {
    await pointsManager.initialize();
  } catch (error) {
    if (error.code === PointsError.STORAGE_ERROR) {
      // Fall back to memory storage
      const memoryStorage = new MemoryStorage();
      pointsManager = new PointsManager({}, memoryStorage);
      await pointsManager.initialize();
    } else {
      throw error;
    }
  }
}