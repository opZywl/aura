"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import { ThemeProvider, useTheme } from "./homePanels/ThemeContext"
import { AuthProvider } from "../../contexts/AuthContext"
import ColorPanel from "./homePanels/ColorPanel"
import SearchPanel from "./homePanels/SearchPanel"
import ChannelModal from "./homePanels/ChannelModal"
import WorkflowBuilder from "./flow/workflow-builder"
import { useRouter } from "next/navigation"
import {
    FiArrowLeft,
    FiSave,
    FiPlay,
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
    FiImage,
    FiDroplet,
    FiUpload,
    FiFolder,
    FiTrash2,
    FiCamera,
    FiMousePointer,
    FiSearch,
} from "react-icons/fi"
import { BotIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Avatar } from "@/components/ui/avatar"
import { motion, AnimatePresence } from "framer-motion"
import html2canvas from "html2canvas"
import { toast } from "@/hooks/use-toast"

const extractHexColor = (input?: string, fallback = "#6366f1") => {
    if (!input) return fallback
    const match = input.match(/#[0-9a-fA-F]{6}/)
    return match ? match[0] : fallback
}

const hexToRgba = (hex: string, alpha = 1) => {
    const sanitized = hex.replace("#", "")
    if (sanitized.length !== 6) {
        return `rgba(99, 102, 241, ${alpha})`
    }

    const r = Number.parseInt(sanitized.slice(0, 2), 16)
    const g = Number.parseInt(sanitized.slice(2, 4), 16)
    const b = Number.parseInt(sanitized.slice(4, 6), 16)

    return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

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
const FlowStatusIndicator = ({ startPosition, mousePosition, componentCount, theme, currentGradient }: any) => {
    const isDark = theme === "dark"
    const [isExecuted, setIsExecuted] = useState(false)

    useEffect(() => {
        const executedFlow = localStorage.getItem("executedFlow")
        setIsExecuted(executedFlow === "true")
    }, [])

    useEffect(() => {
        const handleStorageChange = () => {
            const executedFlow = localStorage.getItem("executedFlow")
            setIsExecuted(executedFlow === "true")
        }

        window.addEventListener("storage", handleStorageChange)
        const interval = setInterval(handleStorageChange, 1000)

        return () => {
            window.removeEventListener("storage", handleStorageChange)
            clearInterval(interval)
        }
    }, [])

    const accentColor = extractHexColor(currentGradient?.primary, isDark ? "#6366f1" : "#4338ca")
    const secondaryAccent = extractHexColor(currentGradient?.secondary, accentColor)

    const containerStyle = {
        background: isDark
            ? "linear-gradient(140deg, rgba(13,16,24,0.9), rgba(17,23,36,0.82))"
            : "linear-gradient(140deg, rgba(255,255,255,0.96), rgba(241,245,249,0.9))",
        border: `1px solid ${hexToRgba(accentColor, isDark ? 0.4 : 0.25)}`,
        boxShadow: `0 28px 60px ${hexToRgba(accentColor, 0.18)}`,
        backdropFilter: "blur(18px)",
        borderRadius: "24px",
        padding: "18px 20px",
    }

    const statusCards = [
        {
            key: "status",
            label: "Status do fluxo",
            value: isExecuted ? "Executado" : "Não executado",
            helper: isExecuted ? "Última execução sincronizada" : "Execute para habilitar o bot",
            icon: isExecuted ? FiCheckCircle : FiXCircle,
            iconColor: isExecuted ? "#22c55e" : "#f97316",
            badge: isExecuted ? { text: "Pronto", color: "#22c55e" } : { text: "Pendente", color: "#f97316" },
        },
        {
            key: "start",
            label: "Início do fluxo",
            value: `(${Math.round(startPosition.x)}, ${Math.round(startPosition.y)})`,
            helper: "Coordenadas do nó INÍCIO",
            icon: FiMapPin,
            iconColor: secondaryAccent,
        },
        {
            key: "cursor",
            label: "Cursor em tempo real",
            value: `(${Math.round(mousePosition.x)}, ${Math.round(mousePosition.y)})`,
            helper: "Posição do mouse no canvas",
            icon: FiMousePointer,
            iconColor: "#a855f7",
        },
        {
            key: "components",
            label: "Componentes ativos",
            value: componentCount.toString(),
            helper: "Elementos configurados",
            icon: FiLayers,
            iconColor: "#f59e0b",
            suffix: "itens",
        },
    ]

    return (
        <div className="w-full max-w-2xl">
            <div className="relative overflow-hidden" style={containerStyle}>
                <div
                    className="pointer-events-none absolute inset-0 opacity-25"
                    style={{
                        background: `radial-gradient(circle at 0% 0%, ${hexToRgba(accentColor, 0.35)} 0%, transparent 55%), radial-gradient(circle at 100% 100%, ${hexToRgba(secondaryAccent, 0.3)} 0%, transparent 60%)`,
                    }}
                />
                <div className="relative grid gap-3 sm:grid-cols-2">
                    {statusCards.map((card) => {
                        const Icon = card.icon
                        const iconColor = card.iconColor
                        const baseTextColor = isDark ? "#f8fafc" : "#0f172a"

                        return (
                            <div
                                key={card.key}
                                className="group relative overflow-hidden rounded-2xl border p-4 transition-transform duration-300 hover:-translate-y-0.5"
                                style={{
                                    background: isDark
                                        ? "linear-gradient(150deg, rgba(17,24,39,0.72), rgba(15,23,42,0.58))"
                                        : "linear-gradient(150deg, rgba(255,255,255,0.95), rgba(248,250,252,0.9))",
                                    borderColor: hexToRgba(iconColor, isDark ? 0.32 : 0.22),
                                    boxShadow: `0 18px 36px ${hexToRgba(iconColor, isDark ? 0.22 : 0.18)}`,
                                }}
                            >
                                <div
                                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                                    style={{ background: hexToRgba(iconColor, isDark ? 0.12 : 0.08) }}
                                />
                                <div className="relative flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="flex h-10 w-10 items-center justify-center rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-105"
                                            style={{
                                                background: hexToRgba(iconColor, isDark ? 0.2 : 0.14),
                                                boxShadow: `0 12px 28px ${hexToRgba(iconColor, isDark ? 0.35 : 0.2)}`,
                                            }}
                                        >
                                            <Icon className="h-5 w-5" style={{ color: iconColor }} />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span
                                                className="text-[11px] font-semibold uppercase tracking-[0.22em]"
                                                style={{ color: hexToRgba(iconColor, isDark ? 0.7 : 0.55) }}
                                            >
                                                {card.label}
                                            </span>
                                            <span className="text-lg font-semibold" style={{ color: baseTextColor }}>
                                                {card.value}
                                                {card.suffix && (
                                                    <span
                                                        className="ml-1 text-sm font-medium"
                                                        style={{ color: hexToRgba(iconColor, isDark ? 0.7 : 0.6) }}
                                                    >
                                                        {card.suffix}
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                    {card.badge && (
                                        <span
                                            className="rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]"
                                            style={{
                                                background: hexToRgba(card.badge.color, isDark ? 0.22 : 0.14),
                                                color: card.badge.color,
                                            }}
                                        >
                                            {card.badge.text}
                                        </span>
                                    )}
                                </div>
                                {card.helper && (
                                    <p
                                        className="relative mt-3 text-xs leading-relaxed"
                                        style={{ color: isDark ? "rgba(226,232,240,0.72)" : "rgba(30,41,59,0.65)" }}
                                    >
                                        {card.helper}
                                    </p>
                                )}
                            </div>
                        )
                    })}
                </div>
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

const ImageMenu = ({ isOpen, onClose, onChangeBackground, onSaveImage, onResetBackground, theme }: any) => {
    const { currentGradient } = useTheme()
    const isDark = theme === "dark"
    const primaryColor = currentGradient?.primary || "#000000"
    const secondaryColor = currentGradient?.secondary || "#000000"
    const accentColor = currentGradient?.accent || "#000000"
    const glowColor = currentGradient?.glow || "#000000"
    const accentHex = extractHexColor(currentGradient?.primary, isDark ? "#6366f1" : "#4338ca")

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className="sm:max-w-[420px] p-0 bg-transparent border-0"
                style={{
                    background: "transparent",
                    border: "none",
                    boxShadow: "none",
                }}
            >
                <div
                    className="relative rounded-2xl overflow-hidden"
                    style={{
                        background: isDark
                            ? `linear-gradient(135deg, rgba(0,0,0,0.95) 0%, ${primaryColor}15 50%, rgba(0,0,0,0.95) 100%)`
                            : `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, ${primaryColor}10 50%, rgba(255,255,255,0.95) 100%)`,
                        border: isDark ? `1px solid ${glowColor}40` : `1px solid ${primaryColor}30`,
                        boxShadow: isDark
                            ? `0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 40px ${glowColor}30`
                            : `0 25px 50px -12px rgba(0, 0, 0, 0.3), 0 0 40px ${primaryColor}20`,
                        backdropFilter: "blur(20px)",
                    }}
                >
                    <div
                        className="absolute inset-0 opacity-20 rounded-2xl"
                        style={{
                            backgroundImage: isDark
                                ? `radial-gradient(circle at 20% 30%, ${primaryColor}60 0%, transparent 40%),
                 radial-gradient(circle at 80% 70%, ${secondaryColor}60 0%, transparent 40%),
                 radial-gradient(circle at 50% 50%, ${accentColor}40 0%, transparent 60%)`
                                : `radial-gradient(circle at 20% 30%, ${primaryColor}40 0%, transparent 40%),
                 radial-gradient(circle at 80% 70%, ${secondaryColor}40 0%, transparent 40%),
                 radial-gradient(circle at 50% 50%, ${accentColor}30 0%, transparent 60%)`,
                        }}
                    />

                    <DialogHeader
                        className="relative z-10 p-5 border-b"
                        style={{ borderColor: isDark ? `${glowColor}30` : `${primaryColor}20` }}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div
                                    className="p-3 rounded-xl"
                                    style={{
                                        background: isDark
                                            ? `linear-gradient(135deg, ${primaryColor}40, ${secondaryColor}40)`
                                            : `linear-gradient(135deg, ${primaryColor}30, ${secondaryColor}30)`,
                                        boxShadow: `0 8px 20px ${glowColor}40`,
                                    }}
                                >
                                    <FiImage
                                        className="w-6 h-6"
                                        style={{
                                            color: isDark ? "#ffffff" : primaryColor,
                                            filter: `drop-shadow(0 0 8px ${glowColor}60)`,
                                        }}
                                    />
                                </div>
                                <div>
                                    <DialogTitle
                                        className="text-xl font-bold mb-1"
                                        style={{
                                            color: isDark ? "#ffffff" : "#111827",
                                            textShadow: isDark ? `0 0 15px ${glowColor}60` : `0 0 8px ${primaryColor}40`,
                                            fontFamily: "system-ui, -apple-system, sans-serif",
                                        }}
                                    >
                                        Opções de Imagem
                                    </DialogTitle>
                                    <DialogDescription
                                        className="text-sm"
                                        style={{
                                            color: isDark ? "#d1d5db" : "#6b7280",
                                            textShadow: isDark ? `0 0 5px ${glowColor}30` : "none",
                                            fontFamily: "system-ui, -apple-system, sans-serif",
                                        }}
                                    >
                                        Personalize a aparência do seu fluxo de trabalho
                                    </DialogDescription>
                                </div>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onClose}
                                className="p-2 rounded-xl transition-colors"
                                style={{
                                    background: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
                                    color: isDark ? "#d1d5db" : "#6b7280",
                                }}
                            >
                                <FiX className="w-5 h-5" />
                            </motion.button>
                        </div>
                    </DialogHeader>

                    <div className="relative z-10 p-5 space-y-4">
                        <motion.button
                            whileHover={{ scale: 1.02, x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onChangeBackground}
                            className="w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200"
                            style={{
                                background: isDark
                                    ? `linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))`
                                    : `linear-gradient(135deg, rgba(0,0,0,0.04), rgba(0,0,0,0.02))`,
                                border: isDark ? `1px solid ${glowColor}30` : `1px solid ${primaryColor}20`,
                                boxShadow: `0 4px 15px ${glowColor}20`,
                            }}
                        >
                            <div
                                className="p-3 rounded-xl"
                                style={{
                                    background: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
                                }}
                            >
                                <FiFolder className="w-6 h-6" style={{ color: isDark ? "#d1d5db" : "#6b7280" }} />
                            </div>
                            <div className="flex-1 text-left">
                                <div
                                    className="font-semibold text-base mb-1"
                                    style={{
                                        color: isDark ? "#ffffff" : "#111827",
                                        fontFamily: "system-ui, -apple-system, sans-serif",
                                    }}
                                >
                                    Alterar Background
                                </div>
                                <div
                                    className="text-sm"
                                    style={{
                                        color: isDark ? "#a1a1aa" : "#71717a",
                                        fontFamily: "system-ui, -apple-system, sans-serif",
                                    }}
                                >
                                    Escolher nova imagem de fundo do fluxo
                                </div>
                            </div>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.02, x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onResetBackground}
                            className="w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200"
                            style={{
                                background: "rgba(239, 68, 68, 0.1)",
                                border: "1px solid rgba(239, 68, 68, 0.3)",
                                boxShadow: "0 4px 15px rgba(239, 68, 68, 0.2)",
                            }}
                        >
                            <div
                                className="p-3 rounded-xl"
                                style={{
                                    background: "rgba(239, 68, 68, 0.2)",
                                }}
                            >
                                <FiTrash2 className="w-6 h-6 text-red-400" />
                            </div>
                            <div className="flex-1 text-left">
                                <div
                                    className="font-semibold text-base mb-1"
                                    style={{
                                        color: isDark ? "#ffffff" : "#111827",
                                        fontFamily: "system-ui, -apple-system, sans-serif",
                                    }}
                                >
                                    Resetar Background
                                </div>
                                <div
                                    className="text-sm"
                                    style={{
                                        color: isDark ? "#a1a1aa" : "#71717a",
                                        fontFamily: "system-ui, -apple-system, sans-serif",
                                    }}
                                >
                                    Remover imagem de fundo e voltar ao padrão
                                </div>
                            </div>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.02, x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onSaveImage}
                            className="w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200"
                            style={{
                                background: "rgba(34, 197, 94, 0.1)",
                                border: "1px solid rgba(34, 197, 94, 0.3)",
                                boxShadow: "0 4px 15px rgba(34, 197, 94, 0.2)",
                            }}
                        >
                            <div
                                className="p-3 rounded-xl"
                                style={{
                                    background: "rgba(34, 197, 94, 0.2)",
                                }}
                            >
                                <FiCamera className="w-6 h-6 text-green-400" />
                            </div>
                            <div className="flex-1 text-left">
                                <div
                                    className="font-semibold text-base mb-1"
                                    style={{
                                        color: isDark ? "#ffffff" : "#111827",
                                        fontFamily: "system-ui, -apple-system, sans-serif",
                                    }}
                                >
                                    Salvar Imagem
                                </div>
                                <div
                                    className="text-sm"
                                    style={{
                                        color: isDark ? "#a1a1aa" : "#71717a",
                                        fontFamily: "system-ui, -apple-system, sans-serif",
                                    }}
                                >
                                    Capturar screenshot do fluxo atual
                                </div>
                            </div>
                        </motion.button>
                    </div>

                    <div
                        className="relative z-10 flex justify-end p-5 border-t"
                        style={{
                            borderColor: isDark ? `${glowColor}30` : `${primaryColor}20`,
                        }}
                    >
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onClose}
                            className="px-6 py-2 text-sm font-medium rounded-lg transition-colors"
                            style={{
                                background: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
                                color: isDark ? "#d1d5db" : "#6b7280",
                                fontFamily: "system-ui, -apple-system, sans-serif",
                            }}
                        >
                            Fechar
                        </motion.button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
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
                                   startPosition,
                                   mousePosition,
                                   componentCount,
                                   workflowContainerRef,
                               }: any) => {
    const router = useRouter()
    const { theme, toggleTheme, currentGradient, glowAnimation, glowEnabled, setShowColorPanel, showColorPanel } =
        useTheme()
    const [searchValue, setSearchValue] = useState("")
    const [showResetDialog, setShowResetDialog] = useState(false)
    const [showExecuteDialog, setShowExecuteDialog] = useState(false)
    const [showImageMenu, setShowImageMenu] = useState(false)
    const [isWorkflowSaved, setIsWorkflowSaved] = useState(false)
    const [isSearchFocused, setIsSearchFocused] = useState(false)
    const [showSearchResults, setShowSearchResults] = useState(false)
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)

    useEffect(() => {
        setIsWorkflowSaved(false)
    }, [componentCount])

    const primaryColor = currentGradient?.primary || "#000000"
    const secondaryColor = currentGradient?.secondary || "#000000"
    const accentColor = currentGradient?.accent || "#000000"
    const glowColor = currentGradient?.glow || "#000000"

    const isDark = theme === "dark"
    const accentHex = extractHexColor(currentGradient?.primary, isDark ? "#6366f1" : "#4338ca")

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()

        const savedWorkflow = localStorage.getItem("workflow")
        if (savedWorkflow) {
            try {
                const workflow = JSON.parse(savedWorkflow)
                const components = workflow.nodes
                    .filter((node: any) => node.id !== "start-node")
                    .map((node: any) => ({
                        id: node.data.customId || node.id,
                        name: node.data.label || node.type,
                        type: node.type,
                    }))

                setSearchResults(components)
                setShowSearchResults(true)
                setIsSearchModalOpen(true)
            } catch (error) {
                console.error("Error loading components:", error)
            }
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
        setIsWorkflowSaved(false)
    }

    const handleSave = () => {
        if (onSave) {
            try {
                const result = onSave()
                setIsWorkflowSaved(result !== false)
            } catch {
                setIsWorkflowSaved(false)
            }
        }
    }

    const handleExecute = () => {
        if (!isWorkflowSaved) {
            toast({
                title: "❌ Salve primeiro!",
                description: "Você precisa salvar o fluxo antes de executar",
                variant: "destructive",
            })
            return
        }
        if (onExecute) {
            onExecute()
        }
        setShowExecuteDialog(true)
    }

    const handleChangeBackground = useCallback(() => {
        const imageUrl = prompt("Enter image URL for background:")
        if (imageUrl) {
            localStorage.setItem("flow-background-image", imageUrl)
            document.documentElement.style.setProperty("--flow-background-image", `url(${imageUrl})`)
        }
    }, [])

    const handleSaveImage = useCallback(async () => {
        if (workflowContainerRef?.current) {
            try {
                const canvas = await html2canvas(workflowContainerRef.current, {
                    useCORS: true,
                    backgroundColor: null,
                    allowTaint: true,
                })
                const image = canvas.toDataURL("image/png")
                const link = document.createElement("a")
                link.download = "workflow.png"
                link.href = image
                link.click()
            } catch (error) {
                console.error("Error saving image:", error)
                alert("Failed to save image. Please check browser console for details.")
            }
        }
    }, [workflowContainerRef])

    const handleResetBackground = useCallback(() => {
        localStorage.removeItem("flow-background-image")
        document.documentElement.style.setProperty("--flow-background-image", "url(/background-pattern.png)")
    }, [])

    return (
        <>
            {isSearchModalOpen && showSearchResults && searchResults.length > 0 && (
                <div
                    className="fixed inset-0 z-[100] flex items-start justify-center pt-32"
                    style={{
                        backdropFilter: "blur(8px)",
                        background: "rgba(0, 0, 0, 0.5)",
                    }}
                    onClick={() => {
                        setIsSearchModalOpen(false)
                        setShowSearchResults(false)
                    }}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="w-full max-w-2xl mx-4 rounded-2xl shadow-2xl overflow-hidden"
                        style={{
                            background: isDark ? "rgba(20, 20, 30, 0.98)" : "rgba(255, 255, 255, 0.98)",
                            border: `2px solid ${isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.15)"}`,
                            backdropFilter: "blur(20px)",
                            boxShadow: `0 20px 60px rgba(0, 0, 0, 0.4), 0 0 40px ${glowColor}30`,
                            maxHeight: "70vh",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div
                            className="px-6 py-4 border-b"
                            style={{
                                borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
                                background: isDark ? "rgba(30, 30, 40, 0.5)" : "rgba(250, 250, 250, 0.5)",
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <h3
                                    className="text-xl font-bold"
                                    style={{
                                        color: isDark ? "#ffffff" : "#1f2937",
                                    }}
                                >
                                    Resultados da Busca
                                </h3>
                                <button
                                    onClick={() => {
                                        setIsSearchModalOpen(false)
                                        setShowSearchResults(false)
                                    }}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                                    style={{
                                        background: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
                                        color: isDark ? "#e5e7eb" : "#6b7280",
                                    }}
                                >
                                    <FiX className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="overflow-y-auto" style={{ maxHeight: "calc(70vh - 80px)" }}>
                            {searchResults.map((component, index) => (
                                <motion.div
                                    key={index}
                                    whileHover={{
                                        backgroundColor: isDark ? "rgba(59, 130, 246, 0.15)" : "rgba(59, 130, 246, 0.1)",
                                        x: 4,
                                    }}
                                    className="px-6 py-5 cursor-pointer border-b transition-all"
                                    style={{
                                        borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)",
                                    }}
                                    onClick={() => {
                                        if (onSearch) onSearch(component.id)
                                        setShowSearchResults(false)
                                        setIsSearchModalOpen(false)
                                    }}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div
                                                className="font-semibold text-lg mb-2"
                                                style={{
                                                    color: isDark ? "#ffffff" : "#1f2937",
                                                }}
                                            >
                                                {component.name}
                                            </div>
                                            <div
                                                className="text-base flex items-center gap-2"
                                                style={{
                                                    color: isDark ? "#9ca3af" : "#6b7280",
                                                }}
                                            >
                                                <span className="font-mono">ID: {component.id}</span>
                                                <span
                                                    className="px-2 py-0.5 rounded text-xs"
                                                    style={{
                                                        background: isDark ? "rgba(59, 130, 246, 0.2)" : "rgba(59, 130, 246, 0.1)",
                                                        color: isDark ? "#60a5fa" : "#3b82f6",
                                                    }}
                                                >
                          {component.type}
                        </span>
                                            </div>
                                        </div>
                                        <div
                                            className="px-4 py-2 rounded-lg text-sm font-medium"
                                            style={{
                                                background: isDark ? "rgba(59, 130, 246, 0.2)" : "rgba(59, 130, 246, 0.1)",
                                                color: isDark ? "#60a5fa" : "#3b82f6",
                                            }}
                                        >
                                            Localizar
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            )}

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

                        <div
                            className="flex items-center gap-1 px-1 py-1 rounded-full"
                            style={{
                                background: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)",
                                border: `1px solid ${isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)"}`,
                                boxShadow: glowEnabled ? `0 0 15px ${glowColor}20` : "none",
                            }}
                        >
                            <motion.button
                                whileHover={{
                                    scale: 1.1,
                                    boxShadow: `0 0 20px ${accentColor}60`,
                                }}
                                whileTap={{ scale: 0.9 }}
                                onClick={onOpenBot}
                                className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                                style={{
                                    background: isDark
                                        ? `linear-gradient(135deg, ${accentColor}, ${secondaryColor})`
                                        : `linear-gradient(135deg, ${accentColor}, ${secondaryColor})`,
                                    border: `1px solid ${accentColor}40`,
                                    boxShadow: `0 4px 15px ${accentColor}30`,
                                }}
                                title="Open Bot"
                            >
                                <BotIcon className="w-4 h-4" style={{ color: isDark ? "#ffffff" : "#1f2937" }} />
                            </motion.button>
                        </div>

                        <div className="flex items-center gap-2">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onLoad}
                                className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
                                style={{
                                    color: isDark ? "#60a5fa" : "#3b82f6",
                                    background: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)",
                                    border: `1px solid ${isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)"}`,
                                }}
                                title="Import Workflow"
                            >
                                <FiUpload className="w-4 h-4" />
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onDownload}
                                className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
                                style={{
                                    color: isDark ? "#60a5fa" : "#3b82f6",
                                    background: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)",
                                    border: `1px solid ${isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)"}`,
                                }}
                                title="Export Workflow"
                            >
                                <FiDownload className="w-4 h-4" />
                            </motion.button>
                        </div>
                    </div>

                    {/* Center Section: Search + Status */}
                    <div className="flex-1 flex flex-col gap-4 px-3 max-w-5xl md:flex-row md:items-stretch md:justify-center">
                        <form onSubmit={handleSearch} className="flex-1 max-w-xl">
                            <div
                                className="relative flex items-center gap-3 rounded-2xl px-4 py-2.5 transition-all duration-300"
                                style={{
                                    background: isDark
                                        ? "linear-gradient(135deg, rgba(17,24,39,0.78), rgba(30,41,59,0.62))"
                                        : "linear-gradient(135deg, rgba(255,255,255,0.96), rgba(241,245,249,0.9))",
                                    border: `1px solid ${hexToRgba(accentHex, isSearchFocused ? (isDark ? 0.55 : 0.45) : (isDark ? 0.3 : 0.22))}`,
                                    boxShadow: isSearchFocused
                                        ? `0 22px 45px ${hexToRgba(accentHex, 0.28)}`
                                        : `0 15px 32px ${hexToRgba(accentHex, 0.18)}`,
                                    backdropFilter: "blur(18px)",
                                }}
                            >
                                <span
                                    className="pointer-events-none absolute left-0 top-0 bottom-0 w-[2.5px] rounded-l-2xl"
                                    style={{
                                        background: `linear-gradient(180deg, transparent, ${hexToRgba(accentHex, 0.65)}, transparent)`
                                    }}
                                />
                                <FiSearch
                                    className="h-4 w-4 shrink-0"
                                    style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
                                />
                                <input
                                    type="text"
                                    value={searchValue}
                                    onChange={(e) => setSearchValue(e.target.value)}
                                    onFocus={() => setIsSearchFocused(true)}
                                    onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                                    placeholder="Procurar ID ou rótulo do componente"
                                    aria-label="Pesquisar componente pelo identificador"
                                    className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                                    style={{ color: isDark ? "#e2e8f0" : "#1f2937" }}
                                />
                                {searchValue && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchValue("")}
                                        className="group rounded-full p-1 transition-colors"
                                        style={{
                                            background: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)",
                                        }}
                                        aria-label="Limpar pesquisa"
                                    >
                                        <FiX
                                            className="h-3.5 w-3.5"
                                            style={{ color: isDark ? "#cbd5f5" : "#475569" }}
                                        />
                                    </button>
                                )}
                                <div
                                    className="pointer-events-none absolute inset-0 rounded-2xl"
                                    style={{
                                        boxShadow: isSearchFocused
                                            ? `0 0 0 1px ${hexToRgba(accentHex, 0.55)}`
                                            : `0 0 0 1px ${hexToRgba(accentHex, 0.16)}`,
                                    }}
                                />
                            </div>
                        </form>

                        <div className="flex-1 min-w-[260px]">
                            <FlowStatusIndicator
                                startPosition={startPosition}
                                mousePosition={mousePosition}
                                componentCount={componentCount}
                                theme={theme}
                                currentGradient={currentGradient}
                            />
                        </div>
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
                                    backgroundColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
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
                                    scale: 1.1,
                                    backgroundColor: "rgba(239, 68, 68, 0.2)",
                                    boxShadow: "0 0 20px rgba(239, 68, 68, 0.6)",
                                }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleReset}
                                className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                                style={{
                                    color: isDark ? "#9ca3af" : "#6b7280",
                                }}
                                title="Reset Workflow"
                            >
                                <FiRefreshCw className="w-4 h-4" />
                            </motion.button>
                        </motion.div>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSave}
                            className="px-4 py-2 rounded-full flex items-center gap-2 transition-all"
                            style={{
                                background: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
                                border: `1px solid ${isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)"}`,
                                color: isDark ? "#e5e7eb" : "#1f2937",
                            }}
                        >
                            <FiSave className="w-4 h-4" />
                            <span className="text-sm font-medium">Save</span>
                        </motion.button>

                        <motion.button
                            whileHover={isWorkflowSaved ? { scale: 1.05 } : {}}
                            whileTap={isWorkflowSaved ? { scale: 0.95 } : {}}
                            onClick={handleExecute}
                            disabled={!isWorkflowSaved}
                            className="px-4 py-2 rounded-full flex items-center gap-2 transition-all"
                            style={{
                                background: isWorkflowSaved
                                    ? isDark
                                        ? `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
                                        : `linear-gradient(135deg, ${primaryColor}DD, ${secondaryColor}DD)`
                                    : isDark
                                        ? "rgba(255, 255, 255, 0.05)"
                                        : "rgba(0, 0, 0, 0.03)",
                                border: `1px solid ${isWorkflowSaved ? glowColor : isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)"}`,
                                color: isWorkflowSaved ? "#ffffff" : isDark ? "#6b7280" : "#9ca3af",
                                cursor: isWorkflowSaved ? "pointer" : "not-allowed",
                                opacity: isWorkflowSaved ? 1 : 0.5,
                            }}
                        >
                            <FiPlay
                                className="w-4 h-4"
                                style={{ color: isWorkflowSaved ? "#ffffff" : isDark ? "#6b7280" : "#9ca3af" }}
                            />
                            <span className="text-sm font-medium">Execute</span>
                        </motion.button>
                    </div>
                </div>
            </motion.header>

            <ImageMenu
                isOpen={showImageMenu}
                onClose={() => setShowImageMenu(false)}
                onChangeBackground={handleChangeBackground}
                onSaveImage={handleSaveImage}
                onResetBackground={handleResetBackground}
                theme={theme}
            />

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
    const workflowContainerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setMounted(true)
        const savedImage = localStorage.getItem("flow-background-image")
        if (savedImage) {
            document.documentElement.style.setProperty("--flow-background-image", `url(${savedImage})`)
        }
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
                onExecute={() => {
                    if (workflowActions?.execute) workflowActions.execute()
                    localStorage.setItem("executedFlow", "true")
                }}
                onSearch={workflowActions?.search}
                onReset={workflowActions?.reset}
                onDownload={workflowActions?.download}
                onToggleSidebar={toggleSidebar}
                onOpenBot={openBot}
                onOpenColorPanel={openColorPanel}
                startPosition={startPosition}
                mousePosition={mousePosition}
                componentCount={componentCount}
                workflowContainerRef={workflowContainerRef}
            />

            <main className="relative flex-1 overflow-hidden pt-24" ref={workflowContainerRef}>
                <div className="h-full">
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
                </div>
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
