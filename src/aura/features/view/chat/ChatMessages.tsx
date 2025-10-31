"use client"

import { useEffect, useRef } from "react"
import { CheckCheck, Clock, BotIcon } from "lucide-react"
import type { Message, AIAgent } from "./types"
import type { ThemeSettings } from "./ChatTemplate"

interface ChatMessagesProps {
  messages: Message[]
  agent: AIAgent
  theme: string
  themeSettings: ThemeSettings
}

export default function ChatMessages({ messages, agent, theme, themeSettings }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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
        userBg: "#2a2a2a",
        assistantBg: "#1a1a1a",
      }
    } else if (currentGradient === "Pure White") {
      return {
        bg: "#ffffff",
        bgSecondary: "#f8fafc",
        text: "#1f2937",
        textSecondary: "#374151",
        textMuted: "#4b5563",
        border: "#e2e8f0",
        userBg: "#f1f5f9",
        assistantBg: "#e2e8f0",
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
            userBg: "#374151",
            assistantBg: "#1e40af",
          }
        : {
            bg: "#ffffff",
            bgSecondary: "#f8fafc",
            text: "#1f2937",
            textSecondary: "#374151",
            textMuted: "#6b7280",
            border: "#e2e8f0",
            userBg: "#f1f5f9",
            assistantBg: "#3b82f6",
          }
    }
  }

  const themeColors = getThemeColors()

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Ordenar mensagens por timestamp para garantir ordem correta
  const sortedMessages = [...messages].sort((a, b) => {
    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  })

  return (
    <div
      className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide"
      style={{
        backgroundColor: themeColors.bg,
      }}
    >
      {sortedMessages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div
              className={`text-6xl mb-4 ${themeSettings.glowEffects ? "chat-glow-title" : ""}`}
              style={{
                color: themeColors.textMuted,
                textShadow: themeSettings.glowEffects ? `0 0 20px var(--chat-glow-color)` : "none",
              }}
            >
              Mensagem
            </div>
            <h3
              className={`text-xl font-semibold mb-2 ${themeSettings.fadeEnabled ? "chat-fade-text" : ""} ${themeSettings.glowEffects ? "chat-glow-title" : ""}`}
              style={{
                color: themeColors.text,
                textShadow: themeSettings.glowEffects ? `0 0 15px var(--chat-glow-color)` : "none",
              }}
            >
              Nenhuma mensagem ainda
            </h3>
            <p
              className={`${themeSettings.fadeEnabled ? "chat-fade-text" : ""}`}
              style={{ color: themeColors.textMuted }}
            >
              Inicie uma conversa enviando uma mensagem
            </p>
          </div>
        </div>
      ) : (
        <>
          {sortedMessages.map((message, index) => {
            // Determinar se é mensagem do usuário ou operador
            const isUser = message.role === "user"
            const isOperator = message.role === "operator" || message.role === "assistant"

            // Garantir ID único e consistente
            const messageId = message.id || `msg-${message.timestamp.getTime()}-${index}`

            return (
              <div
                key={messageId}
                className={`flex ${isOperator ? "justify-end" : "justify-start"} items-start space-x-2`}
              >
                {/* Avatar para mensagens do usuário (esquerda) */}
                {isUser && (
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${themeSettings.glowEffects ? "chat-glow-border" : ""}`}
                    style={{
                      background: themeSettings.glowEffects
                        ? "var(--chat-gradient-secondary)"
                        : "linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)",
                      boxShadow: themeSettings.glowEffects ? `0 0 15px var(--chat-glow-color-light)` : "none",
                      border: themeSettings.glowEffects ? `1px solid var(--chat-glow-color)` : "none",
                    }}
                  >
                    <span
                      className={`text-xs font-semibold text-white ${themeSettings.glowEffects ? "chat-glow-title" : ""}`}
                      style={{
                        textShadow: themeSettings.glowEffects ? "0 0 10px rgba(255, 255, 255, 0.8)" : "none",
                      }}
                    >
                      U
                    </span>
                  </div>
                )}

                {/* Message Content */}
                <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${isOperator ? "order-1" : ""}`}>
                  <div
                    className={`rounded-lg p-3 transition-all duration-300 ${themeSettings.glowEffects ? "chat-glow-border" : ""} ${themeSettings.textAnimations ? "chat-text-animated" : ""}`}
                    style={{
                      backgroundColor: isOperator ? themeColors.assistantBg : themeColors.userBg,
                      color: isOperator ? "#ffffff" : themeColors.text,
                      boxShadow: themeSettings.glowEffects
                        ? `0 0 15px var(--chat-glow-color-light)`
                        : "0 1px 2px rgba(0, 0, 0, 0.1)",
                      border: themeSettings.glowEffects ? `1px solid var(--chat-glow-color)` : "none",
                      wordWrap: "break-word",
                      overflowWrap: "break-word",
                      wordBreak: "break-word",
                      whiteSpace: "pre-wrap",
                      maxWidth: "100%",
                    }}
                  >
                    <p
                      className={`text-sm leading-relaxed ${themeSettings.fadeEnabled ? "chat-fade-text" : ""} ${themeSettings.glowEffects ? "chat-glow-title" : ""}`}
                      style={{
                        textShadow:
                          themeSettings.glowEffects && isOperator ? "0 0 10px rgba(255, 255, 255, 0.6)" : "none",
                        wordWrap: "break-word",
                        overflowWrap: "break-word",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {message.content}
                    </p>

                    {/* Time and Status */}
                    <div className={`flex items-center justify-end mt-1 space-x-1`}>
                      <span
                        className="text-xs opacity-70"
                        style={{
                          color: isOperator ? "rgba(255, 255, 255, 0.8)" : themeColors.textMuted,
                        }}
                      >
                        {formatTime(message.timestamp)}
                      </span>

                      {/* Status indicator for operator messages */}
                      {isOperator && (
                        <div className="flex items-center">
                          {message.status === "sent" && (
                            <CheckCheck
                              className="w-3 h-3 opacity-70"
                              style={{
                                color: "rgba(255, 255, 255, 0.8)",
                              }}
                            />
                          )}
                          {message.status === "error" && (
                            <Clock
                              className="w-3 h-3 opacity-70"
                              style={{
                                color: "#ef4444",
                              }}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Avatar para mensagens do operador (direita) - usando BotIcon do lucide-react */}
                {isOperator && (
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${themeSettings.glowEffects ? "chat-glow-border" : ""} order-2`}
                    style={{
                      background: themeSettings.glowEffects
                        ? "var(--chat-gradient-primary)"
                        : "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                      boxShadow: themeSettings.glowEffects ? `0 0 15px var(--chat-glow-color)` : "none",
                      border: themeSettings.glowEffects ? `1px solid var(--chat-glow-color)` : "none",
                    }}
                  >
                    <BotIcon
                      className={`h-5 w-5 text-white ${themeSettings.glowEffects ? "chat-glow-title" : ""}`}
                      style={{
                        textShadow: themeSettings.glowEffects ? "0 0 10px rgba(255, 255, 255, 0.8)" : "none",
                        filter: themeSettings.glowEffects ? "drop-shadow(0 0 8px rgba(255, 255, 255, 0.6))" : "none",
                      }}
                    />
                  </div>
                )}
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  )
}
