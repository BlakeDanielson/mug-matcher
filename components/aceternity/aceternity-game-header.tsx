"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { GameStats } from '@/components/game/game-stats'
import { GameResults } from '@/components/game/types'

interface AceternityGameHeaderProps {
  currentPoints: number
  highScore: number
  formatPoints: (points: number) => string
  results?: GameResults | null
  totalMatches: number
  gameStartTime: number
  isResultsView?: boolean
}

export function AceternityGameHeader({
  currentPoints,
  highScore,
  formatPoints,
  results,
  totalMatches,
  gameStartTime,
  isResultsView = false
}: AceternityGameHeaderProps) {
  return (
    <motion.div 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1, duration: 0.5 }}
      className="flex justify-between items-center mb-8"
    >
      <div className="flex items-center gap-4">
        {/* Current Points */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-slate-600 rounded-lg blur opacity-25 group-hover:opacity-40 transition-opacity duration-300" />
          <div className="relative backdrop-blur-xl bg-blue-500/10 border border-blue-400/30 px-4 py-2 rounded-lg">
            <span className="text-blue-300 font-medium">
              {formatPoints(currentPoints)} pts
            </span>
          </div>
        </div>

        {/* High Score */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-600 to-blue-600 rounded-lg blur opacity-25 group-hover:opacity-40 transition-opacity duration-300" />
          <div className="relative backdrop-blur-xl bg-slate-500/10 border border-slate-400/30 px-4 py-2 rounded-lg">
            <span className="text-slate-300 font-medium">
              High: {formatPoints(highScore)}
            </span>
          </div>
        </div>

        {/* Points Earned (Results View) */}
        {isResultsView && results?.pointsEarned && results.pointsEarned > 0 && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5, type: "spring" }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg blur opacity-25 group-hover:opacity-40 transition-opacity duration-300" />
            <div className="relative backdrop-blur-xl bg-green-500/10 border border-green-400/30 px-4 py-2 rounded-lg">
              <span className="text-green-300 font-medium">
                +{formatPoints(results.pointsEarned)} earned!
              </span>
            </div>
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
          <div className="relative group">
            <div className={`absolute inset-0 rounded-lg blur opacity-25 group-hover:opacity-40 transition-opacity duration-300 ${
              results.percentage >= 90 
                ? 'bg-gradient-to-r from-green-600 to-blue-600'
                : results.percentage >= 70
                ? 'bg-gradient-to-r from-yellow-600 to-slate-600'
                : 'bg-gradient-to-r from-red-600 to-slate-600'
            }`} />
            <div className={`relative backdrop-blur-xl border px-4 py-2 rounded-lg font-bold text-lg ${
              results.percentage >= 90 
                ? 'bg-green-500/10 border-green-400/30 text-green-300'
                : results.percentage >= 70
                ? 'bg-yellow-500/10 border-yellow-400/30 text-yellow-300'
                : 'bg-red-500/10 border-red-400/30 text-red-300'
            }`}>
              {results.score}/{results.total} ({results.percentage.toFixed(1)}%)
            </div>
          </div>
        ) : (
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-600 to-blue-600 rounded-lg blur opacity-25 group-hover:opacity-40 transition-opacity duration-300" />
            <div className="relative backdrop-blur-xl bg-slate-500/10 border border-slate-400/30 rounded-lg">
              <GameStats
                totalMatches={totalMatches}
                correctMatches={0}
                gameStartTime={gameStartTime}
                currentPoints={currentPoints}
              />
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
} 