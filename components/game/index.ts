// Main game components
export { CleanMugshotCard } from './mugshot-card'
export { CleanCrimeCard } from './crime-card'
export { CleanGameControls } from './game-controls'
export { CleanGameResults } from './game-results'
export { GameStats } from './game-stats'
export { GameSkeleton } from './game-skeleton'
export { GameError } from './game-error'

// New modular components
export { GameHeader } from './game-header'
export { GameProgress } from './game-progress'
export { GameResultsView } from './game-results-view'

// Hooks
export { useGameLogic } from './hooks/use-game-logic'
export { usePointsSystem } from './hooks/use-points-system'

// Utilities
export { submitGame } from './game-submit-logic'

// Types
export type { Inmate, GameResults, GameState, GameActions } from './types' 