"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Info,
  Edit3,
  Check,
  X,
  Menu,
  Settings,
  Bell,
  BellOff,
  MessageSquare,
  MoreVertical,
  Archive,
} from "lucide-react"
import type { AIAgent, Conversation } from "./types"
import type { ThemeSettings } from "./ChatTemplate"

interface ChatHeaderProps {
  agent: AIAgent
  conversation: Conversation
  onToggleInfo: () => void
  onEditNickname: () => void
  isEditingNickname: boolean
  onNicknameChange: (nickname: string) => void
  onCancelEdit: () => void
  onToggleSidebar: () => void
  onToggleControlSidebar: () => void
  onFinalize: () => void
  onArchiveConversation: (conversationId: string) => void
  sidebarHidden: boolean
  controlSidebarHidden: boolean
  theme: string
  themeSettings: ThemeSettings
}

export default function ChatHeader({
  agent,
  conversation,
  onToggleInfo,
  onEditNickname,
  isEditingNickname,
  onNicknameChange,
  onCancelEdit,
  onToggleSidebar,
  onToggleControlSidebar,
  onFinalize,
  onArchiveConversation,
  sidebarHidden,
  controlSidebarHidden,
  theme,
  themeSettings,
}: ChatHeaderProps) {
  const [editingValue, setEditingValue] = useState(conversation.title)
  const [notificationSettings, setNotificationSettings] = useState({
    chatNotifications: true,
    allMessages: true,
    onlyWaiting: false,
  })

  // Get theme-based colors
  const getThemeColors = () => {
    const currentGradient = themeSettings.currentGradient

    if (currentGradient === "Pure Black") {
      return {
        bg: "#000000",
        bgSecondary: "#1a1a1a",
        text: "#ffffff",
        textSecondary: "#e5e5e5",
        textMuted: "#a0a0a0",
        border: "#333333",
        glow: "rgba(255, 255, 255, 0.8)",
        iconColor: "#f8fafc",
      }
    } else if (currentGradient === "Pure White") {
      return {
        bg: "#ffffff",
        bgSecondary: "#f8fafc",
        text: "#1f2937",
        textSecondary: "#374151",
        textMuted: "#4b5563",
        border: "#e2e8f0",
        glow: "rgba(0, 0, 0, 0.8)",
        iconColor: "#1f2937",
      }
    } else {
      return theme === "dark"
        ? {
            bg: "#0f0f0f",
            bgSecondary: "#1a1a1a",
            text: "#ffffff",
            textSecondary: "#e5e5e5",
            textMuted: "#9ca3af",
            border: "#374151",
            glow: "var(--chat-glow-color)",
            iconColor: "#f8fafc",
          }
        : {
            bg: "#ffffff",
            bgSecondary: "#f8fafc",
            text: "#1f2937",
            textSecondary: "#374151",
            textMuted: "#6b7280",
            border: "#e2e8f0",
            glow: "var(--chat-glow-color)",
            iconColor: "#1f2937",
          }
    }
  }

  const themeColors = getThemeColors()

  // Get icon style based on current theme settings
  const getIconStyle = (isActive = false) => {
    if (themeSettings.glowEffects) {
      return {
        background: "var(--chat-gradient-primary)",
        color: "#ffffff",
        border: "1px solid var(--chat-glow-color)",
        boxShadow: `0 0 20px var(--chat-glow-color), 0 0 40px var(--chat-glow-color-light)`,
        textShadow: "0 0 8px rgba(255, 255, 255, 0.8)",
      }
    } else {
      return {
        color: themeColors.iconColor,
        backgroundColor: "transparent",
        border: "1px solid transparent",
      }
    }
  }

  const handleSaveNickname = () => {
    onNicknameChange(editingValue)
  }

  const handleNotificationChange = (type: string, value: boolean) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [type]: value,
      // Logic to handle mutual exclusivity
      ...(type === "allMessages" && value ? { onlyWaiting: false } : {}),
      ...(type === "onlyWaiting" && value ? { allMessages: false } : {}),
    }))
  }

  return (
    <div
      className={`border-b p-4 flex items-center justify-between transition-all duration-300 ${themeSettings.glowEffects ? "chat-glow-container" : ""}`}
      style={{
        backgroundColor: themeColors.bg,
        borderColor: themeColors.border,
        boxShadow: themeSettings.glowEffects ? `0 0 20px ${themeColors.glow.replace("0.8", "0.3")}` : "none",
      }}
    >
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        {/* Toggle Sidebars */}
        <div className="flex items-center space-x-2">
          {controlSidebarHidden && (
            <Button
              onClick={onToggleControlSidebar}
              variant="ghost"
              size="icon"
              className={`transition-all duration-300 transform hover:scale-110 ${themeSettings.textAnimations ? "chat-text-animated" : ""}`}
              style={getIconStyle()}
            >
              <Settings className="w-5 h-5" />
            </Button>
          )}

          {sidebarHidden && (
            <Button
              onClick={onToggleSidebar}
              variant="ghost"
              size="icon"
              className={`transition-all duration-300 transform hover:scale-110 ${themeSettings.textAnimations ? "chat-text-animated" : ""}`}
              style={getIconStyle()}
            >
              <Menu className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* Agent Info */}
        <div className="flex items-center space-x-3">
          {/* Avatar */}
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${themeSettings.glowEffects ? "chat-glow-border" : ""}`}
            style={{
              background: themeSettings.glowEffects
                ? "var(--chat-gradient-primary)"
                : "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
              boxShadow: themeSettings.glowEffects
                ? `0 0 20px var(--chat-glow-color), 0 0 40px var(--chat-glow-color-light)`
                : "none",
              border: themeSettings.glowEffects ? `2px solid var(--chat-glow-color)` : "none",
            }}
          >
            <span
              className={`font-semibold text-sm text-white ${themeSettings.glowEffects ? "chat-glow-title" : ""}`}
              style={{
                textShadow: themeSettings.glowEffects ? "0 0 15px rgba(255, 255, 255, 0.8)" : "none",
              }}
            >
              {conversation.title.charAt(0).toUpperCase()}
            </span>
          </div>

          {/* Name and Status */}
          <div>
            {isEditingNickname ? (
              <div className="flex items-center space-x-2">
                <Input
                  value={editingValue}
                  onChange={(e) => setEditingValue(e.target.value)}
                  className="h-8 w-32"
                  style={{
                    backgroundColor: themeColors.bgSecondary,
                    borderColor: themeColors.border,
                    color: themeColors.text,
                  }}
                />
                <Button onClick={handleSaveNickname} size="sm" className="h-8 w-8 p-0" style={getIconStyle()}>
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  onClick={onCancelEdit}
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0"
                  style={{
                    borderColor: themeColors.border,
                    color: themeColors.textMuted,
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <h2
                  className={`font-semibold transition-all duration-300 ${themeSettings.fadeEnabled ? "chat-fade-text" : ""} ${themeSettings.glowEffects ? "chat-glow-title" : ""} ${themeSettings.textAnimations ? "chat-text-animated" : ""}`}
                  style={{
                    color: themeColors.text,
                    textShadow: themeSettings.glowEffects ? `0 0 15px var(--chat-glow-color)` : "none",
                  }}
                >
                  {conversation.title}
                </h2>
                <Button
                  onClick={onEditNickname}
                  variant="ghost"
                  size="icon"
                  className={`w-6 h-6 transition-all duration-300 transform hover:scale-110 ${themeSettings.textAnimations ? "chat-text-animated" : ""}`}
                  style={getIconStyle()}
                >
                  <Edit3 className="w-3 h-3" />
                </Button>
              </div>
            )}

            <div className="flex items-center space-x-2 mt-1">
              <div
                className="w-2 h-2 rounded-full bg-green-500"
                style={
                  themeSettings.glowEffects
                    ? {
                        boxShadow: "0 0 8px #10b981, 0 0 16px #10b981",
                      }
                    : {}
                }
              />
              <span
                className={`text-sm transition-all duration-300 ${themeSettings.fadeEnabled ? "chat-fade-text" : ""} ${themeSettings.glowEffects ? "chat-glow-title" : ""}`}
                style={{
                  color: themeColors.textSecondary,
                  textShadow: themeSettings.glowEffects ? `0 0 10px var(--chat-glow-color)` : "none",
                }}
              >
                Online • Em Atendimento
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-2">
        {/* Archive Button */}
        <Button
          onClick={() => onArchiveConversation(conversation.id)}
          variant="outline"
          size="sm"
          className={`transition-all duration-300 transform hover:scale-105 ${themeSettings.textAnimations ? "chat-text-animated" : ""}`}
          style={getIconStyle()}
        >
          <Archive className="w-4 h-4 mr-1" />
          {conversation.isArchived ? "Desarquivar" : "Arquivar"}
        </Button>

        {/* Notifications Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`transition-all duration-300 transform hover:scale-110 ${themeSettings.textAnimations ? "chat-text-animated" : ""}`}
              style={getIconStyle(notificationSettings.chatNotifications)}
            >
              {notificationSettings.chatNotifications ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className={`w-64 backdrop-blur-sm transition-all duration-300 ${themeSettings.glowEffects ? "chat-glow-border" : ""}`}
            style={{
              backgroundColor: `${themeColors.bgSecondary}f0`,
              color: themeColors.text,
              borderColor: themeColors.border,
              boxShadow: themeSettings.glowEffects ? `0 0 20px var(--chat-glow-color-light)` : "none",
            }}
          >
            <div className="p-3">
              <h3
                className={`font-semibold mb-3 transition-all duration-300 ${themeSettings.fadeEnabled ? "chat-fade-text" : ""} ${themeSettings.glowEffects ? "chat-glow-title" : ""}`}
                style={{
                  color: themeColors.text,
                  textShadow: themeSettings.glowEffects ? `0 0 10px var(--chat-glow-color)` : "none",
                }}
              >
                Notificações do Chat
              </h3>

              <DropdownMenuItem
                onClick={() => handleNotificationChange("chatNotifications", !notificationSettings.chatNotifications)}
                className={`transition-all duration-300 ${themeSettings.textAnimations ? "chat-text-animated" : ""} ${themeSettings.glowEffects ? "hover:chat-glow-title" : ""}`}
                style={{ color: themeColors.text }}
              >
                <div className="flex items-center justify-between w-full">
                  <span>Desativar Notificações</span>
                  <div
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-300`}
                    style={{
                      backgroundColor: !notificationSettings.chatNotifications
                        ? themeSettings.glowEffects
                          ? "var(--chat-glow-color)"
                          : "#f97316"
                        : "transparent",
                      borderColor: !notificationSettings.chatNotifications
                        ? themeSettings.glowEffects
                          ? "var(--chat-glow-color)"
                          : "#f97316"
                        : themeColors.textMuted,
                      boxShadow:
                        themeSettings.glowEffects && !notificationSettings.chatNotifications
                          ? `0 0 10px var(--chat-glow-color)`
                          : "none",
                    }}
                  >
                    {!notificationSettings.chatNotifications && <Check className="w-3 h-3 text-white" />}
                  </div>
                </div>
              </DropdownMenuItem>

              <DropdownMenuSeparator style={{ backgroundColor: themeColors.border }} />

              <DropdownMenuItem
                onClick={() => handleNotificationChange("allMessages", !notificationSettings.allMessages)}
                className={`transition-all duration-300 ${themeSettings.textAnimations ? "chat-text-animated" : ""} ${themeSettings.glowEffects ? "hover:chat-glow-title" : ""}`}
                style={{
                  color: themeColors.text,
                  backgroundColor: notificationSettings.allMessages
                    ? themeSettings.glowEffects
                      ? "var(--chat-glow-color-light)"
                      : "rgba(59, 130, 246, 0.2)"
                    : "transparent",
                }}
              >
                <div className="flex items-center justify-between w-full">
                  <span>Notificar Todas Mensagens</span>
                  <div
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-300`}
                    style={{
                      backgroundColor: notificationSettings.allMessages
                        ? themeSettings.glowEffects
                          ? "var(--chat-glow-color)"
                          : "#3b82f6"
                        : "transparent",
                      borderColor: notificationSettings.allMessages
                        ? themeSettings.glowEffects
                          ? "var(--chat-glow-color)"
                          : "#3b82f6"
                        : themeColors.textMuted,
                      boxShadow:
                        themeSettings.glowEffects && notificationSettings.allMessages
                          ? `0 0 10px var(--chat-glow-color)`
                          : "none",
                    }}
                  >
                    {notificationSettings.allMessages && <Check className="w-3 h-3 text-white" />}
                  </div>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => handleNotificationChange("onlyWaiting", !notificationSettings.onlyWaiting)}
                className={`transition-all duration-300 ${themeSettings.textAnimations ? "chat-text-animated" : ""} ${themeSettings.glowEffects ? "hover:chat-glow-title" : ""}`}
                style={{ color: themeColors.text }}
              >
                <div className="flex items-center justify-between w-full">
                  <span>Somente Aguardando</span>
                  <div
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-300`}
                    style={{
                      backgroundColor: notificationSettings.onlyWaiting
                        ? themeSettings.glowEffects
                          ? "var(--chat-glow-color)"
                          : "#f97316"
                        : "transparent",
                      borderColor: notificationSettings.onlyWaiting
                        ? themeSettings.glowEffects
                          ? "var(--chat-glow-color)"
                          : "#f97316"
                        : themeColors.textMuted,
                      boxShadow:
                        themeSettings.glowEffects && notificationSettings.onlyWaiting
                          ? `0 0 10px var(--chat-glow-color)`
                          : "none",
                    }}
                  >
                    {notificationSettings.onlyWaiting && <Check className="w-3 h-3 text-white" />}
                  </div>
                </div>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Info Button */}
        <Button
          onClick={onToggleInfo}
          variant="ghost"
          size="icon"
          className={`transition-all duration-300 transform hover:scale-110 ${themeSettings.textAnimations ? "chat-text-animated" : ""}`}
          style={getIconStyle()}
        >
          <Info className="w-5 h-5" />
        </Button>

        {/* More Options */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`transition-all duration-300 transform hover:scale-110 ${themeSettings.textAnimations ? "chat-text-animated" : ""}`}
              style={getIconStyle()}
            >
              <MoreVertical className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className={`backdrop-blur-sm transition-all duration-300 ${themeSettings.glowEffects ? "chat-glow-border" : ""}`}
            style={{
              backgroundColor: `${themeColors.bgSecondary}f0`,
              color: themeColors.text,
              borderColor: themeColors.border,
              boxShadow: themeSettings.glowEffects ? `0 0 20px var(--chat-glow-color-light)` : "none",
            }}
          >
            <DropdownMenuItem
              onClick={onFinalize}
              className={`transition-all duration-300 ${themeSettings.textAnimations ? "chat-text-animated" : ""} ${themeSettings.glowEffects ? "hover:chat-glow-title" : ""}`}
              style={{ color: themeColors.text }}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              <span className={`${themeSettings.glowEffects ? "chat-glow-title" : ""}`}>Finalizar Conversa</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
