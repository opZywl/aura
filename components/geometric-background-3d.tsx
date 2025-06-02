"use client"

import { useEffect, useRef, useState } from "react"
import { useMobile } from "@/hooks/use-mobile"

// Definición de tipos
interface Shape {
  type: "pyramid" | "prism" | "cube"
  x: number
  y: number
  z: number
  size: number
  rotationX: number
  rotationY: number
  rotationZ: number
  rotationSpeedX: number
  rotationSpeedY: number
  rotationSpeedZ: number
  color: string
  secondaryColor: string
  vertices: Point3D[]
  faces: Face[]
  velocityX: number
  velocityY: number
  velocityZ: number
  interactive: boolean
}

interface Point3D {
  x: number
  y: number
  z: number
}

interface Point2D {
  x: number
  y: number
}

interface Face {
  vertices: number[]
  color: string
}

export default function GeometricBackground3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const shapesRef = useRef<Shape[]>([])
  const animationRef = useRef<number>(0)
  const isMobile = useMobile()
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const scrollYRef = useRef(0)

  // Función para crear un color aleatorio en la paleta azul-púrpura
  const getRandomColor = () => {
    const colors = [
      // Azules
      "rgba(25, 118, 210, 0.8)",
      "rgba(66, 165, 245, 0.8)",
      "rgba(41, 121, 255, 0.8)",
      "rgba(30, 136, 229, 0.8)",
      // Púrpuras
      "rgba(123, 31, 162, 0.8)",
      "rgba(156, 39, 176, 0.8)",
      "rgba(186, 104, 200, 0.8)",
      "rgba(171, 71, 188, 0.8)",
      // Cian
      "rgba(0, 188, 212, 0.8)",
      "rgba(0, 229, 255, 0.8)",
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  // Función para crear un gradiente de color
  const createGradientColor = (baseColor: string) => {
    // Extraer los componentes RGB del color base
    const rgbaMatch = baseColor.match(/rgba$$(\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)$$/)
    if (!rgbaMatch) return baseColor

    const r = Number.parseInt(rgbaMatch[1])
    const g = Number.parseInt(rgbaMatch[2])
    const b = Number.parseInt(rgbaMatch[3])
    const a = Number.parseFloat(rgbaMatch[4])

    // Crear una variación más oscura para el gradiente
    const darkenFactor = 0.7
    const r2 = Math.floor(r * darkenFactor)
    const g2 = Math.floor(g * darkenFactor)
    const b2 = Math.floor(b * darkenFactor)

    return `rgba(${r2}, ${g2}, ${b2}, ${a})`
  }

  // Función para crear vértices de un cubo
  const createCubeVertices = (size: number): Point3D[] => {
    const halfSize = size / 2
    return [
      { x: -halfSize, y: -halfSize, z: -halfSize }, // 0: Esquina frontal inferior izquierda
      { x: halfSize, y: -halfSize, z: -halfSize }, // 1: Esquina frontal inferior derecha
      { x: halfSize, y: halfSize, z: -halfSize }, // 2: Esquina frontal superior derecha
      { x: -halfSize, y: halfSize, z: -halfSize }, // 3: Esquina frontal superior izquierda
      { x: -halfSize, y: -halfSize, z: halfSize }, // 4: Esquina trasera inferior izquierda
      { x: halfSize, y: -halfSize, z: halfSize }, // 5: Esquina trasera inferior derecha
      { x: halfSize, y: halfSize, z: halfSize }, // 6: Esquina trasera superior derecha
      { x: -halfSize, y: halfSize, z: halfSize }, // 7: Esquina trasera superior izquierda
    ]
  }

  // Función para crear vértices de una pirámide
  const createPyramidVertices = (size: number): Point3D[] => {
    const halfSize = size / 2
    return [
      { x: 0, y: -halfSize, z: 0 }, // 0: Punta
      { x: -halfSize, y: halfSize, z: -halfSize }, // 1: Base frontal izquierda
      { x: halfSize, y: halfSize, z: -halfSize }, // 2: Base frontal derecha
      { x: halfSize, y: halfSize, z: halfSize }, // 3: Base trasera derecha
      { x: -halfSize, y: halfSize, z: halfSize }, // 4: Base trasera izquierda
    ]
  }

  // Función para crear vértices de un prisma
  const createPrismVertices = (size: number): Point3D[] => {
    const halfSize = size / 2
    const height = size * 1.5
    return [
      // Base inferior
      { x: -halfSize, y: -height / 2, z: -halfSize }, // 0
      { x: halfSize, y: -height / 2, z: -halfSize }, // 1
      { x: halfSize, y: -height / 2, z: halfSize }, // 2
      { x: -halfSize, y: -height / 2, z: halfSize }, // 3
      // Base superior
      { x: -halfSize, y: height / 2, z: -halfSize }, // 4
      { x: halfSize, y: height / 2, z: -halfSize }, // 5
      { x: halfSize, y: height / 2, z: halfSize }, // 6
      { x: -halfSize, y: height / 2, z: halfSize }, // 7
    ]
  }

  // Función para crear caras de un cubo
  const createCubeFaces = (color: string, secondaryColor: string): Face[] => {
    return [
      { vertices: [0, 1, 2, 3], color }, // Frente
      { vertices: [1, 5, 6, 2], color: secondaryColor }, // Derecha
      { vertices: [5, 4, 7, 6], color }, // Atrás
      { vertices: [4, 0, 3, 7], color: secondaryColor }, // Izquierda
      { vertices: [3, 2, 6, 7], color }, // Arriba
      { vertices: [4, 5, 1, 0], color: secondaryColor }, // Abajo
    ]
  }

  // Función para crear caras de una pirámide
  const createPyramidFaces = (color: string, secondaryColor: string): Face[] => {
    return [
      { vertices: [0, 1, 2], color }, // Cara frontal
      { vertices: [0, 2, 3], color: secondaryColor }, // Cara derecha
      { vertices: [0, 3, 4], color }, // Cara trasera
      { vertices: [0, 4, 1], color: secondaryColor }, // Cara izquierda
      { vertices: [1, 4, 3, 2], color }, // Base
    ]
  }

  // Función para crear caras de un prisma
  const createPrismFaces = (color: string, secondaryColor: string): Face[] => {
    return [
      { vertices: [0, 1, 5, 4], color }, // Frente
      { vertices: [1, 2, 6, 5], color: secondaryColor }, // Derecha
      { vertices: [2, 3, 7, 6], color }, // Atrás
      { vertices: [3, 0, 4, 7], color: secondaryColor }, // Izquierda
      { vertices: [4, 5, 6, 7], color }, // Arriba
      { vertices: [3, 2, 1, 0], color: secondaryColor }, // Abajo
    ]
  }

  // Función para crear una forma geométrica
  const createShape = (
    type: "pyramid" | "prism" | "cube",
    x: number,
    y: number,
    z: number,
    size: number,
    interactive = false,
  ): Shape => {
    const color = getRandomColor()
    const secondaryColor = createGradientColor(color)

    let vertices: Point3D[] = []
    let faces: Face[] = []

    if (type === "cube") {
      vertices = createCubeVertices(size)
      faces = createCubeFaces(color, secondaryColor)
    } else if (type === "pyramid") {
      vertices = createPyramidVertices(size)
      faces = createPyramidFaces(color, secondaryColor)
    } else if (type === "prism") {
      vertices = createPrismVertices(size)
      faces = createPrismFaces(color, secondaryColor)
    }

    return {
      type,
      x,
      y,
      z,
      size,
      rotationX: Math.random() * Math.PI * 2,
      rotationY: Math.random() * Math.PI * 2,
      rotationZ: Math.random() * Math.PI * 2,
      rotationSpeedX: (Math.random() - 0.5) * 0.01,
      rotationSpeedY: (Math.random() - 0.5) * 0.01,
      rotationSpeedZ: (Math.random() - 0.5) * 0.01,
      color,
      secondaryColor,
      vertices,
      faces,
      velocityX: (Math.random() - 0.5) * 0.2,
      velocityY: (Math.random() - 0.5) * 0.2,
      velocityZ: (Math.random() - 0.5) * 0.2,
      interactive,
    }
  }

  // Función para inicializar las formas
  const initShapes = (width: number, height: number, depth: number) => {
    const shapes: Shape[] = []
    const shapeCount = isMobile ? 15 : 30

    for (let i = 0; i < shapeCount; i++) {
      const size = Math.random() * 50 + 30
      const x = Math.random() * width - width / 2
      const y = Math.random() * height - height / 2
      const z = Math.random() * depth - depth / 2

      // Determinar el tipo de forma
      const shapeTypes: ("pyramid" | "prism" | "cube")[] = ["pyramid", "prism", "cube"]
      const type = shapeTypes[Math.floor(Math.random() * shapeTypes.length)]

      // Algunas formas serán interactivas
      const interactive = Math.random() > 0.7

      shapes.push(createShape(type, x, y, z, size, interactive))
    }

    return shapes
  }

  // Función para rotar un punto en 3D
  const rotatePoint = (point: Point3D, rotX: number, rotY: number, rotZ: number): Point3D => {
    const { x, y, z } = point

    // Rotación en X
    const cosX = Math.cos(rotX)
    const sinX = Math.sin(rotX)
    const y1 = y * cosX - z * sinX
    const z1 = y * sinX + z * cosX

    // Rotación en Y
    const cosY = Math.cos(rotY)
    const sinY = Math.sin(rotY)
    const x2 = x * cosY + z1 * sinY
    const z2 = -x * sinY + z1 * cosY

    // Rotación en Z
    const cosZ = Math.cos(rotZ)
    const sinZ = Math.sin(rotZ)
    const x3 = x2 * cosZ - y1 * sinZ
    const y3 = x2 * sinZ + y1 * cosZ

    return { x: x3, y: y3, z: z2 }
  }

  // Función para proyectar un punto 3D en 2D
  const projectPoint = (point: Point3D, shape: Shape, cameraZ: number, width: number, height: number): Point2D => {
    // Aplicar la posición de la forma
    const x = point.x + shape.x
    const y = point.y + shape.y
    const z = point.z + shape.z

    // Proyección simple
    const scale = cameraZ / (cameraZ + z)
    const projectedX = x * scale + width / 2
    const projectedY = y * scale + height / 2

    return { x: projectedX, y: projectedY }
  }

  // Función para ordenar las formas por profundidad (para renderizar de atrás hacia adelante)
  const sortShapesByDepth = (shapes: Shape[]): Shape[] => {
    return [...shapes].sort((a, b) => b.z - a.z)
  }

  // Función para ordenar las caras por profundidad dentro de una forma
  const sortFacesByDepth = (shape: Shape): { face: Face; avgZ: number }[] => {
    return shape.faces
      .map((face) => {
        // Calcular el centro de la cara
        let sumZ = 0
        for (const vertexIndex of face.vertices) {
          const vertex = shape.vertices[vertexIndex]
          const rotatedVertex = rotatePoint(vertex, shape.rotationX, shape.rotationY, shape.rotationZ)
          sumZ += rotatedVertex.z
        }
        const avgZ = sumZ / face.vertices.length
        return { face, avgZ }
      })
      .sort((a, b) => a.avgZ - b.avgZ) // Ordenar de atrás hacia adelante
  }

  // Función para dibujar una forma
  const drawShape = (ctx: CanvasRenderingContext2D, shape: Shape, cameraZ: number, width: number, height: number) => {
    // Ordenar las caras por profundidad
    const sortedFaces = sortFacesByDepth(shape)

    // Dibujar cada cara
    for (const { face } of sortedFaces) {
      if (face.vertices.length < 3) continue

      // Proyectar los vértices de la cara
      const projectedVertices = face.vertices.map((vertexIndex) => {
        const vertex = shape.vertices[vertexIndex]
        const rotatedVertex = rotatePoint(vertex, shape.rotationX, shape.rotationY, shape.rotationZ)
        return projectPoint(rotatedVertex, shape, cameraZ, width, height)
      })

      // Dibujar la cara
      ctx.beginPath()
      ctx.moveTo(projectedVertices[0].x, projectedVertices[0].y)
      for (let i = 1; i < projectedVertices.length; i++) {
        ctx.lineTo(projectedVertices[i].x, projectedVertices[i].y)
      }
      ctx.closePath()

      // Aplicar color con gradiente
      const gradient = ctx.createLinearGradient(
        projectedVertices[0].x,
        projectedVertices[0].y,
        projectedVertices[projectedVertices.length - 1].x,
        projectedVertices[projectedVertices.length - 1].y,
      )
      gradient.addColorStop(0, face.color)
      gradient.addColorStop(1, shape.secondaryColor)
      ctx.fillStyle = gradient

      // Añadir sombra para efecto 3D
      ctx.shadowColor = "rgba(0, 0, 0, 0.3)"
      ctx.shadowBlur = 15
      ctx.shadowOffsetX = 5
      ctx.shadowOffsetY = 5

      ctx.fill()

      // Dibujar borde
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)"
      ctx.lineWidth = 0.5
      ctx.stroke()

      // Resetear sombra
      ctx.shadowColor = "transparent"
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
    }
  }

  // Función para actualizar las formas
  const updateShapes = (width: number, height: number, depth: number) => {
    for (const shape of shapesRef.current) {
      // Actualizar rotación
      shape.rotationX += shape.rotationSpeedX
      shape.rotationY += shape.rotationSpeedY
      shape.rotationZ += shape.rotationSpeedZ

      // Actualizar posición
      shape.x += shape.velocityX
      shape.y += shape.velocityY
      shape.z += shape.velocityZ

      // Aplicar efecto de scroll
      shape.y += scrollYRef.current * 0.01

      // Interactividad con el mouse para formas interactivas
      if (shape.interactive) {
        const dx = mousePosition.x - (shape.x + width / 2)
        const dy = mousePosition.y - (shape.y + height / 2)
        const distance = Math.sqrt(dx * dx + dy * dy)
        const maxDistance = 300

        if (distance < maxDistance) {
          const factor = 1 - distance / maxDistance
          shape.rotationSpeedX += factor * 0.001 * (Math.random() - 0.5)
          shape.rotationSpeedY += factor * 0.001 * (Math.random() - 0.5)
          shape.velocityX += dx * 0.0001 * factor
          shape.velocityY += dy * 0.0001 * factor
        }
      }

      // Límites del mundo
      const boundsX = width
      const boundsY = height
      const boundsZ = depth

      // Rebotar en los límites
      if (Math.abs(shape.x) > boundsX / 2) {
        shape.velocityX *= -1
        shape.x = (Math.sign(shape.x) * boundsX) / 2
      }
      if (Math.abs(shape.y) > boundsY / 2) {
        shape.velocityY *= -1
        shape.y = (Math.sign(shape.y) * boundsY) / 2
      }
      if (Math.abs(shape.z) > boundsZ / 2) {
        shape.velocityZ *= -1
        shape.z = (Math.sign(shape.z) * boundsZ) / 2
      }

      // Aplicar fricción
      shape.velocityX *= 0.99
      shape.velocityY *= 0.99
      shape.velocityZ *= 0.99

      // Limitar velocidades de rotación
      const maxRotationSpeed = 0.02
      shape.rotationSpeedX = Math.max(-maxRotationSpeed, Math.min(maxRotationSpeed, shape.rotationSpeedX))
      shape.rotationSpeedY = Math.max(-maxRotationSpeed, Math.min(maxRotationSpeed, shape.rotationSpeedY))
      shape.rotationSpeedZ = Math.max(-maxRotationSpeed, Math.min(maxRotationSpeed, shape.rotationSpeedZ))
    }
  }

  // Función principal de renderizado
  const render = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Configurar el mundo 3D
    const width = canvas.width
    const height = canvas.height
    const depth = 2000
    const cameraZ = 1000

    // Actualizar las formas
    updateShapes(width, height, depth)

    // Ordenar las formas por profundidad
    const sortedShapes = sortShapesByDepth(shapesRef.current)

    // Dibujar las formas
    for (const shape of sortedShapes) {
      drawShape(ctx, shape, cameraZ, width, height)
    }

    // Continuar la animación
    animationRef.current = requestAnimationFrame(render)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    // Configurar el tamaño del canvas
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    updateCanvasSize()

    // Inicializar las formas
    shapesRef.current = initShapes(canvas.width, canvas.height, 2000)

    // Manejar eventos del mouse
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)

    // Manejar eventos de scroll
    const handleScroll = () => {
      scrollYRef.current = window.scrollY
    }
    window.addEventListener("scroll", handleScroll)

    // Manejar eventos de redimensionamiento
    window.addEventListener("resize", updateCanvasSize)

    // Iniciar la animación
    animationRef.current = requestAnimationFrame(render)

    // Limpiar
    return () => {
      cancelAnimationFrame(animationRef.current)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", updateCanvasSize)
    }
  }, [isMobile])

  return (
    <div ref={containerRef} className="fixed inset-0 z-0 overflow-hidden bg-black">
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Gradiente de fondo */}
      <div className="absolute inset-0 bg-gradient-radial from-purple-900/20 via-blue-900/10 to-black z-0"></div>

      {/* Efecto de viñeta */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70 z-10"></div>

      {/* Efecto de ruido sutil */}
      <div
        className="absolute inset-0 opacity-5 z-5 pointer-events-none"
        style={{
          backgroundImage:
            "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')",
          backgroundRepeat: "repeat",
        }}
      ></div>
    </div>
  )
}
