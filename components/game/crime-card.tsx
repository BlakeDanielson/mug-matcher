'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Star } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Inmate, GameResults } from './types';
import { useTouchTarget } from '@/hooks/use-mobile-interactions';
import { getSeverityCardStyling } from '@/lib/crime-severity-utils';

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
  const severityStyling = getSeverityCardStyling(crime.crimeSeverity, isSelected, isMatched)
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...touchTargetProps}
    >
      <div className={cn(
        "p-4 rounded-xl border-2 transition-all duration-200 min-h-[120px] relative",
        (isSelected || isMatched) 
          ? "border-blue-500 ring-2 ring-blue-200 shadow-lg bg-white dark:bg-gray-800 hover:shadow-xl"
          : cn(
              severityStyling.cardClassName,
              "hover:shadow-md"
            )
      )}>
        
        {/* Crime Severity Dot Indicator */}
        {!isSelected && !isMatched && (
          <div 
            className={severityStyling.severityDot.className}
            title={severityStyling.severityDot.title}
          />
        )}
        
        {/* Crime description */}
        <div className="mb-3">
          <p className="text-gray-900 dark:text-white font-medium leading-relaxed pr-6">
            {crime.crime}
          </p>
          {/* Subtle severity text */}
          {!isSelected && !isMatched && (
            <p className={cn("mt-1", severityStyling.severityText.className)}>
              {severityStyling.severityText.text} Severity
            </p>
          )}
        </div>

        {/* Status section */}
        <div className="flex items-center justify-between">
          {matchedMugshot ? (
            <div className="flex items-center gap-2">
              <Image
                src={matchedMugshot.image}
                alt={matchedMugshot.name}
                width={24}
                height={24}
                className="w-6 h-6 rounded-full object-cover border border-blue-500"
              />
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {matchedMugshot.name}
              </span>
            </div>
          ) : (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Select a mugshot
            </span>
          )}
        </div>

        {/* Selection indicator */}
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
              className={cn(
                "absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1",
                results.correctMatches.includes(crime.id) 
                  ? "bg-green-500 text-white" 
                  : "bg-red-500 text-white"
              )}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
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
      </div>
    </motion.div>
  )
} 