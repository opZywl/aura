"use client"

import { useEffect, useRef } from "react"
import { useMobile } from "@/hooks/use-mobile"

export default function WaveDotsBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>(0)
  const isMobile = useMobile()
  const mouseRef = useRef({ x: 0, y: 0 })
  const scrollYRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Configuración
    let dots: Dot[] = []
    let time = 0
    const dotBaseSize = isMobile ? 1 : 1.5
    const perspective = 500 // Controla la intensidad del efecto de perspectiva
    const depth = 1000 // Profundidad máxima del espacio 3D
    const waveSpeed = 0.5 // Velocidad de las ondas
    const waveHeight = 150 // Altura máxima de las ondas

    // Función para actualizar el tamaño del canvas
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initDots()
    }

    // Inicializar los puntos en un espacio 3D
    const initDots = () => {
      dots = []
      const totalDots = isMobile ? 1500 : 3000 // Cantidad de puntos

      // Crear puntos distribuidos en un espacio 3D
      for (let i = 0; i < totalDots; i++) {
        // Posición aleatoria en el espacio
        const x = (Math.random() * 2 - 1) * canvas.width * 1.5
        const y = (Math.random() * 2 - 1) * canvas.height * 1.5
        const z = Math.random() * depth

        // Velocidad de movimiento individual
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

    // Proyectar un punto 3D en el espacio 2D del canvas
    const project = (x: number, y: number, z: number): [number, number, number] => {
      // Factor de escala basado en la profundidad
      const scale = perspective / (perspective + z)

      // Coordenadas proyectadas
      const projectedX = x * scale + canvas.width / 2
      const projectedY = y * scale + canvas.height / 2

      // Devolver coordenadas proyectadas y escala (para tamaño)
      return [projectedX, projectedY, scale]
    }

    // Función para dibujar los puntos
    const drawDots = () => {
      if (!ctx || !canvas) return

      // Limpiar el canvas
      ctx.fillStyle = "black"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Actualizar el tiempo
      time += 0.01

      // Calcular la posición del mouse relativa al canvas
      const mouseX = mouseRef.current.x - canvas.width / 2
      const mouseY = mouseRef.current.y - canvas.height / 2

      // Ordenar los puntos por profundidad (z) para dibujar de atrás hacia adelante
      const sortedDots = [...dots].sort((a, b) => b.z - a.z)

      // Actualizar y dibujar cada punto
      for (const dot of sortedDots) {
        // Calcular ondas en función del tiempo y la posición
        const waveX = Math.sin((dot.originalX * 0.01 + time * waveSpeed) * dot.speedFactor) * waveHeight
        const waveY = Math.cos((dot.originalY * 0.01 + time * waveSpeed * 0.8) * dot.speedFactor) * waveHeight
        const waveZ =
          Math.sin((dot.originalX * 0.01 + dot.originalY * 0.01 + time * waveSpeed * 1.2) * dot.speedFactor) *
          waveHeight *
          0.5

        // Aplicar ondas a la posición
        const newX = dot.originalX + waveX
        const newY = dot.originalY + waveY
        const newZ = dot.originalZ + waveZ

        // Efecto de interacción con el mouse
        const dx = newX - mouseX
        const dy = newY - mouseY
        const distance = Math.sqrt(dx * dx + dy * dy)
        const maxDistance = 300

        let interactiveZ = newZ
        if (distance < maxDistance) {
          const factor = 1 - distance / maxDistance
          interactiveZ -= factor * 200 // Crear un "valle" donde está el cursor
        }

        // Aplicar efecto de scroll
        const scrollEffect = scrollYRef.current * 0.5
        interactiveZ += Math.sin((newY * 0.005 + scrollEffect * 0.01) * dot.speedFactor) * waveHeight * 0.3

        // Proyectar el punto 3D a 2D
        const [projectedX, projectedY, scale] = project(newX, newY, interactiveZ)

        // Solo dibujar puntos visibles en el canvas
        if (projectedX > -50 && projectedX < canvas.width + 50 && projectedY > -50 && projectedY < canvas.height + 50) {
          // Calcular tamaño y opacidad basados en la profundidad
          const size = dot.size * scale * 1.5
          const opacity = 0.2 + scale * 0.8 // Más brillante cuando está más cerca

          // Dibujar el punto
          ctx.beginPath()
          ctx.arc(projectedX, projectedY, size, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
          ctx.fill()
        }
      }
    }

    // Función de animación
    const animate = () => {
      drawDots()
      animationRef.current = requestAnimationFrame(animate)
    }

    // Manejar eventos del mouse
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    // Manejar eventos de scroll
    const handleScroll = () => {
      scrollYRef.current = window.scrollY
    }

    // Inicializar
    updateCanvasSize()
    animate()

    // Agregar event listeners
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("resize", updateCanvasSize)
    window.addEventListener("scroll", handleScroll)

    // Limpiar
    return () => {
      cancelAnimationFrame(animationRef.current)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("resize", updateCanvasSize)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [isMobile])

  return (
    <div ref={containerRef} className="fixed inset-0 z-0 overflow-hidden bg-black">
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Gradiente sutil para mejorar la legibilidad del contenido */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70 z-10"></div>
    </div>
  )
}

// Tipos
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
