"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, MessageSquare, MoreHorizontal, EyeOff, User } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Conversation } from "./types"
import type { ThemeSettings } from "./ChatTemplate"

interface ConversationCounts {
  active: number
  waiting: number
}

interface ChatSidebarProps {
  conversations: Conversation[]
  currentConversation: Conversation | null
  conversationCounts: ConversationCounts
  theme: string
  themeSettings: ThemeSettings
  onToggleSidebar: () => void
  controlSidebarHidden: boolean
  onToggleControlSidebar: () => void
  activeFilter: "all" | "active" | "waiting"
  onFilterChange: (filter: "all" | "active" | "waiting") => void
  onSelectConversation: (conversation: Conversation) => void
  onArchiveConversation: (conversationId: string) => void
}

export default function ChatSidebar({
  conversations,
  currentConversation,
  conversationCounts,
  theme,
  themeSettings,
  onToggleSidebar,
  controlSidebarHidden,
  onToggleControlSidebar,
  activeFilter,
  onFilterChange,
  onSelectConversation,
  onArchiveConversation,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [userStatus, setUserStatus] = useState<"online" | "away" | "busy">("online")

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch = conv.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "active" && !conv.isArchived) ||
      (activeFilter === "waiting" && conv.isArchived)
    return matchesSearch && matchesFilter
  })

  const getConversationPreview = (conv: Conversation) => {
    if (conv.lastMessage && typeof conv.lastMessage === "string") {
      return conv.lastMessage.length > 50 ? conv.lastMessage.substring(0, 50) + "..." : conv.lastMessage
    }
    return "Nenhuma mensagem"
  }

  const formatTime = (timestamp: Date | string | undefined) => {
    if (!timestamp) return ""

    const date = timestamp instanceof Date ? timestamp : new Date(timestamp)
    if (isNaN(date.getTime())) return ""

    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d`
    if (hours > 0) return `${hours}h`
    return "agora"
  }

  // Fixed status colors that don't change with theme
  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "away":
        return "bg-red-500" // Não incomodar = vermelho
      case "busy":
        return "bg-yellow-500" // Pausa = amarelo
      default:
        return "bg-gray-400"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "online":
        return "Online"
      case "away":
        return "Não incomodar"
      case "busy":
        return "Pausa"
      default:
        return "Offline"
    }
  }

  const getStatusGlowColor = (status: string) => {
    switch (status) {
      case "online":
        return "#10b981"
      case "away":
        return "#ef4444" // Red for não incomodar
      case "busy":
        return "#f59e0b" // Yellow for pausa
      default:
        return "#6b7280"
    }
  }

  // Get theme-based colors
  const getThemeColors = () => {
    const currentGradient = themeSettings.currentGradient

    if (currentGradient === "Pure Black") {
      return {
        bg: "#000000",
        bgSecondary: "#0a0a0a",
        bgCard: "#111111",
        text: "#ffffff",
        textSecondary: "#e5e5e5",
        textMuted: "#a0a0a0",
        border: "#333333",
        glow: "rgba(255, 255, 255, 0.8)",
      }
    } else if (currentGradient === "Pure White") {
      return {
        bg: "#ffffff",
        bgSecondary: "#f8fafc",
        bgCard: "#f1f5f9",
        text: "#000000",
        textSecondary: "#1f2937",
        textMuted: "#4b5563",
        border: "#e2e8f0",
        glow: "rgba(0, 0, 0, 0.8)",
      }
    } else {
      // Default theme colors
      return theme === "dark"
        ? {
            bg: "#0f0f0f",
            bgSecondary: "#1a1a1a",
            bgCard: "#1e1e1e",
            text: "#ffffff",
            textSecondary: "#e5e5e5",
            textMuted: "#9ca3af",
            border: "#2a2a2a",
            glow: "var(--chat-glow-color)",
          }
        : {
            bg: "#f8fafc",
            bgSecondary: "#ffffff",
            bgCard: "#ffffff",
            text: "#1f2937",
            textSecondary: "#374151",
            textMuted: "#6b7280",
            border: "#e2e8f0",
            glow: "var(--chat-glow-color)",
          }
    }
  }

  const themeColors = getThemeColors()

  // Get avatar gradient based on current theme
  const getAvatarGradient = () => {
    if (themeSettings.glowEffects) {
      return "var(--chat-gradient-primary)"
    }

    const currentGradient = themeSettings.currentGradient

    switch (currentGradient) {
      case "Pure Black":
        return "linear-gradient(135deg, #333333 0%, #666666 100%)"
      case "Pure White":
        return "linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)"
      case "Green Teal":
        return "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)"
      case "Orange Red":
        return "linear-gradient(135deg, #f97316 0%, #ef4444 100%)"
      case "Purple Pink":
        return "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)"
      case "Cyan Blue":
        return "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)"
      default: // Blue Purple
        return "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)"
    }
  }

  // Contagem correta de conversas ativas e arquivadas
  const activeConversations = conversations.filter((c) => !c.isArchived).length
  const archivedConversations = conversations.filter((c) => c.isArchived).length

  return (
    <div
      className={`w-80 border-r flex flex-col h-full transition-all duration-300 ${themeSettings.glowEffects ? "chat-glow-container" : ""}`}
      style={{
        background: `linear-gradient(180deg, ${themeColors.bg} 0%, ${themeColors.bgSecondary} 50%, ${themeColors.bg} 100%)`,
        borderColor: themeColors.border,
        color: themeColors.text,
        boxShadow: themeSettings.glowEffects
          ? `0 0 30px var(--chat-glow-color), inset 0 0 20px var(--chat-glow-color-light)`
          : "none",
        borderWidth: themeSettings.glowEffects ? "1px" : undefined,
        borderStyle: themeSettings.glowEffects ? "solid" : undefined,
      }}
    >
      {/* Header */}
      <div
        className="p-4 border-b transition-all duration-300"
        style={{
          borderColor: themeColors.border,
          background: `linear-gradient(90deg, ${themeColors.bgSecondary} 0%, ${themeColors.bg} 100%)`,
          boxShadow: themeSettings.glowEffects ? `0 0 20px var(--chat-glow-color-light)` : "none",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2
            className={`text-xl font-bold transition-all duration-300 ${
              theme === "dark" ? "header-text-dark" : "header-text-light"
            } ${themeSettings.fadeEnabled ? "chat-fade-text" : ""} ${themeSettings.glowEffects ? "chat-glow-title" : ""} ${themeSettings.textAnimations ? "chat-text-animated" : ""}`}
            style={{
              textShadow: themeSettings.glowEffects
                ? `0 0 20px var(--chat-glow-color), 0 0 40px var(--chat-glow-color-light)`
                : "none",
              filter: themeSettings.glowEffects ? `drop-shadow(0 0 15px var(--chat-glow-color))` : "none",
            }}
          >
            Conversas
          </h2>
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`transition-all duration-300 transform hover:scale-110 ${
                    theme === "dark" ? "sidebar-icon-dark" : "sidebar-icon-light"
                  } ${themeSettings.textAnimations ? "chat-text-animated" : ""} ${themeSettings.glowEffects ? "chat-glow-title hover:chat-glow-border" : ""}`}
                  style={{
                    filter: themeSettings.glowEffects ? `drop-shadow(0 0 12px var(--chat-glow-color))` : "none",
                    borderColor: themeSettings.glowEffects ? "var(--chat-glow-color)" : "transparent",
                    boxShadow: themeSettings.glowEffects ? `0 0 15px var(--chat-glow-color-light)` : "none",
                  }}
                >
                  <EyeOff className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className={`backdrop-blur-sm transition-all duration-300 ${themeSettings.glowEffects ? "chat-glow-border" : ""}`}
                style={{
                  backgroundColor: `${themeColors.bgCard}dd`,
                  color: themeColors.text,
                  borderColor: themeColors.border,
                  borderWidth: themeSettings.glowEffects ? "1px" : undefined,
                  borderStyle: themeSettings.glowEffects ? "solid" : undefined,
                  boxShadow: themeSettings.glowEffects ? `0 0 20px var(--chat-glow-color-light)` : "none",
                }}
              >
                <DropdownMenuItem
                  onClick={onToggleSidebar}
                  className={`transition-all duration-300 ${themeSettings.textAnimations ? "chat-text-animated" : ""} ${themeSettings.fadeEnabled ? "chat-fade-text" : ""} ${themeSettings.glowEffects ? "hover:chat-glow-title" : ""}`}
                  style={{ color: themeColors.text }}
                >
                  <EyeOff className="w-4 h-4 mr-2" />
                  <span className={`${themeSettings.glowEffects ? "chat-glow-title" : ""}`}>Ocultar Sidebar</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search
            className={`absolute left-3 top-3 w-4 h-4 transition-all duration-300 ${
              theme === "dark" ? "sidebar-icon-dark" : "sidebar-icon-light"
            } ${themeSettings.glowEffects ? "chat-glow-title" : ""}`}
            style={{
              filter: themeSettings.glowEffects ? `drop-shadow(0 0 10px var(--chat-glow-color))` : "none",
              textShadow: themeSettings.glowEffects ? `0 0 10px var(--chat-glow-color)` : "none",
            }}
          />
          <Input
            placeholder="Pesquisar conversas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`pl-10 transition-all duration-300 ${themeSettings.glowEffects ? "focus:chat-glow-border" : ""} ${themeSettings.fadeEnabled ? "chat-fade-text" : ""}`}
            style={{
              backgroundColor: `${themeColors.bgCard}80`,
              borderColor: themeColors.border,
              color: themeColors.text,
              borderWidth: themeSettings.glowEffects ? "1px" : undefined,
              borderStyle: themeSettings.glowEffects ? "solid" : undefined,
              boxShadow: themeSettings.glowEffects ? `0 0 15px var(--chat-glow-color-light)` : "none",
            }}
          />
        </div>

        {/* Filters with Counters */}
        <div className="flex items-center space-x-1">
          <Button
            variant={activeFilter === "all" ? "default" : "ghost"}
            size="sm"
            onClick={() => onFilterChange("all")}
            className={`text-xs transition-all duration-300 transform hover:scale-105 ${
              activeFilter !== "all" ? (theme === "dark" ? "filter-text-dark" : "filter-text-light") : ""
            } ${themeSettings.textAnimations ? "chat-text-animated" : ""} ${themeSettings.glowEffects && activeFilter === "all" ? "chat-glow-title" : ""}`}
            style={
              activeFilter === "all" && themeSettings.glowEffects
                ? {
                    background: "var(--chat-gradient-primary)",
                    boxShadow: `0 0 25px var(--chat-glow-color), 0 0 50px var(--chat-glow-color-light)`,
                    textShadow: "0 0 15px rgba(255, 255, 255, 0.8)",
                    border: `1px solid var(--chat-glow-color)`,
                    color: "#ffffff",
                  }
                : activeFilter === "all"
                  ? {
                      background: "var(--chat-gradient-primary)",
                      color: "#ffffff",
                    }
                  : {
                      borderColor: themeSettings.glowEffects ? "var(--chat-glow-color)" : "transparent",
                      boxShadow: themeSettings.glowEffects ? `0 0 10px var(--chat-glow-color-light)` : "none",
                    }
            }
          >
            {conversations.length} - Todas
          </Button>
          <Button
            variant={activeFilter === "active" ? "default" : "ghost"}
            size="sm"
            onClick={() => onFilterChange("active")}
            className={`text-xs transition-all duration-300 transform hover:scale-105 ${
              activeFilter !== "active" ? (theme === "dark" ? "filter-text-dark" : "filter-text-light") : ""
            } ${themeSettings.textAnimations ? "chat-text-animated" : ""} ${themeSettings.glowEffects && activeFilter === "active" ? "chat-glow-title" : ""}`}
            style={
              activeFilter === "active" && themeSettings.glowEffects
                ? {
                    background: "var(--chat-gradient-primary)",
                    boxShadow: `0 0 25px var(--chat-glow-color), 0 0 50px var(--chat-glow-color-light)`,
                    textShadow: "0 0 15px rgba(255, 255, 255, 0.8)",
                    border: `1px solid var(--chat-glow-color)`,
                    color: "#ffffff",
                  }
                : activeFilter === "active"
                  ? {
                      background: "var(--chat-gradient-primary)",
                      color: "#ffffff",
                    }
                  : {
                      borderColor: themeSettings.glowEffects ? "var(--chat-glow-color)" : "transparent",
                      boxShadow: themeSettings.glowEffects ? `0 0 10px var(--chat-glow-color-light)` : "none",
                    }
            }
          >
            {activeConversations} - Ativas
          </Button>
          <Button
            variant={activeFilter === "waiting" ? "default" : "ghost"}
            size="sm"
            onClick={() => onFilterChange("waiting")}
            className={`text-xs transition-all duration-300 transform hover:scale-105 ${
              activeFilter !== "waiting" ? (theme === "dark" ? "filter-text-dark" : "filter-text-light") : ""
            } ${themeSettings.textAnimations ? "chat-text-animated" : ""} ${themeSettings.glowEffects && activeFilter === "waiting" ? "chat-glow-title" : ""}`}
            style={
              activeFilter === "waiting" && themeSettings.glowEffects
                ? {
                    background: "var(--chat-gradient-primary)",
                    boxShadow: `0 0 25px var(--chat-glow-color), 0 0 50px var(--chat-glow-color-light)`,
                    textShadow: "0 0 15px rgba(255, 255, 255, 0.8)",
                    border: `1px solid var(--chat-glow-color)`,
                    color: "#ffffff",
                  }
                : activeFilter === "waiting"
                  ? {
                      background: "var(--chat-gradient-primary)",
                      color: "#ffffff",
                    }
                  : {
                      borderColor: themeSettings.glowEffects ? "var(--chat-glow-color)" : "transparent",
                      boxShadow: themeSettings.glowEffects ? `0 0 10px var(--chat-glow-color-light)` : "none",
                    }
            }
          >
            {archivedConversations} - Arquivadas
          </Button>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <MessageSquare
              className={`w-12 h-12 mb-4 transition-all duration-300 ${
                theme === "dark" ? "sidebar-icon-dark" : "sidebar-icon-light"
              } ${themeSettings.glowEffects ? "chat-glow-title" : ""}`}
              style={{
                filter: themeSettings.glowEffects ? `drop-shadow(0 0 20px var(--chat-glow-color))` : "none",
              }}
            />
            <p
              className={`text-center transition-all duration-300 ${themeSettings.fadeEnabled ? "chat-fade-text" : ""} ${themeSettings.glowEffects ? "chat-glow-title" : ""}`}
              style={{ color: themeColors.textMuted }}
            >
              {searchQuery ? "Nenhuma conversa encontrada" : "Nenhuma conversa ainda"}
            </p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`p-3 rounded-lg cursor-pointer transition-all duration-300 transform hover:scale-[1.02] relative overflow-hidden group ${themeSettings.textAnimations ? "chat-text-animated" : ""}`}
                style={{
                  background:
                    currentConversation?.id === conversation.id
                      ? themeSettings.glowEffects
                        ? "var(--chat-gradient-primary)"
                        : themeColors.bgCard
                      : "transparent",
                  color: currentConversation?.id === conversation.id ? "#ffffff" : themeColors.text,
                  boxShadow:
                    currentConversation?.id === conversation.id && themeSettings.glowEffects
                      ? `0 0 25px var(--chat-glow-color), 0 0 50px var(--chat-glow-color-light)`
                      : "none",
                }}
                onClick={() => onSelectConversation(conversation)}
              >
                {/* Glow effect overlay */}
                {themeSettings.glowEffects && currentConversation?.id !== conversation.id && (
                  <>
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"
                      style={{
                        background: `linear-gradient(90deg, var(--chat-glow-color), transparent, var(--chat-glow-color))`,
                        opacity: 0.15,
                      }}
                    />
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg blur-xl scale-110"
                      style={{
                        background: "var(--chat-glow-color)",
                        opacity: 0.1,
                      }}
                    />
                  </>
                )}

                <div className="flex items-start space-x-3 relative z-10">
                  {/* Avatar com ícone User */}
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 ${themeSettings.glowEffects ? "chat-glow-border" : ""}`}
                    style={{
                      background: getAvatarGradient(),
                      boxShadow: themeSettings.glowEffects
                        ? `0 0 20px var(--chat-glow-color), 0 0 40px var(--chat-glow-color-light)`
                        : "none",
                      border: themeSettings.glowEffects ? `2px solid var(--chat-glow-color)` : "none",
                    }}
                  >
                    <User
                      className={`w-6 h-6 ${themeSettings.glowEffects ? "chat-glow-title" : ""}`}
                      style={{
                        color: themeSettings.currentGradient === "Pure White" ? "#000000" : "#ffffff",
                        filter: themeSettings.glowEffects ? "drop-shadow(0 0 8px rgba(255, 255, 255, 0.8))" : "none",
                      }}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-medium truncate transition-all duration-300`}>{conversation.title}</h3>
                      <div className="flex items-center space-x-1">
                        {conversation.updatedAt && (
                          <span
                            className={`text-xs transition-all duration-300 chat-time-stable`}
                            style={{
                              color:
                                currentConversation?.id === conversation.id
                                  ? "rgba(255, 255, 255, 0.8)"
                                  : theme === "dark"
                                    ? "#9ca3af"
                                    : "#6b7280",
                            }}
                          >
                            {formatTime(conversation.updatedAt)}
                          </span>
                        )}
                        {conversation.unreadCount > 0 && !conversation.isArchived && (
                          <Badge
                            className={`text-xs transition-all duration-300 transform group-hover:scale-110 ${themeSettings.glowEffects ? "chat-glow-border" : ""}`}
                            style={
                              themeSettings.glowEffects
                                ? {
                                    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                                    boxShadow: "0 0 15px #ef4444, 0 0 30px rgba(239, 68, 68, 0.3)",
                                    textShadow: "0 0 8px rgba(255, 255, 255, 0.8)",
                                    borderWidth: "1px",
                                    borderStyle: "solid",
                                    borderColor: "#ef4444",
                                    color: "#ffffff",
                                  }
                                : {
                                    background: "#ef4444",
                                    color: "#ffffff",
                                  }
                            }
                          >
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p
                      className={`text-sm truncate transition-all duration-300`}
                      style={{
                        color:
                          currentConversation?.id === conversation.id
                            ? "rgba(255, 255, 255, 0.7)"
                            : themeColors.textMuted,
                      }}
                    >
                      {getConversationPreview(conversation)}
                    </p>
                    {conversation.situacao && (
                      <div className="flex items-center mt-1">
                        <span
                          className={`text-xs px-2 py-1 rounded-full transition-all duration-300 ${themeSettings.glowEffects ? "chat-glow-border" : ""}`}
                          style={
                            themeSettings.glowEffects
                              ? {
                                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                  color: "white",
                                  textShadow: "0 0 8px rgba(255, 255, 255, 0.6)",
                                  boxShadow: "0 0 10px #10b981",
                                }
                              : {
                                  background: "#10b981",
                                  color: "white",
                                }
                          }
                        >
                          {conversation.situacao}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Archive indicator */}
                {conversation.isArchived && (
                  <div className="absolute top-2 right-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer with Status Display */}
      <div
        className="p-4 border-t transition-all duration-300"
        style={{
          borderColor: themeColors.border,
          background: `linear-gradient(90deg, ${themeColors.bgSecondary} 0%, ${themeColors.bg} 100%)`,
          boxShadow: themeSettings.glowEffects ? `0 0 20px var(--chat-glow-color-light)` : "none",
        }}
      >
        <div className="flex items-center justify-between">
          {/* Status Display */}
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full transition-all duration-300 ${getStatusColor(userStatus)} ${
                themeSettings.glowEffects ? "shadow-lg" : ""
              }`}
              style={
                themeSettings.glowEffects
                  ? {
                      boxShadow: `0 0 15px ${getStatusGlowColor(userStatus)}, 0 0 30px ${getStatusGlowColor(userStatus)}`,
                    }
                  : {}
              }
            />
            <span
              className={`text-sm transition-all duration-300 ${
                theme === "dark" ? "status-text-dark" : "status-text-light"
              } ${themeSettings.fadeEnabled ? "chat-fade-text" : ""} ${themeSettings.glowEffects ? "chat-glow-title" : ""}`}
              style={{
                textShadow: themeSettings.glowEffects ? `0 0 10px var(--chat-glow-color)` : "none",
              }}
            >
              {getStatusText(userStatus)}
            </span>
          </div>

          {/* Settings Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`transition-all duration-300 transform hover:scale-110 ${
                  theme === "dark" ? "sidebar-icon-dark" : "sidebar-icon-light"
                } ${themeSettings.textAnimations ? "chat-text-animated" : ""} ${themeSettings.glowEffects ? "chat-glow-title hover:chat-glow-border" : ""}`}
                style={{
                  filter: themeSettings.glowEffects ? `drop-shadow(0 0 12px var(--chat-glow-color))` : "none",
                  borderColor: themeSettings.glowEffects ? "var(--chat-glow-color)" : "transparent",
                  boxShadow: themeSettings.glowEffects ? `0 0 15px var(--chat-glow-color-light)` : "none",
                }}
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className={`backdrop-blur-sm transition-all duration-300 ${themeSettings.glowEffects ? "chat-glow-border" : ""}`}
              style={{
                backgroundColor: `${themeColors.bgCard}dd`,
                color: themeColors.text,
                borderColor: themeColors.border,
                borderWidth: themeSettings.glowEffects ? "1px" : undefined,
                borderStyle: themeSettings.glowEffects ? "solid" : undefined,
                boxShadow: themeSettings.glowEffects ? `0 0 20px var(--chat-glow-color-light)` : "none",
                background: themeSettings.glowEffects
                  ? `linear-gradient(135deg, ${themeColors.bgCard}f0 0%, ${themeColors.bgSecondary}f0 100%)`
                  : `${themeColors.bgCard}dd`,
              }}
            >
              <div className="p-2">
                <div className="mb-2">
                  <span
                    className={`text-xs font-medium transition-all duration-300 ${
                      theme === "dark" ? "status-text-dark" : "status-text-light"
                    } ${themeSettings.fadeEnabled ? "chat-fade-text" : ""} ${themeSettings.glowEffects ? "chat-glow-title" : ""}`}
                  >
                    Alterar Status:
                  </span>
                </div>
                <DropdownMenuItem
                  onClick={() => setUserStatus("online")}
                  className={`transition-all duration-300 flex items-center ${themeSettings.textAnimations ? "chat-text-animated" : ""} ${themeSettings.glowEffects ? "hover:chat-glow-title" : ""}`}
                  style={{ color: themeColors.text }}
                >
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2" />
                  <span className={`${themeSettings.glowEffects ? "chat-glow-title" : ""}`}>Online</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setUserStatus("away")}
                  className={`transition-all duration-300 flex items-center ${themeSettings.textAnimations ? "chat-text-animated" : ""} ${themeSettings.glowEffects ? "hover:chat-glow-title" : ""}`}
                  style={{ color: themeColors.text }}
                >
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2" />
                  <span className={`${themeSettings.glowEffects ? "chat-glow-title" : ""}`}>Não incomodar</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setUserStatus("busy")}
                  className={`transition-all duration-300 flex items-center ${themeSettings.textAnimations ? "chat-text-animated" : ""} ${themeSettings.glowEffects ? "hover:chat-glow-title" : ""}`}
                  style={{ color: themeColors.text }}
                >
                  <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2" />
                  <span className={`${themeSettings.glowEffects ? "chat-glow-title" : ""}`}>Pausa</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
