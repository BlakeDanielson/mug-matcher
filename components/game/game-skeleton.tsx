export function GameSkeleton() {
  return (
    <div className="w-full">
      {/* Title Skeleton */}
      <div className="text-center mb-12">
        <div className="h-12 w-96 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-4 animate-pulse" />
        <div className="h-6 w-80 bg-gray-200 dark:bg-gray-700 rounded mx-auto animate-pulse" />
      </div>

      {/* Header Skeleton */}
      <div className="flex justify-between items-center mb-8">
        <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>

      {/* Progress Skeleton */}
      <div className="mb-8">
        <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>

      {/* Game Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-8">
        <div className="space-y-6">
          <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="grid grid-cols-2 gap-4">
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

      {/* Controls Skeleton */}
      <div className="flex gap-4 justify-center mb-6">
        <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
    </div>
  )
} 