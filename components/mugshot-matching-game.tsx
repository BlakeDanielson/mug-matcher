"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle2, XCircle, ArrowRightLeft, RefreshCw, AlertCircle, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose, // Added for a close button
} from "@/components/ui/dialog" // Assuming dialog is a Shadcn UI component
import {
  PointsManager,
  ScoreDisplay,
  createMatchResult,
  handleMatchComplete,
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
      <DialogContent className="sm:max-w-[425px] bg-gray-800 border-gray-700 text-gray-200">
        <DialogHeader>
          <DialogTitle className="text-gray-100">Match Crime for: {selectedMugshot.name}</DialogTitle>
          <DialogDescription className="text-gray-400">
            Select a crime description below to match with this mugshot.
          </DialogDescription>
        </DialogHeader>
        <div className="my-4 flex justify-center">
          <img 
            src={selectedMugshot.image} 
            alt={selectedMugshot.name} 
            className="h-32 w-32 rounded-lg object-cover border-2 border-blue-500"
          />
        </div>
        <div className="max-h-[40vh] overflow-y-auto space-y-2 pr-2"> {/* Added pr-2 for scrollbar spacing */}
          {availableCrimes.length > 0 ? (
            availableCrimes.map((crimeDesc) => (
              <Button
                key={crimeDesc.id}
                variant="outline"
                className="w-full justify-start text-left h-auto py-2 border-gray-600 hover:bg-gray-700 hover:text-gray-100 text-gray-300 crime-card"
                onClick={() => onCrimeSelect(crimeDesc.id.toString())}
              >
                {crimeDesc.crime || "Unknown Crime"}
              </Button>
            ))
          ) : (
            <p className="text-gray-400 text-center py-4">No available crimes to match.</p>
          )}
        </div>
        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button type="button" variant="secondary" className="border-gray-600 text-gray-200 hover:bg-gray-700">
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
  const [shuffledMugshotImages, setShuffledMugshotImages] = useState<Inmate[]>([]) // Renamed from shuffledCrimes
  const [shuffledCrimeDescriptions, setShuffledCrimeDescriptions] = useState<Inmate[]>([]) // Renamed from shuffledMugshots
  const [matches, setMatches] = useState<Record<string, string | null>>({}) // Maps crimeDescriptionId (string) to mugshotImageId (string)
  const [results, setResults] = useState<{
    score: number
    total: number
    percentage: number
    submitted: boolean
    correctMatches: number[]
    pointsEarned: number
  } | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  // Removed activeDragId state
  const [selectedMugshotId, setSelectedMugshotId] = useState<string | null>(null) // State for selected mugshot
  const [selectedDescriptionId, setSelectedDescriptionId] = useState<string | null>(null) // State for selected description
  const [isCrimeModalOpen, setIsCrimeModalOpen] = useState<boolean>(false); // State for crime selection modal

  // Points system state
  const [currentPoints, setCurrentPoints] = useState<number>(0)
  const [highScore, setHighScore] = useState<number>(0)
  const pointsManagerRef = useRef<PointsManager | null>(null)
  const scoreDisplayRef = useRef<ScoreDisplay | null>(null)
  
  // Game state tracking
  const [attemptCounts, setAttemptCounts] = useState<Record<string, number>>({}) // Use string keys
  const gameStartTimeRef = useRef<number>(Date.now())

  // Fetch inmate data from the API
  useEffect(() => {
    const fetchInmates = async () => {
      try {
        setLoading(true)
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
        // Use placeholder data if API fails
        const placeholderData = [
          { id: 1, name: "John Doe", image: "/placeholder.svg?key=cfqyy" },
          { id: 2, name: "Jane Smith", image: "/placeholder.svg?key=j2s7m" },
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
  }, [])

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

  // Removed handleDragEnd function

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
      <div className="w-full max-w-4xl">
        <Card className="p-6 shadow-lg bg-gray-800 border-gray-700 flex items-center justify-center">
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-gray-600 border-t-blue-400 rounded-full mx-auto mb-4"></div>
            <p className="text-lg text-gray-300">Loading mugshot data...</p>
          </div>
        </Card>
      </div>
    )
  }

  // If error, show an error state
  if (error) {
    return (
      <div className="w-full max-w-4xl">
        <Card className="p-6 shadow-lg bg-gray-800 border-gray-700">
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-400 mb-2">Error Loading Data</h2>
            <p className="text-gray-300 mb-6">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline" className="border-gray-600 text-gray-200 hover:bg-gray-700">
              Try Again
              <RefreshCw className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // Selectable Mugshot Component (Renamed from DraggableMugshot)
  function SelectableMugshot({ mugshot, index }: { mugshot: Inmate; index: number }) {
    // Removed useDraggable hook and related variables/styles

    // Check if this mugshot is already matched to a description
    const isMatched = Object.values(matches).includes(mugshot.id.toString());
    const isSelected = selectedMugshotId === mugshot.id.toString(); // Check if this mugshot is selected

    return (
      <div
        className="space-y-2 cursor-pointer" 
        onClick={() => {
          setSelectedMugshotId(mugshot.id.toString());
          if (shouldUseModalUX) {
            setIsCrimeModalOpen(true);
          }
        }} 
      >
        {/* Inmate image */}
        <div
          className={cn(
            "relative rounded-lg overflow-hidden border-2 aspect-square transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.02] transform card-hover-effect",
            // Highlight based on selection or match status
            isSelected
              ? "border-blue-500 ring-2 ring-blue-500/50" // Blue if currently selected
              : isMatched && !results?.submitted
                ? "border-green-500 ring-2 ring-green-500/50" // Green if matched and game not submitted
                : "border-gray-700 hover:border-gray-600", // Default gray
            // Removed isDragging style
            results?.submitted && !isMatched ? "opacity-50" : "" // Dim if submitted and not matched correctly
          )}
        >
          <img
            src={mugshot.image || "/placeholder.svg"}
            alt={`Mugshot ${index + 1}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded-md text-sm backdrop-blur-sm shadow-sm">
            {mugshot.name}
          </div>

          {results?.submitted && (
            <div
              className={cn(
                "absolute bottom-0 inset-x-0 p-2 text-white text-center",
                // Check if this image (mugshot.id) is correctly matched to its corresponding description
                Object.entries(matches).some(
                  ([descriptionId, matchedImageId]) =>
                    matchedImageId === mugshot.id.toString() && descriptionId === mugshot.id.toString(),
                )
                  ? "bg-green-500/90 backdrop-blur-sm" // Correct match for this image
                  : "bg-red-500/90 backdrop-blur-sm", // Incorrect or not matched to the right description
              )}
            >
              {/* Check if this image is correctly matched */}
              {Object.entries(matches).some(
                ([descriptionId, matchedImageId]) =>
                  matchedImageId === mugshot.id.toString() && descriptionId === mugshot.id.toString(),
              ) ? (
                <div className="flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Correct!
                </div>
              ) : (
                <div className="flex items-center justify-center text-xs">
                  <XCircle className="h-4 w-4 mr-1" />
                  {/* Show the correct crime for this mugshot */}
                  {getInmateDataById(mugshot.id)?.crime || "Unknown"}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Selectable Crime Description Component (Renamed from DroppableCrimeDescription)
  function SelectableDescription({ description }: { description: Inmate }) {
    const matchedMugshotId = matches[description.id.toString()];
    const matchedMugshotData = matchedMugshotId ? getInmateDataById(matchedMugshotId) : null;
    const isSelectedForDesktopUX = !shouldUseModalUX && selectedDescriptionId === description.id.toString();

    return (
      <div
        className={cn(
          "p-5 rounded-lg border transition-all shadow-md crime-card min-h-[150px] flex flex-col justify-between",
          !shouldUseModalUX && "cursor-pointer hover:border-gray-600 hover:shadow-lg", // Interactive for desktop/iPad
          isSelectedForDesktopUX // Apply blue border if selected in desktop/iPad UX
            ? "border-blue-500 ring-2 ring-blue-500/50"
            : results?.submitted && results.correctMatches.includes(description.id)
              ? "border-green-500 bg-green-900/20" // Correctly matched description
              : results?.submitted
                ? "border-red-500 bg-red-900/20" // Incorrectly matched description
                : "border-gray-700 bg-gradient-to-b from-gray-900/80 to-gray-800/50",
        )}
        onClick={() => {
          if (!shouldUseModalUX) {
            setSelectedDescriptionId(description.id.toString());
          }
        }}
      >
        <div className="flex-grow">
          {/* Display the crime description text */}
          <div className="text-lg font-medium text-gray-200 break-words whitespace-normal leading-relaxed mb-4">
            {description.crime || "Unknown crime"}
          </div>
        </div>

        {/* Area to show the matched mugshot or placeholder */}
        <div className="mt-auto pt-2 border-t border-gray-700/50 flex items-center justify-between min-h-[40px]">
          {matchedMugshotData ? (
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <img src={matchedMugshotData.image} alt={matchedMugshotData.name} className="h-8 w-8 rounded-full object-cover border border-gray-600"/>
              <span>{matchedMugshotData.name}</span>
            </div>
          ) : (
            <div className="text-sm text-gray-500 italic">
              {/* Updated placeholder text */}
              {isSelectedForDesktopUX ? "Selected" : matchedMugshotData ? "" : "Click to select"}
            </div>
          )}

          {/* Show check/cross based on the match for this description */}
          {results?.submitted && (
            matches[description.id.toString()] === description.id.toString() ? (
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            )
          )}
        </div>
      </div>
    );
  }


  return (
    // Removed DndContext wrapper
    <div className="w-full max-w-4xl fade-in game-container">
      <Card className="p-6 shadow-xl bg-gradient-to-b from-gray-800 to-gray-900 border-gray-700">
        {/* Points display */}
          <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-900/50 px-3 py-1 rounded-md border border-blue-700/50">
              <span className="text-sm text-gray-400">Points:</span>{" "}
              <span id="current-score" className="font-bold text-blue-400">{formatPoints(currentPoints)}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="bg-amber-900/50 px-3 py-1 rounded-md border border-amber-700/50 flex items-center">
              <Trophy className="h-4 w-4 text-amber-500 mr-1" />
              <span className="text-sm text-gray-400">High Score:</span>{" "}
              <span id="high-score" className="font-bold text-amber-400 ml-1">{formatPoints(highScore)}</span>
            </div>
          </div>
        </div>

        <div className="mb-6 text-center">
          <p className="text-lg text-gray-300">Match each criminal with their crime</p>
        </div>

        {/* Game board */}
        <div className="space-y-8">
          {/* Inmate images section at the top */}
          {/* Mugshots Section (Selectable Items) */}
          <div>
            <h2 className="text-xl font-semibold text-gray-200 mb-4">Mugshots (Click one)</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-5">
              {shuffledMugshotImages.map((mugshot, index) => (
                <SelectableMugshot key={mugshot.id} mugshot={mugshot} index={index} />
              ))}
              {/* Removed extra closing braces */}
            </div>
          </div>

          {/* Crime Descriptions Section (Selectable Areas) */}
          <div>
            <h2 className="text-xl font-semibold text-gray-200 mb-4">Crime Descriptions (Click one)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {shuffledCrimeDescriptions.map((description) => (
                <SelectableDescription key={description.id} description={description} />
              ))}
              {/* Removed extra closing braces */}
            </div>
          </div>
        </div>

        {/* Render CrimeSelectionModal */}
        {shouldUseModalUX && selectedMugshotId && getInmateDataById(selectedMugshotId) && (
          <CrimeSelectionModal
            isOpen={isCrimeModalOpen}
            onClose={() => setIsCrimeModalOpen(false)}
            selectedMugshot={getInmateDataById(selectedMugshotId)!} 
            availableCrimes={shuffledCrimeDescriptions.filter(
              // A crime is available if no mugshot is currently matched to its description ID
              (desc) => !matches[desc.id.toString()]
            )}
            onCrimeSelect={(descriptionId) => {
              setSelectedDescriptionId(descriptionId); // This will trigger the useEffect for matching
              setIsCrimeModalOpen(false);
            }}
          />
        )}

        {/* Results section */}
        {results?.submitted && (
          <div className="mt-8 p-6 bg-gradient-to-b from-gray-900/70 to-gray-800/50 rounded-lg border border-gray-700 shadow-lg">
            <h2 className="text-xl font-semibold text-center mb-2 text-gray-200">Results</h2>
            <div className="flex justify-center items-center gap-4 flex-wrap">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-100">
                  {results.score}/{results.total}
                </p>
                <p className="text-sm text-gray-400">Correct Matches</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-100">{results.percentage}%</p>
                <p className="text-sm text-gray-400">Accuracy</p>
              </div>
              {results.pointsEarned > 0 && (
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-400">+{results.pointsEarned}</p>
                  <p className="text-sm text-gray-400">Points Earned</p>
                </div>
              )}
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-gray-300">
                Total Score: <span className="font-bold text-blue-400">{formatPoints(currentPoints)}</span>
              </p>
              {currentPoints >= highScore && currentPoints > 0 && (
                <p className="text-amber-400 mt-1 flex items-center justify-center">
                  <Trophy className="h-4 w-4 mr-1" />
                  New High Score!
                </p>
              )}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-10 flex justify-center gap-4">
          {!results?.submitted ? (
            <Button
              onClick={handleSubmit}
              className="px-10 py-6 bg-blue-600 hover:bg-blue-700 text-white border-none shadow-lg hover:shadow-blue-500/20 transition-all duration-300 hover:scale-[1.02] transform submit-button glow-effect"
              size="lg"
            >
              Submit Answers
              <ArrowRightLeft className="ml-2 h-5 w-5" />
            </Button>
          ) : (
            <Button
              onClick={() => resetGame()}
              className="px-10 py-6 border-gray-600 text-gray-200 hover:bg-gray-700 shadow-lg hover:shadow-gray-500/10 transition-all duration-300 hover:scale-[1.02] transform submit-button"
              size="lg"
              variant="outline"
            >
              Play Again
              <RefreshCw className="ml-2 h-5 w-5" />
            </Button>
          )}
        </div>
      </Card>
    </div>
    // Removed closing DndContext tag
  )
}
