'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { RotateCcw, CheckCircle, Play, Pause, Home } from 'lucide-react';

interface GameControlsProps {
  onSubmit?: () => void;
  onReset?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onHome?: () => void;
  canSubmit?: boolean;
  isGameActive?: boolean;
  isPaused?: boolean;
  matchCount?: number;
  totalMatches?: number;
  className?: string;
}

export function CleanGameControls({
  onSubmit,
  onReset,
  onPause,
  onResume,
  onHome,
  canSubmit = false,
  isGameActive = true,
  isPaused = false,
  matchCount = 0,
  totalMatches = 0,
  className = ''
}: GameControlsProps) {
  return (
    <div className={`flex flex-wrap gap-3 justify-center ${className}`}>
      {onSubmit && (
        <Button
          onClick={onSubmit}
          disabled={!canSubmit}
          className="flex items-center gap-2"
          variant={canSubmit ? "default" : "secondary"}
        >
          <CheckCircle className="w-4 h-4" />
          Submit ({matchCount}/{totalMatches})
        </Button>
      )}

      {isGameActive && (
        <>
          {isPaused ? (
            onResume && (
              <Button
                onClick={onResume}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Resume
              </Button>
            )
          ) : (
            onPause && (
              <Button
                onClick={onPause}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Pause className="w-4 h-4" />
                Pause
              </Button>
            )
          )}
        </>
      )}

      {onReset && (
        <Button
          onClick={onReset}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
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
  );
}

interface EnhancedGameControlsProps extends GameControlsProps {
  showProgress?: boolean;
  showTimer?: boolean;
  timeRemaining?: number;
  showHints?: boolean;
  onToggleHints?: () => void;
}

export function EnhancedGameControls({
  onSubmit,
  onReset,
  onPause,
  onResume,
  onHome,
  onToggleHints,
  canSubmit = false,
  isGameActive = true,
  isPaused = false,
  matchCount = 0,
  totalMatches = 0,
  showProgress = true,
  showTimer = false,
  timeRemaining = 0,
  showHints = false,
  className = ''
}: EnhancedGameControlsProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = totalMatches > 0 ? (matchCount / totalMatches) * 100 : 0;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Progress and Timer */}
      {(showProgress || showTimer) && (
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          {showProgress && (
            <div className="flex items-center gap-2">
              <span>Progress:</span>
              <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span>{matchCount}/{totalMatches}</span>
            </div>
          )}
          
          {showTimer && timeRemaining > 0 && (
            <div className="flex items-center gap-2">
              <span>Time:</span>
              <span className={`font-mono ${timeRemaining < 30 ? 'text-red-500' : ''}`}>
                {formatTime(timeRemaining)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Main Controls */}
      <div className="flex flex-wrap gap-3 justify-center">
        {onSubmit && (
          <motion.div
            whileHover={{ scale: canSubmit ? 1.05 : 1 }}
            whileTap={{ scale: canSubmit ? 0.95 : 1 }}
          >
            <Button
              onClick={onSubmit}
              disabled={!canSubmit}
              className="flex items-center gap-2 shadow-lg"
              variant={canSubmit ? "default" : "secondary"}
              size="lg"
            >
              <CheckCircle className="w-5 h-5" />
              Submit Results
              {showProgress && (
                <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-xs">
                  {matchCount}/{totalMatches}
                </span>
              )}
            </Button>
          </motion.div>
        )}

        {isGameActive && (
          <>
            {isPaused ? (
              onResume && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={onResume}
                    variant="outline"
                    className="flex items-center gap-2 shadow-md"
                    size="lg"
                  >
                    <Play className="w-5 h-5" />
                    Resume Game
                  </Button>
                </motion.div>
              )
            ) : (
              onPause && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={onPause}
                    variant="outline"
                    className="flex items-center gap-2 shadow-md"
                    size="lg"
                  >
                    <Pause className="w-5 h-5" />
                    Pause
                  </Button>
                </motion.div>
              )
            )}
          </>
        )}

        {onToggleHints && (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={onToggleHints}
              variant={showHints ? "default" : "outline"}
              className="flex items-center gap-2 shadow-md"
              size="lg"
            >
              💡 Hints {showHints ? 'On' : 'Off'}
            </Button>
          </motion.div>
        )}

        {onReset && (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={onReset}
              variant="outline"
              className="flex items-center gap-2 shadow-md"
              size="lg"
            >
              <RotateCcw className="w-5 h-5" />
              New Game
            </Button>
          </motion.div>
        )}

        {onHome && (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={onHome}
              variant="ghost"
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Home
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
} 