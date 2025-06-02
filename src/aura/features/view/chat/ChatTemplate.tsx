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
import { LanguageProvider, useLanguage } from "../../../contexts/LanguageContext"
import type { Conversation, AIAgent, Message, ChatSettings } from "./types"

// API Configuration - usando app.py na porta 3001
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

// Função para determinar o role da mensagem de forma consistente - COM VALIDAÇÃO
const determineMessageRole = (sender: string | undefined | null): "user" | "operator" => {
  // Validação de entrada
  if (!sender || typeof sender !== "string") {
    console.warn("⚠️ Sender inválido:", sender, "- assumindo como user")
    return "user"
  }

  // Se o sender é "operator", "assistant", "bot", ou "system" -> é operador
  // Caso contrário, é usuário
  const operatorSenders = ["operator", "assistant", "bot", "system"]
  const result = operatorSenders.includes(sender.toLowerCase()) ? "operator" : "user"
  console.log(`📝 determineMessageRole: "${sender}" -> "${result}"`)
  return result
}

// API Functions - integração completa com app.py
const chatAPI = {
  // Health check
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
      console.warn("🔌 Backend API não disponível:", error)
      return false
    }
  },

  // Get all conversations (apenas conversas reais do Telegram)
  getConversations: async (): Promise<any[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/conversations`)
      if (!response.ok) throw new Error("Failed to fetch conversations")

      const data = await response.json()
      console.log("✅ Conversas reais carregadas:", data)
      return data
    } catch (error) {
      console.error("❌ Erro ao carregar conversas:", error)
      return []
    }
  },

  // Get conversation details
  getConversation: async (conversationId: string): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}`)
      if (!response.ok) throw new Error("Failed to fetch conversation")

      const data = await response.json()
      console.log("✅ Detalhes da conversa:", data)
      return data
    } catch (error) {
      console.error("❌ Erro ao carregar conversa:", error)
      return null
    }
  },

  // Get messages from conversation
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
      console.log(`✅ ${data.length} mensagens carregadas para conversa ${conversationId}`)
      return data
    } catch (error) {
      console.error("❌ Erro ao carregar mensagens:", error)
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

      if (!response.ok) throw new Error("Failed to send message")

      const data = await response.json()
      console.log("✅ Mensagem enviada via API:", data)
      return data
    } catch (error) {
      console.error("❌ Erro ao enviar mensagem:", error)
      throw error
    }
  },

  // Rename conversation
  renameConversation: async (conversationId: string, title: string): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      })

      if (!response.ok) throw new Error("Failed to rename conversation")

      const data = await response.json()
      console.log("✅ Conversa renomeada:", data)
      return data
    } catch (error) {
      console.error("❌ Erro ao renomear conversa:", error)
      throw error
    }
  },

  // Delete conversation
  deleteConversation: async (conversationId: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete conversation")
      console.log("✅ Conversa deletada via API")
    } catch (error) {
      console.error("❌ Erro ao deletar conversa:", error)
      throw error
    }
  },

  // Delete message
  deleteMessage: async (conversationId: string, messageId: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}/messages/${messageId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete message")
      console.log("✅ Mensagem deletada via API")
    } catch (error) {
      console.error("❌ Erro ao deletar mensagem:", error)
      throw error
    }
  },

  // Edit message
  editMessage: async (conversationId: string, messageId: string, text: string): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}/messages/${messageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) throw new Error("Failed to edit message")

      const data = await response.json()
      console.log("✅ Mensagem editada:", data)
      return data
    } catch (error) {
      console.error("❌ Erro ao editar mensagem:", error)
      throw error
    }
  },

  // Mark messages as read
  markAsRead: async (conversationId: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}/mark-read`, {
        method: "POST",
      })

      if (!response.ok) throw new Error("Failed to mark as read")
      console.log("✅ Mensagens marcadas como lidas")
    } catch (error) {
      console.error("❌ Erro ao marcar como lidas:", error)
    }
  },

  // Get Telegram accounts
  getAccounts: async (): Promise<any[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/accounts`)
      if (!response.ok) throw new Error("Failed to fetch accounts")

      const data = await response.json()
      console.log("✅ Contas Telegram carregadas:", data)
      return data
    } catch (error) {
      console.error("❌ Erro ao carregar contas:", error)
      return []
    }
  },

  // Stream conversation updates (SSE)
  streamConversation: (conversationId: string, onMessage: (message: any) => void): EventSource => {
    const eventSource = new EventSource(`${API_BASE_URL}/api/conversations/${conversationId}/stream`)

    eventSource.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        console.log("📨 Nova mensagem via SSE:", message)
        onMessage(message)
      } catch (error) {
        console.error("❌ Erro ao processar mensagem SSE:", error)
      }
    }

    eventSource.onerror = (error) => {
      console.error("❌ Erro na conexão SSE:", error)
    }

    return eventSource
  },

  // Archive conversation
  archiveConversation: async (conversationId: string, isArchived: boolean): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}/archive`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived }),
      })

      if (!response.ok) throw new Error("Failed to archive conversation")

      const data = await response.json()
      console.log("✅ Conversa arquivada:", data)
      return data
    } catch (error) {
      console.error("❌ Erro ao arquivar conversa:", error)
      throw error
    }
  },
}

// Agent data
const mockAgent: AIAgent = {
  id: "1",
  name: "Aura Assistant",
  status: "online",
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

  console.log("🎨 Aplicando configurações de tema:", settings)

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

    console.log("✅ Glow effects aplicados:", { intensity, thickness, animation: settings.glowAnimation })
  } else {
    root.style.setProperty("--chat-glow-intensity", "0")
    root.style.setProperty("--chat-glow-thickness", "0px")
    root.style.setProperty("--chat-title-glow", "none")
    root.style.setProperty("--chat-glow-animation", "none")
    console.log("❌ Glow effects desabilitados")
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

    console.log("✅ Fade effects aplicados:", {
      color1: settings.fadeColor1,
      color2: settings.fadeColor2,
      speed: settings.fadeSpeed,
      mode: settings.fadeMode,
    })
  } else {
    root.style.setProperty("--chat-fade-animation", "none")
    console.log("❌ Fade effects desabilitados")
  }

  // Apply text animations
  if (settings.textAnimations) {
    root.style.setProperty("--chat-text-animations", "1")
    console.log("✅ Text animations habilitadas")
  } else {
    root.style.setProperty("--chat-text-animations", "0")
    console.log("❌ Text animations desabilitadas")
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

  console.log("🎨 Tema aplicado:", settings.currentGradient)
}

// Component that uses the language context
const ChatTemplateContent = () => {
  const { theme, setTheme } = useTheme()
  const { language, t } = useLanguage()
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

  // Theme settings com carregamento do localStorage
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(DEFAULT_THEME_SETTINGS)

  // SSE connection for real-time updates
  const [sseConnection, setSseConnection] = useState<EventSource | null>(null)

  // Check API availability and load conversations
  const loadConversations = async () => {
    try {
      setLoading(true)
      console.log("🔄 Verificando disponibilidade da API...")

      const isAvailable = await chatAPI.checkHealth()
      setApiAvailable(isAvailable)

      if (!isAvailable) {
        console.warn("⚠️ API não disponível - Chat funcionará apenas quando houver conversas do Telegram")
        setConversations([])
        setLoading(false)
        return
      }

      console.log("🔄 Carregando conversas reais do Telegram...")
      const apiConversations = await chatAPI.getConversations()

      const formattedConversations: Conversation[] = apiConversations.map((conv) => ({
        id: conv.id,
        title: conv.title,
        lastMessage: conv.lastMessage || "",
        messages: [],
        unreadCount: 0,
        status: "online",
        createdAt: conv.createdAt ? new Date(conv.createdAt) : new Date(),
        updatedAt: conv.lastAt ? new Date(conv.lastAt) : new Date(),
        isPinned: false,
        situacao: "Em Atendimento",
        isArchived: false,
      }))

      setConversations(formattedConversations)
      console.log(`✅ ${formattedConversations.length} conversas reais carregadas`)

      // Set first conversation as current if exists
      if (formattedConversations.length > 0 && !currentConversation) {
        setCurrentConversation(formattedConversations[0])
        await loadMessages(formattedConversations[0].id)
      }
    } catch (error) {
      console.error("❌ Erro ao carregar conversas:", error)
      setConversations([])
    } finally {
      setLoading(false)
    }
  }

  // Load messages for a conversation - com lógica consistente de role
  const loadMessages = async (conversationId: string) => {
    try {
      console.log(`🔄 Carregando mensagens para conversa: ${conversationId}`)
      const apiMessages = await chatAPI.getMessages(conversationId)

      const formattedMessages: Message[] = apiMessages
        .map((msg, index) => {
          const role = determineMessageRole(msg.sender)
          console.log(`📝 Mensagem ${index}: sender="${msg.sender}" -> role="${role}"`)

          return {
            id: msg.id || `api-${conversationId}-${index}-${Date.now()}`,
            content: msg.text,
            role: role,
            timestamp: new Date(msg.timestamp),
            status: "sent",
          }
        })
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()) // Ordenar por timestamp

      setMessages(formattedMessages)
      console.log(`✅ ${formattedMessages.length} mensagens carregadas e ordenadas`)

      // Mark messages as read
      await chatAPI.markAsRead(conversationId)
    } catch (error) {
      console.error("❌ Erro ao carregar mensagens:", error)
      setMessages([])
    }
  }

  // Send message (integra com Telegram) - com prevenção de duplicação
  const sendMessage = async (content: string) => {
    if (!currentConversation || !apiAvailable) {
      console.warn("⚠️ Não é possível enviar mensagem - conversa ou API indisponível")
      return
    }

    try {
      console.log("📤 Enviando mensagem:", content)

      // Send message via API (will be sent to connected service)
      const apiMessage = await chatAPI.sendMessage(currentConversation.id, "operator", content)

      // NÃO adicionar mensagem localmente - ela virá via SSE para evitar duplicidade
      console.log("✅ Mensagem enviada via API, aguardando confirmação via SSE")

      // Update conversation last message locally for immediate feedback
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === currentConversation.id ? { ...conv, lastMessage: content, updatedAt: new Date() } : conv,
        ),
      )
    } catch (error) {
      console.error("❌ Erro ao enviar mensagem:", error)

      // Em caso de erro, adicionar mensagem localmente como fallback com ID único
      const fallbackMessage: Message = {
        id: `fallback-${currentConversation.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        content: content,
        role: "operator", // Mensagem do operador
        timestamp: new Date(),
        status: "error",
      }

      setMessages((prev) => {
        const newMessages = [...prev, fallbackMessage]
        return newMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      })
    }
  }

  // Delete conversation
  const deleteConversation = async (conversationId: string) => {
    if (!apiAvailable) return

    try {
      await chatAPI.deleteConversation(conversationId)

      setConversations((prev) => prev.filter((conv) => conv.id !== conversationId))

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
    } catch (error) {
      console.error("Error deleting conversation:", error)
    }
  }

  // Corrigir a função de arquivamento e contagem de conversas
  const handleArchiveConversation = async (conversationId: string) => {
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

      console.log(`✅ Conversa ${newArchivedState ? "arquivada" : "desarquivada"}: ${conversationId}`)
    } catch (error) {
      console.error("❌ Erro ao arquivar conversa:", error)
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

      console.log(`✅ Conversa ${newArchivedState ? "arquivada" : "desarquivada"}: ${conversationId}`)
    } catch (error) {
      console.error("❌ Erro ao arquivar conversa:", error)
    }
  }

  // Setup SSE for real-time updates - com lógica consistente de role
  const setupSSE = (conversationId: string) => {
    if (sseConnection) {
      sseConnection.close()
    }

    if (!apiAvailable) return

    const eventSource = chatAPI.streamConversation(conversationId, (message) => {
      // Validação da mensagem SSE
      if (!message || typeof message !== "object") {
        console.warn("⚠️ Mensagem SSE inválida:", message)
        return
      }

      const role = determineMessageRole(message.sender)
      console.log(`📨 SSE - sender="${message.sender}" -> role="${role}"`)

      const newMessage: Message = {
        id: message.id || `sse-${conversationId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        content: message.text || "",
        role: role,
        timestamp: new Date(message.timestamp || Date.now()),
        status: "sent",
      }

      setMessages((prev) => {
        // Verificar se a mensagem já existe para evitar duplicação
        const messageExists = prev.some(
          (msg) =>
            msg.id === newMessage.id ||
            (msg.content === newMessage.content &&
              Math.abs(msg.timestamp.getTime() - newMessage.timestamp.getTime()) < 1000),
        )

        if (messageExists) {
          console.log("📨 Mensagem duplicada detectada, ignorando:", newMessage)
          return prev
        }

        const newMessages = [...prev, newMessage]
        const sortedMessages = newMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
        console.log(`📨 Nova mensagem adicionada via SSE. Total: ${sortedMessages.length}`)
        return sortedMessages
      })

      // Update conversation list
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId ? { ...conv, lastMessage: message.text || "", updatedAt: new Date() } : conv,
        ),
      )
    })

    setSseConnection(eventSource)
  }

  // Polling for new conversations (when Telegram users send first message)
  useEffect(() => {
    if (!apiAvailable) return

    const pollForNewConversations = async () => {
      try {
        const apiConversations = await chatAPI.getConversations()
        const currentIds = conversations.map((c) => c.id)
        const newConversations = apiConversations.filter((conv) => !currentIds.includes(conv.id))

        if (newConversations.length > 0) {
          console.log(`📨 ${newConversations.length} novas conversas detectadas`)

          const formattedNew: Conversation[] = newConversations.map((conv) => ({
            id: conv.id,
            title: conv.title,
            lastMessage: conv.lastMessage || "",
            messages: [],
            unreadCount: 1,
            status: "online",
            createdAt: conv.createdAt ? new Date(conv.createdAt) : new Date(),
            updatedAt: conv.lastAt ? new Date(conv.lastAt) : new Date(),
            isPinned: false,
            situacao: "Em Atendimento",
            isArchived: false,
          }))

          setConversations((prev) => [...formattedNew, ...prev])
        }
      } catch (error) {
        console.error("❌ Erro ao verificar novas conversas:", error)
      }
    }

    // Poll every 5 seconds for new conversations
    const interval = setInterval(pollForNewConversations, 5000)
    return () => clearInterval(interval)
  }, [conversations, apiAvailable])

  // Carregar configurações do localStorage na inicialização
  useEffect(() => {
    setMounted(true)

    try {
      const savedSettings = localStorage.getItem("chat-theme-settings")
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings)
        console.log("📂 Configurações carregadas do localStorage:", parsed)
        setThemeSettings(parsed)
        applyThemeSettingsToCSS(parsed, theme)
      } else {
        console.log("🆕 Usando configurações padrão")
        applyThemeSettingsToCSS(DEFAULT_THEME_SETTINGS, theme)
      }
    } catch (error) {
      console.error("❌ Erro ao carregar configurações:", error)
      applyThemeSettingsToCSS(DEFAULT_THEME_SETTINGS, theme)
    }

    // Load conversations on mount
    loadConversations()
  }, [theme])

  useEffect(() => {
    if (mounted) {
      setSettings((prev) => ({ ...prev, theme: (theme as "dark" | "light") || "dark" }))
    }
  }, [theme, mounted])

  // Aplicar configurações sempre que mudarem
  useEffect(() => {
    if (mounted) {
      applyThemeSettingsToCSS(themeSettings, theme)
    }
  }, [themeSettings, mounted, theme])

  // Setup SSE when conversation changes
  useEffect(() => {
    if (currentConversation && apiAvailable) {
      setupSSE(currentConversation.id)
    }

    return () => {
      if (sseConnection) {
        sseConnection.close()
      }
    }
  }, [currentConversation, apiAvailable])

  // Cleanup SSE on unmount
  useEffect(() => {
    return () => {
      if (sseConnection) {
        sseConnection.close()
      }
    }
  }, [])

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

    // Mark conversation as read
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

  const handleShowDetails = () => {
    if (currentConversation) {
      setCurrentConversation((prev) => ({
        ...prev!,
        showDetails: !prev!.showDetails,
      }))
    }
  }

  const handleGoBack = () => {
    setShowExitConfirm(true)
  }

  const handleExitConfirm = () => {
    // Navigate back to panel
    window.location.href = "/panel"
  }

  const handleSituationChange = (newSituation: string) => {
    if (currentConversation) {
      setCurrentConversation((prev) => ({
        ...prev!,
        situacao: newSituation,
      }))
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
        console.error("❌ Erro ao renomear conversa:", error)
      }
    }
  }

  const handleFinalizarConfirm = async () => {
    if (currentConversation) {
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
    console.log("🔄 Mudando configurações de tema:", newSettings)
    setThemeSettings(newSettings)
    applyThemeSettingsToCSS(newSettings, theme)
  }

  const handleSaveSettings = () => {
    try {
      const settingsToSave = {
        ...themeSettings,
        timestamp: Date.now(),
      }
      localStorage.setItem("chat-theme-settings", JSON.stringify(settingsToSave))
      console.log("💾 Configurações salvas com sucesso:", settingsToSave)

      // Mostrar feedback visual
      const saveButton = document.querySelector("[data-save-button]")
      if (saveButton) {
        saveButton.textContent = "✅ Salvo!"
        setTimeout(() => {
          saveButton.textContent = "💾 Salvar"
        }, 2000)
      }
    } catch (error) {
      console.error("❌ Erro ao salvar configurações:", error)
    }
  }

  const handleResetSettings = () => {
    console.log("🔄 Resetando configurações para padrão")
    setThemeSettings(DEFAULT_THEME_SETTINGS)
    applyThemeSettingsToCSS(DEFAULT_THEME_SETTINGS, theme)
    localStorage.removeItem("chat-theme-settings")

    // Mostrar feedback visual
    const resetButton = document.querySelector("[data-reset-button]")
    if (resetButton) {
      resetButton.textContent = "✅ Reset!"
      setTimeout(() => {
        resetButton.textContent = "🔄 Reset"
      }, 2000)
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
            onNewConversation={() => setShowNewMessage(true)}
            onShowDetails={handleShowDetails}
            onGoBack={handleGoBack}
            onToggleTheme={toggleTheme}
            onToggleFullscreen={toggleFullscreen}
            onToggleControlSidebar={() => setControlSidebarHidden(true)}
            theme={currentTheme}
            isFullscreen={isFullscreen}
            performanceSettings={performanceSettings}
            onPerformanceSettingsChange={handlePerformanceSettingsChange}
            themeSettings={themeSettings}
            onThemeSettingsChange={handleThemeSettingsChange}
            onSaveSettings={handleSaveSettings}
            onResetSettings={handleResetSettings}
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
            onToggleSidebar={() => setSidebarHidden(!sidebarHidden)}
            controlSidebarHidden={controlSidebarHidden}
            onToggleControlSidebar={() => setControlSidebarHidden(!controlSidebarHidden)}
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
            onSelectConversation={handleSelectConversation}
            onArchiveConversation={handleArchiveConversation}
          />
        )}

        {/* Main Chat Area */}
        <div className={`flex-1 flex flex-col scrollbar-hide ${currentTheme === "dark" ? "bg-[#0a0a0a]" : "bg-white"}`}>
          {currentConversation ? (
            <>
              <ChatHeader
                agent={mockAgent}
                conversation={currentConversation}
                onToggleInfo={() => setShowInfo(!showInfo)}
                onEditNickname={() => setIsEditingNickname(true)}
                isEditingNickname={isEditingNickname}
                onNicknameChange={handleNicknameChange}
                onCancelEdit={() => setIsEditingNickname(false)}
                onToggleSidebar={() => setSidebarHidden(!sidebarHidden)}
                onToggleControlSidebar={() => setControlSidebarHidden(!controlSidebarHidden)}
                onFinalize={() => setShowFinalizarModal(true)}
                onArchiveConversation={handleArchiveConversation}
                sidebarHidden={sidebarHidden}
                controlSidebarHidden={controlSidebarHidden}
                theme={currentTheme}
                themeSettings={themeSettings}
              />

              <ChatMessages messages={messages} agent={mockAgent} theme={currentTheme} themeSettings={themeSettings} />

              <ChatInput
                onSendMessage={handleSendMessage}
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
                    <h2 className="text-2xl font-bold mb-4 text-red-500">⚠️ Serviços Indisponíveis</h2>
                    <p className="text-gray-500 mb-6">
                      Os serviços de backend não estão disponíveis. Conecte os serviços para receber mensagens de
                      WhatsApp, Telegram e outros canais.
                    </p>
                    <div className="bg-gray-800 p-4 rounded-lg text-left">
                      <code className="text-green-400">python src/aura/app.py</code>
                    </div>
                  </>
                ) : conversations.length === 0 ? (
                  <>
                    <h2 className="text-2xl font-bold mb-4">📱 Aguardando Mensagens</h2>
                    <p className="text-gray-500 mb-6">
                      Nenhuma conversa ainda. As conversas aparecerão automaticamente quando usuários enviarem mensagens
                      via WhatsApp, Telegram ou outros canais conectados.
                    </p>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <p className="text-blue-600 dark:text-blue-400">
                        ✅ Sistema conectado e aguardando mensagens dos canais
                      </p>
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
            onClose={() => setShowInfo(false)}
            onSituationChange={handleSituationChange}
            theme={currentTheme}
            themeSettings={themeSettings}
          />
        )}
      </div>

      {/* Modals */}
      {showClientData && currentConversation && (
        <ClientDataModal conversation={currentConversation} onClose={() => setShowClientData(false)} />
      )}

      {showNewMessage && (
        <NewMessageModal
          onClose={() => setShowNewMessage(false)}
          onSendTemplate={(template) => {
            console.log("Sending template:", template)
            setShowNewMessage(false)
          }}
          theme={currentTheme}
          themeSettings={themeSettings}
        />
      )}

      {showDetails && currentConversation && (
        <DetailsModal conversation={currentConversation} onClose={() => setShowDetails(false)} theme={currentTheme} />
      )}

      {showExitConfirm && (
        <ExitConfirmModal
          onConfirm={handleExitConfirm}
          onCancel={() => setShowExitConfirm(false)}
          theme={currentTheme}
        />
      )}

      {showFinalizarModal && (
        <FinalizarModal
          onConfirm={handleFinalizarConfirm}
          onCancel={() => setShowFinalizarModal(false)}
          theme={currentTheme}
        />
      )}
    </div>
  )
}

// Main component that provides the language context
const ChatTemplate = () => {
  return (
    <LanguageProvider>
      <ChatTemplateContent />
    </LanguageProvider>
  )
}

export default ChatTemplate
