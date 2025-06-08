"use client"

import type React from "react"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { Settings, X } from "lucide-react"
import type { NodeData } from "@/lib/types"

interface ProcessNodeProps extends NodeProps<NodeData> {
  onRemove?: () => void
}

export const ProcessNode = memo(({ data, isConnectable, onRemove }: ProcessNodeProps) => {
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onRemove) onRemove()
  }

  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-green-500 min-w-[150px] relative group">
      {/* Ícone de excluir */}
      <button
        onClick={handleRemove}
        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <X className="h-3 w-3" />
      </button>

      <div className="flex items-center">
        <div className="rounded-full w-8 h-8 flex items-center justify-center bg-green-100 text-green-600">
          <Settings className="h-4 w-4" />
        </div>
        <div className="ml-2">
          <div className="text-sm font-bold text-gray-800">{data.label || "Processo"}</div>
          <div className="text-xs text-gray-500">{data.description || "Processa dados"}</div>
        </div>
      </div>

      {data.customId && (
        <div className="mt-2 text-xs bg-green-100 text-green-800 p-1 rounded font-mono">ID: {data.customId}</div>
      )}

      <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-3 h-3 bg-green-500" />
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="w-3 h-3 bg-green-500" />
    </div>
  )
})

ProcessNode.displayName = "ProcessNode"
