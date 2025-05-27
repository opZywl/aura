"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type AnimationType = "dots" | "particles" | "waves" | "geometric" | "neural" | "none"
export type MouseEffectType = "none" | "explode" | "fade" | "repel" | "attract" | "sparkle"

interface SettingsContextType {
  // Animation settings
  animationsEnabled: boolean
  setAnimationsEnabled: (enabled: boolean) => void
  animationType: AnimationType
  setAnimationType: (type: AnimationType) => void

  // Mouse interaction settings
  mouseEffectsEnabled: boolean
  setMouseEffectsEnabled: (enabled: boolean) => void
  mouseEffectType: MouseEffectType
  setMouseEffectType: (type: MouseEffectType) => void

  // Accessibility settings
  accessibilityMode: boolean
  setAccessibilityMode: (enabled: boolean) => void
  reducedMotion: boolean
  setReducedMotion: (enabled: boolean) => void
  highContrast: boolean
  setHighContrast: (enabled: boolean) => void

  // Visual settings
  glowEffects: boolean
  setGlowEffects: (enabled: boolean) => void
  fadeEffects: boolean
  setFadeEffects: (enabled: boolean) => void
  particleIntensity: number
  setParticleIntensity: (intensity: number) => void

  // Performance settings
  performanceMode: boolean
  setPerformanceMode: (enabled: boolean) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  // Animation settings
  const [animationsEnabled, setAnimationsEnabled] = useState(true)
  const [animationType, setAnimationType] = useState<AnimationType>("dots")

  // Mouse interaction settings
  const [mouseEffectsEnabled, setMouseEffectsEnabled] = useState(true)
  const [mouseEffectType, setMouseEffectType] = useState<MouseEffectType>("explode")

  // Accessibility settings
  const [accessibilityMode, setAccessibilityMode] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [highContrast, setHighContrast] = useState(false)

  // Visual settings
  const [glowEffects, setGlowEffects] = useState(true)
  const [fadeEffects, setFadeEffects] = useState(true)
  const [particleIntensity, setParticleIntensity] = useState(50)

  // Performance settings
  const [performanceMode, setPerformanceMode] = useState(false)

  // Load settings from localStorage
  useEffect(() => {
    const loadSetting = (key: string, defaultValue: any) => {
      const saved = localStorage.getItem(key)
      return saved !== null ? JSON.parse(saved) : defaultValue
    }

    setAnimationsEnabled(loadSetting("animationsEnabled", true))
    setAnimationType(loadSetting("animationType", "dots"))
    setMouseEffectsEnabled(loadSetting("mouseEffectsEnabled", true))
    setMouseEffectType(loadSetting("mouseEffectType", "explode"))
    setAccessibilityMode(loadSetting("accessibilityMode", false))
    setReducedMotion(loadSetting("reducedMotion", false))
    setHighContrast(loadSetting("highContrast", false))
    setGlowEffects(loadSetting("glowEffects", true))
    setFadeEffects(loadSetting("fadeEffects", true))
    setParticleIntensity(loadSetting("particleIntensity", 50))
    setPerformanceMode(loadSetting("performanceMode", false))
  }, [])

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem("animationsEnabled", JSON.stringify(animationsEnabled))
  }, [animationsEnabled])

  useEffect(() => {
    localStorage.setItem("animationType", JSON.stringify(animationType))
  }, [animationType])

  useEffect(() => {
    localStorage.setItem("mouseEffectsEnabled", JSON.stringify(mouseEffectsEnabled))
  }, [mouseEffectsEnabled])

  useEffect(() => {
    localStorage.setItem("mouseEffectType", JSON.stringify(mouseEffectType))
  }, [mouseEffectType])

  useEffect(() => {
    localStorage.setItem("accessibilityMode", JSON.stringify(accessibilityMode))
  }, [accessibilityMode])

  useEffect(() => {
    localStorage.setItem("reducedMotion", JSON.stringify(reducedMotion))
  }, [reducedMotion])

  useEffect(() => {
    localStorage.setItem("highContrast", JSON.stringify(highContrast))
  }, [highContrast])

  useEffect(() => {
    localStorage.setItem("glowEffects", JSON.stringify(glowEffects))
  }, [glowEffects])

  useEffect(() => {
    localStorage.setItem("fadeEffects", JSON.stringify(fadeEffects))
  }, [fadeEffects])

  useEffect(() => {
    localStorage.setItem("particleIntensity", JSON.stringify(particleIntensity))
  }, [particleIntensity])

  useEffect(() => {
    localStorage.setItem("performanceMode", JSON.stringify(performanceMode))
  }, [performanceMode])

  // Auto-adjust settings based on accessibility mode
  useEffect(() => {
    if (accessibilityMode) {
      setReducedMotion(true)
      setGlowEffects(false)
      setAnimationType("none")
      setParticleIntensity(0)
      setMouseEffectsEnabled(false)
    }
  }, [accessibilityMode])

  // Auto-adjust settings based on performance mode
  useEffect(() => {
    if (performanceMode) {
      setAnimationType("none")
      setGlowEffects(false)
      setFadeEffects(false)
      setParticleIntensity(25)
      setMouseEffectsEnabled(false)
    }
  }, [performanceMode])

  return (
    <SettingsContext.Provider
      value={{
        animationsEnabled,
        setAnimationsEnabled,
        animationType,
        setAnimationType,
        mouseEffectsEnabled,
        setMouseEffectsEnabled,
        mouseEffectType,
        setMouseEffectType,
        accessibilityMode,
        setAccessibilityMode,
        reducedMotion,
        setReducedMotion,
        highContrast,
        setHighContrast,
        glowEffects,
        setGlowEffects,
        fadeEffects,
        setFadeEffects,
        particleIntensity,
        setParticleIntensity,
        performanceMode,
        setPerformanceMode,
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
