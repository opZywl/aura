"use client"

import { useState } from "react"
import Home from "./features/view/Home"
import Landing from "./features/view/Landing"
import { ThemeProvider } from "./components/ThemeProvider"

export default function App() {
    const [showHome, setShowHome] = useState(false)

    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {showHome ? <Home /> : <Landing onContinue={() => setShowHome(true)} />}
        </ThemeProvider>
    )
}
