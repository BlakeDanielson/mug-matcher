"use client"

import { cn } from "@/lib/utils"
import { useState } from "react"

interface AceternityBuyMeCoffeeButtonProps {
  username: string
  text?: string
  className?: string
}

export function AceternityBuyMeCoffeeButton({ 
  username, 
  text = "Buy me a coffee", 
  className 
}: AceternityBuyMeCoffeeButtonProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className={cn("relative inline-block", className)}>
      <button
        onClick={() => window.open(`https://www.buymeacoffee.com/${username}`, '_blank')}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-950"
      >
        {/* Animated border with dark blue theme */}
        <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#1e40af_0%,#0f172a_50%,#3b82f6_100%)]" />
        
        {/* Button content with dark blue styling */}
        <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-6 py-1 text-sm font-medium text-slate-200 backdrop-blur-3xl transition-all duration-200 hover:bg-blue-950 hover:text-blue-200">
          <span className="mr-2 text-lg">☕</span>
          {text}
        </span>
      </button>
      
      {/* Glow effect with dark blue theme */}
      {isHovered && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 via-slate-600 to-blue-800 opacity-50 blur-xl animate-pulse" />
      )}
    </div>
  )
} 