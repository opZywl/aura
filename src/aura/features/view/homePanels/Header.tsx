"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Search, Sun, Moon, X, ChevronDown, Menu, PanelLeftClose } from "lucide-react"
import { useTheme } from "./ThemeContext"
import UserAccount from "./UserAccount"
import { useLanguage } from "../../../contexts/LanguageContext"

const Header: React.FC = () => {
    const {
        theme,
        toggleTheme,
        searchQuery,
        setSearchQuery,
        glowEnabled,
        fadeEnabled,
        fadeMode,
        glowThickness,
        sidebarCollapsed,
        toggleSidebar,
    } = useTheme()
    const { language, setLanguage, t } = useLanguage()
    const [isSearching, setIsSearching] = useState(false)
    const [showLanguageDropdown, setShowLanguageDropdown] = useState(false)
    const searchInputRef = useRef<HTMLInputElement>(null)
    const languageDropdownRef = useRef<HTMLDivElement>(null)
    const [currentUser, setCurrentUser] = useState<any>(null)

    useEffect(() => {
        // Get current user from localStorage
        const user = localStorage.getItem("user")
        if (user) {
            try {
                setCurrentUser(JSON.parse(user))
            } catch (error) {
                console.error("Error parsing user data:", error)
            }
        }
    }, [])

    useEffect(() => {
        if (isSearching && searchInputRef.current) {
            searchInputRef.current.focus()
        }
    }, [isSearching])

    useEffect(() => {
        // Close language dropdown when clicking outside
        const handleClickOutside = (event: MouseEvent) => {
            if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
                setShowLanguageDropdown(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    const handleSearchClick = () => {
        setIsSearching(true)
    }

    const handleSearchClose = () => {
        setIsSearching(false)
        setSearchQuery("")
    }

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value)
    }

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault()
    }

    const toggleLanguageDropdown = () => {
        setShowLanguageDropdown(!showLanguageDropdown)
    }

    const changeLanguage = (lang: "pt-BR" | "en-US") => {
        setLanguage(lang)
        setShowLanguageDropdown(false)
    }

    const getUserDisplayName = () => {
        if (!currentUser) return "Usuário"
        if (currentUser.isDevUser) return "Lucas"
        return currentUser.name || currentUser.username || "Usuário"
    }

    return (
        <div
            className={`flex items-center justify-between p-4 border-b header-glow ${
                theme === "dark" ? "border-gray-800" : "border-gray-200"
            }`}
            style={{
                background:
                    theme === "dark"
                        ? "linear-gradient(90deg, #1a1a1a 0%, #0f0f0f 100%)"
                        : "linear-gradient(90deg, #ffffff 0%, #f8fafc 100%)",
                borderBottom: glowEnabled
                    ? `1px solid var(--glow-color)`
                    : theme === "dark"
                        ? "1px solid #1a1a1a"
                        : "1px solid #e2e8f0",
                boxShadow: glowEnabled ? `0 2px ${glowThickness}px var(--glow-color)` : "none",
            }}
        >
            {/* Left side - Search or Welcome */}
            <div className="flex items-center space-x-4 flex-1">
                {/* Toggle Sidebar Button */}
                <button
                    onClick={toggleSidebar}
                    className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                        theme === "dark"
                            ? "bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700"
                            : "bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                    }`}
                    style={{
                        boxShadow: glowEnabled ? `0 0 ${glowThickness / 2}px var(--glow-color)` : "none",
                    }}
                    title={sidebarCollapsed ? "Expandir menu" : "Minimizar menu"}
                >
                    {sidebarCollapsed ? (
                        <Menu className="w-5 h-5 transition-all duration-300" />
                    ) : (
                        <PanelLeftClose className="w-5 h-5 transition-all duration-300" />
                    )}
                </button>

                {isSearching ? (
                    <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            placeholder="Buscar no painel..."
                            className={`w-full pl-10 pr-10 py-2 rounded-lg border transition-all duration-200 ${
                                theme === "dark"
                                    ? "bg-gray-800/80 border-gray-700 text-white placeholder-gray-400"
                                    : "bg-white/80 border-gray-300 text-gray-900 placeholder-gray-500"
                            } focus:outline-none focus:ring-2 focus:ring-blue-500/30`}
                            style={{
                                boxShadow: glowEnabled ? `0 0 ${glowThickness / 2}px var(--glow-color)` : "none",
                            }}
                        />
                        <Search
                            className={`absolute left-3 top-2.5 w-5 h-5 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                            style={{
                                filter: glowEnabled ? `drop-shadow(0 0 ${glowThickness / 3}px var(--glow-color))` : "none",
                            }}
                        />
                        <button
                            type="button"
                            onClick={handleSearchClose}
                            className={`absolute right-3 top-2.5 ${
                                theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-700"
                            } transition-colors`}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </form>
                ) : (
                    <>
                        <button
                            onClick={handleSearchClick}
                            className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                                theme === "dark"
                                    ? "bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700"
                                    : "bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                            }`}
                            style={{
                                boxShadow: glowEnabled ? `0 0 ${glowThickness / 2}px var(--glow-color)` : "none",
                            }}
                        >
                            <Search
                                className="w-5 h-5 transition-all duration-300"
                                style={{
                                    filter: glowEnabled ? `drop-shadow(0 0 ${glowThickness / 3}px var(--glow-color))` : "none",
                                }}
                            />
                        </button>
                        <span
                            className={`text-lg transition-all duration-300 ${fadeEnabled && fadeMode === "movement" ? "fade-text" : ""} ${
                                theme === "dark" ? "text-white hover:text-blue-300" : "text-gray-900 hover:text-blue-700"
                            }`}
                            style={{
                                textShadow: glowEnabled ? `0 0 ${glowThickness / 2}px var(--glow-color)` : "none",
                            }}
                        >
              Olá, {getUserDisplayName()}!
            </span>
                    </>
                )}
            </div>

            {/* Right side - Controls */}
            <div className="flex items-center space-x-4">
                {/* Language Selector */}
                <div className="relative" ref={languageDropdownRef}>
                    <button
                        onClick={toggleLanguageDropdown}
                        className={`flex items-center space-x-1 p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                            theme === "dark"
                                ? "bg-gray-800 text-blue-400 hover:text-blue-300 hover:bg-gray-700"
                                : "bg-gray-100 text-blue-600 hover:text-blue-700 hover:bg-gray-200"
                        }`}
                        style={{
                            boxShadow: glowEnabled ? `0 0 ${glowThickness / 2}px var(--glow-color)` : "none",
                        }}
                    >
            <span
                className={`font-medium text-sm ${fadeEnabled && fadeMode === "movement" ? "fade-text" : ""}`}
                style={{
                    textShadow: glowEnabled ? `0 0 ${glowThickness / 3}px var(--glow-color)` : "none",
                }}
            >
              {language === "pt-BR" ? "PT-BR" : "EN-US"}
            </span>
                        <ChevronDown
                            className={`w-4 h-4 transition-transform duration-300 ${
                                showLanguageDropdown ? "transform rotate-180" : ""
                            }`}
                        />
                    </button>

                    {showLanguageDropdown && (
                        <div
                            className={`absolute right-0 mt-2 w-36 rounded-lg shadow-lg z-50 border ${
                                theme === "dark" ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200 text-gray-900"
                            }`}
                            style={{
                                boxShadow: glowEnabled
                                    ? `0 10px 25px rgba(0, 0, 0, 0.2), 0 0 ${glowThickness / 2}px var(--glow-color)`
                                    : "0 10px 25px rgba(0, 0, 0, 0.2)",
                            }}
                        >
                            <div className="py-1">
                                <button
                                    onClick={() => changeLanguage("pt-BR")}
                                    className={`flex items-center w-full px-4 py-2 text-sm ${
                                        language === "pt-BR"
                                            ? theme === "dark"
                                                ? "bg-gray-700 text-blue-400"
                                                : "bg-blue-50 text-blue-700"
                                            : theme === "dark"
                                                ? "text-gray-200 hover:bg-gray-700"
                                                : "text-gray-700 hover:bg-gray-100"
                                    }`}
                                >
                                    <span className="mr-2">PT</span>
                                    <span>Português</span>
                                </button>
                                <button
                                    onClick={() => changeLanguage("en-US")}
                                    className={`flex items-center w-full px-4 py-2 text-sm ${
                                        language === "en-US"
                                            ? theme === "dark"
                                                ? "bg-gray-700 text-blue-400"
                                                : "bg-blue-50 text-blue-700"
                                            : theme === "dark"
                                                ? "text-gray-200 hover:bg-gray-700"
                                                : "text-gray-700 hover:bg-gray-100"
                                    }`}
                                >
                                    <span className="mr-2">EN</span>
                                    <span>English</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 hover:rotate-12 ${
                        theme === "dark"
                            ? "bg-gray-800 text-yellow-400 hover:text-yellow-300 hover:bg-gray-700"
                            : "bg-gray-100 text-gray-600 hover:text-blue-600 hover:bg-gray-200"
                    }`}
                    style={{
                        boxShadow: glowEnabled ? `0 0 ${glowThickness / 2}px var(--glow-color)` : "none",
                    }}
                >
                    {theme === "dark" ? (
                        <Sun
                            className="w-5 h-5 transition-all duration-500 hover:rotate-180"
                            style={{
                                filter: `drop-shadow(0 0 8px #fbbf24) drop-shadow(0 0 16px #fbbf24)`,
                                textShadow: "0 0 10px #fbbf24",
                            }}
                        />
                    ) : (
                        <Moon
                            className="w-5 h-5 transition-all duration-500 hover:rotate-180"
                            style={{
                                filter: glowEnabled ? `drop-shadow(0 0 ${glowThickness / 3}px var(--glow-color))` : "none",
                            }}
                        />
                    )}
                </button>

                {/* User Account */}
                <UserAccount />
            </div>
        </div>
    )
}

export default Header
