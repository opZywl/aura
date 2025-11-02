"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { ChevronDown, Lock, LogOut, Settings } from "lucide-react"
import { useTheme } from "./ThemeContext"

interface User {
    username: string
    name: string
    email?: string
    isDevUser?: boolean
    accessLevel?: string
}

const UserAccount: React.FC = () => {
    const { theme } = useTheme()
    const [isOpen, setIsOpen] = useState(false)
    const [showChangePassword, setShowChangePassword] = useState(false)
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [passwordError, setPasswordError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const [currentUser, setCurrentUser] = useState<User | null>(null)

    useEffect(() => {
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser)
                setCurrentUser(user)
            } catch (error) {
                console.error("Erro ao carregar dados do usuário:", error)
            }
        }
    }, [])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
                setShowChangePassword(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleLogout = () => {
        localStorage.removeItem("user")
        localStorage.removeItem("isAuthenticated")
        window.location.href = "/"
    }

    const handleSettings = () => {
        window.location.href = "/panel/access-levels"
        setIsOpen(false)
    }

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setPasswordError("")

        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordError("Todos os campos são obrigatórios")
            return
        }

        if (newPassword !== confirmPassword) {
            setPasswordError("As senhas não coincidem")
            return
        }

        if (newPassword.length < 8) {
            setPasswordError("A senha deve ter pelo menos 8 caracteres")
            return
        }

        if (currentUser?.isDevUser && currentPassword !== "1234") {
            setPasswordError("Senha atual incorreta")
            return
        }

        setIsLoading(true)

        setTimeout(() => {
            setIsLoading(false)
            alert("Senha alterada com sucesso!")
            setShowChangePassword(false)
            setCurrentPassword("")
            setNewPassword("")
            setConfirmPassword("")
            setIsOpen(false)
        }, 1000)
    }

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((word) => word.charAt(0))
            .join("")
            .toUpperCase()
            .slice(0, 2)
    }

    const getUserDisplayName = () => {
        if (!currentUser) return "User"
        if (currentUser.isDevUser) return "Lucas"
        return currentUser.name || currentUser.username || "User"
    }

    const getUserInitials = () => {
        const displayName = getUserDisplayName()
        return getInitials(displayName)
    }

    if (!currentUser) {
        return null
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <div
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-300 cursor-pointer group relative overflow-hidden ${
                    theme === "dark" ? "hover:bg-gray-800/50" : "hover:bg-blue-50/50"
                }`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div
                    className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg ${
                        theme === "dark"
                            ? "bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10"
                            : "bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5"
                    }`}
                />

                <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 relative z-10"
                    style={{
                        background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                        boxShadow: theme === "dark" ? "0 0 15px rgba(59, 130, 246, 0.4)" : "0 0 12px rgba(59, 130, 246, 0.3)",
                    }}
                >
          <span
              className="text-sm font-medium text-white transition-all duration-300"
              style={{
                  textShadow: "0 0 10px rgba(255, 255, 255, 0.8)",
              }}
          >
            {getUserInitials()}
          </span>
                </div>
                <span
                    className={`text-sm transition-all duration-300 relative z-10 ${
                        theme === "dark" ? "text-white group-hover:text-blue-300" : "text-gray-900 group-hover:text-blue-700"
                    }`}
                    style={{
                        textShadow: theme === "dark" ? "0 0 10px rgba(59, 130, 246, 0.4)" : "0 0 8px rgba(59, 130, 246, 0.3)",
                    }}
                >
          Olá, {getUserDisplayName()}!
        </span>
                <ChevronDown
                    className={`w-4 h-4 transition-all duration-300 relative z-10 ${isOpen ? "rotate-180" : ""} ${
                        theme === "dark" ? "text-gray-400 group-hover:text-blue-400" : "text-gray-600 group-hover:text-blue-600"
                    }`}
                    style={{
                        filter:
                            theme === "dark"
                                ? "drop-shadow(0 0 6px rgba(59, 130, 246, 0.4))"
                                : "drop-shadow(0 0 4px rgba(59, 130, 246, 0.3))",
                    }}
                />
            </div>

            {isOpen && (
                <div
                    className={`absolute right-0 top-full mt-2 w-64 rounded-lg shadow-lg border z-50 ${
                        theme === "dark" ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
                    }`}
                    style={{
                        boxShadow: theme === "dark" ? "0 10px 25px rgba(0, 0, 0, 0.5)" : "0 10px 25px rgba(0, 0, 0, 0.15)",
                    }}
                >
                    {!showChangePassword ? (
                        <div className="py-2">
                            <div className={`px-4 py-3 border-b ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}>
                                <div className="flex items-center space-x-3">
                                    <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center"
                                        style={{
                                            background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                                        }}
                                    >
                                        <span className="text-white font-medium">{getUserInitials()}</span>
                                    </div>
                                    <div>
                                        <p className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                                            {getUserDisplayName()}
                                        </p>
                                        <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                                            @{currentUser.username}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="py-1">
                                <button
                                    onClick={() => setShowChangePassword(true)}
                                    className={`w-full flex items-center px-4 py-2 text-sm transition-colors ${
                                        theme === "dark"
                                            ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                    }`}
                                >
                                    <Lock className="w-4 h-4 mr-3" />
                                    Alterar Senha
                                </button>

                                <button
                                    onClick={handleSettings}
                                    className={`w-full flex items-center px-4 py-2 text-sm transition-colors ${
                                        theme === "dark"
                                            ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                    }`}
                                >
                                    <Settings className="w-4 h-4 mr-3" />
                                    Configurações
                                </button>

                                <div className={`border-t my-1 ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`} />

                                <button
                                    onClick={handleLogout}
                                    className={`w-full flex items-center px-4 py-2 text-sm transition-colors ${
                                        theme === "dark"
                                            ? "text-red-400 hover:bg-red-900/20 hover:text-red-300"
                                            : "text-red-600 hover:bg-red-50 hover:text-red-700"
                                    }`}
                                >
                                    <LogOut className="w-4 h-4 mr-3" />
                                    Sair
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4">
                            <h3 className={`text-lg font-medium mb-4 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                                Alterar Senha
                            </h3>

                            <form onSubmit={handleChangePassword} className="space-y-4">
                                <div>
                                    <label
                                        className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                                    >
                                        Senha Atual
                                    </label>
                                    <input
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className={`w-full px-3 py-2 rounded-md border text-sm ${
                                            theme === "dark"
                                                ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                                                : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                                        }`}
                                        placeholder="Digite sua senha atual"
                                        required
                                    />
                                </div>

                                <div>
                                    <label
                                        className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                                    >
                                        Nova Senha
                                    </label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className={`w-full px-3 py-2 rounded-md border text-sm ${
                                            theme === "dark"
                                                ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                                                : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                                        }`}
                                        placeholder="Digite a nova senha"
                                        required
                                    />
                                </div>

                                <div>
                                    <label
                                        className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                                    >
                                        Confirmar Senha
                                    </label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className={`w-full px-3 py-2 rounded-md border text-sm ${
                                            theme === "dark"
                                                ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                                                : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                                        }`}
                                        placeholder="Confirme a nova senha"
                                        required
                                    />
                                </div>

                                {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}

                                <div className="flex space-x-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowChangePassword(false)
                                            setPasswordError("")
                                            setCurrentPassword("")
                                            setNewPassword("")
                                            setConfirmPassword("")
                                        }}
                                        className={`flex-1 px-3 py-2 text-sm rounded-md border transition-colors ${
                                            theme === "dark"
                                                ? "border-gray-600 text-gray-300 hover:bg-gray-800"
                                                : "border-gray-300 text-gray-700 hover:bg-gray-50"
                                        }`}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                                    >
                                        {isLoading ? "Alterando..." : "Alterar"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default UserAccount
