import MugshotMatchingGame from "@/components/mugshot-matching-game"
import { GameLayoutWithAds } from "@/components/ui/game-layout-with-ads"
import { BuyMeCoffeeButton } from "@/components/ui/buy-me-coffee"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Zap } from "lucide-react"

export default function Home() {
  return (
    <GameLayoutWithAds className="bg-gradient-to-b from-neutral-900 to-background">
      <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
        {/* Design Selection Header */}
        <div className="w-full max-w-4xl mb-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-center mb-4 gradient-text">
            Mugshot Matching Game
          </h1>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
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
                className="border-purple-500/50 bg-purple-900/30 text-purple-300 hover:bg-purple-800/50"
              >
                <Link href="/aceternity-demo">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Try Aceternity UI Version
                </Link>
              </Button>
            </div>
          </div>
          
          <p className="text-gray-400 text-sm max-w-2xl mx-auto">
            Experience the same addictive gameplay with two different stunning UI designs. 
            Choose between our polished ShadCN implementation (below) or try the magical Aceternity UI version!
          </p>
        </div>

        <MugshotMatchingGame />
        
        {/* Buy Me A Coffee Section */}
        <div className="mt-12 text-center">
          <p className="text-gray-400 text-sm mb-4">
            Enjoying the game? Support the developer!
          </p>
          <BuyMeCoffeeButton 
            username="yourusername" 
            text="Buy me a coffee ☕"
            className="mx-auto"
          />
        </div>
      </main>
    </GameLayoutWithAds>
  )
}
