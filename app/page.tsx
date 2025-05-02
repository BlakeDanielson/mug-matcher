import MugshotMatchingGame from "@/components/mugshot-matching-game"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-b from-slate-50 to-slate-100">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-slate-800">Mugshot Matching Game</h1>
      <MugshotMatchingGame />
    </main>
  )
}
