import MugshotMatchingGame from "@/components/mugshot-matching-game"
import { GameLayoutWithAds } from "@/components/ui/game-layout-with-ads"

export default function Home() {
  return (
    <GameLayoutWithAds className="bg-gradient-to-b from-neutral-900 to-background">
      <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
        <h1 className="text-3xl md:text-5xl font-bold text-center mb-2 gradient-text">
          Mugshot Matching Game
        </h1>
        <MugshotMatchingGame />
      </main>
    </GameLayoutWithAds>
  )
}
