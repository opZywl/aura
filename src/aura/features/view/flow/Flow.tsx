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
    FiCheckCircle,
    FiXCircle,
} from "react-icons/fi"
import { BotIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import AuraFlowBot from "./flow/aura-flow-bot"

const FlowElegantSidebar = ({ currentGradient, theme }: { currentGradient: any; theme: string }) => {
    return (
        <div className="fixed left-0 top-0 h-full z-50 flex items-center pointer-events-none">
            <div
                className="h-[80%] w-[3px] rounded-full relative overflow-hidden panel-glow"
                style={{
                    background: `linear-gradient(to bottom, ${currentGradient.glow}, transparent, ${currentGradient.glow})`,
                }}
            >
                {/* Pontos decorativos */}
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

                {/* Efeito de brilho */}
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

// Componente do Indicador de Status com status de execução
const FlowStatusIndicator = ({ startPosition, mousePosition, componentCount, theme }: any) => {
    const isDark = theme === "dark"
    const [isExecuted, setIsExecuted] = useState(false)

    useEffect(() => {
        const executedFlow = localStorage.getItem("executedFlow")
        setIsExecuted(executedFlow === "true")
    }, [])

    // Escutar mudanças no localStorage
    useEffect(() => {
        const handleStorageChange = () => {
            const executedFlow = localStorage.getItem("executedFlow")
            setIsExecuted(executedFlow === "true")
        }

        window.addEventListener("storage", handleStorageChange)
        // Também escutar mudanças internas
        const interval = setInterval(handleStorageChange, 1000)

        return () => {
            window.removeEventListener("storage", handleStorageChange)
            clearInterval(interval)
        }
    }, [])

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
                {isExecuted ? (
                    <FiCheckCircle
                        className="h-3 w-3 text-green-500"
                        style={{
                            filter: isDark
                                ? "drop-shadow(0 0 4px rgba(34, 197, 94, 0.5))"
                                : "drop-shadow(0 0 2px rgba(34, 197, 94, 0.3))",
                        }}
                    />
                ) : (
                    <FiXCircle
                        className="h-3 w-3 text-red-500"
                        style={{
                            filter: isDark
                                ? "drop-shadow(0 0 4px rgba(239, 68, 68, 0.5))"
                                : "drop-shadow(0 0 2px rgba(239, 68, 68, 0.3))",
                        }}
                    />
                )}
                <span
                    className={`font-semibold ${
                        isDark
                            ? "text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.3)]"
                            : "text-gray-900 drop-shadow-[0_0_2px_rgba(0,0,0,0.2)]"
                    }`}
                >
          {isExecuted ? "EXECUTADO" : "NÃO EXECUTADO"}
        </span>
            </div>

            {/* Separador */}
            <div className={`w-px h-4 ${isDark ? "bg-gray-700" : "bg-gray-300"}`} />

            {/* Posição do INÍCIO */}
            <div className="flex items-center gap-1">
                <FiMapPin
                    className="h-3 w-3 text-blue-500"
                    style={{
                        filter: isDark
                            ? "drop-shadow(0 0 4px rgba(59, 130, 246, 0.5))"
                            : "drop-shadow(0 0 2px rgba(59, 130, 246, 0.3))",
                    }}
                />
                <span
                    className={`font-mono ${
                        isDark
                            ? "text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.3)]"
                            : "text-gray-900 drop-shadow-[0_0_2px_rgba(0,0,0,0.2)]"
                    }`}
                >
          INÍCIO: ({Math.round(startPosition.x)}, {Math.round(startPosition.y)})
        </span>
            </div>

            {/* Separador */}
            <div className={`w-px h-4 ${isDark ? "bg-gray-700" : "bg-gray-300"}`} />

            {/* Posição do Mouse */}
            <div className="flex items-center gap-1">
                <span className="text-purple-500">🖱️</span>
                <span className={`font-mono ${isDark ? "text-white" : "text-gray-900"}`}>
          Mouse: ({Math.round(mousePosition.x)}, {Math.round(mousePosition.y)})
        </span>
            </div>

            {/* Separador */}
            <div className={`w-px h-4 ${isDark ? "bg-gray-700" : "bg-gray-300"}`} />

            {/* Contador de Componentes */}
            <div className="flex items-center gap-1">
                <FiLayers className="h-3 w-3 text-orange-500" />
                <span className={isDark ? "text-white" : "text-gray-900"}>
          <span className="font-semibold">{componentCount}</span> componentes
        </span>
            </div>
        </div>
    )
}

// Flow Header
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
                        onOpenBot,
                        startPosition,
                        mousePosition,
                        componentCount,
                    }: any) => {
    const router = useRouter()
    const { theme, toggleTheme } = useTheme()
    const [searchValue, setSearchValue] = useState("")
    const [showResetDialog, setShowResetDialog] = useState(false)
    const [showExecuteDialog, setShowExecuteDialog] = useState(false)

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

    const handleExecute = () => {
        if (onExecute) {
            onExecute()
            setShowExecuteDialog(true)
        }
    }

    const isDark = theme === "dark"

    const getButtonStyle = () => ({
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
                        style={getButtonStyle()}
                    >
                        <FiArrowLeft />
                    </button>

                    <button
                        onClick={onToggleSidebar}
                        className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                            isDark ? "hover:bg-gray-800 text-gray-300" : "hover:bg-gray-100 text-gray-600"
                        }`}
                        title="Mostrar/Ocultar Componentes"
                        style={getButtonStyle()}
                    >
                        <FiSidebar />
                    </button>

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
                                />
                            </div>
                        </form>

                        <button
                            onClick={onZoomOut}
                            className={`p-2 rounded-md transition-colors ${
                                isDark ? "hover:bg-gray-800 text-gray-300" : "hover:bg-gray-100 text-gray-600"
                            }`}
                            title="Diminuir Zoom"
                            style={getButtonStyle()}
                        >
                            <FiZoomOut />
                        </button>
                        <button
                            onClick={onZoomIn}
                            className={`p-2 rounded-md transition-colors ${
                                isDark ? "hover:bg-gray-800 text-gray-300" : "hover:bg-gray-100 text-gray-600"
                            }`}
                            title="Aumentar Zoom"
                            style={getButtonStyle()}
                        >
                            <FiZoomIn />
                        </button>
                        <button
                            onClick={onFitView}
                            className={`p-2 rounded-md transition-colors ${
                                isDark ? "hover:bg-gray-800 text-gray-300" : "hover:bg-gray-100 text-gray-600"
                            }`}
                            title="Ajustar à Tela"
                            style={getButtonStyle()}
                        >
                            <FiMaximize />
                        </button>
                    </div>

                    <FlowStatusIndicator
                        startPosition={startPosition}
                        mousePosition={mousePosition}
                        componentCount={componentCount}
                        theme={theme}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={onSave}
                        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                            isDark
                                ? "hover:bg-gray-800 text-gray-300 border border-gray-700"
                                : "hover:bg-gray-50 text-gray-700 border border-gray-300"
                        }`}
                        title="Salvar Fluxo"
                        style={getButtonStyle()}
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
                    >
                        <FiRefreshCw className="inline mr-1" />
                        Resetar
                    </button>

                    <button
                        onClick={onDownload}
                        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                            isDark
                                ? "hover:bg-green-900 text-green-300 border border-green-700"
                                : "hover:bg-green-50 text-green-700 border border-green-300"
                        }`}
                        title="Download do Fluxo"
                    >
                        <FiDownload className="inline mr-1" />
                        Download
                    </button>

                    <button
                        onClick={onLoad}
                        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                            isDark
                                ? "hover:bg-gray-800 text-gray-300 border border-gray-700"
                                : "hover:bg-gray-50 text-gray-700 border border-gray-300"
                        }`}
                        title="Carregar Fluxo"
                        style={getButtonStyle()}
                    >
                        <FiDownload className="inline mr-1" />
                        Carregar
                    </button>

                    <button
                        onClick={handleExecute}
                        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                            isDark
                                ? "hover:bg-blue-900 text-blue-300 border border-blue-700"
                                : "hover:bg-blue-50 text-blue-700 border border-blue-300"
                        }`}
                        title="Executar Fluxo"
                        style={{
                            filter: isDark
                                ? "drop-shadow(0 0 4px rgba(59, 130, 246, 0.3))"
                                : "drop-shadow(0 0 2px rgba(59, 130, 246, 0.2))",
                        }}
                    >
                        <FiPlayCircle className="inline mr-1" />
                        Executar
                    </button>

                    <div className={`w-px h-6 mx-2 ${isDark ? "bg-gray-700" : "bg-gray-300"}`} />

                    <button
                        onClick={toggleTheme}
                        className={`p-2 rounded-md transition-colors ${
                            isDark ? "hover:bg-gray-800 text-gray-300" : "hover:bg-gray-100 text-gray-600"
                        }`}
                        title={isDark ? "Modo Claro" : "Modo Escuro"}
                        style={getButtonStyle()}
                    >
                        {isDark ? <FiSun /> : <FiMoon />}
                    </button>

                    <button
                        onClick={onOpenBot}
                        className={`p-2 rounded-md transition-colors ${
                            isDark ? "hover:bg-gray-800 text-gray-300" : "hover:bg-gray-100 text-gray-600"
                        }`}
                        title="Aura Assistente de IA"
                        style={getButtonStyle()}
                    >
                        <BotIcon className="h-5 w-5" />
                    </button>
                </div>
            </header>

            {/* Dialog de Reset */}
            <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
                <DialogContent
                    className={`${isDark ? "bg-black border-gray-700" : "bg-white border-gray-200"} max-w-md mx-auto rounded-xl`}
                >
                    <DialogHeader className="text-center">
                        <DialogTitle
                            className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"} flex items-center justify-center gap-2`}
                        >
                            <FiRefreshCw className="h-6 w-6 text-red-500" />
                            Resetar Fluxo
                        </DialogTitle>
                        <DialogDescription className={`${isDark ? "text-gray-300" : "text-gray-600"} mt-2`}>
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
                        >
                            Cancelar
                        </Button>
                        <Button onClick={confirmReset} className="bg-red-600 hover:bg-red-700 text-white font-semibold">
                            <FiRefreshCw className="inline mr-1" />
                            Resetar
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Dialog de Fluxo Executado */}
            <Dialog open={showExecuteDialog} onOpenChange={setShowExecuteDialog}>
                <DialogContent
                    className={`${isDark ? "bg-black border-gray-700" : "bg-white border-gray-200"} max-w-md mx-auto rounded-xl`}
                    style={{
                        filter: isDark
                            ? "drop-shadow(0 0 25px rgba(34, 197, 94, 0.2))"
                            : "drop-shadow(0 0 20px rgba(34, 197, 94, 0.1))",
                    }}
                >
                    <DialogHeader className="text-center">
                        <DialogTitle
                            className={`text-2xl font-bold ${
                                isDark ? "text-white" : "text-gray-900"
                            } flex items-center justify-center gap-3`}
                            style={{
                                filter: isDark
                                    ? "drop-shadow(0 0 8px rgba(34, 197, 94, 0.4))"
                                    : "drop-shadow(0 0 4px rgba(34, 197, 94, 0.3))",
                            }}
                        >
                            🚀 Fluxo Executado!
                        </DialogTitle>
                        <DialogDescription
                            className={`${isDark ? "text-gray-300" : "text-gray-600"} mt-3 text-center text-lg`}
                            style={{
                                filter: isDark
                                    ? "drop-shadow(0 0 4px rgba(255, 255, 255, 0.2))"
                                    : "drop-shadow(0 0 2px rgba(0, 0, 0, 0.1))",
                            }}
                        >
                            ✅ <strong>Sucesso!</strong> Seu fluxo foi executado e está ativo!
                            <br />
                            <span className="text-sm mt-2 block">
                🤖 Agora o <strong>bot Aura</strong> pode usar este fluxo para conversar
              </span>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-center mt-6">
                        <Button
                            onClick={() => setShowExecuteDialog(false)}
                            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-2"
                            style={{
                                filter: "drop-shadow(0 0 8px rgba(34, 197, 94, 0.4))",
                            }}
                        >
                            🎉 Perfeito!
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

// Component principal
const FlowLayout = () => {
    const { theme, showColorPanel, showSearch, currentGradient, showChannelModal, setShowChannelModal } = useTheme()
    const [mounted, setMounted] = useState(false)
    const [workflowActions, setWorkflowActions] = useState<any>(null)
    const [startPosition, setStartPosition] = useState({ x: 250, y: 100 })
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
    const [componentCount, setComponentCount] = useState(1)
    const [showSidebar, setShowSidebar] = useState(true)
    const [showBot, setShowBot] = useState(false)
    const [flowNodes, setFlowNodes] = useState<any[]>([])
    const [flowEdges, setFlowEdges] = useState<any[]>([])

    useEffect(() => {
        setMounted(true)
    }, [])

    const toggleSidebar = useCallback(() => {
        setShowSidebar(!showSidebar)
    }, [showSidebar])

    const openBot = useCallback(() => {
        setShowBot(true)
    }, [])

    const closeBot = useCallback(() => {
        setShowBot(false)
    }, [])

    if (!mounted) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
                <div className="text-lg">Carregando Construtor de Fluxo...</div>
            </div>
        )
    }

    return (
        <div className={`flex flex-col h-screen ${theme === "dark" ? "bg-black" : "bg-gray-50"}`}>
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
                onOpenBot={openBot}
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
                    onNodesChange={setFlowNodes}
                    onEdgesChange={setFlowEdges}
                    showSidebar={showSidebar}
                    onToggleSidebar={toggleSidebar}
                    onOpenBot={openBot}
                />
            </main>

            {/* Bot Aura que executa o fluxo salvo */}
            <AuraFlowBot isOpen={showBot} onClose={closeBot} />

            {showColorPanel && <ColorPanel />}
            {showSearch && <SearchPanel />}
            {showChannelModal && <ChannelModal isOpen={showChannelModal} onClose={() => setShowChannelModal(false)} />}
        </div>
    )
}

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

const FlowContent = () => {
    return <FlowLayout />
}

export default Flow