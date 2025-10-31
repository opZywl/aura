"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Save, RotateCcw } from "lucide-react"
import type { Conversation, AIAgent } from "./types"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ThemeSettings {
    glowEffects?: boolean
    textAnimations?: boolean
}

interface ChatInfoProps {
    agent: AIAgent
    conversation?: Conversation
    onClose: () => void
    onSituationChange?: (newSituation: string) => void
    onPlatformChange?: (newPlatform: string) => void
    theme: string
    themeSettings?: ThemeSettings
}

export default function ChatInfo({
                                     agent,
                                     onClose,
                                     conversation,
                                     onSituationChange,
                                     onPlatformChange,
                                     theme,
                                     themeSettings,
                                 }: ChatInfoProps) {
    const [currentSituation, setCurrentSituation] = useState(conversation?.situacao || "Em Atendimento")
    const [currentPlatform, setCurrentPlatform] = useState(conversation?.platform || "telegram")
    const [observation, setObservation] = useState("")
    const [isEditingObservation, setIsEditingObservation] = useState(false)

    const handleSituationChange = (value: string) => {
        setCurrentSituation(value)
        if (onSituationChange) {
            onSituationChange(value)
        }
    }

    const handlePlatformChange = (value: string) => {
        setCurrentPlatform(value)
        if (onPlatformChange) {
            onPlatformChange(value)
        }
    }

    const handleSaveObservation = () => {
        setIsEditingObservation(false)
        // Save observation logic here
    }

    const handleCancelObservation = () => {
        setObservation("")
        setIsEditingObservation(false)
    }

    // Função para obter o ícone da plataforma
    const getPlatformIcon = (platform: string) => {
        switch (platform?.toLowerCase()) {
            case "telegram":
                return "/redesociais/telegram.svg"
            case "whatsapp":
                return "/redesociais/whatsapp.svg"
            case "messenger":
                return "/redesociais/messenger.svg"
            default:
                return null
        }
    }

    return (
        <div
            className={`w-80 border-l flex flex-col ${theme === "dark" ? "bg-[#1a1a1a] border-[#222222]" : "bg-white border-gray-200"}`}
            style={
                themeSettings?.glowEffects
                    ? {
                        background:
                            theme === "dark"
                                ? "linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%)"
                                : "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
                        borderColor: "var(--chat-glow-color)",
                        boxShadow: "inset 0 0 20px var(--chat-glow-color-light), 0 0 30px var(--chat-glow-color-light)",
                    }
                    : {}
            }
        >
            {/* Header */}
            <div
                className={`p-4 border-b flex items-center justify-between ${theme === "dark" ? "border-[#222222]" : "border-gray-200"}`}
                style={
                    themeSettings?.glowEffects
                        ? {
                            borderColor: "var(--chat-glow-color)",
                            boxShadow: "0 0 15px var(--chat-glow-color-light)",
                        }
                        : {}
                }
            >
                <h3
                    className={`font-semibold text-lg ${theme === "dark" ? "text-white" : "text-gray-900"} ${themeSettings?.glowEffects ? "chat-glow-title" : ""}`}
                    style={
                        themeSettings?.glowEffects
                            ? {
                                textShadow: "0 0 15px var(--chat-glow-color)",
                            }
                            : {}
                    }
                >
                    Info do Contato
                </h3>
                <Button
                    onClick={onClose}
                    variant="ghost"
                    size="sm"
                    className={`bg-red-600 hover:bg-red-700 text-white rounded-full w-8 h-8 p-0 transition-all duration-300 ${themeSettings?.textAnimations ? "hover:scale-110 hover:rotate-90" : ""}`}
                    style={
                        themeSettings?.glowEffects
                            ? {
                                boxShadow: "0 0 15px rgba(239, 68, 68, 0.6)",
                                border: "1px solid rgba(239, 68, 68, 0.8)",
                            }
                            : {}
                    }
                >
                    <X className="w-4 h-4" />
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Profile */}
                <div className="text-center">
                    <div
                        className={`w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-3 ${theme === "dark" ? "bg-[#333333]" : "bg-gray-500"}`}
                    >
                        OP
                    </div>
                    <h4 className={`font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{agent.name}</h4>
                    <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Online</p>
                </div>

                {/* Client Data Fields */}
                <div className="space-y-4">
                    {/* Observação */}
                    <div>
                        <label className="block text-sm font-medium mb-2 text-blue-400">Observação</label>
                        <Textarea
                            placeholder="Nenhuma observação. Clique para adicionar."
                            value={observation}
                            onChange={(e) => setObservation(e.target.value)}
                            onFocus={() => setIsEditingObservation(true)}
                            className={`w-full border-2 border-dashed border-blue-400 ${
                                theme === "dark"
                                    ? "bg-[#222222] text-gray-300 placeholder:text-gray-500"
                                    : "bg-white text-gray-900 placeholder:text-gray-500"
                            }`}
                            rows={3}
                        />
                        {isEditingObservation && (
                            <div className="flex space-x-2 mt-2">
                                <Button
                                    onClick={handleSaveObservation}
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    <Save className="w-3 h-3 mr-1" />
                                    Salvar
                                </Button>
                                <Button
                                    onClick={handleCancelObservation}
                                    size="sm"
                                    variant="outline"
                                    className={theme === "dark" ? "border-gray-600 text-gray-300" : "border-gray-300 text-gray-700"}
                                >
                                    <RotateCcw className="w-3 h-3 mr-1" />
                                    Cancelar
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Plataforma */}
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                            Plataforma
                        </label>
                        <Select value={currentPlatform} onValueChange={handlePlatformChange}>
                            <SelectTrigger
                                className={`w-full ${
                                    theme === "dark"
                                        ? "bg-[#222222] border-[#333333] text-gray-300"
                                        : "bg-white border-gray-300 text-gray-900"
                                }`}
                            >
                                <SelectValue>
                                    <div className="flex items-center space-x-2">
                                        {getPlatformIcon(currentPlatform) && (
                                            <img
                                                src={getPlatformIcon(currentPlatform) || "/placeholder.svg"}
                                                alt={currentPlatform}
                                                className="w-4 h-4"
                                            />
                                        )}
                                        <span className="capitalize">{currentPlatform}</span>
                                    </div>
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent
                                className={theme === "dark" ? "bg-[#222222] border-[#333333]" : "bg-white border-gray-300"}
                            >
                                <SelectItem value="telegram">
                                    <div className="flex items-center space-x-2">
                                        <img src="/redesociais/telegram.svg" alt="Telegram" className="w-4 h-4" />
                                        <span>Telegram</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="whatsapp">
                                    <div className="flex items-center space-x-2">
                                        <img src="/redesociais/whatsapp.svg" alt="WhatsApp" className="w-4 h-4" />
                                        <span>WhatsApp</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="messenger">
                                    <div className="flex items-center space-x-2">
                                        <img src="/redesociais/messenger.svg" alt="Messenger" className="w-4 h-4" />
                                        <span>Messenger</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Número de Telefone */}
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                            Número de Telefone
                        </label>
                        <Input
                            value="Não informado"
                            readOnly
                            className={`w-full ${
                                theme === "dark"
                                    ? "bg-[#222222] border-[#333333] text-gray-300"
                                    : "bg-gray-100 border-gray-300 text-gray-700"
                            }`}
                        />
                    </div>

                    {/* Quantidade de Mensagens */}
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                            Quantidade de Mensagens
                        </label>
                        <Input
                            value="N/A"
                            readOnly
                            className={`w-full ${
                                theme === "dark"
                                    ? "bg-[#222222] border-[#333333] text-gray-300"
                                    : "bg-gray-100 border-gray-300 text-gray-700"
                            }`}
                        />
                    </div>

                    {/* Status (Chat) */}
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                            Status (Chat)
                        </label>
                        <Input
                            value="Desconhecido"
                            readOnly
                            className={`w-full ${
                                theme === "dark"
                                    ? "bg-[#222222] border-[#333333] text-gray-300"
                                    : "bg-gray-100 border-gray-300 text-gray-700"
                            }`}
                        />
                    </div>

                    {/* Situação */}
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                            Situação
                        </label>
                        <Select value={currentSituation} onValueChange={handleSituationChange}>
                            <SelectTrigger
                                className={`w-full ${
                                    theme === "dark"
                                        ? "bg-[#222222] border-[#333333] text-gray-300"
                                        : "bg-white border-gray-300 text-gray-900"
                                }`}
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent
                                className={theme === "dark" ? "bg-[#222222] border-[#333333]" : "bg-white border-gray-300"}
                            >
                                <SelectItem value="Em Atendimento">Em Atendimento</SelectItem>
                                <SelectItem value="Aguardando">Aguardando</SelectItem>
                                <SelectItem value="Finalizado">Finalizado</SelectItem>
                                <SelectItem value="N/D">N/D</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
        </div>
    )
}
