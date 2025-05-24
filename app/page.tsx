import MugshotMatchingGame from "@/components/mugshot-matching-game"
import { GameLayoutWithAds } from "@/components/ui/game-layout-with-ads"

export default function Home() {
  return (
    <GameLayoutWithAds className="bg-gradient-to-b from-neutral-900 to-background">
      <main className="w-full max-w-4xl flex flex-col items-center">
        <h1 className="text-3xl md:text-5xl font-bold text-center mb-10 gradient-text">
          Mugshot Matching Game
        </h1>
        <MugshotMatchingGame />
      </main>
    </GameLayoutWithAds>
  )
}
