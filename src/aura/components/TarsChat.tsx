"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Bot, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useTheme } from "next-themes"

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
}

export default function TarsChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [currentNodeId, setCurrentNodeId] = useState<string>("start")
  const [scrollY, setScrollY] = useState(0)
  const [savedFlow, setSavedFlow] = useState<any>(null)
  const [waitingForUserInput, setWaitingForUserInput] = useState(false)
  const [currentOptions, setCurrentOptions] = useState<any[]>([])
  const [currentOptionsMessage, setCurrentOptionsMessage] = useState("")
  const { theme } = useTheme()

  // Chaves persistentes para localStorage
  const WORKFLOW_KEY = "aura_workflow_persistent"
  const EXECUTED_KEY = "aura_workflow_executed_persistent"

  // Detectar scroll para acompanhar a página
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Carregar fluxo do localStorage
  const loadWorkflow = () => {
    try {
      const savedWorkflow = localStorage.getItem(WORKFLOW_KEY)
      const isExecuted = localStorage.getItem(EXECUTED_KEY) === "true"

      if (!savedWorkflow || !isExecuted) {
        return null
      }

      return JSON.parse(savedWorkflow)
    } catch {
      return null
    }
  }

  // Carregar fluxo quando abrir o chat
  useEffect(() => {
    if (isOpen) {
      const workflow = loadWorkflow()
      setSavedFlow(workflow)

      if (workflow) {
        // Limpar mensagens anteriores
        setMessages([])
        setCurrentNodeId("start-node")
        setWaitingForUserInput(false)
      }
    }
  }, [isOpen])

  // Listener para mudanças no localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      if (isOpen) {
        const workflow = loadWorkflow()
        setSavedFlow(workflow)
      }
    }

    window.addEventListener("storage", handleStorageChange)
    const interval = setInterval(handleStorageChange, 2000)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      clearInterval(interval)
    }
  }, [isOpen])

  const findNextNode = (currentNodeId: string, optionIndex?: number) => {
    if (!savedFlow) return null

    const edges = savedFlow.edges
    let targetEdge

    if (optionIndex !== undefined) {
      // Para nós de opções, encontrar a edge específica baseada no índice
      const nodeEdges = edges.filter((edge: any) => edge.source === currentNodeId)
      targetEdge = nodeEdges[optionIndex]
    } else {
      // Para outros nós, encontrar a primeira edge
      targetEdge = edges.find((edge: any) => edge.source === currentNodeId)
    }

    if (targetEdge) {
      return savedFlow.nodes.find((node: any) => node.id === targetEdge.target)
    }

    return null
  }

  const processNode = (node: any) => {
    setCurrentNodeId(node.id)

    if (node.type === "sendMessage") {
      const message = node.data.message || "Mensagem não configurada"
      addBotMessage(message)

      // Continuar automaticamente para o próximo nó após 1 segundo
      setTimeout(() => {
        const nextNode = findNextNode(node.id)
        if (nextNode) {
          processNode(nextNode)
        } else {
          setWaitingForUserInput(false)
          setCurrentNodeId(null)
        }
      }, 1000)
    } else if (node.type === "options") {
      const message = node.data.message || "Escolha uma opção:"
      const options = node.data.options || []

      // Salvar opções atuais para repetir se necessário
      setCurrentOptions(options)
      setCurrentOptionsMessage(message)

      let optionsText = message + "\n\n"
      options.forEach((option: any, index: number) => {
        optionsText += `${index + 1}. ${option.text}\n`
      })

      addBotMessage(optionsText)

      // Aguardar input do usuário
      setWaitingForUserInput(true)
    } else if (node.type === "finalizar") {
      const message = node.data.message || "Conversa finalizada. Obrigado!"
      addBotMessage(message)
      setCurrentNodeId(null)
      setWaitingForUserInput(false)
    }
  }

  const startFlow = () => {
    if (!savedFlow) return

    // Encontrar o nó START
    const startNode = savedFlow.nodes.find((node: any) => node.id === "start-node")
    if (startNode) {
      // Encontrar o primeiro nó conectado ao START
      const firstNode = findNextNode("start-node")
      if (firstNode) {
        processNode(firstNode)
      }
    }
  }

  const repeatOptions = () => {
    if (currentOptions.length > 0) {
      let optionsText = currentOptionsMessage + "\n\n"
      currentOptions.forEach((option: any, index: number) => {
        optionsText += `${index + 1}. ${option.text}\n`
      })

      addBotMessage("Não consegui identificar essa opção. Por favor, tente novamente.\n\n" + optionsText)
    }
  }

  const addBotMessage = (text: string) => {
    const botMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: "bot",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, botMessage])
  }

  // Inicializar conversa quando abrir
  useEffect(() => {
    if (isOpen && messages.length === 0 && savedFlow) {
      setTimeout(() => {
        startFlow()
      }, 500)
    } else if (isOpen && !savedFlow) {
      addBotMessage("Nenhum fluxo foi configurado. Por favor, acesse o painel administrativo para criar um fluxo.")
    }
  }, [isOpen, savedFlow])

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    // Adicionar mensagem do usuário
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      sender: "user",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])

    const userInput = inputValue.trim()
    setInputValue("")

    // Se não há fluxo executado, não processar
    if (!savedFlow) {
      return
    }

    // Se é a primeira mensagem e não há nó atual, iniciar o fluxo
    if (!currentNodeId && !waitingForUserInput) {
      setTimeout(() => {
        startFlow()
      }, 500)
      return
    }

    // Se estamos aguardando input do usuário (nó de opções)
    if (waitingForUserInput && currentNodeId) {
      const currentNode = savedFlow.nodes.find((node: any) => node.id === currentNodeId)

      if (currentNode && currentNode.type === "options") {
        const options = currentNode.data.options || []
        const optionIndex = Number.parseInt(userInput) - 1

        if (optionIndex >= 0 && optionIndex < options.length) {
          // Opção válida - continuar para o próximo nó
          setWaitingForUserInput(false)
          setTimeout(() => {
            const nextNode = findNextNode(currentNodeId, optionIndex)
            if (nextNode) {
              processNode(nextNode)
            } else {
              setCurrentNodeId(null)
            }
          }, 500)
        } else {
          // Opção inválida - repetir as opções
          setTimeout(() => {
            repeatOptions()
          }, 500)
        }
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage()
    }
  }

  const iconPosition = {
    position: "fixed" as const,
    right: "24px",
    bottom: "24px",
    zIndex: 9999,
  }

  const chatPosition = {
    position: "fixed" as const,
    right: "24px",
    bottom: "100px",
    zIndex: 9999,
  }

  return (
      <>
        {!isOpen && (
            <div style={iconPosition} className="transition-all duration-300 ease-out">
              <button onClick={() => setIsOpen(true)} className="relative group">
                {/* Pontos decorativos */}
                <div className="absolute -inset-8 pointer-events-none">
                  <div className="absolute top-2 left-2 w-1 h-1 bg-purple-400 rounded-full animate-pulse opacity-60"></div>
                  <div
                      className="absolute top-6 right-3 w-1 h-1 bg-purple-300 rounded-full animate-pulse opacity-40"
                      style={{ animationDelay: "0.5s" }}
                  ></div>
                  <div
                      className="absolute bottom-3 left-4 w-1 h-1 bg-purple-500 rounded-full animate-pulse opacity-50"
                      style={{ animationDelay: "1s" }}
                  ></div>
                  <div
                      className="absolute bottom-1 right-1 w-1 h-1 bg-purple-400 rounded-full animate-pulse opacity-30"
                      style={{ animationDelay: "1.5s" }}
                  ></div>
                </div>

                <div
                    className={`relative w-20 h-20 rounded-2xl border-2 shadow-2xl group-hover:scale-110 transition-all duration-300 ${
                        theme === "dark"
                            ? "bg-gradient-to-br from-black to-gray-900 border-purple-500/50"
                            : "bg-gradient-to-br from-gray-900 to-black border-purple-400/50"
                    }`}
                >
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-purple-400/20 rounded-2xl blur-xl animate-pulse"></div>
                  <div className="absolute inset-0 bg-purple-400/10 rounded-2xl blur-2xl"></div>

                  {/* Bot icon */}
                  <div className="relative w-full h-full flex items-center justify-center">
                    <Bot className="w-10 h-10 text-purple-400 drop-shadow-lg" />
                  </div>
                </div>
              </button>
            </div>
        )}

        {/* Chat expandido - SEMPRE ACIMA DE TUDO */}
        {isOpen && (
            <div
                style={chatPosition}
                className={`w-80 h-96 rounded-lg shadow-2xl border flex flex-col transition-all duration-300 ${
                    theme === "dark" ? "bg-black border-gray-800" : "bg-white border-gray-200"
                }`}
            >
              {/* Header */}
              <div
                  className={`flex items-center justify-between p-4 border-b ${
                      theme === "dark" ? "border-gray-800" : "border-gray-200"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-purple-500 text-white">
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <span className={`font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>AURA</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="h-8 w-8 p-0">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                          className={`max-w-xs px-3 py-2 rounded-lg whitespace-pre-line ${
                              message.sender === "user"
                                  ? "bg-purple-500 text-white"
                                  : theme === "dark"
                                      ? "bg-gray-800 text-white"
                                      : "bg-gray-100 text-gray-900"
                          }`}
                      >
                        {message.text}
                      </div>
                    </div>
                ))}
              </div>

              {/* Input */}
              <div className={`p-4 border-t ${theme === "dark" ? "border-gray-800" : "border-gray-200"}`}>
                <div className="flex gap-2">
                  <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Digite sua mensagem..."
                      className="flex-1"
                  />
                  <Button onClick={handleSendMessage} size="sm" className="bg-purple-500 hover:bg-purple-600">
                    Enviar
                  </Button>
                </div>
              </div>
            </div>
        )}
      </>
  )
}
