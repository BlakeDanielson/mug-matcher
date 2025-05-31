import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, XCircle, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTouchTarget, useHapticFeedback } from "@/hooks/use-mobile-interactions"
import { Inmate, GameResults } from "./types"

interface MugshotCardProps {
  mugshot: Inmate
  index: number
  isSelected: boolean
  isMatched: boolean
  onClick: () => void
  results: GameResults | null
  matches: Record<string, string | null>
  getInmateDataById: (id: string | number) => Inmate | undefined
  hasInitiallyLoaded?: boolean
}

export function CleanMugshotCard({ 
  mugshot, 
  index, 
  isSelected,
  isMatched,
  onClick,
  results,
  matches,
  getInmateDataById
}: MugshotCardProps) {
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
        (isSelected || isMatched) && "border-blue-500 ring-2 ring-blue-200 shadow-lg",
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
        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-center py-3 px-4">
          <div className="text-sm font-medium truncate">{mugshot.name}</div>
        </div>

        {/* Status indicators - use blue for both selected and matched */}
        <AnimatePresence>
          {(isSelected || isMatched) && (
            <motion.div 
              className="absolute top-2 right-2 bg-blue-500 rounded-full p-1.5 shadow-lg"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Star className="h-3 w-3 text-white" />
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

export function EnhancedMugshotCard({ 
  mugshot, 
  index, 
  hasInitiallyLoaded = true 
}: { 
  mugshot: Inmate
  index: number
  hasInitiallyLoaded?: boolean
}) {
  const { triggerHaptic } = useHapticFeedback()
  const { touchTargetProps } = useTouchTarget()
  const [isFlashing, setIsFlashing] = useState(false)

  const handleMugshotClick = () => {
    triggerHaptic('light')
    setIsFlashing(true)
    setTimeout(() => setIsFlashing(false), 600)
  }

  return (
    <motion.div
      initial={!hasInitiallyLoaded ? { opacity: 0, y: 20 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={!hasInitiallyLoaded ? { delay: index * 0.1, duration: 0.5 } : { duration: 0 }}
      className={cn(
        "cursor-pointer group relative",
        touchTargetProps.className
      )}
      onClick={handleMugshotClick}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      style={touchTargetProps.style}
    >
      <motion.div
        className="relative rounded-xl overflow-hidden border-2 aspect-square shadow-lg bg-gray-800/50 transition-all duration-300 border-gray-600"
        animate={{
          scale: isFlashing ? [1, 1.05, 1] : 1,
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
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
      </motion.div>
    </motion.div>
  )
} 