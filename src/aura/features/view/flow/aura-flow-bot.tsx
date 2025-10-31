"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { SendIcon, XIcon, MinimizeIcon, MaximizeIcon, BotIcon, RefreshCwIcon } from "lucide-react"
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

const WORKFLOW_KEY = "workflow"
const EXECUTED_KEY = "executedFlow"
const MESSAGES_KEY = "aura_messages"
const CURRENT_NODE_KEY = "aura_current_node"
const WAITING_INPUT_KEY = "aura_waiting_input"
const CURRENT_OPTIONS_KEY = "aura_current_options"
const OPTIONS_MESSAGE_KEY = "aura_options_message"
const FLOW_VERSION_KEY = "aura_flow_version"

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
    const isInitialMount = useRef(true)
    const lastFlowVersion = useRef<string>("")

    // Estado para armazenar o fluxo carregado
    const [savedFlow, setSavedFlow] = useState<any>(null)
    const [currentNodeId, setCurrentNodeId] = useState<string | null>(null)
    const [waitingForUserInput, setWaitingForUserInput] = useState(false)
    const [currentOptions, setCurrentOptions] = useState<any[]>([])
    const [currentOptionsMessage, setCurrentOptionsMessage] = useState("")
    const [isFlowExecuted, setIsFlowExecuted] = useState(false)
    const [flowLoaded, setFlowLoaded] = useState(false)

    // Sincronizar isOpen com prop
    useEffect(() => {
        if (propIsOpen !== undefined) {
            setIsOpen(propIsOpen)
        }
    }, [propIsOpen])

    // Função para gerar versão do fluxo baseada no conteúdo
    const generateFlowVersion = useCallback((workflow: any) => {
        if (!workflow || !workflow.nodes || !workflow.edges) return ""

        const content = JSON.stringify({
            nodes: workflow.nodes.length,
            edges: workflow.edges.length,
            nodeIds: workflow.nodes.map((n: any) => n.id).sort(),
            timestamp: Date.now(),
        })

        return btoa(content).slice(0, 16) // Versão curta baseada no conteúdo
    }, [])

    // Função para limpar completamente o estado do chat
    const clearChatState = useCallback(() => {
        console.log("🧹 [AuraBot] Limpando estado do chat completamente")

        // Limpar localStorage
        localStorage.removeItem(MESSAGES_KEY)
        localStorage.removeItem(CURRENT_NODE_KEY)
        localStorage.removeItem(WAITING_INPUT_KEY)
        localStorage.removeItem(CURRENT_OPTIONS_KEY)
        localStorage.removeItem(OPTIONS_MESSAGE_KEY)

        // Resetar estado local
        setMessages([])
        setCurrentNodeId(null)
        setWaitingForUserInput(false)
        setCurrentOptions([])
        setCurrentOptionsMessage("")

        console.log("✅ [AuraBot] Estado do chat limpo")
    }, [])

    // Carregar mensagens do localStorage
    const loadMessages = useCallback(() => {
        try {
            const savedMessages = localStorage.getItem(MESSAGES_KEY)
            if (savedMessages) {
                console.log("📥 [AuraBot] Carregando mensagens do localStorage")
                return JSON.parse(savedMessages) as Message[]
            }
        } catch (error) {
            console.error("❌ [AuraBot] Erro ao carregar mensagens:", error)
        }
        return []
    }, [])

    // Salvar mensagens no localStorage
    const saveMessages = useCallback((newMessages: Message[]) => {
        try {
            console.log("📤 [AuraBot] Salvando mensagens no localStorage:", newMessages.length)
            localStorage.setItem(MESSAGES_KEY, JSON.stringify(newMessages))
        } catch (error) {
            console.error("❌ [AuraBot] Erro ao salvar mensagens:", error)
        }
    }, [])

    // Salvar estado do chat no localStorage
    const saveChatState = useCallback(() => {
        try {
            localStorage.setItem(CURRENT_NODE_KEY, currentNodeId || "")
            localStorage.setItem(WAITING_INPUT_KEY, waitingForUserInput ? "true" : "false")
            localStorage.setItem(CURRENT_OPTIONS_KEY, JSON.stringify(currentOptions))
            localStorage.setItem(OPTIONS_MESSAGE_KEY, currentOptionsMessage)
        } catch (error) {
            console.error("❌ [AuraBot] Erro ao salvar estado do chat:", error)
        }
    }, [currentNodeId, waitingForUserInput, currentOptions, currentOptionsMessage])

    // Carregar estado do chat do localStorage
    const loadChatState = useCallback(() => {
        try {
            const nodeId = localStorage.getItem(CURRENT_NODE_KEY) || null
            const waiting = localStorage.getItem(WAITING_INPUT_KEY) === "true"
            const options = JSON.parse(localStorage.getItem(CURRENT_OPTIONS_KEY) || "[]")
            const optionsMsg = localStorage.getItem(OPTIONS_MESSAGE_KEY) || ""

            return {
                nodeId,
                waiting,
                options,
                optionsMsg,
            }
        } catch (error) {
            console.error("❌ [AuraBot] Erro ao carregar estado do chat:", error)
            return {
                nodeId: null,
                waiting: false,
                options: [],
                optionsMsg: "",
            }
        }
    }, [])

    // Carregar fluxo do localStorage
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

    // Função para inicializar o chat com um novo fluxo
    const initializeWithNewFlow = useCallback(
        (workflow: any) => {
            console.log("🚀 [AuraBot] Inicializando com novo fluxo")

            // Limpar estado anterior
            clearChatState()

            // Configurar novo fluxo
            setSavedFlow(workflow)
            setIsFlowExecuted(true)

            const hasFlow = workflow && workflow.nodes && workflow.nodes.length > 1
            setFlowLoaded(hasFlow)

            // Definir mensagens iniciais para o novo fluxo
            const initialMessages: Message[] = hasFlow
                ? [
                    {
                        id: "flow-ready-" + Date.now(),
                        role: "assistant",
                        content: "✅ Novo fluxo carregado e pronto para uso!\n\nDigite qualquer mensagem para começar!",
                    },
                ]
                : [
                    {
                        id: "no-flow-" + Date.now(),
                        role: "assistant",
                        content:
                            "❌ Nenhum fluxo foi configurado.\n\nPor favor, acesse o painel administrativo para criar um fluxo.",
                    },
                ]

            setMessages(initialMessages)
            saveMessages(initialMessages)

            // Salvar nova versão do fluxo
            const newVersion = generateFlowVersion(workflow)
            localStorage.setItem(FLOW_VERSION_KEY, newVersion)
            lastFlowVersion.current = newVersion

            console.log("✅ [AuraBot] Novo fluxo inicializado com versão:", newVersion)
        },
        [clearChatState, saveMessages, generateFlowVersion],
    )

    // Função para verificar se há um novo fluxo
    const checkForNewFlow = useCallback(() => {
        const workflow = loadWorkflow()
        const isExecuted = localStorage.getItem(EXECUTED_KEY) === "true"

        if (!workflow || !isExecuted) {
            return false
        }

        const currentVersion = generateFlowVersion(workflow)
        const savedVersion = localStorage.getItem(FLOW_VERSION_KEY) || ""

        console.log("🔍 [AuraBot] Verificando versões - Atual:", currentVersion, "Salva:", savedVersion)

        // Se a versão mudou, há um novo fluxo
        if (currentVersion !== savedVersion && currentVersion !== lastFlowVersion.current) {
            console.log("🆕 [AuraBot] Novo fluxo detectado!")
            return { workflow, version: currentVersion }
        }

        return false
    }, [loadWorkflow, generateFlowVersion])

    // Efeito para carregar mensagens e estado do chat ao montar o componente
    useEffect(() => {
        if (isInitialMount.current) {
            console.log("🔄 [AuraBot] Montagem inicial do componente")

            // Verificar se há um novo fluxo primeiro
            const newFlowCheck = checkForNewFlow()
            if (newFlowCheck) {
                initializeWithNewFlow(newFlowCheck.workflow)
            } else {
                // Carregar mensagens salvas se não há novo fluxo
                const savedMessages = loadMessages()
                if (savedMessages.length > 0) {
                    console.log("📥 [AuraBot] Mensagens carregadas:", savedMessages.length)
                    setMessages(savedMessages)
                }

                // Carregar estado do chat
                const chatState = loadChatState()
                setCurrentNodeId(chatState.nodeId)
                setWaitingForUserInput(chatState.waiting)
                setCurrentOptions(chatState.options)
                setCurrentOptionsMessage(chatState.optionsMsg)
            }

            isInitialMount.current = false
        }
    }, [checkForNewFlow, initializeWithNewFlow, loadMessages, loadChatState])

    // Efeito para salvar mensagens quando elas mudam
    useEffect(() => {
        if (!isInitialMount.current && messages.length > 0) {
            console.log("💾 [AuraBot] Salvando", messages.length, "mensagens")
            saveMessages(messages)
        }
    }, [messages, saveMessages])

    // Efeito para salvar estado do chat quando ele muda
    useEffect(() => {
        if (!isInitialMount.current) {
            saveChatState()
        }
    }, [currentNodeId, waitingForUserInput, currentOptions, currentOptionsMessage, saveChatState])

    // Carregar fluxo quando abrir o chat
    useEffect(() => {
        if (isOpen) {
            console.log("🚀 [AuraBot] Chat aberto, verificando fluxo...")

            // Verificar se há um novo fluxo
            const newFlowCheck = checkForNewFlow()
            if (newFlowCheck) {
                initializeWithNewFlow(newFlowCheck.workflow)
                return
            }

            // Se não há novo fluxo, carregar o existente
            const workflow = loadWorkflow()
            setSavedFlow(workflow)
            setIsFlowExecuted(localStorage.getItem(EXECUTED_KEY) === "true")

            const hasFlow = workflow && workflow.nodes && workflow.nodes.length > 1
            setFlowLoaded(hasFlow)

            // Carregar mensagens salvas se não foram carregadas ainda
            if (messages.length === 0) {
                const savedMessages = loadMessages()
                if (savedMessages.length === 0) {
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
                    saveMessages(initialMessages)
                } else {
                    setMessages(savedMessages)
                }
            }
        }
    }, [isOpen, checkForNewFlow, initializeWithNewFlow, loadWorkflow, loadMessages, saveMessages, messages.length])

    // Listener para mudanças no localStorage com polling mais agressivo
    useEffect(() => {
        if (!isOpen) return

        let pollInterval: NodeJS.Timeout

        const handleStorageChange = () => {
            console.log("🔄 [AuraBot] Verificando mudanças no localStorage")

            // Verificar se há um novo fluxo
            const newFlowCheck = checkForNewFlow()
            if (newFlowCheck) {
                console.log("🆕 [AuraBot] Novo fluxo detectado via polling!")
                initializeWithNewFlow(newFlowCheck.workflow)
                return
            }

            // Verificar mudanças normais
            const workflow = loadWorkflow()
            setSavedFlow(workflow)
            setIsFlowExecuted(localStorage.getItem(EXECUTED_KEY) === "true")

            const hasFlow = workflow && workflow.nodes && workflow.nodes.length > 1
            setFlowLoaded(hasFlow)
        }

        // Event listener para mudanças diretas
        window.addEventListener("storage", handleStorageChange)

        // Polling a cada 1 segundo para detectar mudanças
        pollInterval = setInterval(handleStorageChange, 1000)

        return () => {
            window.removeEventListener("storage", handleStorageChange)
            if (pollInterval) {
                clearInterval(pollInterval)
            }
        }
    }, [isOpen, checkForNewFlow, initializeWithNewFlow, loadWorkflow])

    // Scroll ao final das mensagens quando se adiciona uma nova
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [messages])

    // Focar o input quando se abre o chat
    useEffect(() => {
        if (isOpen && !isMinimized && inputRef.current) {
            inputRef.current.focus()
        }
    }, [isOpen, isMinimized])

    // Função para forçar atualização do fluxo
    const forceRefreshFlow = useCallback(() => {
        console.log("🔄 [AuraBot] Forçando atualização do fluxo")
        const workflow = loadWorkflow()
        if (workflow) {
            initializeWithNewFlow(workflow)
        }
    }, [loadWorkflow, initializeWithNewFlow])

    // Funções para processar o fluxo
    const findNextNode = useCallback(
        (currentNodeId: string, optionIndex?: number) => {
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
        },
        [savedFlow],
    )

    const processNode = useCallback(
        (node: any) => {
            setCurrentNodeId(node.id)
            console.log("🔄 [AuraBot] Processando nó:", node.id, node.type, node.data?.customId)

            if (node.type === "sendMessage") {
                const message = node.data.message || "Mensagem não configurada"

                // Adicionar mensagem do bot
                const newMessage = {
                    id: Date.now().toString(),
                    role: "assistant" as const,
                    content: message,
                }

                setMessages((prev) => {
                    const updated = [...prev, newMessage]
                    saveMessages(updated)
                    return updated
                })

                // Continuar automaticamente para o próximo nó após 1 segundo
                setTimeout(() => {
                    const nextNode = findNextNode(node.id)
                    if (nextNode) {
                        processNode(nextNode)
                    } else {
                        setWaitingForUserInput(false)
                        setCurrentNodeId(null)
                        clearChatState()
                        console.log("✅ [AuraBot] Fluxo finalizado - conversa resetada")
                    }
                }, 1500)
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
                optionsText += "\n💡 Digite o número da opção desejada"

                // Adicionar mensagem com opções
                const newMessage = {
                    id: Date.now().toString(),
                    role: "assistant" as const,
                    content: optionsText,
                }

                setMessages((prev) => {
                    const updated = [...prev, newMessage]
                    saveMessages(updated)
                    return updated
                })

                // Aguardar input do usuário
                setWaitingForUserInput(true)
                console.log("⏳ [AuraBot] Aguardando seleção do usuário...")
            } else if (node.type === "finalizar") {
                const message = node.data.message || "Conversa finalizada. Obrigado!"

                // Adicionar mensagem final
                const newMessage = {
                    id: Date.now().toString(),
                    role: "assistant" as const,
                    content: message,
                }

                setMessages((prev) => {
                    const updated = [...prev, newMessage]
                    saveMessages(updated)
                    return updated
                })

                setTimeout(() => {
                    setCurrentNodeId(null)
                    setWaitingForUserInput(false)
                    clearChatState()
                    console.log("🏁 [AuraBot] Conversa finalizada e resetada")
                }, 2000)
            }
        },
        [findNextNode, saveMessages, clearChatState],
    )

    const startFlow = useCallback(() => {
        if (!savedFlow || !savedFlow.nodes) {
            console.log("⚠️ [AuraBot] Nenhum fluxo disponível para iniciar")
            const errorMessage = {
                id: Date.now().toString(),
                role: "assistant" as const,
                content: "❌ Erro: Nenhum fluxo configurado encontrado.",
            }

            setMessages((prev) => {
                const updated = [...prev, errorMessage]
                saveMessages(updated)
                return updated
            })
            return
        }

        console.log("🚀 [AuraBot] Iniciando fluxo...")

        // Encontrar o nó START
        const startNode = savedFlow.nodes.find((node: any) => node.id === "start-node")
        if (startNode) {
            // Encontrar o primeiro nó conectado ao START
            const firstNode = findNextNode("start-node")
            if (firstNode) {
                console.log("✅ [AuraBot] Primeiro nó encontrado:", firstNode.id, firstNode.data?.customId)
                processNode(firstNode)
            } else {
                console.log("⚠️ [AuraBot] Nenhum nó conectado ao START")
                const errorMessage = {
                    id: Date.now().toString(),
                    role: "assistant" as const,
                    content: "⚠️ Fluxo não está configurado corretamente - nenhum nó conectado ao início.",
                }

                setMessages((prev) => {
                    const updated = [...prev, errorMessage]
                    saveMessages(updated)
                    return updated
                })
            }
        } else {
            console.log("⚠️ [AuraBot] Nó START não encontrado")
            const errorMessage = {
                id: Date.now().toString(),
                role: "assistant" as const,
                content: "⚠️ Fluxo inválido - nó de início não encontrado.",
            }

            setMessages((prev) => {
                const updated = [...prev, errorMessage]
                saveMessages(updated)
                return updated
            })
        }
    }, [savedFlow, findNextNode, processNode, saveMessages])

    const repeatOptions = useCallback(() => {
        if (currentOptions.length > 0) {
            let optionsText = "❌ Opção inválida! " + currentOptionsMessage + "\n\n"
            currentOptions.forEach((option: any, index: number) => {
                optionsText += `${index + 1}. ${option.text}\n`
            })
            optionsText += "\n💡 Digite apenas o número da opção (1, 2, 3...)"

            const newMessage = {
                id: Date.now().toString(),
                role: "assistant" as const,
                content: optionsText,
            }

            setMessages((prev) => {
                const updated = [...prev, newMessage]
                saveMessages(updated)
                return updated
            })
        }
    }, [currentOptions, currentOptionsMessage, saveMessages])

    // Função para lidar com o envio de mensagens
    const handleSendMessage = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault()

            if (!input.trim()) return

            const userInput = input.trim()
            console.log("💬 [AuraBot] Mensagem do usuário:", userInput)

            // Adicionar mensagem do usuário
            const userMessage = {
                id: Date.now().toString(),
                role: "user" as const,
                content: userInput,
            }

            setMessages((prev) => {
                const updated = [...prev, userMessage]
                saveMessages(updated)
                return updated
            })

            // Limpar o input imediatamente
            setInput("")

            // Se não há fluxo executado, mostrar mensagem de erro
            if (!isFlowExecuted || !savedFlow) {
                console.log("⚠️ [AuraBot] Sem fluxo executado, mostrando mensagem de erro")
                setTimeout(() => {
                    const errorMessage = {
                        id: Date.now().toString(),
                        role: "assistant" as const,
                        content:
                            "❌ Nenhum fluxo foi configurado ou executado.\n\nPor favor, acesse o painel administrativo e:\n1. Crie um fluxo\n2. Clique em 'Salvar'\n3. Clique em 'Executar'",
                    }

                    setMessages((prev) => {
                        const updated = [...prev, errorMessage]
                        saveMessages(updated)
                        return updated
                    })
                }, 500)
                return
            }

            if (!currentNodeId && !waitingForUserInput) {
                console.log("🚀 [AuraBot] Primeira mensagem - iniciando fluxo do zero")
                setTimeout(() => {
                    startFlow()
                }, 800)
                return
            }

            // Se estamos aguardando input do usuário (nó de opções)
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
                        // Opção válida - continuar para o próximo nó
                        console.log("✅ [AuraBot] Opção válida selecionada:", options[optionIndex].text)
                        setWaitingForUserInput(false)
                        setTimeout(() => {
                            const nextNode = findNextNode(currentNodeId, optionIndex)
                            if (nextNode) {
                                processNode(nextNode)
                            } else {
                                setCurrentNodeId(null)
                                clearChatState()
                                console.log("✅ [AuraBot] Fim do fluxo - conversa resetada")
                            }
                        }, 800)
                    } else {
                        // Opção inválida - repetir as opções
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
            saveMessages,
            clearChatState,
        ],
    )

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value)
    }

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

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
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
            document.body.style.userSelect = "none" // Prevent text selection while dragging
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
                        {/* Glow effect background */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-purple-600/20 blur-xl animate-pulse" />
                        <div
                            className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/30 via-blue-500/30 to-purple-500/30 blur-lg animate-pulse"
                            style={{ animationDelay: "0.5s" }}
                        />

                        {/* Floating particles effect */}
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

                        {/* Main button */}
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
                                    <p className="text-xs text-gray-400">{flowLoaded ? "Fluxo Ativo" : "Sem Fluxo"}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={forceRefreshFlow}
                                    className="h-7 w-7 text-muted-foreground hover:text-card-foreground"
                                    title="Atualizar fluxo"
                                >
                                    <RefreshCwIcon className="h-4 w-4" />
                                </Button>
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

                                {/* Input para enviar mensagens */}
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
