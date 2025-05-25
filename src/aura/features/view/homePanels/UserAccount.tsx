"use client"

import type React from "react"
import { ChevronDown } from "lucide-react"
import { useTheme } from "./ThemeContext"

const UserAccount: React.FC = () => {
  const { theme } = useTheme()

  return (
    <div
      className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-300 cursor-pointer group relative overflow-hidden ${
        theme === "dark" ? "hover:bg-gray-800/50" : "hover:bg-blue-50/50"
      }`}
    >
      {/* Glow effect on hover */}
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg ${
          theme === "dark"
            ? "bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10"
            : "bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5"
        }`}
      />

      <div
        className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 relative z-10"
        style={{
          background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
          boxShadow: theme === "dark" ? "0 0 15px rgba(59, 130, 246, 0.4)" : "0 0 12px rgba(59, 130, 246, 0.3)",
        }}
      >
        <span
          className="text-sm font-medium text-white transition-all duration-300"
          style={{
            textShadow: "0 0 10px rgba(255, 255, 255, 0.8)",
          }}
        >
          OL
        </span>
      </div>
      <span
        className={`text-sm transition-all duration-300 relative z-10 ${
          theme === "dark" ? "text-white group-hover:text-blue-300" : "text-gray-900 group-hover:text-blue-700"
        }`}
        style={{
          textShadow: theme === "dark" ? "0 0 10px rgba(59, 130, 246, 0.4)" : "0 0 8px rgba(59, 130, 246, 0.3)",
        }}
      >
        My Account
      </span>
      <ChevronDown
        className={`w-4 h-4 transition-all duration-300 relative z-10 ${
          theme === "dark" ? "text-gray-400 group-hover:text-blue-400" : "text-gray-600 group-hover:text-blue-600"
        }`}
        style={{
          filter:
            theme === "dark"
              ? "drop-shadow(0 0 6px rgba(59, 130, 246, 0.4))"
              : "drop-shadow(0 0 4px rgba(59, 130, 246, 0.3))",
        }}
      />
    </div>
  )
}

export default UserAccount
