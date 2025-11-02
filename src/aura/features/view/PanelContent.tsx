"use client"

import type React from "react"
import { useState } from "react"
import { ThemeProvider } from "./homePanels/ThemeContext"
import Sidebar from "./homePanels/Sidebar"
import Header from "./homePanels/Header"
import ColorPanel from "./homePanels/ColorPanel"
import SearchPanel from "./homePanels/SearchPanel"
import ChannelModal from "./homePanels/ChannelModal"

// Componente da barra lateral elegante para o painel
const PanelElegantSidebar = ({ currentGradient }: { currentGradient: any }) => {
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
                    style={{ background: currentGradient.glow }}
                />
                <div
                    className="absolute top-[50%] left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full panel-glow"
                    style={{ background: currentGradient.glow }}
                />
                <div
                    className="absolute top-[80%] left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full panel-glow"
                    style={{ background: currentGradient.glow }}
                />

                {/* Efeito de brilho */}
                <div
                    className="absolute top-0 left-0 w-full h-full"
                    style={{
                        background: `linear-gradient(to bottom, ${currentGradient.primary}, transparent, ${currentGradient.secondary})`,
                        opacity: 0.2,
                    }}
                />
            </div>
        </div>
    )
}

const PanelContentInner: React.FC = () => {
    const [showColorPanel, setShowColorPanel] = useState(false)
    const [showSearch, setShowSearch] = useState(false)
    const [showChannelModal, setShowChannelModal] = useState(false)

    // Gradiente padrão simples
    const currentGradient = {
        primary: "#3b82f6",
        secondary: "#8b5cf6",
        glow: "#3b82f6",
    }

    return (
        <div className="flex h-screen bg-[#0a0a0a]">
            {/* Barra lateral elegante */}
            <PanelElegantSidebar currentGradient={currentGradient} />

            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
                <Header />
                <main className="flex-1 overflow-auto p-6">
                    <div className="text-white">
                        <h1 className="text-2xl font-bold mb-4">Painel Principal</h1>
                        <p>Bem-vindo ao painel de controle!</p>
                    </div>
                </main>
            </div>

            {/* Color Panel */}
            {showColorPanel && <ColorPanel />}

            {/* Search Panel */}
            {showSearch && <SearchPanel />}

            {/* Channel Modal */}
            {showChannelModal && <ChannelModal isOpen={showChannelModal} onClose={() => setShowChannelModal(false)} />}
        </div>
    )
}

const PanelContent: React.FC = () => {
    return (
        <ThemeProvider>
            <PanelContentInner />
        </ThemeProvider>
    )
}
