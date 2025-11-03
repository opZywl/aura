"use client"

import { Suspense } from "react"
import Panel from "@/src/aura/features/view/Panel"
import Statistics from "@/src/aura/features/view/Statistics"

function PanelWithStatistics() {
    return (
        <Panel>
            <Statistics />
        </Panel>
    )
}

export default function PanelPage() {
    return (
        <Suspense fallback={<div className="p-6">Carregando estatísticas...</div>}>
            <PanelWithStatistics />
        </Suspense>
    )
}
