"use client"

import { useState, useEffect } from "react"

interface PagePermission {
    id: string
    name: string
    category: string
    icon: string
}

export function useChannelPermissions() {
    const [currentUser, setCurrentUser] = useState<any>(null)
    const [allowedPages, setAllowedPages] = useState<PagePermission[]>([])

    // Available pages/sections in the sidebar
    const availablePages: PagePermission[] = [
        // MENU
        { id: "dashboard", name: "Dashboard", category: "MENU", icon: "📊" },

        // TOOLS
        { id: "account", name: "Conta", category: "TOOLS", icon: "👥" },
        { id: "lobby", name: "Lobby", category: "TOOLS", icon: "🏠" },

        // INSIGHTS
        { id: "chat", name: "Chat", category: "INSIGHTS", icon: "💬" },

        // ELEMENTS
        { id: "components", name: "Componentes", category: "ELEMENTS", icon: "🧩" },

        // THEMES
        { id: "colors", name: "Cores", category: "THEMES", icon: "🎨" },
    ]

    useEffect(() => {
        // Load current user from localStorage
        try {
            const storedUser = localStorage.getItem("user")
            if (storedUser) {
                const user = JSON.parse(storedUser)
                setCurrentUser(user)

                // If user is DEV or SUPER_ADMIN, they have access to all pages
                if (user.accessLevel === "DEV" || user.accessLevel === "SUPER_ADMIN") {
                    setAllowedPages(availablePages)
                }
                // Otherwise, filter pages based on user permissions
                else if (user.allowedChannels && Array.isArray(user.allowedChannels)) {
                    const userPages = availablePages.filter((page) => user.allowedChannels.includes(page.id))
                    setAllowedPages(userPages)
                } else {
                    // Default: only dashboard for users without explicit permissions
                    setAllowedPages(availablePages.filter((page) => page.id === "dashboard"))
                }
            } else {
                // Se não há usuário logado, dar acesso total (para desenvolvimento)
                setAllowedPages(availablePages)
            }
        } catch (error) {
            console.error("Error loading user permissions:", error)
            // Em caso de erro, dar acesso total (para desenvolvimento)
            setAllowedPages(availablePages)
        }
    }, [])

    // Check if user has access to a specific page
    const hasPageAccess = (pageId: string): boolean => {
        // DEV and SUPER_ADMIN have access to all pages
        if (currentUser?.accessLevel === "DEV" || currentUser?.accessLevel === "SUPER_ADMIN") {
            return true
        }

        // Check if page is in user's allowed pages
        return allowedPages.some((page) => page.id === pageId)
    }

    // Get allowed pages by category
    const getAllowedPagesByCategory = (category: string): PagePermission[] => {
        return allowedPages.filter((page) => page.category === category)
    }

    const canAccessChat = (): boolean => {
        return hasPageAccess("chat")
    }

    return {
        currentUser,
        allowedPages,
        hasPageAccess,
        getAllowedPagesByCategory,
        availablePages,
        canAccessChat,
    }
}
