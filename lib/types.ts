import type { Node, Edge } from "reactflow"

/**
 * 📘 NodeData
 * Estrutura de dados usada por todos os nós do fluxo.
 * Cada tipo de nó usa um subconjunto dessas propriedades.
 */
export interface NodeData {
    /** Nome visível ou rótulo do nó */
    label: string

    /** Descrição opcional (usada em StartNode e outros) */
    description?: string

    /** Define se o campo é obrigatório (usado em inputs, por exemplo) */
    required?: boolean

    /** Mensagem final (para FinalizarNode) */
    finalMessage?: string

    /** Tipo de finalização do nó finalizar */
    finalizationType?: "success" | "error" | "timeout" | "cancel"

    /** ID customizado, exibido no nó */
    customId?: string

    /** Mensagem principal (para SendMessageNode, OptionsNode etc.) */
    message?: string

    /** Tipo da mensagem enviada por um nó de mensagem */
    messageType?: "text" | "image" | "audio" | "video"

    /** Lista de opções (para OptionsNode) */
    options?: Array<{
        id?: string
        text: string
        digit?: string
    }>

    /** Horários disponíveis para agendamento */
    availableSlots?: Array<{
        id: string
        time: string
        date?: string
        available: boolean
    }>

    /** Mensagem de confirmação de agendamento */
    confirmationMessage?: string

    /** Mensagem de cancelamento */
    cancellationMessage?: string

    /** Mensagem quando não há horários disponíveis */
    noSlotsMessage?: string

    /** Mensagem de transferência para agente */
    handoffMessage?: string

    /** Mensagem quando nenhum agente está disponível */
    noAgentMessage?: string

    /* -----------------------------------------------------
     * 🧠 Propriedades específicas por tipo de nó
     * --------------------------------------------------- */

    /** Origem de dados (para nós de entrada) */
    dataSource?: "manual" | "api" | "database" | "file"

    /** Dados de exemplo (para visualização ou debug) */
    sampleData?: string

    /** Tipo de saída (para nós de saída) */
    outputType?: "console" | "api" | "database" | "file"

    /** Formato de saída (para exportação de dados) */
    outputFormat?: "json" | "csv" | "xml" | "text"

    /** Tipo de processamento (para ProcessNode) */
    processType?: "transform" | "filter" | "aggregate" | "sort"

    /** Configuração específica de processamento */
    processConfig?: string

    /** Condição lógica (para ConditionalNode) */
    condition?: string

    /** Rótulo de saída para a condição verdadeira */
    trueLabel?: string

    /** Rótulo de saída para a condição falsa */
    falseLabel?: string

    /** Linguagem usada no CodeNode */
    codeLanguage?: "javascript" | "typescript"

    /** Código-fonte do CodeNode */
    code?: string
}

/**
 * 📗 WorkflowNode
 * Representa um nó completo do ReactFlow com os dados definidos acima.
 */
export type WorkflowNode = Node<NodeData>

/**
 * 📗 Workflow
 * Representa o estado completo de um fluxo (nós + conexões).
 */
export interface Workflow {
    /** Lista de nós */
    nodes: WorkflowNode[]

    /** Lista de conexões (arestas) entre nós */
    edges: Edge[]
}
