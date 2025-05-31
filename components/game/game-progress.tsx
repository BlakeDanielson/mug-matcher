import React from 'react'
import { Progress } from "@/components/ui/progress"

interface GameProgressProps {
  totalMatches: number
  maxMatches?: number
}

export function GameProgress({ 
  totalMatches,
  maxMatches = 6
}: GameProgressProps) {
  const progressValue = totalMatches > 0 ? (totalMatches / maxMatches) * 100 : 0
  
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span>Progress</span>
        <span>{totalMatches}/{maxMatches}</span>
      </div>
      <Progress 
        value={progressValue} 
        className="h-2 bg-gray-700"
      />
    </div>
  )
} 