import MugshotMatchingGame from '@/components/mugshot-matching-game'
import { GameLayout } from "@/components/ui/game-layout"
import { BuyMeCoffeeButton } from "@/components/ui/buy-me-coffee"

export default function Home() {
  return (
    <GameLayout className="bg-gradient-to-b from-neutral-900 to-background">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 lg:p-8">
        <div className="w-full max-w-7xl mx-auto">
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 lg:p-8 shadow-xl border border-gray-200 dark:border-gray-700">
            
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-5xl font-bold text-center mb-6 gradient-text">
                Mugshot Matching Game
              </h1>
              
              <p className="text-gray-400 text-sm max-w-2xl mx-auto mb-6">
                Match the mugshots with their corresponding crimes in this engaging puzzle game!
              </p>
            </div>

            {/* Game Component */}
            <div className="mb-8">
              <MugshotMatchingGame />
            </div>
            
            {/* Buy Me A Coffee Section */}
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-4">
                Enjoying the game? Support the developer!
              </p>
              <BuyMeCoffeeButton 
                username={process.env.NEXT_PUBLIC_BUYMEACOFFEE_USERNAME || "blvke"} 
                text="Buy me a coffee ☕"
                className="mx-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </GameLayout>
  )
}
