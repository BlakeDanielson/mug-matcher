"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  size: number
  color: string
}

interface PrisonBackgroundProps {
  videoUrl?: string
  showParticles?: boolean
  showBars?: boolean
  intensity?: 'low' | 'medium' | 'high'
  children?: React.ReactNode
}

export function PrisonBackground({
  videoUrl,
  showParticles = true,
  showBars = true,
  intensity = 'medium',
  children
}: PrisonBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [particles, setParticles] = useState<Particle[]>([])
  const animationRef = useRef<number>(0)

  const particleCount = {
    low: 20,
    medium: 40,
    high: 60
  }[intensity]

  // Initialize particles (dust/ash effect)
  useEffect(() => {
    if (!showParticles) return

    const canvas = canvasRef.current
    if (!canvas) return

    const width = canvas.width || window.innerWidth
    const height = canvas.height || window.innerHeight

    const newParticles: Particle[] = []
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: Math.random() * 0.5 + 0.1, // Falling effect
        life: 1,
        size: Math.random() * 1.5 + 0.5,
        color: ['#8B7355', '#A0A0A0', '#696969', '#D2B48C'][Math.floor(Math.random() * 4)] // Dust/ash colors
      })
    }
    setParticles(newParticles)
  }, [showParticles, particleCount])

  // Animate particles
  useEffect(() => {
    if (!showParticles) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      setParticles(prevParticles => 
        prevParticles.map(particle => {
          // Update position
          particle.x += particle.vx
          particle.y += particle.vy
          
          // Wrap around edges
          if (particle.x < 0) particle.x = canvas.width
          if (particle.x > canvas.width) particle.x = 0
          if (particle.y > canvas.height) {
            particle.y = 0
            particle.x = Math.random() * canvas.width
          }
          
          // Draw particle with subtle glow
          ctx.save()
          ctx.globalAlpha = particle.life * 0.4
          ctx.shadowBlur = 3
          ctx.shadowColor = particle.color
          ctx.fillStyle = particle.color
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
          
          return particle
        })
      )
      
      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [showParticles, particles.length])

  // Handle canvas resize
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [])

  // Video autoplay
  useEffect(() => {
    if (videoRef.current && videoUrl) {
      videoRef.current.play().catch(console.error)
    }
  }, [videoUrl])

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Video Background */}
      {videoUrl && (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover opacity-20"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      )}

      {/* Prison Bars Pattern */}
      {showBars && (
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              repeating-linear-gradient(
                0deg,
                transparent,
                transparent 48px,
                rgba(139, 115, 85, 0.1) 48px,
                rgba(139, 115, 85, 0.1) 52px
              ),
              repeating-linear-gradient(
                90deg,
                transparent,
                transparent 8px,
                rgba(105, 105, 105, 0.15) 8px,
                rgba(105, 105, 105, 0.15) 12px
              )
            `
          }}
          animate={{
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      )}

      {/* Particle Canvas */}
      {showParticles && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
          style={{ mixBlendMode: 'multiply' }}
        />
      )}

      {/* Dark Overlay Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/60 via-transparent to-orange-900/30" />
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-gray-800/10 to-transparent" />

      {/* Searchlight Sweep Effect */}
      <motion.div
        className="absolute inset-0 opacity-5"
        style={{
          background: `conic-gradient(
            from 0deg,
            transparent 0deg,
            rgba(255, 255, 255, 0.3) 45deg,
            transparent 90deg,
            transparent 360deg
          )`
        }}
        animate={{
          rotate: [0, 360]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
} 