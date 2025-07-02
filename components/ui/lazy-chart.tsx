"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"

// Lazy-load the heavy ChartContainer (which pulls in Recharts)
// This ensures the big Recharts bundle is requested only when a chart is actually needed.
const LazyChart = dynamic(() => import("./chart"), {
  // Disable SSR because Recharts needs the DOM
  ssr: false,
  // Optional loading fallback – you can style this as needed
  loading: () => <div className="w-full h-64 flex items-center justify-center text-sm text-muted-foreground">Loading chart…</div>,
})

// We export it as default so consumers can simply `import LazyChart from '@/components/ui/lazy-chart'`
export default function ChartLazyWrapper(props: React.ComponentProps<typeof LazyChart>) {
  return (
    <Suspense fallback={<div className="w-full h-64" />}> {/* Suspense for React 19 */}
      <LazyChart {...props} />
    </Suspense>
  )
}