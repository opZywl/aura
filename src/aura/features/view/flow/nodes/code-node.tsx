"use client"

import type React from "react"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { Code, X } from "lucide-react"
import type { NodeData } from "@/lib/types"
import { useTheme } from "../../homePanels/ThemeContext"

interface CodeNodeProps extends NodeProps<NodeData> {
    onRemove?: () => void
}

export const CodeNode = memo(({ data, isConnectable, onRemove }: CodeNodeProps) => {
    const { theme, currentGradient } = useTheme()
    const isDark = theme === "dark"

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (onRemove) onRemove()
    }

    const getPrimaryColor = () => {
        const match = currentGradient.primary.match(/#[0-9a-fA-F]{6}/)
        return match ? match[0] : isDark ? "#6b7280" : "#9ca3af"
    }

    const primaryColor = getPrimaryColor()

    return (
        <div
            className="px-4 py-3 shadow-lg rounded-xl min-w-[200px] max-w-[250px] relative group backdrop-blur-sm"
            style={{
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

            <div className="flex items-center mb-2">
                <div
                    className="rounded-full w-8 h-8 flex items-center justify-center border"
                    style={{
                        background: isDark ? `${primaryColor}20` : `${primaryColor}15`,
                        borderColor: isDark ? `${primaryColor}40` : `${primaryColor}30`,
                    }}
                >
                    <Code className="h-4 w-4" style={{ color: isDark ? primaryColor : primaryColor }} />
                </div>
                <div className="ml-2">
                    <div className="text-sm font-semibold" style={{ color: isDark ? "#f4f4f5" : "#18181b" }}>
                        {data.label || "Código"}
                    </div>
                    <div className="text-xs" style={{ color: isDark ? "#a1a1aa" : "#71717a" }}>
                        {data.description || "Executa código personalizado"}
                    </div>
                </div>
            </div>

            {data.customId && (
                <div
                    className="mt-2 text-xs px-2 py-1 rounded-md font-mono border"
                    style={{
                        background: isDark ? `${primaryColor}10` : `${primaryColor}08`,
                        color: isDark ? primaryColor : primaryColor,
                        borderColor: isDark ? `${primaryColor}30` : `${primaryColor}20`,
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
                position={Position.Bottom}
                isConnectable={isConnectable}
                className="w-3 h-3 border-2 shadow-lg"
                style={{ background: "#22c55e", borderColor: isDark ? "#000" : "#fff" }}
            />
        </div>
    )
})

CodeNode.displayName = "CodeNode"
