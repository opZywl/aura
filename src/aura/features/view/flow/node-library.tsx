"use client"

import type React from "react"
import { useState } from "react"
import {
    Send,
    List,
    Settings,
    GitBranch,
    Code,
    CheckCircle,
    Sparkles,
    HelpCircle,
    ExternalLink,
    Calendar,
} from "lucide-react"
import { useTheme } from "../homePanels/ThemeContext"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

const nodeTypes = [
    {
        type: "sendMessage",
        label: "Enviar Mensagem",
        icon: Send,
        description: "Envia mensagem para o usuário",
    },
    {
        type: "options",
        label: "Opções",
        icon: List,
        description: "Apresenta opções ao usuário",
    },
    {
        type: "agendamento",
        label: "Agendamento",
        icon: Calendar,
        description: "Sistema de agendamento com códigos",
    },
    {
        type: "process",
        label: "Processo",
        icon: Settings,
        description: "Processa dados",
    },
    {
        type: "conditional",
        label: "Condicional",
        icon: GitBranch,
        description: "Ramificação condicional",
    },
    {
        type: "code",
        label: "Código",
        icon: Code,
        description: "Executa código personalizado",
    },
    {
        type: "finalizar",
        label: "Finalizar",
        icon: CheckCircle,
        description: "Finaliza o fluxo",
    },
]

export default function NodeLibrary() {
    const { theme, currentGradient, glowEnabled, glowIntensity, glowThickness } = useTheme()
    const [showHelpDialog, setShowHelpDialog] = useState(false)

    const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
        event.dataTransfer.setData("application/reactflow", nodeType)
        event.dataTransfer.effectAllowed = "move"
    }

    const isDark = theme === "dark"

    // Extract primary color from gradient for solid backgrounds
    const getPrimaryColor = () => {
        // Extract the first color from the gradient string
        const match = currentGradient.primary.match(/#[0-9a-fA-F]{6}/)
        return match ? match[0] : isDark ? "#1e40af" : "#3b82f6"
    }

    const getSecondaryColor = () => {
        // Extract secondary color or derive from primary
        const match = currentGradient.secondary.match(/#[0-9a-fA-F]{6}/)
        return match ? match[0] : isDark ? "#7c3aed" : "#8b5cf6"
    }

    // Generate glow styles based on current theme
    const getGlowStyle = (intensity = 1) => {
        if (!glowEnabled) return {}

        const baseIntensity = (glowIntensity / 100) * intensity
        const thickness = glowThickness * intensity

        return {
            filter: `drop-shadow(0 0 ${thickness}px ${getPrimaryColor()}${Math.round(baseIntensity * 80)
                .toString(16)
                .padStart(2, "0")}) drop-shadow(0 0 ${thickness * 2}px ${getPrimaryColor()}${Math.round(baseIntensity * 40)
                .toString(16)
                .padStart(2, "0")})`,
            textShadow: `0 0 ${thickness}px ${getPrimaryColor()}${Math.round(baseIntensity * 100)
                .toString(16)
                .padStart(2, "0")}`,
        }
    }

    const getContainerGlowStyle = () => {
        if (!glowEnabled)
            return {
                border: isDark ? `1px solid ${getPrimaryColor()}40` : `1px solid ${getPrimaryColor()}30`,
            }

        const baseIntensity = glowIntensity / 100
        const thickness = glowThickness

        return {
            boxShadow: `
      0 0 ${thickness}px ${getPrimaryColor()}${Math.round(baseIntensity * 60)
                .toString(16)
                .padStart(2, "0")},
      0 0 ${thickness * 2}px ${getPrimaryColor()}${Math.round(baseIntensity * 30)
                .toString(16)
                .padStart(2, "0")},
      0 0 ${thickness * 3}px ${getPrimaryColor()}${Math.round(baseIntensity * 15)
                .toString(16)
                .padStart(2, "0")},
      inset 0 0 ${thickness}px ${getPrimaryColor()}${Math.round(baseIntensity * 8)
                .toString(16)
                .padStart(2, "0")}
    `,
            border: `1px solid ${getPrimaryColor()}${Math.round(baseIntensity * 80)
                .toString(16)
                .padStart(2, "0")}`,
        }
    }

    const getHoverGlowStyle = () => {
        if (!glowEnabled)
            return {
                borderColor: isDark ? `${getPrimaryColor()}50` : `${getPrimaryColor()}40`,
                boxShadow: isDark ? `0 4px 15px ${getPrimaryColor()}30` : `0 4px 15px ${getPrimaryColor()}20`,
            }

        const baseIntensity = glowIntensity / 100
        const thickness = glowThickness

        return {
            boxShadow: `
      0 0 ${thickness}px ${getPrimaryColor()}${Math.round(baseIntensity * 70)
                .toString(16)
                .padStart(2, "0")}, 
      0 0 ${thickness * 2}px ${getPrimaryColor()}${Math.round(baseIntensity * 40)
                .toString(16)
                .padStart(2, "0")}, 
      inset 0 0 ${thickness / 2}px ${getPrimaryColor()}${Math.round(baseIntensity * 20)
                .toString(16)
                .padStart(2, "0")}
    `,
            borderColor: `${getPrimaryColor()}${Math.round(baseIntensity * 90)
                .toString(16)
                .padStart(2, "0")}`,
        }
    }

    const handleHelpClick = () => {
        setShowHelpDialog(true)
    }

    const handleGitHubRedirect = () => {
        window.open("https://github.com/opZywl/workflow/issues", "_blank")
        setShowHelpDialog(false)
    }

    return (
        <>
            <div
                className="flex flex-col relative rounded-xl"
                style={{
                    background: "transparent",
                    backdropFilter: "blur(10px)",
                    border: isDark ? `1px solid ${getPrimaryColor()}20` : `1px solid ${getPrimaryColor()}15`,
                    boxShadow: isDark ? `0 4px 12px ${getPrimaryColor()}10` : `0 4px 12px ${getPrimaryColor()}08`,
                }}
            >
                {/* Animated Background Gradient */}
                <div
                    className="absolute inset-0 opacity-10 animate-pulse rounded-xl"
                    style={{
                        background: `linear-gradient(135deg, ${getPrimaryColor()}20, ${getSecondaryColor()}20)`,
                        filter: "blur(40px)",
                    }}
                />

                {/* Header */}
                <div className="relative z-10 px-4 py-4">
                    <div className="flex flex-col items-center justify-center mb-3">
                        <div className="flex items-center gap-3 mb-2">
                            <div
                                className="p-2 rounded-xl transition-all duration-300"
                                style={{
                                    background: `linear-gradient(135deg, ${getPrimaryColor()}, ${getSecondaryColor()})`,
                                    boxShadow: `0 4px 12px ${getPrimaryColor()}40`,
                                    ...getGlowStyle(0.8),
                                }}
                            >
                                <Sparkles className="h-4 w-4 text-white" />
                            </div>
                            <h3
                                className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}
                                style={{
                                    ...getGlowStyle(0.6),
                                    textShadow: isDark ? `0 0 10px ${getPrimaryColor()}60` : `0 0 5px ${getPrimaryColor()}40`,
                                }}
                            >
                                Componentes
                            </h3>
                        </div>
                    </div>

                    <p
                        className={`text-sm font-medium text-center`}
                        style={{
                            ...getGlowStyle(0.2),
                            color: isDark ? `${getPrimaryColor()}cc` : `${getPrimaryColor()}99`,
                        }}
                    >
                        Arraste os componentes para o canvas
                    </p>
                    {/* </CHANGE> */}
                </div>

                <div className="relative z-10 px-3 py-2">
                    <div className="space-y-2">
                        {nodeTypes.map((node, index) => {
                            const IconComponent = node.icon
                            return (
                                <div
                                    key={node.type}
                                    className={`group px-4 py-3 rounded-xl cursor-grab active:cursor-grabbing transition-all duration-300 relative overflow-hidden`}
                                    style={{
                                        background: isDark
                                            ? `linear-gradient(135deg, ${getPrimaryColor()}15 0%, ${getSecondaryColor()}10 50%, ${getPrimaryColor()}15 100%)`
                                            : `linear-gradient(135deg, ${getPrimaryColor()}08 0%, ${getSecondaryColor()}05 50%, ${getPrimaryColor()}08 100%)`,
                                        border: isDark ? `1px solid ${getPrimaryColor()}30` : `1px solid ${getPrimaryColor()}20`,
                                        animationDelay: `${index * 100}ms`,
                                        backdropFilter: "blur(10px)",
                                        boxShadow: isDark ? `0 2px 8px ${getPrimaryColor()}20` : `0 2px 8px ${getPrimaryColor()}15`,
                                    }}
                                    onMouseEnter={(e) => {
                                        const hoverStyle = getHoverGlowStyle()
                                        Object.assign(e.currentTarget.style, {
                                            ...hoverStyle,
                                            background: isDark
                                                ? `linear-gradient(135deg, ${getPrimaryColor()}25 0%, ${getSecondaryColor()}20 50%, ${getPrimaryColor()}25 100%)`
                                                : `linear-gradient(135deg, ${getPrimaryColor()}15 0%, ${getSecondaryColor()}10 50%, ${getPrimaryColor()}15 100%)`,
                                            transform: "translateY(-2px) scale(1.02)",
                                        })
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = isDark
                                            ? `linear-gradient(135deg, ${getPrimaryColor()}15 0%, ${getSecondaryColor()}10 50%, ${getPrimaryColor()}15 100%)`
                                            : `linear-gradient(135deg, ${getPrimaryColor()}08 0%, ${getSecondaryColor()}05 50%, ${getPrimaryColor()}08 100%)`
                                        e.currentTarget.style.borderColor = isDark ? `${getPrimaryColor()}30` : `${getPrimaryColor()}20`
                                        e.currentTarget.style.transform = "translateY(0) scale(1)"
                                        e.currentTarget.style.boxShadow = isDark
                                            ? `0 2px 8px ${getPrimaryColor()}20`
                                            : `0 2px 8px ${getPrimaryColor()}15`
                                    }}
                                    draggable
                                    onDragStart={(event) => onDragStart(event, node.type)}
                                >
                                    {/* Hover gradient overlay */}
                                    <div
                                        className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-300 rounded-xl"
                                        style={{
                                            background: `linear-gradient(135deg, ${getPrimaryColor()}, ${getSecondaryColor()})`,
                                        }}
                                    />

                                    <div className="relative z-10 flex items-center gap-4">
                                        <div
                                            className="p-2.5 rounded-xl transition-all duration-300 group-hover:scale-110"
                                            style={{
                                                background: `linear-gradient(135deg, ${getPrimaryColor()}, ${getSecondaryColor()})`,
                                                boxShadow: `0 4px 12px ${getPrimaryColor()}40`,
                                                ...getGlowStyle(0.4),
                                            }}
                                        >
                                            <IconComponent className="h-4 w-4 text-white" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div
                                                className={`text-sm font-semibold mb-1 group-hover:text-white transition-colors duration-300`}
                                                style={{
                                                    color: isDark ? "#ffffff" : "#1f2937",
                                                    ...getGlowStyle(0.3),
                                                    textShadow: isDark ? `0 0 8px ${getPrimaryColor()}40` : "none",
                                                }}
                                            >
                                                {node.label}
                                            </div>
                                            <div
                                                className={`text-xs group-hover:text-gray-200 transition-colors duration-300 truncate`}
                                                style={{
                                                    color: isDark ? `${getPrimaryColor()}cc` : `${getPrimaryColor()}80`,
                                                    ...getGlowStyle(0.2),
                                                }}
                                            >
                                                {node.description}
                                            </div>
                                        </div>

                                        {/* Drag indicator */}
                                        <div className="flex flex-col gap-1 opacity-40 group-hover:opacity-80 transition-all duration-300">
                                            <div
                                                className={`w-1 h-1 rounded-full`}
                                                style={{
                                                    backgroundColor: isDark ? `${getPrimaryColor()}80` : `${getPrimaryColor()}60`,
                                                    ...getGlowStyle(0.2),
                                                }}
                                            />
                                            <div
                                                className={`w-1 h-1 rounded-full`}
                                                style={{
                                                    backgroundColor: isDark ? `${getPrimaryColor()}80` : `${getPrimaryColor()}60`,
                                                    ...getGlowStyle(0.2),
                                                }}
                                            />
                                            <div
                                                className={`w-1 h-1 rounded-full`}
                                                style={{
                                                    backgroundColor: isDark ? `${getPrimaryColor()}80` : `${getPrimaryColor()}60`,
                                                    ...getGlowStyle(0.2),
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="relative z-10 px-4 py-4">
                    <div className="flex items-center justify-center gap-3">
                        <div
                            className="w-2 h-2 rounded-full animate-pulse"
                            style={{
                                background: `linear-gradient(135deg, ${getPrimaryColor()}, ${getSecondaryColor()})`,
                                ...getGlowStyle(0.6),
                            }}
                        />
                        <button
                            onClick={handleHelpClick}
                            className={`flex items-center gap-1 text-xs font-semibold transition-all duration-300 hover:scale-105 px-2 py-1 rounded-md`}
                            style={{
                                color: isDark ? "#ffffff" : "#1f2937",
                                background: isDark
                                    ? `linear-gradient(135deg, ${getPrimaryColor()}20 0%, ${getSecondaryColor()}15 100%)`
                                    : `linear-gradient(135deg, ${getPrimaryColor()}10 0%, ${getSecondaryColor()}08 100%)`,
                                border: isDark ? `1px solid ${getPrimaryColor()}40` : `1px solid ${getPrimaryColor()}30`,
                                backdropFilter: "blur(10px)",
                                boxShadow: isDark ? `0 2px 8px ${getPrimaryColor()}20` : `0 2px 8px ${getPrimaryColor()}15`,
                                textShadow: isDark ? `0 0 8px ${getPrimaryColor()}40` : "none",
                                ...getGlowStyle(0.2),
                            }}
                            onMouseEnter={(e) => {
                                const hoverStyle = getHoverGlowStyle()
                                Object.assign(e.currentTarget.style, {
                                    ...hoverStyle,
                                    background: isDark
                                        ? `linear-gradient(135deg, ${getPrimaryColor()}30 0%, ${getSecondaryColor()}25 100%)`
                                        : `linear-gradient(135deg, ${getPrimaryColor()}15 0%, ${getSecondaryColor()}12 100%)`,
                                })
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = isDark
                                    ? `linear-gradient(135deg, ${getPrimaryColor()}20 0%, ${getSecondaryColor()}15 100%)`
                                    : `linear-gradient(135deg, ${getPrimaryColor()}10 0%, ${getSecondaryColor()}08 100%)`
                                e.currentTarget.style.borderColor = isDark ? `${getPrimaryColor()}40` : `${getPrimaryColor()}30`
                                e.currentTarget.style.boxShadow = isDark
                                    ? `0 2px 8px ${getPrimaryColor()}20`
                                    : `0 2px 8px ${getPrimaryColor()}15`
                            }}
                        >
                            <HelpCircle className="h-3 w-3" />
                            Precisa de ajuda?
                        </button>
                        <div
                            className="w-2 h-2 rounded-full animate-pulse"
                            style={{
                                background: `linear-gradient(135deg, ${getPrimaryColor()}, ${getSecondaryColor()})`,
                                ...getGlowStyle(0.6),
                                animationDelay: "1s",
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Help Dialog */}
            <Dialog open={showHelpDialog} onOpenChange={setShowHelpDialog}>
                <DialogContent
                    className={`max-w-md mx-auto rounded-xl border-0`}
                    style={{
                        background: isDark
                            ? `linear-gradient(135deg, rgba(0,0,0,0.95) 0%, ${getPrimaryColor()}15 50%, rgba(0,0,0,0.95) 100%)`
                            : `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, ${getPrimaryColor()}10 50%, rgba(255,255,255,0.95) 100%)`,
                        border: isDark ? `1px solid ${getPrimaryColor()}40` : `1px solid ${getPrimaryColor()}30`,
                        boxShadow: isDark
                            ? `0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 40px ${getPrimaryColor()}30`
                            : `0 25px 50px -12px rgba(0, 0, 0, 0.3), 0 0 40px ${getPrimaryColor()}20`,
                        backdropFilter: "blur(20px)",
                    }}
                >
                    <DialogHeader className="text-center">
                        <div className="flex items-center justify-center mb-4">
                            <div
                                className="p-4 rounded-xl"
                                style={{
                                    background: `linear-gradient(135deg, ${getPrimaryColor()}, ${getSecondaryColor()})`,
                                    boxShadow: `0 8px 20px ${getPrimaryColor()}40`,
                                    ...getGlowStyle(0.8),
                                }}
                            >
                                <HelpCircle className="h-6 w-6 text-white" />
                            </div>
                        </div>
                        <DialogTitle
                            className={`text-xl font-bold mb-2`}
                            style={{
                                color: isDark ? "#ffffff" : "#111827",
                                textShadow: isDark ? `0 0 15px ${getPrimaryColor()}60` : `0 0 8px ${getPrimaryColor()}40`,
                                ...getGlowStyle(0.5),
                            }}
                        >
                            Precisa de algum componente?
                        </DialogTitle>
                        <DialogDescription
                            className={`text-sm`}
                            style={{
                                color: isDark ? "#d1d5db" : "#6b7280",
                                textShadow: isDark ? `0 0 5px ${getPrimaryColor()}30` : "none",
                                ...getGlowStyle(0.2),
                            }}
                        >
                            Não encontrou o componente que precisa? Sugira novos componentes para o workflow!
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-6 space-y-4">
                        <div
                            className={`p-4 rounded-xl border`}
                            style={{
                                background: isDark
                                    ? `linear-gradient(135deg, ${getPrimaryColor()}10 0%, ${getSecondaryColor()}05 100%)`
                                    : `linear-gradient(135deg, ${getPrimaryColor()}05 0%, ${getSecondaryColor()}02 100%)`,
                                border: isDark ? `1px solid ${getPrimaryColor()}30` : `1px solid ${getPrimaryColor()}20`,
                                boxShadow: `0 4px 15px ${getPrimaryColor()}20`,
                                backdropFilter: "blur(10px)",
                            }}
                        >
                            <p
                                className={`text-sm font-semibold mb-3`}
                                style={{
                                    color: isDark ? "#ffffff" : "#111827",
                                    ...getGlowStyle(0.3),
                                }}
                            >
                                Como sugerir um componente:
                            </p>
                            <ul className={`text-xs space-y-2`} style={{ color: isDark ? "#d1d5db" : "#6b7280" }}>
                                <li className="flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full" style={{ background: getPrimaryColor() }} />
                                    Descreva o tipo de componente
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full" style={{ background: getPrimaryColor() }} />
                                    Explique como ele funcionaria
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full" style={{ background: getPrimaryColor() }} />
                                    Dê exemplos de uso
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="flex justify-center gap-4 mt-8">
                        <Button
                            onClick={() => setShowHelpDialog(false)}
                            variant="outline"
                            className={`px-6 py-2 rounded-xl font-semibold transition-all duration-300`}
                            style={{
                                background: isDark
                                    ? `linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)`
                                    : `linear-gradient(135deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.05) 100%)`,
                                border: isDark ? `1px solid rgba(255, 255, 255, 0.2)` : `1px solid rgba(0, 0, 0, 0.2)`,
                                color: isDark ? "white" : "black",
                                backdropFilter: "blur(10px)",
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleGitHubRedirect}
                            className={`flex items-center gap-2 font-semibold px-6 py-2 rounded-xl transition-all duration-300 hover:scale-105`}
                            style={{
                                background: `linear-gradient(135deg, ${getPrimaryColor()}, ${getSecondaryColor()})`,
                                color: "white",
                                border: `1px solid ${getPrimaryColor()}60`,
                                boxShadow: `0 4px 15px ${getPrimaryColor()}40, 0 0 20px ${getPrimaryColor()}20`,
                                ...getGlowStyle(0.4),
                            }}
                        >
                            <ExternalLink className="h-4 w-4" />
                            Gerar Sugestão
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
