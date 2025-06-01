export interface Inmate {
  id: number
  name: string
  image: string
  crime?: string
  crimeSeverity?: 'High' | 'Medium' | 'Low' | 'Unknown'
}

export interface GameResults {
  score: number
  total: number
  percentage: number
  submitted: boolean
  correctMatches: number[]
  incorrectMatches?: number[]
  totalCorrect?: number
  totalIncorrect?: number
  accuracy?: number
  pointsEarned?: number
  detailedResults: Array<{
    mugshotId: string
    mugshotName: string
    mugshotImage: string
    actualCrime: string
    userGuessId: string
    userGuessCrime: string
    isCorrect: boolean
  }>
}

export interface GameState {
  inmates: Inmate[]
  shuffledMugshotImages: Inmate[]
  shuffledCrimeDescriptions: Inmate[]
  selectedMugshotId: string | null
  selectedDescriptionId: string | null
  matches: Record<string, string | null>
  results: GameResults | null
  loading: boolean
  error: string | null
  attemptCounts: Record<string, number>
  currentPoints: number
  highScore: number
}

export interface GameActions {
  setSelectedMugshotId: (id: string | null) => void
  setSelectedDescriptionId: (id: string | null) => void
  setMatches: React.Dispatch<React.SetStateAction<Record<string, string | null>>>
  setResults: (results: GameResults | null) => void
  setAttemptCounts: React.Dispatch<React.SetStateAction<Record<string, number>>>
  resetGame: (data?: Inmate[]) => void
  handleSubmit: () => void
  getInmateDataById: (id: string | number) => Inmate | undefined
} 