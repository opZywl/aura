"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { Play } from "lucide-react"
import type { NodeData } from "@/lib/types"
import { useTheme } from "../../homePanels/ThemeContext"

export const StartNode = memo(({ data, isConnectable }: NodeProps<NodeData>) => {
    const { theme } = useTheme()
    const isDark = theme === "dark"

    const startColor = isDark ? "#10b981" : "#34d399"

    return (
        <div
            className="px-4 py-3 shadow-lg rounded-xl min-w-[200px] relative backdrop-blur-sm"
            style={{
                background: isDark
                    ? `linear-gradient(135deg, ${startColor} 0%, ${startColor}dd 100%)`
                    : `linear-gradient(135deg, ${startColor} 0%, ${startColor}cc 100%)`,
                border: isDark ? `2px solid ${startColor}80` : `2px solid ${startColor}60`,
                boxShadow: isDark ? `0 4px 15px ${startColor}40` : `0 4px 15px ${startColor}30`,
            }}
        >
            <div className="flex items-center">
                <div
                    className="rounded-full w-8 h-8 flex items-center justify-center shadow-md"
                    style={{
                        background: isDark ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.95)",
                    }}
                >
                    <Play className="h-4 w-4" style={{ color: startColor }} />
                </div>
                <div className="ml-2">
                    <div className="text-sm font-bold text-white">{data.label || "INÍCIO"}</div>
                    <div className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.85)" }}>
                        {data.description || "Ponto de início do fluxo"}
                    </div>
                </div>
            </div>

            <Handle
                type="source"
                position={Position.Bottom}
                isConnectable={isConnectable}
                className="w-3 h-3 border-2 shadow-lg"
                style={{ background: "#22c55e", borderColor: "#fff" }}
            />
        </div>
    )
})

StartNode.displayName = "StartNode"
