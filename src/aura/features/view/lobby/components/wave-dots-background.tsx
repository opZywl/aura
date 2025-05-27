"use client"

import { useEffect, useRef } from "react"

// Define the Dot interface directly in the file or import if it's shared
interface Dot {
  x: number
  y: number
  z: number
  originalX: number
  originalY: number
  originalZ: number
  speedFactor: number
  size: number
}

export default function WaveDotsBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>(0)
  const mouseRef = useRef({ x: 0, y: 0 })
  const scrollYRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Configuration
    let dots: Dot[] = []
    let time = 0
    // Removed isMobile, using a single value for dotBaseSize
    const dotBaseSize = 1.5
    const perspective = 500 // Controls the intensity of the perspective effect
    const depth = 1000 // Maximum depth of the 3D space
    const waveSpeed = 0.5 // Speed of the waves
    const waveHeight = 150 // Maximum height of the waves

    // Function to update canvas size
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initDots()
    }

    // Initialize dots in a 3D space
    const initDots = () => {
      dots = []
      // Removed isMobile, using a single value for totalDots
      const totalDots = 3000 // Number of dots

      // Create dots distributed in a 3D space
      for (let i = 0; i < totalDots; i++) {
        // Random position in space
        const x = (Math.random() * 2 - 1) * canvas.width * 1.5
        const y = (Math.random() * 2 - 1) * canvas.height * 1.5
        const z = Math.random() * depth

        // Individual movement speed
        const speedFactor = 0.2 + Math.random() * 0.8

        dots.push({
          x,
          y,
          z,
          originalX: x,
          originalY: y,
          originalZ: z,
          speedFactor,
          size: dotBaseSize * (0.5 + Math.random() * 0.5),
        })
      }
    }

    // Project a 3D point into the 2D canvas space
    const project = (x: number, y: number, z: number): [number, number, number] => {
      // Scale factor based on depth
      const scale = perspective / (perspective + z)

      // Projected coordinates
      const projectedX = x * scale + canvas.width / 2
      const projectedY = y * scale + canvas.height / 2

      // Return projected coordinates and scale (for size)
      return [projectedX, projectedY, scale]
    }

    // Function to draw the dots
    const drawDots = () => {
      if (!ctx || !canvas) return

      // Clear the canvas
      ctx.fillStyle = "black"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update time
      time += 0.01

      // Calculate mouse position relative to the canvas
      const mouseX = mouseRef.current.x - canvas.width / 2
      const mouseY = mouseRef.current.y - canvas.height / 2

      // Sort dots by depth (z) to draw from back to front
      const sortedDots = [...dots].sort((a, b) => b.z - a.z)

      // Update and draw each dot
      for (const dot of sortedDots) {
        // Calculate waves based on time and position
        const waveX = Math.sin((dot.originalX * 0.01 + time * waveSpeed) * dot.speedFactor) * waveHeight
        const waveY = Math.cos((dot.originalY * 0.01 + time * waveSpeed * 0.8) * dot.speedFactor) * waveHeight
        const waveZ =
            Math.sin((dot.originalX * 0.01 + dot.originalY * 0.01 + time * waveSpeed * 1.2) * dot.speedFactor) *
            waveHeight *
            0.5

        // Apply waves to the position
        const newX = dot.originalX + waveX
        const newY = dot.originalY + waveY
        const newZ = dot.originalZ + waveZ

        // Mouse interaction effect
        const dx = newX - mouseX
        const dy = newY - mouseY
        const distance = Math.sqrt(dx * dx + dy * dy)
        const maxDistance = 300

        let interactiveZ = newZ
        if (distance < maxDistance) {
          const factor = 1 - distance / maxDistance
          interactiveZ -= factor * 200 // Create a "valley" where the cursor is
        }

        // Apply scroll effect
        const scrollEffect = scrollYRef.current * 0.5
        interactiveZ += Math.sin((newY * 0.005 + scrollEffect * 0.01) * dot.speedFactor) * waveHeight * 0.3

        // Project the 3D point to 2D
        const [projectedX, projectedY, scale] = project(newX, newY, interactiveZ)

        // Only draw visible dots on the canvas
        if (projectedX > -50 && projectedX < canvas.width + 50 && projectedY > -50 && projectedY < canvas.height + 50) {
          // Calculate size and opacity based on depth
          const size = dot.size * scale * 1.5
          const opacity = 0.2 + scale * 0.8 // Brighter when closer

          // Draw the dot
          ctx.beginPath()
          ctx.arc(projectedX, projectedY, size, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
          ctx.fill()
        }
      }
    }

    // Animation function
    const animate = () => {
      drawDots()
      animationRef.current = requestAnimationFrame(animate)
    }

    // Handle mouse events
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    // Handle scroll events
    const handleScroll = () => {
      scrollYRef.current = window.scrollY
    }

    // Initialize
    updateCanvasSize()
    animate()

    // Add event listeners
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("resize", updateCanvasSize)
    window.addEventListener("scroll", handleScroll)

    // Cleanup
    return () => {
      cancelAnimationFrame(animationRef.current)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("resize", updateCanvasSize)
      window.removeEventListener("scroll", handleScroll)
    }
  }, []) // Removed isMobile from dependencies

  return (
      <div ref={containerRef} className="fixed inset-0 z-0 overflow-hidden bg-black">
        <canvas ref={canvasRef} className="absolute inset-0" />

        {/* Subtle gradient to improve content readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70 z-10"></div>
      </div>
  )
}