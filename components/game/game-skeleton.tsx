import { Skeleton } from "@/components/ui/skeleton"

export function GameSkeleton() {
  return (
    <div className="flex justify-center items-center min-h-screen p-8 lg:p-12">
      <div className="w-full max-w-7xl bg-white dark:bg-gray-900 rounded-2xl p-10 lg:p-12 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-8">
          <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        
        <div className="h-12 w-80 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-12 animate-pulse" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="grid grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function EnhancedGameSkeleton() {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-8 w-24 bg-gray-200" />
        <Skeleton className="h-8 w-32 bg-gray-200" />
      </div>
      
      <div className="mb-6 text-center">
        <Skeleton className="h-6 w-64 mx-auto bg-gray-200" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 min-h-[600px]">
        {/* Left Column - Suspects Skeleton */}
        <div className="space-y-6">
          <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700">
            <Skeleton className="h-6 w-32 mb-2 bg-gray-200" />
            <Skeleton className="h-4 w-48 bg-gray-200" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3 lg:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square">
                <Skeleton className="w-full h-full rounded-lg bg-gray-200" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Crimes Skeleton */}
        <div className="space-y-6">
          <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700">
            <Skeleton className="h-6 w-32 mb-2 bg-gray-200" />
            <Skeleton className="h-4 w-56 bg-gray-200" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[120px] rounded-lg bg-gray-200" />
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-10 flex justify-center">
        <Skeleton className="h-12 w-40 bg-gray-200" />
      </div>
    </div>
  )
} 