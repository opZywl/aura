"use client"

import { useEffect, useRef } from "react"
import { useSettings } from "./contexts/SettingsContext"
import { useTheme } from "next-themes"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  life?: number
  maxLife?: number
  angle?: number
  speed?: number
  amplitude?: number
  frequency?: number
  rotation?: number
  rotationSpeed?: number
  shape?: number
  connections?: number[]
  originalSize?: number
  exploding?: boolean
  explodeTime?: number
  explodeParticles?: ExplodeParticle[]
  fading?: boolean
  fadeTime?: number
  originalOpacity?: number
}

interface ExplodeParticle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  life: number
  color: string
}

export default function BackgroundAnimations() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: 0, y: 0 })
  const {
    animationType,
    animationsEnabled,
    particleIntensity,
    performanceMode,
    reducedMotion,
    mouseEffectsEnabled,
    mouseEffectType,
  } = useSettings()
  const { theme } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !animationsEnabled || animationType === "none" || reducedMotion) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      return
    }

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }

      if (!mouseEffectsEnabled) return

      // Check for particle interactions
      particlesRef.current.forEach((particle) => {
        const distance = Math.sqrt(
            Math.pow(particle.x - mouseRef.current.x, 2) + Math.pow(particle.y - mouseRef.current.y, 2),
        )

        if (distance < 50) {
          switch (mouseEffectType) {
            case "explode":
              if (!particle.exploding) {
                particle.exploding = true
                particle.explodeTime = 0
                particle.explodeParticles = []

                // Create explosion particles
                for (let i = 0; i < 8; i++) {
                  const angle = (i / 8) * Math.PI * 2
                  particle.explodeParticles.push({
                    x: particle.x,
                    y: particle.y,
                    vx: Math.cos(angle) * (Math.random() * 5 + 3),
                    vy: Math.sin(angle) * (Math.random() * 5 + 3),
                    size: particle.size * 0.5,
                    opacity: 1,
                    life: 30,
                    color: theme === "dark" ? "255, 255, 255" : "0, 0, 0",
                  })
                }
              }
              break

            case "fade":
              if (!particle.fading) {
                particle.fading = true
                particle.fadeTime = 0
                particle.originalOpacity = particle.opacity
              }
              break

            case "repel":
              const repelForce = 50 / distance
              const angle = Math.atan2(particle.y - mouseRef.current.y, particle.x - mouseRef.current.x)
              particle.vx += Math.cos(angle) * repelForce * 0.1
              particle.vy += Math.sin(angle) * repelForce * 0.1
              break

            case "attract":
              const attractForce = 50 / distance
              const attractAngle = Math.atan2(mouseRef.current.y - particle.y, mouseRef.current.x - particle.x)
              particle.vx += Math.cos(attractAngle) * attractForce * 0.05
              particle.vy += Math.sin(attractAngle) * attractForce * 0.05
              break
          }
        }
      })
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)
    window.addEventListener("mousemove", handleMouseMove)

    // Initialize particles based on type
    const initializeParticles = () => {
      particlesRef.current = []
      const particleCount = Math.floor((particleIntensity / 100) * (performanceMode ? 75 : 150))

      for (let i = 0; i < particleCount; i++) {
        const baseParticle: Particle = {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 3 + 1,
          opacity: Math.random() * 0.5 + 0.2,
          originalSize: Math.random() * 3 + 1,
          exploding: false,
          explodeTime: 0,
          explodeParticles: [],
          fading: false,
          fadeTime: 0,
          originalOpacity: Math.random() * 0.5 + 0.2,
        }

        switch (animationType) {
          case "particles":
            Object.assign(baseParticle, {
              vx: (Math.random() - 0.5) * 2,
              vy: (Math.random() - 0.5) * 2,
              size: Math.random() * 4 + 2,
              life: Math.random() * 100 + 50,
              maxLife: Math.random() * 100 + 50,
            })
            break

          case "waves":
            Object.assign(baseParticle, {
              angle: Math.random() * Math.PI * 2,
              speed: Math.random() * 0.02 + 0.01,
              amplitude: Math.random() * 50 + 20,
              frequency: Math.random() * 0.02 + 0.01,
              size: Math.random() * 2 + 1,
            })
            break

          case "geometric":
            Object.assign(baseParticle, {
              vx: (Math.random() - 0.5) * 1,
              vy: (Math.random() - 0.5) * 1,
              rotation: Math.random() * Math.PI * 2,
              rotationSpeed: (Math.random() - 0.5) * 0.02,
              size: Math.random() * 20 + 10,
              shape: Math.floor(Math.random() * 3),
            })
            break

          case "neural":
            Object.assign(baseParticle, {
              vx: (Math.random() - 0.5) * 0.3,
              vy: (Math.random() - 0.5) * 0.3,
              size: Math.random() * 4 + 2,
              connections: [],
            })
            break
        }

        particlesRef.current.push(baseParticle)
      }
    }

    initializeParticles()

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const isDark = theme === "dark"
      const baseColor = isDark ? "255, 255, 255" : "0, 0, 0"

      particlesRef.current.forEach((particle, index) => {
        // Handle explosion effect
        if (particle.exploding) {
          particle.explodeTime!++

          // Draw explosion particles
          particle.explodeParticles!.forEach((explodeParticle) => {
            explodeParticle.x += explodeParticle.vx
            explodeParticle.y += explodeParticle.vy
            explodeParticle.vx *= 0.98
            explodeParticle.vy *= 0.98
            explodeParticle.life--
            explodeParticle.opacity = explodeParticle.life / 30

            if (explodeParticle.life > 0) {
              ctx.beginPath()
              ctx.arc(explodeParticle.x, explodeParticle.y, explodeParticle.size, 0, Math.PI * 2)
              ctx.fillStyle = `rgba(${explodeParticle.color}, ${explodeParticle.opacity})`
              ctx.fill()
            }
          })

          // Reset particle after explosion
          if (particle.explodeTime! > 60) {
            particle.exploding = false
            particle.x = Math.random() * canvas.width
            particle.y = Math.random() * canvas.height
            particle.size = particle.originalSize!
            particle.opacity = particle.originalOpacity!
          } else {
            // Make original particle fade during explosion
            particle.opacity = Math.max(0, particle.originalOpacity! * (1 - particle.explodeTime! / 60))
          }
        }

        // Handle fade effect
        if (particle.fading) {
          particle.fadeTime!++
          particle.opacity = Math.max(0, particle.originalOpacity! * (1 - particle.fadeTime! / 60))

          if (particle.fadeTime! > 60) {
            particle.fading = false
            particle.x = Math.random() * canvas.width
            particle.y = Math.random() * canvas.height
            particle.opacity = particle.originalOpacity!
          }
        }

        // Skip rendering if exploding or completely faded
        if (particle.exploding || (particle.fading && particle.opacity <= 0)) {
          return
        }

        switch (animationType) {
          case "dots":
            // Update position
            particle.x += particle.vx
            particle.y += particle.vy

            // Bounce off edges
            if (particle.x <= 0 || particle.x >= canvas.width) particle.vx *= -1
            if (particle.y <= 0 || particle.y >= canvas.height) particle.vy *= -1

            // Draw dot with sparkle effect for mouse hover
            const mouseDistance = Math.sqrt(
                Math.pow(particle.x - mouseRef.current.x, 2) + Math.pow(particle.y - mouseRef.current.y, 2),
            )

            if (mouseDistance < 100 && mouseEffectType === "sparkle" && mouseEffectsEnabled) {
              // Draw sparkle effect
              for (let i = 0; i < 3; i++) {
                const sparkleX = particle.x + (Math.random() - 0.5) * 20
                const sparkleY = particle.y + (Math.random() - 0.5) * 20
                ctx.beginPath()
                ctx.arc(sparkleX, sparkleY, Math.random() * 2 + 1, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(${baseColor}, 0.8)`
                ctx.fill()
              }
            }

            ctx.beginPath()
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(${baseColor}, ${particle.opacity})`
            ctx.fill()
            break

          case "particles":
            // Update position
            particle.x += particle.vx
            particle.y += particle.vy
            particle.life!--

            // Reset particle if it dies
            if (particle.life! <= 0) {
              particle.x = Math.random() * canvas.width
              particle.y = Math.random() * canvas.height
              particle.life = particle.maxLife!
            }

            // Wrap around edges
            if (particle.x < 0) particle.x = canvas.width
            if (particle.x > canvas.width) particle.x = 0
            if (particle.y < 0) particle.y = canvas.height
            if (particle.y > canvas.height) particle.y = 0

            // Draw particle
            const lifeRatio = particle.life! / particle.maxLife!
            ctx.beginPath()
            ctx.arc(particle.x, particle.y, particle.size * lifeRatio, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(${baseColor}, ${particle.opacity * lifeRatio})`
            ctx.fill()
            break

          case "waves":
            // Update wave motion
            particle.angle! += particle.speed!
            particle.x += Math.cos(particle.angle!) * particle.amplitude! * particle.frequency!
            particle.y += Math.sin(particle.angle!) * particle.amplitude! * particle.frequency!

            // Keep in bounds
            if (particle.x < 0) particle.x = canvas.width
            if (particle.x > canvas.width) particle.x = 0
            if (particle.y < 0) particle.y = canvas.height
            if (particle.y > canvas.height) particle.y = 0

            // Draw wave particle
            ctx.beginPath()
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(${baseColor}, ${particle.opacity})`
            ctx.fill()
            break

          case "geometric":
            // Update position and rotation
            particle.x += particle.vx
            particle.y += particle.vy
            particle.rotation! += particle.rotationSpeed!

            // Bounce off edges
            if (particle.x <= 0 || particle.x >= canvas.width) particle.vx *= -1
            if (particle.y <= 0 || particle.y >= canvas.height) particle.vy *= -1

            // Draw geometric shape
            ctx.save()
            ctx.translate(particle.x, particle.y)
            ctx.rotate(particle.rotation!)
            ctx.strokeStyle = `rgba(${baseColor}, ${particle.opacity})`
            ctx.lineWidth = 1

            if (particle.shape === 0) {
              // Triangle
              ctx.beginPath()
              ctx.moveTo(0, -particle.size / 2)
              ctx.lineTo(-particle.size / 2, particle.size / 2)
              ctx.lineTo(particle.size / 2, particle.size / 2)
              ctx.closePath()
              ctx.stroke()
            } else if (particle.shape === 1) {
              // Square
              ctx.strokeRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size)
            } else {
              // Hexagon
              ctx.beginPath()
              for (let i = 0; i < 6; i++) {
                const angle = (i * Math.PI) / 3
                const x = (Math.cos(angle) * particle.size) / 2
                const y = (Math.sin(angle) * particle.size) / 2
                if (i === 0) ctx.moveTo(x, y)
                else ctx.lineTo(x, y)
              }
              ctx.closePath()
              ctx.stroke()
            }
            ctx.restore()
            break

          case "neural":
            // Update position
            particle.x += particle.vx
            particle.y += particle.vy

            // Bounce off edges
            if (particle.x <= 0 || particle.x >= canvas.width) particle.vx *= -1
            if (particle.y <= 0 || particle.y >= canvas.height) particle.vy *= -1

            // Draw node
            ctx.beginPath()
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(${baseColor}, ${particle.opacity})`
            ctx.fill()

            // Draw connections to nearby particles
            particlesRef.current.forEach((otherParticle, otherIndex) => {
              if (index !== otherIndex && !otherParticle.exploding && !otherParticle.fading) {
                const dx = particle.x - otherParticle.x
                const dy = particle.y - otherParticle.y
                const distance = Math.sqrt(dx * dx + dy * dy)

                if (distance < 100) {
                  const opacity = (1 - distance / 100) * 0.2
                  ctx.beginPath()
                  ctx.moveTo(particle.x, particle.y)
                  ctx.lineTo(otherParticle.x, otherParticle.y)
                  ctx.strokeStyle = `rgba(${baseColor}, ${opacity})`
                  ctx.lineWidth = 1
                  ctx.stroke()
                }
              }
            })
            break
        }
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      window.removeEventListener("mousemove", handleMouseMove)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [
    animationType,
    animationsEnabled,
    particleIntensity,
    performanceMode,
    reducedMotion,
    theme,
    mouseEffectsEnabled,
    mouseEffectType,
  ])

  if (!animationsEnabled || animationType === "none" || reducedMotion) {
    return null
  }

  return (
      <canvas
          ref={canvasRef}
          className="fixed inset-0 pointer-events-none z-0"
          style={{ opacity: particleIntensity / 100 }}
      />
  )
}