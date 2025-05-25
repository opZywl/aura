"use client"

import type React from "react"
import { X, Search } from "lucide-react"
import { useTheme } from "./ThemeContext"

const SearchPanel: React.FC = () => {
  const { showSearch, setShowSearch, searchQuery, setSearchQuery, theme } = useTheme()

  console.log("SearchPanel render - showSearch:", showSearch)

  if (!showSearch) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={() => setShowSearch(false)}
      />

      {/* Panel */}
      <div
        className={`fixed left-4 top-20 w-80 rounded-xl shadow-2xl z-50 transition-all duration-300 transform ${
          showSearch ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        style={{
          background:
            theme === "dark"
              ? "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)"
              : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          border: theme === "dark" ? "1px solid #3a3a3a" : "1px solid #e2e8f0",
          boxShadow: `0 20px 40px rgba(0, 0, 0, 0.3), 0 0 30px var(--glow-color)`,
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: theme === "dark" ? "#3a3a3a" : "#e2e8f0" }}
        >
          <div className="flex items-center space-x-2">
            <Search
              className={`w-5 h-5 ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}
              style={{
                filter: `drop-shadow(0 0 8px var(--glow-color)) drop-shadow(0 0 16px var(--glow-color))`,
                textShadow: `0 0 10px var(--glow-color)`,
              }}
            />
            <h3
              className={`font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}
              style={{
                textShadow: `0 0 10px var(--glow-color)`,
                filter: `drop-shadow(0 0 8px var(--glow-color))`,
              }}
            >
              Search Menu
            </h3>
          </div>
          <button
            onClick={() => setShowSearch(false)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 ${
              theme === "dark"
                ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
            }`}
            style={{
              filter: `drop-shadow(0 0 6px var(--glow-color))`,
            }}
          >
            <X
              className="w-4 h-4"
              style={{
                textShadow: `0 0 8px var(--glow-color)`,
              }}
            />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4">
          <div className="relative">
            <Search
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
              style={{
                filter: `drop-shadow(0 0 6px var(--glow-color))`,
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search menu items..."
              className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 ${
                theme === "dark"
                  ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500"
              }`}
              style={{
                boxShadow: `0 0 15px var(--glow-color)`,
                textShadow: `0 0 8px var(--glow-color)`,
              }}
              autoFocus
            />
          </div>
          <p
            className={`text-xs mt-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
            style={{
              textShadow: `0 0 6px var(--glow-color)`,
            }}
          >
            Type to filter sidebar menu items
          </p>
        </div>
      </div>
    </>
  )
}

export default SearchPanel
