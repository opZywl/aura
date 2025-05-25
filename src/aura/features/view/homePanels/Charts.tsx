"use client"

import type React from "react"
import { useState } from "react"
import { MoreHorizontal, Filter } from "lucide-react"
import { useTheme } from "./ThemeContext"

const Charts: React.FC = () => {
  const { theme } = useTheme()
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; value: string } | null>(null)
  const [hoveredBar, setHoveredBar] = useState<{ x: number; y: number; value: string; month: string } | null>(null)

  // Dados para o gráfico de linha
  const lineData = [
    { x: 50, y: 95, value: "$15.200", month: "Jan" },
    { x: 90, y: 65, value: "$22.800", month: "Fev" },
    { x: 130, y: 80, value: "$18.500", month: "Mar" },
    { x: 170, y: 65, value: "$27.500", month: "Abr" },
    { x: 210, y: 50, value: "$32.100", month: "Mai" },
    { x: 250, y: 65, value: "$28.900", month: "Jun" },
    { x: 290, y: 65, value: "$30.200", month: "Jul" },
  ]

  // Dados para o gráfico de barras
  const barData = [
    { x: 45, y: 55, height: 50, value: "1.250", month: "Fev" },
    { x: 95, y: 30, height: 75, value: "2.100", month: "Mar" },
    { x: 145, y: 65, height: 40, value: "890", month: "Abr" },
    { x: 195, y: 45, height: 60, value: "1.650", month: "Mai" },
    { x: 245, y: 60, height: 45, value: "1.200", month: "Jun" },
    { x: 295, y: 40, height: 65, value: "1.800", month: "Jul" },
  ]

  return (
      <div className="grid grid-cols-2 gap-4">
        {/* Gráfico de Pedidos */}
        <div className={`rounded-lg p-3 group relative ${theme === "dark" ? "card-hover" : "card-hover-light"}`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`font-semibold text-sm ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Pedidos</h3>
            <div className="flex items-center space-x-2">
              <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Semana Atual</span>
              <MoreHorizontal className={`w-4 h-4 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} />
            </div>
          </div>
          <div className="relative h-40 overflow-visible">
            <svg className="w-full h-full transition-all duration-500 group-hover:scale-105" viewBox="0 0 400 160">
              {/* Grade */}
              <defs>
                <pattern id="grid" width="40" height="32" patternUnits="userSpaceOnUse">
                  <path
                      d="M 40 0 L 0 0 0 32"
                      fill="none"
                      stroke={theme === "dark" ? "#374151" : "#e5e7eb"}
                      strokeWidth="1"
                  />
                </pattern>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="50%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#EC4899" />
                </linearGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Rótulos do eixo Y */}
              <text x="10" y="15" fill={theme === "dark" ? "#9CA3AF" : "#6B7280"} fontSize="10">
                30M
              </text>
              <text x="10" y="47" fill={theme === "dark" ? "#9CA3AF" : "#6B7280"} fontSize="10">
                20M
              </text>
              <text x="10" y="79" fill={theme === "dark" ? "#9CA3AF" : "#6B7280"} fontSize="10">
                10M
              </text>
              <text x="10" y="111" fill={theme === "dark" ? "#9CA3AF" : "#6B7280"} fontSize="10">
                0
              </text>

              {/* Rótulos do eixo X */}
              {lineData.map((point, index) => (
                  <text
                      key={index}
                      x={point.x}
                      y="150"
                      fill={theme === "dark" ? "#9CA3AF" : "#6B7280"}
                      fontSize="10"
                      textAnchor="middle"
                  >
                    {point.month}
                  </text>
              ))}

              {/* Linha do gráfico */}
              <path
                  d={`M ${lineData.map((p) => `${p.x} ${p.y}`).join(" L ")}`}
                  fill="none"
                  stroke="url(#lineGradient)"
                  strokeWidth="3"
                  strokeDasharray="3,3"
                  className="animate-pulse group-hover:stroke-[4] transition-all duration-300"
                  style={{ filter: "drop-shadow(0 0 8px rgba(59, 130, 246, 0.4))" }}
              />

              {/* Pontos de dados interativos */}
              {lineData.map((point, index) => (
                  <circle
                      key={index}
                      cx={point.x}
                      cy={point.y}
                      r="6"
                      fill="#3B82F6"
                      className="cursor-pointer hover:r-8 transition-all duration-300 opacity-80 hover:opacity-100"
                      onMouseEnter={() => setHoveredPoint({ x: point.x, y: point.y - 30, value: point.value })}
                      onMouseLeave={() => setHoveredPoint(null)}
                      style={{ filter: "drop-shadow(0 0 4px rgba(59, 130, 246, 0.6))" }}
                  />
              ))}
            </svg>

            {/* Dica para linha */}
            {hoveredPoint && (
                <div
                    className={`absolute z-10 px-3 py-2 rounded-lg shadow-lg border transition-all duration-200 ${
                        theme === "dark" ? "bg-gray-800 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                    }`}
                    style={{
                      left: `${(hoveredPoint.x / 400) * 100}%`,
                      top: `${(hoveredPoint.y / 160) * 100}%`,
                      transform: "translate(-50%, -100%)",
                    }}
                >
                  <div className="text-sm font-semibold">{hoveredPoint.value}</div>
                  <div className="text-xs opacity-75">Receita</div>
                  <div
                      className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent ${
                          theme === "dark" ? "border-t-gray-800" : "border-t-white"
                      }`}
                  />
                </div>
            )}
          </div>
        </div>

        {/* Gráfico de Produtos */}
        <div className={`rounded-lg p-3 group relative ${theme === "dark" ? "card-hover" : "card-hover-light"}`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`font-semibold text-sm ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              Estatísticas de Produto
            </h3>
            <div className="flex items-center space-x-2">
              <Filter className={`w-3 h-3 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} />
              <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Filtrar</span>
              <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Semana Atual</span>
              <MoreHorizontal className={`w-4 h-4 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} />
            </div>
          </div>
          <div className="space-y-3">
            <div className="relative h-32 overflow-visible">
              <svg className="w-full h-full transition-all duration-500 group-hover:scale-105" viewBox="0 0 400 128">
                <defs>
                  <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#1E40AF" />
                  </linearGradient>
                </defs>

                {/* Rótulos do eixo Y */}
                <text x="10" y="15" fill={theme === "dark" ? "#9CA3AF" : "#6B7280"} fontSize="10">
                  30M
                </text>
                <text x="10" y="40" fill={theme === "dark" ? "#9CA3AF" : "#6B7280"} fontSize="10">
                  20M
                </text>
                <text x="10" y="65" fill={theme === "dark" ? "#9CA3AF" : "#6B7280"} fontSize="10">
                  10M
                </text>
                <text x="10" y="90" fill={theme === "dark" ? "#9CA3AF" : "#6B7280"} fontSize="10">
                  0
                </text>

                {/* Rótulos do eixo X */}
                {barData.map((bar, index) => (
                    <text
                        key={index}
                        x={bar.x + 7.5}
                        y="120"
                        fill={theme === "dark" ? "#9CA3AF" : "#6B7280"}
                        fontSize="10"
                        textAnchor="middle"
                    >
                      {bar.month}
                    </text>
                ))}

                {/* Barras interativas */}
                {barData.map((bar, index) => (
                    <rect
                        key={index}
                        x={bar.x}
                        y={bar.y}
                        width="15"
                        height={bar.height}
                        fill="url(#barGradient)"
                        rx="2"
                        className="cursor-pointer hover:opacity-80 transition-all duration-300"
                        style={{ filter: "drop-shadow(0 2px 4px rgba(59, 130, 246, 0.3))" }}
                        onMouseEnter={() =>
                            setHoveredBar({
                              x: bar.x + 7.5,
                              y: bar.y - 10,
                              value: bar.value,
                              month: bar.month,
                            })
                        }
                        onMouseLeave={() => setHoveredBar(null)}
                    />
                ))}
              </svg>

              {/* Dica para barras */}
              {hoveredBar && (
                  <div
                      className={`absolute z-10 px-3 py-2 rounded-lg shadow-lg border transition-all duration-200 ${
                          theme === "dark" ? "bg-gray-800 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                      }`}
                      style={{
                        left: `${(hoveredBar.x / 400) * 100}%`,
                        top: `${(hoveredBar.y / 128) * 100}%`,
                        transform: "translate(-50%, -100%)",
                      }}
                  >
                    <div className="text-sm font-semibold">{hoveredBar.value}</div>
                    <div className="text-xs opacity-75">{hoveredBar.month}</div>
                    <div
                        className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent ${
                            theme === "dark" ? "border-t-gray-800" : "border-t-white"
                        }`}
                    />
                  </div>
              )}
            </div>

            {/* Legenda com efeitos de hover */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { color: "bg-yellow-500", label: "Mensagens", value: "321" },
                { color: "bg-cyan-500", label: "Chamadas", value: "222" },
                { color: "bg-purple-500", label: "Tempo em ligação", value: "19" },
                { color: "bg-pink-500", label: "Principais conversas", value: "56" },
              ].map((item, index) => (
                  <div
                      key={index}
                      className="flex items-center justify-between text-xs group-hover:scale-105 transition-transform duration-300"
                  >
                    <div className="flex items-center space-x-1">
                      <div className={`w-2 h-2 ${item.color} rounded-full animate-pulse`}></div>
                      <span className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>{item.label}</span>
                    </div>
                    <span className={`font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  {item.value}
                </span>
                  </div>
              ))}
            </div>
          </div>
        </div>
      </div>
  )
}

export default Charts
