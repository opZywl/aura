"use client"

import { useEffect, useRef, useState } from "react"
import { useTheme } from "next-themes"
import { useSettings } from "../contexts/SettingsContext"
import MatrixRain from "@/components/matrix-rain"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  color: string
  life: number
  maxLife: number
  angle?: number
  speed?: number
  trail?: { x: number; y: number; opacity: number }[]
  hue?: number
  exploding?: boolean
  explosionParticles?: Particle[]
  magneticForce?: { x: number; y: number }
  vortexAngle?: number
  rainbowHue?: number
  originalColor?: string
  mouseInteractionCount?: number
  isRainbow?: boolean
  originalX?: number
  originalY?: number
  targetX?: number
  targetY?: number
  pullForce?: number
  followingMouse?: boolean
}

interface MatrixChar {
  x: number
  y: number
  char: string
  opacity: number
  speed: number
  originalX?: number
  originalY?: number
  followingMouse?: boolean
}

export default function BackgroundAnimations() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()
  const {
    animationsEnabled,
    animationType,
    particleIntensity,
    mouseEffectsEnabled,
    mouseEffectType,
    currentMixAnimation,
    currentMixMouseEffect,
  } = useSettings()
  const [particles, setParticles] = useState<Particle[]>([])
  const [matrixChars, setMatrixChars] = useState<MatrixChar[]>([])
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 })
  const [mouseMovementCount, setMouseMovementCount] = useState(0)
  const [currentRainbowHue, setCurrentRainbowHue] = useState(0)
  const [currentMixEffectIndex, setCurrentMixEffectIndex] = useState(0)
  const animationRef = useRef<number>()
  const timeRef = useRef(0)

  const isDark = theme === "dark"

  // Available effects for mix mode (incluindo o novo "seguir")
  const mixEffects = ["explode", "fade", "repel", "attract", "sparkle", "rainbow", "magnetic", "vortex", "seguir"]

  // Get current animation and mouse effect (considering mix mode)
  const getCurrentAnimation = () => {
    const animations = [
      "dots",
      "particles",
      "waves",
      "geometric",
      "neural",
      "matrix",
      "matrix-rain",
      "spiral",
      "constellation",
      "none",
      "mix",
    ]
    return animationType === "mix" ? currentMixAnimation : animationType
  }

  const getCurrentMouseEffect = () => {
    return mouseEffectType === "mix" ? mixEffects[currentMixEffectIndex] : mouseEffectType
  }

  // Handle mouse movement for interactive effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const newMousePos = { x: e.clientX, y: e.clientY }

      // Check if mouse actually moved significantly
      const dx = newMousePos.x - lastMousePos.x
      const dy = newMousePos.y - lastMousePos.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance > 10) {
        // Only count significant movements
        setMouseMovementCount((prev) => prev + 1)
        setLastMousePos(newMousePos)

        // Change rainbow hue on mouse movement
        if (mouseEffectType === "rainbow") {
          setCurrentRainbowHue((prev) => (prev + 45) % 360)
        }

        // Change mix effect on mouse movement
        if (mouseEffectType === "mix") {
          setCurrentMixEffectIndex((prev) => (prev + 1) % mixEffects.length)
        }
      }

      setMousePos(newMousePos)
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [mouseEffectType, lastMousePos])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Initialize particles
    const initParticles = () => {
      const particleCount = Math.floor((particleIntensity / 100) * 250)
      const newParticles: Particle[] = []

      for (let i = 0; i < particleCount; i++) {
        const baseColor = isDark ? "255, 255, 255" : "0, 0, 0"
        const x = Math.random() * canvas.width
        const y = Math.random() * canvas.height

        newParticles.push({
          x,
          y,
          originalX: x,
          originalY: y,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          size: Math.random() * 4 + 1,
          opacity: Math.random() * 0.8 + 0.2,
          color: baseColor,
          originalColor: baseColor,
          life: Math.random() * 100,
          maxLife: 100,
          angle: Math.random() * Math.PI * 2,
          speed: Math.random() * 2 + 0.5,
          trail: [],
          hue: Math.random() * 360,
          vortexAngle: Math.random() * Math.PI * 2,
          rainbowHue: Math.random() * 360,
          mouseInteractionCount: 0,
          isRainbow: false,
          pullForce: 0,
          followingMouse: false,
        })
      }
      setParticles(newParticles)
    }

    // Initialize matrix characters
    const initMatrix = () => {
      const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン".split(
          "",
        )
      const newMatrixChars: MatrixChar[] = []
      const columns = Math.floor(canvas.width / 15)

      for (let i = 0; i < columns; i++) {
        const x = i * 15
        const y = Math.random() * canvas.height
        newMatrixChars.push({
          x,
          y,
          originalX: x,
          originalY: y,
          char: chars[Math.floor(Math.random() * chars.length)],
          opacity: Math.random(),
          speed: Math.random() * 4 + 1,
          followingMouse: false,
        })
      }
      setMatrixChars(newMatrixChars)
    }

    if (animationsEnabled && getCurrentAnimation() !== "none") {
      initParticles()
      initMatrix()
    }

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [animationsEnabled, animationType, particleIntensity, isDark, currentMixAnimation])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const animate = () => {
      timeRef.current += 0.016 // ~60fps

      // For mix mode, don't clear the canvas completely - create overlay effect
      if (getCurrentAnimation() === "mix") {
        ctx.fillStyle = `rgba(${isDark ? "0, 0, 0" : "255, 255, 255"}, 0.02)`
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }

      if (!animationsEnabled || getCurrentAnimation() === "none") {
        animationRef.current = requestAnimationFrame(animate)
        return
      }

      // Render based on animation type
      if (getCurrentAnimation() === "mix") {
        // Render ALL animations simultaneously for mix mode
        renderDots(ctx, canvas, 0.3)
        renderParticles(ctx, canvas, 0.2)
        renderWaves(ctx, canvas, 0.2)
        renderGeometric(ctx, canvas, 0.3)
        renderNeural(ctx, canvas, 0.2)
        renderMatrix(ctx, canvas, 0.1)
        renderSpiral(ctx, canvas, 0.2)
        renderConstellation(ctx, canvas, 0.3)
        // Add Matrix Rain as overlay
        if (animationType === "mix") {
          return (
            <>
              <canvas
                ref={canvasRef}
                className="fixed inset-0 pointer-events-none z-0"
                style={{ background: "transparent" }}
              />
              <div className="fixed inset-0 pointer-events-none z-1 opacity-30">
                <MatrixRain />
              </div>
            </>
          )
        }
      } else {
        // Render single animation
        switch (getCurrentAnimation()) {
          case "dots":
            renderDots(ctx, canvas)
            break
          case "particles":
            renderParticles(ctx, canvas)
            break
          case "waves":
            renderWaves(ctx, canvas)
            break
          case "geometric":
            renderGeometric(ctx, canvas)
            break
          case "neural":
            renderNeural(ctx, canvas)
            break
          case "matrix":
            renderMatrix(ctx, canvas)
            break
          case "spiral":
            renderSpiral(ctx, canvas)
            break
          case "constellation":
            renderConstellation(ctx, canvas)
            break
          case "matrix-rain":
            return <MatrixRain />
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [
    particles,
    matrixChars,
    mousePos,
    animationsEnabled,
    animationType,
    mouseEffectsEnabled,
    mouseEffectType,
    isDark,
    currentMixAnimation,
    currentMixMouseEffect,
    currentRainbowHue,
    currentMixEffectIndex,
  ])

  const handleMouseEffect = (particle: Particle, dx: number, dy: number, distance: number) => {
    const currentEffect = getCurrentMouseEffect()

    // Reset rainbow effect if not in rainbow mode
    if (currentEffect !== "rainbow" && particle.isRainbow) {
      particle.isRainbow = false
      particle.color = particle.originalColor || (isDark ? "255, 255, 255" : "0, 0, 0")
      particle.opacity = Math.max(0.2, particle.opacity)
      particle.size = Math.max(1, particle.size)
    }

    switch (currentEffect) {
      case "explode":
        if (distance < 80 && !particle.exploding) {
          particle.exploding = true

          // Create explosion effect
          const explosionForce = 8 + Math.random() * 4
          const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.5

          particle.vx = Math.cos(angle) * explosionForce * -1
          particle.vy = Math.sin(angle) * explosionForce * -1

          // Visual explosion effects
          particle.size = Math.min(particle.size * 2, 8)
          particle.opacity = 0.1

          // Create explosion particles
          if (!particle.explosionParticles) {
            particle.explosionParticles = []
            for (let i = 0; i < 8; i++) {
              const explosionAngle = (i / 8) * Math.PI * 2
              particle.explosionParticles.push({
                x: particle.x,
                y: particle.y,
                vx: Math.cos(explosionAngle) * (3 + Math.random() * 3),
                vy: Math.sin(explosionAngle) * (3 + Math.random() * 3),
                size: 1 + Math.random() * 2,
                opacity: 0.8,
                color: `${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}`,
                life: 0,
                maxLife: 30,
                angle: 0,
                speed: 0,
                trail: [],
                hue: Math.random() * 360,
                exploding: false,
              })
            }
          }

          setTimeout(() => {
            particle.exploding = false
            particle.explosionParticles = []
            particle.x = Math.random() * (canvasRef.current?.width || 800)
            particle.y = Math.random() * (canvasRef.current?.height || 600)
            particle.opacity = 0.8
            particle.size = Math.max(1, particle.size / 2)
            particle.vx = (Math.random() - 0.5) * 2
            particle.vy = (Math.random() - 0.5) * 2
          }, 1500)
        }
        break

      case "fade":
        if (distance < 100) {
          particle.opacity = Math.max(0.1, particle.opacity - 0.02)
          if (particle.opacity <= 0.1) {
            particle.x = Math.random() * (canvasRef.current?.width || 800)
            particle.y = Math.random() * (canvasRef.current?.height || 600)
            particle.opacity = 0.8
          }
        } else {
          particle.opacity = Math.min(0.8, particle.opacity + 0.01)
        }
        break

      case "repel":
        if (distance < 120) {
          const force = (120 - distance) / 120
          particle.vx += (dx / distance) * force * -0.3
          particle.vy += (dy / distance) * force * -0.3
        }
        break

      case "attract":
        if (distance < 150) {
          const force = (150 - distance) / 150
          particle.vx += (dx / distance) * force * 0.1
          particle.vy += (dy / distance) * force * 0.1
        }
        break

      case "sparkle":
        if (distance < 100) {
          particle.opacity = Math.min(1, particle.opacity + 0.05)
          particle.size = Math.min(8, particle.size + 0.1)
        } else {
          particle.opacity = Math.max(0.2, particle.opacity - 0.01)
          particle.size = Math.max(1, particle.size - 0.05)
        }
        break

      case "rainbow":
        if (distance < 150) {
          particle.isRainbow = true
          const hue = (currentRainbowHue + (particle.mouseInteractionCount || 0) * 60) % 360
          particle.rainbowHue = hue
          particle.mouseInteractionCount = (particle.mouseInteractionCount || 0) + 1

          const r = Math.floor((255 * (1 + Math.cos((hue * Math.PI) / 180))) / 2)
          const g = Math.floor((255 * (1 + Math.cos(((hue + 120) * Math.PI) / 180))) / 2)
          const b = Math.floor((255 * (1 + Math.cos(((hue + 240) * Math.PI) / 180))) / 2)
          particle.color = `${r}, ${g}, ${b}`

          particle.opacity = Math.min(1, particle.opacity + 0.1)
          particle.size = Math.min(6, particle.size + 0.2)
        } else if (particle.isRainbow) {
          particle.isRainbow = false
          particle.color = particle.originalColor || (isDark ? "255, 255, 255" : "0, 0, 0")
          particle.opacity = Math.max(0.2, particle.opacity - 0.02)
          particle.size = Math.max(1, particle.size - 0.1)
        }
        break

      case "magnetic":
        if (distance < 150) {
          const magneticStrength = (150 - distance) / 150
          particle.magneticForce = {
            x: (dx / distance) * magneticStrength * 0.4,
            y: (dy / distance) * magneticStrength * 0.4,
          }
          particle.vx += particle.magneticForce.x
          particle.vy += particle.magneticForce.y

          particle.opacity = Math.min(1, particle.opacity + 0.05)
          particle.size = Math.min(5, particle.size + 0.1)
        } else {
          particle.opacity = Math.max(0.2, particle.opacity - 0.01)
          particle.size = Math.max(1, particle.size - 0.05)
        }
        break

      case "vortex":
        if (distance < 150) {
          const angle = Math.atan2(dy, dx)
          const vortexStrength = (150 - distance) / 150
          particle.vortexAngle = (particle.vortexAngle || 0) + 0.1
          particle.vx += Math.cos(angle + particle.vortexAngle) * vortexStrength * 0.3
          particle.vy += Math.sin(angle + particle.vortexAngle) * vortexStrength * 0.3
        }
        break

      case "seguir":
        // Modo seguir: todas as partículas seguem o mouse suavemente
        particle.followingMouse = true
        const followStrength = 0.02 // Força de seguimento suave

        // Ensure we don't divide by zero and handle very small distances
        if (distance > 0.1) {
          particle.vx += (dx / distance) * followStrength * Math.min(distance, 100) * 0.001
          particle.vy += (dy / distance) * followStrength * Math.min(distance, 100) * 0.001
        }

        // Efeito visual de estar seguindo - SEM alterar cores
        particle.opacity = Math.min(1, 0.5 + ((300 - Math.min(distance, 300)) / 300) * 0.5)
        particle.size = Math.max(1, Math.min(6, 1 + ((300 - Math.min(distance, 300)) / 300) * 3))

        // NÃO alterar cores - manter cor original
        break
    }
  }

  const handleMatrixFollow = (matrixChar: MatrixChar) => {
    if (getCurrentMouseEffect() === "seguir") {
      const dx = mousePos.x - matrixChar.x
      const dy = mousePos.y - matrixChar.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < 300) {
        matrixChar.followingMouse = true
        const followStrength = 0.01
        matrixChar.x += dx * followStrength
        matrixChar.y += dy * followStrength
        // Manter opacidade original - não alterar cores
        matrixChar.opacity = Math.min(1, 0.3 + ((300 - distance) / 300) * 0.7)
      } else {
        matrixChar.followingMouse = false
        // Retornar gradualmente à posição original
        if (matrixChar.originalX !== undefined) {
          matrixChar.x += (matrixChar.originalX - matrixChar.x) * 0.01
        }
        matrixChar.opacity = Math.max(0.1, matrixChar.opacity - 0.01)
      }
    } else {
      matrixChar.followingMouse = false
      // Retornar à posição original
      if (matrixChar.originalX !== undefined) {
        matrixChar.x += (matrixChar.originalX - matrixChar.x) * 0.02
      }
    }
  }

  const renderDots = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, mixOpacity = 1) => {
    particles.forEach((particle) => {
      // Update position
      if (!particle.followingMouse || getCurrentMouseEffect() !== "seguir") {
        particle.x += particle.vx
        particle.y += particle.vy

        // Bounce off edges
        if (particle.x <= 0 || particle.x >= canvas.width) particle.vx *= -1
        if (particle.y <= 0 || particle.y >= canvas.height) particle.vy *= -1
      }

      // Mouse interaction
      if (mouseEffectsEnabled && getCurrentMouseEffect() !== "none") {
        const dx = mousePos.x - particle.x
        const dy = mousePos.y - particle.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (getCurrentMouseEffect() === "seguir" || distance < 200) {
          handleMouseEffect(particle, dx, dy, distance)
        }
      }

      // Draw particle
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)

      if (particle.isRainbow && particle.rainbowHue !== undefined) {
        const gradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.size * 2)
        gradient.addColorStop(0, `hsl(${particle.rainbowHue}, 100%, 70%)`)
        gradient.addColorStop(1, `hsl(${(particle.rainbowHue + 60) % 360}, 100%, 50%)`)
        ctx.fillStyle = gradient
      } else {
        ctx.fillStyle = `rgba(${particle.color}, ${particle.opacity * mixOpacity})`
      }

      ctx.fill()

      // Draw explosion particles
      if (particle.explosionParticles && particle.exploding) {
        particle.explosionParticles.forEach((expParticle, expIndex) => {
          expParticle.x += expParticle.vx
          expParticle.y += expParticle.vy
          expParticle.vx *= 0.95
          expParticle.vy *= 0.95
          expParticle.life++
          expParticle.opacity = Math.max(0, 0.8 - expParticle.life / expParticle.maxLife)

          if (expParticle.life < expParticle.maxLife) {
            ctx.beginPath()
            ctx.arc(expParticle.x, expParticle.y, expParticle.size, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(${expParticle.color}, ${expParticle.opacity})`
            ctx.fill()

            // Add sparkle effect
            ctx.shadowColor = `rgba(${expParticle.color}, ${expParticle.opacity})`
            ctx.shadowBlur = 5
            ctx.fill()
            ctx.shadowBlur = 0
          }
        })

        // Remove expired explosion particles
        particle.explosionParticles = particle.explosionParticles.filter((p) => p.life < p.maxLife)
      }

      if (particle.isRainbow) {
        ctx.shadowColor = `hsl(${particle.rainbowHue}, 100%, 70%)`
        ctx.shadowBlur = 10
        ctx.fill()
        ctx.shadowBlur = 0
      }
    })
  }

  const renderParticles = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, mixOpacity = 1) => {
    particles.forEach((particle) => {
      // Update particle life
      particle.life += 1
      if (particle.life >= particle.maxLife && getCurrentMouseEffect() !== "seguir") {
        particle.life = 0
        particle.x = Math.random() * canvas.width
        particle.y = Math.random() * canvas.height
        particle.opacity = Math.random() * 0.8 + 0.2
      }

      // Update position
      if (!particle.followingMouse || getCurrentMouseEffect() !== "seguir") {
        particle.x += particle.vx
        particle.y += particle.vy
      }

      // Fade based on life
      if (getCurrentMouseEffect() !== "seguir") {
        const lifeRatio = particle.life / particle.maxLife
        particle.opacity = (1 - lifeRatio) * 0.8 + 0.2
      }

      // Mouse interaction
      if (mouseEffectsEnabled && getCurrentMouseEffect() !== "none") {
        const dx = mousePos.x - particle.x
        const dy = mousePos.y - particle.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (getCurrentMouseEffect() === "seguir" || distance < 200) {
          handleMouseEffect(particle, dx, dy, distance)
        }
      }

      // Draw particle
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)

      if (particle.isRainbow && particle.rainbowHue !== undefined) {
        const gradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.size * 2)
        gradient.addColorStop(0, `hsl(${particle.rainbowHue}, 100%, 70%)`)
        gradient.addColorStop(1, `hsl(${(particle.rainbowHue + 60) % 360}, 100%, 50%)`)
        ctx.fillStyle = gradient
      } else {
        ctx.fillStyle = `rgba(${particle.color}, ${particle.opacity * mixOpacity})`
      }

      ctx.fill()

      if (particle.isRainbow) {
        ctx.shadowColor = `hsl(${particle.rainbowHue}, 100%, 70%)`
        ctx.shadowBlur = 10
        ctx.fill()
        ctx.shadowBlur = 0
      }
    })
  }

  const renderWaves = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, mixOpacity = 1) => {
    const time = timeRef.current

    // Se estiver no modo seguir, as ondas seguem o mouse
    let waveOffset = 0
    if (getCurrentMouseEffect() === "seguir") {
      waveOffset = (mousePos.x / canvas.width) * 200
    }

    ctx.strokeStyle = `rgba(${isDark ? "255, 255, 255" : "0, 0, 0"}, ${0.3 * mixOpacity})`
    ctx.lineWidth = 2

    for (let i = 0; i < 8; i++) {
      ctx.beginPath()
      for (let x = 0; x < canvas.width; x += 8) {
        let y = canvas.height / 2 + Math.sin((x + time * 100 + i * 50 + waveOffset) * 0.01) * (50 + i * 10)

        // Se estiver seguindo o mouse, inclinar as ondas em direção ao mouse
        if (getCurrentMouseEffect() === "seguir") {
          const mouseInfluence = (mousePos.y - canvas.height / 2) * 0.3
          y += mouseInfluence * Math.sin(x * 0.01 + time)
        }

        if (x === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.stroke()
    }
  }

  const renderGeometric = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, mixOpacity = 1) => {
    const time = timeRef.current
    particles.forEach((particle, index) => {
      const rotation = time + index * 0.5

      // Update position
      if (!particle.followingMouse || getCurrentMouseEffect() !== "seguir") {
        particle.x += particle.vx
        particle.y += particle.vy

        // Bounce off edges
        if (particle.x <= 0 || particle.x >= canvas.width) particle.vx *= -1
        if (particle.y <= 0 || particle.y >= canvas.height) particle.vy *= -1
      }

      // Mouse interaction
      if (mouseEffectsEnabled && getCurrentMouseEffect() !== "none") {
        const dx = mousePos.x - particle.x
        const dy = mousePos.y - particle.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (getCurrentMouseEffect() === "seguir" || distance < 200) {
          handleMouseEffect(particle, dx, dy, distance)
        }
      }

      ctx.save()
      ctx.translate(particle.x, particle.y)
      ctx.rotate(rotation)

      // Draw different geometric shapes
      const shapeType = index % 4

      if (particle.isRainbow && particle.rainbowHue !== undefined) {
        ctx.strokeStyle = `hsl(${particle.rainbowHue}, 100%, 70%)`
        ctx.shadowColor = `hsl(${particle.rainbowHue}, 100%, 70%)`
        ctx.shadowBlur = 5
      } else {
        ctx.strokeStyle = `rgba(${particle.color}, ${particle.opacity * mixOpacity})`
      }

      ctx.lineWidth = 2

      switch (shapeType) {
        case 0: // Rectangle
          ctx.strokeRect(-particle.size, -particle.size, particle.size * 2, particle.size * 2)
          break
        case 1: // Triangle
          ctx.beginPath()
          ctx.moveTo(0, -particle.size)
          ctx.lineTo(-particle.size, particle.size)
          ctx.lineTo(particle.size, particle.size)
          ctx.closePath()
          ctx.stroke()
          break
        case 2: // Hexagon
          ctx.beginPath()
          for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3
            const x = particle.size * Math.cos(angle)
            const y = particle.size * Math.sin(angle)
            if (i === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
          }
          ctx.closePath()
          ctx.stroke()
          break
        case 3: // Diamond
          ctx.beginPath()
          ctx.moveTo(0, -particle.size)
          ctx.lineTo(particle.size, 0)
          ctx.lineTo(0, particle.size)
          ctx.lineTo(-particle.size, 0)
          ctx.closePath()
          ctx.stroke()
          break
      }

      ctx.shadowBlur = 0
      ctx.restore()
    })
  }

  const renderNeural = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, mixOpacity = 1) => {
    // Draw connections first
    ctx.strokeStyle = `rgba(${isDark ? "255, 255, 255" : "0, 0, 0"}, ${0.2 * mixOpacity})`
    ctx.lineWidth = 1

    particles.forEach((particle, i) => {
      particles.slice(i + 1).forEach((otherParticle) => {
        const dx = particle.x - otherParticle.x
        const dy = particle.y - otherParticle.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < 120) {
          ctx.beginPath()
          ctx.moveTo(particle.x, particle.y)
          ctx.lineTo(otherParticle.x, otherParticle.y)
          ctx.stroke()
        }
      })
    })

    // Draw nodes
    particles.forEach((particle) => {
      if (!particle.followingMouse || getCurrentMouseEffect() !== "seguir") {
        particle.x += particle.vx
        particle.y += particle.vy

        // Bounce off edges
        if (particle.x <= 0 || particle.x >= canvas.width) particle.vx *= -1
        if (particle.y <= 0 || particle.y >= canvas.height) particle.vy *= -1
      }

      // Mouse interaction
      if (mouseEffectsEnabled && getCurrentMouseEffect() !== "none") {
        const dx = mousePos.x - particle.x
        const dy = mousePos.y - particle.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (getCurrentMouseEffect() === "seguir" || distance < 200) {
          handleMouseEffect(particle, dx, dy, distance)
        }
      }

      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)

      if (particle.isRainbow && particle.rainbowHue !== undefined) {
        const gradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.size * 2)
        gradient.addColorStop(0, `hsl(${particle.rainbowHue}, 100%, 70%)`)
        gradient.addColorStop(1, `hsl(${(particle.rainbowHue + 60) % 360}, 100%, 50%)`)
        ctx.fillStyle = gradient
      } else {
        ctx.fillStyle = `rgba(${particle.color}, ${particle.opacity * mixOpacity})`
      }

      ctx.fill()

      if (particle.isRainbow) {
        ctx.shadowColor = `hsl(${particle.rainbowHue}, 100%, 70%)`
        ctx.shadowBlur = 10
        ctx.fill()
        ctx.shadowBlur = 0
      }
    })
  }

  const renderMatrix = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, mixOpacity = 1) => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン".split(
        "",
      )

    matrixChars.forEach((matrixChar) => {
      // Handle following mouse effect
      handleMatrixFollow(matrixChar)

      // Update position (only if not following mouse)
      if (!matrixChar.followingMouse) {
        matrixChar.y += matrixChar.speed

        // Reset when off screen
        if (matrixChar.y > canvas.height) {
          matrixChar.y = -20
          matrixChar.char = chars[Math.floor(Math.random() * chars.length)]
          matrixChar.opacity = 1
        }

        // Fade as it falls
        matrixChar.opacity *= 0.98
      }

      // Draw character
      ctx.fillStyle = `rgba(0, 255, 0, ${matrixChar.opacity * mixOpacity})`
      ctx.font = "14px monospace"
      ctx.fillText(matrixChar.char, matrixChar.x, matrixChar.y)

      // Random character change
      if (Math.random() < 0.03) {
        matrixChar.char = chars[Math.floor(Math.random() * chars.length)]
      }
    })
  }

  const renderSpiral = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, mixOpacity = 1) => {
    const time = timeRef.current
    let centerX = canvas.width / 2
    let centerY = canvas.height / 2

    // Se estiver seguindo o mouse, o centro da espiral segue o mouse
    if (getCurrentMouseEffect() === "seguir") {
      centerX = mousePos.x
      centerY = mousePos.y
    }

    particles.forEach((particle, index) => {
      // Spiral motion
      particle.angle = (particle.angle || 0) + 0.02
      // Ensure radius is always positive with a minimum value
      const radius = Math.max(5, 50 + index * 3)
      const spiralX = centerX + Math.cos(particle.angle + time * 0.5) * radius
      const spiralY = centerY + Math.sin(particle.angle + time * 0.5) * radius

      particle.x = spiralX
      particle.y = spiralY

      // Mouse interaction
      if (mouseEffectsEnabled && getCurrentMouseEffect() !== "none") {
        const dx = mousePos.x - particle.x
        const dy = mousePos.y - particle.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (getCurrentMouseEffect() === "seguir" || distance < 200) {
          handleMouseEffect(particle, dx, dy, distance)
        }
      }

      // Draw particle with trail
      if (!particle.trail) particle.trail = []
      particle.trail.push({ x: particle.x, y: particle.y, opacity: particle.opacity })
      if (particle.trail.length > 15) particle.trail.shift()

      // Draw trail
      particle.trail.forEach((point, i) => {
        // Ensure trail size is always positive
        const trailSize = Math.max(0.1, particle.size * (i / particle.trail!.length))
        const trailOpacity = (i / particle.trail!.length) * particle.opacity * mixOpacity

        ctx.beginPath()
        ctx.arc(point.x, point.y, trailSize, 0, Math.PI * 2)

        if (particle.isRainbow && particle.rainbowHue !== undefined) {
          ctx.fillStyle = `hsl(${(particle.rainbowHue + i * 10) % 360}, 100%, 70%)`
        } else {
          ctx.fillStyle = `rgba(${particle.color}, ${trailOpacity})`
        }

        ctx.fill()
      })

      // Draw main particle
      ctx.beginPath()
      // Ensure particle size is always positive
      const particleSize = Math.max(0.1, particle.size)
      ctx.arc(particle.x, particle.y, particleSize, 0, Math.PI * 2)

      if (particle.isRainbow && particle.rainbowHue !== undefined) {
        const gradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particleSize * 2)
        gradient.addColorStop(0, `hsl(${particle.rainbowHue}, 100%, 70%)`)
        gradient.addColorStop(1, `hsl(${(particle.rainbowHue + 60) % 360}, 100%, 50%)`)
        ctx.fillStyle = gradient
      } else {
        ctx.fillStyle = `rgba(${particle.color}, ${particle.opacity * mixOpacity})`
      }

      ctx.fill()

      if (particle.isRainbow) {
        ctx.shadowColor = `hsl(${particle.rainbowHue}, 100%, 70%)`
        ctx.shadowBlur = 10
        ctx.fill()
        ctx.shadowBlur = 0
      }
    })
  }

  const renderConstellation = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, mixOpacity = 1) => {
    const time = timeRef.current

    // Draw connections between nearby particles
    ctx.strokeStyle = `rgba(${isDark ? "255, 255, 255" : "0, 0, 0"}, ${0.3 * mixOpacity})`
    ctx.lineWidth = 1

    particles.forEach((particle, i) => {
      particles.slice(i + 1).forEach((otherParticle) => {
        const dx = particle.x - otherParticle.x
        const dy = particle.y - otherParticle.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < 100) {
          const opacity = (100 - distance) / 100

          if (particle.isRainbow && particle.rainbowHue !== undefined) {
            ctx.strokeStyle = `hsl(${particle.rainbowHue}, 100%, 70%)`
          } else {
            ctx.strokeStyle = `rgba(${isDark ? "255, 255, 255" : "0, 0, 0"}, ${opacity * 0.5 * mixOpacity})`
          }

          ctx.beginPath()
          ctx.moveTo(particle.x, particle.y)
          ctx.lineTo(otherParticle.x, otherParticle.y)
          ctx.stroke()
        }
      })
    })

    // Draw stars (particles)
    particles.forEach((particle, index) => {
      // Gentle floating motion (only if not following mouse)
      if (!particle.followingMouse || getCurrentMouseEffect() !== "seguir") {
        particle.x += Math.sin(time * 0.5 + index) * 0.5
        particle.y += Math.cos(time * 0.3 + index) * 0.3

        // Keep within bounds
        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0
      }

      // Twinkling effect
      particle.opacity = 0.5 + Math.sin(time * 2 + index) * 0.3

      // Mouse interaction
      if (mouseEffectsEnabled && getCurrentMouseEffect() !== "none") {
        const dx = mousePos.x - particle.x
        const dy = mousePos.y - particle.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (getCurrentMouseEffect() === "seguir" || distance < 200) {
          handleMouseEffect(particle, dx, dy, distance)
        }
      }

      // Draw star shape
      ctx.save()
      ctx.translate(particle.x, particle.y)
      ctx.rotate(time * 0.1 + index)

      if (particle.isRainbow && particle.rainbowHue !== undefined) {
        ctx.fillStyle = `hsl(${particle.rainbowHue}, 100%, 70%)`
        ctx.shadowColor = `hsl(${particle.rainbowHue}, 100%, 70%)`
        ctx.shadowBlur = 10
      } else {
        ctx.fillStyle = `rgba(${particle.color}, ${particle.opacity * mixOpacity})`
      }

      ctx.beginPath()

      // Ensure particle size is always positive
      const starSize = Math.max(0.1, particle.size)
      const innerRadius = Math.max(0.05, starSize * 0.4)

      // Draw 5-pointed star
      for (let i = 0; i < 5; i++) {
        const angle = (i * Math.PI * 2) / 5
        const outerRadius = starSize

        const outerX = Math.cos(angle) * outerRadius
        const outerY = Math.sin(angle) * outerRadius
        const innerX = Math.cos(angle + Math.PI / 5) * innerRadius
        const innerY = Math.sin(angle + Math.PI / 5) * innerRadius

        if (i === 0) {
          ctx.moveTo(outerX, outerY)
        } else {
          ctx.lineTo(outerX, outerY)
        }
        ctx.lineTo(innerX, innerY)
      }

      ctx.closePath()
      ctx.fill()
      ctx.shadowBlur = 0
      ctx.restore()
    })
  }

  return (
    <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" style={{ background: "transparent" }} />
  )
}
