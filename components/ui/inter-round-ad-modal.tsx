"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AdBanner } from "./ad-banner"
import { useIsMobile } from "@/hooks/use-mobile"
import { X, Play, RefreshCw } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

interface InterRoundAdModalProps {
  isOpen: boolean
  onClose: () => void
  onContinue: () => void
  title?: string
  description?: string
}

export function InterRoundAdModal({
  isOpen,
  onClose,
  onContinue,
  title = "Ready for Another Round?",
  description = "Get ready for your next challenge!"
}: InterRoundAdModalProps) {
  const isMobile = useIsMobile()
  const [countdown, setCountdown] = useState(5)
  const [canSkip, setCanSkip] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setCountdown(5)
      setCanSkip(false)
      return
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanSkip(true)
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen])

  const handleContinue = () => {
    onContinue()
    onClose()
  }

  const handleSkip = () => {
    if (canSkip) {
      handleContinue()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-gray-900/95 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-gray-100 flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-blue-400" />
            {title}
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6">
          {/* Inter-round Ad */}
          <div className="flex justify-center mb-6">
            <AdBanner
              data-ad-slot={process.env.NEXT_PUBLIC_AD_SLOT_INTERROUND || "1234567893"}
              variant={isMobile ? "rectangle" : "banner"}
              data-ad-format="auto"
              className="w-full"
            />
          </div>

          {/* Skip Timer and Continue Button */}
          <div className="text-center space-y-4">
            {!canSkip ? (
              <div className="space-y-2">
                <p className="text-gray-400 text-sm">
                  Next round in {countdown} seconds...
                </p>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${((5 - countdown) / 5) * 100}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={handleContinue}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all duration-200 hover:scale-105 transform"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Start New Game
                </Button>
                
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="px-6 py-3 border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Early skip option for premium users (future feature) */}
        {countdown > 0 && (
          <div className="text-center">
            <button
              onClick={handleSkip}
              disabled={!canSkip}
              className="text-xs text-gray-500 hover:text-gray-400 transition-colors disabled:cursor-not-allowed"
            >
              {canSkip ? "Skip ad" : `Skip in ${countdown}s`}
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 