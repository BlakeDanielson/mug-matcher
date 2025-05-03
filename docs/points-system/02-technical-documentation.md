# Points System Technical Documentation

## API Reference

### PointsManager

The central coordinator for the points system.

```typescript
interface PointsManager {
  currentPoints: number;
  highScore: number;
  
  addPoints(matchResult: MatchResult): void;
  resetSession(): void;
  loadSavedState(): Promise<void>;
  saveState(): Promise<void>;
}
```

#### Methods

- `addPoints(matchResult: MatchResult)`: Add points for a match result
- `resetSession()`: Reset current session points
- `loadSavedState()`: Load persisted points state
- `saveState()`: Save current points state

### PointsCalculator

Handles point calculation logic.

```typescript
interface PointsCalculator {
  calculatePoints(matchResult: MatchResult): number;
  validatePoints(points: number): boolean;
}
```

#### Methods

- `calculatePoints(matchResult: MatchResult)`: Calculate points for a match
- `validatePoints(points: number)`: Validate points are within allowed range

### PointsStorage

Handles persistence of points data.

```typescript
interface PointsStorage {
  savePoints(state: PointsState): Promise<void>;
  loadPoints(): Promise<PointsState>;
  clearPoints(): Promise<void>;
}
```

#### Methods

- `savePoints(state: PointsState)`: Save points state
- `loadPoints()`: Load points state
- `clearPoints()`: Clear stored points

## Configuration Options

### Default Configuration

```typescript
const DEFAULT_CONFIG: PointsConfig = {
  scoring: {
    basePoints: 100,        // Base points for correct match
    timeBonus: 50,         // Bonus points for quick matches
    timeBonusThreshold: 5000, // Time threshold for bonus (ms)
    attemptPenalty: 25     // Penalty per additional attempt
  },
  storage: {
    autoSaveInterval: 30000, // Auto-save interval (ms)
    storageKey: 'mugshot-matcher-points'
  },
  display: {
    animationDuration: 500, // Animation duration (ms)
    errorTimeout: 3000     // Error message display time (ms)
  }
};
```

### Scoring Constants

```typescript
const SCORING_CONSTANTS = {
  MIN_POINTS: 0,
  MAX_POINTS: 1000000,
  
  SCORE_LEVELS: {
    BEGINNER: 500,
    INTERMEDIATE: 2000,
    ADVANCED: 5000,
    EXPERT: 10000
  }
};
```

### Configuration Validation

All configuration values are validated at runtime to ensure:
- Numeric values are positive
- Intervals are reasonable
- Storage keys are valid
- Animation durations are appropriate

## Storage Implementation

### LocalStorage Implementation

The primary storage mechanism uses browser's localStorage:

```typescript
class LocalStorage implements PointsStorage {
  constructor(storageKey: string = 'mugshot-matcher-points');
  
  async savePoints(state: PointsState): Promise<void>;
  async loadPoints(): Promise<PointsState>;
  async clearPoints(): Promise<void>;
}
```

#### Storage Format

Points state is stored as JSON:

```typescript
interface PointsState {
  currentPoints: number;
  highScore: number;
  lastUpdated: Date;
}
```

#### Error Handling

- Storage quota exceeded
- Corrupted data recovery
- localStorage availability check
- Type validation on load

### Fallback Storage

Memory storage is used when localStorage is unavailable:

```typescript
class MemoryStorage implements PointsStorage {
  // Same interface as LocalStorage
  // Keeps data in memory only
}
```

## Production Environment Considerations

### Data Persistence Strategy

1. **Primary Storage**
   - Use Redis for session storage
   - PostgreSQL for long-term data retention
   - Regular backups to cloud storage

2. **Data Migration**
   ```typescript
   interface DataMigration {
     version: string;
     up(): Promise<void>;
     down(): Promise<void>;
     validate(): Promise<boolean>;
   }
   ```

3. **Cleanup Policies**
   - Automatic cleanup of inactive sessions after 30 days
   - Regular database vacuuming
   - Log rotation and archival

### Production Configuration

```typescript
const PRODUCTION_CONFIG: ProductionConfig = {
  redis: {
    maxConnections: 50,
    connectionTimeout: 5000,
    retryStrategy: exponentialBackoff
  },
  database: {
    poolSize: 20,
    statementTimeout: 30000,
    idleTimeout: 60000
  },
  cache: {
    ttl: 3600,
    maxSize: '1gb',
    updateInterval: 300
  }
};
```

### Error Recovery

1. **Automatic Recovery**
   - Circuit breaker implementation
   - Retry strategies with backoff
   - Fallback to secondary storage

2. **Data Integrity**
   - Checksums for stored data
   - Version control for state changes
   - Audit logging of operations

## Performance Optimization

### Resource Management

1. **Memory Optimization**
   - Implement LRU caching
   - Batch processing for bulk operations
   - Stream large datasets

2. **Connection Pooling**
   - Database connection pools
   - Redis connection management
   - Resource cleanup

### Caching Strategy

```typescript
interface CacheConfig {
  level: 'memory' | 'redis' | 'distributed';
  ttl: number;
  maxSize: number;
  updatePolicy: 'write-through' | 'write-behind';
}
```

### Load Balancing

1. **Request Distribution**
   - Round-robin load balancing
   - Health check integration
   - Automatic failover

2. **Rate Limiting**
   - Per-user limits
   - Global rate limiting
   - Burst handling

## Monitoring and Maintenance

### Health Checks

1. **System Health**
   ```typescript
   interface HealthCheck {
     status: 'healthy' | 'degraded' | 'unhealthy';
     components: ComponentStatus[];
     lastCheck: Date;
   }
   ```

2. **Metrics Collection**
   - Response times
   - Error rates
   - Resource utilization
   - User activity patterns

### Logging Strategy

1. **Log Levels**
   ```typescript
   enum LogLevel {
     DEBUG = 'debug',
     INFO = 'info',
     WARN = 'warn',
     ERROR = 'error',
     CRITICAL = 'critical'
   }
   ```

2. **Log Aggregation**
   - Centralized logging
   - Log correlation
   - Search and analysis

### Maintenance Procedures

1. **Database Maintenance**
   - Index optimization
   - Statistics updates
   - Vacuum operations

2. **Cache Management**
   - Cache warming
   - Invalidation strategies
   - Memory monitoring

3. **Backup Procedures**
   - Automated backups
   - Point-in-time recovery
   - Backup verification