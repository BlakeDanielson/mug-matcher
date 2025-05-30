"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface GameLayoutProps {
  children: ReactNode
  className?: string
}

export function GameLayout({
  children,
  className,
}: GameLayoutProps) {
  return (
    <div className={cn("min-h-screen flex flex-col items-center justify-center p-4 md:p-8", className)}>
      <div className="w-full flex justify-center">
        <div className="flex-1 flex justify-center max-w-8xl">
          {children}
        </div>
      </div>
    </div>
  )
} 