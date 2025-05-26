"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, XCircle, RefreshCw, AlertCircle, Trophy, Timer, Star, Target, ArrowRightLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { useToast } from "@/hooks/use-toast"
import { 
  useHapticFeedback, 
  useTouchTarget 
} from "@/hooks/use-mobile-interactions"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  PointsManager,
  ScoreDisplay,
  createMatchResult,
  handleGameReset,
  cleanupPointsSystem,
  formatPoints
} from "@/points"

// Aceternity UI Components - minimal usage
import { TextGenerateEffect } from "@/components/ui/text-generate-effect"

interface Inmate {
  id: number
  name: string
  image: string
  crime?: string
}

// Clean Loading Component
function GameSkeleton() {
  return (
    <div className="flex justify-center items-center min-h-screen p-6">
      <div className="w-full max-w-7xl bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        
        <div className="h-12 w-80 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-8 animate-pulse" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Clean Error Component
function GameError({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="flex justify-center items-center min-h-screen p-6">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Game Loading Error</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
        <Button onClick={onRetry} className="w-full">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    </div>
  )
}

// Clean Stats Display
function GameStats({ 
  totalMatches, 
  correctMatches, 
  gameStartTime,
  currentPoints,
  highScore
}: { 
  totalMatches: number
  correctMatches: number
  gameStartTime: number
  currentPoints: number
  highScore: number
}) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _totalMatches = totalMatches;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars  
  const _correctMatches = correctMatches;
  const [elapsedTime, setElapsedTime] = useState(0)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - gameStartTime) / 1000))
    }, 1000)
    
    return () => clearInterval(interval)
  }, [gameStartTime])
  
  // const accuracy = totalMatches > 0 ? Math.round((correctMatches / totalMatches) * 100) : 0
  
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg">
        <Star className="h-4 w-4 text-blue-600" />
        <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">{formatPoints(currentPoints)}</span>
      </div>
      
      <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg">
        <Trophy className="h-4 w-4 text-amber-600" />
        <span className="text-sm text-amber-600 dark:text-amber-400 font-medium">{formatPoints(highScore)}</span>
      </div>
      
      <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg">
        <Timer className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
          {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}
        </span>
      </div>
    </div>
  )
}

// Clean Mugshot Card
function CleanMugshotCard({ 
  mugshot, 
  index, 
  isSelected,
  isMatched,
  onClick,
  results,
  matches,
  getInmateDataById
}: {
  mugshot: Inmate
  index: number
  isSelected: boolean
  isMatched: boolean
  onClick: () => void
  results: {
    score: number;
    total: number;
    percentage: number;
    submitted: boolean;
    correctMatches: number[];
    detailedResults: Array<{
      mugshotId: string;
      mugshotName: string;
      mugshotImage: string;
      actualCrime: string;
      userGuessId: string;
      userGuessCrime: string;
      isCorrect: boolean;
    }>;
    pointsEarned: number;
  } | null
  matches: Record<string, string | null>
  getInmateDataById: (id: string | number) => Inmate | undefined
}) {
  const { touchTargetProps } = useTouchTarget()
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      onClick={onClick}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      {...touchTargetProps}
    >
      <div className={cn(
        "relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200 shadow-sm hover:shadow-md",
        isSelected && "border-blue-500 ring-2 ring-blue-200 shadow-lg",
        isMatched && !isSelected && "border-green-500 ring-2 ring-green-200",
        !isSelected && !isMatched && "border-gray-200 dark:border-gray-700 hover:border-gray-300"
      )}>
        <Image
          src={mugshot.image || "/placeholder.svg"}
          alt={mugshot.name}
          fill
          className="object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/placeholder.svg?height=300&width=300&text=" + encodeURIComponent(mugshot.name);
          }}
        />
        
        {/* Name overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-center py-2 px-3">
          <div className="text-sm font-medium truncate">{mugshot.name}</div>
        </div>

        {/* Status indicators */}
        <AnimatePresence>
          {isSelected && (
            <motion.div 
              className="absolute top-2 right-2 bg-blue-500 rounded-full p-1.5 shadow-lg"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Star className="h-3 w-3 text-white" />
            </motion.div>
          )}
          
          {isMatched && !isSelected && (
            <motion.div 
              className="absolute top-2 right-2 bg-green-500 rounded-full p-1.5 shadow-lg"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <CheckCircle2 className="h-3 w-3 text-white" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results overlay */}
        <AnimatePresence>
          {results?.submitted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={cn(
                "absolute inset-0 flex flex-col items-center justify-center text-white p-2 text-center",
                Object.entries(matches).some(
                  ([descriptionId, matchedImageId]) =>
                    matchedImageId === mugshot.id.toString() && descriptionId === mugshot.id.toString(),
                )
                  ? "bg-green-500/90" 
                  : "bg-red-500/90"
              )}
            >
              {Object.entries(matches).some(
                ([descriptionId, matchedImageId]) =>
                  matchedImageId === mugshot.id.toString() && descriptionId === mugshot.id.toString(),
              ) ? (
                <motion.div 
                  className="flex flex-col items-center gap-1"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-semibold">Correct!</span>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  className="flex flex-col items-center gap-1 max-w-full"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                >
                  <div className="flex items-center gap-1 mb-1">
                    <XCircle className="h-4 w-4" />
                    <span className="font-semibold text-sm">Incorrect</span>
                  </div>
                  {(() => {
                    // Find what the user guessed for this mugshot
                    const userGuessEntry = Object.entries(matches).find(
                      ([, matchedImageId]) => matchedImageId === mugshot.id.toString()
                    );
                    const userGuessedCrimeId = userGuessEntry?.[0];
                    const userGuessedCrime = userGuessedCrimeId ? getInmateDataById(userGuessedCrimeId)?.crime : null;
                    const actualCrime = getInmateDataById(mugshot.id)?.crime;
                    
                    return (
                      <div className="space-y-1 text-xs w-full">
                        {userGuessedCrime && (
                          <div className="bg-red-600/60 p-1 rounded">
                            <div className="font-medium text-red-100">Your guess:</div>
                            <div className="text-red-200 leading-tight">{userGuessedCrime.length > 40 ? userGuessedCrime.substring(0, 40) + '...' : userGuessedCrime}</div>
                          </div>
                        )}
                        <div className="bg-white/20 p-1 rounded">
                          <div className="font-medium">Actual crime:</div>
                          <div className="text-white leading-tight">{actualCrime && actualCrime.length > 40 ? actualCrime.substring(0, 40) + '...' : actualCrime || "Unknown"}</div>
                        </div>
                      </div>
                    );
                  })()}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// Clean Crime Card
function CleanCrimeCard({ 
  crime, 
  index,
  isSelected,
  isMatched,
  matchedMugshot,
  onClick,
  results
}: {
  crime: Inmate
  index: number
  isSelected: boolean
  isMatched: boolean
  matchedMugshot: Inmate | null
  onClick: () => void
  results: {
    score: number;
    total: number;
    percentage: number;
    submitted: boolean;
    correctMatches: number[];
    detailedResults: Array<{
      mugshotId: string;
      mugshotName: string;
      mugshotImage: string;
      actualCrime: string;
      userGuessId: string;
      userGuessCrime: string;
      isCorrect: boolean;
    }>;
    pointsEarned: number;
  } | null
}) {
  const { touchTargetProps } = useTouchTarget()
  
  const processedCrime = crime.crime?.includes(' | ') 
    ? crime.crime.split(' | ')[0].trim()
    : crime.crime

  return (
    <motion.div
             initial={{ opacity: 0, x: 20 }}
       animate={{ opacity: 1, x: 0 }}
       transition={{ delay: index * 0.1, duration: 0.3 }}
       onClick={onClick}
       whileHover={{ scale: 1.01 }}
       whileTap={{ scale: 0.99 }}
       className={cn(
         "p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer hover:shadow-md",
         isSelected && "border-blue-500 bg-blue-50 dark:bg-blue-900/20",
         isMatched && !isSelected && "border-green-500 bg-green-50 dark:bg-green-900/20",
         !isSelected && !isMatched && "border-gray-200 dark:border-gray-700 hover:border-gray-300 bg-white dark:bg-gray-800",
         touchTargetProps.className
       )}
       style={touchTargetProps.style}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-white leading-relaxed">
            {processedCrime || "Unknown crime"}
          </p>
          
          {matchedMugshot && (
            <div className="flex items-center gap-2 mt-2">
              <Image
                src={matchedMugshot.image}
                alt={matchedMugshot.name}
                width={24}
                height={24}
                className="h-6 w-6 rounded-full object-cover"
              />
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                {matchedMugshot.name}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {isSelected && (
            <div className="bg-blue-500 rounded-full p-1">
              <Star className="h-3 w-3 text-white" />
            </div>
          )}
          
          {isMatched && !isSelected && (
            <div className="bg-green-500 rounded-full p-1">
              <CheckCircle2 className="h-3 w-3 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Results indicator */}
      <AnimatePresence>
        {results?.submitted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "mt-3 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1",
              results.correctMatches.includes(crime.id)
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            )}
          >
            {results.correctMatches.includes(crime.id) ? (
              <>
                <CheckCircle2 className="h-3 w-3" />
                Correct!
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3" />
                Incorrect
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Clean Mobile Modal
function CleanMobileCrimeModal({
  isOpen,
  onClose,
  selectedMugshot,
  allCrimes,
  matches,
  getInmateDataById,
  onCrimeSelect,
}: {
  isOpen: boolean
  onClose: () => void
  selectedMugshot: Inmate
  allCrimes: Inmate[]
  matches: Record<string, string | null>
  getInmateDataById: (id: string | number) => Inmate | undefined
  onCrimeSelect: (crimeId: string) => void
}) {
  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            Match Crime for: {selectedMugshot.name}
          </DialogTitle>
          <DialogDescription>
            Select the crime that matches this person.
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-4 flex justify-center">
          <Image 
            src={selectedMugshot.image} 
            alt={selectedMugshot.name} 
            width={80}
            height={80}
            className="h-20 w-20 rounded-lg object-cover border-2 border-blue-500"
          />
        </div>
        
        <div className="max-h-[50vh] overflow-y-auto space-y-2">
          {allCrimes.map((crime) => {
            const matchedMugshotId = matches[crime.id.toString()]
            const matchedMugshot = matchedMugshotId ? getInmateDataById(matchedMugshotId) : null
            const isCurrentMatch = matchedMugshotId === selectedMugshot.id.toString()
            const isAlreadyMatched = matchedMugshotId && !isCurrentMatch
            
            return (
              <Button
                key={crime.id}
                variant="outline"
                disabled={!!isAlreadyMatched}
                className={cn(
                  "w-full justify-start text-left h-auto py-3 px-4",
                  isCurrentMatch && "border-blue-500 bg-blue-50 dark:bg-blue-900/20",
                  isAlreadyMatched && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => onCrimeSelect(crime.id.toString())}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className="flex-1">
                    <p className="text-sm">
                      {crime.crime?.includes(' | ') 
                        ? crime.crime.split(' | ')[0].trim()
                        : crime.crime || "Unknown Crime"}
                    </p>
                  </div>
                  
                  {matchedMugshot && (
                    <div className="flex items-center gap-2">
                      <Image
                        src={matchedMugshot.image}
                        alt={matchedMugshot.name}
                        width={32}
                        height={32}
                        className="h-8 w-8 rounded object-cover"
                      />
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {matchedMugshot.name}
                      </span>
                    </div>
                  )}
                </div>
              </Button>
            )
          })}
        </div>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function CleanAceternityMugshotGame() {
  const { toast } = useToast()
  const isMobile = useIsMobile()
  const { triggerHaptic } = useHapticFeedback()
  
  // Mobile-specific state
  const [selectedMugshotForMobile, setSelectedMugshotForMobile] = useState<Inmate | null>(null)

  const [inmates, setInmates] = useState<Inmate[]>([])
  const [shuffledMugshotImages, setShuffledMugshotImages] = useState<Inmate[]>([])
  const [shuffledCrimeDescriptions, setShuffledCrimeDescriptions] = useState<Inmate[]>([])
  const [selectedMugshotId, setSelectedMugshotId] = useState<string | null>(null)
  const [selectedDescriptionId, setSelectedDescriptionId] = useState<string | null>(null)
  const [matches, setMatches] = useState<Record<string, string | null>>({})
  const [results, setResults] = useState<{
    score: number;
    total: number;
    percentage: number;
    submitted: boolean;
    correctMatches: number[];
    detailedResults: Array<{
      mugshotId: string;
      mugshotName: string;
      mugshotImage: string;
      actualCrime: string;
      userGuessId: string;
      userGuessCrime: string;
      isCorrect: boolean;
    }>;
    pointsEarned: number;
  } | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const [isCrimeModalOpen, setIsCrimeModalOpen] = useState(false)

  // Points system state
  const [currentPoints, setCurrentPoints] = useState<number>(0)
  const [highScore, setHighScore] = useState<number>(0)
  const pointsManagerRef = useRef<PointsManager | null>(null)
  const scoreDisplayRef = useRef<ScoreDisplay | null>(null)
  
  // Game state tracking
  const [attemptCounts, setAttemptCounts] = useState<Record<string, number>>({})
  const gameStartTimeRef = useRef<number>(Date.now())

  // Fetch inmate data
  useEffect(() => {
    const fetchInmates = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/inmates')
        
        if (!response.ok) {
          throw new Error(`Failed to fetch inmates: ${response.status}`)
        }
        
        const data = await response.json()
        setInmates(data.inmates)
        resetGame(data.inmates)
        setError(null)
      } catch (err) {
        console.error('Error fetching inmate data:', err)
        setError('Failed to load inmate data. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchInmates()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  // Handle matching when both selections are made
  useEffect(() => {
    if (selectedMugshotId && selectedDescriptionId) {
      setAttemptCounts(prev => ({
        ...prev,
        [selectedDescriptionId]: (prev[selectedDescriptionId] || 0) + 1
      }))

      setMatches((prev) => {
        const newMatches = { ...prev }
        Object.keys(newMatches).forEach(key => {
          if (newMatches[key] === selectedMugshotId) {
            newMatches[key] = null;
          }
        });
        newMatches[selectedDescriptionId] = selectedMugshotId
        return newMatches
      })

      setSelectedMugshotId(null)
      setSelectedDescriptionId(null)
    }
  }, [selectedMugshotId, selectedDescriptionId])

  const resetGame = (data = inmates) => {
    if (!data.length) return
    
    const shuffledImages = [...data].sort(() => Math.random() - 0.5)
    const shuffledDescriptions = [...data].sort(() => Math.random() - 0.5)

    setShuffledCrimeDescriptions(shuffledDescriptions)
    setShuffledMugshotImages(shuffledImages)
    setMatches({})
    setResults(null)
    setAttemptCounts({})
    gameStartTimeRef.current = Date.now()
    
    if (pointsManagerRef.current && scoreDisplayRef.current) {
      handleGameReset(pointsManagerRef.current, scoreDisplayRef.current)
    }
  }

  const handleSubmit = () => {
    const allDescriptionsMatched = shuffledCrimeDescriptions.length === Object.values(matches).filter(v => v !== null).length;

    if (!allDescriptionsMatched) {
      toast({
        title: "Incomplete Matches",
        description: "Please match all images before submitting.",
        variant: "destructive",
      })
      return
    }

    const detailedResults: Array<{
      mugshotId: string;
      mugshotName: string;
      mugshotImage: string;
      actualCrime: string;
      userGuessId: string;
      userGuessCrime: string;
      isCorrect: boolean;
    }> = [];

    Object.entries(matches).forEach(([guessedCrimeId, mugshotId]) => {
      if (mugshotId) {
        const mugshot = getInmateDataById(mugshotId);
        const guessedCrime = getInmateDataById(guessedCrimeId);
        const actualCrime = getInmateDataById(mugshotId);
        
        if (mugshot && guessedCrime && actualCrime) {
          detailedResults.push({
            mugshotId: mugshotId,
            mugshotName: mugshot.name,
            mugshotImage: mugshot.image,
            actualCrime: actualCrime.crime || "Unknown crime",
            userGuessId: guessedCrimeId,
            userGuessCrime: guessedCrime.crime || "Unknown crime",
            isCorrect: guessedCrimeId === mugshotId
          });
        }
      }
    });

    const correctMatches = detailedResults.filter(result => result.isCorrect);
    const score = correctMatches.length;
    const total = shuffledCrimeDescriptions.length;
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

    let totalPointsEarned = 0
    
    if (pointsManagerRef.current) {
      const timeElapsed = Date.now() - gameStartTimeRef.current
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

    setResults({
      score,
      total,
      percentage,
      submitted: true,
      correctMatches: correctMatches.map(result => Number(result.mugshotId)),
      detailedResults: detailedResults,
      pointsEarned: totalPointsEarned
    })

    if (score === total && total > 0) {
      triggerHaptic('success');
    } else if (percentage >= 70) {
      triggerHaptic('medium');
    } else {
      triggerHaptic('error');
    }

    toast({
      title: `Your Score: ${score}/${total}`,
      description: `You got ${percentage}% correct! ${totalPointsEarned > 0 ? `+${formatPoints(totalPointsEarned)} points!` : ''}`,
      variant: score === total && total > 0 ? "default" : "destructive",
    })
  }

  const getInmateDataById = (id: string | number): Inmate | undefined => {
    const numericId = Number(id);
    return inmates.find((inmate) => inmate.id === numericId);
  }

  const retryFetch = () => {
    setError(null)
    setLoading(true)
    window.location.reload()
  }

  if (loading) {
    return <GameSkeleton />
  }

  if (error) {
    return <GameError error={error} onRetry={retryFetch} />
  }

  const totalMatches = Object.values(matches).filter(Boolean).length
  const correctMatches = Object.entries(matches).filter(([key, value]) => value === key).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="w-full max-w-7xl mx-auto">
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700">
          
          {/* Header */}
          <div className="text-center mb-8">
            <TextGenerateEffect
              words="Mugshot Matching Game"
              className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4"
              duration={0.5}
            />
            
            {!results?.submitted && (
              <GameStats 
                totalMatches={totalMatches}
                correctMatches={correctMatches}
                gameStartTime={gameStartTimeRef.current}
                currentPoints={currentPoints}
                highScore={highScore}
              />
            )}
            
            {!results?.submitted && (
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span>Progress</span>
                  <span>{totalMatches}/6</span>
                </div>
                <Progress value={(totalMatches / 6) * 100} className="h-2" />
              </div>
            )}
          </div>

          {/* Game Board */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Mugshots Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Suspects</h2>
                <Badge variant="secondary" className="text-xs">
                  {isMobile ? "Tap to select" : "Click to select"}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {shuffledMugshotImages.map((mugshot, index) => (
                  <CleanMugshotCard
                    key={mugshot.id}
                    mugshot={mugshot}
                    index={index}
                    isSelected={selectedMugshotId === mugshot.id.toString()}
                    isMatched={Object.values(matches).includes(mugshot.id.toString())}
                    onClick={() => {
                      if (isMobile) {
                        setSelectedMugshotForMobile(mugshot);
                        setIsCrimeModalOpen(true);
                      } else {
                        setSelectedMugshotId(mugshot.id.toString());
                      }
                    }}
                    results={results}
                    matches={matches}
                    getInmateDataById={getInmateDataById}
                  />
                ))}
              </div>
            </div>

            {/* Crime Descriptions Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Crimes</h2>
                <Badge variant="secondary" className="text-xs">
                  {isMobile ? "Select a suspect first" : "Click to match"}
                </Badge>
              </div>
              
              <div className="space-y-3">
                {shuffledCrimeDescriptions.map((description, index) => {
                  const matchedMugshotId = matches[description.id.toString()];
                  const matchedMugshot = matchedMugshotId ? getInmateDataById(matchedMugshotId) : null;
                  
                  return (
                    <CleanCrimeCard
                      key={description.id}
                      crime={description}
                      index={index}
                      isSelected={!isMobile && selectedDescriptionId === description.id.toString()}
                      isMatched={!!matchedMugshot}
                      matchedMugshot={matchedMugshot || null}
                      onClick={() => {
                        if (!isMobile) {
                          setSelectedDescriptionId(description.id.toString());
                        }
                      }}
                      results={results}
                    />
                  )
                })}
              </div>
            </div>
          </div>

          {/* Results Section */}
          {results?.submitted && (
            <motion.div 
              className="mb-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Game Results</h2>
                <div className="flex justify-center gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{results.score}/{results.total}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{results.percentage}%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy</div>
                  </div>
                  {results.pointsEarned && results.pointsEarned > 0 && (
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">+{results.pointsEarned}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Points</div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-center">
                <div className="p-3 bg-white dark:bg-gray-700 rounded-lg inline-block">
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Total Score</p>
                  <p className="text-2xl font-bold text-blue-600">{formatPoints(currentPoints)}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="text-center">
            {!results?.submitted ? (
              <Button
                onClick={handleSubmit}
                disabled={totalMatches < 6}
                size="lg"
                className={cn(
                  "px-8 py-3 text-lg font-semibold",
                  totalMatches < 6 && "opacity-50 cursor-not-allowed"
                )}
              >
                {totalMatches < 6 ? (
                  <>
                    Complete All Matches ({totalMatches}/6)
                    <Target className="ml-2 h-5 w-5" />
                  </>
                ) : (
                  <>
                    Submit Answers
                    <ArrowRightLeft className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={() => resetGame()}
                size="lg"
                className="px-8 py-3 text-lg font-semibold"
              >
                Play Again
                <RefreshCw className="ml-2 h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Crime Selection Modal */}
      {isMobile && selectedMugshotForMobile && (
        <CleanMobileCrimeModal
          isOpen={isCrimeModalOpen}
          onClose={() => {
            setIsCrimeModalOpen(false);
            setSelectedMugshotForMobile(null);
          }}
          selectedMugshot={selectedMugshotForMobile}
          allCrimes={shuffledCrimeDescriptions}
          matches={matches}
          getInmateDataById={getInmateDataById}
          onCrimeSelect={(crimeId: string) => {
            setAttemptCounts(prev => ({
              ...prev,
              [crimeId]: (prev[crimeId] || 0) + 1
            }));

            setMatches((prev) => {
              const newMatches = { ...prev };
              Object.keys(newMatches).forEach(key => {
                if (newMatches[key] === selectedMugshotForMobile.id.toString()) {
                  newMatches[key] = null;
                }
              });
              newMatches[crimeId] = selectedMugshotForMobile.id.toString();
              return newMatches;
            });

            setIsCrimeModalOpen(false);
            setSelectedMugshotForMobile(null);
          }}
        />
      )}
    </div>
  )
} 