"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useChat } from "ai/react"
import { Button } from "@/components/ui/button"
import { SendIcon, XIcon, MinimizeIcon, MaximizeIcon, BotIcon } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { useTheme } from "next-themes"

export default function AuraChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { theme } = useTheme()

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: "/api/chat",
    initialMessages: [
      {
        id: "welcome-message",
        role: "assistant",
        content: "Olá, sou AURA. Como posso ajudá-lo com a implementação de agentes de IA para sua empresa?",
      },
    ],
  })

  // Scroll ao final dos mensagens quando se añade uno nuevo
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Enfocar el input cuando se abre el chat
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen, isMinimized])

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement

    // Don't drag if clicking on buttons (except the drag handle areas)
    if (target.closest("button") && !target.closest(".drag-handle")) {
      return
    }

    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return

    const newX = e.clientX - dragStart.x
    const newY = e.clientY - dragStart.y

    // Constrain to viewport
    const maxX = isOpen ? window.innerWidth - 384 : window.innerWidth - 56 // 384px chat width, 56px icon width
    const maxY = isOpen ? window.innerHeight - 500 : window.innerHeight - 56 // 500px chat height, 56px icon height

    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY)),
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      document.body.style.userSelect = "none" // Prevent text selection while dragging
    } else {
      document.body.style.userSelect = ""
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      document.body.style.userSelect = ""
    }
  }, [isDragging, dragStart, isOpen])

  const toggleChat = () => {
    if (isMinimized) {
      setIsMinimized(false)
    } else {
      setIsOpen(!isOpen)
    }
  }

  const minimizeChat = () => {
    setIsMinimized(true)
  }

  const maximizeChat = () => {
    setIsMinimized(false)
  }

  const closeChat = () => {
    setIsOpen(false)
    setIsMinimized(false)
  }

  const chatStyle = {
    left: `${24 + position.x}px`,
    bottom: `${24 + position.y}px`,
    cursor: isDragging ? "grabbing" : "grab",
  }

  return (
    <>
      {/* Botão para abrir o chat - draggable when not open */}
      {!isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="fixed z-50 drag-handle"
          style={chatStyle}
          onMouseDown={handleMouseDown}
        >
          <Button
            onClick={toggleChat}
            className="rounded-full w-14 h-14 bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 shadow-lg shadow-black/50 flex items-center justify-center transition-all duration-300 hover:scale-105"
          >
            <BotIcon className="h-6 w-6 text-gray-200" />
          </Button>
        </motion.div>
      )}

      {/* Ventana de chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, height: "auto" }}
            animate={{
              opacity: 1,
              y: 0,
              height: isMinimized ? "60px" : "500px",
            }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed w-full max-w-sm bg-gray-900 rounded-xl shadow-2xl overflow-hidden z-50 border border-gray-800"
            style={chatStyle}
            onMouseDown={handleMouseDown}
          >
            {/* Header del chat */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-3 flex items-center justify-between border-b border-gray-800 drag-handle">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8 bg-gray-700">
                  <div className="flex items-center justify-center h-full w-full">
                    <BotIcon className="h-5 w-5 text-gray-200" />
                  </div>
                </Avatar>
                <div>
                  <h3 className="text-sm font-medium text-gray-200">AURA</h3>
                  <p className="text-xs text-gray-400">Assistente de IA</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {isMinimized ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={maximizeChat}
                    className="h-7 w-7 text-muted-foreground hover:text-card-foreground"
                  >
                    <MaximizeIcon className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={minimizeChat}
                    className="h-7 w-7 text-muted-foreground hover:text-card-foreground"
                  >
                    <MinimizeIcon className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeChat}
                  className="h-7 w-7 text-muted-foreground hover:text-card-foreground"
                >
                  <XIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Contenido del chat (solo visible si no está minimizado) */}
            {!isMinimized && (
              <>
                {/* Mensajes */}
                <div className="p-4 h-[360px] overflow-y-auto bg-gray-950">
                  {error && (
                    <div className="p-3 mb-4 bg-destructive/20 border border-destructive/30 rounded-lg">
                      <p className="text-sm text-destructive-foreground">
                        Erro ao conectar com AURA. Por favor, tente novamente mais tarde.
                      </p>
                    </div>
                  )}

                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`mb-4 ${message.role === "user" ? "flex justify-end" : "flex justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-card-foreground border border-border/30"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex justify-start mb-4">
                      <div className="max-w-[80%] p-3 rounded-lg bg-muted text-card-foreground border border-border/30">
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse"></div>
                          <div
                            className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                          <div
                            className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse"
                            style={{ animationDelay: "0.4s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input para enviar mensagens */}
                <form onSubmit={handleSubmit} className="p-3 border-t border-gray-800 bg-gray-900">
                  <div className="flex items-center space-x-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={handleInputChange}
                      placeholder="Digite sua mensagem..."
                      className="flex-1 bg-gray-800 border border-gray-700 rounded-full px-4 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-600"
                    />
                    <Button
                      type="submit"
                      disabled={isLoading || !input.trim()}
                      className="rounded-full w-10 h-10 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 flex items-center justify-center"
                    >
                      <SendIcon className="h-4 w-4 text-primary-foreground" />
                    </Button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botão "Fale com AURA" */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-6 flex justify-center"
      >
        <Button
          onClick={toggleChat}
          variant="outline"
          className="text-lg px-6 py-2 border-2 border-border bg-card/80 backdrop-blur-lg text-card-foreground hover:bg-card hover:text-foreground rounded-xl flex items-center space-x-2 transition-all duration-300 hover:scale-105"
        >
          <BotIcon className="h-5 w-5" />
          <span>Fale com AURA</span>
        </Button>
      </motion.div>
    </>
  )
}
