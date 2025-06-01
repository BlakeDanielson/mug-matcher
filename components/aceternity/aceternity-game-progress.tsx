"use client"

import React from 'react'
import { motion } from 'framer-motion'

interface AceternityGameProgressProps {
  totalMatches: number
  maxMatches?: number
}

export function AceternityGameProgress({ 
  totalMatches,
  maxMatches = 6
}: AceternityGameProgressProps) {
  const progressValue = totalMatches > 0 ? (totalMatches / maxMatches) * 100 : 0
  
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-slate-300 mb-2">
        <span className="bg-gradient-to-r from-blue-300 to-slate-300 bg-clip-text text-transparent font-medium">
          Progress
        </span>
        <span className="text-slate-300 font-medium">
          {totalMatches}/{maxMatches}
        </span>
      </div>
      
      {/* Custom Aceternity Progress Bar with dark blue theme */}
      <div className="relative h-3 bg-slate-800/50 rounded-full overflow-hidden backdrop-blur-sm border border-slate-700/50">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-slate-600/20 to-blue-800/20 rounded-full" />
        
        {/* Progress fill */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressValue}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative h-full bg-gradient-to-r from-blue-500 via-slate-500 to-blue-700 rounded-full"
        >
          {/* Animated shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-200/30 to-transparent rounded-full animate-pulse" />
          
          {/* Moving highlight */}
          {progressValue > 0 && (
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "linear",
                repeatDelay: 1 
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-200/40 to-transparent rounded-full"
              style={{ width: "30%" }}
            />
          )}
        </motion.div>
        
        {/* Outer glow */}
        {progressValue > 0 && (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 via-slate-500/30 to-blue-700/30 rounded-full blur-sm" />
        )}
      </div>
    </div>
  )
} 