import { GameResults, Inmate } from './types'

interface CorrectMatch {
  mugshotId: string
  mugshotName: string
  mugshotImage: string
  actualCrime: string
  userGuessId: string
  userGuessCrime: string
  isCorrect: boolean
}

interface ToastFunction {
  (options: {
    title: string
    description: string
    variant?: 'default' | 'destructive'
  }): void
}

interface SubmitGameParams {
  matches: Record<string, string | null>
  shuffledCrimeDescriptions: Inmate[]
  getInmateDataById: (id: string | number) => Inmate | undefined
  attemptCounts: Record<string, number>
  gameStartTime: number
  addPointsForMatches: (correctMatches: CorrectMatch[], attemptCounts: Record<string, number>, gameStartTime: number) => number
  toast: ToastFunction
  triggerHaptic: (type?: 'light' | 'medium' | 'heavy' | 'success' | 'error') => void
  formatPoints: (points: number) => string
}

export function submitGame({
  matches,
  shuffledCrimeDescriptions,
  getInmateDataById,
  attemptCounts,
  gameStartTime,
  addPointsForMatches,
  toast,
  triggerHaptic,
  formatPoints
}: SubmitGameParams): GameResults | null {
  // Check if all crime descriptions have been matched
  const allDescriptionsMatched = shuffledCrimeDescriptions.length === Object.values(matches).filter(v => v !== null).length

  if (!allDescriptionsMatched) {
    toast({
      title: "Incomplete Matches",
      description: "Please match all images before submitting.",
      variant: "destructive",
    })
    return null
  }

  // Calculate score and detailed results
  const detailedResults: GameResults['detailedResults'] = []

  Object.entries(matches).forEach(([guessedCrimeId, mugshotId]) => {
    if (mugshotId) {
      const mugshot = getInmateDataById(mugshotId)
      const guessedCrime = getInmateDataById(guessedCrimeId)
      const actualCrime = getInmateDataById(mugshotId)
      
      if (mugshot && guessedCrime && actualCrime) {
        detailedResults.push({
          mugshotId: mugshotId,
          mugshotName: mugshot.name,
          mugshotImage: mugshot.image,
          actualCrime: actualCrime.crime || "Unknown crime",
          userGuessId: guessedCrimeId,
          userGuessCrime: guessedCrime.crime || "Unknown crime",
          isCorrect: guessedCrimeId === mugshotId
        })
      }
    }
  })

  const correctMatches = detailedResults.filter(result => result.isCorrect)
  const incorrectMatches = detailedResults.filter(result => !result.isCorrect)

  const score = correctMatches.length
  const total = shuffledCrimeDescriptions.length
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0

  // Calculate points
  const totalPointsEarned = addPointsForMatches(correctMatches, attemptCounts, gameStartTime)

  const gameResults: GameResults = {
    score,
    total,
    percentage,
    submitted: true,
    correctMatches: correctMatches.map(result => Number(result.mugshotId)),
    incorrectMatches: incorrectMatches.map(result => Number(result.mugshotId)),
    totalCorrect: correctMatches.length,
    totalIncorrect: incorrectMatches.length,
    accuracy: percentage,
    pointsEarned: totalPointsEarned,
    detailedResults: detailedResults
  }

  // Haptic feedback based on performance
  if (score === total && total > 0) {
    triggerHaptic('success')
  } else if (percentage >= 70) {
    triggerHaptic('medium')
  } else {
    triggerHaptic('error')
  }

  toast({
    title: `Your Score: ${score}/${total}`,
    description: `You got ${percentage}% correct! ${totalPointsEarned > 0 ? `+${formatPoints(totalPointsEarned)} points!` : ''}`,
    variant: score === total && total > 0 ? "default" : "destructive",
  })

  return gameResults
} 