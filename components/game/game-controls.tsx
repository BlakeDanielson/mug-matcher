'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, CheckCircle, Play, Pause, Home, Loader2 } from 'lucide-react';

interface GameControlsProps {
  onSubmit?: () => void;
  onReset?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onHome?: () => void;
  canSubmit?: boolean;
  isGameActive?: boolean;
  isPaused?: boolean;
  isSubmitting?: boolean;
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
  isSubmitting = false,
  matchCount = 0,
  totalMatches = 0,
  className = ''
}: GameControlsProps) {
  return (
    <div className={`flex flex-wrap gap-3 justify-center ${className}`}>
      {onSubmit && (
        <Button
          onClick={onSubmit}
          disabled={!canSubmit || isSubmitting}
          className="flex items-center gap-2"
          variant={canSubmit ? "default" : "secondary"}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              Submit ({matchCount}/{totalMatches})
            </>
          )}
        </Button>
      )}

      {isGameActive && !isSubmitting && (
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

      {onReset && !isSubmitting && (
        <Button
          onClick={onReset}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
      )}

      {onHome && !isSubmitting && (
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