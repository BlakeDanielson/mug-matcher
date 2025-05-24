"use client"

import { ReactNode } from "react"
import { AdBanner } from "./ad-banner"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

interface GameLayoutWithAdsProps {
  children: ReactNode
  showTopBanner?: boolean
  showSidebar?: boolean
  className?: string
}

export function GameLayoutWithAds({
  children,
  showTopBanner = true,
  showSidebar = true,
  className,
}: GameLayoutWithAdsProps) {
  const isMobile = useIsMobile()

  return (
    <div className={cn("min-h-screen flex flex-col items-center justify-center p-4 md:p-8", className)}>
      {/* Top Banner Ad - Desktop and Mobile */}
      {showTopBanner && (
        <div className="w-full max-w-4xl mb-4">
          <div className="flex justify-center">
            {isMobile ? (
              <AdBanner
                data-ad-slot={process.env.NEXT_PUBLIC_AD_SLOT_TOP_BANNER || "1234567890"}
                variant="mobile"
                data-ad-format="auto"
                className="w-full max-w-[320px]"
              />
            ) : (
              <AdBanner
                data-ad-slot={process.env.NEXT_PUBLIC_AD_SLOT_TOP_BANNER || "1234567890"}
                variant="banner"
                data-ad-format="auto"
                className="w-full max-w-[728px]"
              />
            )}
          </div>
        </div>
      )}

      {/* Main Content with Sidebar Layout */}
      <div className="w-full max-w-7xl flex gap-6 justify-center">
        {/* Left Sidebar Ad - Desktop Only */}
        {showSidebar && !isMobile && (
          <div className="hidden lg:flex flex-col gap-4 w-[300px] flex-shrink-0">
            <AdBanner
              data-ad-slot={process.env.NEXT_PUBLIC_AD_SLOT_SIDEBAR || "1234567891"}
              variant="sidebar"
              data-ad-format="auto"
              className="sticky top-4"
            />
            
            {/* Additional sidebar ad for more revenue */}
            <AdBanner
              data-ad-slot={process.env.NEXT_PUBLIC_AD_SLOT_SIDEBAR || "1234567891"}
              variant="rectangle"
              data-ad-format="auto"
              className="sticky top-[280px]"
            />
          </div>
        )}

        {/* Game Content */}
        <div className="flex-1 flex justify-center">
          {children}
        </div>

        {/* Right Sidebar Ad - Desktop Only */}
        {showSidebar && !isMobile && (
          <div className="hidden lg:flex flex-col gap-4 w-[300px] flex-shrink-0">
            <AdBanner
              data-ad-slot={process.env.NEXT_PUBLIC_AD_SLOT_SIDEBAR || "1234567891"}
              variant="sidebar"
              data-ad-format="auto"
              className="sticky top-4"
            />
          </div>
        )}
      </div>

      {/* Mobile Bottom Banner - Mobile Only */}
      {isMobile && (
        <div className="w-full max-w-sm mt-4">
          <AdBanner
            data-ad-slot={process.env.NEXT_PUBLIC_AD_SLOT_TOP_BANNER || "1234567890"}
            variant="mobile"
            data-ad-format="auto"
            className="w-full"
          />
        </div>
      )}
    </div>
  )
} 