"use client"

import type React from "react"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { Settings, X } from "lucide-react"
import type { NodeData } from "@/lib/types"
import { useTheme } from "../../homePanels/ThemeContext"

interface ProcessNodeProps extends NodeProps<NodeData> {
    onRemove?: () => void
}

export const ProcessNode = memo(({ data, isConnectable, onRemove }: ProcessNodeProps) => {
    const { theme, currentGradient } = useTheme()
    const isDark = theme === "dark"

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (onRemove) onRemove()
    }

    const processColor = isDark ? "#10b981" : "#34d399"

    return (
        <div
            className="px-4 py-3 shadow-lg rounded-xl min-w-[200px] max-w-[250px] relative group backdrop-blur-sm"
            style={{
                background: isDark
                    ? `linear-gradient(135deg, rgba(0,0,0,0.9) 0%, ${processColor}15 100%)`
                    : `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, ${processColor}10 100%)`,
                border: isDark ? `2px solid ${processColor}50` : `2px solid ${processColor}40`,
                boxShadow: isDark ? `0 4px 15px ${processColor}30` : `0 4px 15px ${processColor}20`,
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
                        background: isDark ? `${processColor}20` : `${processColor}15`,
                        borderColor: isDark ? `${processColor}40` : `${processColor}30`,
                    }}
                >
                    <Settings className="h-4 w-4" style={{ color: processColor }} />
                </div>
                <div className="ml-2">
                    <div className="text-sm font-semibold" style={{ color: isDark ? "#f4f4f5" : "#18181b" }}>
                        {data.label || "Processo"}
                    </div>
                    <div className="text-xs" style={{ color: isDark ? "#a1a1aa" : "#71717a" }}>
                        {data.description || "Processa dados"}
                    </div>
                </div>
            </div>

            {data.customId && (
                <div
                    className="mt-2 text-xs px-2 py-1 rounded-md font-mono border"
                    style={{
                        background: isDark ? `${processColor}10` : `${processColor}08`,
                        color: processColor,
                        borderColor: isDark ? `${processColor}30` : `${processColor}20`,
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

ProcessNode.displayName = "ProcessNode"