"use client"

import { useEffect, useRef } from "react"
import { useSettings } from "../contexts/SettingsContext"
import { useTheme } from "next-themes"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  size: number
}

export default function NeuralNetworkAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { animationsEnabled } = useSettings()
  const { theme } = useTheme()
  const animationRef = useRef<number>()
  const particlesRef = useRef<Particle[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
      canvas.style.width = rect.width + "px"
      canvas.style.height = rect.height + "px"
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Initialize particles
    const colors =
      theme === "dark"
        ? ["#60a5fa", "#a78bfa", "#34d399", "#fbbf24", "#f87171", "#fb7185"]
        : ["#1d4ed8", "#7c3aed", "#059669", "#d97706", "#dc2626", "#e11d48"]

    particlesRef.current = Array.from({ length: 50 }, () => ({
      x: (Math.random() * canvas.width) / window.devicePixelRatio,
      y: (Math.random() * canvas.height) / window.devicePixelRatio,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 3 + 2,
    }))

    const animate = () => {
      if (!animationsEnabled) {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
        }
        return
      }

      ctx.clearRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio)

      // Update and draw particles
      particlesRef.current.forEach((particle) => {
        particle.x += particle.vx
        particle.y += particle.vy

        // Bounce off edges
        if (particle.x <= 0 || particle.x >= canvas.width / window.devicePixelRatio) particle.vx *= -1
        if (particle.y <= 0 || particle.y >= canvas.height / window.devicePixelRatio) particle.vy *= -1

        // Draw particle
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = particle.color
        ctx.fill()
      })

      // Draw connections
      particlesRef.current.forEach((particle, i) => {
        particlesRef.current.slice(i + 1).forEach((otherParticle) => {
          const dx = particle.x - otherParticle.x
          const dy = particle.y - otherParticle.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 100) {
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(otherParticle.x, otherParticle.y)
            ctx.strokeStyle =
              theme === "dark"
                ? `rgba(255, 255, 255, ${0.1 * (1 - distance / 100)})`
                : `rgba(0, 0, 0, ${0.1 * (1 - distance / 100)})`
            ctx.lineWidth = 1
            ctx.stroke()
          }
        })
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    if (animationsEnabled) {
      animationRef.current = requestAnimationFrame(animate)
    }

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [animationsEnabled, theme])

  return <canvas ref={canvasRef} className="w-full h-full" style={{ background: "transparent" }} />
}
