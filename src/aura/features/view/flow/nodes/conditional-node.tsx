"use client"

import type React from "react"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { GitBranch, X } from "lucide-react"
import type { NodeData } from "@/lib/types"
import { useTheme } from "../../homePanels/ThemeContext"

interface ConditionalNodeProps extends NodeProps<NodeData> {
    onRemove?: () => void
}

export const ConditionalNode = memo(({ data, isConnectable, onRemove }: ConditionalNodeProps) => {
    const { theme, currentGradient } = useTheme()
    const isDark = theme === "dark"

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (onRemove) onRemove()
    }

    const getAccentColor = () => {
        const match = currentGradient.accent?.match(/#[0-9a-fA-F]{6}/)
        return match ? match[0] : isDark ? "#f59e0b" : "#fbbf24"
    }

    const accentColor = getAccentColor()

    return (
        <div
            className="px-4 py-3 shadow-lg rounded-xl min-w-[200px] max-w-[250px] relative group backdrop-blur-sm"
            style={{
                background: isDark
                    ? `linear-gradient(135deg, rgba(0,0,0,0.9) 0%, ${accentColor}15 100%)`
                    : `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, ${accentColor}10 100%)`,
                border: isDark ? `2px solid ${accentColor}50` : `2px solid ${accentColor}40`,
                boxShadow: isDark ? `0 4px 15px ${accentColor}30` : `0 4px 15px ${accentColor}20`,
            }}
        >
            <button
                onClick={handleRemove}
                className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-110 z-10"
            >
                <X className="h-3 w-3" />
            </button>

            <div className="flex items-center mb-2">
                <div
                    className="rounded-full w-8 h-8 flex items-center justify-center border"
                    style={{
                        background: isDark ? `${accentColor}20` : `${accentColor}15`,
                        borderColor: isDark ? `${accentColor}40` : `${accentColor}30`,
                    }}
                >
                    <GitBranch className="h-4 w-4" style={{ color: isDark ? accentColor : accentColor }} />
                </div>
                <div className="ml-2">
                    <div className="text-sm font-semibold" style={{ color: isDark ? "#f4f4f5" : "#18181b" }}>
                        {data.label || "Condicional"}
                    </div>
                    <div className="text-xs" style={{ color: isDark ? "#a1a1aa" : "#71717a" }}>
                        {data.description || "Ramificação condicional"}
                    </div>
                </div>
            </div>

            {data.customId && (
                <div
                    className="mt-2 text-xs px-2 py-1 rounded-md font-mono border"
                    style={{
                        background: isDark ? `${accentColor}10` : `${accentColor}08`,
                        color: isDark ? accentColor : accentColor,
                        borderColor: isDark ? `${accentColor}30` : `${accentColor}20`,
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
                style={{ background: "#eab308", borderColor: isDark ? "#000" : "#fff" }}
            />
            <Handle
                type="source"
                position={Position.Left}
                id="false"
                isConnectable={isConnectable}
                className="w-3 h-3 border-2 shadow-lg"
                style={{ background: "#ef4444", borderColor: isDark ? "#000" : "#fff" }}
            />
            <Handle
                type="source"
                position={Position.Right}
                id="true"
                isConnectable={isConnectable}
                className="w-3 h-3 border-2 shadow-lg"
                style={{ background: "#22c55e", borderColor: isDark ? "#000" : "#fff" }}
            />
        </div>
    )
})

ConditionalNode.displayName = "ConditionalNode"
