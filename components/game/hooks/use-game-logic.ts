import { useState, useEffect, useRef, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import { useHapticFeedback } from '@/hooks/use-mobile-interactions'
import { Inmate, GameResults } from '../types'

export function useGameLogic() {
  const { toast } = useToast()
  const { triggerHaptic } = useHapticFeedback()

  // Core game state
  const [inmates, setInmates] = useState<Inmate[]>([])
  const [shuffledMugshotImages, setShuffledMugshotImages] = useState<Inmate[]>([])
  const [shuffledCrimeDescriptions, setShuffledCrimeDescriptions] = useState<Inmate[]>([])
  const [selectedMugshotId, setSelectedMugshotId] = useState<string | null>(null)
  const [selectedDescriptionId, setSelectedDescriptionId] = useState<string | null>(null)
  const [matches, setMatches] = useState<Record<string, string | null>>({})
  const [results, setResults] = useState<GameResults | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false)
  const [attemptCounts, setAttemptCounts] = useState<Record<string, number>>({})
  
  // Mobile-specific state
  const [isMobileCrimeModalOpen, setIsMobileCrimeModalOpen] = useState(false)
  const [selectedMugshotForModal, setSelectedMugshotForModal] = useState<Inmate | null>(null)
  
  const gameStartTimeRef = useRef<number>(Date.now())

  // Shuffle the mugshots and crimes - removed inmates dependency to break circular dependency
  const shuffleGameData = useCallback((data: Inmate[]) => {
    if (!data.length) return
    
    setHasInitiallyLoaded(false)
    
    const shuffledImages = [...data].sort(() => Math.random() - 0.5)
    const shuffledDescriptions = [...data].sort(() => Math.random() - 0.5)

    setShuffledCrimeDescriptions(shuffledDescriptions)
    setShuffledMugshotImages(shuffledImages)
    setMatches({})
    setResults(null)
    setAttemptCounts({})
    gameStartTimeRef.current = Date.now()
  }, [])

  // Reset game function that uses current inmates state
  const resetGame = useCallback(() => {
    shuffleGameData(inmates)
    // Reset mobile state
    setIsMobileCrimeModalOpen(false)
    setSelectedMugshotForModal(null)
  }, [inmates, shuffleGameData])

  // Fetch inmate data from the API - removed resetGame dependency
  useEffect(() => {
    const fetchInmates = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/inmates')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        const inmatesArray = data.inmates || data
        
        if (!Array.isArray(inmatesArray) || inmatesArray.length === 0) {
          throw new Error('No inmate data received')
        }
        
        setInmates(inmatesArray)
        // Call shuffleGameData directly with the fetched data
        shuffleGameData(inmatesArray)
      } catch (err) {
        console.error('Error fetching inmates:', err)
        setError(err instanceof Error ? err.message : 'Failed to load game data')
      } finally {
        setLoading(false)
      }
    }

    fetchInmates()
  }, [shuffleGameData])

  // Mark as initially loaded after content is ready
  useEffect(() => {
    if (!loading && inmates.length > 0 && !hasInitiallyLoaded) {
      const timer = setTimeout(() => {
        setHasInitiallyLoaded(true)
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [loading, inmates.length, hasInitiallyLoaded])

  // Effect to handle matching when both a mugshot and description are selected
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

  // Find the mugshot data by ID
  const getInmateDataById = (id: string | number): Inmate | undefined => {
    const numericId = Number(id);
    return inmates.find((inmate) => inmate.id === numericId);
  }

  const handleMatch = (mugshotId: string, crimeId: string) => {
    const currentAttempts = attemptCounts[mugshotId] || 0
    setAttemptCounts(prev => ({
      ...prev,
      [mugshotId]: currentAttempts + 1
    }))

    setMatches(prev => ({ ...prev, [mugshotId]: crimeId }))
    setSelectedMugshotId(null)
    setSelectedDescriptionId(null)
    
    triggerHaptic('medium')
  }

  const handleCrimeClick = (crime: Inmate, isMobile: boolean) => {
    if (results || isMobile) return
    
    triggerHaptic('light')
    setSelectedDescriptionId(crime.id.toString())
    
    if (selectedMugshotId) {
      handleMatch(selectedMugshotId, crime.id.toString())
    }
  }

  // Mobile-specific handlers
  const handleMugshotClickMobile = (mugshot: Inmate) => {
    if (results) return
    
    triggerHaptic('light')
    setSelectedMugshotForModal(mugshot)
    setIsMobileCrimeModalOpen(true)
  }

  const handleMobileCrimeSelect = (crimeId: string) => {
    if (!selectedMugshotForModal) return
    
    // Remove any existing match for this crime
    setMatches(prev => {
      const newMatches = { ...prev }
      Object.keys(newMatches).forEach(key => {
        if (newMatches[key] === crimeId) {
          newMatches[key] = null;
        }
      });
      newMatches[selectedMugshotForModal.id.toString()] = crimeId
      return newMatches
    })

    // Update attempt counts
    setAttemptCounts(prev => ({
      ...prev,
      [selectedMugshotForModal.id.toString()]: (prev[selectedMugshotForModal.id.toString()] || 0) + 1
    }))

    triggerHaptic('medium')
    setSelectedMugshotForModal(null)
  }

  const closeMobileCrimeModal = () => {
    setIsMobileCrimeModalOpen(false)
    setSelectedMugshotForModal(null)
  }

  const retryFetch = () => {
    setError(null)
    setLoading(true)
    window.location.reload()
  }

  return {
    // State
    inmates,
    shuffledMugshotImages,
    shuffledCrimeDescriptions,
    selectedMugshotId,
    selectedDescriptionId,
    matches,
    results,
    loading,
    error,
    submitting,
    hasInitiallyLoaded,
    attemptCounts,
    gameStartTimeRef,
    
    // Mobile state
    isMobileCrimeModalOpen,
    selectedMugshotForModal,
    
    // Actions
    setSelectedMugshotId,
    setSelectedDescriptionId,
    setMatches,
    setResults,
    setSubmitting,
    setAttemptCounts,
    resetGame,
    getInmateDataById,
    handleMatch,
    handleCrimeClick,
    retryFetch,
    toast,
    triggerHaptic,
    
    // Mobile actions
    handleMugshotClickMobile,
    handleMobileCrimeSelect,
    closeMobileCrimeModal
  }
} 