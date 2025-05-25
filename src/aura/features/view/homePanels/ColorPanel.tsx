"use client"

import React, { useState, useEffect } from "react"
import { X, Palette, Plus } from "lucide-react"
import { useTheme } from "./ThemeContext"

const ColorPanel: React.FC = () => {
    const {
        showColorPanel,
        setShowColorPanel,
        gradientThemes,
        currentGradient,
        setGradientTheme,
        theme,
    } = useTheme()

    const [customColor1, setCustomColor1] = useState("#3b82f6")
    const [customColor2, setCustomColor2] = useState("#8b5cf6")
    const [customColor3, setCustomColor3] = useState("#ec4899")

    useEffect(() => {
        console.log("🎨 Renderização do ColorPanel - showColorPanel:", showColorPanel)
    }, [showColorPanel])

    if (!showColorPanel) return null

    const createCustomGradient = () => {
        const customGradient = {
            name: "Personalizado",
            primary: `linear-gradient(135deg, ${customColor1} 0%, ${customColor2} 100%)`,
            secondary: `linear-gradient(135deg, ${customColor1}CC 0%, ${customColor2}CC 100%)`,
            accent: `linear-gradient(135deg, ${customColor1} 0%, ${customColor2} 50%, ${customColor3} 100%)`,
            glow: `${customColor1}99`,
        }
        setGradientTheme(customGradient)
    }

    return (
        <>
            {/* Tela de Fundo */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
                onClick={() => setShowColorPanel(false)}
            />

            {/* Painel */}
            <div
                className="fixed right-4 top-20 w-80 rounded-xl shadow-2xl z-50 transition-all duration-300 transform max-h-[80vh] overflow-y-auto scale-100 opacity-100"
                style={{
                    background:
                        theme === "dark"
                            ? "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)"
                            : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                    border: theme === "dark" ? "1px solid #3a3a3a" : "1px solid #e2e8f0",
                    boxShadow: `0 20px 40px rgba(0, 0, 0, 0.3), 0 0 30px var(--glow-color)`,
                }}
            >
                {/* Cabeçalho */}
                <div
                    className="flex items-center justify-between p-4 border-b sticky top-0 z-10"
                    style={{
                        borderColor: theme === "dark" ? "#3a3a3a" : "#e2e8f0",
                        background:
                            theme === "dark"
                                ? "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)"
                                : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                    }}
                >
                    <div className="flex items-center space-x-2">
                        <Palette
                            className={`w-5 h-5 ${
                                theme === "dark" ? "text-blue-400" : "text-blue-600"
                            }`}
                            style={{
                                filter: `drop-shadow(0 0 8px var(--glow-color)) drop-shadow(0 0 16px var(--glow-color))`,
                                textShadow: `0 0 10px var(--glow-color)`,
                            }}
                        />
                        <h3
                            className={`font-semibold ${
                                theme === "dark" ? "text-white" : "text-gray-900"
                            }`}
                            style={{
                                textShadow: `0 0 10px var(--glow-color)`,
                                filter: `drop-shadow(0 0 8px var(--glow-color))`,
                            }}
                        >
                            Temas de Cores
                        </h3>
                    </div>
                    <button
                        onClick={() => setShowColorPanel(false)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 ${
                            theme === "dark"
                                ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                                : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                        }`}
                        style={{ filter: `drop-shadow(0 0 6px var(--glow-color))` }}
                    >
                        <X
                            className="w-4 h-4"
                            style={{ textShadow: `0 0 8px var(--glow-color)` }}
                        />
                    </button>
                </div>

                <div
                    className="p-4 border-b"
                    style={{ borderColor: theme === "dark" ? "#3a3a3a" : "#e2e8f0" }}
                >
                    <h4
                        className={`font-medium mb-3 ${
                            theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                        style={{
                            textShadow: `0 0 8px var(--glow-color)`,
                            filter: `drop-shadow(0 0 6px var(--glow-color))`,
                        }}
                    >
                        Criar Tema Personalizado
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
                                    className="w-8 h-8 rounded border-0 cursor-pointer"
                                    style={{ boxShadow: `0 0 10px var(--glow-color)` }}
                                />
                                <span
                                    className={`text-sm ${
                                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                                    }`}
                                    style={{ textShadow: `0 0 6px var(--glow-color)` }}
                                >
                                    {i === 0
                                        ? "Cor Primária"
                                        : i === 1
                                            ? "Cor Secundária"
                                            : "Cor de Destaque"}
                                </span>
                            </div>
                        ))}
                        <button
                            onClick={createCustomGradient}
                            className="w-full p-2 rounded-lg transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2"
                            style={{
                                background: "var(--gradient-accent)",
                                boxShadow: `0 0 15px var(--glow-color)`,
                            }}
                        >
                            <Plus
                                className="w-4 h-4 text-white"
                                style={{
                                    filter: "drop-shadow(0 0 8px rgba(255, 255, 255, 0.8))",
                                    textShadow: "0 0 10px rgba(255, 255, 255, 0.8)",
                                }}
                            />
                            <span
                                className="text-white font-medium"
                                style={{ textShadow: "0 0 10px rgba(255, 255, 255, 0.8)" }}
                            >
                                Aplicar Personalizado
                            </span>
                        </button>
                    </div>
                </div>

                <div className="p-4 space-y-3">
                    <h4
                        className={`font-medium mb-3 ${
                            theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                        style={{
                            textShadow: `0 0 8px var(--glow-color)`,
                            filter: `drop-shadow(0 0 6px var(--glow-color))`,
                        }}
                    >
                        Temas Predefinidos
                    </h4>

                    {gradientThemes.map((gradient, index) => {
                        const isActive = currentGradient.name === gradient.name
                        const ringOffsetClass =
                            theme === "dark" ? "ring-offset-gray-900" : "ring-offset-white"

                        return (
                            <button
                                key={index}
                                onClick={() => setGradientTheme(gradient)}
                                className={`w-full p-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02] group relative overflow-hidden ${
                                    isActive
                                        ? `ring-2 ring-blue-500 ring-offset-2 ${ringOffsetClass}`
                                        : ""
                                }`}
                                style={{
                                    background: theme === "dark" ? "#2a2a2a" : "#f8fafc",
                                    border: theme === "dark"
                                        ? "1px solid #3a3a3a"
                                        : "1px solid #e2e8f0",
                                    boxShadow: `0 0 10px ${gradient.glow}`,
                                }}
                            >
                                <div
                                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"
                                    style={{
                                        background: `linear-gradient(135deg, ${gradient.glow.replace(
                                            "0.6",
                                            "0.1"
                                        )}, ${gradient.glow.replace("0.6", "0.05")})`,
                                    }}
                                />

                                <div className="relative z-10 flex items-center space-x-3">
                                    <div className="flex space-x-1">
                                        {[gradient.primary, gradient.secondary, gradient.accent].map(
                                            (bg, i) => (
                                                <div
                                                    key={i}
                                                    className="w-6 h-6 rounded-full shadow-lg"
                                                    style={{
                                                        background: bg,
                                                        boxShadow: `0 0 10px ${gradient.glow}`,
                                                    }}
                                                />
                                            )
                                        )}
                                    </div>

                                    <div className="flex-1 text-left">
                                        <div
                                            className={`font-medium ${
                                                theme === "dark" ? "text-white" : "text-gray-900"
                                            }`}
                                            style={{ textShadow: `0 0 8px ${gradient.glow}` }}
                                        >
                                            {gradient.name}
                                        </div>
                                        <div
                                            className={`text-xs ${
                                                theme === "dark" ? "text-gray-400" : "text-gray-600"
                                            }`}
                                            style={{ textShadow: `0 0 6px ${gradient.glow}` }}
                                        >
                                            {isActive ? "Ativo" : "Clique para aplicar"}
                                        </div>
                                    </div>

                                    <div
                                        className="w-16 h-8 rounded-lg shadow-lg"
                                        style={{
                                            background: gradient.accent,
                                            boxShadow: `0 0 15px ${gradient.glow}`,
                                        }}
                                    />
                                </div>
                            </button>
                        )
                    })}
                </div>

                <div
                    className="p-4 border-t"
                    style={{ borderColor: theme === "dark" ? "#3a3a3a" : "#e2e8f0" }}
                >
                    <p
                        className={`text-xs text-center ${
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                        style={{ textShadow: `0 0 6px var(--glow-color)` }}
                    >
                        Escolha um tema de cor para personalizar seu painel
                    </p>
                </div>
            </div>
        </>
    )
}

export default ColorPanel