"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type AnimationType =
  | "dots"
  | "particles"
  | "waves"
  | "geometric"
  | "neural"
  | "matrix"
  | "matrix-rain"
  | "spiral"
  | "constellation"
  | "none"
  | "mix"
export type MouseEffectType =
  | "none"
  | "explode"
  | "fade"
  | "repel"
  | "attract"
  | "sparkle"
  | "rainbow"
  | "magnetic"
  | "vortex"
  | "seguir"
  | "mix"

interface SettingsContextType {
  // Animation settings
  animationsEnabled: boolean
  setAnimationsEnabled: (enabled: boolean) => void
  animationType: AnimationType
  setAnimationType: (type: AnimationType) => void
  particleIntensity: number
  setParticleIntensity: (intensity: number) => void
  currentMixAnimation: string

  // Mouse effects
  mouseEffectsEnabled: boolean
  setMouseEffectsEnabled: (enabled: boolean) => void
  mouseEffectType: MouseEffectType
  setMouseEffectType: (type: MouseEffectType) => void
  currentMixMouseEffect: string

  // Visual effects
  glowEffects: boolean
  setGlowEffects: (enabled: boolean) => void
  fadeEffects: boolean
  setFadeEffects: (enabled: boolean) => void
  glowIntensity: number
  setGlowIntensity: (intensity: number) => void
  shadowEffects: boolean
  setShadowEffects: (enabled: boolean) => void
  blurEffects: boolean
  setBlurEffects: (enabled: boolean) => void
  colorSaturation: number
  setColorSaturation: (saturation: number) => void

  // Performance
  performanceMode: boolean
  setPerformanceMode: (enabled: boolean) => void
  lowEndDevice: boolean
  setLowEndDevice: (enabled: boolean) => void
  batteryOptimization: boolean
  setBatteryOptimization: (enabled: boolean) => void
  reducedAnimations: boolean
  setReducedAnimations: (enabled: boolean) => void
  lowFrameRate: boolean
  setLowFrameRate: (enabled: boolean) => void
  preloadOptimization: boolean
  setPreloadOptimization: (enabled: boolean) => void
  memoryOptimization: boolean
  setMemoryOptimization: (enabled: boolean) => void
}

const AnimationsSettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  // Animation settings
  const [animationsEnabled, setAnimationsEnabled] = useState(true)
  const [animationType, setAnimationType] = useState<AnimationType>("dots")
  const [particleIntensity, setParticleIntensity] = useState(50)
  const [currentMixAnimation, setCurrentMixAnimation] = useState("dots")

  // Mouse effects
  const [mouseEffectsEnabled, setMouseEffectsEnabled] = useState(true)
  const [mouseEffectType, setMouseEffectType] = useState<MouseEffectType>("explode")
  const [currentMixMouseEffect, setCurrentMixMouseEffect] = useState("explode")

  // Visual effects
  const [glowEffects, setGlowEffects] = useState(true)
  const [fadeEffects, setFadeEffects] = useState(true)
  const [glowIntensity, setGlowIntensity] = useState(50)
  const [shadowEffects, setShadowEffects] = useState(true)
  const [blurEffects, setBlurEffects] = useState(true)
  const [colorSaturation, setColorSaturation] = useState(100)

  // Performance
  const [performanceMode, setPerformanceMode] = useState(false)
  const [lowEndDevice, setLowEndDevice] = useState(false)
  const [batteryOptimization, setBatteryOptimization] = useState(false)
  const [reducedAnimations, setReducedAnimations] = useState(false)
  const [lowFrameRate, setLowFrameRate] = useState(false)
  const [preloadOptimization, setPreloadOptimization] = useState(false)
  const [memoryOptimization, setMemoryOptimization] = useState(false)

  // Load settings from localStorage
  useEffect(() => {
    const loadSetting = (key: string, defaultValue: any) => {
      try {
        const saved = localStorage.getItem(key)
        return saved !== null ? JSON.parse(saved) : defaultValue
      } catch {
        return defaultValue
      }
    }

    setAnimationsEnabled(loadSetting("animationsEnabled", true))
    setAnimationType(loadSetting("animationType", "dots"))
    setParticleIntensity(loadSetting("particleIntensity", 50))
    setMouseEffectsEnabled(loadSetting("mouseEffectsEnabled", true))
    setMouseEffectType(loadSetting("mouseEffectType", "explode"))
    setGlowEffects(loadSetting("glowEffects", true))
    setFadeEffects(loadSetting("fadeEffects", true))
    setGlowIntensity(loadSetting("glowIntensity", 50))
    setShadowEffects(loadSetting("shadowEffects", true))
    setBlurEffects(loadSetting("blurEffects", true))
    setColorSaturation(loadSetting("colorSaturation", 100))
    setPerformanceMode(loadSetting("performanceMode", false))
    setLowEndDevice(loadSetting("lowEndDevice", false))
    setBatteryOptimization(loadSetting("batteryOptimization", false))
    setReducedAnimations(loadSetting("reducedAnimations", false))
    setLowFrameRate(loadSetting("lowFrameRate", false))
    setPreloadOptimization(loadSetting("preloadOptimization", false))
    setMemoryOptimization(loadSetting("memoryOptimization", false))
  }, [])

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem("animationsEnabled", JSON.stringify(animationsEnabled))
  }, [animationsEnabled])

  useEffect(() => {
    localStorage.setItem("animationType", JSON.stringify(animationType))
  }, [animationType])

  useEffect(() => {
    localStorage.setItem("particleIntensity", JSON.stringify(particleIntensity))
  }, [particleIntensity])

  useEffect(() => {
    localStorage.setItem("mouseEffectsEnabled", JSON.stringify(mouseEffectsEnabled))
  }, [mouseEffectsEnabled])

  useEffect(() => {
    localStorage.setItem("mouseEffectType", JSON.stringify(mouseEffectType))
  }, [mouseEffectType])

  useEffect(() => {
    localStorage.setItem("glowEffects", JSON.stringify(glowEffects))
  }, [glowEffects])

  useEffect(() => {
    localStorage.setItem("fadeEffects", JSON.stringify(fadeEffects))
  }, [fadeEffects])

  useEffect(() => {
    localStorage.setItem("glowIntensity", JSON.stringify(glowIntensity))
  }, [glowIntensity])

  useEffect(() => {
    localStorage.setItem("shadowEffects", JSON.stringify(shadowEffects))
  }, [shadowEffects])

  useEffect(() => {
    localStorage.setItem("blurEffects", JSON.stringify(blurEffects))
  }, [blurEffects])

  useEffect(() => {
    localStorage.setItem("colorSaturation", JSON.stringify(colorSaturation))
  }, [colorSaturation])

  useEffect(() => {
    localStorage.setItem("performanceMode", JSON.stringify(performanceMode))
  }, [performanceMode])

  useEffect(() => {
    localStorage.setItem("lowEndDevice", JSON.stringify(lowEndDevice))
  }, [lowEndDevice])

  useEffect(() => {
    localStorage.setItem("batteryOptimization", JSON.stringify(batteryOptimization))
  }, [batteryOptimization])

  useEffect(() => {
    localStorage.setItem("reducedAnimations", JSON.stringify(reducedAnimations))
  }, [reducedAnimations])

  useEffect(() => {
    localStorage.setItem("lowFrameRate", JSON.stringify(lowFrameRate))
  }, [lowFrameRate])

  useEffect(() => {
    localStorage.setItem("preloadOptimization", JSON.stringify(preloadOptimization))
  }, [preloadOptimization])

  useEffect(() => {
    localStorage.setItem("memoryOptimization", JSON.stringify(memoryOptimization))
  }, [memoryOptimization])

  // Effect for performance mode - automatically enables optimizations
  useEffect(() => {
    if (performanceMode) {
      setAnimationsEnabled(false)
      setGlowEffects(false)
      setFadeEffects(false)
      setMouseEffectsEnabled(false)
      setParticleIntensity(20)
      setLowFrameRate(true)
      setMemoryOptimization(true)
      setReducedAnimations(true)
      setBatteryOptimization(true)
      setPreloadOptimization(true)
      setBlurEffects(false)
      setShadowEffects(false)
      setGlowIntensity(10)
    }
  }, [performanceMode])

  // Effect for low end device
  useEffect(() => {
    if (lowEndDevice) {
      setAnimationsEnabled(false)
      setGlowEffects(false)
      setMouseEffectsEnabled(false)
      setParticleIntensity(10)
      setLowFrameRate(true)
      setMemoryOptimization(true)
      setBlurEffects(false)
      setShadowEffects(false)
    }
  }, [lowEndDevice])

  // Effect for battery optimization
  useEffect(() => {
    if (batteryOptimization) {
      setAnimationsEnabled(false)
      setGlowEffects(false)
      setMouseEffectsEnabled(false)
      setLowFrameRate(true)
      setReducedAnimations(true)
    }
  }, [batteryOptimization])

  // Effect for mix animation type
  useEffect(() => {
    if (animationType === "mix" && animationsEnabled) {
      const animationTypes: AnimationType[] = [
        "dots",
        "particles",
        "waves",
        "geometric",
        "neural",
        "matrix",
        "matrix-rain",
        "spiral",
        "constellation",
      ]
      const interval = setInterval(() => {
        const randomType = animationTypes[Math.floor(Math.random() * animationTypes.length)]
        setCurrentMixAnimation(randomType)
      }, 8000) // Change every 8 seconds

      return () => clearInterval(interval)
    }
  }, [animationType, animationsEnabled])

  // Effect for mix mouse effect
  useEffect(() => {
    if (mouseEffectType === "mix" && mouseEffectsEnabled) {
      const effectTypes: MouseEffectType[] = [
        "explode",
        "fade",
        "repel",
        "attract",
        "sparkle",
        "rainbow",
        "magnetic",
        "vortex",
        "seguir",
      ]
      const interval = setInterval(() => {
        const randomType = effectTypes[Math.floor(Math.random() * effectTypes.length)]
        setCurrentMixMouseEffect(randomType)
      }, 5000) // Change every 5 seconds

      return () => clearInterval(interval)
    }
  }, [mouseEffectType, mouseEffectsEnabled])

  return (
    <AnimationsSettingsContext.Provider
      value={{
        // Animation settings
        animationsEnabled,
        setAnimationsEnabled,
        animationType,
        setAnimationType,
        particleIntensity,
        setParticleIntensity,
        currentMixAnimation,

        // Mouse effects
        mouseEffectsEnabled,
        setMouseEffectsEnabled,
        mouseEffectType,
        setMouseEffectType,
        currentMixMouseEffect,

        // Visual effects
        glowEffects,
        setGlowEffects,
        fadeEffects,
        setFadeEffects,
        glowIntensity,
        setGlowIntensity,
        shadowEffects,
        setShadowEffects,
        blurEffects,
        setBlurEffects,
        colorSaturation,
        setColorSaturation,

        // Performance
        performanceMode,
        setPerformanceMode,
        lowEndDevice,
        setLowEndDevice,
        batteryOptimization,
        setBatteryOptimization,
        reducedAnimations,
        setReducedAnimations,
        lowFrameRate,
        setLowFrameRate,
        preloadOptimization,
        setPreloadOptimization,
        memoryOptimization,
        setMemoryOptimization,
      }}
    >
      {children}
    </AnimationsSettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(AnimationsSettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
