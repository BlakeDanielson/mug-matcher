import React from 'react'
import { motion } from 'framer-motion'
import { GameStats } from './game-stats'
import { GameResults } from './types'
import { useIsMobile } from '@/hooks/use-mobile'

interface GameHeaderProps {
  currentPoints: number
  highScore: number
  formatPoints: (points: number) => string
  results?: GameResults | null
  totalMatches: number
  gameStartTime: number
  isResultsView?: boolean
}

export function GameHeader({
  currentPoints,
  highScore,
  formatPoints,
  results,
  totalMatches,
  gameStartTime,
  isResultsView = false
}: GameHeaderProps) {
  const isMobile = useIsMobile()

  if (isMobile && isResultsView && results) {
    return (
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="mb-6 space-y-4"
      >
        {/* Mobile Score Display - Prominent */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className={`text-center p-4 rounded-xl font-bold text-xl ${
            results.percentage >= 90 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-2 border-green-300 dark:border-green-700'
              : results.percentage >= 70
              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-2 border-yellow-300 dark:border-yellow-700'
              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-2 border-red-300 dark:border-red-700'
          }`}
        >
          <div className="text-2xl font-bold mb-1">
            Your Score: {results.score}/{results.total}
          </div>
          <div className="text-lg">
            You got {results.percentage.toFixed(0)}% correct!
            {results.pointsEarned && results.pointsEarned > 0 && (
              <span className="block text-base mt-1">
                +{formatPoints(results.pointsEarned)} points!
              </span>
            )}
          </div>
        </motion.div>

        {/* Mobile Points Display */}
        <div className="flex justify-center gap-3">
          <div className="bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg">
            <span className="text-blue-600 dark:text-blue-400 font-medium text-sm">
              {formatPoints(currentPoints)} pts
            </span>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg">
            <span className="text-amber-600 dark:text-amber-400 font-medium text-sm">
              High: {formatPoints(highScore)}
            </span>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1, duration: 0.5 }}
      className={`${isMobile ? 'flex flex-col gap-3 mb-6' : 'flex justify-between items-center mb-8'}`}
    >
      <div className={`${isMobile ? 'flex justify-center gap-2' : 'flex items-center gap-4'}`}>
        <div className={`bg-blue-50 dark:bg-blue-900/20 ${isMobile ? 'px-3 py-2' : 'px-4 py-2'} rounded-lg`}>
          <span className={`text-blue-600 dark:text-blue-400 font-medium ${isMobile ? 'text-sm' : ''}`}>
            {formatPoints(currentPoints)} pts
          </span>
        </div>
        <div className={`bg-amber-50 dark:bg-amber-900/20 ${isMobile ? 'px-3 py-2' : 'px-4 py-2'} rounded-lg`}>
          <span className={`text-amber-600 dark:text-amber-400 font-medium ${isMobile ? 'text-sm' : ''}`}>
            High: {formatPoints(highScore)}
          </span>
        </div>
        {isResultsView && results?.pointsEarned && results.pointsEarned > 0 && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5, type: "spring" }}
            className={`bg-green-50 dark:bg-green-900/20 ${isMobile ? 'px-3 py-2' : 'px-4 py-2'} rounded-lg`}
          >
            <span className={`text-green-600 dark:text-green-400 font-medium ${isMobile ? 'text-sm' : ''}`}>
              +{formatPoints(results.pointsEarned)} earned!
            </span>
          </motion.div>
        )}
      </div>
      
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className={`${isMobile ? 'flex justify-center' : 'flex items-center gap-3'}`}
      >
        {isResultsView && results ? (
          <div className={`${isMobile ? 'px-4 py-2' : 'px-4 py-2'} rounded-lg font-bold ${isMobile ? 'text-base' : 'text-lg'} ${
            results.percentage >= 90 
              ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
              : results.percentage >= 70
              ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400'
              : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
          }`}>
            {results.score}/{results.total} ({results.percentage.toFixed(1)}%)
          </div>
        ) : (
          <GameStats
            totalMatches={totalMatches}
            correctMatches={0}
            gameStartTime={gameStartTime}
            currentPoints={currentPoints}
          />
        )}
      </motion.div>
    </motion.div>
  )
} 