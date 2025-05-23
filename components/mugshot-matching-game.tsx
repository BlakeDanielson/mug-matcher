"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, XCircle, ArrowRightLeft, RefreshCw, AlertCircle, Trophy, Timer, Star, Target } from "lucide-react"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { useToast } from "@/hooks/use-toast"
import { AdBanner } from "@/components/ui/ad-banner"
import { InterRoundAdModal } from "@/components/ui/inter-round-ad-modal"

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

// Define the inmate data type
interface Inmate {
  id: number
  name: string
  image: string
  crime?: string
  sentence?: string
}

// Enhanced Loading Component
function GameSkeleton() {
  return (
    <div className="w-full max-w-7xl">
      <Card className="p-6 shadow-lg bg-gray-900/50 border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-8 w-24 bg-gray-200" />
          <Skeleton className="h-8 w-32 bg-gray-200" />
        </div>
        
        <div className="mb-6 text-center">
          <Skeleton className="h-6 w-64 mx-auto bg-gray-200" />
        </div>

        <div className="space-y-8">
          <div>
            <Skeleton className="h-6 w-32 mb-4 bg-gray-200" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-square">
                  <Skeleton className="w-full h-full rounded-lg bg-gray-200" />
                </div>
              ))}
            </div>
          </div>

          <div>
            <Skeleton className="h-6 w-40 mb-4 bg-gray-200" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-[150px] rounded-lg bg-gray-200" />
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-10 flex justify-center">
          <Skeleton className="h-12 w-40 bg-gray-200" />
        </div>
      </Card>
    </div>
  )
}

// Enhanced Error Component
function GameError({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="w-full max-w-7xl">
      <Card className="p-8 shadow-lg bg-red-50 border-red-200">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-red-100 border border-red-200">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Game Loading Error</h2>
          <p className="text-gray-600 max-w-md mx-auto">{error}</p>
          <Button 
            onClick={onRetry}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </Card>
    </div>
  )
}

// Enhanced Stats Display
function GameStats({ 
  totalMatches, 
  correctMatches, 
  gameStartTime 
}: { 
  totalMatches: number
  correctMatches: number
  gameStartTime: number 
}) {
  const [elapsedTime, setElapsedTime] = useState(0)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - gameStartTime) / 1000))
    }, 1000)
    
    return () => clearInterval(interval)
  }, [gameStartTime])
  
  const accuracy = totalMatches > 0 ? Math.round((correctMatches / totalMatches) * 100) : 0
  const progressValue = totalMatches > 0 ? (totalMatches / 6) * 100 : 0
  
  return (
    <div className="flex flex-wrap justify-center gap-3 mb-4">
      <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 px-3 py-1">
        <Timer className="h-3 w-3 mr-1" />
        {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}
      </Badge>
      
      <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700 px-3 py-1">
        <Target className="h-3 w-3 mr-1" />
        {correctMatches}/{totalMatches} Correct
      </Badge>
      
      <Badge variant="outline" className="border-purple-200 bg-purple-50 text-purple-700 px-3 py-1">
        <Star className="h-3 w-3 mr-1" />
        {accuracy}% Accuracy
      </Badge>
      
      <div className="w-full max-w-xs">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progress</span>
          <span>{totalMatches}/6</span>
        </div>
        <Progress 
          value={progressValue} 
          className="h-2 bg-gray-200"
        />
      </div>
    </div>
  )
}

// Modal for selecting a crime for a chosen mugshot
function CrimeSelectionModal({
  isOpen,
  onClose,
  selectedMugshot,
  availableCrimes,
  onCrimeSelect,
}: {
  isOpen: boolean
  onClose: () => void
  selectedMugshot: Inmate
  availableCrimes: Inmate[]
  onCrimeSelect: (descriptionId: string) => void
}) {
  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-gray-900/95 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-gray-100 flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-400" />
            Match Crime for: {selectedMugshot.name}
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            Select the crime description that matches this person.
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-4 flex justify-center">
          <div className="relative">
            <Image 
              src={selectedMugshot.image} 
              alt={selectedMugshot.name} 
              width={128}
              height={128}
              className="h-32 w-32 rounded-xl object-cover border-2 border-blue-500 shadow-lg"
            />
            <div className="absolute -top-2 -right-2 bg-blue-500 rounded-full p-1">
              <Star className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>
        
        <div className="max-h-[40vh] overflow-y-auto space-y-2 pr-2">
          {availableCrimes.length > 0 ? (
            availableCrimes.map((crimeDesc) => (
              <Button
                key={crimeDesc.id}
                variant="outline"
                className="w-full justify-start text-left h-auto py-3 px-4 border-gray-300 hover:bg-gray-50 text-gray-700 hover:border-blue-300 transition-colors duration-200 rounded-lg"
                onClick={() => onCrimeSelect(crimeDesc.id.toString())}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-1 rounded-full bg-gray-100">
                    <AlertCircle className="h-3 w-3 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm leading-relaxed">{crimeDesc.crime || "Unknown Crime"}</span>
                    {crimeDesc.sentence && (
                      <div className="text-xs text-red-600 font-semibold mt-1">
                        Sentence: {crimeDesc.sentence}
                      </div>
                    )}
                  </div>
                </div>
              </Button>
            ))
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No available crimes to match.</p>
            </div>
          )}
        </div>
        
        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button type="button" variant="secondary" className="border-gray-300 text-gray-700 hover:bg-gray-50">
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function MugshotMatchingGame() {
  const { toast } = useToast()
  const isMobile = useIsMobile()
  const shouldUseModalUX = isMobile

  const [inmates, setInmates] = useState<Inmate[]>([])
  const [shuffledMugshotImages, setShuffledMugshotImages] = useState<Inmate[]>([])
  const [shuffledCrimeDescriptions, setShuffledCrimeDescriptions] = useState<Inmate[]>([])
  const [selectedMugshotId, setSelectedMugshotId] = useState<string | null>(null)
  const [selectedDescriptionId, setSelectedDescriptionId] = useState<string | null>(null)
  const [matches, setMatches] = useState<Record<string, string | null>>({})
  const [results, setResults] = useState<{
    score: number
    total: number
    percentage: number
    submitted: boolean
    correctMatches: number[]
    incorrectMatches: number[]
    totalCorrect: number
    totalIncorrect: number
    accuracy: number
    pointsEarned?: number
  } | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const [isCrimeModalOpen, setIsCrimeModalOpen] = useState(false)
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false)
  const [animationsEnabled, setAnimationsEnabled] = useState(false)
  const [isInterRoundModalOpen, setIsInterRoundModalOpen] = useState(false)

  // Points system state
  const [currentPoints, setCurrentPoints] = useState<number>(0)
  const [highScore, setHighScore] = useState<number>(0)
  const pointsManagerRef = useRef<PointsManager | null>(null)
  const scoreDisplayRef = useRef<ScoreDisplay | null>(null)
  
  // Game state tracking
  const [attemptCounts, setAttemptCounts] = useState<Record<string, number>>({})
  const gameStartTimeRef = useRef<number>(Date.now())

  // Fetch inmate data from the API
  useEffect(() => {
    const fetchInmates = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Add a minimum loading time for better UX
        const [response] = await Promise.all([
          fetch('/api/inmates'),
          new Promise(resolve => setTimeout(resolve, 1000)) // Minimum 1 second loading
        ])
        
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
        // Use placeholder data if API fails
        const placeholderData = [
          { id: 1, name: "John Doe", image: "/placeholder.svg?key=cfqyy" },
          { id: 2, name: "Jane Smith", image: "/.svg?key=j2s7m" },
          { id: 3, name: "Mike Johnson", image: "/placeholder.svg?key=p9r4t" },
          { id: 4, name: "Sarah Williams", image: "/placeholder.svg?key=5a1tv" },
          { id: 5, name: "Robert Brown", image: "/placeholder.svg?key=k8paz" },
          { id: 6, name: "Emily Davis", image: "/placeholder.svg?key=d3xrz" },
        ]
        setInmates(placeholderData)
        resetGame(placeholderData)
      } finally {
        setLoading(false)
      }
    }

    fetchInmates()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Mark as initially loaded after content is ready
  useEffect(() => {
    if (!loading && inmates.length > 0 && !hasInitiallyLoaded) {
      const timer = setTimeout(() => {
        setHasInitiallyLoaded(true)
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [loading, inmates.length, hasInitiallyLoaded])

  // Enable animations after everything is loaded
  useEffect(() => {
    if (!loading && inmates.length > 0) {
      // Mark as initially loaded first
      setHasInitiallyLoaded(true)
      
      // Wait a bit more to ensure all DOM elements are rendered
      const timer = setTimeout(() => {
        setAnimationsEnabled(true)
      }, 500)
      
      return () => clearTimeout(timer)
    }
  }, [loading, inmates.length])

  // Retry function for error state
  const retryFetch = () => {
    setError(null)
    setLoading(true)
    // Re-trigger the fetch
    window.location.reload()
  }

  // Initialize points system
  useEffect(() => {
    const initPoints = async () => {
      try {
        // Import dynamically to avoid SSR issues
        const { createPointsManager } = await import('@/points')
        
        // Create points manager
        const manager = await createPointsManager()
        pointsManagerRef.current = manager
        
        // Update state with current points and high score
        setCurrentPoints(manager.currentPoints)
        setHighScore(manager.highScore)
      } catch (error) {
        console.error('Failed to initialize points system:', error)
      }
    }
    
    initPoints()
    
    // Cleanup on unmount
    return () => {
      if (pointsManagerRef.current) {
        cleanupPointsSystem(pointsManagerRef.current).catch(console.error)
      }
    }
  }, [])

  // Effect to handle matching when both a mugshot and description are selected
  useEffect(() => {
    if (selectedMugshotId && selectedDescriptionId) {
      // Track attempt count for this description
      setAttemptCounts(prev => ({
        ...prev,
        [selectedDescriptionId]: (prev[selectedDescriptionId] || 0) + 1
      }))

      // Update the matches state
      setMatches((prev) => {
        const newMatches = { ...prev }
        // Remove the mugshot if it was previously assigned to another description
        Object.keys(newMatches).forEach(key => {
          if (newMatches[key] === selectedMugshotId) {
            newMatches[key] = null;
          }
        });
        // Assign the selected mugshot to the selected description
        newMatches[selectedDescriptionId] = selectedMugshotId
        return newMatches
      })

      // Reset selections
      setSelectedMugshotId(null)
      setSelectedDescriptionId(null)
    }
  }, [selectedMugshotId, selectedDescriptionId]) // Dependency array

  // Initialize score display after DOM is ready
  useEffect(() => {
    // Wait for DOM elements to be available
    if (typeof document === 'undefined' || !pointsManagerRef.current) return
    
    // Small delay to ensure DOM is fully rendered
    const timer = setTimeout(() => {
      try {
        const display = new ScoreDisplay(
          '#current-score',
          '#high-score',
          '.game-container',
          { animationDuration: 800 }
        )
        scoreDisplayRef.current = display
        
        // Update display
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
  }, [currentPoints, highScore]) // Re-run when points change

  // Shuffle the mugshots and crimes
  const resetGame = (data = inmates) => {
    if (!data.length) return
    
    // Reset animation state for new game
    setHasInitiallyLoaded(false)
    
    // Shuffle images and descriptions separately
    const shuffledImages = [...data].sort(() => Math.random() - 0.5)
    const shuffledDescriptions = [...data].sort(() => Math.random() - 0.5)

    setShuffledCrimeDescriptions(shuffledDescriptions) // Set descriptions
    setShuffledMugshotImages(shuffledImages) // Set images
    setMatches({})
    setResults(null)
    setAttemptCounts({})
    gameStartTimeRef.current = Date.now()
    
    // Reset points for current session
    if (pointsManagerRef.current && scoreDisplayRef.current) {
      handleGameReset(pointsManagerRef.current, scoreDisplayRef.current)
    }
  }

  // Submit and evaluate matches
  const handleSubmit = () => {
    // Check if all crime descriptions have been matched with a mugshot image
    // Ensure all descriptions have a non-null match value
    const allDescriptionsMatched = shuffledCrimeDescriptions.length === Object.values(matches).filter(v => v !== null).length;

    if (!allDescriptionsMatched) {
      toast({
        title: "Incomplete Matches",
        description: "Please match all images before submitting.",
        variant: "destructive",
      })
      return
    }

    // Calculate score
    const correctMatches = Object.entries(matches)
      // Filter for entries where the description ID (key) matches the mugshot ID (value)
      .filter(([descriptionId, matchedMugshotId]) => matchedMugshotId !== null && descriptionId === matchedMugshotId)
      .map(([descriptionId]) => descriptionId) // Get the IDs of correctly matched descriptions

    const score = correctMatches.length
    const total = shuffledCrimeDescriptions.length // Use the count of descriptions as total
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0

    // Calculate points
    let totalPointsEarned = 0
    
    if (pointsManagerRef.current) {
      // Calculate time elapsed since game start
      const timeElapsed = Date.now() - gameStartTimeRef.current
      // Process each correct match for points
      correctMatches.forEach(descriptionId => {
        const attemptCount = attemptCounts[descriptionId] || 1

        // Create match result
        const matchResult = createMatchResult(true, timeElapsed, attemptCount)
        
        // Add points
        const pointsEarned = pointsManagerRef.current!.addPoints(matchResult)
        totalPointsEarned += pointsEarned
      })
      
      // Update points display
      if (scoreDisplayRef.current) {
        scoreDisplayRef.current.updateScores(
          pointsManagerRef.current.currentPoints,
          pointsManagerRef.current.highScore
        )
        
        // Animate points if earned
        if (totalPointsEarned > 0) {
          scoreDisplayRef.current.animatePoints(totalPointsEarned, true)
        }
      }
      
      // Save state
      pointsManagerRef.current.saveState().catch(error => {
        console.warn('Failed to save points state:', error)
      })
      
      // Update state
      setCurrentPoints(pointsManagerRef.current.currentPoints)
      setHighScore(pointsManagerRef.current.highScore)
    }

    setResults({
      score,
      total,
      percentage,
      submitted: true,
      correctMatches: correctMatches.map(id => Number(id)), // Convert back to numbers if needed elsewhere, though string IDs are fine here
      incorrectMatches: [],
      totalCorrect: correctMatches.length,
      totalIncorrect: 0,
      accuracy: percentage,
      pointsEarned: totalPointsEarned
    })

    toast({
      title: `Your Score: ${score}/${total}`,
      description: `You got ${percentage}% correct! ${totalPointsEarned > 0 ? `+${formatPoints(totalPointsEarned)} points!` : ''}`,
      variant: score === total && total > 0 ? "default" : "destructive",
    })
  }

  // Find the mugshot data (name, image, crime) by ID
  const getInmateDataById = (id: string | number): Inmate | undefined => {
    // Ensure comparison is done with string IDs if necessary, or convert id to number
    const numericId = Number(id);
    return inmates.find((inmate) => inmate.id === numericId);
  }

  // If loading, show a loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen p-6">
        <GameSkeleton />
      </div>
    )
  }

  // If error, show an error state
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen p-6">
        <GameError error={error} onRetry={retryFetch} />
      </div>
    )
  }

  // Enhanced Selectable Mugshot Component with Animations
  function SelectableMugshot({ mugshot, index }: { mugshot: Inmate; index: number }) {
    const isMatched = Object.values(matches).includes(mugshot.id.toString());
    const isSelected = selectedMugshotId === mugshot.id.toString();
    const [isFlashing, setIsFlashing] = useState(false);

    const handleMugshotClick = () => {
      setSelectedMugshotId(mugshot.id.toString());
      
      // Flash effect when selecting
      setIsFlashing(true);
      setTimeout(() => setIsFlashing(false), 600);
      
      if (shouldUseModalUX) {
        setIsCrimeModalOpen(true);
      }
    };

    return (
      <motion.div
        initial={!hasInitiallyLoaded ? { opacity: 0, y: 20 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={!hasInitiallyLoaded ? { delay: index * 0.1, duration: 0.5 } : { duration: 0 }}
        className="cursor-pointer group"
        onClick={handleMugshotClick}
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.98 }}
      >
        <motion.div
          className={cn(
            "relative rounded-xl overflow-hidden border-2 aspect-square shadow-lg",
            "bg-gray-800/50 transition-all duration-300",
            isSelected && "border-blue-500 ring-4 ring-blue-200/50",
            isMatched && !results?.submitted && "border-green-500 ring-4 ring-green-200/50",
            !isSelected && !isMatched && "border-gray-600",
            results?.submitted && !Object.entries(matches).some(([descriptionId, matchedImageId]) =>
              matchedImageId === mugshot.id.toString() && descriptionId === mugshot.id.toString()
            ) && "opacity-60"
          )}
          animate={{
            scale: isFlashing ? [1, 1.05, 1] : 1,
            boxShadow: isSelected 
              ? "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" 
              : "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
          }}
          transition={{ duration: 0.3 }}
        >
          <motion.img
            src={mugshot.image || "/placeholder.svg"}
            alt={`Mugshot ${index + 1}`}
            className="w-full h-full object-cover"
            animate={{
              filter: isFlashing ? "brightness(1.2)" : "brightness(1)",
              scale: isFlashing ? [1, 1.03, 1] : 1
            }}
            transition={{ duration: 0.6 }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder.svg?height=300&width=300&text=" + encodeURIComponent(mugshot.name);
            }}
          />
          
          {/* Simple name label at bottom */}
          <div className="absolute bottom-0 left-0 right-0 bg-black text-white text-center py-2 px-3">
            <div className="text-sm font-medium truncate">
              {mugshot.name}
            </div>
          </div>

          {/* Selection indicator with animation */}
          <AnimatePresence>
            {isSelected && !results?.submitted && (
              <motion.div 
                className="absolute top-3 right-3"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <motion.div 
                  className="bg-blue-500 rounded-full p-2 shadow-lg"
                  animate={{ 
                    boxShadow: [
                      "0 0 0 0 rgba(59, 130, 246, 0.7)",
                      "0 0 0 10px rgba(59, 130, 246, 0)",
                      "0 0 0 0 rgba(59, 130, 246, 0)"
                    ]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Star className="h-4 w-4 text-white" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Match indicator with animation */}
          <AnimatePresence>
            {isMatched && !results?.submitted && (
              <motion.div 
                className="absolute top-3 right-3"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <motion.div 
                  className="bg-green-500 rounded-full p-2 shadow-lg"
                  animate={{ 
                    boxShadow: [
                      "0 0 0 0 rgba(34, 197, 94, 0.7)",
                      "0 0 0 10px rgba(34, 197, 94, 0)",
                      "0 0 0 0 rgba(34, 197, 94, 0)"
                    ]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results overlay with animation */}
          <AnimatePresence>
            {results?.submitted && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={cn(
                  "absolute bottom-0 inset-x-0 p-3 text-white text-center",
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
                    className="flex items-center justify-center gap-2"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-semibold">Correct!</span>
                  </motion.div>
                ) : (
                  <motion.div 
                    className="space-y-1"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <XCircle className="h-4 w-4" />
                      <span className="font-medium text-sm">Incorrect</span>
                    </div>
                    <div className="text-xs opacity-90 truncate">
                      Crime: {getInmateDataById(mugshot.id)?.crime || "Unknown"}
                    </div>
                    {getInmateDataById(mugshot.id)?.sentence && (
                      <div className="text-xs opacity-90 truncate">
                        Sentence: {getInmateDataById(mugshot.id)?.sentence}
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    );
  }

  // Enhanced Selectable Crime Description Component
  function SelectableDescription({ description }: { description: Inmate }) {
    // Process crime text to only show the first crime if multiple exist
    const processedCrime = description.crime?.includes(' | ') 
      ? description.crime.split(' | ')[0].trim()
      : description.crime;
    const matchedMugshotId = matches[description.id.toString()];
    const matchedMugshotData = matchedMugshotId ? getInmateDataById(matchedMugshotId) : null;
    const isSelectedForDesktopUX = !shouldUseModalUX && selectedDescriptionId === description.id.toString();

    return (
      <div
        className={cn(
          "p-6 rounded-xl border transition-all duration-200 shadow-md hover:shadow-lg min-h-[160px] flex flex-col justify-between",
          "bg-gray-800/50",
          !shouldUseModalUX && "cursor-pointer hover:border-gray-300 hover:scale-[1.02] transform",
          isSelectedForDesktopUX 
            ? "border-blue-500 ring-2 ring-blue-200"
            : results?.submitted && results.correctMatches.includes(description.id)
              ? "border-green-500 bg-green-50"
              : results?.submitted
                ? "border-red-500 bg-red-50"
                : "border-gray-600"
        )}
        onClick={() => {
          if (!shouldUseModalUX) {
            setSelectedDescriptionId(description.id.toString());
          }
        }}
      >
        {/* Crime description content */}
        <div className="flex-grow">
          <div className="flex items-start gap-3 mb-4">
            <div className="mt-1 p-2 rounded-full bg-gray-700 border border-gray-600">
              <AlertCircle className="h-4 w-4 text-gray-300" />
            </div>
            <div className="flex-1">
              <div className="text-lg font-medium text-gray-100 break-words whitespace-normal leading-relaxed">
                {processedCrime || "Unknown crime"}
              </div>
              {description.sentence && (
                <div className="text-sm text-red-400 font-semibold mt-2">
                  Sentence: {description.sentence}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status section */}
        <div className="mt-auto pt-4 border-t border-gray-600">
          <div className="flex items-center justify-between min-h-[44px]">
            <div className="flex-1">
              {matchedMugshotData ? (
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Image 
                      src={matchedMugshotData.image} 
                      alt={matchedMugshotData.name} 
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full object-cover border-2 border-gray-600 shadow-sm"
                    />
                    <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1">
                      <CheckCircle2 className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-100">{matchedMugshotData.name}</p>
                    <p className="text-xs text-gray-400">Matched</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-700 border-2 border-dashed border-gray-500 flex items-center justify-center">
                    <Target className="h-4 w-4 text-gray-300" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">
                      {isSelectedForDesktopUX ? "Selected - Choose mugshot" : "Click to select"}
                    </p>
                    <p className="text-xs text-gray-400">No match yet</p>
                  </div>
                </div>
              )}
            </div>

            {/* Result indicators */}
            <div className="ml-4">
              {results?.submitted && (
                <div className="flex items-center">
                  {matches[description.id.toString()] === description.id.toString() ? (
                    <div className="bg-green-500 rounded-full p-1">
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    </div>
                  ) : (
                    <div className="bg-red-500 rounded-full p-1">
                      <XCircle className="h-5 w-5 text-white" />
                    </div>
                  )}
                </div>
              )}
              
              {isSelectedForDesktopUX && !results?.submitted && (
                <Badge variant="outline" className="border-blue-500 text-blue-300 bg-blue-900/50">
                  Selected
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Selection indicator overlay */}
        {isSelectedForDesktopUX && (
          <div className="absolute top-3 right-3">
            <div className="bg-blue-500 rounded-full p-1 shadow-lg">
              <Star className="h-4 w-4 text-white" />
            </div>
          </div>
        )}

      </div>
    );
  }

  const totalMatches = Object.values(matches).filter(Boolean).length
  const correctMatches = Object.entries(matches).filter(([key, value]) => value === key).length

  return (
    <div className="flex justify-center items-center min-h-screen p-6">
      <Card className="w-full max-w-7xl p-6 shadow-lg bg-gray-900/50 border border-gray-700">
        {/* Score Display */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-6">
            <div className="bg-blue-900/50 px-4 py-2 rounded-lg border border-blue-700">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-gray-300">Points:</span>
                <span id="current-score" className="font-bold text-blue-400 text-lg">{formatPoints(currentPoints)}</span>
              </div>
            </div>
            <div className="flex items-center">
              <Trophy className="h-4 w-4 text-amber-400 mr-2" />
              <span className="text-sm text-gray-300">High Score:</span>
              <span id="high-score" className="font-bold text-amber-400 ml-2 text-lg">{formatPoints(highScore)}</span>
            </div>
          </div>
        </div>

        {/* Game Stats */}
        {!results?.submitted && (
          <GameStats 
            totalMatches={totalMatches}
            correctMatches={correctMatches}
            gameStartTime={gameStartTimeRef.current}
          />
        )}

        <div className="mb-4 text-center">
          <h1 className="text-3xl font-bold text-gray-100 mb-1">
            Criminal Lineup Challenge
          </h1>
          <p className="text-lg text-gray-300">
            Match each criminal with their crime
          </p>
        </div>

        {/* Game board */}
        <div className="space-y-6">
          {/* Mugshots Section */}
          <motion.div
            initial={animationsEnabled ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={animationsEnabled ? { duration: 0.6 } : { duration: 0 }}
          >
            <motion.h2 
              className="text-xl font-semibold text-gray-100 mb-3"
              initial={animationsEnabled ? { opacity: 0, x: -20 } : { opacity: 1, x: 0 }}
              animate={{ opacity: 1, x: 0 }}
              transition={animationsEnabled ? { delay: 0.2 } : { duration: 0 }}
            >
              Mugshots (Click one)
            </motion.h2>
            <motion.div 
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4"
              initial={animationsEnabled ? { opacity: 0 } : { opacity: 1 }}
              animate={{ opacity: 1 }}
              transition={animationsEnabled ? { delay: 0.4, duration: 0.8 } : { duration: 0 }}
            >
              {shuffledMugshotImages.map((mugshot, index) => (
                <SelectableMugshot key={mugshot.id} mugshot={mugshot} index={index} />
              ))}
            </motion.div>
          </motion.div>

          {/* Crime Descriptions Section */}
          <motion.div
            initial={animationsEnabled ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={animationsEnabled ? { duration: 0.6, delay: 0.6 } : { duration: 0 }}
          >
            <motion.h2 
              className="text-xl font-semibold text-gray-100 mb-3"
              initial={animationsEnabled ? { opacity: 0, x: -20 } : { opacity: 1, x: 0 }}
              animate={{ opacity: 1, x: 0 }}
              transition={animationsEnabled ? { delay: 0.8 } : { duration: 0 }}
            >
              Crime Descriptions (Click one)
            </motion.h2>
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
              initial={animationsEnabled ? { opacity: 0 } : { opacity: 1 }}
              animate={{ opacity: 1 }}
              transition={animationsEnabled ? { delay: 1.0, duration: 0.8 } : { duration: 0 }}
            >
              {shuffledCrimeDescriptions.map((description, index) => (
                <motion.div 
                  key={description.id}
                  initial={animationsEnabled ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={animationsEnabled ? { delay: 1.2 + (index * 0.1), duration: 0.5 } : { duration: 0 }}
                >
                  <SelectableDescription description={description} />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Crime Selection Modal */}
        {shouldUseModalUX && selectedMugshotId && getInmateDataById(selectedMugshotId) && (
          <CrimeSelectionModal
            isOpen={isCrimeModalOpen}
            onClose={() => setIsCrimeModalOpen(false)}
            selectedMugshot={getInmateDataById(selectedMugshotId)!} 
            availableCrimes={shuffledCrimeDescriptions.filter(
              (desc) => !matches[desc.id.toString()]
            )}
            onCrimeSelect={(descriptionId) => {
              setSelectedDescriptionId(descriptionId);
              setIsCrimeModalOpen(false);
            }}
          />
        )}

        {/* Enhanced Results section */}
        {results?.submitted && (
          <div className="mt-8 p-8 bg-gray-800/50 rounded-2xl border border-gray-700 shadow-sm">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <div className={cn(
                  "p-4 rounded-full shadow-lg",
                  results.percentage >= 80 ? "bg-green-500" : results.percentage >= 60 ? "bg-yellow-500" : "bg-red-500"
                )}>
                  {results.percentage >= 80 ? (
                    <Trophy className="h-8 w-8 text-white" />
                  ) : results.percentage >= 60 ? (
                    <Star className="h-8 w-8 text-white" />
                  ) : (
                    <Target className="h-8 w-8 text-white" />
                  )}
                </div>
              </div>
              <h2 className="text-2xl font-bold text-center mb-2 text-gray-100">Game Results</h2>
              <p className={cn(
                "text-lg font-medium",
                results.percentage >= 80 ? "text-green-400" : results.percentage >= 60 ? "text-yellow-400" : "text-red-400"
              )}>
                {results.percentage >= 80 ? "Excellent Work!" : results.percentage >= 60 ? "Good Job!" : "Keep Practicing!"}
              </p>
            </div>

            {/* Results Ad Banner */}
            <div className="mb-6 flex justify-center">
              <AdBanner
                data-ad-slot={process.env.NEXT_PUBLIC_AD_SLOT_RESULTS || "1234567892"}
                variant={isMobile ? "mobile" : "banner"}
                data-ad-format="auto"
                className="w-full max-w-[728px]"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                <div className="flex items-center justify-center mb-2">
                  <Target className="h-5 w-5 text-blue-400 mr-2" />
                  <span className="text-sm text-gray-300">Score</span>
                </div>
                <p className="text-3xl font-bold text-gray-100">
                  {results.score}/{results.total}
                </p>
              </div>
              
              <div className="text-center p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                <div className="flex items-center justify-center mb-2">
                  <Star className="h-5 w-5 text-purple-400 mr-2" />
                  <span className="text-sm text-gray-300">Accuracy</span>
                </div>
                <p className={cn(
                  "text-3xl font-bold",
                  results.percentage >= 80 ? "text-green-400" : results.percentage >= 60 ? "text-yellow-400" : "text-red-400"
                )}>
                  {results.percentage}%
                </p>
              </div>

              {results.pointsEarned && results.pointsEarned > 0 && (
                <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-center mb-2">
                    <Star className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-sm text-gray-600">Points Earned</span>
                  </div>
                  <p className="text-3xl font-bold text-blue-600">+{results.pointsEarned}</p>
                </div>
              )}
            </div>
            
            <div className="text-center space-y-2">
              <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                <p className="text-gray-300 mb-1">Total Score</p>
                <p className="text-2xl font-bold text-blue-400">{formatPoints(currentPoints)}</p>
              </div>
              
              {currentPoints >= highScore && currentPoints > 0 && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <p className="text-amber-600 flex items-center justify-center font-semibold">
                    <Trophy className="h-5 w-5 mr-2" />
                    🎉 New High Score! 🎉
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Enhanced Action buttons */}
        <div className="mt-8 flex justify-center gap-4">
          {!results?.submitted ? (
            <Button
              onClick={handleSubmit}
              disabled={totalMatches < 6}
              className={cn(
                "px-12 py-6 bg-blue-600 hover:bg-blue-700 text-white border-none shadow-lg transition-all duration-200 text-lg font-semibold",
                totalMatches < 6 && "opacity-50 cursor-not-allowed",
                totalMatches >= 6 && "hover:scale-105 transform"
              )}
              size="lg"
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
            <div className="flex gap-4">
              <Button
                onClick={() => setIsInterRoundModalOpen(true)}
                className="px-12 py-6 bg-gray-600 hover:bg-gray-700 text-white shadow-lg transition-all duration-200 hover:scale-105 transform text-lg font-semibold"
                size="lg"
              >
                Play Again
                <RefreshCw className="ml-2 h-5 w-5" />
              </Button>
              
              {results.percentage >= 80 && (
                <Button
                  onClick={() => {
                    toast({
                      title: "🎉 Congratulations!",
                      description: "You achieved an excellent score! Share your success with friends.",
                    })
                  }}
                  className="px-8 py-6 bg-green-600 hover:bg-green-700 text-white shadow-lg transition-all duration-200 hover:scale-105 transform text-lg font-semibold"
                  size="lg"
                >
                  <Trophy className="mr-2 h-5 w-5" />
                  Share
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Inter-round Ad Modal */}
      <InterRoundAdModal
        isOpen={isInterRoundModalOpen}
        onClose={() => setIsInterRoundModalOpen(false)}
        onContinue={() => resetGame()}
        title="Ready for Another Challenge?"
        description="Test your detective skills with a new set of mugshots and crimes!"
      />
    </div>
  )
}
