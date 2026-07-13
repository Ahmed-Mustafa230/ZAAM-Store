'use client'

import { useEffect, useRef, useCallback } from 'react'

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

  const initParticles = useCallback((width: number, height: number) => {
    const particles: Particle[] = []
    const count = Math.min(Math.floor((width * height) / 15000), 80)

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        isGold: Math.random() > 0.7,
      })
    }

    particlesRef.current = particles
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initParticles(canvas.width, canvas.height)
    }

    resize()
    window.addEventListener('resize', resize)

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    window.addEventListener('mousemove', handleMouse)

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const mouse = mouseRef.current
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      for (const p of particlesRef.current) {
        const dx = mouse.x - centerX
        const dy = mouse.y - centerY
        const dist = Math.sqrt(dx * dx + dy * dy)
        const maxDist = Math.max(canvas.width, canvas.height) / 2

        if (dist > 0 && dist < maxDist) {
          const force = (maxDist - dist) / maxDist
          p.x += (dx / dist) * force * 0.3
          p.y += (dy / dist) * force * 0.3
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
          ctx.shadowColor = 'rgba(212, 175, 55, 0.3)'
          ctx.shadowBlur = 6
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`
          ctx.shadowColor = 'transparent'
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
      cancelAnimationFrame(animationRef.current)
    }
  }, [initParticles])

  return (
    <canvas
      ref={canvasRef}
      className='fixed inset-0 pointer-events-none z-0'
      style={{ opacity: 0.6 }}
    />
  )
}
