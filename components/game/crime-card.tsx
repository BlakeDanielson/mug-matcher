import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, XCircle, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTouchTarget } from "@/hooks/use-mobile-interactions"
import { Inmate, GameResults } from "./types"

interface CrimeCardProps {
  crime: Inmate
  index: number
  isSelected: boolean
  isMatched: boolean
  matchedMugshot: Inmate | null
  onClick: () => void
  results: GameResults | null
}

export function CleanCrimeCard({ 
  crime, 
  index,
  isSelected,
  isMatched,
  matchedMugshot,
  onClick,
  results
}: CrimeCardProps) {
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
        "p-6 rounded-lg border-2 transition-all duration-200 cursor-pointer hover:shadow-md min-h-[120px] flex flex-col justify-between",
        isSelected && "border-blue-500 bg-blue-50 dark:bg-blue-900/20",
        isMatched && !isSelected && "border-blue-500 bg-blue-50 dark:bg-blue-900/20",
        !isSelected && !isMatched && "border-gray-200 dark:border-gray-700 hover:border-gray-300 bg-white dark:bg-gray-800",
        touchTargetProps.className
      )}
      style={touchTargetProps.style}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-base font-medium text-gray-900 dark:text-white leading-relaxed mb-3">
            {processedCrime || "Unknown crime"}
          </p>
          
          {matchedMugshot && (
            <div className="flex items-center gap-3 mt-4">
              <Image
                src={matchedMugshot.image}
                alt={matchedMugshot.name}
                width={32}
                height={32}
                className="h-8 w-8 rounded-full object-cover border-2 border-blue-200"
              />
              <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                {matchedMugshot.name}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {isSelected && (
            <div className="bg-blue-500 rounded-full p-1.5">
              <Star className="h-4 w-4 text-white" />
            </div>
          )}
          
          {isMatched && !isSelected && (
            <div className="bg-blue-500 rounded-full p-1.5">
              <Star className="h-4 w-4 text-white" />
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
              "mt-4 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2",
              results.correctMatches.includes(crime.id)
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            )}
          >
            {results.correctMatches.includes(crime.id) ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Correct!
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4" />
                Incorrect
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function EnhancedCrimeCard({ 
  description,
  isSelectedForDesktopUX,
  matchedMugshotData,
  shouldUseModalUX,
  results,
  onCrimeClick
}: {
  description: Inmate
  isSelectedForDesktopUX: boolean
  matchedMugshotData: Inmate | null
  shouldUseModalUX: boolean
  results: GameResults | null
  onCrimeClick: () => void
}) {
  const { touchTargetProps } = useTouchTarget()
  
  // Process crime text to only show the first crime if multiple exist
  const processedCrime = description.crime?.includes(' | ') 
    ? description.crime.split(' | ')[0].trim()
    : description.crime

  return (
    <motion.div
      whileHover={!shouldUseModalUX ? { scale: 1.02, y: -2 } : {}}
      whileTap={!shouldUseModalUX ? { scale: 0.98 } : {}}
      data-crime-id={description.id.toString()}
      className={cn(
        "p-4 rounded-lg border-2 transition-all duration-300 shadow-md hover:shadow-lg relative overflow-hidden",
        "bg-gray-800/60 backdrop-blur-sm",
        !shouldUseModalUX && "cursor-pointer transform",
        "min-h-[140px]",
        // Selection takes priority over matching for visual clarity - use blue for selection
        isSelectedForDesktopUX 
          ? "border-blue-500 ring-4 ring-blue-500/30 bg-blue-950/40"
          : results?.submitted && results.correctMatches.includes(description.id)
            ? "border-green-500 bg-green-950/40 ring-2 ring-green-500/30"
            : results?.submitted
              ? "border-red-500 bg-red-950/40 ring-2 ring-red-500/30"
              : matchedMugshotData && !isSelectedForDesktopUX
                ? "border-blue-500 bg-blue-950/40 ring-2 ring-blue-500/30"
                : "border-gray-600 bg-gray-800/60 hover:border-gray-400",
        touchTargetProps.className
      )}
      style={touchTargetProps.style}
      onClick={onCrimeClick}
    >
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20 pointer-events-none" />
      
      {/* Main content */}
      <div className="relative z-10">
        {/* Compact header with matched mugshot or empty space */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {matchedMugshotData && (
              <div className="relative w-8 h-8 flex-shrink-0">
                <Image 
                  src={matchedMugshotData.image} 
                  alt={matchedMugshotData.name} 
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full object-cover border-2 border-blue-500 shadow-md"
                />
                <motion.div 
                  className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-0.5 shadow-md"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <CheckCircle2 className="h-3 w-3 text-white" />
                </motion.div>
              </div>
            )}
          </div>

          {/* Status indicator */}
          {results?.submitted && (
            <motion.div 
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="flex-shrink-0"
            >
              {results.correctMatches.includes(description.id) ? (
                <div className="bg-green-500 rounded-full p-2 shadow-lg ring-4 ring-green-500/30">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
              ) : (
                <div className="bg-red-500 rounded-full p-2 shadow-lg ring-4 ring-red-500/30">
                  <XCircle className="h-5 w-5 text-white" />
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Compact crime description */}
        <div className="mb-2">
          <p className={cn(
            "text-sm font-medium leading-snug",
            matchedMugshotData ? "text-blue-200" : "text-gray-100"
          )}>
            {processedCrime || "Unknown crime"}
          </p>
        </div>

        {/* Compact status section - prioritize selection over matching */}
        <div className="flex items-center justify-between">
          {isSelectedForDesktopUX ? (
            <div className="flex items-center gap-1.5">
              <motion.div 
                className="w-2 h-2 bg-blue-400 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />
              <span className="text-xs text-blue-300 font-medium">SELECTED</span>
              {matchedMugshotData && (
                <span className="text-xs text-blue-200 ml-1">({matchedMugshotData.name})</span>
              )}
            </div>
          ) : matchedMugshotData ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-blue-200 truncate">{matchedMugshotData.name}</span>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-blue-400 font-medium">MATCHED</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              <span className="text-xs text-gray-400 font-medium">TAP TO SELECT</span>
            </div>
          )}
        </div>
      </div>

      {/* Selection indicator with animation */}
      <AnimatePresence>
        {isSelectedForDesktopUX && !results?.submitted && (
          <motion.div 
            className="absolute top-3 right-3"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.div 
              className="bg-blue-500 rounded-full p-2 shadow-lg ring-4 ring-blue-500/40"
              animate={{ 
                boxShadow: [
                  "0 0 0 0 rgba(59, 130, 246, 0.7)",
                  "0 0 0 15px rgba(59, 130, 246, 0)",
                  "0 0 0 0 rgba(59, 130, 246, 0)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Star className="h-4 w-4 text-white" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Matching pulse effect - only show when matched but not selected */}
      <AnimatePresence>
        {matchedMugshotData && !isSelectedForDesktopUX && !results?.submitted && (
          <motion.div 
            className="absolute inset-0 border-2 border-blue-400 rounded-xl"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 0.5, 0],
              scale: [1, 1.02, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
} 