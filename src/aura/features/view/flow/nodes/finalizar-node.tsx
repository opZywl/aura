"use client"

import type React from "react"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { CheckCircle, X } from "lucide-react"
import type { NodeData } from "@/lib/types"

interface FinalizarNodeProps extends NodeProps<NodeData> {
    onRemove?: () => void
}

export const FinalizarNode = memo(({ data, isConnectable, onRemove }: FinalizarNodeProps) => {
    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (onRemove) onRemove()
    }

    return (
        <div className="px-4 py-2 shadow-md rounded-lg bg-white border-2 border-orange-500 min-w-[120px] relative group">
            {/* Ícone de excluir */}
            <button
                onClick={handleRemove}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
                <X className="h-3 w-3" />
            </button>

            <div className="flex items-center">
                <div className="rounded-full w-6 h-6 flex items-center justify-center bg-orange-100 text-orange-600">
                    <CheckCircle className="h-3 w-3" />
                </div>
                <div className="ml-2">
                    <div className="text-sm font-bold text-gray-800">Finalizar</div>
                </div>
            </div>

            {data.finalMessage && (
                <div className="mt-2 text-xs text-gray-600 p-2 bg-orange-50 rounded border border-orange-200 max-w-[200px] truncate">
                    {data.finalMessage}
                </div>
            )}

            {data.customId && (
                <div className="mt-2 text-xs bg-orange-50 text-orange-700 p-1 rounded font-mono">ID: {data.customId}</div>
            )}

            <Handle
                type="target"
                position={Position.Top}
                isConnectable={isConnectable}
                className="w-3 h-3 bg-yellow-500"
                style={{ background: "#eab308" }}
            />
        </div>
    )
})

FinalizarNode.displayName = "FinalizarNode"
