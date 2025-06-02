"use client"

import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import type { Conversation } from "./types"

interface DetailsModalProps {
  conversation?: Conversation
  onClose: () => void
  theme: string
}

export default function DetailsModal({ conversation, onClose, theme }: DetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className={`w-full max-w-sm ${theme === "dark" ? "bg-[#1a1a1a]" : "bg-white"}`}>
        {/* Header */}
        <div
          className={`p-4 border-b flex items-center justify-between ${theme === "dark" ? "border-[#222222]" : "border-gray-200"}`}
        >
          <h3 className={`font-semibold text-lg ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Detalhes</h3>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white rounded-full w-8 h-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6">
          {/* User Info */}
          <div className="flex items-center space-x-3 mb-4">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${theme === "dark" ? "bg-[#333333]" : "bg-gray-500"}`}
            >
              OP
            </div>
            <div>
              <h4 className={`font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                {conversation?.title}
              </h4>
              <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                {conversation?.lastMessage}
              </p>
              <p className={`text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}>
                {conversation?.messageDate}
              </p>
            </div>
          </div>

          {/* Tags */}
          <div className="flex space-x-2">
            <span
              className={`px-3 py-1 text-sm font-medium ${theme === "dark" ? "bg-gray-600 text-white" : "bg-gray-200 text-gray-800"}`}
            >
              {conversation?.daysCount}
            </span>
            <span className="px-3 py-1 text-sm font-medium bg-blue-600 text-white">{conversation?.situacao}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
