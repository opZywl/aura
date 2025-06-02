"use client"

import { useState, useEffect } from "react"
import { X, RotateCcw, Eye, Mouse, Zap, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { useSettings, type AnimationType, type MouseEffectType } from "../contexts/SettingsContext"
import { useTheme } from "next-themes"

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [tab, setTab] = useState(0)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  const {
    animationsEnabled,
    setAnimationsEnabled,
    animationType,
    setAnimationType,
    mouseEffectsEnabled,
    setMouseEffectsEnabled,
    mouseEffectType,
    setMouseEffectType,
    glowEffects,
    setGlowEffects,
    particleIntensity,
    setParticleIntensity,
    performanceMode,
    setPerformanceMode,
    glowIntensity,
    setGlowIntensity,
    colorSaturation,
    setColorSaturation,
  } = useSettings()

  // Ensure component is mounted before accessing theme
  useEffect(() => {
    setMounted(true)
  }, [])

  const reset = () => {
    setAnimationsEnabled(true)
    setAnimationType("dots")
    setMouseEffectsEnabled(true)
    setMouseEffectType("explode")
    setGlowEffects(true)
    setParticleIntensity(50)
    setPerformanceMode(false)
    setGlowIntensity(50)
    setColorSaturation(100)
    setTheme("dark")
  }

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      const handleEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose()
      document.addEventListener("keydown", handleEsc)
      return () => {
        document.body.style.overflow = ""
        document.removeEventListener("keydown", handleEsc)
      }
    }
  }, [isOpen, onClose])

  if (!isOpen || !mounted) return null

  const animations = [
    "dots",
    "particles",
    "waves",
    "geometric",
    "neural",
    "matrix",
    "spiral",
    "constellation",
    "none",
    "mix",
  ]

  const mouseEffects = [
    "none",
    "explode",
    "fade",
    "repel",
    "attract",
    "sparkle",
    "rainbow",
    "magnetic",
    "vortex",
    "seguir",
    "mix",
  ]

  const tabs = [
    { icon: Eye, label: "Visual" },
    { icon: Mouse, label: "Mouse" },
    { icon: Palette, label: "Tema" },
    { icon: Zap, label: "Performance" },
  ]

  // Theme-based styles
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)

  const styles = {
    modal: isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200",
    header: isDark ? "border-gray-700" : "border-gray-200",
    text: isDark ? "text-white" : "text-gray-900",
    textSecondary: isDark ? "text-gray-300" : "text-gray-600",
    textMuted: isDark ? "text-gray-400" : "text-gray-500",
    button: isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900",
    tabActive: isDark ? "bg-blue-600 text-white" : "bg-blue-500 text-white",
    tabInactive: isDark
      ? "text-gray-400 hover:text-white hover:bg-gray-800"
      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
    input: isDark ? "bg-gray-800 text-white border-gray-600" : "bg-gray-50 text-gray-900 border-gray-300",
    themeButton: isDark ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200",
    themeButtonActive: isDark ? "bg-blue-600 text-white" : "bg-blue-500 text-white",
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`${styles.modal} rounded-lg w-full max-w-sm border`} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${styles.header}`}>
          <h2 className={`${styles.text} font-medium`}>Preferências</h2>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={reset} className={`h-8 w-8 ${styles.button}`}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className={`h-8 w-8 ${styles.button}`}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className={`flex border-b ${styles.header}`}>
          {tabs.map((t, i) => (
            <button
              key={i}
              onClick={() => setTab(i)}
              className={`flex-1 flex items-center justify-center gap-1 p-3 text-sm transition-colors ${
                tab === i ? styles.tabActive : styles.tabInactive
              }`}
            >
              <t.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
          {/* Visual Tab */}
          {tab === 0 && (
            <>
              <div className="flex items-center justify-between">
                <span className={styles.textSecondary}>Animações</span>
                <Switch checked={animationsEnabled} onCheckedChange={setAnimationsEnabled} />
              </div>

              {animationsEnabled && (
                <>
                  <div>
                    <label className={`${styles.textSecondary} text-sm mb-2 block`}>Tipo</label>
                    <select
                      value={animationType}
                      onChange={(e) => setAnimationType(e.target.value as AnimationType)}
                      className={`w-full ${styles.input} p-2 rounded border`}
                    >
                      {animations.map((type) => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className={`${styles.textSecondary} text-sm`}>Intensidade</span>
                      <span className="text-blue-400 text-sm">{particleIntensity}%</span>
                    </div>
                    <Slider
                      value={[particleIntensity]}
                      onValueChange={([v]) => setParticleIntensity(v)}
                      max={100}
                      step={1}
                    />
                  </div>
                </>
              )}

              <div className="flex items-center justify-between">
                <span className={styles.textSecondary}>Brilho</span>
                <Switch checked={glowEffects} onCheckedChange={setGlowEffects} />
              </div>

              {glowEffects && (
                <div>
                  <div className="flex justify-between mb-2">
                    <span className={`${styles.textSecondary} text-sm`}>Intensidade do Brilho</span>
                    <span className="text-blue-400 text-sm">{glowIntensity}%</span>
                  </div>
                  <Slider value={[glowIntensity]} onValueChange={([v]) => setGlowIntensity(v)} max={100} step={1} />
                </div>
              )}
            </>
          )}

          {/* Mouse Tab */}
          {tab === 1 && (
            <>
              <div className="flex items-center justify-between">
                <span className={styles.textSecondary}>Efeitos de Mouse</span>
                <Switch checked={mouseEffectsEnabled} onCheckedChange={setMouseEffectsEnabled} />
              </div>

              {mouseEffectsEnabled && (
                <div>
                  <label className={`${styles.textSecondary} text-sm mb-2 block`}>Efeito</label>
                  <select
                    value={mouseEffectType}
                    onChange={(e) => setMouseEffectType(e.target.value as MouseEffectType)}
                    className={`w-full ${styles.input} p-2 rounded border`}
                  >
                    {mouseEffects.map((effect) => (
                      <option key={effect} value={effect}>
                        {effect.charAt(0).toUpperCase() + effect.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          {/* Theme Tab */}
          {tab === 2 && (
            <>
              <div>
                <label className={`${styles.textSecondary} text-sm mb-2 block`}>Tema</label>
                <div className="grid grid-cols-3 gap-2">
                  {["light", "dark", "system"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={`p-2 rounded text-sm transition-colors ${
                        theme === t ? styles.themeButtonActive : styles.themeButton
                      }`}
                    >
                      {t === "light" ? "Claro" : t === "dark" ? "Escuro" : "Sistema"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className={`${styles.textSecondary} text-sm`}>Saturação</span>
                  <span className="text-blue-400 text-sm">{colorSaturation}%</span>
                </div>
                <Slider
                  value={[colorSaturation]}
                  onValueChange={([v]) => setColorSaturation(v)}
                  min={50}
                  max={150}
                  step={1}
                />
              </div>
            </>
          )}

          {/* Performance Tab */}
          {tab === 3 && (
            <div className="flex items-center justify-between">
              <div>
                <span className={styles.textSecondary}>Modo Performance</span>
                <p className={`${styles.textMuted} text-xs`}>Reduz efeitos para melhor desempenho</p>
              </div>
              <Switch checked={performanceMode} onCheckedChange={setPerformanceMode} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-4 border-t ${styles.header}`}>
          <Button onClick={onClose} className="w-full">
            Fechar
          </Button>
        </div>
      </div>
    </div>
  )
}
