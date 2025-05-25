"use client"

import type React from "react"
import { ChevronDown, TrendingUp } from "lucide-react"
import { useTheme } from "./ThemeContext"

const Stats: React.FC = () => {
  const { theme } = useTheme()

  const teamMembers = [
    { name: "Rissa Pearson", role: "UI Designer", time: "2 min ago" },
    { name: "Rissa Pearson", role: "UI Designer", time: "2 min ago" },
    { name: "Rissa Pearson", role: "UI Designer", time: "2 min ago" },
    { name: "Rissa Pearson", role: "UI Designer", time: "2 min ago" },
    { name: "Rissa Pearson", role: "UI Designer", time: "2 min ago" },
  ]

  return (
    <div className={`w-80 p-4 space-y-4 overflow-y-auto ${theme === "dark" ? "stats-sidebar" : "stats-sidebar-light"}`}>
      {/* Team Members */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className={`text-sm font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Team Member</h3>
          <div className="flex items-center space-x-2">
            <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Recent</span>
            <ChevronDown className={`w-4 h-4 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} />
          </div>
        </div>
        <div className="space-y-2">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className={`flex items-center space-x-3 ${theme === "dark" ? "team-member" : "team-member-light"}`}
            >
              <div className="w-7 h-7 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-white">RP</span>
              </div>
              <div className="flex-1">
                <div className={`text-xs font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  {member.name}
                </div>
                <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>{member.role}</div>
              </div>
              <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>{member.time}</div>
            </div>
          ))}
        </div>
        <button
          className={`w-full mt-3 text-xs py-2 rounded-md transition-colors ${theme === "dark" ? "text-blue-400 hover:text-blue-300 hover:bg-blue-400/10" : "text-blue-600 hover:text-blue-700 hover:bg-blue-600/10"}`}
        >
          See Details →
        </button>
      </div>

      {/* Conversations */}
      <div className={`rounded-lg p-3 ${theme === "dark" ? "card-hover" : "card-hover-light"}`}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h4 className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Top Conversations</h4>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`text-xl font-bold ${theme === "dark" ? "text-white text-glow" : "text-gray-900"}`}>
                689
              </span>
              <div className="flex items-center space-x-1">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span className="text-xs text-green-500">+3%</span>
              </div>
            </div>
          </div>
          <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Daily</div>
        </div>

        <div className="space-y-3">
          {/* Chart */}
          <div className="relative h-20 overflow-hidden">
            <svg className="w-full h-full transition-all duration-500 group-hover:scale-105" viewBox="0 0 300 80">
              <defs>
                <linearGradient id="conversationBarGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="50%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#1E40AF" />
                </linearGradient>
              </defs>

              {/* Y-axis labels */}
              <text x="5" y="12" fill={theme === "dark" ? "#9CA3AF" : "#6B7280"} fontSize="8">
                600
              </text>
              <text x="5" y="25" fill={theme === "dark" ? "#9CA3AF" : "#6B7280"} fontSize="8">
                400
              </text>
              <text x="5" y="38" fill={theme === "dark" ? "#9CA3AF" : "#6B7280"} fontSize="8">
                300
              </text>
              <text x="5" y="51" fill={theme === "dark" ? "#9CA3AF" : "#6B7280"} fontSize="8">
                200
              </text>
              <text x="5" y="64" fill={theme === "dark" ? "#9CA3AF" : "#6B7280"} fontSize="8">
                100
              </text>
              <text x="5" y="77" fill={theme === "dark" ? "#9CA3AF" : "#6B7280"} fontSize="8">
                0
              </text>

              {/* Animated Bars */}
              {Array.from({ length: 17 }).map((_, i) => {
                const height = 20 + Math.random() * 25
                const y = 30 + Math.random() * 25
                return (
                  <rect
                    key={i}
                    x={25 + i * 15}
                    y={y + height}
                    width="6"
                    height="0"
                    fill="url(#conversationBarGradient)"
                    rx="1"
                    className="group-hover:opacity-80 transition-all duration-300"
                    style={{
                      filter: "drop-shadow(0 2px 4px rgba(59, 130, 246, 0.4))",
                    }}
                  >
                    <animate
                      attributeName="height"
                      values={`0;${height};${height}`}
                      dur="1.5s"
                      begin={`${i * 0.05}s`}
                      fill="freeze"
                    />
                    <animate
                      attributeName="y"
                      values={`${y + height};${y};${y}`}
                      dur="1.5s"
                      begin={`${i * 0.05}s`}
                      fill="freeze"
                    />
                    <animateTransform
                      attributeName="transform"
                      type="scale"
                      values="1;1.1;1"
                      dur="2s"
                      begin={`${i * 0.1}s`}
                      repeatCount="indefinite"
                    />
                  </rect>
                )
              })}
            </svg>
          </div>

          {/* Stats */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>Messages</span>
              <span className={`font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>321</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>Calls</span>
              <span className={`font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>222</span>
            </div>
          </div>

          {/* Team avatars */}
          <div className="flex -space-x-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`w-5 h-5 rounded-full border-2 hover:scale-110 transition-transform ${
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

export default Stats
