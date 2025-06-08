"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { LanguageProvider } from "../../contexts/LanguageContext"
import { ThemeProvider, useTheme } from "./homePanels/ThemeContext"
import { AuthProvider } from "../../contexts/AuthContext"
import ColorPanel from "./homePanels/ColorPanel"
import SearchPanel from "./homePanels/SearchPanel"
import ChannelModal from "./homePanels/ChannelModal"
import WorkflowBuilder from "./flow/workflow-builder"
import { useRouter } from "next/navigation"
import {
  FiArrowLeft,
  FiSettings,
  FiSearch,
  FiSave,
  FiPlayCircle,
  FiDownload,
  FiSun,
  FiMoon,
  FiZoomIn,
  FiZoomOut,
  FiMaximize,
  FiRefreshCw,
  FiMapPin,
  FiLayers,
  FiSidebar,
} from "react-icons/fi"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

const FlowElegantSidebar = ({ currentGradient, theme }: { currentGradient: any; theme: string }) => {
  return (
    <div className="fixed left-0 top-0 h-full z-50 flex items-center pointer-events-none">
      <div
        className="h-[80%] w-[3px] rounded-full relative overflow-hidden panel-glow"
        style={{
          background: `linear-gradient(to bottom, ${currentGradient.glow}, transparent, ${currentGradient.glow})`,
        }}
      >
        <div
          className="absolute top-[20%] left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full panel-glow"
          style={{
            background: theme === "dark" ? currentGradient.glow : "#374151",
            boxShadow: theme === "dark" ? `0 0 8px ${currentGradient.glow}` : "0 0 4px rgba(0,0,0,0.3)",
          }}
        />
        <div
          className="absolute top-[50%] left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full panel-glow"
          style={{
            background: theme === "dark" ? currentGradient.glow : "#374151",
            boxShadow: theme === "dark" ? `0 0 8px ${currentGradient.glow}` : "0 0 4px rgba(0,0,0,0.3)",
          }}
        />
        <div
          className="absolute top-[80%] left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full panel-glow"
          style={{
            background: theme === "dark" ? currentGradient.glow : "#374151",
            boxShadow: theme === "dark" ? `0 0 8px ${currentGradient.glow}` : "0 0 4px rgba(0,0,0,0.3)",
          }}
        />

        <div
          className="absolute top-0 left-0 w-full h-full"
          style={{
            background:
              theme === "dark"
                ? `linear-gradient(to bottom, ${currentGradient.primary}, transparent, ${currentGradient.secondary})`
                : `linear-gradient(to bottom, #6B7280, transparent, #6B7280)`,
            opacity: theme === "dark" ? 0.2 : 0.1,
          }}
        />
      </div>
    </div>
  )
}

const FlowStatusIndicator = ({ startPosition, mousePosition, componentCount, theme }: any) => {
  const isDark = theme === "dark"

  return (
    <div
      className={`flex items-center gap-4 px-3 py-1.5 rounded-lg border text-xs transition-all duration-200 ${
        isDark
          ? "bg-black hover:bg-gray-900 border border-gray-800 hover:border-gray-700 text-white"
          : "bg-gray-50 hover:bg-white border border-gray-200 hover:border-gray-300 text-gray-900"
      }`}
      style={{
        boxShadow: isDark
          ? "0 0 0 1px rgba(255, 255, 255, 0.1), 0 0 10px rgba(255, 255, 255, 0.1)"
          : "0 0 0 1px rgba(0, 0, 0, 0.05), 0 0 8px rgba(0, 0, 0, 0.05)",
        filter: isDark ? "drop-shadow(0 0 5px rgba(255, 255, 255, 0.1))" : "drop-shadow(0 0 3px rgba(0, 0, 0, 0.1))",
      }}
    >
      <div className="flex items-center gap-1">
        <FiMapPin
          className="h-3 w-3 text-green-500"
          style={{
            filter: isDark
              ? "drop-shadow(0 0 4px rgba(34, 197, 94, 0.5))"
              : "drop-shadow(0 0 2px rgba(34, 197, 94, 0.3))",
          }}
        />
        <span
          className={`font-mono ${
            isDark
              ? "text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.3)]"
              : "text-gray-900 drop-shadow-[0_0_2px_rgba(0,0,0,0.2)]"
          }`}
          style={{
            filter: isDark
              ? "drop-shadow(0 0 4px rgba(255, 255, 255, 0.3))"
              : "drop-shadow(0 0 2px rgba(0, 0, 0, 0.2))",
          }}
        >
          INÍCIO: ({Math.round(startPosition.x)}, {Math.round(startPosition.y)})
        </span>
      </div>

      <div className={`w-px h-4 ${isDark ? "bg-gray-700" : "bg-gray-300"}`} />

      <div className="flex items-center gap-1">
        <span
          className="text-blue-500"
          style={{
            filter: isDark
              ? "drop-shadow(0 0 4px rgba(59, 130, 246, 0.5))"
              : "drop-shadow(0 0 2px rgba(59, 130, 246, 0.3))",
          }}
        >
          🖱️
        </span>
        <span
          className={`font-mono ${
            isDark
              ? "text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.3)]"
              : "text-gray-900 drop-shadow-[0_0_2px_rgba(0,0,0,0.2)]"
          }`}
          style={{
            filter: isDark
              ? "drop-shadow(0 0 4px rgba(255, 255, 255, 0.3))"
              : "drop-shadow(0 0 2px rgba(0, 0, 0, 0.2))",
          }}
        >
          Mouse: ({Math.round(mousePosition.x)}, {Math.round(mousePosition.y)})
        </span>
      </div>

      <div className={`w-px h-4 ${isDark ? "bg-gray-700" : "bg-gray-300"}`} />

      <div className="flex items-center gap-1">
        <FiLayers
          className="h-3 w-3 text-purple-500"
          style={{
            filter: isDark
              ? "drop-shadow(0 0 4px rgba(168, 85, 247, 0.5))"
              : "drop-shadow(0 0 2px rgba(168, 85, 247, 0.3))",
          }}
        />
        <span
          className={`${
            isDark
              ? "text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.3)]"
              : "text-gray-900 drop-shadow-[0_0_2px_rgba(0,0,0,0.2)]"
          }`}
          style={{
            filter: isDark
              ? "drop-shadow(0 0 4px rgba(255, 255, 255, 0.3))"
              : "drop-shadow(0 0 2px rgba(0, 0, 0, 0.2))",
          }}
        >
          <span className="font-semibold">{componentCount}</span> componentes
        </span>
      </div>
    </div>
  )
}

const FlowHeader = ({
  onZoomIn,
  onZoomOut,
  onFitView,
  onSave,
  onLoad,
  onExecute,
  onSearch,
  onReset,
  onDownload,
  onToggleSidebar,
  startPosition,
  mousePosition,
  componentCount,
}: any) => {
  const router = useRouter()
  const { theme, toggleTheme, toggleColorPanel, toggleSearch, currentGradient } = useTheme()
  const [searchValue, setSearchValue] = useState("")
  const [showResetDialog, setShowResetDialog] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchValue.trim() && onSearch) {
      onSearch(searchValue.trim())
    }
  }

  const handleReset = () => {
    setShowResetDialog(true)
  }

  const confirmReset = () => {
    if (onReset) {
      onReset()
    }
    setShowResetDialog(false)
  }

  const handleDownload = () => {
    if (onDownload) {
      onDownload()
    }
  }

  const isDark = theme === "dark"

  const getButtonStyle = (color: string) => ({
    filter: isDark ? `drop-shadow(0 0 4px rgba(255, 255, 255, 0.2))` : `drop-shadow(0 0 2px rgba(0, 0, 0, 0.1))`,
  })

  return (
    <>
      <header
        className={`flex items-center justify-between p-4 border-b ${
          isDark ? "bg-black border-gray-800" : "bg-white border-gray-200"
        }`}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/panel")}
            className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
              isDark ? "hover:bg-gray-800 text-gray-300" : "hover:bg-gray-100 text-gray-600"
            }`}
            style={getButtonStyle("gray")}
          >
            <FiArrowLeft />
          </button>

          <button
            onClick={onToggleSidebar}
            className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
              isDark ? "hover:bg-gray-800 text-gray-300" : "hover:bg-gray-100 text-gray-600"
            }`}
            title="Mostrar/Ocultar Componentes"
            style={getButtonStyle("gray")}
          >
            <FiSidebar />
          </button>

          {/* Busca por ID com ícone interno e Controles de Zoom */}
          <div className="flex items-center gap-2">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <FiSearch
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                />
                <Input
                  type="text"
                  placeholder="Buscar por ID..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className={`w-48 h-8 text-sm pl-10 ${
                    isDark
                      ? "bg-black border-gray-700 text-white placeholder-gray-400 hover:bg-gray-900"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 hover:bg-gray-50"
                  }`}
                  style={{
                    filter: isDark
                      ? "drop-shadow(0 0 4px rgba(255, 255, 255, 0.1))"
                      : "drop-shadow(0 0 2px rgba(0, 0, 0, 0.05))",
                  }}
                />
              </div>
            </form>

            {/* Controles de Zoom */}
            <button
              onClick={onZoomOut}
              className={`p-2 rounded-md transition-colors ${
                isDark ? "hover:bg-gray-800 text-gray-300" : "hover:bg-gray-100 text-gray-600"
              }`}
              title="Diminuir Zoom"
              style={getButtonStyle("gray")}
            >
              <FiZoomOut />
            </button>
            <button
              onClick={onZoomIn}
              className={`p-2 rounded-md transition-colors ${
                isDark ? "hover:bg-gray-800 text-gray-300" : "hover:bg-gray-100 text-gray-600"
              }`}
              title="Aumentar Zoom"
              style={getButtonStyle("gray")}
            >
              <FiZoomIn />
            </button>
            <button
              onClick={onFitView}
              className={`p-2 rounded-md transition-colors ${
                isDark ? "hover:bg-gray-800 text-gray-300" : "hover:bg-gray-100 text-gray-600"
              }`}
              title="Ajustar à Tela"
              style={getButtonStyle("gray")}
            >
              <FiMaximize />
            </button>
          </div>

          {/* Indicador de Status */}
          <FlowStatusIndicator
            startPosition={startPosition}
            mousePosition={mousePosition}
            componentCount={componentCount}
            theme={theme}
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Botões de Ação */}
          <button
            onClick={onSave}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              isDark
                ? "hover:bg-gray-800 text-gray-300 border border-gray-700"
                : "hover:bg-gray-50 text-gray-700 border border-gray-300"
            }`}
            title="Salvar Fluxo"
            style={getButtonStyle("gray")}
          >
            <FiSave className="inline mr-1" />
            Salvar
          </button>

          <button
            onClick={handleReset}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              isDark
                ? "hover:bg-red-900 text-red-300 border border-red-700"
                : "hover:bg-red-50 text-red-700 border border-red-300"
            }`}
            title="Resetar Fluxo"
            style={{
              filter: isDark
                ? "drop-shadow(0 0 4px rgba(239, 68, 68, 0.3))"
                : "drop-shadow(0 0 2px rgba(239, 68, 68, 0.2))",
            }}
          >
            <FiRefreshCw className="inline mr-1" />
            Resetar
          </button>

          <button
            onClick={handleDownload}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              isDark
                ? "hover:bg-green-900 text-green-300 border border-green-700"
                : "hover:bg-green-50 text-green-700 border border-green-300"
            }`}
            title="Download do Fluxo"
            style={{
              filter: isDark
                ? "drop-shadow(0 0 4px rgba(34, 197, 94, 0.3))"
                : "drop-shadow(0 0 2px rgba(34, 197, 94, 0.2))",
            }}
          >
            <FiDownload className="inline mr-1" />
            Download
          </button>

          <button
            onClick={onLoad}
            className={`px-3 py-1.5 text-sm rounded-md transitionn-colors ${
              isDark
                ? "hover:bg-gray-800 text-gray-300 border border-gray-700"
                : "hover:bg-gray-50 text-gray-700 border border-gray-300"
            }`}
            title="Carregar Fluxo"
            style={getButtonStyle("gray")}
          >
            <FiDownload className="inline mr-1" />
            Carregar
          </button>

          <button
            onClick={onExecute}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              isDark
                ? "hover:bg-gray-800 text-gray-300 border border-gray-700"
                : "hover:bg-gray-50 text-gray-700 border border-gray-300"
            }`}
            title="Executar Fluxo"
            style={getButtonStyle("gray")}
          >
            <FiPlayCircle className="inline mr-1" />
            Executar
          </button>

          <div className={`w-px h-6 mx-2 ${isDark ? "bg-gray-700" : "bg-gray-300"}`} />

          {/* Controles de Interface */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-md transition-colors ${
              isDark ? "hover:bg-gray-800 text-gray-300" : "hover:bg-gray-100 text-gray-600"
            }`}
            title={isDark ? "Modo Claro" : "Modo Escuro"}
            style={getButtonStyle("gray")}
          >
            {isDark ? <FiSun /> : <FiMoon />}
          </button>
          <button
            onClick={toggleColorPanel}
            className={`p-2 rounded-md transition-colors ${
              isDark ? "hover:bg-gray-800 text-gray-300" : "hover:bg-gray-100 text-gray-600"
            }`}
            title="Configurações de Aparência"
            style={getButtonStyle("gray")}
          >
            <FiSettings />
          </button>
        </div>
      </header>

      {/* Dialog de Confirmação de Reset SIMPLIFICADO */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent
          className={`${isDark ? "bg-black border-gray-700" : "bg-white border-gray-200"} max-w-md mx-auto rounded-xl`}
          style={{
            filter: isDark
              ? "drop-shadow(0 0 20px rgba(255, 255, 255, 0.1))"
              : "drop-shadow(0 0 15px rgba(0, 0, 0, 0.1))",
          }}
        >
          <DialogHeader className="text-center">
            <DialogTitle
              className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"} flex items-center justify-center gap-2`}
              style={{
                filter: isDark
                  ? "drop-shadow(0 0 8px rgba(255, 255, 255, 0.3))"
                  : "drop-shadow(0 0 4px rgba(0, 0, 0, 0.2))",
              }}
            >
              <FiRefreshCw className="h-6 w-6 text-red-500" />
              Resetar Fluxo
            </DialogTitle>
            <DialogDescription
              className={`${isDark ? "text-gray-300" : "text-gray-600"} mt-2`}
              style={{
                filter: isDark
                  ? "drop-shadow(0 0 4px rgba(255, 255, 255, 0.2))"
                  : "drop-shadow(0 0 2px rgba(0, 0, 0, 0.1))",
              }}
            >
              ⚠️ Esta ação irá remover <strong>todos os componentes</strong>.
              <br />
              <span className="text-red-500 font-semibold">Esta ação não pode ser desfeita!</span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowResetDialog(false)}
              className={`${
                isDark ? "border-gray-600 text-gray-300 hover:bg-gray-800" : "border-gray-300 hover:bg-gray-50"
              }`}
              style={{
                filter: isDark
                  ? "drop-shadow(0 0 4px rgba(255, 255, 255, 0.1))"
                  : "drop-shadow(0 0 2px rgba(0, 0, 0, 0.05))",
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmReset}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold"
              style={{
                filter: "drop-shadow(0 0 6px rgba(239, 68, 68, 0.4))",
              }}
            >
              <FiRefreshCw className="inline mr-1" />
              Resetar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Component that uses the theme context - must be inside ThemeProvider
const FlowLayout = () => {
  const { theme, showColorPanel, showSearch, currentGradient, showChannelModal, setShowChannelModal } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [workflowActions, setWorkflowActions] = useState<any>(null)
  const [startPosition, setStartPosition] = useState({ x: 250, y: 100 })
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [componentCount, setComponentCount] = useState(1)
  const [showSidebar, setShowSidebar] = useState(true)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleSidebar = useCallback(() => {
    setShowSidebar(!showSidebar)
  }, [showSidebar])

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-lg">Carregando Construtor de Fluxo...</div>
      </div>
    )
  }

  return (
    <div className={`flex flex-col h-screen ${theme === "dark" ? "bg-black" : "bg-gray-50"}`}>
      {/* Barra lateral elegante - AGORA EM AMBOS OS MODOS */}
      <FlowElegantSidebar currentGradient={currentGradient} theme={theme} />

      <FlowHeader
        onZoomIn={workflowActions?.zoomIn}
        onZoomOut={workflowActions?.zoomOut}
        onFitView={workflowActions?.fitView}
        onSave={workflowActions?.save}
        onLoad={workflowActions?.load}
        onExecute={workflowActions?.execute}
        onSearch={workflowActions?.search}
        onReset={workflowActions?.reset}
        onDownload={workflowActions?.download}
        onToggleSidebar={toggleSidebar}
        startPosition={startPosition}
        mousePosition={mousePosition}
        componentCount={componentCount}
      />
      <main className="flex-1 overflow-hidden">
        <WorkflowBuilder
          onActionsReady={setWorkflowActions}
          onStartPositionChange={setStartPosition}
          onMousePositionChange={setMousePosition}
          onComponentCountChange={setComponentCount}
          showSidebar={showSidebar}
          onToggleSidebar={toggleSidebar}
        />
      </main>

      {/* Color Panel */}
      {showColorPanel && <ColorPanel />}

      {/* Search Panel */}
      {showSearch && <SearchPanel />}

      {/* Channel Modal */}
      {showChannelModal && <ChannelModal isOpen={showChannelModal} onClose={() => setShowChannelModal(false)} />}
    </div>
  )
}

// This component sets up the providers
const Flow = () => {
  return (
    <AuthProvider>
      <LanguageProvider>
        <ThemeProvider>
          <FlowContent />
        </ThemeProvider>
      </LanguageProvider>
    </AuthProvider>
  )
}

// This is a separate component to avoid using hooks outside of ThemeProvider
const FlowContent = () => {
  return <FlowLayout />
}

export default Flow
