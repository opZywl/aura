import type { Node } from "reactflow"

export interface NodeData {
  label: string
  description?: string
  required?: boolean

  // Input node properties
  dataSource?: "manual" | "api" | "database" | "file"
  sampleData?: string

  // Output node properties
  outputType?: "console" | "api" | "database" | "file"
  outputFormat?: "json" | "csv" | "xml" | "text"

  // Process node properties
  processType?: "transform" | "filter" | "aggregate" | "sort"
  processConfig?: string

  // Conditional node properties
  condition?: string
  trueLabel?: string
  falseLabel?: string

  // Code node properties
  codeLanguage?: "javascript" | "typescript"
  code?: string

  // Shared metadata
  customId?: string
  message?: string

  // Send message node properties
  messageType?: "text" | "image" | "audio" | "video"

  // Options node properties
  options?: NodeOption[]

  // Finalizar node properties
  finalizationType?: "success" | "error" | "timeout" | "cancel"
  finalMessage?: string
}

export interface NodeOption {
  id?: string
  text: string
  digit?: string
}

export type WorkflowNode = Node<NodeData>

export interface Workflow {
  nodes: WorkflowNode[]
  edges: any[]
}
