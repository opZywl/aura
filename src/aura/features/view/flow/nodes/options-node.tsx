"use client"

import type React from "react"

import { memo, useState, useEffect } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { List, Plus, Minus, X } from "lucide-react"
import type { NodeData } from "@/lib/types"

interface OptionsNodeProps extends NodeProps<NodeData> {
  onRemove?: () => void
  onUpdateData?: (data: any) => void
}

export const OptionsNode = memo(({ data, isConnectable, onRemove, onUpdateData }: OptionsNodeProps) => {
  const [options, setOptions] = useState(data.options || [{ text: "Opção 1", digit: "1" }])
  const [message, setMessage] = useState(data.message || "digita a mensagem")

  // Sincronizar com dados externos
  useEffect(() => {
    if (data.options) {
      setOptions(data.options)
    }
    if (data.message) {
      setMessage(data.message)
    }
  }, [data.options, data.message])

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onRemove) onRemove()
  }

  const addOption = () => {
    const newOptions = [...options, { text: `Opção ${options.length + 1}`, digit: `${options.length + 1}` }]
    setOptions(newOptions)
    if (onUpdateData) onUpdateData({ options: newOptions })
  }

  const removeOption = (index: number) => {
    if (options.length > 1) {
      const newOptions = options.filter((_, i) => i !== index)
      setOptions(newOptions)
      if (onUpdateData) onUpdateData({ options: newOptions })
    }
  }

  const updateOption = (index: number, field: string, value: string) => {
    const newOptions = [...options]
    newOptions[index] = { ...newOptions[index], [field]: value }
    setOptions(newOptions)
    if (onUpdateData) onUpdateData({ options: newOptions })
  }

  const updateMessage = (newMessage: string) => {
    setMessage(newMessage)
    if (onUpdateData) onUpdateData({ message: newMessage })
  }

  // Calcular altura dinâmica baseada no número de opções
  const nodeHeight = Math.max(300, 200 + options.length * 35)
  const hasMany = options.length > 5

  return (
    <div
      className="px-4 py-3 shadow-md rounded-lg bg-black border-2 border-purple-500 min-w-[280px] max-w-[320px] relative group"
      style={{ minHeight: `${nodeHeight}px` }}
    >
      {/* Ícone de excluir */}
      <button
        onClick={handleRemove}
        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <X className="h-3 w-3" />
      </button>

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <div className="rounded-full w-6 h-6 flex items-center justify-center bg-purple-100 text-purple-600">
            <List className="h-3 w-3" />
          </div>
          <div className="ml-2">
            <div className="text-sm font-bold text-white">🚀 Opções - ID: {data.customId || "#1"}</div>
          </div>
        </div>
      </div>

      <div className="text-xs text-orange-400 mb-2 font-medium">Dicas dos botões</div>
      <div className="text-xs text-gray-300 mb-2 leading-relaxed">
        A mensagem pode ter até 1024 caracteres. Compatível com emojis e formatação de texto, assim como links.
      </div>
      <div className="text-xs text-gray-300 mb-3 leading-relaxed">
        Você pode ter até 3 botões, acima de 3 será gerado uma lista de botões que deve possuir no máximo de 10
        elementos na lista.
      </div>

      {/* Área de texto */}
      <div className="relative mb-3">
        <textarea
          value={message}
          onChange={(e) => updateMessage(e.target.value)}
          className="w-full bg-gray-900 border border-gray-600 rounded p-2 min-h-[100px] text-xs text-white resize-none focus:outline-none focus:ring-2 focus:ring-purple-400"
          placeholder="digita a mensagem"
        />
      </div>

      {/* Tabela de opções com layout melhorado */}
      <div className="space-y-1 mb-3">
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <input
              type="text"
              value={option.digit || ""}
              onChange={(e) => updateOption(index, "digit", e.target.value)}
              className="w-8 p-1 border border-gray-600 rounded bg-gray-900 text-white text-center text-xs"
              placeholder={`${index + 1}`}
            />
            <input
              type="text"
              value={option.text}
              onChange={(e) => updateOption(index, "text", e.target.value)}
              className="flex-1 p-1 border border-gray-600 rounded bg-gray-900 text-white text-xs"
              placeholder="seu texto"
            />
            {index === 0 ? (
              <button
                onClick={addOption}
                className="w-6 h-6 bg-red-500 text-white rounded flex items-center justify-center hover:bg-red-600"
              >
                <Plus className="h-3 w-3" />
              </button>
            ) : (
              <button
                onClick={() => removeOption(index)}
                className="w-6 h-6 bg-red-500 text-white rounded flex items-center justify-center hover:bg-red-600"
              >
                <Minus className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* PONTO AMARELO DE ENTRADA */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-yellow-500"
        style={{ background: "#eab308" }}
      />

      {/* Múltiplas saídas VERDES - layout melhorado para muitas opções */}
      {options.map((_, index) => {
        let topPosition: string

        if (hasMany) {
          // Para muitas opções, distribuir uniformemente na lateral direita
          const startPercent = 25
          const endPercent = 85
          const step = (endPercent - startPercent) / Math.max(1, options.length - 1)
          topPosition = `${startPercent + index * step}%`
        } else {
          // Para poucas opções, usar posicionamento original
          topPosition = `${40 + index * 15}%`
        }

        return (
          <Handle
            key={`output-${index}`}
            type="source"
            position={Position.Right}
            id={`output-${index}`}
            style={{ top: topPosition }}
            isConnectable={isConnectable}
            className="w-3 h-3 bg-green-500"
          />
        )
      })}
    </div>
  )
})

OptionsNode.displayName = "OptionsNode"
