"use client"

import type React from "react"
import { useState, useCallback, useRef, useEffect } from "react"
import ReactFlow, {
  ReactFlowProvider,
  Background,
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

// Função melhorada para verificar handles desconectados
const findUnconnectedHandles = (nodes: Node[], edges: Edge[]): string[] => {
  const unconnected: string[] = []

  // Filtrar apenas nós que realmente existem
  const existingNodes = nodes.filter((node) => node && node.id && node.data)

  existingNodes.forEach((node) => {
    // Verificar handles de saída (source) - exceto Finalizar
    if (node.type !== "finalizar") {
      const hasOutgoingConnection = edges.some((edge) => edge.source === node.id)
      if (!hasOutgoingConnection) {
        unconnected.push(`${node.data.customId || node.data.label} (saída verde sem conexão)`)
      }
    }

    // Verificar handles de entrada (target) - exceto START
    if (node.type !== "start") {
      const hasIncomingConnection = edges.some((edge) => edge.target === node.id)
      if (!hasIncomingConnection) {
        unconnected.push(`${node.data.customId || node.data.label} (entrada amarela sem conexão)`)
      }
    }

    // Verificar múltiplas saídas do nó Options
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
  showSidebar?: boolean
  onToggleSidebar?: () => void
}

function WorkflowBuilderInner({
  onActionsReady,
  onStartPositionChange,
  onMousePositionChange,
  onComponentCountChange,
  showSidebar = true,
  onToggleSidebar,
}: WorkflowBuilderProps) {
  const { theme, currentGradient } = useTheme()
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
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

  useEffect(() => {
    if (nodes.length === 0) {
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
      setNodes([startNode])
    }
  }, [nodes.length, setNodes])

  // Atualizar posição do START e contador de componentes
  useEffect(() => {
    const startNode = nodes.find((node) => node.id === "start-node")
    if (startNode && onStartPositionChange) {
      onStartPositionChange(startNode.position)
    }

    if (onComponentCountChange) {
      onComponentCountChange(nodes.length)
    }
  }, [nodes, onStartPositionChange, onComponentCountChange])

  // Capturar movimento do mouse no ReactFlow
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

      // Remover nó e todas as suas conexões
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

  // Lógica de conexão CORRIGIDA - impedir auto-conexões e garantir 1:1 REAL
  const onConnect = useCallback(
    (params: Edge | Connection) => {
      // VALIDAÇÃO 1: Impedir auto-conexão (nó conectando consigo mesmo)
      if (params.source === params.target) {
        toast({
          title: "❌ Auto-conexão não permitida",
          description: "Um nó não pode se conectar consigo mesmo",
          variant: "destructive",
        })
        return
      }

      // VALIDAÇÃO 2: Lógica 1:1 COMPLETA - saídas E entradas só podem ter UMA conexão
      setEdges((currentEdges) => {
        // Verificar se a SAÍDA VERDE já está ocupada
        const sourceOccupied = currentEdges.some(
          (edge) => edge.source === params.source && edge.sourceHandle === params.sourceHandle,
        )

        // Verificar se a ENTRADA AMARELA já está ocupada
        const targetOccupied = currentEdges.some(
          (edge) => edge.target === params.target && edge.targetHandle === params.targetHandle,
        )

        // Se ENTRADA AMARELA já está ocupada, BLOQUEAR completamente
        if (targetOccupied) {
          toast({
            title: "❌ Entrada já ocupada",
            description: "Esta entrada amarela já possui uma conexão. Remova a conexão existente primeiro.",
            variant: "destructive",
          })
          return currentEdges // Não fazer nada, manter edges atuais
        }

        // Remover conexão existente da SAÍDA VERDE (se houver)
        const filteredEdges = currentEdges.filter(
          (edge) => !(edge.source === params.source && edge.sourceHandle === params.sourceHandle),
        )

        // Adicionar a nova conexão
        const newEdges = addEdge({ ...params, type: "custom" }, filteredEdges)

        // Toast informativo
        if (sourceOccupied) {
          toast({
            title: "🔄 Saída substituída",
            description: "A conexão anterior da saída verde foi removida e uma nova foi criada",
          })
        } else {
          toast({
            title: "✅ Conexão criada",
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
    // START não pode ser configurado
    if (node.id === "start-node") {
      return
    }
    setSelectedNode(node)
  }, [])

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

    // Verificar se START tem pelo menos uma conexão de saída (não pode estar sozinho)
    const startHasOutgoingConnection = edges.some((edge) => edge.source === "start-node")
    if (nodes.length > 1 && !startHasOutgoingConnection) {
      return {
        isValid: false,
        disconnected: ["INÍCIO (deve estar conectado a pelo menos um componente)"],
      }
    }

    // NOVA VALIDAÇÃO: Verificar se nós de mensagem têm conteúdo
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

        // Verificar se todas as opções têm texto
        options.forEach((option: any, index: number) => {
          if (!option.text || !option.text.trim()) {
            emptyMessageNodes.push(`${node.data.customId || node.id} (Opção ${index + 1} sem texto)`)
          }
        })
      }
    })

    // Se há nós vazios, retornar erro
    if (emptyMessageNodes.length > 0) {
      return {
        isValid: false,
        disconnected: emptyMessageNodes,
      }
    }

    // Verificar conectividade geral
    const connectedNodes = findConnectedNodes(nodes, edges, "start-node")
    const allNodeIds = nodes.map((node) => node.id)
    const disconnectedFromStart = allNodeIds.filter((id) => !connectedNodes.has(id))

    // Verificar handles desconectados (apenas nós existentes)
    const unconnectedHandles = findUnconnectedHandles(nodes, edges)

    const allDisconnected = [
      ...disconnectedFromStart
        .filter((id) => id !== "start-node") // Excluir START da lista
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

  const saveWorkflow = useCallback(() => {
    // CASO 1: Só tem o INÍCIO
    if (nodes.length <= 1) {
      toast({
        title: "❌ Fluxo vazio",
        description: "Adicione pelo menos um componente ao seu fluxo antes de salvar",
        variant: "destructive",
      })
      return
    }

    const validation = validateConnectivity()

    // CASO 2: Tem componentes mas estão desconectados
    if (!validation.isValid) {
      setDisconnectedNodes(validation.disconnected)
      setShowValidationDialog(true)
      return
    }

    // CASO 3: Tudo conectado - SALVAR COM SUCESSO
    const workflow = { nodes, edges, nodeCounters }
    const workflowString = JSON.stringify(workflow)
    localStorage.setItem("workflow", workflowString)

    // Mostrar popup de sucesso
    setShowSuccessDialog(true)

    // Toast também
    toast({
      title: "✅ Fluxo salvo com sucesso!",
      description: `${nodes.length} componentes salvos no navegador`,
    })
  }, [nodes, edges, nodeCounters, validateConnectivity])

  const loadWorkflow = useCallback(() => {
    // Trigger file input
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

          // Verificar se o conteúdo não está vazio
          if (!jsonContent || jsonContent.trim() === "") {
            throw new Error("Arquivo vazio ou não é um arquivo de texto válido")
          }

          let workflowData
          try {
            workflowData = JSON.parse(jsonContent)
          } catch (parseError) {
            throw new Error("Arquivo não é um JSON válido - verifique a sintaxe")
          }

          // Verificar se é um JSON válido do nosso formato
          if (!workflowData || typeof workflowData !== "object") {
            throw new Error("Arquivo JSON não contém dados válidos")
          }

          if (!workflowData.flowData || !workflowData._id) {
            throw new Error("Formato de arquivo inválido - não é um fluxo Aura válido")
          }

          const { nodes: loadedNodes, edges: loadedEdges, nodeCounters: loadedCounters } = workflowData.flowData

          // Verificar se os dados são válidos
          if (!Array.isArray(loadedNodes)) {
            throw new Error("Dados de nós corrompidos - estrutura inválida")
          }

          if (!Array.isArray(loadedEdges)) {
            throw new Error("Dados de conexões corrompidos - estrutura inválida")
          }

          // Verificar se os nós têm estrutura mínima válida
          for (let i = 0; i < loadedNodes.length; i++) {
            const node = loadedNodes[i]
            if (!node.id || !node.type || !node.position || !node.data) {
              throw new Error(`Nó ${i + 1} tem estrutura inválida - faltam propriedades obrigatórias`)
            }
          }

          // Garantir que existe o nó START
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

          toast({
            title: "✅ Fluxo carregado com sucesso!",
            description: `${loadedNodes.length} componentes carregados do arquivo JSON`,
          })

          // Ajustar visualização
          setTimeout(() => {
            fitView()
          }, 100)
        } catch (error) {
          // REMOVER COMPLETAMENTE O LOG DO CONSOLE
          // console.error("Erro detalhado ao carregar arquivo:", error)

          // Mostrar popup de erro detalhado SEM logs no console
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
      // Limpar input para permitir recarregar o mesmo arquivo
      event.target.value = ""
    },
    [setNodes, setEdges, fitView],
  )

  const executeWorkflow = useCallback(() => {
    if (nodes.length <= 1) {
      toast({
        title: "Nada para executar",
        description: "Adicione alguns nós ao seu fluxo primeiro",
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

    toast({
      title: "Executando fluxo",
      description: "Seu fluxo está sendo executado (simulação apenas neste MVP)",
    })

    setTimeout(() => {
      toast({
        title: "Fluxo executado",
        description: "Seu fluxo foi executado com sucesso",
      })
    }, 2000)
  }, [nodes, validateConnectivity])

  const resetWorkflow = useCallback(() => {
    // Manter apenas o nó START
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

    setNodes([startNode])
    setEdges([])
    setNodeCounters({})
    setSelectedNode(null)

    toast({
      title: "Fluxo resetado",
      description: "Todos os componentes foram removidos, mantendo apenas o nó INÍCIO",
    })
  }, [setNodes, setEdges])

  const downloadWorkflow = useCallback(() => {
    // CASO 1: Só tem o INÍCIO
    if (nodes.length <= 1) {
      toast({
        title: "❌ Fluxo vazio",
        description: "Adicione pelo menos um componente antes de fazer download",
        variant: "destructive",
      })
      return
    }

    const validation = validateConnectivity()

    // CASO 2: Tem componentes mas estão desconectados OU sem conteúdo
    if (!validation.isValid) {
      setDisconnectedNodes(validation.disconnected)
      setShowValidationDialog(true)
      return
    }

    // CASO 3: Tudo conectado e preenchido - FAZER DOWNLOAD
    try {
      // Limpar dados dos nós - remover campos desnecessários
      const cleanNodes = nodes.map((node) => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: {
          ...node.data,
          // Remover campos desnecessários
          description: undefined,
          label: node.data.label === "Node" ? undefined : node.data.label,
        },
        deletable: node.deletable,
        draggable: node.draggable,
      }))

      // Limpar edges
      const cleanEdges = edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        type: edge.type,
      }))

      // Obter apelido do usuário logado
      const userNickname = user?.username === "Dev@1" ? "Lucas" : user?.username || "Usuario"

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
        title: "✅ Download concluído!",
        description: `Arquivo JSON gerado com ${nodes.length} componentes`,
      })
    } catch (error) {
      toast({
        title: "❌ Erro no download",
        description: "Não foi possível gerar o arquivo JSON",
        variant: "destructive",
      })
    }
  }, [nodes, edges, nodeCounters, validateConnectivity, user])

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

  // Aplicar efeitos de brilho INTENSOS aos pontos do fundo
  const getBackgroundProps = () => {
    return {
      color: isDark ? currentGradient.glow : "#4a5568",
      gap: 20,
      size: isDark ? 3 : 2, // Pontos maiores no dark
      variant: "dots" as const,
      style: {
        filter: isDark
          ? `drop-shadow(0 0 6px ${currentGradient.glow}) drop-shadow(0 0 12px ${currentGradient.glow}80) drop-shadow(0 0 18px ${currentGradient.glow}40)`
          : "none",
        opacity: isDark ? 0.8 : 1, // Mais visíveis no dark
      },
    }
  }

  // Configurações do MiniMap corrigidas para modo dark
  const getMiniMapProps = () => {
    return {
      nodeColor: (node: Node) => {
        if (isDark) {
          // Cores específicas por tipo de nó no modo dark
          switch (node.type) {
            case "start":
              return currentGradient.primary
            case "sendMessage":
              return "#3B82F6" // azul
            case "options":
              return "#8B5CF6" // roxo
            case "finalizar":
              return "#EF4444" // vermelho
            default:
              return currentGradient.secondary
          }
        } else {
          // Cores para modo light
          return "#9CA3AF"
        }
      },
      maskColor: isDark ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.8)",
      style: {
        backgroundColor: isDark ? "#111827" : "#F9FAFB", // Fundo mais claro no dark
        border: isDark ? `1px solid ${currentGradient.glow}40` : "1px solid #E5E7EB",
        borderRadius: "8px",
      },
    }
  }

  return (
    <div className="flex h-full">
      {/* Input file oculto para upload */}
      <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileUpload} style={{ display: "none" }} />

      {/* Sidebar dos Componentes - Agora pode ser ocultada */}
      {showSidebar && (
        <div
          className={`w-64 border-r p-4 ${isDark ? "bg-black border-gray-800" : "bg-white border-gray-200"} transition-all duration-300`}
        >
          <h2 className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>Componentes</h2>
          <NodeLibrary />
        </div>
      )}

      <div className="flex-1 flex flex-col">
        <div className="flex-1" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
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
            {/* Pontos com brilho INTENSO no modo dark */}
            <Background {...getBackgroundProps()} />
            <Controls showZoom={false} showFitView={false} showInteractive={false} />
            <MiniMap {...getMiniMapProps()} />
          </ReactFlow>
        </div>
      </div>

      {selectedNode && (
        <div
          className={`w-80 border-l p-4 ${isDark ? "bg-black border-gray-800" : "bg-white border-gray-200"} transition-all duration-300`}
        >
          <NodeConfigPanel
            node={selectedNode as WorkflowNode}
            updateNodeData={updateNodeData}
            onClose={() => setSelectedNode(null)}
            onRemove={() => removeNode(selectedNode.id)}
          />
        </div>
      )}

      {/* POPUP DE ERRO - JSON Inválido */}
      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent
          className={`${isDark ? "bg-black border-red-700" : "bg-white border-red-200"} max-w-lg mx-auto rounded-xl`}
          style={{
            filter: isDark
              ? "drop-shadow(0 0 25px rgba(239, 68, 68, 0.2))"
              : "drop-shadow(0 0 20px rgba(239, 68, 68, 0.1))",
          }}
        >
          <DialogHeader className="text-center">
            <DialogTitle
              className={`text-xl font-bold ${
                isDark ? "text-white" : "text-gray-900"
              } flex items-center justify-center gap-2`}
              style={{
                filter: isDark
                  ? "drop-shadow(0 0 8px rgba(239, 68, 68, 0.3))"
                  : "drop-shadow(0 0 4px rgba(239, 68, 68, 0.2))",
              }}
            >
              ❌ Arquivo JSON Inválido
            </DialogTitle>
            <DialogDescription
              className={`${isDark ? "text-gray-300" : "text-gray-600"} mt-2 text-center`}
              style={{
                filter: isDark
                  ? "drop-shadow(0 0 4px rgba(255, 255, 255, 0.2))"
                  : "drop-shadow(0 0 2px rgba(0, 0, 0, 0.1))",
              }}
            >
              <span className="text-red-500 font-bold text-lg">Não foi possível importar o arquivo!</span>
              <br />
              <span className="text-sm">Verifique se o arquivo é um fluxo Aura válido:</span>
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <div
              className={`p-4 rounded-lg border ${
                isDark ? "bg-red-900/20 border-red-700 text-red-300" : "bg-red-50 border-red-200 text-red-700"
              } transition-all duration-200`}
              style={{
                filter: isDark
                  ? "drop-shadow(0 0 6px rgba(239, 68, 68, 0.2))"
                  : "drop-shadow(0 0 3px rgba(239, 68, 68, 0.1))",
              }}
            >
              <div className="flex items-start gap-2">
                <span className="text-red-500 font-bold text-lg">⚠️</span>
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
              style={{
                filter: isDark
                  ? "drop-shadow(0 0 6px rgba(239, 68, 68, 0.2))"
                  : "drop-shadow(0 0 3px rgba(239, 68, 68, 0.1))",
              }}
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
          style={{
            filter: isDark
              ? "drop-shadow(0 0 25px rgba(255, 255, 255, 0.1))"
              : "drop-shadow(0 0 20px rgba(0, 0, 0, 0.1))",
          }}
        >
          <DialogHeader className="text-center">
            <DialogTitle
              className={`text-xl font-bold ${
                isDark ? "text-white" : "text-gray-900"
              } flex items-center justify-center gap-2`}
              style={{
                filter: isDark
                  ? "drop-shadow(0 0 8px rgba(255, 255, 255, 0.3))"
                  : "drop-shadow(0 0 4px rgba(0, 0, 0, 0.2))",
              }}
            >
              ⚠️ Componentes Desconectados
            </DialogTitle>
            <DialogDescription
              className={`${isDark ? "text-gray-300" : "text-gray-600"} mt-2 text-center`}
              style={{
                filter: isDark
                  ? "drop-shadow(0 0 4px rgba(255, 255, 255, 0.2))"
                  : "drop-shadow(0 0 2px rgba(0, 0, 0, 0.1))",
              }}
            >
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
                } transition-all duration-200`}
                style={{
                  filter: isDark
                    ? "drop-shadow(0 0 6px rgba(239, 68, 68, 0.2))"
                    : "drop-shadow(0 0 3px rgba(239, 68, 68, 0.1))",
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-red-500 font-bold">🔗</span>
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
              style={{
                filter: isDark
                  ? "drop-shadow(0 0 6px rgba(255, 255, 255, 0.2))"
                  : "drop-shadow(0 0 3px rgba(0, 0, 0, 0.1))",
              }}
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
          style={{
            filter: isDark
              ? "drop-shadow(0 0 25px rgba(34, 197, 94, 0.2))"
              : "drop-shadow(0 0 20px rgba(34, 197, 94, 0.1))",
          }}
        >
          <DialogHeader className="text-center">
            <DialogTitle
              className={`text-2xl font-bold ${
                isDark ? "text-white" : "text-gray-900"
              } flex items-center justify-center gap-3`}
              style={{
                filter: isDark
                  ? "drop-shadow(0 0 8px rgba(34, 197, 94, 0.4))"
                  : "drop-shadow(0 0 4px rgba(34, 197, 94, 0.3))",
              }}
            >
              ✅ Fluxo Salvo!
            </DialogTitle>
            <DialogDescription
              className={`${isDark ? "text-gray-300" : "text-gray-600"} mt-3 text-center text-lg`}
              style={{
                filter: isDark
                  ? "drop-shadow(0 0 4px rgba(255, 255, 255, 0.2))"
                  : "drop-shadow(0 0 2px rgba(0, 0, 0, 0.1))",
              }}
            >
              🎉 <strong>Parabéns!</strong> Seu fluxo foi salvo com sucesso!
              <br />
              <span className="text-sm mt-2 block">
                📊 <strong>{nodes.length} componentes</strong> salvos no navegador
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center mt-6">
            <Button
              onClick={() => setShowSuccessDialog(false)}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-2"
              style={{
                filter: "drop-shadow(0 0 8px rgba(34, 197, 94, 0.4))",
              }}
            >
              🚀 Perfeito!
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
