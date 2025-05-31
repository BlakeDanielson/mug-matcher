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