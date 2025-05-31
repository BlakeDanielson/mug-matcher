'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Trophy, Star, RotateCcw, Home } from 'lucide-react';
import { GameResults } from './types';

interface GameResultsProps {
  results: GameResults;
  onPlayAgain?: () => void;
  onHome?: () => void;
  showDetailedResults?: boolean;
  className?: string;
}

export function CleanGameResults({
  results,
  onPlayAgain,
  onHome,
  showDetailedResults = true,
  className = ''
}: GameResultsProps) {
  const { score, total, percentage, detailedResults } = results;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Score Summary */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full">
          <Trophy className="w-10 h-10 text-blue-600 dark:text-blue-400" />
        </div>
        
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Game Complete!
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            You scored {score} out of {total}
          </p>
          <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
            {percentage.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Detailed Results */}
      {showDetailedResults && detailedResults && detailedResults.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Detailed Results
          </h3>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {detailedResults.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  result.isCorrect
                    ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                    : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Image
                    src={result.mugshotImage}
                    alt={result.mugshotName}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {result.isCorrect ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span className="font-medium text-gray-900 dark:text-white">
                        {result.mugshotName}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Correct:</span> {result.actualCrime}
                    </p>
                    
                    {!result.isCorrect && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        <span className="font-medium">Your guess:</span> {result.userGuessCrime}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        {onPlayAgain && (
          <Button
            onClick={onPlayAgain}
            className="flex items-center gap-2"
            size="lg"
          >
            <RotateCcw className="w-4 h-4" />
            Play Again
          </Button>
        )}
        
        {onHome && (
          <Button
            onClick={onHome}
            variant="outline"
            className="flex items-center gap-2"
            size="lg"
          >
            <Home className="w-4 h-4" />
            Home
          </Button>
        )}
      </div>
    </div>
  );
}

interface EnhancedGameResultsProps extends GameResultsProps {
  highScore?: number;
  isNewHighScore?: boolean;
  pointsEarned?: number;
  showShareButton?: boolean;
  onShare?: () => void;
}

export function EnhancedGameResults({
  results,
  onPlayAgain,
  onHome,
  onShare,
  showDetailedResults = true,
  highScore,
  isNewHighScore = false,
  pointsEarned,
  showShareButton = false,
  className = ''
}: EnhancedGameResultsProps) {
  const { score, total, percentage, detailedResults } = results;

  const getScoreColor = () => {
    if (percentage >= 90) return 'text-green-600 dark:text-green-400';
    if (percentage >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreMessage = () => {
    if (percentage >= 90) return 'Excellent work! 🎉';
    if (percentage >= 70) return 'Good job! 👍';
    if (percentage >= 50) return 'Not bad! Keep practicing 💪';
    return 'Keep trying! You\'ll get better 🌟';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`space-y-6 ${className}`}
    >
      {/* Score Summary with Animation */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${
            isNewHighScore
              ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
              : 'bg-gradient-to-br from-blue-500 to-purple-600'
          }`}
        >
          {isNewHighScore ? (
            <Star className="w-12 h-12 text-white" />
          ) : (
            <Trophy className="w-12 h-12 text-white" />
          )}
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {isNewHighScore ? 'New High Score!' : 'Game Complete!'}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
            {getScoreMessage()}
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            You scored {score} out of {total}
          </p>
          <p className={`text-3xl font-bold ${getScoreColor()}`}>
            {percentage.toFixed(1)}%
          </p>
          
          {pointsEarned !== undefined && (
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
              +{pointsEarned} points earned
            </p>
          )}
          
          {highScore !== undefined && !isNewHighScore && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              High Score: {highScore}%
            </p>
          )}
        </motion.div>
      </div>

      {/* Detailed Results with Animations */}
      {showDetailedResults && detailedResults && detailedResults.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-3"
        >
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Detailed Results
          </h3>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {detailedResults.map((result, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className={`p-4 rounded-xl border-2 shadow-sm ${
                  result.isCorrect
                    ? 'border-green-300 bg-gradient-to-r from-green-50 to-green-100 dark:border-green-700 dark:from-green-900/20 dark:to-green-800/20'
                    : 'border-red-300 bg-gradient-to-r from-red-50 to-red-100 dark:border-red-700 dark:from-red-900/20 dark:to-red-800/20'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <Image
                      src={result.mugshotImage}
                      alt={result.mugshotName}
                      width={56}
                      height={56}
                      className="w-14 h-14 rounded-xl object-cover shadow-md"
                    />
                    <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center ${
                      result.isCorrect ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      {result.isCorrect ? (
                        <CheckCircle className="w-4 h-4 text-white" />
                      ) : (
                        <XCircle className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-gray-900 dark:text-white text-lg">
                        {result.mugshotName}
                      </span>
                      {result.isCorrect && (
                        <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full font-medium">
                          Correct!
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm">
                        <span className="font-semibold text-green-700 dark:text-green-300">
                          Correct answer:
                        </span>
                        <span className="ml-2 text-gray-700 dark:text-gray-300">
                          {result.actualCrime}
                        </span>
                      </p>
                      
                      {!result.isCorrect && (
                        <p className="text-sm">
                          <span className="font-semibold text-red-700 dark:text-red-300">
                            Your guess:
                          </span>
                          <span className="ml-2 text-gray-700 dark:text-gray-300">
                            {result.userGuessCrime}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Enhanced Action Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex flex-wrap gap-3 justify-center"
      >
        {onPlayAgain && (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={onPlayAgain}
              className="flex items-center gap-2 shadow-lg"
              size="lg"
            >
              <RotateCcw className="w-5 h-5" />
              Play Again
            </Button>
          </motion.div>
        )}
        
        {showShareButton && onShare && (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={onShare}
              variant="outline"
              className="flex items-center gap-2 shadow-md"
              size="lg"
            >
              📱 Share Score
            </Button>
          </motion.div>
        )}
        
        {onHome && (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={onHome}
              variant="ghost"
              className="flex items-center gap-2"
              size="lg"
            >
              <Home className="w-5 h-5" />
              Home
            </Button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
} 