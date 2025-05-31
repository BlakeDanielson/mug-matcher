'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Inmate } from './types';

interface MobileCrimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  crimes: string[];
  onCrimeSelect: (crime: string) => void;
  selectedCrime?: string;
  inmate?: Inmate;
}

export function MobileCrimeModal({
  isOpen,
  onClose,
  crimes,
  onCrimeSelect,
  selectedCrime,
  inmate
}: MobileCrimeModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 500 }}
            className="w-full bg-white dark:bg-gray-900 rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Select the Crime
              </h3>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {inmate && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Matching crime for:
                </p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {inmate.name}
                </p>
              </div>
            )}

            <div className="space-y-3">
              {crimes.map((crime, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => {
                    onCrimeSelect(crime);
                    onClose();
                  }}
                  className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                    selectedCrime === crime
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <p className="text-gray-900 dark:text-white font-medium">
                    {crime}
                  </p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface EnhancedMobileCrimeModalProps extends MobileCrimeModalProps {
  showHints?: boolean;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export function EnhancedMobileCrimeModal({
  isOpen,
  onClose,
  crimes,
  onCrimeSelect,
  selectedCrime,
  inmate,
  showHints = false,
  difficulty = 'medium'
}: EnhancedMobileCrimeModalProps) {
  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 dark:text-green-400';
      case 'hard': return 'text-red-600 dark:text-red-400';
      default: return 'text-yellow-600 dark:text-yellow-400';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-end"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%', scale: 0.95 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: '100%', scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 500 }}
            className="w-full bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Select the Crime
                </h3>
                <p className={`text-sm font-medium ${getDifficultyColor()}`}>
                  Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shadow-lg"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {inmate && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800"
              >
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-2 font-medium">
                  Matching crime for:
                </p>
                <p className="font-bold text-blue-900 dark:text-blue-100 text-lg">
                  {inmate.name}
                </p>
                {showHints && inmate.crime && (
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    Hint: {inmate.crime.split(' | ')[0]}
                  </p>
                )}
              </motion.div>
            )}

            <div className="space-y-3">
              {crimes.map((crime, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onCrimeSelect(crime);
                    onClose();
                  }}
                  className={`w-full p-4 text-left rounded-xl border-2 transition-all shadow-sm ${
                    selectedCrime === crime
                      ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 shadow-md'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
                  }`}
                >
                  <p className="text-gray-900 dark:text-white font-medium leading-relaxed">
                    {crime}
                  </p>
                  {selectedCrime === crime && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-2 text-xs text-blue-600 dark:text-blue-400 font-medium"
                    >
                      ✓ Selected
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>

            {showHints && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
              >
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  💡 Tip: Look for keywords that match the mugshot details
                </p>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 