"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { ArrowRightLeft } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

// Import modular game components and hooks
import {
  GameSkeleton,
  GameError,
  GameProgress,
  GameResultsView,
  CleanMugshotCard,
  CleanCrimeCard,
  CleanGameControls,
  useGameLogic,
  usePointsSystem,
  submitGame,
  type Inmate
} from "@/components/game"

import { GameStats } from './game/game-stats'
import { MobileCrimeModal } from './game/mobile-crime-modal'

export default function MugshotMatchingGame() {
  const isMobile = useIsMobile()
  
  // Use custom hooks for game logic and points system
  const gameLogic = useGameLogic()
  const pointsSystem = usePointsSystem()

  const {
    shuffledMugshotImages,
    shuffledCrimeDescriptions,
    selectedMugshotId,
    selectedDescriptionId,
    matches,
    results,
    loading,
    error,
    submitting,
    attemptCounts,
    gameStartTimeRef,
    setSelectedMugshotId,
    setSelectedDescriptionId,
    setResults,
    setSubmitting,
    resetGame,
    getInmateDataById,
    handleMatch,
    handleCrimeClick,
    retryFetch,
    triggerHaptic,
    // Mobile state and actions
    isMobileCrimeModalOpen,
    selectedMugshotForModal,
    handleMugshotClickMobile,
    handleMobileCrimeSelect,
    closeMobileCrimeModal
  } = gameLogic

  const {
    currentPoints,
    highScore,
    resetPoints,
    addPointsForMatches,
    formatPoints
  } = pointsSystem

  // Handle submit with extracted logic
  const handleSubmit = () => {
    const allDescriptionsMatched = shuffledCrimeDescriptions.length === Object.values(matches).filter(v => v !== null).length

    if (!allDescriptionsMatched) {
      gameLogic.toast({
        title: "Incomplete Matches",
        description: "Please match all images before submitting.",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)

    setTimeout(() => {
      const gameResults = submitGame({
        matches,
        shuffledCrimeDescriptions,
        getInmateDataById,
        attemptCounts,
        gameStartTime: gameStartTimeRef.current,
        addPointsForMatches,
        toast: gameLogic.toast,
        triggerHaptic,
        formatPoints
      })

      if (gameResults) {
        setResults(gameResults)
      }
      setSubmitting(false)
    }, 300)
  }

  // Enhanced reset function that includes points reset
  const handleReset = () => {
    resetGame()
    resetPoints()
  }

  // Handle crime click with mobile support
  const handleCrimeClickWithMobile = (crime: Inmate) => {
    handleCrimeClick(crime, isMobile)
  }

  // Handle mugshot click with mobile support
  const handleMugshotClick = (mugshot: Inmate) => {
    if (isMobile) {
      handleMugshotClickMobile(mugshot)
    } else {
      triggerHaptic('light')
      
      if (selectedDescriptionId) {
        handleMatch(mugshot.id.toString(), selectedDescriptionId)
      } else {
        setSelectedMugshotId(mugshot.id.toString())
        setSelectedDescriptionId(null)
      }
    }
  }

  // If loading, show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen p-6">
        <GameSkeleton />
      </div>
    )
  }

  // If error, show error state
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen p-6">
        <GameError error={error} onRetry={retryFetch} />
      </div>
    )
  }

  // If results are available, show results view
  if (results) {
    return (
      <GameResultsView
        results={results}
        shuffledMugshotImages={shuffledMugshotImages}
        shuffledCrimeDescriptions={shuffledCrimeDescriptions}
        matches={matches}
        getInmateDataById={getInmateDataById}
        onReset={handleReset}
        currentPoints={currentPoints}
        highScore={highScore}
        formatPoints={formatPoints}
        gameStartTime={gameStartTimeRef.current}
      />
    )
  }

  // Calculate total matches for progress
  const totalMatches = Object.values(matches).filter(match => match !== null).length

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Mugshot Matching Game
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
          Match each suspect with their crime
        </p>
        
        {/* Game Stats */}
        <GameStats 
          totalMatches={totalMatches}
          correctMatches={0}
          gameStartTime={gameStartTimeRef.current}
          currentPoints={currentPoints}
        />
      </div>

      {/* Progress */}
      <div className="mb-8">
        <GameProgress 
          totalMatches={totalMatches} 
          maxMatches={shuffledMugshotImages.length}
        />
      </div>

      {/* Game Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-8 lg:items-start">
        {/* Mugshots */}
        <div className="space-y-6 h-full">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            Suspects
            {selectedMugshotId && (
              <Badge variant="secondary" className="ml-2">
                Selected
              </Badge>
            )}
          </h2>
          <div className="grid grid-cols-2 gap-5 h-full content-start">
            {shuffledMugshotImages.map((mugshot, index) => (
              <CleanMugshotCard
                key={mugshot.id}
                mugshot={mugshot}
                index={index}
                isSelected={selectedMugshotId === mugshot.id.toString()}
                isMatched={!!matches[mugshot.id.toString()]}
                onClick={() => handleMugshotClick(mugshot)}
                results={results}
                matches={matches}
                getInmateDataById={getInmateDataById}
              />
            ))}
          </div>
        </div>

        {/* Crimes - Hide on mobile since we use modal */}
        {!isMobile && (
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
                    onClick={() => handleCrimeClickWithMobile(crime)}
                    results={results}
                  />
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <CleanGameControls
        onSubmit={handleSubmit}
        onReset={handleReset}
        canSubmit={totalMatches === shuffledMugshotImages.length}
        isSubmitting={submitting}
        matchCount={totalMatches}
        totalMatches={shuffledMugshotImages.length}
        className="mb-6"
      />

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

      {/* Mobile Crime Selection Modal */}
      <MobileCrimeModal
        isOpen={isMobileCrimeModalOpen}
        onClose={closeMobileCrimeModal}
        crimes={shuffledCrimeDescriptions}
        onCrimeSelect={handleMobileCrimeSelect}
        selectedMugshot={selectedMugshotForModal || undefined}
        matches={matches}
        getInmateDataById={getInmateDataById}
      />
    </div>
  )
}
