"use client"

import Home from "./features/view/Home"
import { ThemeProvider } from "./components/ThemeProvider"

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Home />
    </ThemeProvider>
  )
}
