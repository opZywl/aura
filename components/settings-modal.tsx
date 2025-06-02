"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, RotateCcw, Globe, Eye, Mouse, Accessibility, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSettings, type AnimationType, type MouseEffectType } from "../src/aura/contexts/SettingsContext"
import { useLanguage } from "../src/aura/contexts/LanguageContext"

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState("general")
  const { language, setLanguage, t } = useLanguage()
  const {
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
    currentMixAnimation,
    currentMixMouseEffect,
  } = useSettings()

  const resetToDefaults = () => {
    setAnimationsEnabled(true)
    setAnimationType("dots")
    setMouseEffectsEnabled(true)
    setMouseEffectType("explode")
    setAccessibilityMode(false)
    setReducedMotion(false)
    setHighContrast(false)
    setGlowEffects(true)
    setFadeEffects(true)
    setParticleIntensity(50)
    setPerformanceMode(false)
  }

  const tabs = [
    { id: "general", label: t("settings.tabs.general"), icon: Globe },
    { id: "visual", label: t("settings.tabs.visual"), icon: Eye },
    { id: "mouse", label: t("settings.tabs.mouse"), icon: Mouse },
    { id: "accessibility", label: t("settings.tabs.accessibility"), icon: Accessibility },
    { id: "performance", label: t("settings.tabs.performance"), icon: Zap },
  ]

  const animationTypes: { value: AnimationType; label: string; description: string }[] = [
    {
      value: "dots",
      label: t("settings.animations.types.dots"),
      description: t("settings.animations.descriptions.dots"),
    },
    {
      value: "particles",
      label: t("settings.animations.types.particles"),
      description: t("settings.animations.descriptions.particles"),
    },
    {
      value: "waves",
      label: t("settings.animations.types.waves"),
      description: t("settings.animations.descriptions.waves"),
    },
    {
      value: "geometric",
      label: t("settings.animations.types.geometric"),
      description: t("settings.animations.descriptions.geometric"),
    },
    {
      value: "neural",
      label: t("settings.animations.types.neural"),
      description: t("settings.animations.descriptions.neural"),
    },
    {
      value: "matrix",
      label: t("settings.animations.types.matrix"),
      description: t("settings.animations.descriptions.matrix"),
    },
    {
      value: "matrix-rain",
      label: t("settings.animations.types.matrixRain"),
      description: t("settings.animations.descriptions.matrixRain"),
    },
    {
      value: "spiral",
      label: t("settings.animations.types.spiral"),
      description: t("settings.animations.descriptions.spiral"),
    },
    {
      value: "constellation",
      label: t("settings.animations.types.constellation"),
      description: t("settings.animations.descriptions.constellation"),
    },
    {
      value: "none",
      label: t("settings.animations.types.none"),
      description: t("settings.animations.descriptions.none"),
    },
    { value: "mix", label: t("settings.animations.types.mix"), description: t("settings.animations.descriptions.mix") },
  ]

  const mouseEffectTypes: { value: MouseEffectType; label: string; description: string }[] = [
    { value: "none", label: t("settings.mouse.types.none"), description: t("settings.mouse.descriptions.none") },
    {
      value: "explode",
      label: t("settings.mouse.types.explode"),
      description: t("settings.mouse.descriptions.explode"),
    },
    { value: "fade", label: t("settings.mouse.types.fade"), description: t("settings.mouse.descriptions.fade") },
    { value: "repel", label: t("settings.mouse.types.repel"), description: t("settings.mouse.descriptions.repel") },
    {
      value: "attract",
      label: t("settings.mouse.types.attract"),
      description: t("settings.mouse.descriptions.attract"),
    },
    {
      value: "sparkle",
      label: t("settings.mouse.types.sparkle"),
      description: t("settings.mouse.descriptions.sparkle"),
    },
    {
      value: "rainbow",
      label: t("settings.mouse.types.rainbow"),
      description: t("settings.mouse.descriptions.rainbow"),
    },
    {
      value: "magnetic",
      label: t("settings.mouse.types.magnetic"),
      description: t("settings.mouse.descriptions.magnetic"),
    },
    { value: "vortex", label: t("settings.mouse.types.vortex"), description: t("settings.mouse.descriptions.vortex") },
    { value: "mix", label: t("settings.mouse.types.mix"), description: t("settings.mouse.descriptions.mix") },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">{t("settings.language.title")}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{t("settings.language.description")}</p>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt-BR">{t("settings.language.portuguese")}</SelectItem>
                  <SelectItem value="en-US">{t("settings.language.english")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case "visual":
        return (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{t("settings.animations.title")}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t("settings.animations.description")}</p>
                </div>
                <Switch checked={animationsEnabled} onCheckedChange={setAnimationsEnabled} />
              </div>

              {animationsEnabled && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">{t("settings.animations.backgroundType")}</label>
                    <Select value={animationType} onValueChange={(value: AnimationType) => setAnimationType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {animationTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      {animationTypes.find((t) => t.value === animationType)?.description}
                    </p>
                    {animationType === "mix" && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        {t("settings.animations.descriptions.mix")}: {currentMixAnimation}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">{t("settings.animations.intensity")}</label>
                    <Slider
                      value={[particleIntensity]}
                      onValueChange={(value) => setParticleIntensity(value[0])}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0</span>
                      <span>{particleIntensity}</span>
                      <span>100</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{t("settings.visual.glowEffects")}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t("settings.visual.glowDescription")}</p>
              </div>
              <Switch checked={glowEffects} onCheckedChange={setGlowEffects} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{t("settings.visual.fadeEffects")}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t("settings.visual.fadeDescription")}</p>
              </div>
              <Switch checked={fadeEffects} onCheckedChange={setFadeEffects} />
            </div>
          </div>
        )

      case "mouse":
        return (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{t("settings.mouse.title")}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t("settings.mouse.description")}</p>
                </div>
                <Switch checked={mouseEffectsEnabled} onCheckedChange={setMouseEffectsEnabled} />
              </div>

              {mouseEffectsEnabled && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">{t("settings.mouse.effectType")}</label>
                    <Select
                      value={mouseEffectType}
                      onValueChange={(value: MouseEffectType) => setMouseEffectType(value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {mouseEffectTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      {mouseEffectTypes.find((t) => t.value === mouseEffectType)?.description}
                    </p>
                    {mouseEffectType === "mix" && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        {t("settings.mouse.activeEffect")}: {currentMixMouseEffect}
                      </p>
                    )}
                  </div>

                  {mouseEffectType !== "none" && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-blue-700 dark:text-blue-300">{t("settings.mouse.hoverTip")}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )

      case "accessibility":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{t("settings.accessibility.mode")}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("settings.accessibility.modeDescription")}
                </p>
              </div>
              <Switch checked={accessibilityMode} onCheckedChange={setAccessibilityMode} />
            </div>

            {accessibilityMode && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
                  {t("settings.accessibility.activeFeatures")}
                </h4>
                <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                  {t("settings.accessibility.features").map((feature: string, index: number) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{t("settings.accessibility.reducedMotion")}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("settings.accessibility.reducedMotionDescription")}
                </p>
              </div>
              <Switch checked={reducedMotion} onCheckedChange={setReducedMotion} disabled={accessibilityMode} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{t("settings.accessibility.highContrast")}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("settings.accessibility.highContrastDescription")}
                </p>
              </div>
              <Switch checked={highContrast} onCheckedChange={setHighContrast} />
            </div>
          </div>
        )

      case "performance":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{t("settings.performance.mode")}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t("settings.performance.modeDescription")}</p>
              </div>
              <Switch checked={performanceMode} onCheckedChange={setPerformanceMode} />
            </div>

            {performanceMode && (
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-2">
                  {t("settings.performance.activeFeatures")}
                </h4>
                <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
                  {t("settings.performance.features").map((feature: string, index: number) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-4">
              <h4 className="font-medium">{t("settings.performance.systemStatus")}</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-sm font-medium">{t("settings.performance.animations")}</div>
                  <div className={`text-xs ${animationsEnabled ? "text-green-600" : "text-red-600"}`}>
                    {animationsEnabled ? t("settings.performance.active") : t("settings.performance.inactive")}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-sm font-medium">{t("settings.performance.mouseEffects")}</div>
                  <div className={`text-xs ${mouseEffectsEnabled ? "text-green-600" : "text-red-600"}`}>
                    {mouseEffectsEnabled ? t("settings.performance.active") : t("settings.performance.inactive")}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-sm font-medium">{t("settings.performance.backgroundType")}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{animationType}</div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-sm font-medium">{t("settings.performance.intensity")}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{particleIntensity}%</div>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl max-h-[90vh] overflow-hidden"
          >
            <Card className="h-full flex flex-col">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-2xl font-bold">{t("settings.title")}</h2>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={resetToDefaults}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    {t("settings.resetDefaults")}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={onClose}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-1 overflow-hidden">
                <div className="w-64 border-r p-4 overflow-y-auto">
                  <nav className="space-y-2">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          activeTab === tab.id
                            ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
                            : "hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                      >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>

                <div className="flex-1 p-6 overflow-y-auto">{renderTabContent()}</div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
