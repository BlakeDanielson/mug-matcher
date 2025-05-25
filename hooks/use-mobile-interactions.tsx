"use client"

import { useCallback, useRef, useState } from 'react'

// Haptic feedback types
export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error'

// Swipe direction types
export type SwipeDirection = 'left' | 'right' | 'up' | 'down'

interface SwipeHandlers {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
}

interface TouchPoint {
  x: number
  y: number
  time: number
}

// Hook for haptic feedback
export function useHapticFeedback() {
  const triggerHaptic = useCallback((type: HapticType = 'light') => {
    // Check if device supports haptic feedback
    if (!navigator.vibrate) return

    // Different vibration patterns for different feedback types
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [50],
      success: [10, 30, 10],
      warning: [50, 50],
      error: [100, 50, 100]
    }

    navigator.vibrate(patterns[type])
  }, [])

  return { triggerHaptic }
}

// Hook for swipe gestures
export function useSwipeGesture(handlers: SwipeHandlers, minSwipeDistance = 50) {
  const startTouch = useRef<TouchPoint | null>(null)
  const [isSwiping, setIsSwiping] = useState(false)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    startTouch.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    }
    setIsSwiping(true)
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    // Prevent default to avoid scrolling during swipe
    if (isSwiping) {
      e.preventDefault()
    }
  }, [isSwiping])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!startTouch.current) {
      setIsSwiping(false)
      return
    }

    const touch = e.changedTouches[0]
    const endTouch = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    }

    const deltaX = endTouch.x - startTouch.current.x
    const deltaY = endTouch.y - startTouch.current.y
    const deltaTime = endTouch.time - startTouch.current.time

    // Reset state
    setIsSwiping(false)
    startTouch.current = null

    // Ignore very quick touches or slow swipes
    if (deltaTime < 50 || deltaTime > 500) return

    const absDeltaX = Math.abs(deltaX)
    const absDeltaY = Math.abs(deltaY)

    // Determine swipe direction
    if (absDeltaX > absDeltaY && absDeltaX > minSwipeDistance) {
      // Horizontal swipe
      if (deltaX > 0) {
        handlers.onSwipeRight?.()
      } else {
        handlers.onSwipeLeft?.()
      }
    } else if (absDeltaY > absDeltaX && absDeltaY > minSwipeDistance) {
      // Vertical swipe
      if (deltaY > 0) {
        handlers.onSwipeDown?.()
      } else {
        handlers.onSwipeUp?.()
      }
    }
  }, [handlers, minSwipeDistance])

  return {
    touchProps: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd
    },
    isSwiping
  }
}

// Hook for drag and drop on mobile
export function useMobileDragDrop<T>(
  item: T,
  onDrop: (item: T, targetElement: Element | null) => void
) {
  const [isDragging, setIsDragging] = useState(false)
  const dragElement = useRef<HTMLElement | null>(null)
  const currentTouch = useRef<TouchPoint | null>(null)

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLElement>) => {
    const touch = e.touches[0]
    currentTouch.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    }
    
    dragElement.current = e.currentTarget
    setIsDragging(true)
    
    // Add visual feedback
    if (dragElement.current) {
      dragElement.current.style.transform = 'scale(1.05)'
      dragElement.current.style.opacity = '0.8'
      dragElement.current.style.zIndex = '1000'
    }
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || !currentTouch.current || !dragElement.current) return

    e.preventDefault()
    
    const touch = e.touches[0]
    const deltaX = touch.clientX - currentTouch.current.x
    const deltaY = touch.clientY - currentTouch.current.y

    // Move the element
    dragElement.current.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1.05)`
  }, [isDragging])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!isDragging || !dragElement.current) return

    const touch = e.changedTouches[0]
    const targetElement = document.elementFromPoint(touch.clientX, touch.clientY)

    // Reset visual state
    dragElement.current.style.transform = ''
    dragElement.current.style.opacity = ''
    dragElement.current.style.zIndex = ''

    setIsDragging(false)
    currentTouch.current = null

    // Call drop handler
    onDrop(item, targetElement)
  }, [isDragging, item, onDrop])

  return {
    dragProps: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd
    },
    isDragging
  }
}

// Enhanced touch target hook for better accessibility
export function useTouchTarget() {
  return {
    touchTargetProps: {
      className: "min-h-[44px] min-w-[44px] touch-manipulation",
      style: {
        WebkitTapHighlightColor: 'transparent'
      }
    }
  }
} 