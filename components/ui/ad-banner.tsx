"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

declare global {
  interface Window {
    adsbygoogle: unknown[]
  }
}

interface AdBannerProps {
  "data-ad-slot": string
  "data-ad-format"?: "auto" | "rectangle" | "vertical" | "horizontal" | "fluid"
  "data-full-width-responsive"?: "true" | "false"
  "data-ad-layout"?: string
  "data-ad-layout-key"?: string
  className?: string
  style?: React.CSSProperties
  variant?: "banner" | "sidebar" | "rectangle" | "mobile"
}

const AD_SIZES = {
  banner: { width: "728px", height: "90px" }, // Leaderboard
  sidebar: { width: "300px", height: "250px" }, // Medium Rectangle
  rectangle: { width: "336px", height: "280px" }, // Large Rectangle
  mobile: { width: "320px", height: "100px" }, // Mobile Banner
}

export function AdBanner({
  "data-ad-slot": adSlot,
  "data-ad-format": adFormat = "auto",
  "data-full-width-responsive": fullWidthResponsive = "true",
  "data-ad-layout": adLayout,
  "data-ad-layout-key": adLayoutKey,
  className,
  style,
  variant = "banner",
  ...props
}: AdBannerProps) {
  const adRef = useRef<HTMLModElement>(null)
  const isLoaded = useRef(false)

  useEffect(() => {
    const loadAd = () => {
      try {
        // Ensure we don't load the same ad multiple times
        if (isLoaded.current) return
        
        // Check if AdSense script is loaded and the DOM element exists
        if (typeof window !== "undefined" && window.adsbygoogle && adRef.current) {
          // Only push if the ad slot is empty
          const existingAd = adRef.current.querySelector('iframe')
          if (!existingAd) {
            ;(window.adsbygoogle = window.adsbygoogle || []).push({})
            isLoaded.current = true
          }
        }
      } catch (error) {
        console.error("Error loading AdSense ad:", error)
      }
    }

    // Load ad after a short delay to ensure DOM is ready
    const timer = setTimeout(loadAd, 100)
    
    return () => {
      clearTimeout(timer)
    }
  }, [])

  // Reset isLoaded when component unmounts or re-mounts
  useEffect(() => {
    return () => {
      isLoaded.current = false
    }
  }, [])

  if (!process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID) {
    // Development placeholder
    if (process.env.NODE_ENV === "development") {
      return (
        <div
          className={cn(
            "border-2 border-dashed border-gray-400 bg-gray-100 dark:bg-gray-800 dark:border-gray-600 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400 rounded",
            className
          )}
          style={{
            ...AD_SIZES[variant],
            ...style,
          }}
        >
          Ad Placeholder ({variant})
        </div>
      )
    }
    return null
  }

  const adStyles: React.CSSProperties = {
    display: "block",
    textAlign: "center",
    ...style,
  }

  if (adFormat !== "auto" && adFormat !== "fluid") {
    adStyles.width = AD_SIZES[variant]?.width || "auto"
    adStyles.height = AD_SIZES[variant]?.height || "auto"
  }

  return (
    <div className={cn("ad-container", className)}>
      {/* Optional Ad Label */}
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 text-center">
        Advertisement
      </div>
      
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={adStyles}
        data-ad-client={process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive}
        data-ad-layout={adLayout}
        data-ad-layout-key={adLayoutKey}
        data-adtest={process.env.NODE_ENV === "development" ? "on" : undefined}
        {...props}
      />
    </div>
  )
} 