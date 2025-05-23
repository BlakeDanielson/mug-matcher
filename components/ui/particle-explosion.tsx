"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

interface ExplosionParticle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  color: string
  gravity: number
}

interface ParticleExplosionProps {
  trigger: boolean
  onComplete?: () => void
  x?: number
  y?: number
  particleCount?: number
  colors?: string[]
  intensity?: 'low' | 'medium' | 'high'
}

export function ParticleExplosion({
  trigger,
  onComplete,
  x = 0,
  y = 0,
  particleCount = 20,
  colors = ['#00ffff', '#ff00ff', '#ffff00', '#00ff00', '#ff6b35'],
  intensity = 'medium'
}: ParticleExplosionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const particlesRef = useRef<ExplosionParticle[]>([])

  const intensitySettings = {
    low: { count: 15, speed: 3, life: 60 },
    medium: { count: 25, speed: 5, life: 80 },
    high: { count: 40, speed: 8, life: 120 }
  }

  const settings = intensitySettings[intensity]

  const createExplosion = (centerX: number, centerY: number) => {
    const particles: ExplosionParticle[] = []
    const count = particleCount || settings.count

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5
      const speed = (Math.random() * settings.speed + 2)
      const life = settings.life + Math.random() * 40

      particles.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: life,
        maxLife: life,
        size: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        gravity: 0.1
      })
    }

    return particles
  }

  const animate = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Update and draw particles
    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
      const particle = particlesRef.current[i]
      
      // Update position
      particle.x += particle.vx
      particle.y += particle.vy
      particle.vy += particle.gravity // Apply gravity
      particle.life--

      // Calculate alpha based on remaining life
      const alpha = particle.life / particle.maxLife

      if (particle.life <= 0) {
        particlesRef.current.splice(i, 1)
        continue
      }

      // Draw particle with glow effect
      ctx.save()
      ctx.globalAlpha = alpha
      ctx.shadowBlur = 15
      ctx.shadowColor = particle.color
      ctx.fillStyle = particle.color
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2)
      ctx.fill()
      
      // Draw inner bright core
      ctx.shadowBlur = 5
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size * alpha * 0.3, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }

    if (particlesRef.current.length > 0) {
      animationRef.current = requestAnimationFrame(animate)
    } else {
      onComplete?.()
    }
  }

  useEffect(() => {
    if (!trigger) return

    const canvas = canvasRef.current
    if (!canvas) return

    // Set canvas size
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height

    // Create explosion at specified position
    particlesRef.current = createExplosion(x, y)
    
    // Start animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [trigger, x, y])

  if (!trigger) return null

  return (
    <motion.canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-20"
      style={{ mixBlendMode: 'screen' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    />
  )
} 