"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface SettingsContextType {
  animationsEnabled: boolean
  setAnimationsEnabled: (enabled: boolean) => void
  dotAnimationsEnabled: boolean
  setDotAnimationsEnabled: (enabled: boolean) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [animationsEnabled, setAnimationsEnabled] = useState(true)
  const [dotAnimationsEnabled, setDotAnimationsEnabled] = useState(true)

  // Load settings from localStorage
  useEffect(() => {
    const savedAnimations = localStorage.getItem("animationsEnabled")
    const savedDotAnimations = localStorage.getItem("dotAnimationsEnabled")

    if (savedAnimations !== null) {
      setAnimationsEnabled(JSON.parse(savedAnimations))
    }
    if (savedDotAnimations !== null) {
      setDotAnimationsEnabled(JSON.parse(savedDotAnimations))
    }
  }, [])

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem("animationsEnabled", JSON.stringify(animationsEnabled))
  }, [animationsEnabled])

  useEffect(() => {
    localStorage.setItem("dotAnimationsEnabled", JSON.stringify(dotAnimationsEnabled))
  }, [dotAnimationsEnabled])

  return (
    <SettingsContext.Provider
      value={{
        animationsEnabled,
        setAnimationsEnabled,
        dotAnimationsEnabled,
        setDotAnimationsEnabled,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
