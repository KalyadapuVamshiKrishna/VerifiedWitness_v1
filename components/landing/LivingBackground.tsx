'use client'

import { useEffect, useRef } from 'react'

const PARTICLE_COUNT = 55
const CONNECT_DISTANCE = 130
const PARALLAX_STRENGTH = 8

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
}

/** 2D canvas particle field + connection lines + a subtly mouse-parallaxed grid. */
export default function LivingBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let particles: Particle[] = []
    let width = 0
    let height = 0
    let rafId = 0

    const resize = () => {
      width = canvas.clientWidth
      height = canvas.clientHeight
      const dpr = window.devicePixelRatio || 1
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(dpr, dpr)
    }

    const initParticles = () => {
      particles = Array.from({ length: PARTICLE_COUNT }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
      }))
    }

    resize()
    initParticles()

    const draw = () => {
      ctx.clearRect(0, 0, width, height)

      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = width
        if (p.x > width) p.x = 0
        if (p.y < 0) p.y = height
        if (p.y > height) p.y = 0
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i]
          const b = particles[j]
          const dist = Math.hypot(a.x - b.x, a.y - b.y)
          if (dist < CONNECT_DISTANCE) {
            ctx.strokeStyle = `rgba(245, 158, 11, ${0.14 * (1 - dist / CONNECT_DISTANCE)})`
            ctx.lineWidth = 0.5
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }

      for (const p of particles) {
        ctx.fillStyle = 'rgba(161, 161, 170, 0.55)'
        ctx.beginPath()
        ctx.arc(p.x, p.y, 1.3, 0, Math.PI * 2)
        ctx.fill()
      }

      if (!prefersReducedMotion) rafId = requestAnimationFrame(draw)
    }

    draw()

    const handleResize = () => {
      resize()
      initParticles()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const grid = gridRef.current
      if (!grid) return
      const xPct = e.clientX / window.innerWidth - 0.5
      const yPct = e.clientY / window.innerHeight - 0.5
      grid.style.transform = `translate(${xPct * -PARALLAX_STRENGTH}px, ${yPct * -PARALLAX_STRENGTH}px)`
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div
        ref={gridRef}
        className="absolute -inset-4 opacity-[0.12]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #3f3f46 1px, transparent 1px), linear-gradient(to bottom, #3f3f46 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  )
}
