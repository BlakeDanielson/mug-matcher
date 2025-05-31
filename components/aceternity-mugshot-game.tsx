"use client"

import { useState, useEffect, useRef } from "react"
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
  createMatchResult,
  handleGameReset,
  cleanupPointsSystem,
  formatPoints
} from "@/points"

// Import modular game components
import {
  Inmate,
  GameResults,
  EnhancedGameSkeleton,
  EnhancedGameError,
  EnhancedGameStats,
  EnhancedMugshotCard,
  EnhancedCrimeCard,
  EnhancedMobileCrimeModal,
  EnhancedGameControls,
  EnhancedGameResults
} from "@/components/game"

// Aceternity UI Components - minimal usage
import { TextGenerateEffect } from "@/components/ui/text-generate-effect"

export default function CleanAceternityMugshotGame() {
  const [inmates, setInmates] = useState<Inmate[]>([])
  const [shuffledMugshotImages, setShuffledMugshotImages] = useState<Inmate[]>([])
  const [shuffledCrimeDescriptions, setShuffledCrimeDescriptions] = useState<Inmate[]>([])
  const [selectedMugshotId, setSelectedMugshotId] = useState<string | null>(null)
  const [selectedDescriptionId, setSelectedDescriptionId] = useState<string | null>(null)
  const [matches, setMatches] = useState<Record<string, string | null>>({})
  const [results, setResults] = useState<GameResults | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [attemptCounts, setAttemptCounts] = useState<Record<string, number>>({})
  const [currentPoints, setCurrentPoints] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [gameStartTime] = useState(Date.now())
  const [isMobileCrimeModalOpen, setIsMobileCrimeModalOpen] = useState(false)
  const [mobileCrimeModalMugshot, setMobileCrimeModalMugshot] = useState<Inmate | null>(null)
  
  const isMobile = useIsMobile()
  const { toast } = useToast()
  const { triggerHaptic } = useHapticFeedback()
  const pointsManagerRef = useRef<PointsManager | null>(null)

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

  useEffect(() => {
    fetchInmates()
    initPoints()
    
    return () => {
      if (pointsManagerRef.current) {
        cleanupPointsSystem(pointsManagerRef.current)
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const initPoints = async () => {
    try {
      const manager = new PointsManager()
      await manager.initialize()
      pointsManagerRef.current = manager
      
      setCurrentPoints(manager.currentPoints)
      setHighScore(manager.highScore)
    } catch (err) {
      console.error('Error initializing points:', err)
    }
  }

  const resetGame = (data = inmates) => {
    const shuffledMugshots = [...data].sort(() => Math.random() - 0.5)
    const shuffledCrimes = [...data].sort(() => Math.random() - 0.5)
    
    setShuffledMugshotImages(shuffledMugshots)
    setShuffledCrimeDescriptions(shuffledCrimes)
    setSelectedMugshotId(null)
    setSelectedDescriptionId(null)
    setMatches({})
    setResults(null)
    setAttemptCounts({})
    setIsMobileCrimeModalOpen(false)
    setMobileCrimeModalMugshot(null)
    
    if (pointsManagerRef.current) {
      handleGameReset(pointsManagerRef.current)
    }
  }

  const handleSubmit = () => {
    if (!pointsManagerRef.current) return

    const totalMatches = shuffledMugshotImages.length
    let correctMatches = 0
    const detailedResults: GameResults['detailedResults'] = []

    shuffledMugshotImages.forEach((mugshot) => {
      const matchedCrimeId = matches[mugshot.id.toString()]
      const matchedCrime = matchedCrimeId ? getInmateDataById(matchedCrimeId) : undefined
      const isCorrect = matchedCrimeId === mugshot.id.toString()
      
      if (isCorrect) correctMatches++

      detailedResults.push({
        mugshotId: mugshot.id.toString(),
        mugshotName: mugshot.name,
        mugshotImage: mugshot.image,
        actualCrime: mugshot.crime || "Unknown Crime",
        userGuessId: matchedCrimeId || "",
        userGuessCrime: matchedCrime?.crime || "No selection",
        isCorrect
      })

      const attempts = attemptCounts[mugshot.id.toString()] || 1
      const timeElapsed = Date.now() - gameStartTime
      const matchResult = createMatchResult(isCorrect, timeElapsed, attempts)
      pointsManagerRef.current!.addPoints(matchResult)
    })

    const percentage = totalMatches > 0 ? (correctMatches / totalMatches) * 100 : 0
    const pointsEarned = pointsManagerRef.current.currentPoints

    const gameResults: GameResults = {
      score: correctMatches,
      total: totalMatches,
      percentage,
      submitted: true,
      correctMatches: detailedResults.filter(r => r.isCorrect).map((_, i) => i),
      detailedResults,
      pointsEarned
    }

    setResults(gameResults)
    setCurrentPoints(pointsEarned)

    if (pointsEarned > highScore) {
      setHighScore(pointsEarned)
      triggerHaptic('success')
      toast({
        title: "New High Score! 🎉",
        description: `You scored ${formatPoints(pointsEarned)} points!`,
      })
    }

    pointsManagerRef.current.saveState()
  }

  const getInmateDataById = (id: string | number): Inmate | undefined => {
    return inmates.find(inmate => inmate.id.toString() === id.toString())
  }

  const retryFetch = () => {
    fetchInmates()
  }

  const handleCrimeClick = (crime: Inmate) => {
    if (results || isMobile) return
    
    triggerHaptic('light')
    setSelectedDescriptionId(crime.id.toString())
    
    if (selectedMugshotId) {
      handleMatch(selectedMugshotId, crime.id.toString())
    }
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

  const handleMobileCrimeSelect = (crimeId: string) => {
    if (mobileCrimeModalMugshot) {
      handleMatch(mobileCrimeModalMugshot.id.toString(), crimeId)
      setIsMobileCrimeModalOpen(false)
      setMobileCrimeModalMugshot(null)
    }
  }

  const totalMatches = Object.keys(matches).filter(key => matches[key] !== null).length
  const canSubmit = totalMatches === shuffledMugshotImages.length

  if (loading) {
    return <EnhancedGameSkeleton />
  }

  if (error) {
    return <EnhancedGameError error={error} onRetry={retryFetch} />
  }

  if (results) {
    return (
      <div className="flex justify-center items-center min-h-screen p-8 lg:p-12">
        <div className="w-full max-w-4xl bg-white dark:bg-gray-900 rounded-2xl p-10 lg:p-12 shadow-lg border border-gray-200 dark:border-gray-700">
          <EnhancedGameResults
            results={results}
            onPlayAgain={() => resetGame()}
            highScore={highScore}
            isNewHighScore={currentPoints > highScore}
            pointsEarned={results.pointsEarned}
            showShareButton={true}
            onShare={() => {
              toast({
                title: "Score Shared! 📱",
                description: "Your score has been copied to clipboard",
              })
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-center items-center min-h-screen p-8 lg:p-12">
      <div className="w-full max-w-7xl bg-white dark:bg-gray-900 rounded-2xl p-10 lg:p-12 shadow-lg border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
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
          <EnhancedGameStats
            totalMatches={shuffledMugshotImages.length}
            correctMatches={0}
            gameStartTime={gameStartTime}
          />
        </div>

        {/* Title */}
        <div className="text-center mb-12">
          <TextGenerateEffect 
            words="Match the Mugshot to the Crime" 
            className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white"
          />
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {totalMatches}/{shuffledMugshotImages.length} matches
            </span>
          </div>
          <Progress 
            value={(totalMatches / shuffledMugshotImages.length) * 100} 
            className="h-2"
          />
        </div>

        {/* Game Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-8">
          {/* Mugshots */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              Mugshots
              {selectedMugshotId && (
                <Badge variant="secondary" className="ml-2">
                  Selected
                </Badge>
              )}
            </h2>
            <div className="grid grid-cols-3 gap-6">
              {shuffledMugshotImages.map((mugshot) => (
                <EnhancedMugshotCard
                  key={mugshot.id}
                  mugshot={mugshot}
                  index={0}
                  hasInitiallyLoaded={true}
                />
              ))}
            </div>
          </div>

          {/* Crimes */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              Crimes
              {selectedDescriptionId && (
                <Badge variant="secondary" className="ml-2">
                  Selected
                </Badge>
              )}
            </h2>
            <div className="space-y-4">
              {shuffledCrimeDescriptions.map((crime) => {
                const matchedMugshotId = Object.keys(matches).find(key => matches[key] === crime.id.toString())
                const matchedMugshot = matchedMugshotId ? (getInmateDataById(matchedMugshotId) || null) : null

                return (
                  <EnhancedCrimeCard
                    key={crime.id}
                    description={crime}
                    isSelectedForDesktopUX={selectedDescriptionId === crime.id.toString()}
                    matchedMugshotData={matchedMugshot}
                    shouldUseModalUX={isMobile}
                    results={results}
                    onCrimeClick={() => handleCrimeClick(crime)}
                  />
                )
              })}
            </div>
          </div>
        </div>

        {/* Controls */}
        <EnhancedGameControls
          onSubmit={handleSubmit}
          onReset={() => resetGame()}
          canSubmit={canSubmit}
          matchCount={totalMatches}
          totalMatches={shuffledMugshotImages.length}
          showProgress={true}
          className="mb-6"
        />

        {/* Mobile Crime Modal */}
        {mobileCrimeModalMugshot && (
          <EnhancedMobileCrimeModal
            isOpen={isMobileCrimeModalOpen}
            onClose={() => {
              setIsMobileCrimeModalOpen(false)
              setMobileCrimeModalMugshot(null)
              setSelectedMugshotId(null)
            }}
            crimes={shuffledCrimeDescriptions.map(crime => crime.crime || "Unknown Crime")}
            onCrimeSelect={(crime) => {
              const crimeInmate = shuffledCrimeDescriptions.find(c => c.crime === crime)
              if (crimeInmate) {
                handleMobileCrimeSelect(crimeInmate.id.toString())
              }
            }}
            inmate={mobileCrimeModalMugshot}
            showHints={true}
            difficulty="medium"
          />
        )}

        {/* Instructions */}
        <AnimatePresence>
          {!results && totalMatches === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center text-gray-600 dark:text-gray-400 mt-8"
            >
              <p className="flex items-center justify-center gap-2">
                {isMobile ? (
                  "Tap a mugshot to select a crime"
                ) : (
                  <>
                    Click a mugshot, then click the matching crime
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