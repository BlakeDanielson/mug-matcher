"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function VersionSwitcher() {
  const pathname = usePathname()
  
  return (
    <div className="fixed top-4 right-4 z-50 flex gap-2">
      <Link
        href="/"
        className={cn(
          "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 backdrop-blur-sm",
          pathname === "/" 
            ? "bg-slate-200/20 text-slate-200 border border-slate-300/30" 
            : "bg-slate-900/20 text-slate-400 border border-slate-600/30 hover:bg-slate-200/10"
        )}
      >
        Original
      </Link>
      <Link
        href="/alt"
        className={cn(
          "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 backdrop-blur-sm",
          pathname === "/alt" 
            ? "bg-gradient-to-r from-blue-600 to-slate-600 text-slate-200 border border-blue-400/50" 
            : "bg-slate-900/20 text-slate-400 border border-slate-600/30 hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-slate-600/20"
        )}
      >
        Aceternity
      </Link>
    </div>
  )
} 