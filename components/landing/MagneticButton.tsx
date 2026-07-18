'use client'

import { useRef, type ReactNode, type MouseEvent as ReactMouseEvent } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

interface MagneticButtonProps {
  children: ReactNode
  onClick?: () => void
  className?: string
}

/** Button that gently pulls toward the cursor on hover, snapping back on leave. */
export default function MagneticButton({ children, onClick, className }: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 200, damping: 14 })
  const springY = useSpring(y, { stiffness: 200, damping: 14 })

  const handleMouseMove = (e: ReactMouseEvent<HTMLButtonElement>) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    x.set((e.clientX - (rect.left + rect.width / 2)) * 0.3)
    y.set((e.clientY - (rect.top + rect.height / 2)) * 0.3)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className={className}
    >
      {children}
    </motion.button>
  )
}
