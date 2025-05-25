"use client"

import type React from "react"
import { useState } from "react"
import InfoCard from "./InfoCard"
import Charts from "./Charts"
import ListCard from "./ListCard"
import { useTheme } from "./ThemeContext"

const Content: React.FC = () => {
  const { theme } = useTheme()
  const [hoveredLine, setHoveredLine] = useState<{ x: number; y: number; value: string; type: string } | null>(null)

  const metrics = [
    {
      title: "Total Revenue",
      value: "$52,000",
      change: "+6.13%",
      changeType: "positive" as const,
      subtitle: "from last week",
    },
    {
      title: "Conversion Rate",
      value: "3.5%",
      change: "+16.67%",
      changeType: "positive" as const,
      subtitle: "from last week",
    },
    {
      title: "Membership Renewals",
      value: "1200",
      change: "+1.35%",
      changeType: "positive" as const,
      subtitle: "from last week",
    },
    {
      title: "Subscribers",
      value: "650",
      change: "+1.25%",
      changeType: "positive" as const,
      subtitle: "from last week",
    },
  ]

  const projects = [
    {
      title: "Project Dashboard",
      subtitle: "News Task Assign",
      time: "4 hrs ago",
      avatars: 2,
    },
    {
      title: "Figma Design",
      subtitle: "News Task Assign",
      time: "4 hrs ago",
      avatars: 2,
    },
    {
      title: "UX Research",
      subtitle: "News Task Assign",
      time: "4 hrs ago",
      avatars: 2,
    },
    {
      title: "Admin Template",
      subtitle: "News Task Assign",
      time: "4 hrs ago",
      avatars: 2,
    },
  ]

  // Dados para as linhas do gráfico de mensagens
  const messageLines = [
    {
      points: "M 20 40 L 60 25 L 100 35 L 140 15 L 180 30 L 220 20 L 260 25 L 300 30",
      color: "#06B6D4",
      name: "Received",
      value: "6,345",
    },
    {
      points: "M 20 35 L 60 30 L 100 40 L 140 20 L 180 35 L 220 25 L 260 30 L 300 35",
      color: "#EC4899",
      name: "Outgoing",
      value: "1,760",
    },
    {
      points: "M 20 45 L 60 35 L 100 45 L 140 25 L 180 40 L 220 30 L 260 35 L 300 40",
      color: "#EAB308",
      name: "Missed",
      value: "1,441",
    },
  ]

  return (
    <div
      className={`flex-1 p-4 space-y-4 overflow-y-auto ${theme === "dark" ? "bg-dark-primary" : "bg-light-primary"}`}
    >
      {/* Metrics Row */}
      <div className="grid grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <InfoCard key={index} {...metric} />
        ))}
      </div>

      {/* Charts Row */}
      <Charts />

      {/* Projects Row */}
      <div className="grid grid-cols-4 gap-4">
        {projects.map((project, index) => (
          <ListCard key={index} {...project} />
        ))}
      </div>

      {/* Bottom Charts Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className={`rounded-lg p-3 group relative ${theme === "dark" ? "card-hover" : "card-hover-light"}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`font-semibold text-sm ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Messages</h3>
            <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Daily</span>
          </div>
          <div className="flex items-center space-x-2 mb-3">
            <span className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>23,457</span>
            <span className="text-xs text-green-500">+15%</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                <span className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>Received</span>
              </div>
              <span className={theme === "dark" ? "text-white" : "text-gray-900"}>6,345</span>
            </div>
            <div className="flex justify-between text-xs">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></div>
                <span className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>Outgoing</span>
              </div>
              <span className={theme === "dark" ? "text-white" : "text-gray-900"}>1,760</span>
            </div>
            <div className="flex justify-between text-xs">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>Missed</span>
              </div>
              <span className={theme === "dark" ? "text-white" : "text-gray-900"}>1,441</span>
            </div>
          </div>
          <div className="h-16 mt-2 overflow-visible relative">
            <svg className="w-full h-full transition-all duration-500 group-hover:scale-110" viewBox="0 0 300 60">
              <defs>
                {messageLines.map((line, index) => (
                  <linearGradient key={index} id={`messagesGradient${index + 1}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={line.color} />
                    <stop offset="100%" stopColor={line.color} stopOpacity="0.7" />
                  </linearGradient>
                ))}
              </defs>

              {messageLines.map((line, index) => (
                <path
                  key={index}
                  d={line.points}
                  fill="none"
                  stroke={`url(#messagesGradient${index + 1})`}
                  strokeWidth="2"
                  className="cursor-pointer hover:stroke-[3] transition-all duration-300"
                  style={{ filter: `drop-shadow(0 0 4px ${line.color}50)` }}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    setHoveredLine({
                      x: 150, // Centro do gráfico
                      y: 20, // Topo do gráfico
                      value: line.value,
                      type: line.name,
                    })
                  }}
                  onMouseLeave={() => setHoveredLine(null)}
                />
              ))}
            </svg>

            {/* Tooltip para linhas de mensagem */}
            {hoveredLine && (
              <div
                className={`absolute z-10 px-3 py-2 rounded-lg shadow-lg border transition-all duration-200 ${
                  theme === "dark" ? "bg-gray-800 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                }`}
                style={{
                  left: `${(hoveredLine.x / 300) * 100}%`,
                  top: `${(hoveredLine.y / 60) * 100}%`,
                  transform: "translate(-50%, -100%)",
                }}
              >
                <div className="text-sm font-semibold">{hoveredLine.value}</div>
                <div className="text-xs opacity-75">{hoveredLine.type}</div>
                <div
                  className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent ${
                    theme === "dark" ? "border-t-gray-800" : "border-t-white"
                  }`}
                />
              </div>
            )}
          </div>
        </div>

        <div className={`rounded-lg p-3 ${theme === "dark" ? "card-hover" : "card-hover-light"}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`font-semibold text-sm ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              Project Overview
            </h3>
            <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Current Week</span>
          </div>
          <div className="flex items-center space-x-2 mb-3">
            <span className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>23,457</span>
            <span className="text-xs text-green-500">+15%</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">PD</span>
                </div>
                <span className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>Product Design</span>
              </div>
              <div className="text-right">
                <div className={theme === "dark" ? "text-white" : "text-gray-900"}>26 Total Project</div>
                <div className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>4 Members</div>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">UI</span>
                </div>
                <span className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>UI/UX Design</span>
              </div>
              <div className="text-right">
                <div className={theme === "dark" ? "text-white" : "text-gray-900"}>26 Total Project</div>
                <div className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>4 Members</div>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">WD</span>
                </div>
                <span className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>Web Development</span>
              </div>
              <div className="text-right">
                <div className={theme === "dark" ? "text-white" : "text-gray-900"}>26 Total Project</div>
                <div className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>4 Members</div>
              </div>
            </div>
          </div>
        </div>

        <div className={`rounded-lg p-3 ${theme === "dark" ? "card-hover" : "card-hover-light"}`}>
          <h3 className={`text-xs mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Current Week</h3>
          <div className="relative w-24 h-24 mx-auto mb-3">
            <div className="circular-progress w-full h-full">
              <div
                className={`circular-progress-inner flex items-center justify-center ${theme === "dark" ? "" : "bg-white"}`}
              >
                <span className={`text-xs font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  75%
                </span>
              </div>
            </div>
          </div>
          <div className="flex -space-x-1 justify-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`w-5 h-5 rounded-full border-2 ${
                  theme === "dark"
                    ? "bg-gradient-to-r from-gray-600 to-gray-500 border-gray-800"
                    : "bg-gradient-to-r from-gray-300 to-gray-400 border-white"
                }`}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Content
