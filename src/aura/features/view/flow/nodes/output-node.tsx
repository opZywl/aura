"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { FileOutput } from "lucide-react"
import type { NodeData } from "@/lib/types"
import { useTheme } from "../../homePanels/ThemeContext"

export const OutputNode = memo(({ data, isConnectable }: NodeProps<NodeData>) => {
    const { theme, currentGradient } = useTheme()
    const isDark = theme === "dark"

    const outputColor = isDark ? "#22c55e" : "#4ade80"

    return (
        <div
            className="px-4 py-3 shadow-lg rounded-xl min-w-[200px] max-w-[250px] relative group backdrop-blur-sm"
            style={{
                background: isDark
                    ? `linear-gradient(135deg, rgba(0,0,0,0.9) 0%, ${outputColor}15 100%)`
                    : `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, ${outputColor}10 100%)`,
                border: isDark ? `2px solid ${outputColor}50` : `2px solid ${outputColor}40`,
                boxShadow: isDark ? `0 4px 15px ${outputColor}30` : `0 4px 15px ${outputColor}20`,
            }}
        >
            <div className="flex items-center mb-2">
                <div
                    className="rounded-full w-8 h-8 flex items-center justify-center border"
                    style={{
                        background: isDark ? `${outputColor}20` : `${outputColor}15`,
                        borderColor: isDark ? `${outputColor}40` : `${outputColor}30`,
                    }}
                >
                    <FileOutput className="h-4 w-4" style={{ color: outputColor }} />
                </div>
                <div className="ml-2">
                    <div className="text-sm font-semibold" style={{ color: isDark ? "#f4f4f5" : "#18181b" }}>
                        {data.label || "Saída"}
                    </div>
                    <div className="text-xs" style={{ color: isDark ? "#a1a1aa" : "#71717a" }}>
                        {data.description || "Exporta dados processados"}
                    </div>
                </div>
            </div>

            {data.customId && (
                <div
                    className="mt-2 text-xs px-2 py-1 rounded-md font-mono border"
                    style={{
                        background: isDark ? `${outputColor}10` : `${outputColor}08`,
                        color: outputColor,
                        borderColor: isDark ? `${outputColor}30` : `${outputColor}20`,
                    }}
                >
                    ID: {data.customId}
                </div>
            )}

            {data.outputType && (
                <div
                    className="mt-2 text-xs px-2 py-1 rounded-md border"
                    style={{
                        background: isDark ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.9)",
                        color: isDark ? "#d4d4d8" : "#3f3f46",
                        borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                    }}
                >
                    Saída: {data.outputType} ({data.outputFormat || "json"})
                </div>
            )}

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

OutputNode.displayName = "OutputNode"