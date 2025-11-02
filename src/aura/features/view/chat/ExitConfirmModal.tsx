"use client"

import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface ExitConfirmModalProps {
    onConfirmAction: () => void
    onCancelAction: () => void
    theme: string
}

export default function ExitConfirmModal({ onConfirmAction, onCancelAction, theme }: ExitConfirmModalProps) {
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className={`w-full max-w-sm p-6 ${theme === "dark" ? "bg-[#1a1a1a]" : "bg-white"} shadow-lg`}>
                <div className="flex items-center mb-4">
                    <AlertTriangle className="w-6 h-6 text-yellow-500 mr-3" />
                    <h3 className={`text-lg font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Sair do chat</h3>
                </div>

                <p className={`mb-6 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>Deseja realmente sair do chat?</p>

                <div className="flex justify-end space-x-3">
                    <Button
                        onClick={onCancelAction}
                        variant="outline"
                        className={`${theme === "dark" ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-700 hover:bg-gray-100"}`}
                    >
                        Não
                    </Button>
                    <Button onClick={onConfirmAction} className="bg-red-600 hover:bg-red-700 text-white">
                        Sim
                    </Button>
                </div>
            </div>
        </div>
    )
}
