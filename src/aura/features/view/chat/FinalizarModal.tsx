"use client"

import { Button } from "@/components/ui/button"
import { AlertTriangle, X } from "lucide-react"

interface FinalizarModalProps {
    onConfirmAction: () => void
    onCancelAction: () => void
    theme: string
}

export default function FinalizarModal({ onConfirmAction, onCancelAction, theme }: FinalizarModalProps) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div
                className={`rounded-lg p-6 w-96 max-w-md mx-4 ${
                    theme === "dark" ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
                }`}
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <h3 className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                            Finalizar Conversa
                        </h3>
                    </div>
                    <Button
                        onClick={onCancelAction}
                        variant="ghost"
                        size="icon"
                        className={`w-8 h-8 ${
                            theme === "dark"
                                ? "text-gray-400 hover:text-white hover:bg-gray-700"
                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        }`}
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                <p className={`text-sm mb-6 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                    Tem certeza que deseja finalizar esta conversa? Esta ação não pode ser desfeita.
                </p>

                <div className="flex justify-end space-x-3">
                    <Button
                        onClick={onCancelAction}
                        variant="outline"
                        className={`${
                            theme === "dark"
                                ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                                : "border-gray-300 text-gray-700 hover:bg-gray-100"
                        }`}
                    >
                        Cancelar
                    </Button>
                    <Button onClick={onConfirmAction} className="bg-red-600 hover:bg-red-700 text-white">
                        Finalizar
                    </Button>
                </div>
            </div>
        </div>
    )
}
