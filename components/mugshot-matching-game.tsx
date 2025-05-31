"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowRightLeft } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { useToast } from "@/hooks/use-toast"
import { 
  useHapticFeedback
} from "@/hooks/use-mobile-interactions"

import {
  PointsManager,
  ScoreDisplay,
  createMatchResult,
  handleGameReset,
  cleanupPointsSystem,
  formatPoints
} from "@/points"

// Import modular game components
import {
  Inmate,
  GameResults,
  GameSkeleton,
  GameError,
  GameStats,
  CleanMugshotCard,
  CleanCrimeCard,
  CleanGameControls,
  CleanGameResults
} from "@/components/game"

// Progress Bar Component
function GameProgress({ 
  totalMatches 
}: { 
  totalMatches: number 
}) {
  const progressValue = totalMatches > 0 ? (totalMatches / 6) * 100 : 0
  
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span>Progress</span>
        <span>{totalMatches}/6</span>
      </div>
      <Progress 
        value={progressValue} 
        className="h-2 bg-gray-700"
      />
    </div>
  )
}

export default function MugshotMatchingGame() {
  const { toast } = useToast()
  const isMobile = useIsMobile()
  
  // Mobile interaction hooks
  const { triggerHaptic } = useHapticFeedback()

  const [inmates, setInmates] = useState<Inmate[]>([])
  const [shuffledMugshotImages, setShuffledMugshotImages] = useState<Inmate[]>([])
  const [shuffledCrimeDescriptions, setShuffledCrimeDescriptions] = useState<Inmate[]>([])
  const [selectedMugshotId, setSelectedMugshotId] = useState<string | null>(null)
  const [selectedDescriptionId, setSelectedDescriptionId] = useState<string | null>(null)
  const [matches, setMatches] = useState<Record<string, string | null>>({})
  const [results, setResults] = useState<GameResults | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false)

  // Points system state
  const [currentPoints, setCurrentPoints] = useState<number>(0)
  const [highScore, setHighScore] = useState<number>(0)
  const pointsManagerRef = useRef<PointsManager | null>(null)
  const scoreDisplayRef = useRef<ScoreDisplay | null>(null)
  
  // Game state tracking
  const [attemptCounts, setAttemptCounts] = useState<Record<string, number>>({})
  const gameStartTimeRef = useRef<number>(Date.now())

  // Fetch inmate data from the API
  useEffect(() => {
    const fetchInmates = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/inmates')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        
        // Handle the API response structure { inmates: [...] }
        const inmatesArray = data.inmates || data
        
        if (!Array.isArray(inmatesArray) || inmatesArray.length === 0) {
          throw new Error('No inmate data received')
        }
        
        setInmates(inmatesArray)
        resetGame(inmatesArray)
      } catch (err) {
        console.error('Error fetching inmates:', err)
        setError(err instanceof Error ? err.message : 'Failed to load game data')
      } finally {
        setLoading(false)
      }
    }

    fetchInmates()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Mark as initially loaded after content is ready
  useEffect(() => {
    if (!loading && inmates.length > 0 && !hasInitiallyLoaded) {
      const timer = setTimeout(() => {
        setHasInitiallyLoaded(true)
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [loading, inmates.length, hasInitiallyLoaded])

  // Enable animations after everything is loaded
  useEffect(() => {
    if (!loading && inmates.length > 0) {
      // Mark as initially loaded first
      setHasInitiallyLoaded(true)
    }
  }, [loading, inmates.length])

  // Retry function for error state
  const retryFetch = () => {
    setError(null)
    setLoading(true)
    // Re-trigger the fetch
    window.location.reload()
  }

  // Initialize points system
  useEffect(() => {
    const initPoints = async () => {
      try {
        // Import dynamically to avoid SSR issues
        const { createPointsManager } = await import('@/points')
        
        // Create points manager
        const manager = await createPointsManager()
        pointsManagerRef.current = manager
        
        // Update state with current points and high score
        setCurrentPoints(manager.currentPoints)
        setHighScore(manager.highScore)
      } catch (error) {
        console.error('Failed to initialize points system:', error)
      }
    }
    
    initPoints()
    
    // Cleanup on unmount
    return () => {
      if (pointsManagerRef.current) {
        cleanupPointsSystem(pointsManagerRef.current).catch(console.error)
      }
    }
  }, [])

  // Effect to handle matching when both a mugshot and description are selected
  useEffect(() => {
    if (selectedMugshotId && selectedDescriptionId) {
      // Track attempt count for this description
      setAttemptCounts(prev => ({
        ...prev,
        [selectedDescriptionId]: (prev[selectedDescriptionId] || 0) + 1
      }))

      // Update the matches state
      setMatches((prev) => {
        const newMatches = { ...prev }
        // Remove the mugshot if it was previously assigned to another description
        Object.keys(newMatches).forEach(key => {
          if (newMatches[key] === selectedMugshotId) {
            newMatches[key] = null;
          }
        });
        // Assign the selected mugshot to the selected description
        newMatches[selectedDescriptionId] = selectedMugshotId
        return newMatches
      })

      // Reset selections
      setSelectedMugshotId(null)
      setSelectedDescriptionId(null)
    }
  }, [selectedMugshotId, selectedDescriptionId]) // Dependency array

  // Initialize score display after DOM is ready
  useEffect(() => {
    // Wait for DOM elements to be available
    if (typeof document === 'undefined' || !pointsManagerRef.current) return
    
    // Small delay to ensure DOM is fully rendered
    const timer = setTimeout(() => {
      try {
        const display = new ScoreDisplay(
          '#current-score',
          '#high-score',
          '.game-container',
          { animationDuration: 800 }
        )
        scoreDisplayRef.current = display
        
        // Update display
        if (pointsManagerRef.current) {
          display.updateScores(
            pointsManagerRef.current.currentPoints,
            pointsManagerRef.current.highScore
          )
        }
      } catch (error) {
        console.error('Failed to initialize score display:', error)
      }
    }, 100)
    
    return () => clearTimeout(timer)
  }, [currentPoints, highScore]) // Re-run when points change

  // Shuffle the mugshots and crimes
  const resetGame = (data = inmates) => {
    if (!data.length) return
    
    // Reset animation state for new game
    setHasInitiallyLoaded(false)
    
    // Shuffle images and descriptions separately
    const shuffledImages = [...data].sort(() => Math.random() - 0.5)
    const shuffledDescriptions = [...data].sort(() => Math.random() - 0.5)

    setShuffledCrimeDescriptions(shuffledDescriptions) // Set descriptions
    setShuffledMugshotImages(shuffledImages) // Set images
    setMatches({})
    setResults(null)
    setAttemptCounts({})
    gameStartTimeRef.current = Date.now()
    
    // Reset points for current session
    if (pointsManagerRef.current && scoreDisplayRef.current) {
      handleGameReset(pointsManagerRef.current, scoreDisplayRef.current)
    }
  }

  // Submit and evaluate matches
  const handleSubmit = () => {
    // Check if all crime descriptions have been matched with a mugshot image
    // Ensure all descriptions have a non-null match value
    const allDescriptionsMatched = shuffledCrimeDescriptions.length === Object.values(matches).filter(v => v !== null).length;

    if (!allDescriptionsMatched) {
      toast({
        title: "Incomplete Matches",
        description: "Please match all images before submitting.",
        variant: "destructive",
      })
      return
    }

    // Calculate score and detailed results
    const detailedResults: GameResults['detailedResults'] = [];

    Object.entries(matches).forEach(([guessedCrimeId, mugshotId]) => {
      if (mugshotId) {
        const mugshot = getInmateDataById(mugshotId);
        const guessedCrime = getInmateDataById(guessedCrimeId);
        const actualCrime = getInmateDataById(mugshotId); // The actual crime for this mugshot
        
        if (mugshot && guessedCrime && actualCrime) {
          detailedResults.push({
            mugshotId: mugshotId,
            mugshotName: mugshot.name,
            mugshotImage: mugshot.image,
            actualCrime: actualCrime.crime || "Unknown crime",
            userGuessId: guessedCrimeId,
            userGuessCrime: guessedCrime.crime || "Unknown crime",
            isCorrect: guessedCrimeId === mugshotId
          });
        }
      }
    });

    const correctMatches = detailedResults.filter(result => result.isCorrect);
    const incorrectMatches = detailedResults.filter(result => !result.isCorrect);

    const score = correctMatches.length;
    const total = shuffledCrimeDescriptions.length;
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

    // Calculate points
    let totalPointsEarned = 0
    
    if (pointsManagerRef.current) {
      // Calculate time elapsed since game start
      const timeElapsed = Date.now() - gameStartTimeRef.current
      // Process each correct match for points
      correctMatches.forEach(result => {
        const attemptCount = attemptCounts[result.userGuessId] || 1

        // Create match result
        const matchResult = createMatchResult(true, timeElapsed, attemptCount)
        
        // Add points
        const pointsEarned = pointsManagerRef.current!.addPoints(matchResult)
        totalPointsEarned += pointsEarned
      })
      
      // Update points display
      if (scoreDisplayRef.current) {
        scoreDisplayRef.current.updateScores(
          pointsManagerRef.current.currentPoints,
          pointsManagerRef.current.highScore
        )
        
        // Animate points if earned
        if (totalPointsEarned > 0) {
          scoreDisplayRef.current.animatePoints(totalPointsEarned, true)
        }
      }
      
      // Save state
      pointsManagerRef.current.saveState().catch(error => {
        console.warn('Failed to save points state:', error)
      })
      
      // Update state
      setCurrentPoints(pointsManagerRef.current.currentPoints)
      setHighScore(pointsManagerRef.current.highScore)
    }

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

    setResults(gameResults)

    // Haptic feedback based on performance
    if (score === total && total > 0) {
      // Perfect score - success pattern
      triggerHaptic('success');
    } else if (percentage >= 70) {
      // Good score - medium feedback
      triggerHaptic('medium');
    } else {
      // Poor score - error pattern
      triggerHaptic('error');
    }

    toast({
      title: `Your Score: ${score}/${total}`,
      description: `You got ${percentage}% correct! ${totalPointsEarned > 0 ? `+${formatPoints(totalPointsEarned)} points!` : ''}`,
      variant: score === total && total > 0 ? "default" : "destructive",
    })
  }

  // Find the mugshot data (name, image, crime) by ID
  const getInmateDataById = (id: string | number): Inmate | undefined => {
    // Ensure comparison is done with string IDs if necessary, or convert id to number
    const numericId = Number(id);
    return inmates.find((inmate) => inmate.id === numericId);
  }

  const handleMatch = (mugshotId: string, crimeId: string) => {
    const currentAttempts = attemptCounts[mugshotId] || 0
    setAttemptCounts(prev => ({
      ...prev,
      [mugshotId]: currentAttempts + 1
    }))

    setMatches(prev => ({ ...prev, [mugshotId]: crimeId }))
    setSelectedMugshotId(null)
    setSelectedDescriptionId(null)
    
    triggerHaptic('medium')
  }

  // If loading, show a loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen p-6">
        <GameSkeleton />
      </div>
    )
  }

  // If error, show an error state
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen p-6">
        <GameError error={error} onRetry={retryFetch} />
      </div>
    )
  }

  // If results, show the results section
  if (results) {
    return (
      <div className="w-full min-h-screen bg-white dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-none">
          <CleanGameResults
            results={results}
            onPlayAgain={() => resetGame()}
            onHome={() => window.location.href = '/'}
          />
        </div>
      </div>
    )
  }

  const totalMatches = Object.values(matches).filter(Boolean).length

  return (
    <div className="w-full min-h-screen bg-white dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-none">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg">
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                {formatPoints(currentPoints)} pts
              </span>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-lg">
              <span className="text-amber-600 dark:text-amber-400 font-medium">
                High: {formatPoints(highScore)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <GameStats
              totalMatches={shuffledMugshotImages.length}
              correctMatches={0}
              gameStartTime={gameStartTimeRef.current}
              currentPoints={currentPoints}
            />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Match the Mugshot to the Crime
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Study the suspects and match them to their crimes
          </p>
        </div>

        {/* Progress */}
        <div className="mb-6 max-w-md mx-auto">
          <GameProgress totalMatches={totalMatches} />
        </div>

        {/* Full-Width Game Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 xl:gap-12 mb-6">
          {/* Mugshots - Full Width */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              Suspects
              {selectedMugshotId && (
                <Badge variant="secondary" className="ml-2">
                  Selected
                </Badge>
              )}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-3 sm:gap-4">
              {shuffledMugshotImages.map((mugshot, index) => (
                <CleanMugshotCard
                  key={mugshot.id}
                  mugshot={mugshot}
                  index={index}
                  isSelected={selectedMugshotId === mugshot.id.toString()}
                  isMatched={!!matches[mugshot.id.toString()]}
                  onClick={() => {
                    triggerHaptic('light')
                    setSelectedMugshotId(mugshot.id.toString())
                    setSelectedDescriptionId(null)
                  }}
                  results={results}
                  matches={matches}
                  getInmateDataById={getInmateDataById}
                />
              ))}
            </div>
          </div>

          {/* Crimes - Full Width */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              Crimes
              {selectedDescriptionId && (
                <Badge variant="secondary" className="ml-2">
                  Selected
                </Badge>
              )}
            </h2>
            <div className="space-y-3">
              {shuffledCrimeDescriptions.map((crime, index) => {
                const matchedMugshotId = Object.keys(matches).find(key => matches[key] === crime.id.toString())
                const matchedMugshot = matchedMugshotId ? (getInmateDataById(matchedMugshotId) || null) : null

                return (
                  <CleanCrimeCard
                    key={crime.id}
                    crime={crime}
                    index={index}
                    isSelected={selectedDescriptionId === crime.id.toString()}
                    isMatched={!!matchedMugshot}
                    matchedMugshot={matchedMugshot}
                    onClick={() => handleMatch(crime.id.toString(), crime.id.toString())}
                    results={results}
                  />
                )
              })}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="max-w-md mx-auto">
          <CleanGameControls
            onSubmit={handleSubmit}
            onReset={() => resetGame()}
            canSubmit={totalMatches === shuffledMugshotImages.length}
            matchCount={totalMatches}
            totalMatches={shuffledMugshotImages.length}
            className="mb-4"
          />
        </div>

        {/* Instructions */}
        <AnimatePresence>
          {!results && totalMatches === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center text-gray-600 dark:text-gray-400 mt-6"
            >
              <p className="flex items-center justify-center gap-2">
                {isMobile ? (
                  "Tap a suspect to select their crime"
                ) : (
                  <>
                    Click a suspect, then click the matching crime
                    <ArrowRightLeft className="h-4 w-4" />
                  </>
                )}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
