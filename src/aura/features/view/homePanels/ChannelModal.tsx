"use client"

import type React from "react"
import { useState } from "react"
import { X } from "lucide-react"
import { useTheme } from "./ThemeContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ChannelModalProps {
  isOpen: boolean
  onClose: () => void
}

const ChannelModal: React.FC<ChannelModalProps> = ({ isOpen, onClose }) => {
  const { theme } = useTheme()
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState("")
  const [botName, setBotName] = useState("")

  if (!isOpen) return null

  const channels = [
    {
      id: "telegram",
      name: "Telegram",
      icon: "🔵",
      color: "#0088cc",
    },
    {
      id: "messenger",
      name: "Messenger",
      icon: "🔵",
      color: "#0084ff",
    },
    {
      id: "whatsapp",
      name: "WhatsApp",
      icon: "🟢",
      color: "#25d366",
    },
  ]

  const handleChannelSelect = (channelId: string) => {
    setSelectedChannel(channelId)
  }

  const handleBack = () => {
    setSelectedChannel(null)
    setApiKey("")
    setBotName("")
  }

  const handleSave = () => {
    console.log("Salvando configurações:", {
      channel: selectedChannel,
      apiKey,
      botName,
    })
    // Aqui você implementaria a lógica de salvamento
    onClose()
    setSelectedChannel(null)
    setApiKey("")
    setBotName("")
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-2xl rounded-xl shadow-2xl transition-all duration-300 transform scale-100 opacity-100"
          style={{
            background: theme === "dark" ? "#0a0a0a" : "#ffffff",
            border: theme === "dark" ? "1px solid #2a2a2a" : "1px solid #e2e8f0",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {!selectedChannel ? (
            // Tela de seleção de canais
            <div className="p-8 text-center">
              <h2 className={`text-2xl font-bold mb-2 glow-title ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                Conectar Novos Canais
              </h2>
              <p className={`text-sm mb-8 fade-text ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                Clique no ícone para configurar.
              </p>

              <div className="flex justify-center space-x-6 mb-12">
                {channels.map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => handleChannelSelect(channel.id)}
                    className="w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all duration-300 hover:scale-110 panel-glow"
                    style={{
                      backgroundColor: channel.color,
                      boxShadow: `0 0 20px ${channel.color}40`,
                    }}
                  >
                    {channel.icon}
                  </button>
                ))}
              </div>

              <div className="flex justify-start">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className={`${
                    theme === "dark"
                      ? "border-gray-600 text-gray-300 hover:bg-gray-800"
                      : "border-gray-300 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Voltar
                </Button>
              </div>
            </div>
          ) : (
            // Tela de configuração do canal selecionado
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                    style={{
                      backgroundColor: channels.find((c) => c.id === selectedChannel)?.color,
                    }}
                  >
                    {channels.find((c) => c.id === selectedChannel)?.icon}
                  </div>
                  <h2 className={`text-xl font-bold glow-title ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    Integre-se com o {channels.find((c) => c.id === selectedChannel)?.name}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 ${
                    theme === "dark"
                      ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                      : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {selectedChannel === "telegram" && (
                <div className="space-y-6">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 fade-text ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      API Key <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="sua-api-key-aqui"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className={`panel-glow ${
                        theme === "dark"
                          ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                      }`}
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 fade-text ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Bot Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="@seu_bot"
                      value={botName}
                      onChange={(e) => setBotName(e.target.value)}
                      className={`panel-glow ${
                        theme === "dark"
                          ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                      }`}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-8">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className={`${
                    theme === "dark"
                      ? "border-gray-600 text-gray-300 hover:bg-gray-800"
                      : "border-gray-300 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!apiKey || !botName}
                  className={`panel-glow ${
                    apiKey && botName
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-gray-400 text-gray-200 cursor-not-allowed"
                  }`}
                >
                  Salvar Conta
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default ChannelModal
