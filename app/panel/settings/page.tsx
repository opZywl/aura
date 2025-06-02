"use client"

import { Suspense } from "react"
import Panel from "@/src/aura/features/view/Panel"

function PanelWithSettings() {
  return (
    <Panel>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Configurações</h1>
        <p>Página de configurações em desenvolvimento...</p>
      </div>
    </Panel>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-6">Carregando configurações...</div>}>
      <PanelWithSettings />
    </Suspense>
  )
}
