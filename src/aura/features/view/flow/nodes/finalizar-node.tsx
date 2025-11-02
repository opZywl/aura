"use client"

import type React from "react"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { CheckCircle, X } from "lucide-react"
import type { NodeData } from "@/lib/types"
import { useTheme } from "../../homePanels/ThemeContext"

interface FinalizarNodeProps extends NodeProps<NodeData> {
    onRemove?: () => void
}

export const FinalizarNode = memo(({ data, isConnectable, onRemove }: FinalizarNodeProps) => {
    const { theme, currentGradient } = useTheme()
    const isDark = theme === "dark"

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (onRemove) onRemove()
    }

    const getPrimaryColor = () => {
        const match = currentGradient.primary.match(/#[0-9a-fA-F]{6}/)
        return match ? match[0] : isDark ? "#1e40af" : "#3b82f6"
    }

    const getSecondaryColor = () => {
        const match = currentGradient.secondary.match(/#[0-9a-fA-F]{6}/)
        return match ? match[0] : isDark ? "#7c3aed" : "#8b5cf6"
    }

    const finalizarColor = getPrimaryColor()

    return (
        <div
            className="px-4 py-3 shadow-lg rounded-xl min-w-[180px] relative group backdrop-blur-sm"
            style={{
                background: isDark
                    ? `linear-gradient(135deg, rgba(0,0,0,0.9) 0%, ${finalizarColor}15 100%)`
                    : `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, ${finalizarColor}10 100%)`,
                border: isDark ? `2px solid ${finalizarColor}50` : `2px solid ${finalizarColor}40`,
                boxShadow: isDark ? `0 4px 15px ${finalizarColor}30` : `0 4px 15px ${finalizarColor}20`,
            }}
        >
            <button
                onClick={handleRemove}
                className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-110 z-10"
            >
                <X className="h-3 w-3" />
            </button>

            <div className="flex items-center">
                <div
                    className="rounded-full w-8 h-8 flex items-center justify-center border"
                    style={{
                        background: isDark ? `${finalizarColor}20` : `${finalizarColor}15`,
                        borderColor: isDark ? `${finalizarColor}40` : `${finalizarColor}30`,
                    }}
                >
                    <CheckCircle className="h-4 w-4" style={{ color: finalizarColor }} />
                </div>
                <div className="ml-2">
                    <div className="text-sm font-semibold" style={{ color: isDark ? "#f4f4f5" : "#18181b" }}>
                        Finalizar
                    </div>
                </div>
            </div>

            {data.finalMessage && (
                <div className="mt-2 text-xs text-gray-600 p-2 bg-orange-50 rounded border border-orange-200 max-w-[200px] truncate">
                    {data.finalMessage}
                </div>
            )}

            {data.customId && (
                <div
                    className="mt-2 text-xs px-2 py-1 rounded-md font-mono border"
                    style={{
                        background: isDark ? `${finalizarColor}10` : `${finalizarColor}08`,
                        color: finalizarColor,
                        borderColor: isDark ? `${finalizarColor}30` : `${finalizarColor}20`,
                    }}
                >
                    ID: {data.customId}
                </div>
            )}

            <Handle
                type="target"
                position={Position.Top}
                isConnectable={isConnectable}
                className="w-3 h-3 border-2 shadow-lg"
                style={{ background: getSecondaryColor(), borderColor: isDark ? "#000" : "#fff" }}
            />
        </div>
    )
})

FinalizarNode.displayName = "FinalizarNode"
