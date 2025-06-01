import MugshotMatchingGame from '@/components/mugshot-matching-game'
import { VersionSwitcher } from "@/components/aceternity"

export default function Home() {
  return (
    <>
      <VersionSwitcher />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-2 lg:p-3">
        <div className="w-full max-w-[min(90vw,1400px)] mx-auto">
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-3 lg:p-4 shadow-xl border border-gray-200 dark:border-gray-700">
            
            {/* Game Component */}
            <MugshotMatchingGame />
            
          </div>
        </div>
      </div>
    </>
  )
}
