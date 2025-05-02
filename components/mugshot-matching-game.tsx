"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle2, XCircle, ArrowRightLeft, RefreshCw, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

// Define the inmate data type
interface Inmate {
  id: number
  name: string
  image: string
  crime?: string
}

export default function MugshotMatchingGame() {
  const { toast } = useToast()
  const [inmates, setInmates] = useState<Inmate[]>([])
  const [shuffledMugshots, setShuffledMugshots] = useState<Inmate[]>([])
  const [shuffledCrimes, setShuffledCrimes] = useState<Inmate[]>([])
  const [matches, setMatches] = useState<Record<number, number | null>>({})
  const [results, setResults] = useState<{
    score: number
    total: number
    percentage: number
    submitted: boolean
    correctMatches: number[]
  } | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

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

  // Shuffle the mugshots and crimes
  const resetGame = (data = inmates) => {
    if (!data.length) return
    
    const shuffled1 = [...data].sort(() => Math.random() - 0.5)
    const shuffled2 = [...data].sort(() => Math.random() - 0.5)

    setShuffledMugshots(shuffled1)
    setShuffledCrimes(shuffled2)
    setMatches({})
    setResults(null)
  }

  // Handle match selection
  const handleMatchSelection = (mugshotId: number, selectedCrimeId: number | null) => {
    setMatches((prev) => ({
      ...prev,
      [mugshotId]: selectedCrimeId,
    }))
  }

  // Submit and evaluate matches
  const handleSubmit = () => {
    // Check if all mugshots have been matched with a crime
    const allMugshotsMatched = shuffledMugshots.every((mugshot) => Object.keys(matches).includes(mugshot.id.toString()))

    if (!allMugshotsMatched) {
      toast({
        title: "Incomplete Matches",
        description: "Please match all images before submitting.",
        variant: "destructive",
      })
      return
    }

    // Calculate score
    const correctMatches = Object.entries(matches)
      .filter(([mugshotId, matchedCrimeId]) => Number(matchedCrimeId) === Number(mugshotId))
      .map(([mugshotId]) => Number(mugshotId))

    const score = correctMatches.length
    const total = inmates.length
    const percentage = Math.round((score / total) * 100)

    setResults({
      score,
      total,
      percentage,
      submitted: true,
      correctMatches,
    })

    toast({
      title: `Your Score: ${score}/${total}`,
      description: `You got ${percentage}% correct!`,
      variant: score === total ? "default" : "destructive",
    })
  }

  // Find the mugshot crime by ID
  const getMugshotCrimeById = (id: number) => {
    return inmates.find((inmate) => inmate.id === id)?.crime || "Unknown crime"
  }

  // If loading, show a loading state
  if (loading) {
    return (
      <div className="w-full max-w-4xl">
        <Card className="p-6 shadow-lg flex items-center justify-center">
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-slate-300 border-t-slate-600 rounded-full mx-auto mb-4"></div>
            <p className="text-lg text-slate-700">Loading mugshot data...</p>
          </div>
        </Card>
      </div>
    )
  }

  // If error, show an error state
  if (error) {
    return (
      <div className="w-full max-w-4xl">
        <Card className="p-6 shadow-lg">
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Data</h2>
            <p className="text-slate-700 mb-6">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
              <RefreshCw className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl">
      <Card className="p-6 shadow-lg">
        <div className="mb-6 text-center">
          <p className="text-lg text-slate-700">Match each criminal with their crime</p>
        </div>

        {/* Game board */}
        <div className="space-y-8">
          {/* Inmate images section at the top */}
          <div>
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Mugshots</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4">
              {shuffledCrimes.map((mugshot, index) => (
                <div key={mugshot.id} className="space-y-2">
                  {/* Inmate image */}
                  <div
                    className={cn(
                      "relative rounded-lg overflow-hidden border-2 aspect-square",
                      Object.values(matches).includes(mugshot.id) && !results?.submitted
                        ? "border-slate-400"
                        : "border-transparent",
                    )}
                  >
                    <img
                      src={mugshot.image || "/placeholder.svg"}
                      alt={`Mugshot ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-slate-800 text-white px-2 py-1 rounded-md text-sm">
                      Mugshot {index + 1}
                    </div>

                    {results?.submitted && (
                      <div
                        className={cn(
                          "absolute bottom-0 inset-x-0 p-2 text-white text-center",
                          Object.entries(matches).some(
                            ([mugshotId, matchedCrimeId]) =>
                              Number(matchedCrimeId) === mugshot.id && Number(mugshotId) === mugshot.id,
                          )
                            ? "bg-green-500/80"
                            : "bg-red-500/80",
                        )}
                      >
                        {Object.entries(matches).some(
                          ([mugshotId, matchedCrimeId]) =>
                            Number(matchedCrimeId) === mugshot.id && Number(mugshotId) === mugshot.id,
                        ) ? (
                          <div className="flex items-center justify-center">
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Correct!
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <XCircle className="h-4 w-4 mr-1" />
                            {getMugshotCrimeById(mugshot.id)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Inmate crimes section below */}
          <div>
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Crime Descriptions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {shuffledMugshots.map((mugshot) => (
                <div
                  key={mugshot.id}
                  className={cn(
                    "p-4 rounded-lg border transition-all",
                    results?.submitted && results.correctMatches.includes(mugshot.id)
                      ? "border-green-500 bg-green-50"
                      : results?.submitted
                        ? "border-red-500 bg-red-50"
                        : "border-slate-200 hover:border-slate-300",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium">{mugshot.crime || "Unknown crime"}</span>
                    <div className="flex items-center gap-2">
                      <Select
                        value={matches[mugshot.id]?.toString() || ""}
                        onValueChange={(value) =>
                          handleMatchSelection(mugshot.id, value ? Number.parseInt(value) : null)
                        }
                        disabled={results?.submitted}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Select a mugshot" />
                        </SelectTrigger>
                        <SelectContent>
                          {shuffledCrimes.map((crime, index) => (
                            <SelectItem key={crime.id} value={crime.id.toString()}>
                              Mugshot {index + 1}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {results?.submitted &&
                        (matches[mugshot.id] === mugshot.id ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Results section */}
        {results?.submitted && (
          <div className="mt-8 p-4 bg-slate-100 rounded-lg">
            <h2 className="text-xl font-semibold text-center mb-2">Results</h2>
            <div className="flex justify-center items-center gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold">
                  {results.score}/{results.total}
                </p>
                <p className="text-sm text-slate-600">Correct Matches</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{results.percentage}%</p>
                <p className="text-sm text-slate-600">Accuracy</p>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-8 flex justify-center gap-4">
          {!results?.submitted ? (
            <Button onClick={handleSubmit} className="px-8" size="lg">
              Submit Answers
              <ArrowRightLeft className="ml-2 h-5 w-5" />
            </Button>
          ) : (
            <Button onClick={() => resetGame()} className="px-8" size="lg" variant="outline">
              Play Again
              <RefreshCw className="ml-2 h-5 w-5" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}