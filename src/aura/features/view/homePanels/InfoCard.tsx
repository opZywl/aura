"use client"

import type React from "react"
import { TrendingUp, TrendingDown } from "lucide-react"
import { useTheme } from "./ThemeContext"

interface InfoCardProps {
  title: string
  value: string
  change: string
  changeType: "positive" | "negative"
  subtitle: string
}

const InfoCard: React.FC<InfoCardProps> = ({ title, value, change, changeType, subtitle }) => {
  const { theme } = useTheme()

  return (
    <div className={`rounded-lg p-3 ${theme === "dark" ? "metric-card" : "metric-card-light"}`}>
      <h3 className={`text-xs mb-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>{title}</h3>
      <div className="space-y-1">
        <div className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{value}</div>
        <div className="flex items-center space-x-1 text-xs">
          {changeType === "positive" ? (
            <TrendingUp className="w-3 h-3 text-green-500" />
          ) : (
            <TrendingDown className="w-3 h-3 text-red-500" />
          )}
          <span className={changeType === "positive" ? "text-green-500" : "text-red-500"}>{change}</span>
          <span className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>{subtitle}</span>
        </div>
      </div>
    </div>
  )
}

export default InfoCard
