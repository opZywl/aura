"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { ThemeProvider, useTheme } from "./homePanels/ThemeContext"
import { AuthProvider } from "../../contexts/AuthContext"
import ColorPanel from "./homePanels/ColorPanel"
import SearchPanel from "./homePanels/SearchPanel"
import ChannelModal from "./homePanels/ChannelModal"
import WorkflowBuilder from "./flow/workflow-builder"
import { useRouter } from "next/navigation"
import {
    FiArrowLeft,
    FiSearch,
    FiSave,
    FiPlayCircle,
    FiDownload,
    FiSun,
    FiZoomIn,
    FiZoomOut,
    FiMaximize,
    FiRefreshCw,
    FiMapPin,
    FiLayers,
    FiSidebar,
    FiX,
    FiMinimize2,
    FiMaximize2,
    FiSend,
    FiCheckCircle,
    FiXCircle,
    FiImage, // Added for new header
    FiDroplet, // Added for new header
} from "react-icons/fi"
import { BotIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Avatar } from "@/components/ui/avatar"
import { motion, AnimatePresence } from "framer-motion"

// Componente da barra lateral elegante para o flow
const FlowElegantSidebar = ({ currentGradient, theme }: { currentGradient: any; theme: string }) => {
    return (
        <div className="fixed left-0 top-0 h-full z-50 flex items-center pointer-events-none">
            <div
                className="h-[80%] w-[3px] rounded-full relative overflow-hidden panel-glow"
                style={{
                    background: `linear-gradient(to bottom, ${currentGradient.glow}, transparent, ${currentGradient.glow})`,
                }}
            >
                {/* Pontos decorativos */}
                <div
                    className="absolute top-[20%] left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full panel-glow"
                    style={{
                        background: theme === "dark" ? currentGradient.glow : "#374151",
                        boxShadow: theme === "dark" ? `0 0 8px ${currentGradient.glow}` : "0 0 4px rgba(0,0,0,0.3)",
                    }}
                />
                <div
                    className="absolute top-[50%] left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full panel-glow"
                    style={{
                        background: theme === "dark" ? currentGradient.glow : "#374151",
                        boxShadow: theme === "dark" ? `0 0 8px ${currentGradient.glow}` : "0 0 4px rgba(0,0,0,0.3)",
                    }}
                />
                <div
                    className="absolute top-[80%] left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full panel-glow"
                    style={{
                        background: theme === "dark" ? currentGradient.glow : "#374151",
                        boxShadow: theme === "dark" ? `0 0 8px ${currentGradient.glow}` : "0 0 4px rgba(0,0,0,0.3)",
                    }}
                />

                {/* Efeito de brilho */}
                <div
                    className="absolute top-0 left-0 w-full h-full"
                    style={{
                        background:
                            theme === "dark"
                                ? `linear-gradient(to bottom, ${currentGradient.primary}, transparent, ${currentGradient.secondary})`
                                : `linear-gradient(to bottom, #6B7280, transparent, #6B7280)`,
                        opacity: theme === "dark" ? 0.2 : 0.1,
                    }}
                />
            </div>
        </div>
    )
}

// Componente do Indicador de Status com status de execução
const FlowStatusIndicator = ({ startPosition, mousePosition, componentCount, theme }: any) => {
    const isDark = theme === "dark"
    const [isExecuted, setIsExecuted] = useState(false)

    useEffect(() => {
        const executedFlow = localStorage.getItem("executedFlow")
        setIsExecuted(executedFlow === "true")
    }, [])

    // Escutar mudanças no localStorage
    useEffect(() => {
        const handleStorageChange = () => {
            const executedFlow = localStorage.getItem("executedFlow")
            setIsExecuted(executedFlow === "true")
        }

        window.addEventListener("storage", handleStorageChange)
        // Também escutar mudanças internas
        const interval = setInterval(handleStorageChange, 1000)

        return () => {
            window.removeEventListener("storage", handleStorageChange)
            clearInterval(interval)
        }
    }, [])

    return (
        <div
            className={`flex items-center gap-4 px-3 py-1.5 rounded-lg border text-xs transition-all duration-200 ${
                isDark
                    ? "bg-black hover:bg-gray-900 border border-gray-800 hover:border-gray-700 text-white"
                    : "bg-gray-50 hover:bg-white border border-gray-200 hover:border-gray-300 text-gray-900"
            }`}
            style={{
                boxShadow: isDark
                    ? "0 0 0 1px rgba(255, 255, 255, 0.1), 0 0 10px rgba(255, 255, 255, 0.1)"
                    : "0 0 0 1px rgba(0, 0, 0, 0.05), 0 0 8px rgba(0, 0, 0, 0.05)",
                filter: isDark ? "drop-shadow(0 0 5px rgba(255, 255, 255, 0.1))" : "drop-shadow(0 0 3px rgba(0, 0, 0, 0.1))",
            }}
        >
            {/* Status de Execução */}
            <div className="flex items-center gap-1">
                {isExecuted ? (
                    <FiCheckCircle
                        className="h-3 w-3 text-green-500"
                        style={{
                            filter: isDark
                                ? "drop-shadow(0 0 4px rgba(34, 197, 94, 0.5))"
                                : "drop-shadow(0 0 2px rgba(34, 197, 94, 0.3))",
                        }}
                    />
                ) : (
                    <FiXCircle
                        className="h-3 w-3 text-red-500"
                        style={{
                            filter: isDark
                                ? "drop-shadow(0 0 4px rgba(239, 68, 68, 0.5))"
                                : "drop-shadow(0 0 2px rgba(239, 68, 68, 0.3))",
                        }}
                    />
                )}
                <span
                    className={`font-semibold ${
                        isDark
                            ? "text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.3)]"
                            : "text-gray-900 drop-shadow-[0_0_2px_rgba(0,0,0,0.2)]"
                    }`}
                >
          {isExecuted ? "EXECUTADO" : "NÃO EXECUTADO"}
        </span>
            </div>

            {/* Separador */}
            <div className={`w-px h-4 ${isDark ? "bg-gray-700" : "bg-gray-300"}`} />

            {/* Posição do INÍCIO */}
            <div className="flex items-center gap-1">
                <FiMapPin
                    className="h-3 w-3 text-blue-500"
                    style={{
                        filter: isDark
                            ? "drop-shadow(0 0 4px rgba(59, 130, 246, 0.5))"
                            : "drop-shadow(0 0 2px rgba(59, 130, 246, 0.3))",
                    }}
                />
                <span
                    className={`font-mono ${
                        isDark
                            ? "text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.3)]"
                            : "text-gray-900 drop-shadow-[0_0_2px_rgba(0,0,0,0.2)]"
                    }`}
                >
          INÍCIO: ({Math.round(startPosition.x)}, {Math.round(startPosition.y)})
        </span>
            </div>

            {/* Separador */}
            <div className={`w-px h-4 ${isDark ? "bg-gray-700" : "bg-gray-300"}`} />

            {/* Posição do Mouse */}
            <div className="flex items-center gap-1">
                <span className="text-purple-500">Cursor</span>
                <span className={`font-mono ${isDark ? "text-white" : "text-gray-900"}`}>
          Mouse: ({Math.round(mousePosition.x)}, {Math.round(mousePosition.y)})
        </span>
            </div>

            {/* Separador */}
            <div className={`w-px h-4 ${isDark ? "bg-gray-700" : "bg-gray-300"}`} />

            {/* Contador de Componentes */}
            <div className="flex items-center gap-1">
                <FiLayers className="h-3 w-3 text-orange-500" />
                <span className={isDark ? "text-white" : "text-gray-900"}>
          <span className="font-semibold">{componentCount}</span> componentes
        </span>
            </div>
        </div>
    )
}

// Componente do Bot Aura usando o mesmo layout do TarsChat
const AuraFlowBot = ({
                         isOpen,
                         onClose,
                     }: {
    isOpen: boolean
    onClose: () => void
}) => {
    const [messages, setMessages] = useState<Array<{ id: string; role: "user" | "assistant"; content: string }>>([])
    const [input, setInput] = useState("")
    const [currentNodeId, setCurrentNodeId] = useState<string | null>(null)
    const [isMinimized, setIsMinimized] = useState(false)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
    const [savedFlow, setSavedFlow] = useState<{ nodes: any[]; edges: any[] } | null>(null)
    const [isFlowExecuted, setIsFlowExecuted] = useState(false)
    const [waitingForUserInput, setWaitingForUserInput] = useState(false)
    const [currentOptions, setCurrentOptions] = useState<any[]>([])
    const [currentOptionsMessage, setCurrentOptionsMessage] = useState("")

    // Carregar fluxo salvo quando o bot abrir
    useEffect(() => {
        if (isOpen) {
            const savedWorkflow = localStorage.getItem("workflow")
            const executedFlow = localStorage.getItem("executedFlow")

            if (savedWorkflow && executedFlow === "true") {
                try {
                    const workflow = JSON.parse(savedWorkflow)
                    setSavedFlow(workflow)
                    setIsFlowExecuted(true)

                    // Limpar mensagens anteriores e mostrar mensagem de boas-vindas
                    setMessages([
                        {
                            id: "welcome",
                            role: "assistant",
                            content: "Olá! Fluxo carregado e pronto para uso. Digite qualquer coisa para começar!",
                        },
                    ])
                } catch (error) {
                    console.error("Erro ao carregar fluxo:", error)
                    setMessages([
                        {
                            id: "error",
                            role: "assistant",
                            content: "Erro ao carregar o fluxo. Por favor, execute o fluxo novamente.",
                        },
                    ])
                }
            } else {
                // Se não há fluxo executado, mostrar mensagem
                setMessages([
                    {
                        id: "no-flow",
                        role: "assistant",
                        content:
                            "Nenhum fluxo foi executado ainda. Por favor, crie um fluxo, salve e execute para que eu possa funcionar.",
                    },
                ])
            }
        }
    }, [isOpen])

    // Adicionar listener para mudanças no localStorage
    useEffect(() => {
        const handleStorageChange = () => {
            if (isOpen) {
                const savedWorkflow = localStorage.getItem("workflow")
                const executedFlow = localStorage.getItem("executedFlow")

                if (savedWorkflow && executedFlow === "true") {
                    try {
                        const workflow = JSON.parse(savedWorkflow)
                        setSavedFlow(workflow)
                        setIsFlowExecuted(true)
                    } catch (error) {
                        console.error("Erro ao recarregar fluxo:", error)
                    }
                } else {
                    setSavedFlow(null)
                    setIsFlowExecuted(false)
                }
            }
        }

        window.addEventListener("storage", handleStorageChange)
        return () => window.removeEventListener("storage", handleStorageChange)
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
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now().toString(),
                    role: "assistant",
                    content: message,
                },
            ])

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

            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now().toString(),
                    role: "assistant",
                    content: optionsText,
                },
            ])

            // Aguardar input do usuário
            setWaitingForUserInput(true)
        } else if (node.type === "finalizar") {
            const message = node.data.message || "Conversa finalizada. Obrigado!"
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now().toString(),
                    role: "assistant",
                    content: message,
                },
            ])
            setTimeout(() => {
                setCurrentNodeId(null)
                setWaitingForUserInput(false)
            }, 2000)
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

            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now().toString(),
                    role: "assistant",
                    content: "Não consegui identificar essa opção. Por favor, tente novamente.\n\n" + optionsText,
                },
            ])
        }
    }

    const handleSendMessage = () => {
        if (!input.trim()) return

        // Adicionar mensagem do usuário
        setMessages((prev) => [
            ...prev,
            {
                id: Date.now().toString(),
                role: "user",
                content: input,
            },
        ])

        const userInput = input.trim()
        setInput("")

        // Se não há fluxo executado, não processar
        if (!isFlowExecuted || !savedFlow) {
            setTimeout(() => {
                setMessages((prev) => [
                    ...prev,
                    {
                        id: Date.now().toString(),
                        role: "assistant",
                        content: "Por favor, execute um fluxo primeiro para que eu possa funcionar.",
                    },
                ])
            }, 500)
            return
        }

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

    // Resto do código do componente permanece igual (drag, mouse events, etc.)
    const handleMouseDown = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement
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

        const maxX = window.innerWidth - 384
        const maxY = window.innerHeight - 500

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
            document.body.style.userSelect = "none"
        } else {
            document.body.style.userSelect = ""
        }

        return () => {
            document.removeEventListener("mousemove", handleMouseMove)
            document.removeEventListener("mouseup", handleMouseUp)
            document.body.style.userSelect = ""
        }
    }, [isDragging, dragStart])

    if (!isOpen) return null

    const chatStyle = {
        right: `${24 + position.x}px`,
        bottom: `${24 + position.y}px`,
        cursor: isDragging ? "grabbing" : "grab",
    }

    return (
        <AnimatePresence>
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
                {/* Header do chat - igual ao TarsChat */}
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
                                onClick={() => setIsMinimized(false)}
                                className="h-7 w-7 text-gray-400 hover:text-gray-200"
                            >
                                <FiMaximize2 className="h-4 w-4" />
                            </Button>
                        ) : (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsMinimized(true)}
                                className="h-7 w-7 text-gray-400 hover:text-gray-200"
                            >
                                <FiMinimize2 className="h-4 w-4" />
                            </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7 text-gray-400 hover:text-gray-200">
                            <FiX className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Conteúdo do chat */}
                {!isMinimized && (
                    <>
                        {/* Mensagens */}
                        <div className="p-4 h-[360px] overflow-y-auto bg-gray-950">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`mb-4 ${message.role === "user" ? "flex justify-end" : "flex justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[80%] p-3 rounded-lg whitespace-pre-line ${
                                            message.role === "user"
                                                ? "bg-blue-600 text-white"
                                                : "bg-gray-700 text-gray-100 border border-gray-600/30"
                                        }`}
                                    >
                                        <p className="text-sm">{message.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input para enviar mensagens */}
                        <form
                            onSubmit={(e) => {
                                e.preventDefault()
                                handleSendMessage()
                            }}
                            className="p-3 border-t border-gray-800 bg-gray-900"
                        >
                            <div className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Digite sua mensagem..."
                                    className="flex-1 bg-gray-800 border border-gray-700 rounded-full px-4 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-600"
                                />
                                <Button
                                    type="submit"
                                    disabled={!input.trim()}
                                    className="rounded-full w-10 h-10 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 flex items-center justify-center"
                                >
                                    <FiSend className="h-4 w-4 text-white" />
                                </Button>
                            </div>
                        </form>
                    </>
                )}
            </motion.div>
        </AnimatePresence>
    )
}

const FlowHeaderWithDialogs = ({
                                   onZoomIn,
                                   onZoomOut,
                                   onFitView,
                                   onSave,
                                   onLoad,
                                   onExecute,
                                   onSearch,
                                   onReset,
                                   onDownload,
                                   onToggleSidebar,
                                   onOpenBot,
                                   onOpenColorPanel,
                                   onOpenAIDialog, // This prop is not used in the provided code, but kept for potential future use
                                   startPosition,
                                   mousePosition,
                                   componentCount,
                                   workflowContainerRef, // This prop is not used in the provided code, but kept for potential future use
                               }: any) => {
    const router = useRouter()
    const { theme, toggleTheme, currentGradient, glowAnimation, glowEnabled, setShowColorPanel, showColorPanel } =
        useTheme()
    const [searchValue, setSearchValue] = useState("")
    const [showResetDialog, setShowResetDialog] = useState(false)
    const [showExecuteDialog, setShowExecuteDialog] = useState(false)
    const [showImageMenu, setShowImageMenu] = useState(false) // Not used in current implementation
    const [showIntegrationsMenu, setShowIntegrationsMenu] = useState(false) // Not used in current implementation
    const [isWorkflowSaved, setIsWorkflowSaved] = useState(false)
    const [isSearchFocused, setIsSearchFocused] = useState(false)
    const [showSearchResults, setShowSearchResults] = useState(false) // Not used in current implementation
    const [searchResults, setSearchResults] = useState<any[]>([]) // Not used in current implementation
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false) // Not used in current implementation

    useEffect(() => {
        setIsWorkflowSaved(false)
    }, [componentCount])

    const primaryColor = currentGradient?.primary || "#000000"
    const secondaryColor = currentGradient?.secondary || "#000000"
    const accentColor = currentGradient?.accent || "#000000"
    const glowColor = currentGradient?.glow || "#000000"

    const isDark = theme === "dark"

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchValue.trim() && onSearch) {
            onSearch(searchValue.trim())
        }
    }

    const handleReset = () => {
        setShowResetDialog(true)
    }

    const confirmReset = () => {
        if (onReset) {
            onReset()
        }
        setShowResetDialog(false)
    }

    const handleExecute = () => {
        if (onExecute) {
            onExecute()
            setShowExecuteDialog(true)
        }
    }

    return (
        <>
            <motion.header
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="fixed top-0 left-0 right-0 z-50 px-4 py-3"
                style={{
                    background: showColorPanel
                        ? isDark
                            ? `var(--header-bg, ${primaryColor || "#1e293b"})15`
                            : "rgba(255, 255, 255, 0.85)"
                        : isDark
                            ? `var(--header-bg, ${primaryColor || "#1e293b"})10`
                            : "rgba(255, 255, 255, 0.6)",
                    backdropFilter: "blur(20px)",
                    borderBottom: `1px solid ${isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
                    minHeight: "60px",
                    maxHeight: "60px",
                    transition: "all 0.3s ease",
                    ...(glowEnabled && {
                        boxShadow: `0 0 60px ${glowColor}60, 0 0 120px ${glowColor}30, inset 0 0 40px ${glowColor}10`,
                        borderBottom: `1px solid ${glowColor}80`,
                        background: isDark
                            ? `linear-gradient(180deg, var(--header-bg, ${primaryColor || "#1e293b"})20 0%, var(--header-bg, ${primaryColor || "#1e293b"})15 100%)`
                            : `linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(245, 245, 250, 0.9) 100%)`,
                    }),
                }}
            >
                <div className="flex items-center justify-between h-full">
                    {/* Left Section: Zoom Controls */}
                    <div className="flex items-center gap-3">
                        <div
                            className="flex items-center gap-1 px-1 py-1 rounded-full"
                            style={{
                                background: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)",
                                border: `1px solid ${isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)"}`,
                                boxShadow: glowEnabled ? `0 0 15px ${glowColor}20` : "none",
                            }}
                        >
                            {[
                                { icon: FiArrowLeft, action: () => router.push("/panel"), title: "Voltar" },
                                { icon: FiZoomOut, action: onZoomOut, title: "Zoom Out" },
                                { icon: FiZoomIn, action: onZoomIn, title: "Zoom In" },
                                { icon: FiMaximize, action: onFitView, title: "Fit View" },
                                { icon: FiSidebar, action: onToggleSidebar, title: "Toggle Sidebar" },
                            ].map(({ icon: Icon, action, title }, index) => (
                                <motion.button
                                    key={index}
                                    whileHover={{
                                        scale: 1.1,
                                        backgroundColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
                                    }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={action}
                                    className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
                                    style={{
                                        color: isDark ? "#9ca3af" : "#6b7280",
                                    }}
                                    title={title}
                                >
                                    <Icon className="w-4 h-4" />
                                </motion.button>
                            ))}
                        </div>

                        {/* Search Bar */}
                        <motion.form onSubmit={handleSearch} className="relative" animate={glowEnabled ? glowAnimation : {}}>
                            <div
                                className="relative rounded-full overflow-hidden"
                                style={{
                                    background: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)",
                                    border: `1px solid ${isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)"}`,
                                    boxShadow: glowEnabled ? `0 0 15px ${glowColor}20` : "none",
                                }}
                            >
                                <FiSearch
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
                                    style={{
                                        color: isDark ? "#9ca3af" : "#6b7280",
                                    }}
                                />
                                <input
                                    type="text"
                                    placeholder="Buscar por ID..."
                                    value={searchValue}
                                    onChange={(e) => setSearchValue(e.target.value)}
                                    onFocus={() => setIsSearchFocused(true)}
                                    onBlur={() => setIsSearchFocused(false)}
                                    className="w-48 h-9 text-sm pl-10 pr-3 bg-transparent outline-none transition-all"
                                    style={{
                                        color: isDark ? "#ffffff" : "#000000",
                                    }}
                                />
                            </div>
                        </motion.form>

                        <FlowStatusIndicator
                            startPosition={startPosition}
                            mousePosition={mousePosition}
                            componentCount={componentCount}
                            theme={theme}
                            currentGradient={currentGradient}
                        />
                    </div>

                    {/* Right Section: Utility Buttons + Save + Execute */}
                    <div className="flex items-center gap-3">
                        <motion.div
                            className="flex items-center gap-1 px-1 py-1 rounded-full"
                            style={{
                                background: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)",
                                border: `1px solid ${isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)"}`,
                                boxShadow: glowEnabled ? `0 0 15px ${glowColor}20` : "none",
                            }}
                            animate={glowEnabled ? glowAnimation : {}}
                        >
                            <motion.button
                                whileHover={{
                                    scale: 1.1,
                                    backgroundColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
                                }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setShowImageMenu(true)}
                                className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                                style={{
                                    color: isDark ? "#9ca3af" : "#6b7280",
                                }}
                                title="Background Image"
                            >
                                <FiImage className="w-4 h-4" />
                            </motion.button>

                            <motion.button
                                whileHover={{
                                    scale: 1.1,
                                    backgroundColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
                                }}
                                whileTap={{ scale: 0.9 }}
                                onClick={onOpenColorPanel}
                                className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                                style={{
                                    color: isDark ? "#9ca3af" : "#6b7280",
                                }}
                                title="Cores"
                            >
                                <FiDroplet className="w-4 h-4" />
                            </motion.button>

                            <motion.button
                                whileHover={{
                                    scale: 1.1,
                                    backgroundColor: isDark ? "rgba(34, 197, 94, 0.2)" : "rgba(34, 197, 94, 0.1)",
                                }}
                                whileTap={{ scale: 0.9 }}
                                onClick={toggleTheme}
                                className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                                style={{
                                    color: isDark ? "#9ca3af" : "#6b7280",
                                }}
                                title="Toggle Theme"
                            >
                                <FiSun className="w-4 h-4" />
                            </motion.button>

                            <motion.button
                                whileHover={{
                                    scale: 1.05,
                                    backgroundColor: isDark ? "rgba(239, 68, 68, 0.2)" : "rgba(239, 68, 68, 0.1)",
                                }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleReset}
                                className="px-3 h-9 rounded-full flex items-center gap-2 transition-all"
                                style={{
                                    color: isDark ? "#10b981" : "#059669",
                                }}
                                title="Resetar"
                            >
                                <FiRefreshCw className="w-4 h-4" />
                                <span className="text-sm font-medium">Resetar</span>
                            </motion.button>
                        </motion.div>

                        {/* Save, Load, Download Buttons */}
                        <motion.div
                            className="flex items-center gap-1 px-1 py-1 rounded-full"
                            style={{
                                background: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)",
                                border: `1px solid ${isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)"}`,
                                boxShadow: glowEnabled ? `0 0 15px ${glowColor}20` : "none",
                            }}
                        >
                            <motion.button
                                whileHover={{
                                    scale: 1.05,
                                    backgroundColor: isDark ? "rgba(34, 197, 94, 0.2)" : "rgba(34, 197, 94, 0.1)",
                                }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onSave}
                                className="px-3 h-9 rounded-full flex items-center gap-2 transition-all"
                                style={{
                                    color: isDark ? "#10b981" : "#059669",
                                }}
                                title="Salvar"
                            >
                                <FiSave className="w-4 h-4" />
                                <span className="text-sm font-medium">Salvar</span>
                            </motion.button>

                            <motion.button
                                whileHover={{
                                    scale: 1.05,
                                    backgroundColor: isDark ? "rgba(59, 130, 246, 0.2)" : "rgba(59, 130, 246, 0.1)",
                                }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onLoad}
                                className="px-3 h-9 rounded-full flex items-center gap-2 transition-all"
                                style={{
                                    color: isDark ? "#3b82f6" : "#2563eb",
                                }}
                                title="Carregar"
                            >
                                <FiDownload className="w-4 h-4" />
                                <span className="text-sm font-medium">Carregar</span>
                            </motion.button>

                            <motion.button
                                whileHover={{
                                    scale: 1.05,
                                    backgroundColor: isDark ? "rgba(168, 85, 247, 0.2)" : "rgba(168, 85, 247, 0.1)",
                                }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onDownload}
                                className="px-3 h-9 rounded-full flex items-center gap-2 transition-all"
                                style={{
                                    color: isDark ? "#a855f7" : "#9333ea",
                                }}
                                title="Download"
                            >
                                <FiDownload className="w-4 h-4" />
                                <span className="text-sm font-medium">Download</span>
                            </motion.button>
                        </motion.div>

                        {/* Execute and Bot Buttons */}
                        <motion.button
                            whileHover={{
                                scale: 1.05,
                                boxShadow: `0 0 30px ${glowColor}60`,
                            }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleExecute}
                            className="px-4 h-10 rounded-full flex items-center gap-2 transition-all font-medium"
                            style={{
                                background: isDark
                                    ? `linear-gradient(135deg, ${primaryColor}80, ${secondaryColor}80)`
                                    : `linear-gradient(135deg, ${primaryColor}40, ${secondaryColor}40)`,
                                color: isDark ? "#ffffff" : "#000000",
                                border: `1px solid ${isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)"}`,
                                boxShadow: glowEnabled ? `0 0 20px ${glowColor}40` : "none",
                            }}
                            title="Executar"
                        >
                            <FiPlayCircle className="w-4 h-4" />
                            <span className="text-sm">Executar</span>
                        </motion.button>

                        <motion.button
                            whileHover={{
                                scale: 1.05,
                                backgroundColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
                            }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onOpenBot}
                            className="px-3 h-9 rounded-full flex items-center gap-2 transition-all"
                            style={{
                                background: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)",
                                border: `1px solid ${isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)"}`,
                                color: isDark ? "#9ca3af" : "#6b7280",
                            }}
                            title="Aura Bot"
                        >
                            <BotIcon className="w-4 h-4" />
                            <span className="text-sm font-medium">Aura Bot</span>
                        </motion.button>
                    </div>
                </div>
            </motion.header>

            {/* Reset Confirmation Dialog */}
            <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Confirmar Reset</DialogTitle>
                        <DialogDescription>
                            Tem certeza de que deseja resetar o fluxo? Todas as alterações não salvas serão perdidas.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <p>Esta ação é irreversível.</p>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="secondary" onClick={() => setShowResetDialog(false)}>
                            Cancelar
                        </Button>
                        <Button type="button" variant="destructive" onClick={confirmReset}>
                            Resetar
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Execute Confirmation Dialog */}
            <Dialog open={showExecuteDialog} onOpenChange={setShowExecuteDialog}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Fluxo em Execução</DialogTitle>
                        <DialogDescription>
                            O fluxo está sendo executado. Você pode interagir com o bot para testar o fluxo.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <p>Abra o bot para interagir com o fluxo.</p>
                    </div>
                    <div className="flex justify-end">
                        <Button type="button" onClick={() => setShowExecuteDialog(false)}>
                            Fechar
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

const FlowLayout = () => {
    const {
        theme,
        showColorPanel,
        showSearch,
        currentGradient,
        showChannelModal,
        setShowChannelModal,
        setShowColorPanel,
    } = useTheme()
    const [mounted, setMounted] = useState(false)
    const [workflowActions, setWorkflowActions] = useState<any>(null)
    const [startPosition, setStartPosition] = useState({ x: 250, y: 100 })
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
    const [componentCount, setComponentCount] = useState(1)
    const [showSidebar, setShowSidebar] = useState(true)
    const [showBot, setShowBot] = useState(false)
    const [flowNodes, setFlowNodes] = useState<any[]>([])
    const [flowEdges, setFlowEdges] = useState<any[]>([])

    useEffect(() => {
        setMounted(true)
    }, [])

    const toggleSidebar = useCallback(() => {
        setShowSidebar(!showSidebar)
    }, [showSidebar])

    const openBot = useCallback(() => {
        setShowBot(true)
    }, [])

    const closeBot = useCallback(() => {
        setShowBot(false)
    }, [])

    const openColorPanel = useCallback(() => {
        setShowColorPanel(true)
    }, [setShowColorPanel])

    const handleActionsReady = useCallback((actions: any) => {
        setWorkflowActions(actions)
    }, [])

    if (!mounted) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
                <div className="text-lg">Carregando Construtor de Fluxo...</div>
            </div>
        )
    }

    return (
        <div className={`flex flex-col h-screen ${theme === "dark" ? "bg-black" : "bg-gray-50"}`}>
            <FlowElegantSidebar currentGradient={currentGradient} theme={theme} />

            <FlowHeaderWithDialogs
                onZoomIn={workflowActions?.zoomIn}
                onZoomOut={workflowActions?.zoomOut}
                onFitView={workflowActions?.fitView}
                onSave={workflowActions?.save}
                onLoad={workflowActions?.load}
                onExecute={workflowActions?.execute}
                onSearch={workflowActions?.search}
                onReset={workflowActions?.reset}
                onDownload={workflowActions?.download}
                onToggleSidebar={toggleSidebar}
                onOpenBot={openBot}
                onOpenColorPanel={openColorPanel}
                startPosition={startPosition}
                mousePosition={mousePosition}
                componentCount={componentCount}
            />

            <main className="flex-1 overflow-hidden">
                <WorkflowBuilder
                    onActionsReady={handleActionsReady}
                    onStartPositionChange={setStartPosition}
                    onMousePositionChange={setMousePosition}
                    onComponentCountChange={setComponentCount}
                    onNodesChange={setFlowNodes}
                    onEdgesChange={setFlowEdges}
                    showSidebar={showSidebar}
                    onToggleSidebar={toggleSidebar}
                    onOpenBot={openBot}
                />
            </main>

            <AuraFlowBot isOpen={showBot} onClose={closeBot} />

            {showColorPanel && <ColorPanel />}
            {showSearch && <SearchPanel />}
            {showChannelModal && <ChannelModal isOpen={showChannelModal} onClose={() => setShowChannelModal(false)} />}
        </div>
    )
}

const Flow = () => {
    return (
        <AuthProvider>
            <ThemeProvider>
                <FlowLayout />
            </ThemeProvider>
        </AuthProvider>
    )
}

export default Flow
