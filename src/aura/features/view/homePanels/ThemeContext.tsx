"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import LoadingScreen from "@/components/ui/loading-screen"

type HomeTheme = "dark" | "light"

type GradientTheme = {
    name: string
    primary: string
    secondary: string
    accent: string
    glow: string
    headerBg?: string // Added optional headerBg property for custom header backgrounds
}

const gradientThemes: GradientTheme[] = [
    {
        name: "Blue Purple",
        primary: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
        secondary: "linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)",
        accent: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)",
        glow: "rgba(59, 130, 246, 0.6)",
    },
    {
        name: "Green Teal",
        primary: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
        secondary: "linear-gradient(135deg, #34d399 0%, #22d3ee 100%)",
        accent: "linear-gradient(135deg, #10b981 0%, #06b6d4 50%, #8b5cf6 100%)",
        glow: "rgba(16, 185, 129, 0.6)",
    },
    {
        name: "Orange Red",
        primary: "linear-gradient(135deg, #f97316 0%, #ef4444 100%)",
        secondary: "linear-gradient(135deg, #fb923c 0%, #f87171 100%)",
        accent: "linear-gradient(135deg, #f97316 0%, #ef4444 50%, #ec4899 100%)",
        glow: "rgba(249, 115, 22, 0.6)",
    },
    {
        name: "Purple Pink",
        primary: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
        secondary: "linear-gradient(135deg, #a78bfa 0%, #f472b6 100%)",
        accent: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #f59e0b 100%)",
        glow: "rgba(139, 92, 246, 0.6)",
    },
    {
        name: "Cyan Blue",
        primary: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
        secondary: "linear-gradient(135deg, #22d3ee 0%, #60a5fa 100%)",
        accent: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)",
        glow: "rgba(6, 182, 212, 0.6)",
    },
]

interface HomeThemeContextType {
    theme: HomeTheme
    toggleTheme: () => void
    currentGradient: GradientTheme
    setGradientTheme: (gradient: GradientTheme) => void
    gradientThemes: GradientTheme[]
    showColorPanel: boolean
    setShowColorPanel: (show: boolean) => void
    searchQuery: string
    setSearchQuery: (query: string) => void
    showSearch: boolean
    setShowSearch: (show: boolean) => void
    glowIntensity: number
    setGlowIntensity: (intensity: number) => void
    glowThickness: number
    setGlowThickness: (thickness: number) => void
    glowAnimation: boolean
    setGlowAnimation: (enabled: boolean) => void
    fadeMode: "singular" | "movement"
    setFadeMode: (mode: "singular" | "movement") => void
    fadeColor1: string
    setFadeColor1: (color: string) => void
    fadeColor2: string
    setFadeColor2: (color: string) => void
    fadeSpeed: number
    setFadeSpeed: (speed: number) => void
    glowEnabled: boolean
    setGlowEnabled: (enabled: boolean) => void
    fadeEnabled: boolean
    setFadeEnabled: (enabled: boolean) => void
    applyGlowFadeSettings: () => void
    showChannelModal: boolean
    setShowChannelModal: (show: boolean) => void
    showIntegrationsModal: boolean
    setShowIntegrationsModal: (show: boolean) => void
    sidebarCollapsed: boolean
    toggleSidebar: () => void
    setSidebarCollapsed: (collapsed: boolean) => void
}

const HomeThemeContext = createContext<HomeThemeContextType | undefined>(undefined)

export const useTheme = (): HomeThemeContextType => {
    const context = useContext(HomeThemeContext)
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider")
    }
    return context
}

interface ThemeProviderProps {
    children: ReactNode
}

export const HomeThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const [theme, setTheme] = useState<HomeTheme>("dark")
    const [currentGradient, setCurrentGradient] = useState<GradientTheme>(gradientThemes[0]) // Blue Purple theme
    const [showColorPanel, setShowColorPanel] = useState(false)
    const [showSearch, setShowSearch] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [isLoaded, setIsLoaded] = useState(false)
    const [glowIntensity, setGlowIntensity] = useState(100)
    const [glowThickness, setGlowThickness] = useState(20)
    const [glowAnimation, setGlowAnimation] = useState(false)
    const [fadeMode, setFadeMode] = useState<"singular" | "movement">("singular")
    const [fadeColor1, setFadeColor1] = useState("#3b82f6")
    const [fadeColor2, setFadeColor2] = useState("#8b5cf6")
    const [fadeSpeed, setFadeSpeed] = useState(3)
    const [glowEnabled, setGlowEnabled] = useState(true)
    const [fadeEnabled, setFadeEnabled] = useState(true)
    const [showChannelModal, setShowChannelModal] = useState(false)
    const [showIntegrationsModal, setShowIntegrationsModal] = useState(false)
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

    // Extract colors from gradient theme
    const extractColorsFromGradient = (gradient: GradientTheme) => {
        const primaryMatch = gradient.primary.match(/#[0-9a-fA-F]{6}/g)
        if (primaryMatch && primaryMatch.length >= 2) {
            return {
                color1: primaryMatch[0],
                color2: primaryMatch[1],
            }
        }
        return {
            color1: "#3b82f6",
            color2: "#8b5cf6",
        }
    }

    // Apply CSS variables immediately
    const applyCSSVariables = (gradient: GradientTheme) => {
        const root = document.documentElement
        root.style.setProperty("--gradient-primary", gradient.primary)
        root.style.setProperty("--gradient-secondary", gradient.secondary)
        root.style.setProperty("--gradient-accent", gradient.accent)
        root.style.setProperty("--glow-color", gradient.glow)

        if (gradient.headerBg) {
            root.style.setProperty("--header-bg", gradient.headerBg)
        } else {
            // Extract first color from primary gradient as fallback
            const match = gradient.primary.match(/#[0-9a-fA-F]{6}/)
            root.style.setProperty("--header-bg", match ? match[0] : "#1e293b")
        }

        // Chat specific variables
        root.style.setProperty("--chat-gradient-primary", gradient.primary)
        root.style.setProperty("--chat-gradient-secondary", gradient.secondary)
        root.style.setProperty("--chat-gradient-accent", gradient.accent)
        root.style.setProperty("--chat-glow-color", gradient.glow)
        root.style.setProperty("--chat-glow-color-light", gradient.glow.replace("0.6", "0.3"))
        root.style.setProperty("--chat-glow-color-strong", gradient.glow.replace("0.6", "0.8"))

        // Additional glow variations
        root.style.setProperty("--glow-color-light", gradient.glow.replace("0.6", "0.3"))
        root.style.setProperty("--glow-color-strong", gradient.glow.replace("0.6", "0.8"))

        // Auto-sync fade colors with theme
        const colors = extractColorsFromGradient(gradient)
        setFadeColor1(colors.color1)
        setFadeColor2(colors.color2)
    }

    // Apply glow and fade settings
    const applyGlowFadeSettings = () => {
        const root = document.documentElement

        // Aplicar configurações de glow
        if (glowEnabled) {
            root.style.setProperty("--glow-intensity", `${glowIntensity / 100}`)
            root.style.setProperty("--glow-thickness", `${glowThickness}px`)
            root.style.setProperty("--glow-blur", `${glowThickness}px`)
            root.style.setProperty("--glow-spread", `${glowThickness / 2}px`)

            const glowStyle = glowEnabled
                ? `0 0 ${glowThickness}px var(--glow-color), 0 0 ${glowThickness * 2}px var(--glow-color-light)`
                : "none"
            root.style.setProperty("--title-glow", glowStyle)

            if (glowAnimation) {
                root.style.setProperty("--glow-animation", "glow-pulse 2s ease-in-out infinite alternate")
            } else {
                root.style.setProperty("--glow-animation", "none")
            }
        } else {
            root.style.setProperty("--glow-intensity", "0")
            root.style.setProperty("--glow-thickness", "0px")
            root.style.setProperty("--glow-blur", "0px")
            root.style.setProperty("--glow-spread", "0px")
            root.style.setProperty("--title-glow", "none")
            root.style.setProperty("--glow-animation", "none")
        }

        // Aplicar configurações de fade
        if (fadeEnabled) {
            root.style.setProperty("--fade-color-1", fadeColor1)
            root.style.setProperty("--fade-color-2", fadeColor2)
            root.style.setProperty("--fade-speed", `${fadeSpeed}s`)
        }
    }

    const toggleSidebar = () => {
        const newState = !sidebarCollapsed
        setSidebarCollapsed(newState)
        localStorage.setItem("sidebarCollapsed", String(newState))
    }

    useEffect(() => {
        try {
            const savedTheme = localStorage.getItem("home-theme")
            const savedGradient = localStorage.getItem("home-gradient")
            const savedGlowFade = localStorage.getItem("panel-glow-fade-settings")
            const savedSidebarState = localStorage.getItem("sidebarCollapsed")
            const savedIntegrationsModalState = localStorage.getItem("showIntegrationsModal")

            if (savedTheme === "dark" || savedTheme === "light") {
                setTheme(savedTheme)
            }

            if (savedGradient) {
                const gradient = gradientThemes.find((g) => g.name === savedGradient)
                if (gradient) {
                    setCurrentGradient(gradient)
                    applyCSSVariables(gradient)
                } else {
                    // Se não encontrar o tema salvo, usa o azul por padrão
                    applyCSSVariables(gradientThemes[0])
                }
            } else {
                // Se não há tema salvo, aplica o azul imediatamente
                applyCSSVariables(gradientThemes[0])
            }

            if (savedSidebarState) {
                setSidebarCollapsed(savedSidebarState === "true")
            }

            if (savedIntegrationsModalState) {
                setShowIntegrationsModal(savedIntegrationsModalState === "true")
            }

            if (savedGlowFade) {
                const settings = JSON.parse(savedGlowFade)
                setGlowEnabled(settings.glowEnabled ?? true)
                setGlowIntensity(settings.glowIntensity ?? 100)
                setGlowThickness(settings.glowThickness ?? 20)
                setGlowAnimation(settings.glowAnimation ?? false)
                setFadeEnabled(settings.fadeEnabled ?? true)
                setFadeMode(settings.fadeMode ?? "singular")
                setFadeColor1(settings.fadeColor1 ?? "#3b82f6")
                setFadeColor2(settings.fadeColor2 ?? "#8b5cf6")
                setFadeSpeed(settings.fadeSpeed ?? 3)
            }
        } catch (error) {
            console.log("Error loading theme from localStorage:", error)
            // Em caso de erro, sempre aplica o tema azul
            applyCSSVariables(gradientThemes[0])
        }
        setIsLoaded(true)
    }, [])

    useEffect(() => {
        if (isLoaded) {
            try {
                localStorage.setItem("home-theme", theme)
                localStorage.setItem("home-gradient", currentGradient.name)
                applyCSSVariables(currentGradient)

                const root = document.documentElement
                root.classList.remove("home-theme-dark", "home-theme-light")
                root.classList.add(`home-theme-${theme}`)
            } catch (error) {
                console.log("Error saving theme to localStorage:", error)
            }
        }
    }, [theme, currentGradient, isLoaded])

    useEffect(() => {
        if (isLoaded) {
            applyGlowFadeSettings()
        }
    }, [
        isLoaded,
        glowEnabled,
        glowIntensity,
        glowThickness,
        glowAnimation,
        fadeEnabled,
        fadeMode,
        fadeColor1,
        fadeColor2,
        fadeSpeed,
    ])

    const toggleTheme = () => {
        setTheme((prevTheme) => {
            const newTheme = prevTheme === "dark" ? "light" : "dark"
            return newTheme
        })
    }

    const handleSetGradientTheme = (gradient: GradientTheme) => {
        setCurrentGradient(gradient)
        applyCSSVariables(gradient)
    }

    const handleSetShowColorPanel = (show: boolean) => {
        setShowColorPanel(show)
    }

    const handleSetShowSearch = (show: boolean) => {
        setShowSearch(show)
    }

    const value: HomeThemeContextType = {
        theme,
        toggleTheme,
        currentGradient,
        setGradientTheme: handleSetGradientTheme,
        gradientThemes,
        showColorPanel,
        setShowColorPanel: handleSetShowColorPanel,
        searchQuery,
        setSearchQuery,
        showSearch,
        setShowSearch: handleSetShowSearch,
        glowIntensity,
        setGlowIntensity,
        glowThickness,
        setGlowThickness,
        glowAnimation,
        setGlowAnimation,
        fadeMode,
        setFadeMode,
        fadeColor1,
        setFadeColor1,
        fadeColor2,
        setFadeColor2,
        fadeSpeed,
        setFadeSpeed,
        glowEnabled,
        setGlowEnabled,
        fadeEnabled,
        setFadeEnabled,
        applyGlowFadeSettings,
        showChannelModal,
        setShowChannelModal,
        showIntegrationsModal,
        setShowIntegrationsModal,
        sidebarCollapsed,
        toggleSidebar,
        setSidebarCollapsed,
    }

    if (!isLoaded) {
        return <LoadingScreen />
    }

    return <HomeThemeContext.Provider value={value}>{children}</HomeThemeContext.Provider>
}

export { HomeThemeProvider as ThemeProvider }
