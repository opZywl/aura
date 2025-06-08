import type { Node, XYPosition } from "reactflow"
import type { NodeData } from "./types"

let nodeIdCounter = 0

export const generateNodeId = (type: string): string => {
  nodeIdCounter++
  return `${type}-${nodeIdCounter}`
}

export const createNode = ({
  type,
  position,
  id,
}: {
  type: string
  position: XYPosition
  id: string
}): Node<NodeData> => {
  const baseNode = {
    id,
    type,
    position,
    data: {
      label: getDefaultLabel(type),
      description: getDefaultDescription(type),
    },
  }

  switch (type) {
    case "input":
      return {
        ...baseNode,
        data: {
          ...baseNode.data,
          dataSource: "manual",
          sampleData: '{"example": "data"}',
        },
      }
    case "output":
      return {
        ...baseNode,
        data: {
          ...baseNode.data,
          outputType: "console",
          outputFormat: "json",
        },
      }
    case "process":
      return {
        ...baseNode,
        data: {
          ...baseNode.data,
          processType: "transform",
          processConfig: '{"operation": "map"}',
        },
      }
    case "conditional":
      return {
        ...baseNode,
        data: {
          ...baseNode.data,
          condition: "data.value > 0",
          trueLabel: "Yes",
          falseLabel: "No",
        },
      }
    case "code":
      return {
        ...baseNode,
        data: {
          ...baseNode.data,
          codeLanguage: "javascript",
          code: "// Write your code here\nfunction process(data) {\n  // Transform data\n  return data;\n}",
        },
      }
    default:
      return baseNode
  }
}

const getDefaultLabel = (type: string): string => {
  switch (type) {
    case "input":
      return "Input"
    case "output":
      return "Output"
    case "process":
      return "Process"
    case "conditional":
      return "Conditional"
    case "code":
      return "Code"
    default:
      return "Node"
  }
}

const getDefaultDescription = (type: string): string => {
  switch (type) {
    case "input":
      return "Data input node"
    case "output":
      return "Data output node"
    case "process":
      return "Data processing node"
    case "conditional":
      return "Conditional branching"
    case "code":
      return "Custom code execution"
    default:
      return "Workflow node"
  }
}
