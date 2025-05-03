/**
 * Animation utilities for points display
 */

/**
 * Create a floating animation
 * @param element Element to animate
 * @param direction Direction to float ('up', 'down', 'left', 'right')
 * @param distance Distance to float in pixels
 * @param duration Duration in milliseconds
 * @returns Animation object
 */
export function createFloatingAnimation(
  element: HTMLElement,
  direction: 'up' | 'down' | 'left' | 'right' = 'up',
  distance: number = 50,
  duration: number = 500
): Animation | null {
  if (typeof window === 'undefined' || !window.Animation) {
    return null;
  }

  // Define keyframes based on direction
  let keyframes: Keyframe[] = [];
  
  switch (direction) {
    case 'up':
      keyframes = [
        { transform: 'translateY(0)', opacity: 0 },
        { transform: `translateY(-${distance}px)`, opacity: 1, offset: 0.2 },
        { transform: `translateY(-${distance * 1.2}px)`, opacity: 0 }
      ];
      break;
    case 'down':
      keyframes = [
        { transform: 'translateY(0)', opacity: 0 },
        { transform: `translateY(${distance}px)`, opacity: 1, offset: 0.2 },
        { transform: `translateY(${distance * 1.2}px)`, opacity: 0 }
      ];
      break;
    case 'left':
      keyframes = [
        { transform: 'translateX(0)', opacity: 0 },
        { transform: `translateX(-${distance}px)`, opacity: 1, offset: 0.2 },
        { transform: `translateX(-${distance * 1.2}px)`, opacity: 0 }
      ];
      break;
    case 'right':
      keyframes = [
        { transform: 'translateX(0)', opacity: 0 },
        { transform: `translateX(${distance}px)`, opacity: 1, offset: 0.2 },
        { transform: `translateX(${distance * 1.2}px)`, opacity: 0 }
      ];
      break;
  }
  
  // Create animation
  const animation = element.animate(keyframes, {
    duration,
    easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)',
    fill: 'forwards'
  });
  
  return animation;
}

/**
 * Create a pulse animation
 * @param element Element to animate
 * @param scale Scale factor
 * @param duration Duration in milliseconds
 * @returns Animation object
 */
export function createPulseAnimation(
  element: HTMLElement,
  scale: number = 1.2,
  duration: number = 300
): Animation | null {
  if (typeof window === 'undefined' || !window.Animation) {
    return null;
  }
  
  // Define keyframes
  const keyframes: Keyframe[] = [
    { transform: 'scale(1)' },
    { transform: `scale(${scale})`, offset: 0.5 },
    { transform: 'scale(1)' }
  ];
  
  // Create animation
  const animation = element.animate(keyframes, {
    duration,
    easing: 'ease-in-out'
  });
  
  return animation;
}

/**
 * Create a shake animation
 * @param element Element to animate
 * @param intensity Shake intensity in pixels
 * @param duration Duration in milliseconds
 * @returns Animation object
 */
export function createShakeAnimation(
  element: HTMLElement,
  intensity: number = 5,
  duration: number = 500
): Animation | null {
  if (typeof window === 'undefined' || !window.Animation) {
    return null;
  }
  
  // Define keyframes
  const keyframes: Keyframe[] = [
    { transform: 'translateX(0)' },
    { transform: `translateX(-${intensity}px)` },
    { transform: `translateX(${intensity}px)` },
    { transform: `translateX(-${intensity * 0.8}px)` },
    { transform: `translateX(${intensity * 0.8}px)` },
    { transform: `translateX(-${intensity * 0.5}px)` },
    { transform: `translateX(${intensity * 0.5}px)` },
    { transform: 'translateX(0)' }
  ];
  
  // Create animation
  const animation = element.animate(keyframes, {
    duration,
    easing: 'ease-in-out'
  });
  
  return animation;
}

/**
 * Create a fade in animation
 * @param element Element to animate
 * @param duration Duration in milliseconds
 * @returns Animation object
 */
export function createFadeInAnimation(
  element: HTMLElement,
  duration: number = 300
): Animation | null {
  if (typeof window === 'undefined' || !window.Animation) {
    return null;
  }
  
  // Define keyframes
  const keyframes: Keyframe[] = [
    { opacity: 0 },
    { opacity: 1 }
  ];
  
  // Create animation
  const animation = element.animate(keyframes, {
    duration,
    easing: 'ease-in-out',
    fill: 'forwards'
  });
  
  return animation;
}

/**
 * Create a fade out animation
 * @param element Element to animate
 * @param duration Duration in milliseconds
 * @returns Animation object
 */
export function createFadeOutAnimation(
  element: HTMLElement,
  duration: number = 300
): Animation | null {
  if (typeof window === 'undefined' || !window.Animation) {
    return null;
  }
  
  // Define keyframes
  const keyframes: Keyframe[] = [
    { opacity: 1 },
    { opacity: 0 }
  ];
  
  // Create animation
  const animation = element.animate(keyframes, {
    duration,
    easing: 'ease-in-out',
    fill: 'forwards'
  });
  
  return animation;
}

/**
 * Create a number counter animation
 * @param element Element to animate
 * @param startValue Start value
 * @param endValue End value
 * @param duration Duration in milliseconds
 * @param formatter Function to format the number
 */
export function animateNumberCounter(
  element: HTMLElement,
  startValue: number,
  endValue: number,
  duration: number = 1000,
  formatter: (value: number) => string = (value) => value.toString()
): void {
  if (typeof window === 'undefined' || !window.requestAnimationFrame) {
    // Fallback for environments without animation support
    element.textContent = formatter(endValue);
    return;
  }
  
  const startTime = performance.now();
  const difference = endValue - startValue;
  
  // Animation function
  function updateValue(currentTime: number) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Use easeOutQuad for smoother animation
    const easeProgress = 1 - (1 - progress) * (1 - progress);
    
    const currentValue = startValue + difference * easeProgress;
    element.textContent = formatter(Math.round(currentValue));
    
    if (progress < 1) {
      requestAnimationFrame(updateValue);
    }
  }
  
  requestAnimationFrame(updateValue);
}