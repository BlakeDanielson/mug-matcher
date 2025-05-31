import AceternityMugshotMatchingGame from "@/components/aceternity-mugshot-game"
import { BuyMeCoffeeButton } from "@/components/ui/buy-me-coffee"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Zap } from "lucide-react"

export default function AceternityDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      
      {/* Compact Header */}
      <div className="w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-4 gradient-text">
            Mugshot Matching Game
          </h1>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-purple-500/50 bg-purple-900/30 text-purple-300">
                <Sparkles className="h-3 w-3 mr-1" />
                Current: Aceternity UI
              </Badge>
            </div>
            
            <div className="flex gap-3">
              <Button 
                asChild 
                variant="outline" 
                size="sm"
                className="border-blue-500/50 bg-blue-900/30 text-blue-300 hover:bg-blue-800/50"
              >
                <Link href="/">
                  <Zap className="h-4 w-4 mr-2" />
                  Try ShadCN UI Version
                </Link>
              </Button>
            </div>
          </div>
          
          <p className="text-gray-400 text-xs sm:text-sm max-w-2xl mx-auto">
            Experience our enhanced mugshot matching game with beautiful animations and effects. Can you match all the suspects to their crimes?
          </p>
        </div>
      </div>

      {/* Full-Width Game Component */}
      <div className="w-full">
        <AceternityMugshotMatchingGame />
      </div>
      
      {/* Footer */}
      <div className="w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="max-w-md mx-auto text-center">
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
  )
} 