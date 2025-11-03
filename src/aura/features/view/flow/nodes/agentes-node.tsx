"use client"

import type React from "react"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { Users, X, Sparkles } from "lucide-react"
import { useTheme } from "../../homePanels/ThemeContext"

interface AgentesNodeProps extends NodeProps {
    onRemove?: () => void
    onUpdateData?: (data: any) => void
}

export const AgentesNode = memo(({ data, isConnectable, onRemove }: AgentesNodeProps) => {
    const { theme, currentGradient } = useTheme()
    const isDark = theme === "dark"

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (onRemove) onRemove()
    }

    const getPrimaryColor = () => {
        const match = currentGradient.primary.match(/#[0-9a-fA-F]{6}/)
        return match ? match[0] : isDark ? "#f59e0b" : "#f59e0b"
    }

    const primaryColor = getPrimaryColor()

    return (
        <div
            className="px-4 py-3 shadow-lg rounded-xl min-w-[280px] max-w-[320px] relative group backdrop-blur-sm"
            style={{
                minHeight: "180px",
                background: isDark
                    ? `linear-gradient(135deg, rgba(0,0,0,0.9) 0%, ${primaryColor}15 100%)`
                    : `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, ${primaryColor}10 100%)`,
                border: isDark ? `2px solid ${primaryColor}50` : `2px solid ${primaryColor}40`,
                boxShadow: isDark ? `0 4px 15px ${primaryColor}30` : `0 4px 15px ${primaryColor}20`,
            }}
        >
            <button
                onClick={handleRemove}
                className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-110 z-10"
            >
                <X className="h-3 w-3" />
            </button>

            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                    <div
                        className="rounded-full w-8 h-8 flex items-center justify-center border"
                        style={{
                            background: isDark ? `${primaryColor}20` : `${primaryColor}15`,
                            borderColor: isDark ? `${primaryColor}40` : `${primaryColor}30`,
                        }}
                    >
                        <Users className="h-4 w-4" style={{ color: isDark ? primaryColor : primaryColor }} />
                    </div>
                    <div className="ml-2">
                        <div
                            className="text-sm font-semibold flex items-center gap-1.5"
                            style={{ color: isDark ? "#f4f4f5" : "#18181b" }}
                        >
                            <Sparkles className="h-3.5 w-3.5" style={{ color: primaryColor }} />
                            Agentes - ID: {data.customId || "#1"}
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-xs mb-2 font-semibold" style={{ color: primaryColor }}>
                Transferência para Operador
            </div>
            <div className="text-xs mb-3 leading-relaxed" style={{ color: isDark ? "#a1a1aa" : "#71717a" }}>
                Encaminha a conversa para um operador humano. O bot para de responder e todas as mensagens do operador aparecem
                em negrito.
            </div>

            <div
                className="text-xs p-3 rounded-lg border"
                style={{
                    background: isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.7)",
                    borderColor: isDark ? `${primaryColor}30` : `${primaryColor}20`,
                    color: isDark ? "#d4d4d8" : "#3f3f46",
                }}
            >
                <div className="font-semibold mb-1" style={{ color: primaryColor }}>
                    Como funciona:
                </div>
                <ul className="space-y-1 text-xs">
                    <li>
                        • Mensagens do operador em <strong>negrito</strong>
                    </li>
                    <li>
                        • Comando{" "}
                        <code
                            className="px-1 py-0.5 rounded"
                            style={{ background: isDark ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.1)" }}
                        >
                            /finalizar
                        </code>{" "}
                        encerra
                    </li>
                    <li>• Após encerrar, fluxo reinicia</li>
                </ul>
            </div>

            <Handle
                type="target"
                position={Position.Top}
                isConnectable={isConnectable}
                className="w-3 h-3 border-2 shadow-lg"
                style={{ background: "#eab308", borderColor: isDark ? "#000" : "#fff" }}
            />
        </div>
    )
})

AgentesNode.displayName = "AgentesNode"
