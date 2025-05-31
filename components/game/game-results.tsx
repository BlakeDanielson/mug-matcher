'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Trophy, RotateCcw, Home } from 'lucide-react';
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
    <div className={`space-y-6 ${className}`}>
      {/* Score Summary */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-500">
          <Trophy className="w-10 h-10 text-white" />
        </div>
        
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Game Complete!
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
        </div>
      </div>

      {/* Detailed Results */}
      {showDetailedResults && detailedResults && detailedResults.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Detailed Results
          </h3>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {detailedResults.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border-2 ${
                  result.isCorrect
                    ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20'
                    : 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <Image
                      src={result.mugshotImage}
                      alt={result.mugshotName}
                      width={56}
                      height={56}
                      className="w-14 h-14 rounded-xl object-cover"
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
                      <span className="font-bold text-gray-900 dark:text-white">
                        {result.mugshotName}
                      </span>
                      {result.isCorrect && (
                        <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">
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
          >
            <RotateCcw className="w-4 h-4" />
            Play Again
          </Button>
        )}
        
        {onHome && (
          <Button
            onClick={onHome}
            variant="ghost"
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Home
          </Button>
        )}
      </div>
    </div>
  );
} 