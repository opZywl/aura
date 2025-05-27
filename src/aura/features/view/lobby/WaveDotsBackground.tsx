"use client"

import { useSettings } from "./contexts/SettingsContext"
import BackgroundAnimations from "./BackgroundAnimations"

export default function WaveDotsBackground() {
  const { animationsEnabled, animationType } = useSettings()

  if (!animationsEnabled || animationType === "none") {
    return null
  }

  return <BackgroundAnimations />
}
