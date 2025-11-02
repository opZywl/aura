"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X, Palette, Plus } from "lucide-react"
import { useTheme } from "./ThemeContext"

// Custom Switch component
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

// Custom Slider component
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

const ColorPanel: React.FC = () => {
    const {
        theme,
        showColorPanel,
        setShowColorPanel,
        glowEnabled,
        setGlowEnabled,
        fadeEnabled,
        setFadeEnabled,
        fadeMode,
        setFadeMode,
        setGradientTheme,
        gradientThemes,
        currentGradient,
        glowIntensity,
        setGlowIntensity,
        glowThickness,
        setGlowThickness,
        glowAnimation,
        setGlowAnimation,
        fadeColor1,
        setFadeColor1,
        fadeColor2,
        setFadeColor2,
        fadeSpeed,
        setFadeSpeed,
        applyGlowFadeSettings,
    } = useTheme()
    const [mounted, setMounted] = useState(false)

    const [customColor1, setCustomColor1] = useState("#3b82f6")
    const [customColor2, setCustomColor2] = useState("#8b5cf6")
    const [customColor3, setCustomColor3] = useState("#ec4899")
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        console.log("Renderização do ColorPanel - showColorPanel:", showColorPanel)
    }, [showColorPanel])

    const createCustomGradient = () => {
        const customGradient = {
            name: "Custom Theme",
            primary: `linear-gradient(135deg, ${customColor1} 0%, ${customColor2} 100%)`,
            secondary: `linear-gradient(135deg, ${customColor1}CC 0%, ${customColor2}CC 100%)`,
            accent: `linear-gradient(135deg, ${customColor1} 0%, ${customColor2} 50%, ${customColor3} 100%)`,
            glow: `${customColor1}99`,
        }
        setGradientTheme(customGradient)
    }

    const saveSettings = () => {
        try {
            const settings = {
                glowEnabled,
                glowIntensity,
                glowThickness,
                glowAnimation,
                fadeEnabled,
                fadeMode,
                fadeColor1,
                fadeColor2,
                fadeSpeed,
            }
            localStorage.setItem("panel-glow-fade-settings", JSON.stringify(settings))
            setHasUnsavedChanges(false)

            // Aplicar as configurações imediatamente
            applyGlowFadeSettings()

            console.log("Configurações salvas e aplicadas:", settings)

            // Feedback visual
            const root = document.documentElement
            root.style.setProperty("--save-feedback", "rgba(34, 197, 94, 0.5)")
            setTimeout(() => {
                root.style.setProperty("--save-feedback", "transparent")
            }, 1000)
        } catch (error) {
            console.error("ERRO ao salvar configurações:", error)
        }
    }

    const resetSettings = () => {
        setGlowEnabled(true)
        setGlowIntensity(100)
        setGlowThickness(20)
        setGlowAnimation(false)
        setFadeEnabled(true)
        setFadeMode("singular")
        setFadeColor1("#3b82f6")
        setFadeColor2("#8b5cf6")
        setFadeSpeed(3)
        setHasUnsavedChanges(true)
    }

    // Detectar mudanças não salvas
    useEffect(() => {
        setHasUnsavedChanges(true)
    }, [
        glowEnabled,
        glowIntensity,
        glowThickness,
        glowAnimation,
        fadeEnabled,
        fadeMode,
        fadeColor1,
        fadeColor2,
        fadeSpeed,
    ])

    if (!showColorPanel) return null

    // Verificação de segurança para gradientThemes
    const safeGradientThemes = gradientThemes || []

    return (
        <>
            {/* Tela de Fundo */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
                onClick={() => setShowColorPanel(false)}
            />

            {/* Painel */}
            <div
                className="fixed right-4 top-20 w-80 rounded-xl shadow-2xl z-50 transition-all duration-300 transform max-h-[80vh] overflow-y-auto scale-100 opacity-100 panel-scrollbar"
                style={{
                    background:
                        theme === "dark"
                            ? "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)"
                            : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                    border: theme === "dark" ? "1px solid #3a3a3a" : "1px solid #e2e8f0",
                    boxShadow: `0 20px 40px rgba(0, 0, 0, 0.3), 0 0 30px var(--glow-color)`,
                }}
            >
                {/* Cabeçalho com Navbar Bonita */}
                <div
                    className="sticky top-0 z-10 border-b"
                    style={{
                        borderColor: theme === "dark" ? "#3a3a3a" : "#e2e8f0",
                        background:
                            theme === "dark"
                                ? "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)"
                                : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                    }}
                >
                    {/* Header Principal */}
                    <div className="flex items-center justify-between p-4">
                        <div className="flex items-center space-x-2">
                            <Palette className={`w-5 h-5 ${theme === "dark" ? "text-blue-400" : "text-blue-600"} glow-title`} />
                            <h3 className={`font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"} glow-title`}>
                                Color Panel
                            </h3>
                        </div>
                        <button
                            onClick={() => setShowColorPanel(false)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 panel-glow ${
                                theme === "dark"
                                    ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                                    : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                            }`}
                        >
                            <X className="w-4 h-4 glow-title" />
                        </button>
                    </div>

                    {/* Navbar de Navegação */}
                    <div className="px-4 pb-3">
                        <div className={`flex space-x-1 p-1 rounded-lg ${theme === "dark" ? "bg-gray-800/50" : "bg-gray-100/50"}`}>
                            <button
                                className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-all duration-200 panel-glow ${
                                    theme === "dark" ? "text-blue-400 bg-blue-500/20 shadow-lg" : "text-blue-600 bg-blue-100 shadow-md"
                                }`}
                            >
                                Colors and Themes
                            </button>
                        </div>
                    </div>

                    {/* Indicador de Mudanças Não Salvas */}
                    {hasUnsavedChanges && (
                        <div
                            className={`px-4 py-2 text-xs text-center ${
                                theme === "dark" ? "text-yellow-400 bg-yellow-500/10" : "text-yellow-600 bg-yellow-100"
                            }`}
                        >
                            Unsaved Changes
                        </div>
                    )}
                </div>

                <div className="p-4 border-b" style={{ borderColor: theme === "dark" ? "#3a3a3a" : "#e2e8f0" }}>
                    <h4 className={`font-medium mb-3 ${theme === "dark" ? "text-white" : "text-gray-900"} glow-title`}>
                        Create Custom Theme
                    </h4>
                    <div className="space-y-3">
                        {[customColor1, customColor2, customColor3].map((col, i) => (
                            <div key={i} className="flex items-center space-x-2">
                                <input
                                    type="color"
                                    value={col}
                                    onChange={(e) =>
                                        i === 0
                                            ? setCustomColor1(e.target.value)
                                            : i === 1
                                                ? setCustomColor2(e.target.value)
                                                : setCustomColor3(e.target.value)
                                    }
                                    className="w-8 h-8 rounded border-0 cursor-pointer panel-glow"
                                />
                                <span className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"} fade-text`}>
                  {i === 0 ? "Primary Color" : i === 1 ? "Secondary Color" : "Accent Color"}
                </span>
                            </div>
                        ))}
                        <button
                            onClick={createCustomGradient}
                            className="w-full p-2 rounded-lg transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2 panel-glow"
                            style={{
                                background: "var(--gradient-accent)",
                            }}
                        >
                            <Plus className="w-4 h-4 text-white glow-title" />
                            <span className="text-white font-medium glow-title">Apply Custom</span>
                        </button>
                    </div>
                </div>

                <div className="p-4 space-y-3">
                    <h4 className={`font-medium mb-3 ${theme === "dark" ? "text-white" : "text-gray-900"} glow-title`}>
                        Predefined Themes
                    </h4>

                    {safeGradientThemes.map((gradient, index) => {
                        const isActive = currentGradient?.name === gradient.name
                        const ringOffsetClass = theme === "dark" ? "ring-offset-gray-900" : "ring-offset-white"

                        return (
                            <button
                                key={index}
                                onClick={() => setGradientTheme(gradient)}
                                className={`w-full p-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02] group relative overflow-hidden panel-glow ${
                                    isActive ? `ring-2 ring-blue-500 ring-offset-2 ${ringOffsetClass}` : ""
                                }`}
                                style={{
                                    background: theme === "dark" ? "#2a2a2a" : "#f8fafc",
                                    border: theme === "dark" ? "1px solid #3a3a3a" : "1px solid #e2e8f0",
                                }}
                            >
                                <div
                                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"
                                    style={{
                                        background: `linear-gradient(135deg, ${gradient.glow?.replace(
                                            "0.6",
                                            "0.1",
                                        )}, ${gradient.glow?.replace("0.6", "0.05")})`,
                                    }}
                                />

                                <div className="relative z-10 flex items-center space-x-3">
                                    <div className="flex space-x-1">
                                        {[gradient.primary, gradient.secondary, gradient.accent].map((bg, i) => (
                                            <div
                                                key={i}
                                                className="w-6 h-6 rounded-full shadow-lg panel-glow"
                                                style={{
                                                    background: bg,
                                                }}
                                            />
                                        ))}
                                    </div>

                                    <div className="flex-1 text-left">
                                        <div className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-900"} glow-title`}>
                                            {gradient.name}
                                        </div>
                                        <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"} fade-text`}>
                                            {isActive ? "Active" : "Click to Apply"}
                                        </div>
                                    </div>

                                    <div
                                        className="w-16 h-8 rounded-lg shadow-lg panel-glow"
                                        style={{
                                            background: gradient.accent,
                                        }}
                                    />
                                </div>
                            </button>
                        )
                    })}
                </div>

                {/* Seção Glow */}
                <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-900"} glow-title`}>
                            Glow Settings
                        </h4>
                        <CustomSwitch checked={glowEnabled} onCheckedChange={setGlowEnabled} />
                    </div>

                    {glowEnabled && (
                        <>
                            <div>
                                <div className="flex justify-between mb-2">
                  <span className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"} fade-text`}>
                    Glow Intensity
                  </span>
                                    <span className={`text-sm glow-title ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    {glowIntensity}%
                  </span>
                                </div>
                                <CustomSlider value={glowIntensity} onValueChange={setGlowIntensity} min={0} max={200} step={5} />
                            </div>

                            <div>
                                <div className="flex justify-between mb-2">
                  <span className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"} fade-text`}>
                    Glow Thickness
                  </span>
                                    <span className={`text-sm glow-title ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    {glowThickness}px
                  </span>
                                </div>
                                <CustomSlider value={glowThickness} onValueChange={setGlowThickness} min={5} max={50} step={1} />
                            </div>

                            <div className="flex items-center justify-between">
                <span className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"} fade-text`}>
                  Glow Animation
                </span>
                                <CustomSwitch checked={glowAnimation} onCheckedChange={setGlowAnimation} />
                            </div>
                        </>
                    )}
                </div>

                {/* Seção Fade */}
                <div className="p-4 space-y-3 border-t" style={{ borderColor: theme === "dark" ? "#3a3a3a" : "#e2e8f0" }}>
                    <div className="flex items-center justify-between">
                        <h4 className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-900"} glow-title`}>
                            Fade Effects
                        </h4>
                        <CustomSwitch checked={fadeEnabled} onCheckedChange={setFadeEnabled} />
                    </div>

                    {fadeEnabled && (
                        <>
                            <div>
                                <label
                                    className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"} text-sm mb-2 block fade-text`}
                                >
                                    Fade Mode
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => setFadeMode("singular")}
                                        className={`p-2 rounded text-sm transition-colors panel-glow ${
                                            fadeMode === "singular"
                                                ? `bg-gray-600 dark:bg-gray-400 text-white`
                                                : `${theme === "dark" ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`
                                        }`}
                                    >
                                        Singular
                                    </button>
                                    <button
                                        onClick={() => setFadeMode("movement")}
                                        className={`p-2 rounded text-sm transition-colors panel-glow ${
                                            fadeMode === "movement"
                                                ? `bg-gray-600 dark:bg-gray-400 text-white`
                                                : `${theme === "dark" ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`
                                        }`}
                                    >
                                        Movement
                                    </button>
                                </div>
                            </div>

                            {fadeMode === "movement" && (
                                <>
                                    <div>
                                        <label
                                            className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"} text-sm mb-2 block fade-text`}
                                        >
                                            Primary Color Fade
                                        </label>
                                        <input
                                            type="color"
                                            value={fadeColor1}
                                            onChange={(e) => setFadeColor1(e.target.value)}
                                            className="w-full h-10 rounded border-0 cursor-pointer panel-glow"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"} text-sm mb-2 block fade-text`}
                                        >
                                            Secondary Color Fade
                                        </label>
                                        <input
                                            type="color"
                                            value={fadeColor2}
                                            onChange={(e) => setFadeColor2(e.target.value)}
                                            className="w-full h-10 rounded border-0 cursor-pointer panel-glow"
                                        />
                                    </div>

                                    <div>
                                        <div className="flex justify-between mb-2">
                      <span className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"} fade-text`}>
                        Movement Speed
                      </span>
                                            <span className={`text-sm glow-title ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                        {fadeSpeed}s
                      </span>
                                        </div>
                                        <CustomSlider value={fadeSpeed} onValueChange={setFadeSpeed} min={1} max={10} step={0.5} />
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>

                {/* Botões de Ação */}
                <div className="p-4 border-t space-y-2" style={{ borderColor: theme === "dark" ? "#3a3a3a" : "#e2e8f0" }}>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={saveSettings}
                            disabled={!hasUnsavedChanges}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 panel-glow ${
                                hasUnsavedChanges
                                    ? "bg-green-500 text-white hover:bg-green-600 shadow-lg hover:shadow-green-500/25"
                                    : "bg-gray-400 text-gray-200 cursor-not-allowed"
                            }`}
                        >
                            Save Settings
                        </button>
                        <button
                            onClick={resetSettings}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 panel-glow ${
                                theme === "dark" ? "bg-red-600 text-white hover:bg-red-700" : "bg-red-500 text-white hover:bg-red-600"
                            } shadow-lg hover:shadow-red-500/25`}
                        >
                            Reset Settings
                        </button>
                    </div>
                </div>

                <div className="p-4 border-t" style={{ borderColor: theme === "dark" ? "#3a3a3a" : "#e2e8f0" }}>
                    <p className={`text-xs text-center ${theme === "dark" ? "text-gray-400" : "text-gray-600"} fade-text`}>
                        Choose Color Theme
                    </p>
                </div>
            </div>
        </>
    )
}

export default ColorPanel
