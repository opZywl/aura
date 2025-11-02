"use client"

import { useEffect, useRef } from "react"
import { useSettings } from "@/src/aura/features/view/lobby/contexts/SettingsContext"

export default function NeuralNetworkAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>(0)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: 0, y: 0 })
  const { reducedMotion, particleIntensity } = useSettings()

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const updateCanvasSize = () => {
      const rect = container.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
    }

    // Initialize particles
    const initParticles = () => {
      const baseParticleCount = 150
      const particleCount = Math.floor((baseParticleCount * particleIntensity) / 100)
      const particles: Particle[] = []

      const colors = [
        "rgba(135, 206, 250, 0.8)", // Light blue
        "rgba(147, 112, 219, 0.8)", // Purple
        "rgba(152, 251, 152, 0.8)", // Pale green
        "rgba(255, 215, 0, 0.8)", // Gold
        "rgba(255, 105, 180, 0.8)", // Hot pink
        "rgba(64, 224, 208, 0.8)", // Turquoise
      ]

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 3 + 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          connections: [],
          originalRadius: Math.random() * 3 + 1,
          pulse: Math.random() * Math.PI * 2,
        })
      }

      // Establish connections between particles
      for (let i = 0; i < particles.length; i++) {
        const connectionsCount = Math.floor(Math.random() * 4) + 2
        const possibleConnections = [...Array(particles.length).keys()]
          .filter((j) => j !== i)
          .sort(() => Math.random() - 0.5)

        for (let c = 0; c < Math.min(connectionsCount, possibleConnections.length); c++) {
          particles[i].connections.push(possibleConnections[c])
        }
      }

      return particles
    }

    const drawParticles = () => {
      if (!ctx || !canvas) return

      // Clear canvas with fade effect
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const time = Date.now() * 0.001

      // Draw connections first
      for (let i = 0; i < particlesRef.current.length; i++) {
        const particle = particlesRef.current[i]

        for (const connectionIndex of particle.connections) {
          if (connectionIndex >= particlesRef.current.length) continue
          const connectedParticle = particlesRef.current[connectionIndex]
          const distance = Math.sqrt(
            Math.pow(particle.x - connectedParticle.x, 2) + Math.pow(particle.y - connectedParticle.y, 2),
          )

          // Only draw connections if particles are within a certain distance
          const maxDistance = 120
          if (distance < maxDistance) {
            const opacity = (1 - distance / maxDistance) * 0.6

            // Create gradient for line
            const gradient = ctx.createLinearGradient(particle.x, particle.y, connectedParticle.x, connectedParticle.y)
            gradient.addColorStop(0, particle.color.replace("0.8", `${opacity}`))
            gradient.addColorStop(1, connectedParticle.color.replace("0.8", `${opacity}`))

            ctx.beginPath()
            ctx.strokeStyle = gradient
            ctx.lineWidth = 1.5
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(connectedParticle.x, connectedParticle.y)
            ctx.stroke()

            // Add data flow effect
            if (!reducedMotion && Math.random() > 0.8) {
              const flowPosition = (time % 2) / 2
              const flowX = particle.x + (connectedParticle.x - particle.x) * flowPosition
              const flowY = particle.y + (connectedParticle.y - particle.y) * flowPosition

              ctx.beginPath()
              ctx.fillStyle = "rgba(255, 255, 255, 0.9)"
              ctx.arc(flowX, flowY, 2, 0, Math.PI * 2)
              ctx.fill()
            }
          }
        }
      }

      // Draw particles
      for (const particle of particlesRef.current) {
        // Mouse interaction
        const mouseDistance = Math.sqrt(
          Math.pow(particle.x - mouseRef.current.x, 2) + Math.pow(particle.y - mouseRef.current.y, 2),
        )
        const mouseInfluence = Math.max(0, 1 - mouseDistance / 100)

        // Pulsing effect
        particle.pulse += 0.05
        const pulseRadius = particle.originalRadius + Math.sin(particle.pulse) * 0.5 + mouseInfluence * 2

        // Particle glow effect
        const glowRadius = pulseRadius * (2 + mouseInfluence * 2)
        const gradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, glowRadius)
        gradient.addColorStop(0, particle.color)
        gradient.addColorStop(0.3, particle.color.replace("0.8", "0.4"))
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)")

        ctx.beginPath()
        ctx.fillStyle = gradient
        ctx.arc(particle.x, particle.y, glowRadius, 0, Math.PI * 2)
        ctx.fill()

        // Particle center
        ctx.beginPath()
        ctx.fillStyle = mouseInfluence > 0.3 ? "rgba(255, 255, 255, 0.9)" : particle.color
        ctx.arc(particle.x, particle.y, pulseRadius, 0, Math.PI * 2)
        ctx.fill()

        // Add sparkle effect on mouse hover
        if (mouseInfluence > 0.5 && !reducedMotion) {
          for (let i = 0; i < 3; i++) {
            const sparkleX = particle.x + (Math.random() - 0.5) * 20
            const sparkleY = particle.y + (Math.random() - 0.5) * 20
            const sparkleSize = Math.random() * 2 + 1

            ctx.beginPath()
            ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
            ctx.arc(sparkleX, sparkleY, sparkleSize, 0, Math.PI * 2)
            ctx.fill()
          }
        }
      }
    }

    const updateParticles = () => {
      for (const particle of particlesRef.current) {
        // Update position
        particle.x += particle.vx
        particle.y += particle.vy

        // Mouse attraction/repulsion
        const mouseDistance = Math.sqrt(
          Math.pow(particle.x - mouseRef.current.x, 2) + Math.pow(particle.y - mouseRef.current.y, 2),
        )

        if (mouseDistance < 100) {
          const force = (100 - mouseDistance) / 100
          const angle = Math.atan2(particle.y - mouseRef.current.y, particle.x - mouseRef.current.x)
          particle.vx += Math.cos(angle) * force * 0.1
          particle.vy += Math.sin(angle) * force * 0.1
        }

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.vx *= -0.8
          particle.x = Math.max(0, Math.min(canvas.width, particle.x))
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.vy *= -0.8
          particle.y = Math.max(0, Math.min(canvas.height, particle.y))
        }

        // Add some randomness
        if (Math.random() > 0.99) {
          particle.vx += (Math.random() - 0.5) * 0.2
          particle.vy += (Math.random() - 0.5) * 0.2
        }

        // Limit velocity
        const maxVelocity = 2
        const velocity = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy)
        if (velocity > maxVelocity) {
          particle.vx = (particle.vx / velocity) * maxVelocity
          particle.vy = (particle.vy / velocity) * maxVelocity
        }
      }
    }

    const animate = () => {
      if (!reducedMotion) {
        updateParticles()
      }
      drawParticles()
      animationRef.current = requestAnimationFrame(animate)
    }

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }

    // Initialize
    updateCanvasSize()
    particlesRef.current = initParticles()
    animate()

    // Add event listeners
    canvas.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("resize", () => {
      updateCanvasSize()
      particlesRef.current = initParticles()
    })

    // Cleanup
    return () => {
      cancelAnimationFrame(animationRef.current)
      canvas.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("resize", updateCanvasSize)
    }
  }, [reducedMotion, particleIntensity])

  return (
    <div ref={containerRef} className="relative w-full h-full rounded-2xl overflow-hidden bg-black">
      <canvas ref={canvasRef} className="absolute inset-0 z-10" />
      {/* Fallback gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-green-900/20 z-0" />
    </div>
  )
}

// Types
interface Particle {
  x: number
  y: number
  radius: number
  color: string
  vx: number
  vy: number
  connections: number[]
  originalRadius: number
  pulse: number
}
