"use client"

import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface AceternityGameLayoutProps {
  children: ReactNode
  className?: string
}

export function AceternityGameLayout({ children, className }: AceternityGameLayoutProps) {
  return (
    <div className={cn("relative min-h-screen", className)}>
      {/* Sophisticated dark blue background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(30,58,138,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(30,58,138,0.1)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>
      
      {/* Elegant floating orbs with dark blue theme */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-slate-600 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-blue-800 rounded-full mix-blend-multiply filter blur-xl opacity-12 animate-pulse" style={{ animationDelay: '4s' }} />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
} 