'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useReducedMotion } from 'framer-motion'

interface Particle {
  x: number
  y: number
  size: number
  opacity: number
  speedX: number
  speedY: number
  isGold: boolean
}

export default function ParticlesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number>(0)
  const mouseRef = useRef({ x: 0, y: 0 })
  const isVisibleRef = useRef(true)
  const prefersReducedMotion = useReducedMotion()

  const initParticles = useCallback((width: number, height: number) => {
    const isMobile = width < 768
    const density = isMobile ? 22000 : 15000
    const maxCount = isMobile ? 35 : 70
    const count = Math.min(Math.floor((width * height) / density), maxCount)

    const particles: Particle[] = []
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.5 + 0.8,
        opacity: Math.random() * 0.45 + 0.08,
        speedX: (Math.random() - 0.5) * 0.35,
        speedY: (Math.random() - 0.5) * 0.35,
        isGold: Math.random() > 0.65,
      })
    }
    particlesRef.current = particles
  }, [])

  useEffect(() => {
    if (prefersReducedMotion) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const parent = canvas.parentElement

    const resize = () => {
      const rect = parent?.getBoundingClientRect()
      canvas.width = rect?.width ?? window.innerWidth
      canvas.height = rect?.height ?? window.innerHeight
      initParticles(canvas.width, canvas.height)
    }

    resize()
    window.addEventListener('resize', resize, { passive: true })

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', handleMouse, { passive: true })

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting
      },
      { threshold: 0.05 },
    )
    if (parent) observer.observe(parent)

    const animate = () => {
      if (!isVisibleRef.current) {
        animationRef.current = requestAnimationFrame(animate)
        return
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const mouse = mouseRef.current
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const maxDist = Math.max(canvas.width, canvas.height) / 2

      for (const p of particlesRef.current) {
        const dx = mouse.x - centerX
        const dy = mouse.y - centerY
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist > 0 && dist < maxDist) {
          const force = (maxDist - dist) / maxDist
          p.x += (dx / dist) * force * 0.25
          p.y += (dy / dist) * force * 0.25
        }

        p.x += p.speedX
        p.y += p.speedY

        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)

        if (p.isGold) {
          ctx.fillStyle = `rgba(212, 175, 55, ${p.opacity})`
          ctx.shadowColor = 'rgba(212, 175, 55, 0.25)'
          ctx.shadowBlur = 4
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * 0.6})`
          ctx.shadowBlur = 0
        }

        ctx.fill()
      }

      ctx.shadowBlur = 0
      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouse)
      observer.disconnect()
      cancelAnimationFrame(animationRef.current)
    }
  }, [initParticles, prefersReducedMotion])

  if (prefersReducedMotion) return null

  return (
    <canvas
      ref={canvasRef}
      className='absolute inset-0 pointer-events-none z-[2]'
      style={{ opacity: 0.55 }}
      aria-hidden='true'
    />
  )
}
