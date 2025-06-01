"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRightLeft } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

// Import modular game components and hooks
import {
  GameSkeleton,
  GameError,
  GameResultsView,
  CleanMugshotCard,
  CleanCrimeCard,
  CleanGameControls,
  useGameLogic,
  usePointsSystem,
  submitGame,
  type Inmate
} from "@/components/game"

// Import Aceternity components
import { AceternityGameHeader } from "./aceternity-game-header"
import { AceternityGameProgress } from "./aceternity-game-progress"
import { AceternityBadge } from "./aceternity-badge"

export default function AceternityMugshotGame() {
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
    triggerHaptic
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

  // If results, show results view
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

  const totalMatches = Object.values(matches).filter(Boolean).length

  return (
    <div className="flex justify-center items-center min-h-screen p-8 lg:p-12">
      <div className="w-full max-w-7xl backdrop-blur-xl bg-slate-900/20 border border-blue-900/30 rounded-3xl p-10 lg:p-12 shadow-2xl shadow-blue-950/50">
        {/* Header with Aceternity styling */}
        <AceternityGameHeader
          currentPoints={currentPoints}
          highScore={highScore}
          formatPoints={formatPoints}
          totalMatches={shuffledMugshotImages.length}
          gameStartTime={gameStartTimeRef.current}
        />

        {/* Title with gradient text */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-300 via-slate-200 to-blue-400 bg-clip-text text-transparent">
            Match the Mugshot to the Crime
          </h1>
          <p className="text-lg text-slate-300">
            Study the suspects and match them to their crimes
          </p>
        </div>

        {/* Progress with Aceternity styling */}
        <div className="mb-8">
          <AceternityGameProgress totalMatches={totalMatches} />
        </div>

        {/* Game Grid with enhanced styling */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-8">
          {/* Mugshots */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
              <span className="bg-gradient-to-r from-blue-300 to-slate-300 bg-clip-text text-transparent">
                Suspects
              </span>
              {selectedMugshotId && (
                <AceternityBadge variant="selected">
                  Selected
                </AceternityBadge>
              )}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-6">
              {shuffledMugshotImages.map((mugshot, index) => (
                <motion.div
                  key={mugshot.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative group"
                >
                  <CleanMugshotCard
                    mugshot={mugshot}
                    index={index}
                    isSelected={selectedMugshotId === mugshot.id.toString()}
                    isMatched={!!matches[mugshot.id.toString()]}
                    onClick={() => {
                      triggerHaptic('light')
                      
                      if (selectedDescriptionId) {
                        handleMatch(mugshot.id.toString(), selectedDescriptionId)
                      } else {
                        setSelectedMugshotId(mugshot.id.toString())
                        setSelectedDescriptionId(null)
                      }
                    }}
                    results={results}
                    matches={matches}
                    getInmateDataById={getInmateDataById}
                  />
                  {/* Aceternity glow effect with dark blue theme */}
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-600/20 via-slate-600/20 to-blue-800/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Crimes */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
              <span className="bg-gradient-to-r from-slate-300 to-blue-300 bg-clip-text text-transparent">
                Crimes
              </span>
              {selectedDescriptionId && (
                <AceternityBadge variant="selected">
                  Selected
                </AceternityBadge>
              )}
            </h2>
            <div className="space-y-4">
              {shuffledCrimeDescriptions.map((crime, index) => {
                const matchedMugshotId = Object.keys(matches).find(key => matches[key] === crime.id.toString())
                const matchedMugshot = matchedMugshotId ? (getInmateDataById(matchedMugshotId) || null) : null

                return (
                  <motion.div
                    key={crime.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative group"
                  >
                    <CleanCrimeCard
                      crime={crime}
                      index={index}
                      isSelected={selectedDescriptionId === crime.id.toString()}
                      isMatched={!!matchedMugshot}
                      matchedMugshot={matchedMugshot}
                      onClick={() => handleCrimeClickWithMobile(crime)}
                      results={results}
                    />
                    {/* Aceternity glow effect with dark blue theme */}
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-slate-600/20 via-blue-600/20 to-slate-800/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </motion.div>
                )
              })}
            </div>
          </div>
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

        {/* Instructions with enhanced styling */}
        <AnimatePresence>
          {!results && totalMatches === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center text-slate-300 mt-8"
            >
              <p className="flex items-center justify-center gap-2 text-lg">
                {isMobile ? (
                  "Tap a suspect to select their crime"
                ) : (
                  <>
                    Click a suspect, then click the matching crime
                    <ArrowRightLeft className="h-5 w-5 text-blue-400" />
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