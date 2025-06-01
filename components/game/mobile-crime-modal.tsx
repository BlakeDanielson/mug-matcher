'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Image from 'next/image';
import { Inmate } from './types';

interface MobileCrimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  crimes: Inmate[];
  onCrimeSelect: (crimeId: string) => void;
  selectedMugshot?: Inmate;
  matches: Record<string, string | null>;
  getInmateDataById: (id: string | number) => Inmate | undefined;
}

export function MobileCrimeModal({
  isOpen,
  onClose,
  crimes,
  onCrimeSelect,
  selectedMugshot,
  matches,
  getInmateDataById
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

            {selectedMugshot && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center gap-3">
                <Image
                  src={selectedMugshot.image}
                  alt={selectedMugshot.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full object-cover border-2 border-blue-500"
                />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Matching crime for:
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {selectedMugshot.name}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {crimes.map((crime, index) => {
                // Find if this crime is already matched to a mugshot
                const matchedMugshotId = Object.keys(matches).find(key => matches[key] === crime.id.toString())
                const matchedMugshot = matchedMugshotId ? getInmateDataById(matchedMugshotId) : null
                const isCurrentlyMatched = !!matchedMugshot
                
                return (
                  <motion.button
                    key={crime.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => {
                      onCrimeSelect(crime.id.toString());
                      onClose();
                    }}
                    className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                      isCurrentlyMatched
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="space-y-2">
                      <p className="text-gray-900 dark:text-white font-medium leading-relaxed">
                        {crime.crime}
                      </p>
                      
                      {isCurrentlyMatched && matchedMugshot && (
                        <div className="flex items-center gap-2 pt-2 border-t border-green-200 dark:border-green-800">
                          <Image
                            src={matchedMugshot.image}
                            alt={matchedMugshot.name}
                            width={20}
                            height={20}
                            className="w-5 h-5 rounded-full object-cover border border-green-500"
                          />
                          <span className="text-sm font-medium text-green-600 dark:text-green-400">
                            Currently matched to {matchedMugshot.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 