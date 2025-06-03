"use client"

import { useState, useEffect } from "react"

interface UserPermissions {
    role: "admin" | "user" | "viewer"
    channels: string[]
    pages: string[]
}

interface ChannelPermissionsHook {
    hasChannelAccess: (channelId: string) => boolean
    hasPageAccess: (pageId: string) => boolean
    userRole: string
    isLoading: boolean
}

export const useChannelPermissions = (): ChannelPermissionsHook => {
    const [permissions, setPermissions] = useState<UserPermissions>({
        role: "admin",
        channels: [],
        pages: [],
    })
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Simular carregamento de permissões
        const loadPermissions = async () => {
            try {
                // Aqui você faria a chamada para sua API
                // const response = await fetch('/api/user/permissions')
                // const userPermissions = await response.json()

                // Por enquanto, vamos usar permissões padrão para admin
                const defaultPermissions: UserPermissions = {
                    role: "admin",
                    channels: ["general", "support", "sales", "development"],
                    pages: [
                        "dashboard",
                        "products",
                        "account",
                        "lobby",
                        "analytics",
                        "chat",
                        "settings",
                        "components",
                        "forms",
                        "tables",
                        "colors",
                    ],
                }

                setPermissions(defaultPermissions)
            } catch (error) {
                console.error("Erro ao carregar permissões:", error)
                // Em caso de erro, dar permissões básicas
                setPermissions({
                    role: "user",
                    channels: ["general"],
                    pages: ["dashboard", "lobby", "chat"],
                })
            } finally {
                setIsLoading(false)
            }
        }

        loadPermissions()
    }, [])

    const hasChannelAccess = (channelId: string): boolean => {
        if (permissions.role === "admin") return true
        return permissions.channels.includes(channelId)
    }

    const hasPageAccess = (pageId: string): boolean => {
        if (permissions.role === "admin") return true
        return permissions.pages.includes(pageId)
    }

    return {
        hasChannelAccess,
        hasPageAccess,
        userRole: permissions.role,
        isLoading,
    }
}
