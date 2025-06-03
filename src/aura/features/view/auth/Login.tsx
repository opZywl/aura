"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Eye, EyeOff, Mail, User, Lock } from "lucide-react"

// Usuário de desenvolvimento padrão
const DEV_USER = {
  username: "Dev@1",
  password: "1234",
}

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [emailError, setEmailError] = useState("")
  const [loginError, setLoginError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isDevMode, setIsDevMode] = useState(false)
  const router = useRouter()
  const { theme } = useTheme()

  const isDark = theme === "dark" || theme === "system"

  // Verificar se estamos em modo de desenvolvimento
  useEffect(() => {
    setIsDevMode(process.env.NODE_ENV === "development" || window.location.hostname === "localhost")
  }, [])

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)

    if (value && !validateEmail(value)) {
      setEmailError("Por favor, digite um email válido")
    } else {
      setEmailError("")
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) return

    setIsLoading(true)
    setLoginError("")

    // Verificar se é o usuário de desenvolvimento
    if (username === DEV_USER.username && password === DEV_USER.password) {
      // Salvar no localStorage para manter o login
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: "dev-user",
          username: DEV_USER.username,
          name: "Lucas",
          accessLevel: "DEV",
          isDevUser: true,
        }),
      )
      localStorage.setItem("isAuthenticated", "true")

      // Usar router.push em vez de window.location.replace
      setTimeout(() => {
        setIsLoading(false)
        router.push("/panel")
      }, 500)
      return
    }

    // Verificar usuários registrados
    const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
    const user = registeredUsers.find((u: any) => u.username === username)

    setTimeout(() => {
      setIsLoading(false)

      if (user && user.password === password) {
        // Verificar se a senha bate
        // Login bem-sucedido
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: user.id,
            username: user.username,
            name: user.name,
            email: user.email,
            accessLevel: user.accessLevel,
            allowedChannels: user.allowedChannels || [], // Incluir canais permitidos
            isDevUser: false,
          }),
        )
        localStorage.setItem("isAuthenticated", "true")

        // Usar router.push em vez de window.location.replace
        router.push("/panel")
      } else {
        // Login falhou
        setLoginError("Nome de usuário ou senha incorretos")
      }
    }, 1000)
  }

  // Função para preencher automaticamente o usuário de desenvolvimento
  const fillDevCredentials = () => {
    setUsername(DEV_USER.username)
    setPassword(DEV_USER.password)
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !validateEmail(email)) {
      setEmailError("Por favor, digite um email válido")
      return
    }

    setIsLoading(true)

    setTimeout(() => {
      setIsLoading(false)
      alert("Email de recuperação enviado com sucesso!")
      setShowForgotPassword(false)
      setEmail("")
      setEmailError("")
    }, 1000)
  }

  const bgClass = isDark ? "bg-black" : "bg-white"
  const textClass = isDark ? "text-white" : "text-gray-900"
  const textSecondaryClass = isDark ? "text-gray-400" : "text-gray-600"
  const inputClass = isDark
    ? "border-gray-800 bg-gray-900 text-white placeholder:text-gray-400"
    : "border-gray-300 bg-white text-gray-900 placeholder:text-gray-500"
  const buttonClass = isDark ? "bg-white text-black hover:bg-gray-100" : "bg-black text-white hover:bg-gray-800"

  if (showForgotPassword) {
    return (
      <div className={`flex min-h-screen ${bgClass}`}>
        {/* Left Section */}
        <div className="relative hidden w-1/2 p-8 lg:block">
          <div className="h-full w-full overflow-hidden rounded-[40px] bg-gradient-to-b from-purple-400 via-purple-600 to-purple-900">
            <div className="flex h-full flex-col items-center justify-center px-8 text-center text-white">
              <div className="mb-8">
                <h1 className="text-3xl font-bold">AURA</h1>
              </div>
              <h2 className="mb-6 text-4xl font-bold">Recuperar Senha</h2>
              <p className="mb-12 text-lg opacity-90">Digite seu email para receber as instruções de recuperação.</p>

              <div className="w-full max-w-sm space-y-4">
                <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm border border-white/20">
                  <div className="flex items-center gap-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-purple-600 font-bold">
                      1
                    </span>
                    <span className="text-lg font-medium">Digite seu email</span>
                  </div>
                </div>
                <div className="rounded-xl bg-white/5 p-4 backdrop-blur-sm border border-white/10">
                  <div className="flex items-center gap-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white font-bold">
                      2
                    </span>
                    <span className="text-lg">Verifique sua caixa de entrada</span>
                  </div>
                </div>
                <div className="rounded-xl bg-white/5 p-4 backdrop-blur-sm border border-white/10">
                  <div className="flex items-center gap-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white font-bold">
                      3
                    </span>
                    <span className="text-lg">Redefina sua senha</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className={`flex w-full items-center justify-center ${bgClass} p-6 lg:w-1/2`}>
          <div className="w-full max-w-md">
            <div className="mx-auto max-w-sm">
              <h2 className={`mb-2 text-3xl font-bold ${textClass}`}>Esqueceu a Senha?</h2>
              <p className={`mb-8 ${textSecondaryClass}`}>
                Digite seu email para receber as instruções de recuperação.
              </p>

              <form onSubmit={handleForgotPassword} className="space-y-6">
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className={`absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 ${textSecondaryClass}`} />
                    <Input
                      className={`h-12 pl-10 ${inputClass} ${emailError ? "border-red-500" : ""}`}
                      placeholder="seu@email.com"
                      type="email"
                      value={email}
                      onChange={handleEmailChange}
                      required
                    />
                  </div>
                  {emailError && <p className="text-sm text-red-500">{emailError}</p>}
                </div>

                <Button
                  type="submit"
                  className={`h-12 w-full ${buttonClass}`}
                  disabled={isLoading || !!emailError || !email}
                >
                  {isLoading ? "Enviando..." : "Enviar Email de Recuperação"}
                </Button>

                <p className={`text-center text-sm ${textSecondaryClass}`}>
                  Lembrou da senha?{" "}
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className={`${isDark ? "text-white" : "text-black"} hover:underline font-medium`}
                  >
                    Voltar ao Login
                  </button>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex min-h-screen ${bgClass}`}>
      {/* Left Section */}
      <div className="relative hidden w-1/2 p-8 lg:block">
        <div className="h-full w-full overflow-hidden rounded-[40px] bg-gradient-to-b from-purple-400 via-purple-600 to-purple-900">
          <div className="flex h-full flex-col items-center justify-center px-8 text-center text-white">
            <div className="mb-8">
              <h1 className="text-3xl font-bold">AURA</h1>
            </div>
            <h2 className="mb-6 text-4xl font-bold">Bem-vindo de Volta</h2>
            <p className="mb-12 text-lg opacity-90">Faça login para acessar sua conta e continuar sua jornada.</p>

            <div className="w-full max-w-sm space-y-4">
              <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm border border-white/20">
                <div className="flex items-center gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-purple-600 font-bold">
                    1
                  </span>
                  <span className="text-lg font-medium">Digite suas credenciais</span>
                </div>
              </div>
              <div className="rounded-xl bg-white/5 p-4 backdrop-blur-sm border border-white/10">
                <div className="flex items-center gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white font-bold">
                    2
                  </span>
                  <span className="text-lg">Acesse sua conta</span>
                </div>
              </div>
              <div className="rounded-xl bg-white/5 p-4 backdrop-blur-sm border border-white/10">
                <div className="flex items-center gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white font-bold">
                    3
                  </span>
                  <span className="text-lg">Continue sua jornada</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className={`flex w-full items-center justify-center ${bgClass} p-6 lg:w-1/2`}>
        <div className="w-full max-w-md">
          <div className="mx-auto max-w-sm">
            <h2 className={`mb-2 text-3xl font-bold ${textClass}`}>Login</h2>
            <p className={`mb-8 ${textSecondaryClass}`}>Digite suas credenciais para acessar sua conta.</p>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <div className="relative">
                  <User className={`absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 ${textSecondaryClass}`} />
                  <Input
                    className={`h-12 pl-10 ${inputClass}`}
                    placeholder="Nome de usuário"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Lock className={`absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 ${textSecondaryClass}`} />
                  <Input
                    className={`h-12 pl-10 pr-10 ${inputClass}`}
                    placeholder="Sua senha"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${textSecondaryClass} hover:${textClass}`}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {loginError && <p className="text-red-500 text-sm">{loginError}</p>}

              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className={`text-sm ${textSecondaryClass} hover:${textClass} font-medium`}
                >
                  Esqueceu a senha?
                </button>

                {isDevMode && (
                  <button
                    type="button"
                    onClick={fillDevCredentials}
                    className={`text-sm ${textSecondaryClass} hover:${textClass} font-medium`}
                  >
                    Dev Login
                  </button>
                )}
              </div>

              <Button
                type="submit"
                className={`h-12 w-full ${buttonClass}`}
                disabled={isLoading || !username.trim() || !password.trim()}
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>

              <p className={`text-center text-sm ${textSecondaryClass}`}>
                Não tem uma conta?{" "}
                <a href="/signup" className={`${isDark ? "text-white" : "text-black"} hover:underline font-medium`}>
                  Cadastre-se
                </a>
              </p>
            </form>

            {/* Informações do usuário de desenvolvimento (visível apenas em modo de desenvolvimento) */}
            {isDevMode && (
              <div
                className={`mt-8 p-3 rounded-lg border ${isDark ? "border-gray-800 bg-gray-900/50" : "border-gray-200 bg-gray-50"}`}
              >
                <h3 className={`text-sm font-medium mb-2 ${textClass}`}>Usuário de Desenvolvimento</h3>
                <div className={`text-xs ${textSecondaryClass}`}>
                  <p>
                    Username: <span className={textClass}>Dev@1</span>
                  </p>
                  <p>
                    Senha: <span className={textClass}>1234</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
