"use client"

import type React from "react"
import { Search, Bell, Settings, ChevronDown, Sun, Moon } from "lucide-react"
import UserAccount from "./UserAccount"
import { useTheme } from "./ThemeContext"

const Header: React.FC = () => {
  const { theme, toggleTheme, setShowSearch } = useTheme()

  const handleSearchClick = () => {
    console.log("🔍 Search button clicked!")
    setShowSearch(true)
  }

  return (
    <header
      className="flex items-center justify-between px-6 py-4 h-16 border-b"
      style={{
        background: theme === "dark" ? "#000000" : "#ffffff",
        borderColor: theme === "dark" ? "#1a1a1a" : "#e2e8f0",
        boxShadow: theme === "light" ? `0 0 20px var(--glow-color)` : `0 0 15px var(--glow-color)`,
      }}
    >
      <div className="flex items-center space-x-4">
        <button
          onClick={handleSearchClick}
          className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-300 group relative overflow-hidden transform hover:scale-110 ${
            theme === "dark" ? "hover:bg-gray-800" : "hover:bg-blue-50"
          }`}
        >
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"
            style={{
              background: `linear-gradient(135deg, var(--glow-color), transparent)`,
              opacity: 0.15,
            }}
          />
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg blur-lg scale-110"
            style={{
              background: `var(--glow-color)`,
              opacity: 0.1,
            }}
          />
          <Search
            className={`w-5 h-5 transition-all duration-300 cursor-pointer relative z-10 ${
              theme === "dark" ? "text-gray-400 group-hover:text-white" : "text-gray-600 group-hover:text-blue-700"
            }`}
            style={{
              filter: `drop-shadow(0 0 8px var(--glow-color)) drop-shadow(0 0 16px var(--glow-color))`,
              textShadow: `0 0 12px var(--glow-color)`,
            }}
          />
        </button>
        <span
          className={`text-lg transition-all duration-300 ${
            theme === "dark" ? "text-white hover:text-blue-300" : "text-gray-900 hover:text-blue-700"
          }`}
          style={{
            textShadow: `0 0 15px var(--glow-color)`,
            filter: `drop-shadow(0 0 10px var(--glow-color))`,
          }}
        >
          Hello World, Lucas!
        </span>
      </div>

      <div className="flex items-center space-x-4">
        <span
          className={`text-sm transition-all duration-300 cursor-pointer hover:scale-105 transform ${
            theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"
          }`}
          style={{
            textShadow: `0 0 10px var(--glow-color)`,
            filter: `drop-shadow(0 0 8px var(--glow-color))`,
          }}
        >
          EN
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-all duration-300 cursor-pointer transform hover:scale-110 hover:rotate-180 ${
            theme === "dark" ? "text-gray-400 hover:text-blue-400" : "text-gray-600 hover:text-blue-600"
          }`}
          style={{
            filter: `drop-shadow(0 0 6px var(--glow-color)) drop-shadow(0 0 12px var(--glow-color))`,
            textShadow: `0 0 8px var(--glow-color)`,
          }}
        />

        {/* BOTÃO DE TEMA CORRIGIDO */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300 transform hover:scale-125 relative group overflow-hidden"
          title={`Mudar para modo ${theme === "dark" ? "claro" : "escuro"}`}
        >
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"
            style={{
              background:
                theme === "dark"
                  ? "linear-gradient(135deg, rgba(251, 191, 36, 0.3), rgba(249, 115, 22, 0.3))"
                  : `linear-gradient(135deg, var(--glow-color), transparent)`,
            }}
          />
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg blur-lg scale-110"
            style={{
              background: theme === "dark" ? "rgba(251, 191, 36, 0.2)" : `var(--glow-color)`,
              opacity: 0.1,
            }}
          />

          {theme === "dark" ? (
            <Sun
              className="w-6 h-6 text-yellow-400 relative z-10 transition-all duration-300 group-hover:text-yellow-300 group-hover:rotate-90"
              style={{
                filter: "drop-shadow(0 0 15px rgba(251, 191, 36, 1)) drop-shadow(0 0 30px rgba(251, 191, 36, 0.5))",
                textShadow: "0 0 20px rgba(251, 191, 36, 1)",
              }}
            />
          ) : (
            <Moon
              className="w-6 h-6 relative z-10 transition-all duration-300 group-hover:-rotate-12"
              style={{
                color: "var(--glow-color)",
                filter: `drop-shadow(0 0 12px var(--glow-color)) drop-shadow(0 0 24px var(--glow-color))`,
                textShadow: `0 0 15px var(--glow-color)`,
              }}
            />
          )}
        </button>

        <button
          className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-300 group relative overflow-hidden transform hover:scale-110 ${
            theme === "dark" ? "hover:bg-gray-800" : "hover:bg-blue-50"
          }`}
        >
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"
            style={{
              background: `linear-gradient(135deg, var(--glow-color), transparent)`,
              opacity: 0.15,
            }}
          />
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg blur-lg scale-110"
            style={{
              background: `var(--glow-color)`,
              opacity: 0.1,
            }}
          />
          <Bell
            className={`w-5 h-5 transition-all duration-300 relative z-10 group-hover:animate-pulse ${
              theme === "dark" ? "text-gray-400 group-hover:text-white" : "text-gray-600 group-hover:text-blue-700"
            }`}
            style={{
              filter: `drop-shadow(0 0 10px var(--glow-color)) drop-shadow(0 0 20px var(--glow-color))`,
              textShadow: `0 0 12px var(--glow-color)`,
            }}
          />
        </button>

        <button
          className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-300 group relative overflow-hidden transform hover:scale-110 ${
            theme === "dark" ? "hover:bg-gray-800" : "hover:bg-blue-50"
          }`}
        >
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"
            style={{
              background: `linear-gradient(135deg, var(--glow-color), transparent)`,
              opacity: 0.15,
            }}
          />
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg blur-lg scale-110"
            style={{
              background: `var(--glow-color)`,
              opacity: 0.1,
            }}
          />
          <Settings
            className={`w-5 h-5 transition-all duration-300 relative z-10 group-hover:rotate-90 ${
              theme === "dark" ? "text-gray-400 group-hover:text-white" : "text-gray-600 group-hover:text-blue-700"
            }`}
            style={{
              filter: `drop-shadow(0 0 10px var(--glow-color)) drop-shadow(0 0 20px var(--glow-color))`,
              textShadow: `0 0 12px var(--glow-color)`,
            }}
          />
        </button>

        <UserAccount />
      </div>
    </header>
  )
}

export default Header
