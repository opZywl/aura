"use client"

import { useEffect, useState } from "react"
import { useChannelPermissions } from "@/src/aura/hooks/use-channel-permissions"
import Chat from "../../../src/aura/features/view/Chat"
import Link from "next/link"
import { ArrowLeft, Shield } from "lucide-react"

export default function ChatPage() {
  const { hasPageAccess } = useChannelPermissions()
  const [theme, setTheme] = useState("dark")

  useEffect(() => {
    // Sync theme
    const savedTheme = localStorage.getItem("home-theme")
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  // Check if user can access chat page
  if (!hasPageAccess("chat")) {
    return (
        <div
            className={`min-h-screen flex items-center justify-center ${theme === "dark" ? "bg-gray-900" : "bg-gray-50"}`}
        >
          <div className="text-center">
            <Shield className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h1 className={`text-2xl font-bold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              Acesso Negado
            </h1>
            <p className={`mb-4 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              Você não tem permissão para acessar o chat.
            </p>
            <Link
                href="/panel"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Painel
            </Link>
          </div>
        </div>
    )
  }

  // If user has access, show the complete chat interface
  return <Chat />
}
