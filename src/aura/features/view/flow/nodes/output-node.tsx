"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { FileOutput } from "lucide-react"
import type { NodeData } from "@/lib/types"

export const OutputNode = memo(({ data, isConnectable }: NodeProps<NodeData>) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-green-500 min-w-[150px] relative group">
      <div className="flex items-center">
        <div className="rounded-full w-8 h-8 flex items-center justify-center bg-green-100 text-green-500">
          <FileOutput className="h-4 w-4" />
        </div>
        <div className="ml-2">
          <div className="text-sm font-bold">{data.label || "Saída"}</div>
          <div className="text-xs text-gray-500">{data.description || "Exporta dados processados"}</div>
        </div>
      </div>

      {data.customId && (
        <div className="mt-2 text-xs bg-green-50 text-green-700 p-1 rounded font-mono">ID: {data.customId}</div>
      )}

      {data.outputType && (
        <div className="mt-2 text-xs bg-gray-100 p-1 rounded">
          Saída: {data.outputType} ({data.outputFormat || "json"})
        </div>
      )}

      <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-3 h-3 bg-green-500" />
    </div>
  )
})

OutputNode.displayName = "OutputNode"
