import MugshotMatchingGame from "@/components/mugshot-matching-game"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-b from-gray-900 to-black">
      <h1 className="text-3xl md:text-5xl font-bold text-center mb-10 gradient-text animate-pulse">
        Mugshot Matching Game
      </h1>
      <MugshotMatchingGame />
    </main>
  )
}
