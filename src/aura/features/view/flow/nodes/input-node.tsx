"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { Database } from "lucide-react"
import type { NodeData } from "@/lib/types"
import { useTheme } from "../../homePanels/ThemeContext"

export const InputNode = memo(({ data, isConnectable }: NodeProps<NodeData>) => {
    const { theme, currentGradient } = useTheme()
    const isDark = theme === "dark"

    const inputColor = isDark ? "#3b82f6" : "#60a5fa"

    return (
        <div
            className="px-4 py-3 shadow-lg rounded-xl min-w-[200px] max-w-[250px] relative group backdrop-blur-sm"
            style={{
                background: isDark
                    ? `linear-gradient(135deg, rgba(0,0,0,0.9) 0%, ${inputColor}15 100%)`
                    : `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, ${inputColor}10 100%)`,
                border: isDark ? `2px solid ${inputColor}50` : `2px solid ${inputColor}40`,
                boxShadow: isDark ? `0 4px 15px ${inputColor}30` : `0 4px 15px ${inputColor}20`,
            }}
        >
            <div className="flex items-center mb-2">
                <div
                    className="rounded-full w-8 h-8 flex items-center justify-center border"
                    style={{
                        background: isDark ? `${inputColor}20` : `${inputColor}15`,
                        borderColor: isDark ? `${inputColor}40` : `${inputColor}30`,
                    }}
                >
                    <Database className="h-4 w-4" style={{ color: inputColor }} />
                </div>
                <div className="ml-2">
                    <div className="text-sm font-semibold" style={{ color: isDark ? "#f4f4f5" : "#18181b" }}>
                        {data.label || "Entrada"}
                    </div>
                    <div className="text-xs" style={{ color: isDark ? "#a1a1aa" : "#71717a" }}>
                        {data.description || "Recebe dados de entrada"}
                    </div>
                </div>
            </div>

            {data.customId && (
                <div
                    className="mt-2 text-xs px-2 py-1 rounded-md font-mono border"
                    style={{
                        background: isDark ? `${inputColor}10` : `${inputColor}08`,
                        color: inputColor,
                        borderColor: isDark ? `${inputColor}30` : `${inputColor}20`,
                    }}
                >
                    ID: {data.customId}
                </div>
            )}

            {data.dataSource && (
                <div
                    className="mt-2 text-xs px-2 py-1 rounded-md border"
                    style={{
                        background: isDark ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.9)",
                        color: isDark ? "#d4d4d8" : "#3f3f46",
                        borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                    }}
                >
                    Fonte: {data.dataSource}
                </div>
            )}

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

InputNode.displayName = "InputNode"
