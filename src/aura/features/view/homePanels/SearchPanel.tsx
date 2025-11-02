"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X, Search } from "lucide-react"
import { useTheme } from "./ThemeContext"

const SearchPanel: React.FC = () => {
    const { theme, showSearch, setShowSearch, searchQuery, setSearchQuery, glowEnabled, fadeEnabled, fadeMode } =
        useTheme()
    const [recentSearches, setRecentSearches] = useState<string[]>([])

    useEffect(() => {
        try {
            const stored = localStorage.getItem("recentSearches")
            if (stored) {
                setRecentSearches(JSON.parse(stored))
            }
        } catch (error) {
            console.error("Error loading recent searches:", error)
        }

        if (showSearch) {
            setTimeout(() => {
                const searchInput = document.getElementById("search-input")
                if (searchInput) {
                    searchInput.focus()
                }
            }, 100)
        }
    }, [showSearch])

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setSearchQuery(value)
    }

    const handleClose = () => {
        setShowSearch(false)
        setSearchQuery("")
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (!searchQuery.trim()) return

        const newRecentSearches = [searchQuery, ...recentSearches.filter((s) => s !== searchQuery)].slice(0, 5)
        setRecentSearches(newRecentSearches)
        localStorage.setItem("recentSearches", JSON.stringify(newRecentSearches))
    }

    const clearRecentSearches = () => {
        setRecentSearches([])
        localStorage.removeItem("recentSearches")
    }

    const selectRecentSearch = (search: string) => {
        setSearchQuery(search)
    }

    const getCategoryGlowStyle = () => {
        if (!glowEnabled) return {}
        return {
            textShadow: "0 0 8px var(--glow-color), 0 0 15px var(--glow-color-light)",
            letterSpacing: "0.05em",
        }
    }

    const getMenuItemClass = () => {
        const shouldApplyFade = fadeEnabled && fadeMode === "movement"
        return shouldApplyFade ? "fade-text-movement" : ""
    }

    if (!showSearch) return null

    return (
        <>
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={handleClose} />

            <div
                className={`fixed inset-y-0 right-0 w-80 shadow-2xl z-50 transition-all duration-300 ${
                    theme === "dark"
                        ? "bg-gray-900/95 backdrop-blur-xl border-l border-gray-700"
                        : "bg-white/95 backdrop-blur-xl border-l border-gray-200"
                }`}
                style={{
                    background:
                        theme === "dark"
                            ? "linear-gradient(180deg, #0a0a0a 0%, #111111 50%, #0a0a0a 100%)"
                            : "linear-gradient(180deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%)",
                    borderColor: theme === "dark" ? "#1a1a1a" : "#e2e8f0",
                    boxShadow: glowEnabled ? `0 0 20px var(--glow-color)` : "none",
                }}
            >
                <div className="flex flex-col h-full">
                    <div
                        className={`flex items-center justify-between p-4 border-b transition-all duration-300 ${
                            theme === "dark" ? "border-gray-700" : "border-gray-200"
                        }`}
                        style={{
                            borderColor: theme === "dark" ? "#1a1a1a" : "#e2e8f0",
                            background:
                                theme === "dark"
                                    ? "linear-gradient(90deg, #1a1a1a 0%, #0f0f0f 100%)"
                                    : "linear-gradient(90deg, #ffffff 0%, #f8fafc 100%)",
                        }}
                    >
                        <h2
                            className={`text-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                                theme === "dark" ? "text-white" : "text-gray-900"
                            } ${getMenuItemClass()}`}
                            style={getCategoryGlowStyle()}
                        >
                            Pesquisar Menu
                        </h2>
                        <button
                            onClick={handleClose}
                            className={`p-2 rounded-full transition-all duration-300 hover:scale-110 transform hover:rotate-90 ${
                                theme === "dark"
                                    ? "hover:bg-gray-800 text-gray-400 hover:text-white"
                                    : "hover:bg-gray-100 text-gray-500 hover:text-gray-900"
                            }`}
                            style={
                                glowEnabled
                                    ? {
                                        filter: `drop-shadow(0 0 8px var(--glow-color))`,
                                        textShadow: `0 0 8px var(--glow-color)`,
                                    }
                                    : {}
                            }
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-4">
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                id="search-input"
                                type="text"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                placeholder="Digite para filtrar..."
                                className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-300 ${
                                    theme === "dark"
                                        ? "bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:bg-gray-800 focus:border-blue-500"
                                        : "bg-gray-50/50 border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-500"
                                } focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${getMenuItemClass()}`}
                                style={
                                    glowEnabled
                                        ? {
                                            borderColor: "var(--glow-color)",
                                            boxShadow: "0 0 10px var(--glow-color-light)",
                                            textShadow: `0 0 8px var(--glow-color)`,
                                        }
                                        : {}
                                }
                            />
                            <Search
                                className={`absolute left-3 top-3.5 w-5 h-5 transition-all duration-300 ${
                                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                                }`}
                                style={
                                    glowEnabled
                                        ? {
                                            filter: `drop-shadow(0 0 8px var(--glow-color))`,
                                            textShadow: `0 0 8px var(--glow-color)`,
                                        }
                                        : {}
                                }
                            />
                        </form>

                        {searchQuery && (
                            <p
                                className={`text-xs mt-2 transition-all duration-300 ${
                                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                                } ${getMenuItemClass()}`}
                                style={getCategoryGlowStyle()}
                            >
                                Filtrando por "{searchQuery}"
                            </p>
                        )}
                    </div>

                    {!searchQuery && recentSearches.length > 0 && (
                        <div className="px-4 py-2">
                            <div className="flex items-center justify-between mb-3">
                                <h3
                                    className={`text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                                    } ${getMenuItemClass()}`}
                                    style={getCategoryGlowStyle()}
                                >
                                    Pesquisas Recentes
                                </h3>
                                <button
                                    onClick={clearRecentSearches}
                                    className={`text-xs transition-all duration-300 transform hover:scale-105 ${
                                        theme === "dark" ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"
                                    } hover:underline ${getMenuItemClass()}`}
                                    style={
                                        glowEnabled
                                            ? {
                                                textShadow: `0 0 8px var(--glow-color)`,
                                                filter: `drop-shadow(0 0 6px var(--glow-color))`,
                                            }
                                            : {}
                                    }
                                >
                                    Limpar
                                </button>
                            </div>
                            <div className="space-y-1">
                                {recentSearches.map((search, index) => (
                                    <button
                                        key={index}
                                        onClick={() => selectRecentSearch(search)}
                                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-300 transform hover:scale-[1.02] relative overflow-hidden group ${
                                            theme === "dark"
                                                ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                                                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                        } ${getMenuItemClass()}`}
                                        style={
                                            glowEnabled
                                                ? {
                                                    textShadow: `0 0 6px var(--glow-color)`,
                                                }
                                                : {}
                                        }
                                    >
                                        {glowEnabled && (
                                            <>
                                                <div
                                                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md"
                                                    style={{
                                                        background: `linear-gradient(90deg, var(--glow-color), transparent, var(--glow-color))`,
                                                        opacity: 0.1,
                                                    }}
                                                />
                                                <div
                                                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md blur-xl scale-110"
                                                    style={{
                                                        background: `var(--glow-color)`,
                                                        opacity: 0.05,
                                                    }}
                                                />
                                            </>
                                        )}
                                        <Search
                                            className="w-3 h-3 inline mr-2 opacity-50 relative z-10"
                                            style={
                                                glowEnabled
                                                    ? {
                                                        filter: `drop-shadow(0 0 6px var(--glow-color))`,
                                                    }
                                                    : {}
                                            }
                                        />
                                        <span className="relative z-10">{search}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto p-4">
                        <div
                            className={`text-center py-8 transition-all duration-300 ${
                                theme === "dark" ? "text-gray-400" : "text-gray-500"
                            } ${getMenuItemClass()}`}
                        >
                            {searchQuery ? (
                                <div>
                                    <Search
                                        className="w-8 h-8 mx-auto mb-2 opacity-50 transition-all duration-300"
                                        style={
                                            glowEnabled
                                                ? {
                                                    filter: `drop-shadow(0 0 10px var(--glow-color))`,
                                                }
                                                : {}
                                        }
                                    />
                                    <p className="text-sm" style={getCategoryGlowStyle()}>
                                        Filtrando por
                                        <br />
                                        <span className="font-medium">"{searchQuery}"</span>
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <Search
                                        className="w-8 h-8 mx-auto mb-2 opacity-50 transition-all duration-300"
                                        style={
                                            glowEnabled
                                                ? {
                                                    filter: `drop-shadow(0 0 10px var(--glow-color))`,
                                                }
                                                : {}
                                        }
                                    />
                                    <p className="text-sm" style={getCategoryGlowStyle()}>
                                        Digite algo para filtrar os itens do menu lateral
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default SearchPanel
