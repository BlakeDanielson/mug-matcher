import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"

interface GameErrorProps {
  error: string
  onRetry: () => void
}

export function GameError({ error, onRetry }: GameErrorProps) {
  return (
    <div className="flex justify-center items-center min-h-screen p-8 lg:p-12">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl p-10 shadow-lg border border-gray-200 dark:border-gray-700 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-6" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Game Loading Error</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">{error}</p>
        <Button onClick={onRetry} className="w-full">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    </div>
  )
}

export function EnhancedGameError({ error, onRetry }: GameErrorProps) {
  return (
    <div className="w-full">
      <div className="p-8 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/50 border border-red-200 dark:border-red-800">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Game Loading Error</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">{error}</p>
          <Button 
            onClick={onRetry}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    </div>
  )
} 