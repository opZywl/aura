"use client"

import type React from "react"

import { memo, useState, useEffect } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { Send, X } from "lucide-react"
import type { NodeData } from "@/lib/types"
import { useTheme } from "../../homePanels/ThemeContext"

interface SendMessageNodeProps extends NodeProps<NodeData> {
    onRemove?: () => void
    onUpdateData?: (data: any) => void
}

interface SendMessageNodeData extends NodeData {
    message?: string
}

export const SendMessageNode = memo(({ data, isConnectable, onRemove, onUpdateData }: SendMessageNodeProps) => {
    const typedData = data as SendMessageNodeData
    const [message, setMessage] = useState(typedData.message || "")
    const [isEditing, setIsEditing] = useState(false)
    const { theme, currentGradient } = useTheme()
    const isDark = theme === "dark"

    useEffect(() => {
        if (typedData.message !== undefined && typedData.message !== message) {
            setMessage(typedData.message)
        }
    }, [typedData.message])

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (onRemove) onRemove()
    }

    const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newMessage = e.target.value
        setMessage(newMessage)
        if (onUpdateData) onUpdateData({ message: newMessage })
    }

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        setIsEditing(true)
    }

    const handleBlur = () => {
        setIsEditing(false)
    }

    const getPrimaryColor = () => {
        const match = currentGradient.primary.match(/#[0-9a-fA-F]{6}/)
        return match ? match[0] : isDark ? "#8b5cf6" : "#a855f7"
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

            <div className="flex items-center mb-3">
                <div
                    className="rounded-full w-8 h-8 flex items-center justify-center border"
                    style={{
                        background: isDark ? `${primaryColor}20` : `${primaryColor}15`,
                        borderColor: isDark ? `${primaryColor}40` : `${primaryColor}30`,
                    }}
                >
                    <Send className="h-4 w-4" style={{ color: isDark ? `${primaryColor}` : primaryColor }} />
                </div>
                <div className="ml-2">
                    <div className="text-sm font-semibold" style={{ color: isDark ? "#f4f4f5" : "#18181b" }}>
                        Enviar Mensagem
                    </div>
                </div>
            </div>

            {typedData.customId && (
                <div
                    className="mb-2 text-xs px-2 py-1 rounded-md font-mono border"
                    style={{
                        background: isDark ? `${primaryColor}10` : `${primaryColor}08`,
                        color: isDark ? `${primaryColor}` : primaryColor,
                        borderColor: isDark ? `${primaryColor}30` : `${primaryColor}20`,
                    }}
                >
                    ID: {typedData.customId}
                </div>
            )}

            <div className="text-xs mb-2 font-medium" style={{ color: isDark ? "#a1a1aa" : "#71717a" }}>
                Digite uma mensagem
            </div>

            {isEditing ? (
                <textarea
                    value={message}
                    onChange={handleMessageChange}
                    onBlur={handleBlur}
                    className="w-full rounded-lg p-2 min-h-[60px] text-xs resize-none focus:outline-none focus:ring-2"
                    style={{
                        background: isDark ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.9)",
                        border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
                        color: isDark ? "#f4f4f5" : "#18181b",
                    }}
                    placeholder="Sua mensagem aqui..."
                    autoFocus
                />
            ) : (
                <div
                    onClick={handleClick}
                    className="rounded-lg p-2 min-h-[60px] text-xs cursor-text transition-colors"
                    style={{
                        background: isDark ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.9)",
                        border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
                        color: isDark ? "#f4f4f5" : "#18181b",
                    }}
                >
                    {message || "Sua mensagem aqui..."}
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

SendMessageNode.displayName = "SendMessageNode"
