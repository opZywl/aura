"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ThemeProvider, useTheme } from "./homePanels/ThemeContext"
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

interface PanelProps {
    children?: React.ReactNode
}

// Component that uses the theme context - must be inside ThemeProvider
const PanelLayout = ({ children }: PanelProps) => {
    const { theme, showColorPanel, showSearch, currentGradient, showChannelModal, setShowChannelModal } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
                <div className="text-lg">Loading...</div>
            </div>
        )
    }

    return (
        <div
            className="flex h-screen"
            style={{
                background: theme === "dark" ? "#0a0a0a" : "#f8fafc",
            }}
        >
            {/* Barra lateral elegante */}
            <PanelElegantSidebar currentGradient={currentGradient} />

            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
                <Header />
                <main className="flex-1 overflow-auto p-6">{children}</main>
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

// This component sets up the providers
const Panel = ({ children }: PanelProps) => {
    return (
        <ThemeProvider>
            <PanelContent>{children}</PanelContent>
        </ThemeProvider>
    )
}

// This is a separate component to avoid using hooks outside of ThemeProvider
const PanelContent = ({ children }: PanelProps) => {
    return <PanelLayout>{children}</PanelLayout>
}

export default Panel
