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