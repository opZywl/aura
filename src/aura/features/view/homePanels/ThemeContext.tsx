"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type HomeTheme = "dark" | "light"

type GradientTheme = {
  name: string
  primary: string
  secondary: string
  accent: string
  glow: string
}

const gradientThemes: GradientTheme[] = [
  {
    name: "Blue Purple",
    primary: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
    secondary: "linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)",
    accent: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)",
    glow: "rgba(59, 130, 246, 0.6)",
  },
  {
    name: "Green Teal",
    primary: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
    secondary: "linear-gradient(135deg, #34d399 0%, #22d3ee 100%)",
    accent: "linear-gradient(135deg, #10b981 0%, #06b6d4 50%, #8b5cf6 100%)",
    glow: "rgba(16, 185, 129, 0.6)",
  },
  {
    name: "Orange Red",
    primary: "linear-gradient(135deg, #f97316 0%, #ef4444 100%)",
    secondary: "linear-gradient(135deg, #fb923c 0%, #f87171 100%)",
    accent: "linear-gradient(135deg, #f97316 0%, #ef4444 50%, #ec4899 100%)",
    glow: "rgba(249, 115, 22, 0.6)",
  },
  {
    name: "Purple Pink",
    primary: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
    secondary: "linear-gradient(135deg, #a78bfa 0%, #f472b6 100%)",
    accent: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #f59e0b 100%)",
    glow: "rgba(139, 92, 246, 0.6)",
  },
  {
    name: "Cyan Blue",
    primary: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
    secondary: "linear-gradient(135deg, #22d3ee 0%, #60a5fa 100%)",
    accent: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)",
    glow: "rgba(6, 182, 212, 0.6)",
  },
]

interface HomeThemeContextType {
  theme: HomeTheme
  toggleTheme: () => void
  currentGradient: GradientTheme
  setGradientTheme: (gradient: GradientTheme) => void
  gradientThemes: GradientTheme[]
  showColorPanel: boolean
  setShowColorPanel: (show: boolean) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  showSearch: boolean
  setShowSearch: (show: boolean) => void
}

const HomeThemeContext = createContext<HomeThemeContextType | undefined>(undefined)

export const useTheme = (): HomeThemeContextType => {
  const context = useContext(HomeThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

interface ThemeProviderProps {
  children: ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<HomeTheme>("dark")
  const [currentGradient, setCurrentGradient] = useState<GradientTheme>(gradientThemes[0])
  const [showColorPanel, setShowColorPanel] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoaded, setIsLoaded] = useState(false)

  // Apply CSS variables immediately
  const applyCSSVariables = (gradient: GradientTheme) => {
    const root = document.documentElement
    root.style.setProperty("--gradient-primary", gradient.primary)
    root.style.setProperty("--gradient-secondary", gradient.secondary)
    root.style.setProperty("--gradient-accent", gradient.accent)
    root.style.setProperty("--glow-color", gradient.glow)

    // Additional glow variations
    root.style.setProperty("--glow-color-light", gradient.glow.replace("0.6", "0.3"))
    root.style.setProperty("--glow-color-strong", gradient.glow.replace("0.6", "0.8"))
  }

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("home-theme")
      const savedGradient = localStorage.getItem("home-gradient")

      if (savedTheme === "dark" || savedTheme === "light") {
        setTheme(savedTheme)
      }

      if (savedGradient) {
        const gradient = gradientThemes.find((g) => g.name === savedGradient)
        if (gradient) {
          setCurrentGradient(gradient)
          applyCSSVariables(gradient)
        }
      } else {
        applyCSSVariables(gradientThemes[0])
      }
    } catch (error) {
      console.log("Error loading theme from localStorage:", error)
      applyCSSVariables(gradientThemes[0])
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem("home-theme", theme)
        localStorage.setItem("home-gradient", currentGradient.name)
        applyCSSVariables(currentGradient)

        const root = document.documentElement
        root.classList.remove("home-theme-dark", "home-theme-light")
        root.classList.add(`home-theme-${theme}`)
      } catch (error) {
        console.log("Error saving theme to localStorage:", error)
      }
    }
  }, [theme, currentGradient, isLoaded])

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === "dark" ? "light" : "dark"
      console.log("Theme toggled from", prevTheme, "to", newTheme)
      return newTheme
    })
  }

  const handleSetGradientTheme = (gradient: GradientTheme) => {
    console.log("Setting gradient theme:", gradient.name)
    setCurrentGradient(gradient)
    applyCSSVariables(gradient)
  }

  const handleSetShowColorPanel = (show: boolean) => {
    console.log("=== setShowColorPanel called ===", show)
    setShowColorPanel(show)
  }

  const handleSetShowSearch = (show: boolean) => {
    console.log("=== setShowSearch called ===", show)
    setShowSearch(show)
  }

  const value: HomeThemeContextType = {
    theme,
    toggleTheme,
    currentGradient,
    setGradientTheme: handleSetGradientTheme,
    gradientThemes,
    showColorPanel,
    setShowColorPanel: handleSetShowColorPanel,
    searchQuery,
    setSearchQuery,
    showSearch,
    setShowSearch: handleSetShowSearch,
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return <HomeThemeContext.Provider value={value}>{children}</HomeThemeContext.Provider>
}
