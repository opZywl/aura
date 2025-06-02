"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

// Usuário de desenvolvimento padrão
const DEV_USER = {
  username: "Dev@1",
  password: "1234",
}

type User = {
  username: string
  isDevUser?: boolean
}

type AuthContextType = {
  user: User | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Verificar se o usuário está logado ao carregar a página
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Erro ao analisar dados do usuário:", error)
        localStorage.removeItem("user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    // Verificar se é o usuário de desenvolvimento
    if (username === DEV_USER.username && password === DEV_USER.password) {
      const user = { username: DEV_USER.username, isDevUser: true }
      setUser(user)
      localStorage.setItem("user", JSON.stringify(user))
      setIsLoading(false)
      return true
    }

    // Aqui você implementaria a verificação real de login
    // Por enquanto, vamos simular um login bem-sucedido para qualquer usuário
    const user = { username }
    setUser(user)
    localStorage.setItem("user", JSON.stringify(user))
    setIsLoading(false)
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    router.push("/login")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider")
  }
  return context
}
