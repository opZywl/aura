"use client"

import { Suspense } from "react"
import Panel from "@/src/aura/features/view/Panel"

export default function PanelPage() {
  return (
    <Suspense fallback={<div className="p-6">Carregando painel...</div>}>
      <Panel />
    </Suspense>
  )
}
