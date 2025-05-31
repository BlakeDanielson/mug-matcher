import React from 'react'
import { motion } from 'framer-motion'
import { GameStats } from './game-stats'
import { GameResults } from './types'

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
  return (
    <motion.div 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1, duration: 0.5 }}
      className="flex justify-between items-center mb-8"
    >
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
        {isResultsView && results?.pointsEarned && results.pointsEarned > 0 && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5, type: "spring" }}
            className="bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-lg"
          >
            <span className="text-green-600 dark:text-green-400 font-medium">
              +{formatPoints(results.pointsEarned)} earned!
            </span>
          </motion.div>
        )}
      </div>
      
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex items-center gap-3"
      >
        {isResultsView && results ? (
          <div className={`px-4 py-2 rounded-lg font-bold text-lg ${
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