"use client"

import type React from "react"
import { useState, useCallback, useRef, useEffect } from "react"
import ReactFlow, {
    ReactFlowProvider,
    Background,
    BackgroundVariant,
    Controls,
    MiniMap,
    addEdge,
    useNodesState,
    useEdgesState,
    useReactFlow,
    type Connection,
    type Edge,
    type NodeTypes,
    type EdgeTypes,
    type Node,
} from "reactflow"
import "reactflow/dist/style.css"
import { toast } from "@/components/ui/use-toast"
import NodeLibrary from "./node-library"
import NodeConfigPanel from "./node-config-panel"
import CustomEdge from "./custom-edge"
import { SendMessageNode } from "./nodes/send-message-node"
import { OptionsNode } from "./nodes/options-node"
import { ProcessNode } from "./nodes/process-node"
import { ConditionalNode } from "./nodes/conditional-node"
import { CodeNode } from "./nodes/code-node"
import { StartNode } from "./nodes/start-node"
import { FinalizarNode } from "./nodes/finalizar-node"
import { AgendamentoNode } from "./nodes/agendamento-node" // Import AgendamentoNode
import { AgentesNode } from "./nodes/agentes-node" // Import AgentesNode
import { generateNodeId, createNode } from "@/lib/workflow-utils"
import type { WorkflowNode } from "@/lib/types"
import { useTheme } from "../homePanels/ThemeContext"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useAuth } from "@/src/aura/contexts/AuthContext"

const nodeTypes: NodeTypes = {
    sendMessage: (props) => (
        <SendMessageNode
            {...props}
            onRemove={() => removeNodeById(props.id)}
            onUpdateData={(data) => updateNodeDataById(props.id, data)}
        />
    ),
    options: (props) => (
        <OptionsNode
            {...props}
            onRemove={() => removeNodeById(props.id)}
            onUpdateData={(data) => updateNodeDataById(props.id, data)}
        />
    ),
    agendamento: (props) => (
        <AgendamentoNode
            {...props}
            onRemove={() => removeNodeById(props.id)}
            onUpdateData={(data) => updateNodeDataById(props.id, data)}
        />
    ),
    agentes: (props) => (
        <AgentesNode
            {...props}
            onRemove={() => removeNodeById(props.id)}
            onUpdateData={(data) => updateNodeDataById(props.id, data)}
        />
    ),
    process: (props) => <ProcessNode {...props} onRemove={() => removeNodeById(props.id)} />,
    conditional: (props) => <ConditionalNode {...props} onRemove={() => removeNodeById(props.id)} />,
    code: (props) => <CodeNode {...props} onRemove={() => removeNodeById(props.id)} />,
    finalizar: (props) => <FinalizarNode {...props} onRemove={() => removeNodeById(props.id)} />,
    start: StartNode,
}

const edgeTypes: EdgeTypes = {
    custom: CustomEdge,
}

let removeNodeById: (id: string) => void = () => {}
let updateNodeDataById: (id: string, data: any) => void = () => {}

// Fluxo padrão que sempre funciona - COMPLETAMENTE CONECTADO
// Fluxo padrão que sempre funciona
const createDefaultWorkflow = () => {
    const defaultNodes = [
        {
            id: "start-node",
            type: "start",
            position: { x: 250, y: 100 },
            data: {
                label: "INÍCIO",
                description: "Ponto de início do fluxo",
            },
            deletable: false,
            draggable: true,
        },
        {
            id: "welcome-message",
            type: "sendMessage",
            position: { x: 250, y: 200 },
            data: {
                label: "Mensagem de Boas-vindas",
                message: "Olá! Bem-vindo ao AURA! Bot\n\nSou seu assistente virtual e estou aqui para ajudar você.",
                customId: "#1",
            },
            draggable: true,
        },
        {
            id: "main-options",
            type: "options",
            position: { x: 250, y: 320 },
            data: {
                label: "Menu Principal",
                message: "Como posso ajudar você hoje?",
                options: [
                    { id: "opt1", text: "Informações sobre produtos" },
                    { id: "opt2", text: "Suporte técnico" },
                    { id: "opt3", text: "Falar com atendente" },
                ],
                customId: "#2",
            },
            draggable: true,
        },
        {
            id: "info-produtos",
            type: "sendMessage",
            position: { x: 50, y: 480 },
            data: {
                label: "Informações Produtos",
                message:
                    "Nossos produtos incluem:\n\n• Soluções de IA\n• Chatbots inteligentes\n• Automação de processos\n• Integração com sistemas",
                customId: "#3",
            },
            draggable: true,
        },
        {
            id: "suporte-tecnico",
            type: "sendMessage",
            position: { x: 250, y: 480 },
            data: {
                label: "Suporte Técnico",
                message:
                    "Ferramenta Para suporte técnico:\n\n• Acesse nossa documentação\n• Envie um email para suporte@aura.com\n• Ou continue conversando comigo!",
                customId: "#4",
            },
            draggable: true,
        },
        {
            id: "atendente",
            type: "finalizar",
            position: { x: 450, y: 480 },
            data: {
                label: "Transferir Atendente",
                message:
                    "Equipe‍Negócios Transferindo você para um atendente humano...\n\nAguarde um momento que alguém da nossa equipe entrará em contato!",
                customId: "#5",
            },
            draggable: true,
        },
        {
            id: "finalizar-info",
            type: "finalizar",
            position: { x: 50, y: 600 },
            data: {
                label: "Finalizar Informações",
                message:
                    "Espero que estas informações sobre nossos produtos tenham sido úteis! Posso ajudar com mais alguma coisa?",
                customId: "#6",
            },
            draggable: true,
        },
        {
            id: "finalizar-suporte",
            type: "finalizar",
            position: { x: 250, y: 600 },
            data: {
                label: "Finalizar Suporte",
                message: "Espero ter ajudado com suas dúvidas técnicas! Se precisar de mais suporte, estamos à disposição.",
                customId: "#7",
            },
            draggable: true,
        },
    ]

    const defaultEdges = [
        {
            id: "start-to-welcome",
            source: "start-node",
            target: "welcome-message",
            type: "custom",
        },
        {
            id: "welcome-to-options",
            source: "welcome-message",
            target: "main-options",
            type: "custom",
        },
        {
            id: "option1-to-info",
            source: "main-options",
            sourceHandle: "output-0",
            target: "info-produtos",
            type: "custom",
        },
        {
            id: "option2-to-suporte",
            source: "main-options",
            sourceHandle: "output-1",
            target: "suporte-tecnico",
            type: "custom",
        },
        {
            id: "option3-to-atendente",
            source: "main-options",
            sourceHandle: "output-2",
            target: "atendente",
            type: "custom",
        },
        {
            id: "info-to-finalizar",
            source: "info-produtos",
            target: "finalizar-info",
            type: "custom",
        },
        {
            id: "suporte-to-finalizar",
            source: "suporte-tecnico",
            target: "finalizar-suporte",
            type: "custom",
        },
    ]

    return {
        nodes: defaultNodes,
        edges: defaultEdges,
        nodeCounters: {
            sendMessage: 3,
            options: 1,
            finalizar: 3,
        },
    }
}

const createEmptyWorkflow = () => {
    const emptyNodes = [
        {
            id: "start-node",
            type: "start",
            position: { x: 250, y: 100 },
            data: {
                label: "INÍCIO",
                description: "Ponto de início do fluxo",
            },
            deletable: false,
            draggable: true,
        },
    ]

    return {
        nodes: emptyNodes,
        edges: [],
        nodeCounters: {},
    }
}

const findConnectedNodes = (nodes: Node[], edges: Edge[], startNodeId: string): Set<string> => {
    const connected = new Set<string>()
    const queue = [startNodeId]
    connected.add(startNodeId)

    while (queue.length > 0) {
        const currentId = queue.shift()!
        const outgoingEdges = edges.filter((edge) => edge.source === currentId)

        for (const edge of outgoingEdges) {
            if (!connected.has(edge.target)) {
                connected.add(edge.target)
                queue.push(edge.target)
            }
        }
    }

    return connected
}

const findUnconnectedHandles = (nodes: Node[], edges: Edge[]): string[] => {
    const unconnected: string[] = []
    const existingNodes = nodes.filter((node) => node && node.id && node.data)

    existingNodes.forEach((node) => {
        if (node.type !== "finalizar" && node.type !== "agentes") {
            const hasOutgoingConnection = edges.some((edge) => edge.source === node.id)
            if (!hasOutgoingConnection) {
                unconnected.push(`${node.data.customId || node.data.label} (saída verde sem conexão)`)
            }
        }

        if (node.type !== "start") {
            const hasIncomingConnection = edges.some((edge) => edge.target === node.id)
            if (!hasIncomingConnection) {
                unconnected.push(`${node.data.customId || node.data.label} (entrada amarela sem conexão)`)
            }
        }

        if (node.type === "options") {
            const options = node.data.options || []
            const outgoingConnections = edges.filter((edge) => edge.source === node.id)

            if (outgoingConnections.length < options.length) {
                unconnected.push(
                    `${node.data.customId || node.data.label} (${options.length - outgoingConnections.length} opções verdes sem conexão)`,
                )
            }
        }
    })

    return unconnected
}

interface WorkflowBuilderProps {
    onActionsReady: (actions: any) => void
    onStartPositionChange?: (position: { x: number; y: number }) => void
    onMousePositionChange?: (position: { x: number; y: number }) => void
    onComponentCountChange?: (count: number) => void
    onNodesChange?: (nodes: any[]) => void
    onEdgesChange?: (edges: any[]) => void
    showSidebar?: boolean
    onToggleSidebar?: () => void
    onOpenBot?: () => void
}

function WorkflowBuilderInner({
                                  onActionsReady,
                                  onStartPositionChange,
                                  onMousePositionChange,
                                  onComponentCountChange,
                                  onNodesChange,
                                  onEdgesChange,
                                  showSidebar = true,
                                  onToggleSidebar,
                                  onOpenBot,
                              }: WorkflowBuilderProps) {
    const { theme, currentGradient } = useTheme()
    const reactFlowWrapper = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [nodes, setNodes, onNodesChangeInternal] = useNodesState([])
    const [edges, setEdges, onEdgesChangeInternal] = useEdgesState([])
    const [selectedNode, setSelectedNode] = useState<Node | null>(null)
    const [reactFlowInstance, setReactFlowInstance] = useState<any>(null)
    const [nodeCounters, setNodeCounters] = useState<Record<string, number>>({})
    const { user } = useAuth()
    const [showValidationDialog, setShowValidationDialog] = useState(false)
    const [showSuccessDialog, setShowSuccessDialog] = useState(false)
    const [showErrorDialog, setShowErrorDialog] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [disconnectedNodes, setDisconnectedNodes] = useState<string[]>([])
    const { zoomIn, zoomOut, fitView, setCenter } = useReactFlow()

    // Garantir persistência do localStorage
    const WORKFLOW_KEY = "workflow"
    const EXECUTED_KEY = "executedFlow"

    // Carregar fluxo salvo ou criar padrão
    useEffect(() => {
        const loadSavedWorkflow = () => {
            try {
                const savedWorkflow = localStorage.getItem(WORKFLOW_KEY)
                if (savedWorkflow) {
                    const workflow = JSON.parse(savedWorkflow)
                    setNodes(workflow.nodes || [])
                    setEdges(workflow.edges || [])
                    setNodeCounters(workflow.nodeCounters || {})

                    toast({
                        title: "[OK] Fluxo carregado",
                        description: "Fluxo salvo anteriormente foi restaurado",
                    })
                    return
                }
            } catch (error) {
                console.error("Erro ao carregar fluxo salvo:", error)
            }

            // Se não há fluxo salvo, criar o padrão
            const defaultWorkflow = createDefaultWorkflow()
            setNodes(defaultWorkflow.nodes)
            setEdges(defaultWorkflow.edges)
            setNodeCounters(defaultWorkflow.nodeCounters)

            // Salvar o fluxo padrão
            localStorage.setItem(WORKFLOW_KEY, JSON.stringify(defaultWorkflow))
            localStorage.setItem(EXECUTED_KEY, "true")

            toast({
                title: "Iniciar Fluxo padrão carregado",
                description: "Um fluxo de demonstração foi criado e está pronto para uso!",
            })
        }

        loadSavedWorkflow()
    }, [setNodes, setEdges])

    // Notificar mudanças nos nodes e edges para o componente pai
    useEffect(() => {
        if (onNodesChange) {
            onNodesChange(nodes)
        }
    }, [nodes, onNodesChange])

    useEffect(() => {
        if (onEdgesChange) {
            onEdgesChange(edges)
        }
    }, [edges, onEdgesChange])

    useEffect(() => {
        const startNode = nodes.find((node) => node.id === "start-node")
        if (startNode && onStartPositionChange) {
            onStartPositionChange(startNode.position)
        }

        if (onComponentCountChange) {
            onComponentCountChange(nodes.length)
        }
    }, [nodes, onStartPositionChange, onComponentCountChange])

    const handleMouseMove = useCallback(
        (event: React.MouseEvent) => {
            if (reactFlowInstance && onMousePositionChange) {
                const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect()
                if (reactFlowBounds) {
                    const position = reactFlowInstance.screenToFlowPosition({
                        x: event.clientX - reactFlowBounds.left,
                        y: event.clientY - reactFlowBounds.top,
                    })
                    onMousePositionChange(position)
                }
            }
        },
        [reactFlowInstance, onMousePositionChange],
    )

    const removeNode = useCallback(
        (nodeId: string) => {
            if (nodeId === "start-node") {
                toast({
                    title: "Não é possível remover",
                    description: "O nó INÍCIO não pode ser removido",
                    variant: "destructive",
                })
                return
            }

            setNodes((nds) => nds.filter((node) => node.id !== nodeId))
            setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId))
            setSelectedNode(null)

            toast({
                title: "Nó removido",
                description: "O nó foi removido com sucesso",
            })
        },
        [setNodes, setEdges],
    )

    const updateNodeData = useCallback(
        (nodeId: string, data: any) => {
            setNodes((nds) =>
                nds.map((node) => {
                    if (node.id === nodeId) {
                        return {
                            ...node,
                            data: {
                                ...node.data,
                                ...data,
                            },
                        }
                    }
                    return node
                }),
            )
        },
        [setNodes],
    )

    removeNodeById = removeNode
    updateNodeDataById = updateNodeData

    const onConnect = useCallback(
        (params: Edge | Connection) => {
            if (params.source === params.target) {
                toast({
                    title: "ERRO: Auto-conexão não permitida",
                    description: "Um nó não pode se conectar consigo mesmo",
                    variant: "destructive",
                })
                return
            }

            setEdges((currentEdges) => {
                const sourceOccupied = currentEdges.some(
                    (edge) => edge.source === params.source && edge.sourceHandle === params.sourceHandle,
                )

                const targetOccupied = currentEdges.some(
                    (edge) => edge.target === params.target && edge.targetHandle === params.targetHandle,
                )

                if (targetOccupied) {
                    toast({
                        title: "ERRO: Entrada já ocupada",
                        description: "Esta entrada amarela já possui uma conexão. Remova a conexão existente primeiro.",
                        variant: "destructive",
                    })
                    return currentEdges
                }

                const filteredEdges = currentEdges.filter(
                    (edge) => !(edge.source === params.source && edge.sourceHandle === params.sourceHandle),
                )

                const newEdges = addEdge({ ...params, type: "custom" }, filteredEdges)

                if (sourceOccupied) {
                    toast({
                        title: "Atualizando Saída substituída",
                        description: "A conexão anterior da saída verde foi removida e uma nova foi criada",
                    })
                } else {
                    toast({
                        title: "[OK] Conexão criada",
                        description: "Nova conexão estabelecida com sucesso",
                    })
                }

                return newEdges
            })
        },
        [setEdges],
    )

    const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = "move"
    }, [])

    const generateSimpleId = useCallback(
        (type: string) => {
            setNodeCounters((prev) => {
                const newCount = (prev[type] || 0) + 1
                return { ...prev, [type]: newCount }
            })
            const currentCount = (nodeCounters[type] || 0) + 1
            return `#${currentCount}`
        },
        [nodeCounters],
    )

    const onDrop = useCallback(
        (event: React.DragEvent<HTMLDivElement>) => {
            event.preventDefault()

            const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect()
            const type = event.dataTransfer.getData("application/reactflow")

            if (typeof type === "undefined" || !type || type === "start") {
                return
            }

            if (reactFlowBounds && reactFlowInstance) {
                const position = reactFlowInstance.screenToFlowPosition({
                    x: event.clientX - reactFlowBounds.left,
                    y: event.clientY - reactFlowBounds.top,
                })

                const newNode = createNode({
                    type,
                    position,
                    id: generateNodeId(type),
                })

                const simpleId = generateSimpleId(type)
                newNode.data = {
                    ...newNode.data,
                    customId: simpleId,
                }

                setNodes((nds) => nds.concat(newNode))
            }
        },
        [reactFlowInstance, setNodes, generateSimpleId],
    )

    const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
        if (node.id === "start-node") {
            return
        }
        // Only open config panel for agendamento and finalizar nodes
        if (node.type === "agendamento" || node.type === "finalizar" || node.type === "agentes") {
            setSelectedNode(node)
        }
    }, [])

    const onNodeDoubleClick = useCallback(
        (event: React.MouseEvent, node: Node) => {
            event.preventDefault()
            event.stopPropagation()

            // Only open modal on double-click for agendamento and finalizar only
            if (node.type === "agendamento" || node.type === "finalizar" || node.type === "agentes") {
                setSelectedNode(node)
            }
        },
        [setSelectedNode],
    )

    const onPaneClick = useCallback(() => {
        setSelectedNode(null)
    }, [])

    const searchNodeById = useCallback(
        (searchId: string) => {
            const foundNode = nodes.find(
                (node) =>
                    node.data.customId?.toLowerCase().includes(searchId.toLowerCase()) ||
                    node.data.label?.toLowerCase().includes(searchId.toLowerCase()) ||
                    node.id.toLowerCase().includes(searchId.toLowerCase()),
            )

            if (foundNode) {
                setCenter(foundNode.position.x + 75, foundNode.position.y + 50, { zoom: 1.5, duration: 800 })
                setSelectedNode(foundNode)

                toast({
                    title: "Nó encontrado!",
                    description: `Navegando para o nó: ${foundNode.data.label || foundNode.data.customId}`,
                })
            } else {
                toast({
                    title: "Nó não encontrado",
                    description: "Nenhum nó foi encontrado com esse ID",
                    variant: "destructive",
                })
            }
        },
        [nodes, setCenter],
    )

    const validateConnectivity = useCallback(() => {
        const startNode = nodes.find((node) => node.id === "start-node")
        if (!startNode) return { isValid: false, disconnected: ["Nó INÍCIO não encontrado"] }

        const startHasOutgoingConnection = edges.some((edge) => edge.source === "start-node")
        if (nodes.length > 1 && !startHasOutgoingConnection) {
            return {
                isValid: false,
                disconnected: ["INÍCIO (deve estar conectado a pelo menos um componente)"],
            }
        }

        const emptyMessageNodes: string[] = []

        nodes.forEach((node) => {
            if (node.type === "sendMessage") {
                const message = node.data.message || ""
                if (!message.trim()) {
                    emptyMessageNodes.push(`${node.data.customId || node.id} (Enviar Mensagem sem texto)`)
                }
            }

            if (node.type === "options") {
                const message = node.data.message || ""
                const options = node.data.options || []

                if (!message.trim()) {
                    emptyMessageNodes.push(`${node.data.customId || node.id} (Opções sem mensagem)`)
                }

                options.forEach((option: any, index: number) => {
                    if (!option.text || !option.text.trim()) {
                        emptyMessageNodes.push(`${node.data.customId || node.id} (Opção ${index + 1} sem texto)`)
                    }
                })
            }
        })

        if (emptyMessageNodes.length > 0) {
            return {
                isValid: false,
                disconnected: emptyMessageNodes,
            }
        }

        const connectedNodes = findConnectedNodes(nodes, edges, "start-node")
        const allNodeIds = nodes.map((node) => node.id)
        const disconnectedFromStart = allNodeIds.filter((id) => !connectedNodes.has(id))
        const unconnectedHandles = findUnconnectedHandles(nodes, edges)

        const allDisconnected = [
            ...disconnectedFromStart
                .filter((id) => id !== "start-node")
                .map((id) => {
                    const node = nodes.find((n) => n.id === id)
                    return `${node?.data.customId || node?.data.label || id} (não conectado ao INÍCIO)`
                }),
            ...unconnectedHandles,
        ]

        return {
            isValid: allDisconnected.length === 0,
            disconnected: allDisconnected,
        }
    }, [nodes, edges])

    const saveWorkflowToBackend = useCallback(async (workflowData: any) => {
        try {
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

            const response = await fetch(`${API_BASE_URL}/api/bot/workflows`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(workflowData),
            })

            if (response.ok) {
                const result = await response.json()
                console.log("[OK] Workflow salvo no backend Python:", result)
                return true
            } else {
                const error = await response.json()
                console.error("ERRO: Erro ao salvar workflow no backend:", error)
                return false
            }
        } catch (error) {
            console.error("ERRO: Erro na requisição de salvamento:", error)
            return false
        }
    }, [])

    const executeWorkflow = useCallback(async () => {
        if (nodes.length <= 1) {
            toast({
                title: "Nada para executar",
                description: "Adicione alguns nós ao seu fluxo primeiro",
                variant: "destructive",
            })
            return false
        }

        const validation = validateConnectivity()
        if (!validation.isValid) {
            setDisconnectedNodes(validation.disconnected)
            setShowValidationDialog(true)
            return false
        }

        toast({
            title: "Executando workflow...",
            description: "Salvando e ativando o fluxo no backend",
        })

        const workflow = { nodes, edges, nodeCounters }
        const workflowString = JSON.stringify(workflow)
        localStorage.setItem(WORKFLOW_KEY, workflowString)
        localStorage.setItem(EXECUTED_KEY, "true")

        const userNickname = user?.username === "Dev@1" ? "Lucas" : user?.username || "Usuario"

        const workflowId = `aura_flow_${Date.now()}`

        const workflowData = {
            _id: workflowId,
            _tag: "Fluxo Aura",
            _insertedUser: userNickname,
            _insertedAt: new Date().toISOString(),
            _enabled: true,
            flowData: {
                nodes,
                edges,
                nodeCounters,
            },
        }

        try {
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

            const response = await fetch(`${API_BASE_URL}/api/bot/workflows`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(workflowData),
            })

            if (!response.ok) {
                const errorText = await response.text()
                console.error("ERRO: Erro ao salvar workflow:", errorText)
                toast({
                    title: "ERRO: Erro ao salvar",
                    description: "Não foi possível salvar o workflow no backend",
                    variant: "destructive",
                })
                return false
            }

            const result = await response.json()

            toast({
                title: "[OK] Fluxo executado com sucesso!",
                description: "Workflow salvo e ativado - bot Aura está pronto para receber mensagens!",
            })

            window.dispatchEvent(new Event("storage"))

            return true
        } catch (error) {
            console.error("ERRO: Erro ao executar workflow:", error)
            toast({
                title: "ERRO: Erro na execução",
                description: "Ocorreu um erro ao executar o workflow",
                variant: "destructive",
            })
            return false
        }
    }, [nodes, edges, nodeCounters, validateConnectivity, user])

    const activateWorkflowOnBackend = useCallback(async (workflowData: any) => {
        try {
            const response = await fetch("/api/bot/workflow/activate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    workflow_id: workflowData._id,
                    enabled: true,
                }),
            })

            if (response.ok) {
                const result = await response.json()
                console.log("[OK] Workflow ativado no backend Python:", result)
                return true
            } else {
                const error = await response.json()
                console.error("ERRO: Erro ao ativar workflow no backend:", error)
                return false
            }
        } catch (error) {
            console.error("ERRO: Erro na requisição de ativação:", error)
            return false
        }
    }, [])

    const saveWorkflow = useCallback(() => {
        if (nodes.length <= 1) {
            toast({
                title: "ERRO: Fluxo vazio",
                description: "Adicione pelo menos um componente ao seu fluxo antes de salvar",
                variant: "destructive",
            })
            return
        }

        const validation = validateConnectivity()

        if (!validation.isValid) {
            setDisconnectedNodes(validation.disconnected)
            setShowValidationDialog(true)
            return
        }

        const workflow = { nodes, edges, nodeCounters }
        const workflowString = JSON.stringify(workflow)
        localStorage.setItem(WORKFLOW_KEY, workflowString)

        const userNickname = user?.username === "Dev@1" ? "Lucas" : user?.username || "Usuario"
        const workflowData = {
            _id: `aura_flow_${Date.now()}`,
            _tag: "Fluxo Aura",
            _insertedUser: userNickname,
            _insertedAt: new Date().toISOString(),
            _enabled: true,
            flowData: {
                nodes,
                edges,
                nodeCounters,
            },
        }

        saveWorkflowToBackend(workflowData)

        localStorage.removeItem(EXECUTED_KEY)
        window.dispatchEvent(new Event("storage"))

        setShowSuccessDialog(true)

        toast({
            title: "[OK] Fluxo salvo com sucesso!",
            description: `${nodes.length} componentes salvos e prontos para execução`,
        })
    }, [nodes, edges, nodeCounters, validateConnectivity, user, saveWorkflowToBackend])

    const loadWorkflow = useCallback(() => {
        fileInputRef.current?.click()
    }, [])

    const handleFileUpload = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0]
            if (!file) return

            const reader = new FileReader()
            reader.onload = (e) => {
                try {
                    const jsonContent = e.target?.result as string

                    if (!jsonContent || jsonContent.trim() === "") {
                        throw new Error("Arquivo vazio ou não é um arquivo de texto válido")
                    }

                    let workflowData
                    try {
                        workflowData = JSON.parse(jsonContent)
                    } catch (parseError) {
                        throw new Error("Arquivo não é um JSON válido - verifique a sintaxe")
                    }

                    if (!workflowData || typeof workflowData !== "object") {
                        throw new Error("Arquivo JSON não contém dados válidos")
                    }

                    if (!workflowData.flowData || !workflowData._id) {
                        throw new Error("Formato de arquivo inválido - não é um fluxo Aura válido")
                    }

                    const { nodes: loadedNodes, edges: loadedEdges, nodeCounters: loadedCounters } = workflowData.flowData

                    if (!Array.isArray(loadedNodes)) {
                        throw new Error("Dados de nós corrompidos - estrutura inválida")
                    }

                    if (!Array.isArray(loadedEdges)) {
                        throw new Error("Dados de conexões corrompidos - estrutura inválida")
                    }

                    for (let i = 0; i < loadedNodes.length; i++) {
                        const node = loadedNodes[i]
                        if (!node.id || !node.type || !node.position || !node.data) {
                            throw new Error(`Nó ${i + 1} tem estrutura inválida - faltam propriedades obrigatórias`)
                        }
                    }

                    const hasStartNode = loadedNodes.some((node: Node) => node.id === "start-node")
                    if (!hasStartNode) {
                        const startNode = {
                            id: "start-node",
                            type: "start",
                            position: { x: 250, y: 100 },
                            data: {
                                label: "INÍCIO",
                                description: "Ponto de início do fluxo",
                            },
                            deletable: false,
                            draggable: true,
                        }
                        loadedNodes.unshift(startNode)
                    }

                    setNodes(loadedNodes)
                    setEdges(loadedEdges)
                    setNodeCounters(loadedCounters || {})

                    const workflow = { nodes: loadedNodes, edges: loadedEdges, nodeCounters: loadedCounters || {} }
                    localStorage.setItem(WORKFLOW_KEY, JSON.stringify(workflow))

                    localStorage.removeItem(EXECUTED_KEY)
                    window.dispatchEvent(new Event("storage"))

                    toast({
                        title: "[OK] Fluxo carregado com sucesso!",
                        description: `${loadedNodes.length} componentes carregados - clique em Salvar e depois Executar`,
                    })

                    setTimeout(() => {
                        fitView()
                    }, 100)
                } catch (error) {
                    const errorMsg = error instanceof Error ? error.message : "Arquivo JSON inválido ou corrompido"
                    setErrorMessage(errorMsg)
                    setShowErrorDialog(true)
                }
            }

            reader.onerror = () => {
                setErrorMessage("Erro ao ler o arquivo - arquivo pode estar corrompido")
                setShowErrorDialog(true)
            }

            reader.readAsText(file)
            event.target.value = ""
        },
        [setNodes, setEdges, fitView],
    )

    const resetWorkflow = useCallback(() => {
        const emptyWorkflow = createEmptyWorkflow()
        setNodes(emptyWorkflow.nodes)
        setEdges(emptyWorkflow.edges)
        setNodeCounters(emptyWorkflow.nodeCounters)
        setSelectedNode(null)

        localStorage.setItem(WORKFLOW_KEY, JSON.stringify(emptyWorkflow))
        localStorage.removeItem(EXECUTED_KEY)
        window.dispatchEvent(new Event("storage"))

        toast({
            title: "Limpar Fluxo resetado",
            description: "Todos os componentes foram removidos. Apenas o nó INÍCIO permanece.",
        })
    }, [setNodes, setEdges])

    const downloadWorkflow = useCallback(() => {
        if (nodes.length <= 1) {
            toast({
                title: "ERRO: Fluxo vazio",
                description: "Adicione pelo menos um componente antes de fazer download",
                variant: "destructive",
            })
            return
        }

        const validation = validateConnectivity()

        if (!validation.isValid) {
            setDisconnectedNodes(validation.disconnected)
            setShowValidationDialog(true)
            return
        }

        try {
            const cleanNodes = nodes.map((node) => ({
                id: node.id,
                type: node.type,
                position: node.position,
                data: {
                    ...node.data,
                    description: undefined,
                    label: node.data.label === "Node" ? undefined : node.data.label,
                },
                deletable: node.deletable,
                draggable: node.draggable,
            }))

            const cleanEdges = edges.map((edge) => ({
                id: edge.id,
                source: edge.source,
                target: edge.target,
                sourceHandle: edge.sourceHandle,
                targetHandle: edge.targetHandle,
                type: edge.type,
            }))

            const userNickname = user?.username === "Dev@1" ? "Lucas" : user?.username || "Lucas"

            const workflowData = {
                _id: `aura_flow_${Date.now()}`,
                _tag: "Fluxo Aura",
                _insertedUser: userNickname,
                _insertedAt: new Date().toISOString(),
                _enabled: true,
                flowData: {
                    nodes: cleanNodes,
                    edges: cleanEdges,
                    nodeCounters,
                },
                summary: {
                    totalNodes: nodes.length,
                    totalEdges: edges.length,
                    nodeTypes: [...new Set(nodes.map((node) => node.type))],
                    createdAt: new Date().toISOString(),
                },
            }

            const jsonString = JSON.stringify(workflowData, null, 2)
            const blob = new Blob([jsonString], { type: "application/json" })
            const url = URL.createObjectURL(blob)

            const link = document.createElement("a")
            link.href = url
            link.download = `aura_flow_${new Date().toISOString().split("T")[0]}.json`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)

            toast({
                title: "[OK] Download concluído!",
                description: `Arquivo JSON gerado com ${nodes.length} componentes`,
            })
        } catch (error) {
            toast({
                title: "ERRO: Erro no download",
                description: "Não foi possível gerar o arquivo JSON",
                variant: "destructive",
            })
        }
    }, [nodes, edges, nodeCounters, validateConnectivity, user])

    useEffect(() => {
        if (nodes.length > 0) {
            const workflow = { nodes, edges, nodeCounters }
            localStorage.setItem(WORKFLOW_KEY, JSON.stringify(workflow))
        }
    }, [nodes, edges, nodeCounters])

    useEffect(() => {
        onActionsReady({
            zoomIn,
            zoomOut,
            fitView,
            save: saveWorkflow,
            load: loadWorkflow,
            execute: executeWorkflow,
            search: searchNodeById,
            removeNode,
            reset: resetWorkflow,
            download: downloadWorkflow,
        })
    }, [
        zoomIn,
        zoomOut,
        fitView,
        saveWorkflow,
        loadWorkflow,
        executeWorkflow,
        searchNodeById,
        removeNode,
        resetWorkflow,
        downloadWorkflow,
        onActionsReady,
    ])

    const isDark = theme === "dark"

    const getBackgroundProps = () => {
        return {
            color: isDark ? currentGradient.glow : "#4a5568",
            gap: 20,
            size: isDark ? 3 : 2,
            variant: BackgroundVariant.Dots,
            style: {
                filter: isDark
                    ? `drop-shadow(0 0 6px ${currentGradient.glow})
           drop-shadow(0 0 12px ${currentGradient.glow}80)
           drop-shadow(0 0 18px ${currentGradient.glow}40)`
                    : "none",
                opacity: isDark ? 0.8 : 1,
            },
        }
    }

    const getMiniMapProps = () => {
        return {
            nodeColor: (node: Node) => {
                if (isDark) {
                    switch (node.type) {
                        case "start":
                            return currentGradient.primary
                        case "sendMessage":
                            return "#3B82F6"
                        case "options":
                            return "#8B5CF6"
                        case "finalizar":
                            return "#EF4444"
                        case "agentes":
                            return "#F64F59"
                        default:
                            return currentGradient.secondary
                    }
                } else {
                    return "#9CA3AF"
                }
            },
            maskColor: isDark ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.8)",
            style: {
                backgroundColor: isDark ? "#111827" : "#F9FAFB",
                border: isDark ? `1px solid ${currentGradient.glow}40` : "1px solid #E5E7EB",
                borderRadius: "8px",
            },
        }
    }

    return (
        <div className="flex h-full">
            <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileUpload} style={{ display: "none" }} />

            {showSidebar && (
                <div
                    className={`w-64 border-r flex flex-col transition-all duration-300`}
                    style={{
                        height: "100%",
                        maxHeight: "100vh",
                        background: "transparent",
                        borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                    }}
                >
                    <div className="flex-shrink-0 px-4 pt-4 pb-2">
                        <div className="flex items-center justify-center mb-4">
                            <h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Componentes</h2>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 pb-4" style={{ minHeight: 0 }}>
                        <NodeLibrary />
                    </div>
                </div>
            )}

            <div className="flex-1 flex flex-col">
                <div className="flex-1" ref={reactFlowWrapper}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChangeInternal}
                        onEdgesChange={onEdgesChangeInternal}
                        onConnect={onConnect}
                        onInit={setReactFlowInstance}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        onNodeClick={onNodeClick}
                        onNodeDoubleClick={onNodeDoubleClick}
                        onPaneClick={onPaneClick}
                        onMouseMove={handleMouseMove}
                        nodeTypes={nodeTypes}
                        edgeTypes={edgeTypes}
                        fitView
                        snapToGrid
                        snapGrid={[15, 15]}
                        defaultEdgeOptions={{ type: "custom" }}
                        className={isDark ? "dark" : ""}
                        proOptions={{ hideAttribution: true }}
                    >
                        <Background {...getBackgroundProps()} />
                        <Controls showZoom={false} showFitView={false} showInteractive={false} />
                        <MiniMap {...getMiniMapProps()} />
                    </ReactFlow>
                </div>
            </div>

            {selectedNode && (
                <div
                    onClick={(e) => e.stopPropagation()}
                    className={`w-80 border-l p-4 flex flex-col ${isDark ? "bg-black border-gray-800" : "bg-white border-gray-200"} transition-all duration-300`}
                    style={{ height: "100%", maxHeight: "100vh", overflow: "hidden" }}
                >
                    <NodeConfigPanel
                        node={selectedNode as WorkflowNode}
                        updateNodeDataAction={updateNodeData}
                        onCloseAction={() => setSelectedNode(null)}
                        onRemoveAction={() => removeNode(selectedNode.id)}
                    />
                </div>
            )}

            {/* POPUP DE ERRO - JSON Inválido */}
            <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
                <DialogContent
                    className={`${isDark ? "bg-black border-red-700" : "bg-white border-red-200"} max-w-lg mx-auto rounded-xl`}
                >
                    <DialogHeader className="text-center">
                        <DialogTitle
                            className={`text-xl font-bold ${
                                isDark ? "text-white" : "text-gray-900"
                            } flex items-center justify-center gap-2`}
                        >
                            ERRO: Arquivo JSON Inválido
                        </DialogTitle>
                        <DialogDescription className={`${isDark ? "text-gray-300" : "text-gray-600"} mt-2 text-center`}>
                            <span className="text-red-500 font-bold text-lg">Não foi possível importar o arquivo!</span>
                            <br />
                            <span className="text-sm">Verifique se o arquivo é um fluxo Aura válido:</span>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4">
                        <div
                            className={`p-4 rounded-lg border ${
                                isDark ? "bg-red-900/20 border-red-700 text-red-300" : "bg-red-50 border-red-200 text-red-700"
                            }`}
                        >
                            <div className="flex items-start gap-2">
                                <span className="text-red-500 font-bold text-lg">AVISO:</span>
                                <div>
                                    <span className="font-medium block">Erro encontrado:</span>
                                    <span className="text-sm">{errorMessage}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-center mt-6">
                        <Button
                            onClick={() => setShowErrorDialog(false)}
                            className={`${
                                isDark
                                    ? "bg-red-800 hover:bg-red-700 text-white border-red-600"
                                    : "bg-red-100 hover:bg-red-200 text-red-900 border-red-300"
                            } font-semibold px-6`}
                        >
                            Entendi, vou corrigir!
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* POPUP DE VALIDAÇÃO - Componentes desconectados */}
            <Dialog open={showValidationDialog} onOpenChange={setShowValidationDialog}>
                <DialogContent
                    className={`${isDark ? "bg-black border-gray-700" : "bg-white border-gray-200"} max-w-lg mx-auto rounded-xl`}
                >
                    <DialogHeader className="text-center">
                        <DialogTitle
                            className={`text-xl font-bold ${
                                isDark ? "text-white" : "text-gray-900"
                            } flex items-center justify-center gap-2`}
                        >
                            AVISO: Componentes Desconectados
                        </DialogTitle>
                        <DialogDescription className={`${isDark ? "text-gray-300" : "text-gray-600"} mt-2 text-center`}>
                            <span className="text-red-500 font-bold text-lg">NADA pode ficar vazio ou desconectado!</span>
                            <br />
                            <span className="text-sm">Preencha todas as mensagens e conecte todos os componentes:</span>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 max-h-60 overflow-y-auto mt-4">
                        {disconnectedNodes.map((issue, index) => (
                            <div
                                key={index}
                                className={`p-3 rounded-lg border ${
                                    isDark ? "bg-red-900/20 border-red-700 text-red-300" : "bg-red-50 border-red-200 text-red-700"
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-red-500 font-bold">Link</span>
                                    <span className="font-medium">{issue}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-center mt-6">
                        <Button
                            onClick={() => setShowValidationDialog(false)}
                            className={`${
                                isDark
                                    ? "bg-gray-800 hover:bg-gray-700 text-white border-gray-600"
                                    : "bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300"
                            } font-semibold px-6`}
                        >
                            Entendi, vou conectar tudo!
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* POPUP DE SUCESSO - Fluxo salvo */}
            <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
                <DialogContent
                    className={`${isDark ? "bg-black border-gray-700" : "bg-white border-gray-200"} max-w-md mx-auto rounded-xl`}
                >
                    <DialogHeader className="text-center">
                        <DialogTitle
                            className={`text-2xl font-bold ${
                                isDark ? "text-white" : "text-gray-900"
                            } flex items-center justify-center gap-3`}
                        >
                            [OK] Fluxo Salvo!
                        </DialogTitle>
                        <DialogDescription className={`${isDark ? "text-gray-300" : "text-gray-600"} mt-3 text-center text-lg`}>
                            Sucesso: <strong>Parabéns!</strong> Seu fluxo foi salvo com sucesso!
                            <br />
                            <span className="text-sm mt-2 block">
                Relatório <strong>{nodes.length} componentes</strong> salvos no navegador
              </span>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-center mt-6">
                        <Button
                            onClick={() => setShowSuccessDialog(false)}
                            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-2"
                        >
                            Iniciar Perfeito!
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default function WorkflowBuilder(props: WorkflowBuilderProps) {
    return (
        <ReactFlowProvider>
            <WorkflowBuilderInner {...props} />
        </ReactFlowProvider>
    )
}
