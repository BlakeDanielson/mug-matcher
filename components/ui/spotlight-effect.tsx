"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

interface SpotlightEffectProps {
  children: React.ReactNode
  intensity?: number
  color?: string
  size?: number
}

export function SpotlightEffect({ 
  children, 
  intensity = 0.8, 
  color = "rgba(0, 255, 255, 0.3)",
  size = 300 
}: SpotlightEffectProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const spotlightRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const spotlight = spotlightRef.current
    if (!container || !spotlight) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      spotlight.style.left = `${x - size / 2}px`
      spotlight.style.top = `${y - size / 2}px`
      spotlight.style.opacity = intensity.toString()
    }

    const handleMouseEnter = () => {
      spotlight.style.opacity = intensity.toString()
    }

    const handleMouseLeave = () => {
      spotlight.style.opacity = '0'
    }

    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('mouseenter', handleMouseEnter)
    container.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('mouseenter', handleMouseEnter)
      container.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [intensity, size])

  return (
    <div ref={containerRef} className="relative">
      {/* Spotlight */}
      <motion.div
        ref={spotlightRef}
        className="absolute pointer-events-none z-10 rounded-full transition-opacity duration-200"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
          opacity: 0,
          filter: 'blur(1px)',
          mixBlendMode: 'multiply'
        }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      />

      {/* Content */}
      {children}
    </div>
  )
} 