"use client"

import type React from "react"

import { memo, useState, useEffect } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { Calendar, Plus, Minus, X, Sparkles } from "lucide-react"
import { useTheme } from "../../homePanels/ThemeContext"

interface AgendamentoNodeProps extends NodeProps {
    onRemove?: () => void
    onUpdateData?: (data: any) => void
}

export const AgendamentoNode = memo(({ data, isConnectable, onRemove, onUpdateData }: AgendamentoNodeProps) => {
    const [availableSlots, setAvailableSlots] = useState(
        data.availableSlots || [{ id: "slot-1", time: "09:00", date: "", available: true }],
    )
    const [message, setMessage] = useState(data.message || "Deseja agendar um horário?")
    const { theme, currentGradient } = useTheme()
    const isDark = theme === "dark"

    useEffect(() => {
        if (data.availableSlots) {
            setAvailableSlots(data.availableSlots)
        }
        if (data.message) {
            setMessage(data.message)
        }
    }, [data.availableSlots, data.message])

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (onRemove) onRemove()
    }

    const addSlot = () => {
        const newSlots = [
            ...availableSlots,
            { id: `slot-${availableSlots.length + 1}`, time: "09:00", date: "", available: true },
        ]
        setAvailableSlots(newSlots)
        if (onUpdateData) onUpdateData({ availableSlots: newSlots })
    }

    const removeSlot = (index: number) => {
        if (availableSlots.length > 1) {
            const newSlots = availableSlots.filter((_: any, i: number) => i !== index)
            setAvailableSlots(newSlots)
            if (onUpdateData) onUpdateData({ availableSlots: newSlots })
        }
    }

    const updateSlot = (index: number, field: string, value: string) => {
        const newSlots = [...availableSlots]
        newSlots[index] = { ...newSlots[index], [field]: value }
        setAvailableSlots(newSlots)
        if (onUpdateData) onUpdateData({ availableSlots: newSlots })
    }

    const updateMessage = (newMessage: string) => {
        setMessage(newMessage)
        if (onUpdateData) onUpdateData({ message: newMessage })
    }

    const getPrimaryColor = () => {
        const match = currentGradient.primary.match(/#[0-9a-fA-F]{6}/)
        return match ? match[0] : isDark ? "#10b981" : "#34d399"
    }

    const primaryColor = getPrimaryColor()

    const nodeHeight = Math.max(350, 250 + availableSlots.length * 35)

    return (
        <div
            className="px-4 py-3 shadow-lg rounded-xl min-w-[300px] max-w-[340px] relative group backdrop-blur-sm"
            style={{
                minHeight: `${nodeHeight}px`,
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
                        <Calendar className="h-4 w-4" style={{ color: isDark ? primaryColor : primaryColor }} />
                    </div>
                    <div className="ml-2">
                        <div
                            className="text-sm font-semibold flex items-center gap-1.5"
                            style={{ color: isDark ? "#f4f4f5" : "#18181b" }}
                        >
                            <Sparkles className="h-3.5 w-3.5" style={{ color: primaryColor }} />
                            Agendamento - ID: {data.customId || "#1"}
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-xs mb-2 font-semibold" style={{ color: primaryColor }}>
                Sistema de Agendamento
            </div>
            <div className="text-xs mb-2 leading-relaxed" style={{ color: isDark ? "#a1a1aa" : "#71717a" }}>
                Configure os horários disponíveis. O sistema gerencia automaticamente agendamentos e cancelamentos com códigos
                de confirmação.
            </div>

            <div className="relative mb-3">
        <textarea
            value={message}
            onChange={(e) => updateMessage(e.target.value)}
            className="w-full rounded-lg p-2 min-h-[80px] text-xs resize-none focus:outline-none focus:ring-2"
            style={{
                background: isDark ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.9)",
                border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
                color: isDark ? "#f4f4f5" : "#18181b",
            }}
            placeholder="Mensagem inicial do agendamento"
        />
            </div>

            <div className="space-y-1.5 mb-3">
                <div className="text-xs font-semibold mb-2" style={{ color: primaryColor }}>
                    Horários Disponíveis
                </div>
                {availableSlots.map((slot: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                        <input
                            type="time"
                            value={slot.time || ""}
                            onChange={(e) => updateSlot(index, "time", e.target.value)}
                            className="flex-1 p-1.5 border rounded-md text-xs focus:outline-none focus:ring-2"
                            style={{
                                background: isDark ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.9)",
                                border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
                                color: isDark ? "#f4f4f5" : "#18181b",
                            }}
                        />
                        <input
                            type="date"
                            value={slot.date || ""}
                            onChange={(e) => updateSlot(index, "date", e.target.value)}
                            className="flex-1 p-1.5 border rounded-md text-xs focus:outline-none focus:ring-2"
                            style={{
                                background: isDark ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.9)",
                                border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
                                color: isDark ? "#f4f4f5" : "#18181b",
                            }}
                        />
                        {index === 0 ? (
                            <button
                                onClick={addSlot}
                                className="w-6 h-6 bg-gradient-to-br text-white rounded-md flex items-center justify-center transition-all shadow-md hover:scale-105"
                                style={{
                                    background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`,
                                }}
                            >
                                <Plus className="h-3 w-3" />
                            </button>
                        ) : (
                            <button
                                onClick={() => removeSlot(index)}
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

AgendamentoNode.displayName = "AgendamentoNode"
