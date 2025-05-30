"use client"

import { Button } from "@/components/ui/button"
import { X, Play, RefreshCw } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

interface InterRoundModalProps {
  isOpen: boolean
  onClose: () => void
  onContinue: () => void
  title?: string
  description?: string
}

export function InterRoundModal({
  isOpen,
  onClose,
  onContinue,
  title = "Ready for Another Round?",
  description = "Get ready for your next challenge!"
}: InterRoundModalProps) {
  const handleContinue = () => {
    onContinue()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-gray-900/95 border-gray-700">
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
        </div>
      </DialogContent>
    </Dialog>
  )
} 