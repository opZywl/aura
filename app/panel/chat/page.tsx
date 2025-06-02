"use client"

import { Suspense } from "react"
import dynamic from "next/dynamic"

// Importar o componente de forma dinâmica para evitar problemas de SSR
const ChatTemplate = dynamic(() => import("@/src/aura/features/view/chat/ChatTemplate"), {
  ssr: false,
})

// Página de chat independente - sem o Panel wrapper
function ChatPage() {
  return (
    <div className="h-screen w-full bg-gray-900">
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
            <div className="text-lg">Carregando chat...</div>
          </div>
        }
      >
        <ChatTemplate />
      </Suspense>
    </div>
  )
}

export default ChatPage
