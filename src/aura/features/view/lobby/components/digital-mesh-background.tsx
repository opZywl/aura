"use client"

import { useEffect, useRef } from "react"

export default function DigitalMeshBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const nodesRef = useRef<Node[]>([])
  const animationRef = useRef<number>(0)
  const scrollYRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Track scroll position
    const handleScroll = () => {
      scrollYRef.current = window.scrollY
    }
    window.addEventListener("scroll", handleScroll)

    // Set canvas dimensions
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    // Initialize nodes
    const initNodes = (): Node[] => {
      const nodeCount = 60
      const nodes: Node[] = []

      for (let i = 0; i < nodeCount; i++) {
        nodes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 1,
          color: getRandomColor(),
          connections: [],
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          vectorLength: Math.random() * 50 + 20,
          vectorAngle: Math.random() * Math.PI * 2,
          vectorRotationSpeed: (Math.random() - 0.5) * 0.01,
          isAnchor: Math.random() > 0.7,
        })
      }
      // Establish connections between nodes
      for (let i = 0; i < nodes.length; i++) {
        // If node is an anchor, connect it to more nodes
        const connectionsCount = nodes[i].isAnchor
          ? Math.floor(Math.random() * 5) + 3 // 3-7 connections for anchors
          : Math.floor(Math.random() * 2) + 1 // 1-2 connections for regular nodes

        const possibleConnections = [...Array(nodes.length).keys()]
          .filter((j) => j !== i)
          // Prefer closer nodes for more realistic graph appearance
          .sort(() => Math.random() - 0.5)

        for (let c = 0; c < Math.min(connectionsCount, possibleConnections.length); c++) {
          const connectionIndex = possibleConnections[c]
          nodes[i].connections.push(connectionIndex)
        }
      }

      return nodes
    }

    const getRandomColor = () => {
      const colors = [
        "rgba(192, 192, 192, 0.8)", // Silver
        "rgba(169, 169, 169, 0.8)", // Dark gray
        "rgba(211, 211, 211, 0.8)", // Light gray
        "rgba(220, 220, 220, 0.8)", // Gainsboro
      ]
      return colors[Math.floor(Math.random() * colors.length)]
    }

    const drawVectorGraph = () => {
      if (!ctx || !canvas) return

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Apply scroll offset
      const scrollOffset = scrollYRef.current * 0.5 // Adjust the multiplier to control parallax effect speed

      // Draw connections first (so they appear behind nodes)
      for (let i = 0; i < nodesRef.current.length; i++) {
        const node = nodesRef.current[i]
        const nodeY = node.y - scrollOffset // Apply scroll offset to Y position

        // Draw vector line from the node
        if (node.isAnchor) {
          const endX = node.x + Math.cos(node.vectorAngle) * node.vectorLength
          const endY = nodeY + Math.sin(node.vectorAngle) * node.vectorLength

          // Draw vector line
          ctx.beginPath()
          ctx.strokeStyle = node.color.replace("0.8", "0.6")
          ctx.lineWidth = 1.5
          ctx.moveTo(node.x, nodeY)
          ctx.lineTo(endX, endY)
          ctx.stroke()

          // Draw arrow head
          const headLength = 7
          const angle = Math.atan2(endY - nodeY, endX - node.x)

          ctx.beginPath()
          ctx.moveTo(endX, endY)
          ctx.lineTo(
            endX - headLength * Math.cos(angle - Math.PI / 6),
            endY - headLength * Math.sin(angle - Math.PI / 6),
          )
          ctx.lineTo(
            endX - headLength * Math.cos(angle + Math.PI / 6),
            endY - headLength * Math.sin(angle + Math.PI / 6),
          )
          ctx.closePath()
          ctx.fillStyle = node.color.replace("0.8", "0.6")
          ctx.fill()
        }

        // Draw connections between nodes
        for (const connectionIndex of node.connections) {
          const connectedNode = nodesRef.current[connectionIndex]
          const connectedNodeY = connectedNode.y - scrollOffset // Apply scroll offset to connected node Y position

          const distance = Math.sqrt(Math.pow(node.x - connectedNode.x, 2) + Math.pow(nodeY - connectedNodeY, 2))

          // Only draw connections if nodes are within a certain distance
          const maxDistance = canvas.width / 3
          if (distance < maxDistance) {
            // Calculate opacity based on distance
            const opacity = 1 - distance / maxDistance

            // Create gradient for line
            const gradient = ctx.createLinearGradient(node.x, nodeY, connectedNode.x, connectedNodeY)
            gradient.addColorStop(0, node.color.replace("0.8", `${opacity * 0.6}`))
            gradient.addColorStop(1, connectedNode.color.replace("0.8", `${opacity * 0.6}`))

            // Draw connection line
            ctx.beginPath()
            ctx.strokeStyle = gradient
            ctx.lineWidth = 1
            ctx.moveTo(node.x, nodeY)
            ctx.lineTo(connectedNode.x, connectedNodeY)
            ctx.stroke()

            // Draw small dots along the connection line for data flow effect
            if (Math.random() > 0.7) {
              // Only some lines show data flow
              const flowPosition = (Date.now() % 3000) / 3000 // 0 to 1 based on time
              const flowX = node.x + (connectedNode.x - node.x) * flowPosition
              const flowY = nodeY + (connectedNodeY - nodeY) * flowPosition

              ctx.beginPath()
              ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
              ctx.arc(flowX, flowY, 1.5, 0, Math.PI * 2)
              ctx.fill()
            }
          }
        }
      }

      // Draw nodes
      for (const node of nodesRef.current) {
        const nodeY = node.y - scrollOffset // Apply scroll offset to Y position

        // Node glow effect
        ctx.beginPath()
        const gradient = ctx.createRadialGradient(node.x, nodeY, 0, node.x, nodeY, node.size * 3)
        gradient.addColorStop(0, node.color)
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)")

        ctx.fillStyle = gradient
        ctx.arc(node.x, nodeY, node.size * 3, 0, Math.PI * 2)
        ctx.fill()

        // Node center
        ctx.beginPath()
        ctx.fillStyle = node.isAnchor
          ? "rgba(255, 255, 255, 0.9)" // Brighter for anchor nodes
          : "rgba(220, 220, 220, 0.8)"
        ctx.arc(node.x, nodeY, node.isAnchor ? node.size * 1.2 : node.size, 0, Math.PI * 2)
        ctx.fill()

        // For anchor nodes, add a ring
        if (node.isAnchor) {
          ctx.beginPath()
          ctx.strokeStyle = "rgba(255, 255, 255, 0.6)"
          ctx.lineWidth = 0.5
          ctx.arc(node.x, nodeY, node.size * 2, 0, Math.PI * 2)
          ctx.stroke()
        }
      }
    }

    const updateNodes = () => {
      for (const node of nodesRef.current) {
        // Update position
        node.x += node.vx
        node.y += node.vy

        // Update vector angle for rotation effect
        node.vectorAngle += node.vectorRotationSpeed

        // Bounce off edges with some padding
        const padding = 50
        if (node.x < padding || node.x > canvas.width - padding) {
          node.vx *= -1
          // Ensure node stays within bounds
          node.x = Math.max(padding, Math.min(canvas.width - padding, node.x))
        }

        // For Y bounds, we need to consider the entire document height for scrolling
        const documentHeight = Math.max(
          document.body.scrollHeight,
          document.documentElement.scrollHeight,
          document.body.offsetHeight,
          document.documentElement.offsetHeight,
          document.body.clientHeight,
          document.documentElement.clientHeight,
        )

        const extendedHeight = documentHeight + canvas.height // Give extra room for nodes to move

        if (node.y < padding || node.y > extendedHeight - padding) {
          node.vy *= -1
          // Ensure node stays within bounds
          node.y = Math.max(padding, Math.min(extendedHeight - padding, node.y))
        }

        // Occasionally change direction slightly for more organic movement
        if (Math.random() > 0.99) {
          node.vx += (Math.random() - 0.5) * 0.2
          node.vy += (Math.random() - 0.5) * 0.2

          // Limit maximum velocity
          const maxVelocity = 0.8
          const velocity = Math.sqrt(node.vx * node.vx + node.vy * node.vy)
          if (velocity > maxVelocity) {
            node.vx = (node.vx / velocity) * maxVelocity
            node.vy = (node.vy / velocity) * maxVelocity
          }
        }
      }
    }

    const animate = () => {
      updateNodes()
      drawVectorGraph()
      animationRef.current = requestAnimationFrame(animate)
    }

    // Initialize
    updateCanvasSize()
    nodesRef.current = initNodes()
    animate()

    // Handle resize
    window.addEventListener("resize", () => {
      updateCanvasSize()
      nodesRef.current = initNodes()
    })

    // Cleanup
    return () => {
      cancelAnimationFrame(animationRef.current)
      window.removeEventListener("resize", updateCanvasSize)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <div ref={containerRef} className="fixed inset-0 z-0 overflow-hidden bg-black">
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70 z-10"></div>

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-5 z-5"
        style={{
          backgroundImage:
            "linear-gradient(0deg, transparent 24%, rgba(192, 192, 192, .3) 25%, rgba(192, 192, 192, .3) 26%, transparent 27%, transparent 74%, rgba(192, 192, 192, .3) 75%, rgba(192, 192, 192, .3) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(192, 192, 192, .3) 25%, rgba(192, 192, 192, .3) 26%, transparent 27%, transparent 74%, rgba(192, 192, 192, .3) 75%, rgba(192, 192, 192, .3) 76%, transparent 77%, transparent)",
          backgroundSize: "50px 50px",
        }}
      ></div>
    </div>
  )
}

// Types
interface Node {
  x: number
  y: number
  size: number
  color: string
  connections: number[]
  vx: number
  vy: number
  vectorLength: number
  vectorAngle: number
  vectorRotationSpeed: number
  isAnchor: boolean
}
