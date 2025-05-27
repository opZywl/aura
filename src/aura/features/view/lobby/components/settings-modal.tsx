"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "../components/ui/button"
import { Settings, X } from "lucide-react"
import { useSettings } from "../settings-context"

export default function SettingsModal() {
    const [isOpen, setIsOpen] = useState(false)
    const { animationsEnabled, setAnimationsEnabled, dotAnimationsEnabled, setDotAnimationsEnabled } = useSettings()

    return (
        <>
            {/* Settings Button */}
            <Button
                onClick={() => setIsOpen(true)}
                variant="ghost"
                size="icon"
                className="text-white hover:text-gray-300 transition-colors"
            >
                <Settings className="h-5 w-5" />
            </Button>

            {/* Settings Modal */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                            className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md mx-4 shadow-xl"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-semibold text-white">Preferências</h3>
                                <Button
                                    onClick={() => setIsOpen(false)}
                                    variant="ghost"
                                    size="icon"
                                    className="text-gray-400 hover:text-white"
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            <div className="space-y-6">
                                {/* Dot Animations Toggle */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-white font-medium">Pontos Animados</h4>
                                        <p className="text-gray-400 text-sm">Ativar/desativar animações de pontos brancos</p>
                                    </div>
                                    <Button
                                        onClick={() => setDotAnimationsEnabled(!dotAnimationsEnabled)}
                                        variant={dotAnimationsEnabled ? "default" : "outline"}
                                        size="sm"
                                        className={`${
                                            dotAnimationsEnabled
                                                ? "bg-blue-600 hover:bg-blue-700 text-white"
                                                : "border-gray-600 text-gray-300 hover:bg-gray-800"
                                        }`}
                                    >
                                        {dotAnimationsEnabled ? "Ativado" : "Desativado"}
                                    </Button>
                                </div>

                                {/* General Animations Toggle */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-white font-medium">Animate</h4>
                                        <p className="text-gray-400 text-sm">Ativar/desativar todos os efeitos de brilho e fade</p>
                                    </div>
                                    <Button
                                        onClick={() => setAnimationsEnabled(!animationsEnabled)}
                                        variant={animationsEnabled ? "default" : "outline"}
                                        size="sm"
                                        className={`${
                                            animationsEnabled
                                                ? "bg-blue-600 hover:bg-blue-700 text-white"
                                                : "border-gray-600 text-gray-300 hover:bg-gray-800"
                                        }`}
                                    >
                                        {animationsEnabled ? "Ativado" : "Desativado"}
                                    </Button>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-700">
                                <Button onClick={() => setIsOpen(false)} className="w-full bg-gray-700 hover:bg-gray-600 text-white">
                                    Fechar
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    )
}