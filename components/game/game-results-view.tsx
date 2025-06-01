import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, RotateCcw, Home } from 'lucide-react'
import { GameResults, Inmate } from './types'
import { GameHeader } from './game-header'
import { getSeverityAccent } from '@/lib/crime-severity-utils'

interface GameResultsViewProps {
  results: GameResults
  shuffledMugshotImages: Inmate[]
  shuffledCrimeDescriptions: Inmate[]
  matches: Record<string, string | null>
  getInmateDataById: (id: string | number) => Inmate | undefined
  onReset: () => void
  currentPoints: number
  highScore: number
  formatPoints: (points: number) => string
  gameStartTime: number
}

export function GameResultsView({
  results,
  shuffledMugshotImages,
  shuffledCrimeDescriptions,
  matches,
  getInmateDataById,
  onReset,
  currentPoints,
  highScore,
  formatPoints,
  gameStartTime
}: GameResultsViewProps) {
  const totalMatches = Object.values(matches).filter(Boolean).length

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex justify-center items-center min-h-screen p-8 lg:p-12"
    >
      <div className="w-full max-w-7xl bg-white dark:bg-gray-900 rounded-2xl p-10 lg:p-12 shadow-lg border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <GameHeader
          currentPoints={currentPoints}
          highScore={highScore}
          formatPoints={formatPoints}
          results={results}
          totalMatches={totalMatches}
          gameStartTime={gameStartTime}
          isResultsView={true}
        />

        {/* Title */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Game Complete!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {results.percentage >= 90 ? 'Excellent work! 🎉' :
             results.percentage >= 70 ? 'Good job! 👍' :
             results.percentage >= 50 ? 'Not bad! Keep practicing 💪' :
             'Keep trying! You\'ll get better 🌟'}
          </p>
        </motion.div>

        {/* Results Grid */}
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-8"
        >
          {/* Mugshots with Results */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              Your Matches
              <div className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded-full">
                Results
              </div>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-6">
              {shuffledMugshotImages.map((mugshot, index) => {
                const userGuessId = matches[mugshot.id.toString()]
                const userGuess = userGuessId ? getInmateDataById(userGuessId) : null
                const isCorrect = userGuessId === mugshot.id.toString()
                
                return (
                  <motion.div
                    key={mugshot.id}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4 + index * 0.1, duration: 0.4 }}
                    className={`relative p-4 rounded-xl border-2 transition-all ${
                      isCorrect
                        ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20'
                        : 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20'
                    }`}
                  >
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.6 + index * 0.1, duration: 0.3, type: "spring" }}
                      className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center ${
                        isCorrect ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    >
                      {isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-white" />
                      ) : (
                        <XCircle className="w-5 h-5 text-white" />
                      )}
                    </motion.div>

                    <div className="text-center space-y-3">
                      <div className="relative">
                        <Image
                          src={mugshot.image}
                          alt={mugshot.name}
                          width={120}
                          height={120}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>
                      
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                          {mugshot.name}
                        </h3>
                        
                        <div className="mt-2 space-y-1">
                          <p className="text-xs">
                            <span className="font-semibold text-green-700 dark:text-green-300">
                              Actual:
                            </span>
                            <span className="ml-1 text-gray-700 dark:text-gray-300">
                              {mugshot.crime}
                            </span>
                          </p>
                          
                          {userGuess && (
                            <p className="text-xs">
                              <span className={`font-semibold ${
                                isCorrect 
                                  ? 'text-green-700 dark:text-green-300' 
                                  : 'text-red-700 dark:text-red-300'
                              }`}>
                                Your guess:
                              </span>
                              <span className="ml-1 text-gray-700 dark:text-gray-300">
                                {userGuess.crime}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Crime Descriptions with Results */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              Crime Analysis
              <div className="ml-2 px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm rounded-full">
                Review
              </div>
            </h2>
            <div className="space-y-4">
              {shuffledCrimeDescriptions.map((crime, index) => {
                const matchedMugshotId = Object.keys(matches).find(key => matches[key] === crime.id.toString())
                const matchedMugshot = matchedMugshotId ? getInmateDataById(matchedMugshotId) : null
                const isCorrect = matchedMugshotId === crime.id.toString()

                return (
                  <motion.div
                    key={crime.id}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                    className={`p-4 rounded-xl border-2 ${
                      matchedMugshot
                        ? isCorrect
                          ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20'
                          : 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20'
                        : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                    } ${(() => {
                      const severityAccent = getSeverityAccent(crime.crimeSeverity);
                      return severityAccent.borderLeft;
                    })()}`}
                  >
                    <div className="flex items-start gap-4">
                      {matchedMugshot && (
                        <div className="relative">
                          <Image
                            src={matchedMugshot.image}
                            alt={matchedMugshot.name}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.7 + index * 0.1, duration: 0.3, type: "spring" }}
                            className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ${
                              isCorrect ? 'bg-green-500' : 'bg-red-500'
                            }`}
                          >
                            {isCorrect ? (
                              <CheckCircle className="w-3 h-3 text-white" />
                            ) : (
                              <XCircle className="w-3 h-3 text-white" />
                            )}
                          </motion.div>
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-gray-900 dark:text-white text-sm">
                            {crime.crime}
                          </span>
                          {/* Crime Severity Accent */}
                          {(() => {
                            const severityAccent = getSeverityAccent(crime.crimeSeverity);
                            return (
                              <span className={`text-xs font-medium ${severityAccent.textAccent} opacity-75`}>
                                {crime.crimeSeverity || 'Unknown'}
                              </span>
                            );
                          })()}
                          {isCorrect && (
                            <motion.span 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.8 + index * 0.1, duration: 0.3, type: "spring" }}
                              className="px-2 py-1 bg-green-500 text-white text-xs rounded-full"
                            >
                              Correct!
                            </motion.span>
                          )}
                        </div>
                        
                        {matchedMugshot && (
                          <div className="space-y-1">
                            <p className="text-sm">
                              <span className="font-semibold text-blue-700 dark:text-blue-300">
                                You matched:
                              </span>
                              <span className="ml-2 text-gray-700 dark:text-gray-300">
                                {matchedMugshot.name}
                              </span>
                            </p>
                            
                            {!isCorrect && (
                              <p className="text-sm">
                                <span className="font-semibold text-green-700 dark:text-green-300">
                                  Correct suspect:
                                </span>
                                <span className="ml-2 text-gray-700 dark:text-gray-300">
                                  {crime.name}
                                </span>
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="flex flex-wrap gap-3 justify-center"
        >
          <Button
            onClick={onReset}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Play Again
          </Button>
          
          <Button
            onClick={() => window.location.href = '/'}
            variant="ghost"
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Home
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
} 