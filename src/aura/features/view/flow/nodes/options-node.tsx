"use client"

import type React from "react"

import { memo, useState, useEffect } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { List, Plus, Minus, X, Sparkles } from "lucide-react"
import { useTheme } from "../../homePanels/ThemeContext"

interface OptionsNodeProps extends NodeProps {
    onRemove?: () => void
    onUpdateData?: (data: any) => void
}

export const OptionsNode = memo(({ data, isConnectable, onRemove, onUpdateData }: OptionsNodeProps) => {
    const [options, setOptions] = useState(data.options || [{ text: "Opção 1", digit: "1" }])
    const [message, setMessage] = useState(data.message || "digita a mensagem")
    const { theme, currentGradient } = useTheme()
    const isDark = theme === "dark"

    useEffect(() => {
        if (data.options) {
            setOptions(data.options)
        }
        if (data.message) {
            setMessage(data.message)
        }
    }, [data.options, data.message])

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (onRemove) onRemove()
    }

    const addOption = () => {
        const newOptions = [...options, { text: `Opção ${options.length + 1}`, digit: `${options.length + 1}` }]
        setOptions(newOptions)
        if (onUpdateData) onUpdateData({ options: newOptions })
    }

    const removeOption = (index: number) => {
        if (options.length > 1) {
            const newOptions = options.filter((_: any, i: number) => i !== index)
            setOptions(newOptions)
            if (onUpdateData) onUpdateData({ options: newOptions })
        }
    }

    const updateOption = (index: number, field: string, value: string) => {
        const newOptions = [...options]
        newOptions[index] = { ...newOptions[index], [field]: value }
        setOptions(newOptions)
        if (onUpdateData) onUpdateData({ options: newOptions })
    }

    const updateMessage = (newMessage: string) => {
        setMessage(newMessage)
        if (onUpdateData) onUpdateData({ message: newMessage })
    }

    const getSecondaryColor = () => {
        const match = currentGradient.secondary.match(/#[0-9a-fA-F]{6}/)
        return match ? match[0] : isDark ? "#d946ef" : "#ec4899"
    }

    const secondaryColor = getSecondaryColor()

    const nodeHeight = Math.max(300, 200 + options.length * 35)
    const hasMany = options.length > 5

    return (
        <div
            className="px-4 py-3 shadow-lg rounded-xl min-w-[280px] max-w-[320px] relative group backdrop-blur-sm"
            style={{
                minHeight: `${nodeHeight}px`,
                background: isDark
                    ? `linear-gradient(135deg, rgba(0,0,0,0.9) 0%, ${secondaryColor}15 100%)`
                    : `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, ${secondaryColor}10 100%)`,
                border: isDark ? `2px solid ${secondaryColor}50` : `2px solid ${secondaryColor}40`,
                boxShadow: isDark ? `0 4px 15px ${secondaryColor}30` : `0 4px 15px ${secondaryColor}20`,
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
                            background: isDark ? `${secondaryColor}20` : `${secondaryColor}15`,
                            borderColor: isDark ? `${secondaryColor}40` : `${secondaryColor}30`,
                        }}
                    >
                        <List className="h-4 w-4" style={{ color: isDark ? secondaryColor : secondaryColor }} />
                    </div>
                    <div className="ml-2">
                        <div
                            className="text-sm font-semibold flex items-center gap-1.5"
                            style={{ color: isDark ? "#f4f4f5" : "#18181b" }}
                        >
                            <Sparkles className="h-3.5 w-3.5" style={{ color: secondaryColor }} />
                            Opções - ID: {data.customId || "#1"}
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-xs mb-2 font-semibold" style={{ color: secondaryColor }}>
                Dicas dos botões
            </div>
            <div className="text-xs mb-2 leading-relaxed" style={{ color: isDark ? "#a1a1aa" : "#71717a" }}>
                A mensagem pode ter até 1024 caracteres. Compatível com emojis e formatação de texto, assim como links.
            </div>
            <div className="text-xs mb-3 leading-relaxed" style={{ color: isDark ? "#a1a1aa" : "#71717a" }}>
                Você pode ter até 3 botões, acima de 3 será gerado uma lista de botões que deve possuir no máximo de 10
                elementos na lista.
            </div>

            <div className="relative mb-3">
        <textarea
            value={message}
            onChange={(e) => updateMessage(e.target.value)}
            className="w-full rounded-lg p-2 min-h-[100px] text-xs resize-none focus:outline-none focus:ring-2"
            style={{
                background: isDark ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.9)",
                border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
                color: isDark ? "#f4f4f5" : "#18181b",
            }}
            placeholder="digita a mensagem"
        />
            </div>

            <div className="space-y-1.5 mb-3">
                {options.map((option: { text: string; digit: string }, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                        <input
                            type="text"
                            value={option.digit || ""}
                            onChange={(e) => updateOption(index, "digit", e.target.value)}
                            className="w-8 p-1.5 border rounded-md text-center text-xs focus:outline-none focus:ring-2"
                            style={{
                                background: isDark ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.9)",
                                border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
                                color: isDark ? "#f4f4f5" : "#18181b",
                            }}
                            placeholder={`${index + 1}`}
                        />
                        <input
                            type="text"
                            value={option.text}
                            onChange={(e) => updateOption(index, "text", e.target.value)}
                            className="flex-1 p-1.5 border rounded-md text-xs focus:outline-none focus:ring-2"
                            style={{
                                background: isDark ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.9)",
                                border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
                                color: isDark ? "#f4f4f5" : "#18181b",
                            }}
                            placeholder="seu texto"
                        />
                        {index === 0 ? (
                            <button
                                onClick={addOption}
                                className="w-6 h-6 bg-gradient-to-br text-white rounded-md flex items-center justify-center transition-all shadow-md hover:scale-105"
                                style={{
                                    background: `linear-gradient(135deg, ${secondaryColor}, ${secondaryColor}dd)`,
                                }}
                            >
                                <Plus className="h-3 w-3" />
                            </button>
                        ) : (
                            <button
                                onClick={() => removeOption(index)}
                                className="w-6 h-6 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-md flex items-center justify-center hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:scale-105"
                            >
                                <Minus className="h-3 w-3" />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <Handle
                type="target"
                position={Position.Top}
                isConnectable={isConnectable}
                className="w-3 h-3 border-2 shadow-lg"
                style={{ background: "#eab308", borderColor: isDark ? "#000" : "#fff" }}
            />

            {options.map((_: any, index: number) => {
                let topPosition: string

                if (hasMany) {
                    const startPercent = 25
                    const endPercent = 85
                    const step = (endPercent - startPercent) / Math.max(1, options.length - 1)
                    topPosition = `${startPercent + index * step}%`
                } else {
                    topPosition = `${40 + index * 15}%`
                }

                return (
                    <Handle
                        key={`output-${index}`}
                        type="source"
                        position={Position.Right}
                        id={`output-${index}`}
                        style={{ top: topPosition, background: "#22c55e", borderColor: isDark ? "#000" : "#fff" }}
                        isConnectable={isConnectable}
                        className="w-3 h-3 border-2 shadow-lg"
                    />
                )
            })}
        </div>
    )
})

OptionsNode.displayName = "OptionsNode"