'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Ripple {
  id: number
  x: number
  y: number
}

/** Spotlight glow following the cursor + expanding ripple rings on click. */
export default function CursorEffects() {
  const spotlightRef = useRef<HTMLDivElement>(null)
  const [ripples, setRipples] = useState<Ripple[]>([])
  const nextId = useRef(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const handleMouseMove = (e: MouseEvent) => {
      if (spotlightRef.current) {
        spotlightRef.current.style.background = `radial-gradient(600px circle at ${e.clientX}px ${e.clientY}px, rgba(245, 158, 11, 0.06), transparent 40%)`
      }
    }
    const handleClick = (e: MouseEvent) => {
      const id = nextId.current++
      setRipples((prev) => [...prev, { id, x: e.clientX, y: e.clientY }])
      setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 700)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('click', handleClick)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('click', handleClick)
    }
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <div ref={spotlightRef} className="absolute inset-0" />
      <AnimatePresence>
        {ripples.map((r) => (
          <motion.span
            key={r.id}
            className="absolute w-6 h-6 rounded-full border border-amber-500/60"
            style={{ left: r.x, top: r.y, translateX: '-50%', translateY: '-50%' }}
            initial={{ scale: 0.3, opacity: 0.7 }}
            animate={{ scale: 6, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
