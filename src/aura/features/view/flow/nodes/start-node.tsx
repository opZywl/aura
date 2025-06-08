"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { Play } from "lucide-react"
import type { NodeData } from "@/lib/types"

export const StartNode = memo(({ data, isConnectable }: NodeProps<NodeData>) => {
  return (
    <div className="px-4 py-2 shadow-lg rounded-md bg-gradient-to-r from-green-500 to-emerald-600 border-2 border-green-400 min-w-[150px] relative">
      <div className="flex items-center">
        <div className="rounded-full w-8 h-8 flex items-center justify-center bg-white text-green-600">
          <Play className="h-4 w-4" />
        </div>
        <div className="ml-2">
          <div className="text-sm font-bold text-white">{data.label || "INÍCIO"}</div>
          <div className="text-xs text-green-100">{data.description || "Ponto de início do fluxo"}</div>
        </div>
      </div>

      {/* REMOVIDO: indicador amarelo */}

      {/* APENAS UMA BOLINHA DE SAÍDA VERDE */}
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="w-3 h-3 bg-green-500" />
    </div>
  )
})

StartNode.displayName = "StartNode"
