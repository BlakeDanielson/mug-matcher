import { useState, useEffect, useRef } from 'react'
import {
  PointsManager,
  ScoreDisplay,
  createMatchResult,
  handleGameReset,
  cleanupPointsSystem,
  formatPoints
} from '@/points'

interface CorrectMatch {
  mugshotId: string
  mugshotName: string
  mugshotImage: string
  actualCrime: string
  userGuessId: string
  userGuessCrime: string
  isCorrect: boolean
}

export function usePointsSystem() {
  const [currentPoints, setCurrentPoints] = useState<number>(0)
  const [highScore, setHighScore] = useState<number>(0)
  const pointsManagerRef = useRef<PointsManager | null>(null)
  const scoreDisplayRef = useRef<ScoreDisplay | null>(null)

  // Initialize points system
  useEffect(() => {
    const initPoints = async () => {
      try {
        const { createPointsManager } = await import('@/points')
        
        const manager = await createPointsManager()
        pointsManagerRef.current = manager
        
        setCurrentPoints(manager.currentPoints)
        setHighScore(manager.highScore)
      } catch (error) {
        console.error('Failed to initialize points system:', error)
      }
    }
    
    initPoints()
    
    return () => {
      if (pointsManagerRef.current) {
        cleanupPointsSystem(pointsManagerRef.current).catch(console.error)
      }
    }
  }, [])

  // Initialize score display after DOM is ready
  useEffect(() => {
    if (typeof document === 'undefined' || !pointsManagerRef.current) return
    
    const timer = setTimeout(() => {
      try {
        const display = new ScoreDisplay(
          '#current-score',
          '#high-score',
          '.game-container',
          { animationDuration: 800 }
        )
        scoreDisplayRef.current = display
        
        if (pointsManagerRef.current) {
          display.updateScores(
            pointsManagerRef.current.currentPoints,
            pointsManagerRef.current.highScore
          )
        }
      } catch (error) {
        console.error('Failed to initialize score display:', error)
      }
    }, 100)
    
    return () => clearTimeout(timer)
  }, [currentPoints, highScore])

  const resetPoints = () => {
    if (pointsManagerRef.current && scoreDisplayRef.current) {
      handleGameReset(pointsManagerRef.current, scoreDisplayRef.current)
    }
  }

  const addPointsForMatches = (correctMatches: CorrectMatch[], attemptCounts: Record<string, number>, gameStartTime: number) => {
    let totalPointsEarned = 0
    
    if (pointsManagerRef.current) {
      const timeElapsed = Date.now() - gameStartTime
      
      correctMatches.forEach(result => {
        const attemptCount = attemptCounts[result.userGuessId] || 1
        const matchResult = createMatchResult(true, timeElapsed, attemptCount)
        const pointsEarned = pointsManagerRef.current!.addPoints(matchResult)
        totalPointsEarned += pointsEarned
      })
      
      if (scoreDisplayRef.current) {
        scoreDisplayRef.current.updateScores(
          pointsManagerRef.current.currentPoints,
          pointsManagerRef.current.highScore
        )
        
        if (totalPointsEarned > 0) {
          scoreDisplayRef.current.animatePoints(totalPointsEarned, true)
        }
      }
      
      pointsManagerRef.current.saveState().catch(error => {
        console.warn('Failed to save points state:', error)
      })
      
      setCurrentPoints(pointsManagerRef.current.currentPoints)
      setHighScore(pointsManagerRef.current.highScore)
    }
    
    return totalPointsEarned
  }

  return {
    currentPoints,
    highScore,
    pointsManagerRef,
    scoreDisplayRef,
    resetPoints,
    addPointsForMatches,
    formatPoints
  }
} 