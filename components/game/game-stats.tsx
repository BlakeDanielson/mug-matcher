import React, { useState, useEffect } from 'react'
import { Progress } from "@/components/ui/progress"
import { Timer, Star, Target } from "lucide-react"
import { formatPoints } from "@/points"

interface GameStatsProps {
  totalMatches: number
  correctMatches: number
  gameStartTime: number
  currentPoints?: number
  className?: string
}

export function GameStats({
  totalMatches,
  correctMatches,
  gameStartTime,
  currentPoints,
  className = ''
}: GameStatsProps) {
  const [elapsedTime, setElapsedTime] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - gameStartTime) / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [gameStartTime])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className={`flex items-center gap-4 text-sm flex-nowrap ${className}`}>
      <div className="flex items-center gap-1 whitespace-nowrap">
        <Timer className="h-4 w-4 text-blue-500" />
        <span className="text-gray-600 dark:text-gray-400">
          {formatTime(elapsedTime)}
        </span>
      </div>
      <div className="flex items-center gap-1 whitespace-nowrap">
        <Target className="h-4 w-4 text-green-500" />
        <span className="text-gray-600 dark:text-gray-400">
          {correctMatches}/{totalMatches}
        </span>
      </div>
      {currentPoints !== undefined && (
        <div className="flex items-center gap-1 whitespace-nowrap">
          <Star className="h-4 w-4 text-yellow-500" />
          <span className="text-gray-600 dark:text-gray-400">
            {formatPoints(currentPoints)}
          </span>
        </div>
      )}
    </div>
  )
}

export function GameProgress({ 
  totalMatches 
}: { 
  totalMatches: number 
}) {
  const progressValue = totalMatches > 0 ? (totalMatches / 6) * 100 : 0
  
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span>Progress</span>
        <span>{totalMatches}/6</span>
      </div>
      <Progress 
        value={progressValue} 
        className="h-2 bg-gray-700"
      />
    </div>
  )
} 