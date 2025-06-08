"use client"

import type React from "react"

import { memo, useState } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { Send, X } from "lucide-react"
import type { NodeData } from "@/lib/types"

interface SendMessageNodeProps extends NodeProps<NodeData> {
  onRemove?: () => void
  onUpdateData?: (data: any) => void
}

export const SendMessageNode = memo(({ data, isConnectable, onRemove, onUpdateData }: SendMessageNodeProps) => {
  const [message, setMessage] = useState(data.message || "")
  const [isEditing, setIsEditing] = useState(false)

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onRemove) onRemove()
  }

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newMessage = e.target.value
    setMessage(newMessage)
    if (onUpdateData) onUpdateData({ message: newMessage })
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditing(true)
  }

  const handleBlur = () => {
    setIsEditing(false)
  }

  return (
    <div className="px-4 py-3 shadow-md rounded-lg bg-black border-2 border-blue-500 min-w-[200px] max-w-[250px] relative group">
      {/* Ícone de excluir */}
      <button
        onClick={handleRemove}
        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <X className="h-3 w-3" />
      </button>

      <div className="flex items-center mb-2">
        <div className="rounded-full w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-600">
          <Send className="h-3 w-3" />
        </div>
        <div className="ml-2">
          <div className="text-sm font-bold text-white">Enviar Mensagem</div>
        </div>
      </div>

      {data.customId && (
        <div className="mb-2 text-xs bg-blue-900/30 text-blue-300 p-1 rounded font-mono">ID: {data.customId}</div>
      )}

      <div className="text-xs text-gray-300 mb-2">Digite uma mensagem</div>

      {/* Campo de mensagem EDITÁVEL */}
      {isEditing ? (
        <textarea
          value={message}
          onChange={handleMessageChange}
          onBlur={handleBlur}
          className="w-full bg-gray-900 border border-gray-600 rounded p-2 min-h-[60px] text-xs text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Sua mensagem aqui..."
          autoFocus
        />
      ) : (
        <div
          onClick={handleClick}
          className="bg-gray-900 border border-gray-600 rounded p-2 min-h-[60px] text-xs text-white cursor-text"
        >
          {message || "Sua mensagem aqui..."}
        </div>
      )}

      {/* APENAS DUAS BOLINHAS: AMARELA (entrada) e VERDE (saída) */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-yellow-500"
        style={{ background: "#eab308" }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-green-500"
        style={{ background: "#22c55e" }}
      />
    </div>
  )
})

SendMessageNode.displayName = "SendMessageNode"
