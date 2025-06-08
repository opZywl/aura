"use client"

import type React from "react"
import { Send, List, Settings, GitBranch, Code, CheckCircle, MousePointer2, Sparkles } from "lucide-react"
import { useTheme } from "../homePanels/ThemeContext"

const nodeTypes = [
  {
    type: "sendMessage",
    label: "Enviar Mensagem",
    icon: Send,
    description: "Envia mensagem para o usuário",
  },
  {
    type: "options",
    label: "Opções",
    icon: List,
    description: "Apresenta opções ao usuário",
  },
  {
    type: "process",
    label: "Processo",
    icon: Settings,
    description: "Processa dados",
  },
  {
    type: "conditional",
    label: "Condicional",
    icon: GitBranch,
    description: "Ramificação condicional",
  },
  {
    type: "code",
    label: "Código",
    icon: Code,
    description: "Executa código personalizado",
  },
  {
    type: "finalizar",
    label: "Finalizar",
    icon: CheckCircle,
    description: "Finaliza o fluxo",
  },
]

export default function NodeLibrary() {
  const { theme } = useTheme()

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType)
    event.dataTransfer.effectAllowed = "move"
  }

  const isDark = theme === "dark"

  return (
    <div className={`h-full flex flex-col ${isDark ? "bg-black" : "bg-white"}`}>
      {/* Header com Glow Rosa/Azul/Purple */}
      <div className={`px-4 py-4 border-b ${isDark ? "border-gray-800" : "border-gray-200"} relative`}>
        {/* Efeito de Glow Rosa/Azul/Purple */}
        <div
          className={`absolute inset-0 ${
            isDark
              ? "bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20"
              : "bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10"
          } animate-pulse`}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className={`h-4 w-4 ${isDark ? "text-blue-400" : "text-blue-600"} animate-pulse`} />
            <h3
              className={`text-base font-bold ${
                isDark
                  ? "bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
                  : "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
              } animate-pulse`}
              style={{
                filter: isDark
                  ? "drop-shadow(0 0 10px rgba(59, 130, 246, 0.5)) drop-shadow(0 0 20px rgba(147, 51, 234, 0.3))"
                  : "drop-shadow(0 0 6px rgba(59, 130, 246, 0.4)) drop-shadow(0 0 12px rgba(147, 51, 234, 0.2))",
              }}
            >
              Construtor de Fluxo
            </h3>
          </div>
          <div className={`flex items-center gap-2 text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            <MousePointer2 className="h-3 w-3" />
            <span>Arraste os componentes para o canvas</span>
          </div>
        </div>
      </div>

      {/* Components List */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        <div className="space-y-1">
          {nodeTypes.map((node, index) => {
            const IconComponent = node.icon
            return (
              <div
                key={node.type}
                className={`px-3 py-2.5 rounded-lg cursor-grab active:cursor-grabbing transition-all duration-200 animate-fadeIn ${
                  isDark
                    ? "bg-black hover:bg-gray-900 border border-gray-800 hover:border-gray-700 text-white"
                    : "bg-gray-50 hover:bg-white border border-gray-200 hover:border-gray-300 text-gray-900"
                }`}
                style={{
                  animationDelay: `${index * 100}ms`,
                  boxShadow: isDark
                    ? "0 0 0 1px rgba(255, 255, 255, 0.1), 0 0 10px rgba(255, 255, 255, 0.1)"
                    : "0 0 0 1px rgba(0, 0, 0, 0.05), 0 0 8px rgba(0, 0, 0, 0.05)",
                  filter: isDark
                    ? "drop-shadow(0 0 5px rgba(255, 255, 255, 0.1))"
                    : "drop-shadow(0 0 3px rgba(0, 0, 0, 0.1))",
                }}
                onMouseEnter={(e) => {
                  if (isDark) {
                    e.currentTarget.style.boxShadow =
                      "0 0 0 1px rgba(255, 255, 255, 0.3), 0 0 15px rgba(255, 255, 255, 0.2), 0 0 25px rgba(255, 255, 255, 0.1)"
                  } else {
                    e.currentTarget.style.boxShadow =
                      "0 0 0 1px rgba(0, 0, 0, 0.1), 0 0 12px rgba(0, 0, 0, 0.1), 0 0 20px rgba(0, 0, 0, 0.05)"
                  }
                }}
                onMouseLeave={(e) => {
                  if (isDark) {
                    e.currentTarget.style.boxShadow =
                      "0 0 0 1px rgba(255, 255, 255, 0.1), 0 0 10px rgba(255, 255, 255, 0.1)"
                  } else {
                    e.currentTarget.style.boxShadow = "0 0 0 1px rgba(0, 0, 0, 0.05), 0 0 8px rgba(0, 0, 0, 0.05)"
                  }
                }}
                draggable
                onDragStart={(event) => onDragStart(event, node.type)}
              >
                <div className="flex items-center gap-3">
                  <IconComponent className={`h-4 w-4 ${isDark ? "text-gray-300" : "text-gray-600"}`} />
                  <div>
                    <div
                      className={`text-sm font-medium ${
                        isDark
                          ? "text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.3)]"
                          : "text-gray-900 drop-shadow-[0_0_4px_rgba(0,0,0,0.2)]"
                      }`}
                      style={{
                        filter: isDark
                          ? "drop-shadow(0 0 6px rgba(255, 255, 255, 0.3))"
                          : "drop-shadow(0 0 4px rgba(0, 0, 0, 0.2))",
                      }}
                    >
                      {node.label}
                    </div>
                    <div className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>{node.description}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer com Glow Dark/Light */}
      <div
        className={`px-3 py-3 border-t text-xs text-center relative ${isDark ? "border-gray-800" : "border-gray-200"}`}
      >
        {/* Efeito de Glow no Footer */}
        <div
          className={`absolute inset-0 ${
            isDark ? "bg-gradient-to-t from-white/10 to-transparent" : "bg-gradient-to-t from-black/5 to-transparent"
          } animate-pulse`}
        />

        <div className="relative z-10">
          <span
            className={`${
              isDark
                ? "text-gray-300 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                : "text-gray-600 drop-shadow-[0_0_6px_rgba(0,0,0,0.3)]"
            }`}
            style={{
              filter: isDark
                ? "drop-shadow(0 0 8px rgba(255, 255, 255, 0.4))"
                : "drop-shadow(0 0 6px rgba(0, 0, 0, 0.3))",
            }}
          >
          </span>
        </div>
      </div>
    </div>
  )
}
