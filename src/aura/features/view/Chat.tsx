"use client"

import type React from "react"
import type { Conversation, AIAgent, ChatSettings } from "./chat/types"

interface ChatTemplateProps {
    conversations: Conversation[]
    currentConversation: Conversation | null
    agent: AIAgent
    settings: ChatSettings
    onConversationSelect: (conversation: Conversation) => void
    onSettingsChange: (newSettings: Partial<ChatSettings>) => void
    onToggleFullscreen: () => void
    onToggleTheme: () => void
}

export default function ChatTemplate({
                                         conversations,
                                         currentConversation,
                                         agent,
                                         settings,
                                         onConversationSelect,
                                         onSettingsChange,
                                         onToggleFullscreen,
                                         onToggleTheme,
                                     }: ChatTemplateProps) {
    return (
        <div className={`flex flex-col h-full ${settings.theme === "dark" ? "bg-black text-white" : "bg-white text-gray-900"}`}>
            {/* ✅ exemplo básico de layout */}
            <header className="p-4 border-b flex items-center justify-between">
                <h1 className="font-bold text-lg">{agent.name} Chat</h1>
                <div className="flex gap-2">
                    <button onClick={onToggleTheme}>Alternar Tema</button>
                    <button onClick={onToggleFullscreen}>
                        {settings.isFullscreen ? "Sair da Tela Cheia" : "Tela Cheia"}
                    </button>
                </div>
            </header>

            {/* Lista de conversas */}
            <aside className="border-r p-2 w-64 overflow-y-auto">
                {conversations.map((conv) => (
                    <div
                        key={conv.id}
                        onClick={() => onConversationSelect(conv)}
                        className={`p-2 cursor-pointer rounded ${conv.id === currentConversation?.id ? "bg-blue-600 text-white" : "hover:bg-gray-200"}`}
                    >
                        <div className="font-semibold">{conv.title}</div>
                        <div className="text-xs opacity-70">{conv.lastMessage}</div>
                    </div>
                ))}
            </aside>

            {/* Área principal do chat */}
            <main className="flex-1 p-4">
                {currentConversation ? (
                    currentConversation.messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`my-2 ${
                                msg.role === "user" ? "text-right" : "text-left"
                            }`}
                        >
              <span
                  className={`inline-block px-3 py-2 rounded-lg ${
                      msg.role === "user"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-300 text-black"
                  }`}
              >
                {msg.content}
              </span>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500 mt-10">Selecione uma conversa</p>
                )}
            </main>
        </div>
    )
}
