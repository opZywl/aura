"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import ChatSidebar from "./ChatSidebar"
import ChatHeader from "./ChatHeader"
import ChatMessages from "./ChatMessages"
import ChatInput from "./ChatInput"
import ChatInfo from "./ChatInfo"
import ControlSidebar from "./ControlSidebar"
import ClientDataModal from "./ClientDataModal"
import NewMessageModal from "./NewMessageModal"
import DetailsModal from "./DetailsModal"
import ExitConfirmModal from "./ExitConfirmModal"
import FinalizarModal from "./FinalizarModal"
import type { Conversation, AIAgent, Message, ChatSettings } from "./types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

const determineMessageRole = (sender: string | undefined | null): "user" | "operator" => {
    if (!sender || typeof sender !== "string") {
        console.warn("AVISO: Sender inválido:", sender, "- assumindo como user")
        return "user"
    }

    const operatorSenders = ["operator", "assistant", "bot", "system"]
    const result = operatorSenders.includes(sender.toLowerCase()) ? "operator" : "user"
    console.log(`Anotação determineMessageRole: "${sender}" -> "${result}"`)
    return result
}

const chatAPI = {
    checkHealth: async (): Promise<boolean> => {
        try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 5000)

            const response = await fetch(`${API_BASE_URL}/api/health`, {
                method: "GET",
                signal: controller.signal,
            })

            clearTimeout(timeoutId)
            return response.ok
        } catch (error) {
            console.warn("Conexão Backend API não disponível:", error)
            return false
        }
    },

    // Get all conversations (apenas conversas reais do Telegram)
    getConversations: async (): Promise<any[]> => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/conversations`)
            if (!response.ok) throw new Error("Failed to fetch conversations")

            const data = await response.json()
            console.log("[OK] Conversas reais carregadas:", data)
            return data
        } catch (error) {
            console.error("ERRO: Erro ao carregar conversas:", error)
            return []
        }
    },

    getConversation: async (conversationId: string): Promise<any> => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}`)
            if (!response.ok) throw new Error("Failed to fetch conversation")

            const data = await response.json()
            console.log("[OK] Detalhes da conversa:", data)
            return data
        } catch (error) {
            console.error("ERRO: Erro ao carregar conversa:", error)
            return null
        }
    },

    getMessages: async (conversationId: string, limit?: number, offset?: number): Promise<any[]> => {
        try {
            let url = `${API_BASE_URL}/api/conversations/${conversationId}/messages`
            const params = new URLSearchParams()

            if (limit) params.append("limit", limit.toString())
            if (offset) params.append("offset", offset.toString())

            if (params.toString()) {
                url += `?${params.toString()}`
            }

            const response = await fetch(url)
            if (!response.ok) throw new Error("Failed to fetch messages")

            const data = await response.json()
            console.log(`[OK] ${data.length} mensagens carregadas para conversa ${conversationId}`)
            return data
        } catch (error) {
            console.error("ERRO: Erro ao carregar mensagens:", error)
            return []
        }
    },

    // Send message (integra com Telegram)
    sendMessage: async (conversationId: string, sender: string, text: string): Promise<any> => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sender, text }),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.erro || `HTTP ${response.status}: Failed to send message`)
            }

            const data = await response.json()
            console.log("[OK] Mensagem enviada via API:", data)
            return data
        } catch (error) {
            console.error("ERRO: Erro ao enviar mensagem:", error)
            throw error
        }
    },

    renameConversation: async (conversationId: string, title: string): Promise<any> => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title }),
            })

            if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to rename conversation`)

            const data = await response.json()
            console.log("[OK] Conversa renomeada:", data)
            return data
        } catch (error) {
            console.error("ERRO: Erro ao renomear conversa:", error)
            throw error
        }
    },

    deleteConversation: async (conversationId: string): Promise<void> => {
        try {
            console.log(`Excluir Deletando conversa via API: ${conversationId}`)

            const response = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.erro || `HTTP ${response.status}: Failed to delete conversation`)
            }

            console.log("[OK] Conversa deletada via API com sucesso")
        } catch (error) {
            console.error("ERRO: Erro ao deletar conversa:", error)
            throw error
        }
    },

    deleteMessage: async (conversationId: string, messageId: string): Promise<void> => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}/messages/${messageId}`, {
                method: "DELETE",
            })

            if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to delete message`)
            console.log("[OK] Mensagem deletada via API")
        } catch (error) {
            console.error("ERRO: Erro ao deletar mensagem:", error)
            throw error
        }
    },

    editMessage: async (conversationId: string, messageId: string, text: string): Promise<any> => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}/messages/${messageId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text }),
            })

            if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to edit message`)

            const data = await response.json()
            console.log("[OK] Mensagem editada:", data)
            return data
        } catch (error) {
            console.error("ERRO: Erro ao editar mensagem:", error)
            throw error
        }
    },

    archiveConversation: async (conversationId: string, isArchived: boolean): Promise<any> => {
        try {
            console.log(`${isArchived ? "Arquivando" : "Desarquivando"} conversa: ${conversationId}`)

            const response = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}/archive`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isArchived }),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.erro || `HTTP ${response.status}: Failed to archive conversation`)
            }

            const data = await response.json()
            console.log("[OK] Conversa arquivada via API:", data)
            return data
        } catch (error) {
            console.error("ERRO: Erro ao arquivar conversa:", error)
            throw error
        }
    },

    streamConversation: (conversationId: string, onMessage: (message: any) => void): EventSource => {
        try {
            console.log(`Iniciando stream SSE para conversa: ${conversationId}`)
            const eventSource = new EventSource(`${API_BASE_URL}/api/conversations/${conversationId}/stream`)

            eventSource.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data)
                    console.log("Nova mensagem via SSE:", message)
                    onMessage(message)
                } catch (error) {
                    console.error("ERRO: Erro ao processar mensagem SSE:", error)
                }
            }

            eventSource.onerror = (error) => {
                console.error("ERRO: Erro na conexão SSE:", error)

                setTimeout(() => {
                    console.log("Tentando reconectar SSE...")
                    eventSource.close()
                }, 5000)
            }

            return eventSource
        } catch (error) {
            console.error("ERRO: Erro ao criar conexão SSE:", error)

            return {
                close: () => console.log("Fechando SSE falso"),
            } as unknown as EventSource
        }
    },

    // Debug status
    getDebugStatus: async (): Promise<any> => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/debug/status`)
            if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to fetch debug status`)

            const data = await response.json()
            console.log("Detalhe Status de debug:", data)
            return data
        } catch (error) {
            console.error("ERRO: Erro ao obter status de debug:", error)
            return null
        }
    },

    createTestConversation: async (): Promise<any> => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/test/create-conversation`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            })

            if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to create test conversation`)

            const data = await response.json()
            console.log("Teste Conversa de teste criada:", data)
            return data
        } catch (error) {
            console.error("ERRO: Erro ao criar conversa de teste:", error)
            throw error
        }
    },
}

// Adicionar função de teste de conectividade
const testAPIConnectivity = async () => {
    try {
        console.log("Detalhe Testando conectividade da API...")

        const response = await fetch(`${API_BASE_URL}/api/health`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        })

        if (response.ok) {
            const data = await response.json()
            console.log("[OK] API conectada:", data)
            return true
        } else {
            console.error("ERRO: API retornou erro:", response.status)
            return false
        }
    } catch (error) {
        console.error("ERRO: Erro de conectividade:", error)
        return false
    }
}

// Agent data
const mockAgent: AIAgent = {
    id: "1",
    name: "Aura Assistant",
    status: "online" as const,
}

interface ConversationCounts {
    active: number
    waiting: number
}

interface PerformanceSettings {
    performanceMode: boolean
    reducedAnimations: boolean
    lowFrameRate: boolean
    memoryOptimization: boolean
}

export interface ThemeSettings {
    glowEffects: boolean
    textAnimations: boolean
    glowIntensity: number
    glowThickness: number
    glowAnimation: boolean
    fadeMode: "singular" | "movement"
    fadeColor1: string
    fadeColor2: string
    fadeSpeed: number
    fadeEnabled: boolean
    currentGradient: string
}

// Configurações padrão
const DEFAULT_THEME_SETTINGS: ThemeSettings = {
    glowEffects: true,
    textAnimations: true,
    glowIntensity: 100,
    glowThickness: 20,
    glowAnimation: true,
    fadeMode: "movement",
    fadeColor1: "#3b82f6",
    fadeColor2: "#8b5cf6",
    fadeSpeed: 3,
    fadeEnabled: true,
    currentGradient: "Blue Purple",
}

// Função para aplicar configurações CSS
const applyThemeSettingsToCSS = (settings: ThemeSettings, theme: string) => {
    const root = document.documentElement

    console.log("Aplicando configurações de tema:", settings)

    // Apply glow settings
    if (settings.glowEffects) {
        const intensity = settings.glowIntensity / 100
        const thickness = settings.glowThickness

        root.style.setProperty("--chat-glow-intensity", intensity.toString())
        root.style.setProperty("--chat-glow-thickness", `${thickness}px`)
        root.style.setProperty("--chat-glow-blur", `${thickness}px`)
        root.style.setProperty("--chat-glow-spread", `${thickness / 2}px`)

        const glowStyle = `0 0 ${thickness}px var(--chat-glow-color), 0 0 ${thickness * 2}px var(--chat-glow-color-light)`
        root.style.setProperty("--chat-title-glow", glowStyle)

        if (settings.glowAnimation) {
            root.style.setProperty("--chat-glow-animation", "glow-pulse 2s ease-in-out infinite alternate")
        } else {
            root.style.setProperty("--chat-glow-animation", "none")
        }

        console.log("[OK] Glow effects aplicados:", { intensity, thickness, animation: settings.glowAnimation })
    } else {
        root.style.setProperty("--chat-glow-intensity", "0")
        root.style.setProperty("--chat-glow-thickness", "0px")
        root.style.setProperty("--chat-title-glow", "none")
        root.style.setProperty("--chat-glow-animation", "none")
        console.log("ERRO: Glow effects desabilitados")
    }

    // Apply fade settings
    if (settings.fadeEnabled) {
        const color1 = settings.fadeColor1 || (theme === "dark" ? "#ffffff" : "#000000")
        const color2 = settings.fadeColor2 || (theme === "dark" ? "#000000" : "#ffffff")

        root.style.setProperty("--chat-fade-color-1", color1)
        root.style.setProperty("--chat-fade-color-2", color2)
        root.style.setProperty("--chat-fade-speed", `${settings.fadeSpeed}s`)

        if (settings.fadeMode === "movement") {
            root.style.setProperty(
                "--chat-fade-animation",
                `color-shift ${settings.fadeSpeed}s ease-in-out infinite alternate`,
            )
        } else {
            root.style.setProperty("--chat-fade-animation", "none")
        }

        console.log("[OK] Fade effects aplicados:", {
            color1: settings.fadeColor1,
            color2: settings.fadeColor2,
            speed: settings.fadeSpeed,
            mode: settings.fadeMode,
        })
    } else {
        root.style.setProperty("--chat-fade-animation", "none")
        console.log("ERRO: Fade effects desabilitados")
    }

    // Apply text animations
    if (settings.textAnimations) {
        root.style.setProperty("--chat-text-animations", "1")
        console.log("[OK] Text animations habilitadas")
    } else {
        root.style.setProperty("--chat-text-animations", "0")
        console.log("ERRO: Text animations desabilitadas")
    }

    // Apply theme colors
    const gradients = {
        "Blue Purple": {
            primary: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
            secondary: "linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)",
            accent: "linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)",
            glow: "rgba(59, 130, 246, 0.6)",
            glowLight: "rgba(59, 130, 246, 0.3)",
            glowStrong: "rgba(59, 130, 246, 0.8)",
        },
        "Green Teal": {
            primary: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
            secondary: "linear-gradient(135deg, #34d399 0%, #22d3ee 100%)",
            accent: "linear-gradient(135deg, #059669 0%, #0891b2 100%)",
            glow: "rgba(16, 185, 129, 0.6)",
            glowLight: "rgba(16, 185, 129, 0.3)",
            glowStrong: "rgba(16, 185, 129, 0.8)",
        },
        "Orange Red": {
            primary: "linear-gradient(135deg, #f97316 0%, #ef4444 100%)",
            secondary: "linear-gradient(135deg, #fb923c 0%, #f87171 100%)",
            accent: "linear-gradient(135deg, #ea580c 0%, #dc2626 100%)",
            glow: "rgba(249, 115, 22, 0.6)",
            glowLight: "rgba(249, 115, 22, 0.3)",
            glowStrong: "rgba(249, 115, 22, 0.8)",
        },
        "Purple Pink": {
            primary: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
            secondary: "linear-gradient(135deg, #a78bfa 0%, #f472b6 100%)",
            accent: "linear-gradient(135deg, #7c3aed 0%, #db2777 100%)",
            glow: "rgba(139, 92, 246, 0.6)",
            glowLight: "rgba(139, 92, 246, 0.3)",
            glowStrong: "rgba(139, 92, 246, 0.8)",
        },
        "Cyan Blue": {
            primary: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
            secondary: "linear-gradient(135deg, #22d3ee 0%, #60a5fa 100%)",
            accent: "linear-gradient(135deg, #0891b2 0%, #1d4ed8 100%)",
            glow: "rgba(6, 182, 212, 0.6)",
            glowLight: "rgba(6, 182, 212, 0.3)",
            glowStrong: "rgba(6, 182, 212, 0.8)",
        },
        "Pure Black": {
            primary: "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)",
            secondary: "linear-gradient(135deg, #0a0a0a 0%, #2a2a2a 100%)",
            accent: "linear-gradient(135deg, #000000 0%, #333333 100%)",
            glow: "rgba(255, 255, 255, 0.6)",
            glowLight: "rgba(255, 255, 255, 0.3)",
            glowStrong: "rgba(255, 255, 255, 0.8)",
        },
        "Pure White": {
            primary: "linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)",
            secondary: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
            accent: "linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)",
            glow: "rgba(0, 0, 0, 0.6)",
            glowLight: "rgba(0, 0, 0, 0.3)",
            glowStrong: "rgba(0, 0, 0, 0.8)",
        },
    }

    const currentGradient = gradients[settings.currentGradient as keyof typeof gradients] || gradients["Blue Purple"]

    root.style.setProperty("--chat-gradient-primary", currentGradient.primary)
    root.style.setProperty("--chat-gradient-secondary", currentGradient.secondary)
    root.style.setProperty("--chat-gradient-accent", currentGradient.accent)
    root.style.setProperty("--chat-glow-color", currentGradient.glow)
    root.style.setProperty("--chat-glow-color-light", currentGradient.glowLight)
    root.style.setProperty("--chat-glow-color-strong", currentGradient.glowStrong)

    console.log("Tema aplicado:", settings.currentGradient)
}

// Component that uses the language context
const ChatTemplateContent = () => {
    const { theme, setTheme } = useTheme()
    const resolvedTheme = theme ?? "dark"
    const [mounted, setMounted] = useState(false)
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [loading, setLoading] = useState(true)
    const [apiAvailable, setApiAvailable] = useState(false)
    const [showInfo, setShowInfo] = useState(false)
    const [showClientData, setShowClientData] = useState(false)
    const [showNewMessage, setShowNewMessage] = useState(false)
    const [showDetails, setShowDetails] = useState(false)
    const [hideTagsMode, setHideTagsMode] = useState(false)
    const [showExitConfirm, setShowExitConfirm] = useState(false)
    const [showFinalizarModal, setShowFinalizarModal] = useState(false)
    const [isEditingNickname, setIsEditingNickname] = useState(false)
    const [sidebarHidden, setSidebarHidden] = useState(false)
    const [controlSidebarHidden, setControlSidebarHidden] = useState(false)
    const [activeFilter, setActiveFilter] = useState<"all" | "active" | "waiting">("all")
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [performanceSettings, setPerformanceSettings] = useState<PerformanceSettings>({
        performanceMode: false,
        reducedAnimations: false,
        lowFrameRate: false,
        memoryOptimization: false,
    })
    const [settings, setSettings] = useState<ChatSettings>({
        theme: "dark",
        glowEffects: false,
        animations: true,
        sounds: true,
        notifications: true,
        isFullscreen: false,
    })
    const [userName, setUserName] = useState<string | null>(null)

    // Theme settings com carregamento do localStorage
    const [themeSettings, setThemeSettings] = useState<ThemeSettings>(DEFAULT_THEME_SETTINGS)

    // SSE connection for real-time updates
    const [sseConnection, setSseConnection] = useState<EventSource | null>(null)

    // Check API availability and load conversations
    const loadConversations = async () => {
        try {
            setLoading(true)
            console.log("Verificando disponibilidade da API...")

            const isAvailable = await chatAPI.checkHealth()
            setApiAvailable(isAvailable)

            if (!isAvailable) {
                console.warn("AVISO: API não disponível - Chat funcionará apenas quando houver conversas do Telegram")
                setConversations([])
                setLoading(false)
                return
            }

            console.log("Carregando conversas reais do Telegram...")
            const apiConversations = await chatAPI.getConversations()

            const formattedConversations: Conversation[] = apiConversations.map((conv) => ({
                id: conv.id,
                title: conv.title,
                lastMessage: conv.lastMessage || "",
                messages: [],
                unreadCount: 0,
                status: "online" as const,
                createdAt: conv.createdAt ? new Date(conv.createdAt) : new Date(),
                updatedAt: conv.lastAt ? new Date(conv.lastAt) : new Date(),
                isPinned: false,
                situacao: "Em Atendimento",
                isArchived: false,
                platform: conv.platform || "telegram", // Adicionar platform das conversas reais
            }))

            setConversations(formattedConversations)
            console.log(`[OK] ${formattedConversations.length} conversas reais carregadas`)

            // Set first conversation as current if exists
            if (formattedConversations.length > 0 && !currentConversation) {
                setCurrentConversation(formattedConversations[0])
                await loadMessages(formattedConversations[0].id)
            }
        } catch (error) {
            console.error("ERRO: Erro ao carregar conversas:", error)
            setConversations([])
        } finally {
            setLoading(false)
        }
    }

    // Load messages for a conversation - com lógica consistente de role
    const loadMessages = async (conversationId: string) => {
        try {
            console.log(`Carregando mensagens para conversa: ${conversationId}`)
            const apiMessages = await chatAPI.getMessages(conversationId)

            const formattedMessages: Message[] = apiMessages
                .map((msg, index) => {
                    const role = determineMessageRole(msg.sender)
                    console.log(`Anotação Mensagem ${index}: sender="${msg.sender}" -> role="${role}"`)

                    return {
                        id: msg.id || `api-${conversationId}-${index}-${Date.now()}`,
                        content: msg.text,
                        role: role,
                        timestamp: new Date(msg.timestamp),
                        status: "sent" as const,
                    }
                })
                .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()) // Ordenar por timestamp

            setMessages(formattedMessages)
            console.log(`[OK] ${formattedMessages.length} mensagens carregadas e ordenadas`)
        } catch (error) {
            console.error("ERRO: Erro ao carregar mensagens:", error)
            setMessages([])
        }
    }

    // Send message (integra com Telegram) - CORRIGIDO para enviar realmente
    const sendMessage = async (content: string) => {
        if (!currentConversation || !apiAvailable) {
            console.warn("AVISO: Não é possível enviar mensagem - conversa ou API indisponível")
            return
        }

        try {
            console.log("Envio Enviando mensagem:", content)

            // Enviar mensagem via API (será enviada para o Telegram)
            const apiMessage = await chatAPI.sendMessage(currentConversation.id, "operator", content)

            // Adicionar mensagem localmente para feedback imediato
            const newMessage: Message = {
                id: apiMessage.id || `local-${currentConversation.id}-${Date.now()}`,
                content: content,
                role: "operator",
                timestamp: new Date(),
                status: "sent" as const,
            }

            setMessages((prev) => {
                const newMessages = [...prev, newMessage]
                return newMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
            })

            // Update conversation last message locally for immediate feedback
            setConversations((prev) =>
                prev.map((conv) =>
                    conv.id === currentConversation.id ? { ...conv, lastMessage: content, updatedAt: new Date() } : conv,
                ),
            )

            console.log("[OK] Mensagem enviada com sucesso!")
        } catch (error) {
            console.error("ERRO: Erro ao enviar mensagem:", error)

            // Em caso de erro, adicionar mensagem localmente como fallback com ID único
            const fallbackMessage: Message = {
                id: `error-${currentConversation.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                content: content,
                role: "operator",
                timestamp: new Date(),
                status: "error" as const,
            }

            setMessages((prev) => {
                const newMessages = [...prev, fallbackMessage]
                return newMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
            })
        }
    }

    // Delete conversation - CORRIGIDO
    const deleteConversation = async (conversationId: string) => {
        if (!apiAvailable) {
            console.warn("AVISO: API não disponível - não é possível deletar conversa")
            return
        }

        try {
            console.log(`Excluir Deletando conversa: ${conversationId}`)

            // Deletar via API
            await chatAPI.deleteConversation(conversationId)

            // Remover da lista local
            setConversations((prev) => prev.filter((conv) => conv.id !== conversationId))

            // Se a conversa deletada era a atual, selecionar outra ou limpar
            if (currentConversation?.id === conversationId) {
                const remainingConversations = conversations.filter((conv) => conv.id !== conversationId)
                if (remainingConversations.length > 0) {
                    setCurrentConversation(remainingConversations[0])
                    await loadMessages(remainingConversations[0].id)
                } else {
                    setCurrentConversation(null)
                    setMessages([])
                }
            }

            console.log("[OK] Conversa deletada com sucesso!")
        } catch (error) {
            console.error("ERRO: Erro ao deletar conversa:", error)
            // Mostrar erro para o usuário
            alert("Erro ao finalizar conversa. Tente novamente.")
        }
    }

    // Corrigir a função de arquivamento e contagem de conversas
    const handleArchiveConversation = async (conversationId: string) => {
        // Primeiro, testar conectividade
        const isConnected = await testAPIConnectivity()

        if (!isConnected) {
            alert("ERRO: Erro de conexão com o backend. Verifique se o servidor está rodando na porta 3001.")
            return
        }

        if (!apiAvailable) {
            console.warn("AVISO: API não disponível - não é possível arquivar conversa")
            return
        }

        const conversation = conversations.find((c) => c.id === conversationId)
        if (!conversation) {
            console.warn("AVISO: Conversa não encontrada na lista local")
            return
        }

        const newArchivedState = !conversation.isArchived

        try {
            console.log(`Tentando ${newArchivedState ? "arquivar" : "desarquivar"} conversa: ${conversationId}`)

            // Update via API
            await chatAPI.archiveConversation(conversationId, newArchivedState)

            // Update locally only after API success
            setConversations((prev) =>
                prev.map((conv) => (conv.id === conversationId ? { ...conv, isArchived: newArchivedState } : conv)),
            )

            console.log(`[OK] Conversa ${newArchivedState ? "arquivada" : "desarquivada"} com sucesso: ${conversationId}`)
        } catch (error: unknown) {
            console.error("ERRO: Erro ao arquivar conversa:", error)

            const errorMessage = error instanceof Error ? error.message : String(error)

            // Verificar se é erro de rede ou do servidor
            if (errorMessage.includes("Failed to fetch") || errorMessage.includes("HTTP")) {
                alert("ERRO: Erro de conexão. Verifique se o backend está rodando:\n\npython src/aura/app.py")
            } else {
                alert(`ERRO: Erro ao ${conversation.isArchived ? "desarquivar" : "arquivar"} conversa: ${errorMessage}`)
            }
        }
    }

    // Archive/Unarchive conversation
    const toggleArchiveConversation = async (conversationId: string) => {
        if (!apiAvailable) return

        try {
            const conversation = conversations.find((c) => c.id === conversationId)
            if (!conversation) return

            const newArchivedState = !conversation.isArchived

            // Update via API
            await chatAPI.archiveConversation(conversationId, newArchivedState)

            // Update locally
            setConversations((prev) =>
                prev.map((conv) => (conv.id === conversationId ? { ...conv, isArchived: newArchivedState } : conv)),
            )

            console.log(`[OK] Conversa ${newArchivedState ? "arquivada" : "desarquivada"}: ${conversationId}`)
        } catch (error) {
            console.error("ERRO: Erro ao arquivar conversa:", error)
        }
    }

    // SSE connection for real-time updates - DESABILITADO por enquanto
    const setupSSE = (conversationId: string) => {
        // SSE desabilitado por enquanto - usando polling
        console.log(`AVISO: SSE desabilitado - usando polling para conversa: ${conversationId}`)
        return
    }

    // Polling for new conversations and messages - MELHORADO
    useEffect(() => {
        if (!apiAvailable) return

        const pollForUpdates = async () => {
            try {
                console.log("Polling: Verificando atualizações...")

                // Verificar novas conversas
                const apiConversations = await chatAPI.getConversations()
                const currentIds = conversations.map((c) => c.id)
                const newConversations = apiConversations.filter((conv) => !currentIds.includes(conv.id))

                if (newConversations.length > 0) {
                    console.log(`${newConversations.length} novas conversas detectadas`)

                    const formattedNew: Conversation[] = newConversations.map((conv) => ({
                        id: conv.id,
                        title: conv.title,
                        lastMessage: conv.lastMessage || "",
                        messages: [],
                        unreadCount: 1,
                        status: "online" as const,
                        createdAt: conv.createdAt ? new Date(conv.createdAt) : new Date(),
                        updatedAt: conv.lastAt ? new Date(conv.lastAt) : new Date(),
                        isPinned: false,
                        situacao: "Em Atendimento",
                        isArchived: false,
                        platform: conv.platform || "telegram",
                    }))

                    setConversations((prev) => [...formattedNew, ...prev])
                }

                // Verificar mudanças nas conversas existentes
                const updatedConversations = apiConversations.filter((apiConv) => {
                    const localConv = conversations.find((c) => c.id === apiConv.id)
                    return (
                        localConv &&
                        (localConv.lastMessage !== apiConv.lastMessage || localConv.updatedAt?.toISOString() !== apiConv.lastAt)
                    )
                })

                if (updatedConversations.length > 0) {
                    console.log(`Recarregando ${updatedConversations.length} conversas atualizadas detectadas`)

                    setConversations((prev) =>
                        prev.map((conv) => {
                            const updated = updatedConversations.find((u) => u.id === conv.id)
                            if (updated) {
                                return {
                                    ...conv,
                                    lastMessage: updated.lastMessage || conv.lastMessage,
                                    updatedAt: updated.lastAt ? new Date(updated.lastAt) : conv.updatedAt,
                                    unreadCount: conv.id === currentConversation?.id ? 0 : conv.unreadCount + 1,
                                }
                            }
                            return conv
                        }),
                    )
                }

                // Verificar novas mensagens na conversa atual
                if (currentConversation) {
                    const apiMessages = await chatAPI.getMessages(currentConversation.id)

                    if (apiMessages && apiMessages.length > messages.length) {
                        console.log(` پیغام ${apiMessages.length - messages.length} novas mensagens detectadas`)

                        const formattedMessages: Message[] = apiMessages
                            .map((msg, index) => {
                                const role = determineMessageRole(msg.sender)
                                return {
                                    id: msg.id || `api-${currentConversation.id}-${index}-${Date.now()}`,
                                    content: msg.text,
                                    role: role,
                                    timestamp: new Date(msg.timestamp),
                                    status: "sent" as const,
                                }
                            })
                            .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

                        setMessages(formattedMessages)
                    }
                }
            } catch (error) {
                console.error("ERRO: Erro no polling:", error)
            }
        }

        // Poll every 2 seconds for faster updates
        const interval = setInterval(pollForUpdates, 2000)
        return () => clearInterval(interval)
    }, [conversations, messages, currentConversation, apiAvailable])

    // Debug function to show status
    const showDebugStatus = async () => {
        try {
            const status = await chatAPI.getDebugStatus()
            console.log("Detalhe Status completo do sistema:", status)

            // Show alert with key info
            const info = `
DEBUG STATUS:
Conexões no backend: ${status?.telegram?.conversations_count || 0}
Contas do Telegram: ${status?.telegram?.accounts_count || 0}
Conversas no frontend: ${conversations.length}
Ngrok (opcional): ${status?.system?.ngrok_url || "Auto-configurado ou não necessário"}

Ngrok é usado apenas para webhooks públicos do Telegram.
O sistema funciona localmente sem ele.
      `
            alert(info)
        } catch (error) {
            console.error("ERRO: Erro ao obter status:", error)
        }
    }

    // Create test conversation function
    const createTestConversation = async () => {
        try {
            console.log("Criando conversa de teste...")
            await chatAPI.createTestConversation()

            // Reload conversations after creating test
            setTimeout(() => {
                loadConversations()
            }, 1000)

            alert("Conversa de teste criada! Verifique a lista de conversas.")
        } catch (error) {
            console.error("ERRO: Erro ao criar conversa de teste:", error)
            alert("ERRO ao criar conversa de teste")
        }
    }

    // Carregar configurações do localStorage na inicialização
    useEffect(() => {
        setMounted(true)

        try {
            const savedSettings = localStorage.getItem("chat-theme-settings")
            if (savedSettings) {
                const parsed = JSON.parse(savedSettings)
                console.log("Configurações carregadas do localStorage:", parsed)
                setThemeSettings(parsed)
                applyThemeSettingsToCSS(parsed, resolvedTheme)
            } else {
                console.log("NOVO: Usando configurações padrão")
                applyThemeSettingsToCSS(DEFAULT_THEME_SETTINGS, resolvedTheme)
            }
        } catch (error) {
            console.error("ERRO: Erro ao carregar configurações:", error)
            applyThemeSettingsToCSS(DEFAULT_THEME_SETTINGS, resolvedTheme)
        }

        // Load conversations on mount
        loadConversations()

        // Add debug functions to window for testing
        ;(window as any).debugChat = {
            showStatus: showDebugStatus,
            createTest: createTestConversation,
            loadConversations,
            getConversations: () => conversations,
            getMessages: () => messages,
        }
    }, [theme])

    useEffect(() => {
        if (mounted) {
            setSettings((prev) => ({ ...prev, theme: (theme as "dark" | "light") || "dark" }))
        }
    }, [theme, mounted])

    // Aplicar configurações sempre que mudarem
    useEffect(() => {
        if (mounted) {
            applyThemeSettingsToCSS(themeSettings, resolvedTheme)
        }
    }, [themeSettings, mounted, theme])

    // Apply performance optimizations when performance mode is enabled
    useEffect(() => {
        if (performanceSettings.performanceMode) {
            setPerformanceSettings({
                performanceMode: true,
                reducedAnimations: true,
                lowFrameRate: true,
                memoryOptimization: true,
            })

            // Apply CSS optimizations
            document.body.style.setProperty("--animation-duration", "0.1s")
            document.body.style.setProperty("--transition-duration", "0.1s")
        } else {
            // Reset to normal
            document.body.style.removeProperty("--animation-duration")
            document.body.style.removeProperty("--transition-duration")
        }
    }, [performanceSettings.performanceMode])

    const handleSendMessage = (content: string) => {
        sendMessage(content)
    }

    const handleSelectConversation = async (conversation: Conversation) => {
        setCurrentConversation(conversation)
        await loadMessages(conversation.id)

        // Mark conversation as read - fazer localmente
        setConversations((prev) => prev.map((conv) => (conv.id === conversation.id ? { ...conv, unreadCount: 0 } : conv)))
    }

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement
                .requestFullscreen()
                .then(() => {
                    setIsFullscreen(true)
                    setSettings((prev) => ({ ...prev, isFullscreen: true }))
                })
                .catch((err) => {
                    console.error("Error attempting to enable fullscreen:", err)
                })
        } else {
            document
                .exitFullscreen()
                .then(() => {
                    setIsFullscreen(false)
                    setSettings((prev) => ({ ...prev, isFullscreen: false }))
                })
                .catch((err) => {
                    console.error("Error attempting to exit fullscreen:", err)
                })
        }
    }

    const toggleTheme = () => {
        const newTheme = theme === "dark" ? "light" : "dark"
        setTheme(newTheme)
    }

    // Função para alternar apenas a visibilidade das tags (não abre modal)
    const handleToggleTagsVisibility = () => {
        setHideTagsMode(!hideTagsMode)
    }

    // Função para mostrar o modal de detalhes
    const handleShowDetails = () => {
        setShowDetails(true)
    }

    const handleGoBack = () => {
        setShowExitConfirm(true)
    }

    const handleExitConfirm = () => {
        // Navigate back to panel
        window.location.href = "/panel"
    }

    // Encontre a função handleSituationChange e modifique-a para atualizar a conversa atual e a lista de conversas
    const handleSituationChange = (newSituation: string) => {
        if (currentConversation) {
            // Atualiza a conversa atual
            setCurrentConversation((prev) => ({
                ...prev!,
                situacao: newSituation,
            }))

            // Atualiza a conversa na lista de conversas
            setConversations((prev) =>
                prev.map((conv) => (conv.id === currentConversation.id ? { ...conv, situacao: newSituation } : conv)),
            )
        }
    }

    const handleNicknameChange = async (newNickname: string) => {
        if (currentConversation && apiAvailable) {
            try {
                await chatAPI.renameConversation(currentConversation.id, newNickname)

                setCurrentConversation((prev) => ({
                    ...prev!,
                    title: newNickname,
                }))

                setConversations((prev) =>
                    prev.map((conv) => (conv.id === currentConversation.id ? { ...conv, title: newNickname } : conv)),
                )

                setIsEditingNickname(false)
            } catch (error) {
                console.error("ERRO: Erro ao renomear conversa:", error)
            }
        }
    }

    // CORRIGIR função de finalizar
    const handleFinalizarConfirm = async () => {
        if (currentConversation) {
            console.log("Excluir Finalizando conversa:", currentConversation.id)
            await deleteConversation(currentConversation.id)
            setShowFinalizarModal(false)
        }
    }

    const handleFilterChange = (filter: "all" | "active" | "waiting") => {
        setActiveFilter(filter)
    }

    const handlePerformanceSettingsChange = (newSettings: PerformanceSettings) => {
        setPerformanceSettings(newSettings)
    }

    const handleThemeSettingsChange = (newSettings: ThemeSettings) => {
        console.log("Mudando configurações de tema:", newSettings)
        setThemeSettings(newSettings)
        applyThemeSettingsToCSS(newSettings, resolvedTheme)
    }

    const handleSaveSettings = () => {
        try {
            const settingsToSave = {
                ...themeSettings,
                timestamp: Date.now(),
            }
            localStorage.setItem("chat-theme-settings", JSON.stringify(settingsToSave))
            console.log("Salvar Configurações salvas com sucesso:", settingsToSave)

            // Mostrar feedback visual
            const saveButton = document.querySelector("[data-save-button]")
            if (saveButton) {
                saveButton.textContent = "[OK] Salvo!"
                setTimeout(() => {
                    saveButton.textContent = "Salvar Salvar"
                }, 2000)
            }
        } catch (error) {
            console.error("ERRO: Erro ao salvar configurações:", error)
        }
    }

    const handleResetSettings = () => {
        console.log("Resetando configurações para padrão")
        setThemeSettings(DEFAULT_THEME_SETTINGS)
        applyThemeSettingsToCSS(DEFAULT_THEME_SETTINGS, resolvedTheme)
        localStorage.removeItem("chat-theme-settings")

        // Mostrar feedback visual
        const resetButton = document.querySelector("[data-reset-button]")
        if (resetButton) {
            resetButton.textContent = "[OK] Reset!"
            setTimeout(() => {
                resetButton.textContent = "Reset"
            }, 2000)
        }
    }

    const handlePlatformChange = (newPlatform: string) => {
        if (currentConversation) {
            // Atualiza a conversa atual
            setCurrentConversation((prev) => ({
                ...prev!,
                platform: newPlatform,
            }))

            // Atualiza a conversa na lista de conversas
            setConversations((prev) =>
                prev.map((conv) => (conv.id === currentConversation.id ? { ...conv, platform: newPlatform } : conv)),
            )

            console.log(`[OK] Plataforma alterada para: ${newPlatform}`)
        }
    }

    if (!mounted || loading) {
        return (
            <div className="h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    // Atualizar a contagem de conversas
    const conversationCounts = {
        active: conversations.filter((c) => !c.isArchived).length,
        waiting: conversations.filter((c) => c.isArchived).length,
    }

    const currentTheme = settings.theme

    return (
        <div
            className={`h-screen chat-container ${isFullscreen ? "fixed inset-0 z-50" : ""} ${
                currentTheme === "dark" ? "bg-black" : "bg-gray-100"
            } ${themeSettings.fadeEnabled && themeSettings.fadeMode === "movement" ? "fade-movement" : ""}`}
            style={
                {
                    "--chat-glow-intensity": themeSettings.glowIntensity / 100,
                    "--chat-glow-thickness": `${themeSettings.glowThickness}px`,
                    "--chat-glow-animation": themeSettings.glowAnimation
                        ? "glow-pulse 2s ease-in-out infinite alternate"
                        : "none",
                    "--chat-fade-animation":
                        themeSettings.fadeEnabled && themeSettings.fadeMode === "movement"
                            ? `color-shift ${themeSettings.fadeSpeed}s ease-in-out infinite alternate`
                            : "none",
                    "--chat-fade-color-1": themeSettings.fadeColor1,
                    "--chat-fade-color-2": themeSettings.fadeColor2,
                } as React.CSSProperties
            }
        >
            <div className="h-full flex scrollbar-hide">
                {/* Control Sidebar - Left */}
                {!controlSidebarHidden && (
                    <ControlSidebar
                        onNewConversationAction={() => setShowNewMessage(true)}
                        onShowDetailsAction={handleToggleTagsVisibility}
                        onGoBackAction={handleGoBack}
                        onToggleThemeAction={toggleTheme}
                        onToggleFullscreenAction={toggleFullscreen}
                        onToggleControlSidebarAction={() => setControlSidebarHidden(true)}
                        theme={currentTheme}
                        isFullscreen={isFullscreen}
                        performanceSettings={performanceSettings}
                        onPerformanceSettingsChangeAction={handlePerformanceSettingsChange}
                        themeSettings={themeSettings}
                        onThemeSettingsChangeAction={handleThemeSettingsChange}
                        onSaveSettingsAction={handleSaveSettings}
                        onResetSettingsAction={handleResetSettings}
                    />
                )}

                {/* Chat Sidebar */}
                {!sidebarHidden && (
                    <ChatSidebar
                        conversations={conversations}
                        currentConversation={currentConversation}
                        conversationCounts={conversationCounts}
                        theme={currentTheme}
                        themeSettings={themeSettings}
                        onToggleSidebarAction={() => setSidebarHidden(!sidebarHidden)}
                        controlSidebarHidden={controlSidebarHidden}
                        onToggleControlSidebarAction={() => setControlSidebarHidden(!controlSidebarHidden)}
                        activeFilter={activeFilter}
                        onFilterChangeAction={handleFilterChange}
                        onSelectConversationAction={handleSelectConversation}
                        onArchiveConversationAction={handleArchiveConversation}
                        showDetails={hideTagsMode}
                        userName={userName ?? undefined}
                        isLoading={loading}
                    />
                )}

                {/* Main Chat Area */}
                <div className={`flex-1 flex flex-col scrollbar-hide ${currentTheme === "dark" ? "bg-[#0a0a0a]" : "bg-white"}`}>
                    {currentConversation ? (
                        <>
                            <ChatHeader
                                agent={mockAgent}
                                conversation={currentConversation}
                                onToggleInfoAction={() => setShowInfo(!showInfo)}
                                onEditNicknameAction={() => setIsEditingNickname(true)}
                                isEditingNickname={isEditingNickname}
                                onNicknameChangeAction={handleNicknameChange}
                                onCancelEditAction={() => setIsEditingNickname(false)}
                                onToggleSidebarAction={() => setSidebarHidden(!sidebarHidden)}
                                onToggleControlSidebarAction={() => setControlSidebarHidden(!controlSidebarHidden)}
                                onFinalizeAction={() => setShowFinalizarModal(true)}
                                onArchiveConversationAction={handleArchiveConversation}
                                sidebarHidden={sidebarHidden}
                                controlSidebarHidden={controlSidebarHidden}
                                theme={currentTheme}
                                themeSettings={themeSettings}
                            />

                            <ChatMessages messages={messages} agent={mockAgent} theme={currentTheme} themeSettings={themeSettings} />

                            <ChatInput
                                onSendMessageAction={handleSendMessage}
                                theme={currentTheme}
                                themeSettings={themeSettings}
                                disabled={!apiAvailable}
                            />
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                {!apiAvailable ? (
                                    <>
                                        <h2 className="text-2xl font-bold mb-4 text-red-500">AVISO: Serviços Indisponíveis</h2>
                                        <p className="text-gray-500 mb-6">
                                            Os serviços de backend não estão disponíveis. Conecte os serviços para receber mensagens de
                                            WhatsApp, Telegram e outros canais.
                                        </p>
                                        <div className="bg-gray-800 p-4 rounded-lg text-left mb-4">
                                            <code className="text-green-400">python src/aura/app.py</code>
                                        </div>
                                    </>
                                ) : conversations.length === 0 ? (
                                    <>
                                        <h2 className="text-2xl font-bold mb-4">Aplicativo Aguardando Mensagens</h2>
                                        <p className="text-gray-500 mb-6">
                                            Nenhuma conversa ainda. As conversas aparecerão automaticamente quando usuários enviarem mensagens
                                            via WhatsApp, Telegram ou outros canais conectados.
                                        </p>
                                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
                                            <p className="text-blue-600 dark:text-blue-400">
                                                [OK] Sistema conectado e aguardando mensagens dos canais
                                            </p>
                                        </div>
                                        <div className="flex gap-4 justify-center">
                                            <button
                                                onClick={createTestConversation}
                                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                                            >
                                                Teste Criar Conversa de Teste
                                            </button>
                                            <button
                                                onClick={showDebugStatus}
                                                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                                            >
                                                Detalhe Debug Status
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <h2 className="text-2xl font-bold mb-4">Selecione uma Conversa</h2>
                                        <p className="text-gray-500 mb-6">Escolha uma conversa da lista para começar a responder</p>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Info Sidebar */}
                {showInfo && currentConversation && (
                    <ChatInfo
                        agent={mockAgent}
                        conversation={currentConversation}
                        onCloseAction={() => setShowInfo(false)}
                        onSituationChange={handleSituationChange}
                        onPlatformChange={handlePlatformChange}
                        theme={currentTheme}
                        themeSettings={themeSettings}
                    />
                )}
            </div>

            {/* Modals */}
            {showClientData && currentConversation && (
                <ClientDataModal conversation={currentConversation} onCloseAction={() => setShowClientData(false)} />
            )}

            {showNewMessage && (
                <NewMessageModal
                    onCloseAction={() => setShowNewMessage(false)}
                    onSendTemplateAction={(template) => {
                        console.log("Sending template:", template)
                        setShowNewMessage(false)
                    }}
                    theme={currentTheme}
                    themeSettings={themeSettings}
                />
            )}

            {showDetails && currentConversation && (
                <DetailsModal conversation={currentConversation} onCloseAction={() => setShowDetails(false)} theme={currentTheme} />
            )}

            {showExitConfirm && (
                <ExitConfirmModal
                    onConfirmAction={handleExitConfirm}
                    onCancelAction={() => setShowExitConfirm(false)}
                    theme={currentTheme}
                />
            )}

            {showFinalizarModal && (
                <FinalizarModal
                    onConfirmAction={handleFinalizarConfirm}
                    onCancelAction={() => setShowFinalizarModal(false)}
                    theme={currentTheme}
                />
            )}
        </div>
    )
}

const ChatTemplate = () => {
    return <ChatTemplateContent />
}

export default ChatTemplate
