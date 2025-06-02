"use client"

import { Suspense } from "react"
import Panel from "@/src/aura/features/view/Panel"
import Contas from "@/src/aura/features/view/Contas"

function PanelWithContas() {
  return (
    <Panel>
      <Contas />
    </Panel>
  )
}

export default function ContasPage() {
  return (
    <Suspense fallback={<div className="p-6">Carregando contas...</div>}>
      <PanelWithContas />
    </Suspense>
  )
}
