"use client"

import type React from "react"
import { Clock, MoreHorizontal } from "lucide-react"
import { useTheme } from "./ThemeContext"

interface ListCardProps {
  title: string
  subtitle: string
  time: string
  avatars: number
}

const ListCard: React.FC<ListCardProps> = ({ title, subtitle, time, avatars }) => {
  const { theme } = useTheme()

  return (
    <div className={`rounded-lg p-3 ${theme === "dark" ? "project-card" : "project-card-light"}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{title}</h3>
        <MoreHorizontal
          className={`w-4 h-4 transition-colors ${theme === "dark" ? "text-gray-400 hover:text-blue-400" : "text-gray-600 hover:text-blue-600"}`}
        />
      </div>
      <div className="space-y-2">
        <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>{subtitle}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Clock className={`w-3 h-3 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} />
            <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>{time}</span>
          </div>
          <div className="flex -space-x-1">
            {Array.from({ length: avatars }).map((_, index) => (
              <div
                key={index}
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center hover:scale-110 transition-transform ${
                  theme === "dark"
                    ? "bg-gradient-to-r from-gray-600 to-gray-500 border-gray-800"
                    : "bg-gradient-to-r from-gray-300 to-gray-400 border-white"
                }`}
              >
                <span className={`text-xs ${theme === "dark" ? "text-white" : "text-gray-700"}`}>U</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ListCard
