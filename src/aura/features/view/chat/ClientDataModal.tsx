"use client"

import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import type { Conversation } from "./types"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ClientDataModalProps {
  conversation?: Conversation
  onCloseAction: () => void
}

export default function ClientDataModal({ conversation, onCloseAction }: ClientDataModalProps) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="w-full max-w-sm bg-[#1a1a1a] rounded-lg overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#222222] flex items-center justify-between">
          <h3 className="font-semibold text-lg text-white">Dados do Cliente</h3>
          <Button
            onClick={onCloseAction}
            variant="ghost"
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white rounded-full w-8 h-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-4 space-y-4">
          {/* Observação */}
          <div>
            <label className="block text-sm font-medium mb-2 text-blue-400">Observação</label>
            <Textarea
              placeholder="Nenhuma observação. Clique para adicionar."
              className="w-full border-2 border-dashed border-blue-400 bg-[#222222] text-gray-300 placeholder:text-gray-500"
              rows={3}
            />
          </div>

          {/* Número de Telefone */}
          <div>
            <label className="block text-sm font-medium mb-2 text-white">Número de Telefone</label>
            <Input value="Não informado" readOnly className="w-full bg-[#222222] border-[#333333] text-gray-300" />
          </div>

          {/* Quantidade de Mensagens */}
          <div>
            <label className="block text-sm font-medium mb-2 text-white">Quantidade de Mensagens</label>
            <Input value="N/A" readOnly className="w-full bg-[#222222] border-[#333333] text-gray-300" />
          </div>

          {/* Status (Chat) */}
          <div>
            <label className="block text-sm font-medium mb-2 text-white">Status (Chat)</label>
            <Input value="Desconhecido" readOnly className="w-full bg-[#222222] border-[#333333] text-gray-300" />
          </div>

          {/* Situação */}
          <div>
            <label className="block text-sm font-medium mb-2 text-white">Situação</label>
            <Select defaultValue="Em Atendimento">
              <SelectTrigger className="w-full bg-[#222222] border-[#333333] text-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#222222] border-[#333333]">
                <SelectItem value="Em Atendimento">Em Atendimento</SelectItem>
                <SelectItem value="Aguardando">Aguardando</SelectItem>
                <SelectItem value="Finalizado">Finalizado</SelectItem>
                <SelectItem value="N/D">N/D</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
}
