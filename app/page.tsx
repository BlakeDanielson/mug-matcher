import MugshotMatchingGame from "@/components/mugshot-matching-game"
import { GameLayout } from "@/components/ui/game-layout"
import { BuyMeCoffeeButton } from "@/components/ui/buy-me-coffee"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Zap } from "lucide-react"

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
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-blue-500/50 bg-blue-900/30 text-blue-300">
                    <Zap className="h-3 w-3 mr-1" />
                    Current: ShadCN UI
                  </Badge>
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    asChild 
                    variant="outline" 
                    size="sm"
                    className="border-purple-500/50 bg-purple-900/30 text-purple-300 hover:bg-purple-800/50"
                  >
                    <Link href="/aceternity-demo">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Try Aceternity UI Version
                    </Link>
                  </Button>
                </div>
              </div>
              
              <p className="text-gray-400 text-sm max-w-2xl mx-auto mb-6">
                Experience the same addictive gameplay with two different stunning UI designs. 
                Choose between our polished ShadCN implementation (below) or try the magical Aceternity UI version!
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
