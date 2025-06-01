"use client"

import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface AceternityBadgeProps {
  children: ReactNode
  variant?: "default" | "selected" | "matched" | "error"
  className?: string
}

export function AceternityBadge({ 
  children, 
  variant = "default", 
  className 
}: AceternityBadgeProps) {
  const variants = {
    default: "bg-slate-800/50 text-slate-300 border-slate-600/50",
    selected: "bg-gradient-to-r from-blue-500/20 to-slate-500/20 text-blue-300 border-blue-400/50",
    matched: "bg-gradient-to-r from-green-500/20 to-blue-500/20 text-green-300 border-green-400/50",
    error: "bg-gradient-to-r from-red-500/20 to-slate-500/20 text-red-300 border-red-400/50"
  }

  return (
    <span className={cn(
      "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-sm transition-all duration-200",
      variants[variant],
      className
    )}>
      {children}
    </span>
  )
} 