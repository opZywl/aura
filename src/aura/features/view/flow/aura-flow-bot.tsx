"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { SendIcon, XIcon, MinimizeIcon, MaximizeIcon, BotIcon } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"

interface Message {
    id: string
    role: "user" | "assistant"
    content: string
}

interface AuraFlowBotProps {
    isOpen?: boolean
    onClose?: () => void
    standalone?: boolean
}

export default function AuraFlowBot({ isOpen: propIsOpen, onClose, standalone = false }: AuraFlowBotProps) {
    const [isOpen, setIsOpen] = useState(propIsOpen || false)
    const [isMinimized, setIsMinimized] = useState(false)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const [savedFlow, setSavedFlow] = useState<any>(null)
    const [currentNodeId, setCurrentNodeId] = useState<string | null>(null)
    const [waitingForUserInput, setWaitingForUserInput] = useState(false)
    const [currentOptions, setCurrentOptions] = useState<any[]>([])
    const [currentOptionsMessage, setCurrentOptionsMessage] = useState("")
    const [isFlowExecuted, setIsFlowExecuted] = useState(false)
    const [flowLoaded, setFlowLoaded] = useState(false)

    useEffect(() => {
        if (propIsOpen !== undefined) {
            setIsOpen(propIsOpen)
        }
    }, [propIsOpen])

    const WORKFLOW_KEY = "workflow"
    const EXECUTED_KEY = "executedFlow"

    const loadWorkflow = useCallback(() => {
        try {
            console.log("🔍 [AuraBot] Tentando carregar fluxo...")

            const savedWorkflow = localStorage.getItem(WORKFLOW_KEY)
            const isExecuted = localStorage.getItem(EXECUTED_KEY) === "true"

            console.log("📦 [AuraBot] Workflow no localStorage:", savedWorkflow ? "ENCONTRADO" : "NÃO ENCONTRADO")
            console.log("✅ [AuraBot] Status de execução:", isExecuted ? "EXECUTADO" : "NÃO EXECUTADO")

            if (!savedWorkflow) {
                console.log("❌ [AuraBot] Nenhum workflow salvo encontrado")
                return null
            }

            if (!isExecuted) {
                console.log("❌ [AuraBot] Workflow não foi executado ainda")
                return null
            }

            const workflow = JSON.parse(savedWorkflow)
            console.log("✅ [AuraBot] Workflow carregado com sucesso:", {
                nodes: workflow.nodes?.length || 0,
                edges: workflow.edges?.length || 0,
            })

            return workflow
        } catch (error) {
            console.error("❌ [AuraBot] Erro ao carregar workflow:", error)
            return null
        }
    }, [])

    useEffect(() => {
        if (isOpen) {
            console.log("🚀 [AuraBot] Chat aberto, carregando fluxo...")
            const workflow = loadWorkflow()
            setSavedFlow(workflow)
            setIsFlowExecuted(localStorage.getItem(EXECUTED_KEY) === "true")

            const hasFlow = workflow && workflow.nodes && workflow.nodes.length > 1
            setFlowLoaded(hasFlow)

            const initialMessages: Message[] = hasFlow
                ? [
                    {
                        id: "flow-ready",
                        role: "assistant",
                        content: "✅ Olá! Fluxo carregado e pronto para uso.\n\nDigite qualquer mensagem para começar!",
                    },
                ]
                : [
                    {
                        id: "no-flow",
                        role: "assistant",
                        content:
                            "❌ Nenhum fluxo foi configurado.\n\nPor favor, acesse o painel administrativo para criar um fluxo.",
                    },
                ]

            setMessages(initialMessages)
        }
    }, [isOpen, loadWorkflow])

    useEffect(() => {
        if (!isOpen) return

        const handleStorageChange = () => {
            console.log("🔄 [AuraBot] Detectada mudança no localStorage")
            const workflow = loadWorkflow()
            setSavedFlow(workflow)
            setIsFlowExecuted(localStorage.getItem(EXECUTED_KEY) === "true")

            const hasFlow = workflow && workflow.nodes && workflow.nodes.length > 1
            setFlowLoaded(hasFlow)

            const newMessages: Message[] = hasFlow
                ? [
                    {
                        id: "flow-ready",
                        role: "assistant",
                        content: "✅ Olá! Fluxo carregado e pronto para uso.\n\nDigite qualquer mensagem para começar!",
                    },
                ]
                : [
                    {
                        id: "no-flow",
                        role: "assistant",
                        content:
                            "❌ Nenhum fluxo foi configurado.\n\nPor favor, acesse o painel administrativo para criar um fluxo.",
                    },
                ]

            setMessages(newMessages)
        }

        window.addEventListener("storage", handleStorageChange)
        const interval = setInterval(handleStorageChange, 3000)

        return () => {
            window.removeEventListener("storage", handleStorageChange)
            clearInterval(interval)
        }
    }, [isOpen, loadWorkflow])

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [messages])

    useEffect(() => {
        if (isOpen && !isMinimized && inputRef.current) {
            inputRef.current.focus()
        }
    }, [isOpen, isMinimized])

    const findNextNode = useCallback(
        (currentNodeId: string, optionIndex?: number) => {
            if (!savedFlow) return null

            const edges = savedFlow.edges
            let targetEdge

            if (optionIndex !== undefined) {
                const nodeEdges = edges.filter((edge: any) => edge.source === currentNodeId)
                targetEdge = nodeEdges[optionIndex]
            } else {
                targetEdge = edges.find((edge: any) => edge.source === currentNodeId)
            }

            if (targetEdge) {
                return savedFlow.nodes.find((node: any) => node.id === targetEdge.target)
            }

            return null
        },
        [savedFlow],
    )

    const processNode = useCallback(
        (node: any) => {
            setCurrentNodeId(node.id)
            console.log("🔄 [AuraBot] Processando nó:", node.id, node.type, node.data?.customId)

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

                setTimeout(() => {
                    const nextNode = findNextNode(node.id)
                    if (nextNode) {
                        processNode(nextNode)
                    } else {
                        setWaitingForUserInput(false)
                        setCurrentNodeId(null)
                        console.log("✅ [AuraBot] Fluxo finalizado - nenhum próximo nó")
                    }
                }, 1500)
            } else if (node.type === "options") {
                const message = node.data.message || "Escolha uma opção:"
                const options = node.data.options || []

                setCurrentOptions(options)
                setCurrentOptionsMessage(message)

                let optionsText = message + "\n\n"
                options.forEach((option: any, index: number) => {
                    optionsText += `${index + 1}. ${option.text}\n`
                })
                optionsText += "\n💡 Digite o número da opção desejada"

                setMessages((prev) => [
                    ...prev,
                    {
                        id: Date.now().toString(),
                        role: "assistant",
                        content: optionsText,
                    },
                ])

                setWaitingForUserInput(true)
                console.log("⏳ [AuraBot] Aguardando seleção do usuário...")
            } else if (node.type === "finalizar") {
                const message = node.data.message || "Conversa finalizada. Obrigado!"

                setMessages((prev) => [
                    ...prev,
                    {
                        id: Date.now().toString(),
                        role: "assistant",
                        content: message + "\n\n✅ Conversa finalizada!",
                    },
                ])

                setCurrentNodeId(null)
                setWaitingForUserInput(false)
                console.log("🏁 [AuraBot] Conversa finalizada")
            }
        },
        [findNextNode],
    )

    const startFlow = useCallback(() => {
        if (!savedFlow || !savedFlow.nodes) {
            console.log("⚠️ [AuraBot] Nenhum fluxo disponível para iniciar")
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now().toString(),
                    role: "assistant",
                    content: "❌ Erro: Nenhum fluxo configurado encontrado.",
                },
            ])
            return
        }

        console.log("🚀 [AuraBot] Iniciando fluxo...")

        const startNode = savedFlow.nodes.find((node: any) => node.id === "start-node")
        if (startNode) {
            const firstNode = findNextNode("start-node")
            if (firstNode) {
                console.log("✅ [AuraBot] Primeiro nó encontrado:", firstNode.id, firstNode.data?.customId)
                processNode(firstNode)
            } else {
                console.log("⚠️ [AuraBot] Nenhum nó conectado ao START")
                setMessages((prev) => [
                    ...prev,
                    {
                        id: Date.now().toString(),
                        role: "assistant",
                        content: "⚠️ Fluxo não está configurado corretamente - nenhum nó conectado ao início.",
                    },
                ])
            }
        } else {
            console.log("⚠️ [AuraBot] Nó START não encontrado")
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now().toString(),
                    role: "assistant",
                    content: "⚠️ Fluxo inválido - nó de início não encontrado.",
                },
            ])
        }
    }, [savedFlow, findNextNode, processNode])

    const repeatOptions = useCallback(() => {
        if (currentOptions.length > 0) {
            let optionsText = "❌ Opção inválida! " + currentOptionsMessage + "\n\n"
            currentOptions.forEach((option: any, index: number) => {
                optionsText += `${index + 1}. ${option.text}\n`
            })
            optionsText += "\n💡 Digite apenas o número da opção (1, 2, 3...)"

            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now().toString(),
                    role: "assistant",
                    content: optionsText,
                },
            ])
        }
    }, [currentOptions, currentOptionsMessage])

    const handleSendMessage = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault()

            if (!input.trim()) return

            const userInput = input.trim()
            console.log("💬 [AuraBot] Mensagem do usuário:", userInput)

            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now().toString(),
                    role: "user",
                    content: userInput,
                },
            ])

            setInput("")

            if (!isFlowExecuted || !savedFlow) {
                console.log("⚠️ [AuraBot] Sem fluxo executado, mostrando mensagem de erro")
                setTimeout(() => {
                    setMessages((prev) => [
                        ...prev,
                        {
                            id: Date.now().toString(),
                            role: "assistant",
                            content:
                                "❌ Nenhum fluxo foi configurado ou executado.\n\nPor favor, acesse o painel administrativo e:\n1. Crie um fluxo\n2. Clique em 'Salvar'\n3. Clique em 'Executar'",
                        },
                    ])
                }, 500)
                return
            }

            if (!currentNodeId && !waitingForUserInput) {
                console.log("🚀 [AuraBot] Primeira mensagem - iniciando fluxo")
                setTimeout(() => {
                    startFlow()
                }, 800)
                return
            }

            if (waitingForUserInput && currentNodeId) {
                const currentNode = savedFlow.nodes.find((node: any) => node.id === currentNodeId)

                if (currentNode && currentNode.type === "options") {
                    const options = currentNode.data.options || []
                    const optionIndex = Number.parseInt(userInput) - 1

                    console.log(
                        "🔢 [AuraBot] Processando opção:",
                        userInput,
                        "índice:",
                        optionIndex,
                        "total opções:",
                        options.length,
                    )

                    if (optionIndex >= 0 && optionIndex < options.length) {
                        console.log("✅ [AuraBot] Opção válida selecionada:", options[optionIndex].text)
                        setWaitingForUserInput(false)
                        setTimeout(() => {
                            const nextNode = findNextNode(currentNodeId, optionIndex)
                            if (nextNode) {
                                processNode(nextNode)
                            } else {
                                setCurrentNodeId(null)
                                console.log("🏁 [AuraBot] Fim do fluxo - nenhum próximo nó para a opção selecionada")
                            }
                        }, 800)
                    } else {
                        console.log("❌ [AuraBot] Opção inválida:", userInput)
                        setTimeout(() => {
                            repeatOptions()
                        }, 500)
                    }
                }
            }
        },
        [
            input,
            isFlowExecuted,
            savedFlow,
            currentNodeId,
            waitingForUserInput,
            startFlow,
            findNextNode,
            processNode,
            repeatOptions,
        ],
    )

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value)
    }

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

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!isDragging) return

            const newX = e.clientX - dragStart.x
            const newY = e.clientY - dragStart.y

            // Constrain to viewport
            const maxX = isOpen ? window.innerWidth - 384 : window.innerWidth - 56
            const maxY = isOpen ? window.innerHeight - 500 : window.innerHeight - 56

            setPosition({
                x: Math.max(0, Math.min(newX, maxX)),
                y: Math.max(0, Math.min(newY, maxY)),
            })
        },
        [isDragging, dragStart, isOpen],
    )

    const handleMouseUp = useCallback(() => {
        setIsDragging(false)
    }, [])

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
    }, [isDragging, handleMouseMove, handleMouseUp])

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
        if (onClose) {
            onClose()
        } else {
            setIsOpen(false)
        }
        setIsMinimized(false)
        setCurrentNodeId(null)
        setWaitingForUserInput(false)
        setCurrentOptions([])
        setCurrentOptionsMessage("")
    }

    const chatStyle = {
        right: `${24 + position.x}px`,
        bottom: `${24 + position.y}px`,
        cursor: isDragging ? "grabbing" : "grab",
    }

    return (
        <>
            {standalone && !isOpen && (
                <div className="fixed bottom-6 right-6 z-50">
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="relative"
                    >
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-purple-600/20 blur-xl animate-pulse" />
                        <div
                            className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/30 via-blue-500/30 to-purple-500/30 blur-lg animate-pulse"
                            style={{ animationDelay: "0.5s" }}
                        />

                        <div className="absolute -inset-4 overflow-hidden rounded-3xl">
                            {[...Array(6)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute w-1 h-1 bg-purple-400/60 rounded-full"
                                    animate={{
                                        x: [0, Math.random() * 40 - 20],
                                        y: [0, Math.random() * 40 - 20],
                                        opacity: [0, 1, 0],
                                    }}
                                    transition={{
                                        duration: 2 + Math.random() * 2,
                                        repeat: Number.POSITIVE_INFINITY,
                                        delay: Math.random() * 2,
                                    }}
                                    style={{
                                        left: `${Math.random() * 100}%`,
                                        top: `${Math.random() * 100}%`,
                                    }}
                                />
                            ))}
                        </div>

                        <motion.button
                            onClick={toggleChat}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 p-4 rounded-2xl shadow-2xl border border-purple-500/30 backdrop-blur-sm"
                            style={{
                                boxShadow: "0 0 30px rgba(147, 51, 234, 0.4), 0 0 60px rgba(59, 130, 246, 0.2)",
                            }}
                        >
                            <BotIcon className="w-6 h-6 text-white" />

                            <div className="absolute inset-0 rounded-2xl border-2 border-purple-400/50 animate-ping" />
                            <div className="absolute inset-0 rounded-2xl border border-blue-400/30 animate-pulse" />
                        </motion.button>
                    </motion.div>
                </div>
            )}

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
                        <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-3 flex items-center justify-between border-b border-gray-800 drag-handle">
                            <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8 bg-gray-700">
                                    <div className="flex items-center justify-center h-full w-full">
                                        <BotIcon className="h-5 w-5 text-gray-200" />
                                    </div>
                                </Avatar>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-200">AURA</h3>
                                    <p className="text-xs text-gray-400">{flowLoaded ? "Fluxo Ativo" : "Sem Fluxo"}</p>
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

                        {!isMinimized && (
                            <>
                                {/* Mensajes */}
                                <div className="p-4 h-[360px] overflow-y-auto bg-gray-950">
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
                                                <p className="text-sm whitespace-pre-line">{message.content}</p>
                                            </div>
                                        </div>
                                    ))}

                                    <div ref={messagesEndRef} />
                                </div>

                                <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-800 bg-gray-900">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            value={input}
                                            onChange={handleInputChange}
                                            placeholder={waitingForUserInput ? "Digite o número da opção..." : "Digite sua mensagem..."}
                                            className="flex-1 bg-gray-800 border border-gray-700 rounded-full px-4 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-600"
                                        />
                                        <Button
                                            type="submit"
                                            disabled={!input.trim()}
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

            {standalone && !isOpen && (
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
            )}
        </>
    )
}
