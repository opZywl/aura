"use client"

import { useState } from "react"
import ChatTemplate from "./chat/ChatTemplate"
import type { Conversation, AIAgent, ChatSettings } from "./chat/types"

export default function Chat() {
  const [settings, setSettings] = useState<ChatSettings>({
    theme: "dark",
    glowEffects: true,
    animations: true,
    sounds: false,
    notifications: true,
    isFullscreen: false,
  })

  const [conversations] = useState<Conversation[]>([
    {
      id: "1",
      title: "OP opzywl",
      lastMessage: "xxx",
      messages: [
        {
          id: "1",
          content: "X",
          role: "user",
          timestamp: new Date(),
          status: "read",
        },
        {
          id: "2",
          content: "Z",
          role: "assistant",
          timestamp: new Date(),
          status: "read",
        },
      ],
      unreadCount: 0,
      status: "Ativo",
      createdAt: new Date(Date.now() - 86400000), // 1 day ago
      updatedAt: new Date(),
      isPinned: false,
    },
  ])

  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(conversations[0])

  const agent: AIAgent = {
    id: "1",
    name: "opzywl",
    status: "online",
  }

  const handleSettingsChange = (newSettings: Partial<ChatSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }

  const handleToggleFullscreen = () => {
    setSettings((prev) => ({ ...prev, isFullscreen: !prev.isFullscreen }))
  }

  const handleToggleTheme = () => {
    setSettings((prev) => ({ ...prev, theme: prev.theme === "dark" ? "light" : "dark" }))
  }

  return (
    <ChatTemplate
      conversations={conversations}
      currentConversation={currentConversation}
      agent={agent}
      settings={settings}
      onConversationSelect={setCurrentConversation}
      onSettingsChange={handleSettingsChange}
      onToggleFullscreen={handleToggleFullscreen}
      onToggleTheme={handleToggleTheme}
    />
  )
}
