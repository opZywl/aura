"use client"

import { useState, useEffect } from "react"
import { X, RotateCcw, Eye, Mouse, Zap, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSettings, type AnimationType, type MouseEffectType } from "../contexts/AnimationsSettingsContext"
import { useTheme } from "next-themes"

interface SettingsModalProps {
  isOpen: boolean
  onCloseAction: () => void
}

const CustomSwitch = ({
                        checked,
                        onCheckedChange,
                        disabled = false,
                      }: {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
}) => {
  return (
      <button
          onClick={() => !disabled && onCheckedChange(!checked)}
          disabled={disabled}
          className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out
        ${checked ? "bg-gray-600 dark:bg-gray-400" : "bg-gray-400 dark:bg-gray-600"}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        focus:outline-none
      `}
      >
      <span
          className={`
          inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out
          ${checked ? "translate-x-6" : "translate-x-1"}
        `}
      />
      </button>
  )
}

const CustomSlider = ({
                        value,
                        onValueChange,
                        min = 0,
                        max = 100,
                        step = 1,
                      }: {
  value: number
  onValueChange: (value: number) => void
  min?: number
  max?: number
  step?: number
}) => {
  return (
      <div className="relative w-full h-6 flex items-center">
        <div className="absolute w-full h-2 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
        <div
            className="absolute h-2 bg-gray-500 dark:bg-gray-400 rounded-full"
            style={{ width: `${((value - min) / (max - min)) * 100}%` }}
        ></div>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onValueChange(Number(e.target.value))}
            className="absolute w-full h-2 opacity-0 cursor-pointer"
        />
        <div
            className="absolute w-4 h-4 bg-white border-2 border-gray-500 dark:border-gray-400 rounded-full shadow-md"
            style={{ left: `calc(${((value - min) / (max - min)) * 100}% - 8px)` }}
        ></div>
      </div>
  )
}

export default function SettingsModal({ isOpen, onCloseAction }: SettingsModalProps) {
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
      const handleEsc = (e: KeyboardEvent) => e.key === "Escape" && onCloseAction()
      document.addEventListener("keydown", handleEsc)
      return () => {
        document.body.style.overflow = ""
        document.removeEventListener("keydown", handleEsc)
      }
    }
  }, [isOpen, onCloseAction])

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

  return (
      <div
          className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && onCloseAction()}
      >
        <div
            className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg w-full max-w-sm shadow-2xl"
            onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-gray-900 dark:text-white font-medium">Preferências</h2>
            <div className="flex gap-1">
              <Button
                  variant="ghost"
                  size="icon"
                  onClick={reset}
                  className="h-8 w-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 rounded-md"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                  variant="ghost"
                  size="icon"
                  onClick={onCloseAction}
                  className="h-8 w-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 rounded-md"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-800">
            {tabs.map((t, i) => (
                <button
                    key={i}
                    onClick={() => setTab(i)}
                    className={`flex-1 flex items-center justify-center gap-1 p-3 text-sm transition-colors ${
                        tab === i
                            ? "bg-gray-600 dark:bg-gray-400 text-white"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800"
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
                    <span className="text-gray-600 dark:text-gray-300">Animações</span>
                    <CustomSwitch checked={animationsEnabled} onCheckedChange={setAnimationsEnabled} />
                  </div>

                  {animationsEnabled && (
                      <>
                        <div>
                          <label className="text-gray-600 dark:text-gray-300 text-sm mb-2 block">Tipo</label>
                          <select
                              value={animationType}
                              onChange={(e) => setAnimationType(e.target.value as AnimationType)}
                              className="w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 p-2 rounded"
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
                            <span className="text-gray-600 dark:text-gray-300 text-sm">Intensidade</span>
                            <span className="text-gray-900 dark:text-white text-sm font-medium">{particleIntensity}%</span>
                          </div>
                          <CustomSlider
                              value={particleIntensity}
                              onValueChange={setParticleIntensity}
                              min={0}
                              max={100}
                              step={1}
                          />
                        </div>
                      </>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Brilho</span>
                    <CustomSwitch checked={glowEffects} onCheckedChange={setGlowEffects} />
                  </div>

                  {glowEffects && (
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600 dark:text-gray-300 text-sm">Intensidade do Brilho</span>
                          <span className="text-gray-900 dark:text-white text-sm font-medium">{glowIntensity}%</span>
                        </div>
                        <CustomSlider value={glowIntensity} onValueChange={setGlowIntensity} min={0} max={100} step={1} />
                      </div>
                  )}
                </>
            )}

            {/* Mouse Tab */}
            {tab === 1 && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Efeitos de Mouse</span>
                    <CustomSwitch checked={mouseEffectsEnabled} onCheckedChange={setMouseEffectsEnabled} />
                  </div>

                  {mouseEffectsEnabled && (
                      <div>
                        <label className="text-gray-600 dark:text-gray-300 text-sm mb-2 block">Efeito</label>
                        <select
                            value={mouseEffectType}
                            onChange={(e) => setMouseEffectType(e.target.value as MouseEffectType)}
                            className="w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 p-2 rounded"
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
                    <label className="text-gray-600 dark:text-gray-300 text-sm mb-2 block">Tema</label>
                    <div className="grid grid-cols-3 gap-2">
                      {["light", "dark", "system"].map((t) => (
                          <button
                              key={t}
                              onClick={() => setTheme(t)}
                              className={`p-2 rounded text-sm transition-colors border ${
                                  theme === t
                                      ? "bg-gray-600 dark:bg-gray-400 text-white border-gray-600 dark:border-gray-400"
                                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600"
                              }`}
                          >
                            {t === "light" ? "Claro" : t === "dark" ? "Escuro" : "Sistema"}
                          </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600 dark:text-gray-300 text-sm">Saturação</span>
                      <span className="text-gray-900 dark:text-white text-sm font-medium">{colorSaturation}%</span>
                    </div>
                    <CustomSlider value={colorSaturation} onValueChange={setColorSaturation} min={50} max={150} step={1} />
                  </div>
                </>
            )}

            {/* Performance Tab */}
            {tab === 3 && (
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-gray-600 dark:text-gray-300">Modo Performance</span>
                    <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">Reduz efeitos para melhor desempenho</p>
                  </div>
                  <CustomSwitch checked={performanceMode} onCheckedChange={setPerformanceMode} />
                </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <Button
                onClick={onCloseAction}
                className="w-full bg-gray-600 hover:bg-gray-700 dark:bg-gray-400 dark:hover:bg-gray-500 text-white"
            >
              Fechar
            </Button>
          </div>
        </div>
      </div>
  )
}
