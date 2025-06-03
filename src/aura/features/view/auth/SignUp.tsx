"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Eye, EyeOff, Mail, User, Lock, UserCheck, Key } from "lucide-react"

const DEV_USER = {
  username: "Dev@1",
  password: "1234",
}

// Código de acesso para registro
const ACCESS_CODE = "1337"

export default function SignUpPage() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [accessCode, setAccessCode] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [usernameError, setUsernameError] = useState("")
  const [accessCodeError, setAccessCodeError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const { theme, resolvedTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
      </div>
    )
  }

  const isDark = resolvedTheme === "dark"

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePassword = (password: string) => {
    return password.length >= 8
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

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setUsername(value)

    // Check if username already exists
    const existingUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
    const userExists = existingUsers.some((user: any) => user.username === value) || value === DEV_USER.username

    if (userExists) {
      setUsernameError("Este nome de usuário já está em uso")
    } else {
      setUsernameError("")
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPassword(value)

    if (value && !validatePassword(value)) {
      setPasswordError("A senha deve ter pelo menos 8 caracteres")
    } else {
      setPasswordError("")
    }
  }

  const handleAccessCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setAccessCode(value)

    if (value && value !== ACCESS_CODE) {
      setAccessCodeError("Código de acesso inválido")
    } else {
      setAccessCodeError("")
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateEmail(email)) {
      setEmailError("Por favor, digite um email válido")
      return
    }

    if (!validatePassword(password)) {
      setPasswordError("A senha deve ter pelo menos 8 caracteres")
      return
    }

    if (accessCode !== ACCESS_CODE) {
      setAccessCodeError("Código de acesso inválido")
      return
    }

    // Check if username already exists
    const existingUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
    const userExists = existingUsers.some((user: any) => user.username === username) || username === DEV_USER.username

    if (userExists) {
      setUsernameError("Este nome de usuário já está em uso")
      return
    }

    if (!firstName.trim() || !lastName.trim() || !username.trim()) return

    setIsLoading(true)

    setTimeout(() => {
      setIsLoading(false)

      // Create new user object with SUPER_ADMIN access level
      const newUser = {
        id: Date.now().toString(),
        username,
        name: `${firstName} ${lastName}`,
        firstName,
        lastName,
        email,
        password, // In a real app, this should be hashed
        accessLevel: "SUPER_ADMIN", // First registered user becomes super admin
        createdAt: new Date().toISOString(),
        isDevUser: false,
        createdBy: "SYSTEM", // System created user
      }

      // Save to registered users list
      const updatedUsers = [...existingUsers, newUser]
      localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers))

      // Auto login the new user
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: newUser.id,
          username: newUser.username,
          name: newUser.name,
          email: newUser.email,
          accessLevel: newUser.accessLevel,
          isDevUser: false,
        }),
      )
      localStorage.setItem("isAuthenticated", "true")

      // Redirect to panel
      window.location.replace("/panel")
    }, 1000)
  }

  const isFormValid =
    firstName.trim() &&
    lastName.trim() &&
    email &&
    username.trim() &&
    password &&
    accessCode &&
    !emailError &&
    !passwordError &&
    !usernameError &&
    !accessCodeError &&
    validateEmail(email) &&
    validatePassword(password) &&
    accessCode === ACCESS_CODE

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Left Section */}
      <div className="relative hidden w-1/2 p-8 lg:block">
        <div
          className={`h-full w-full overflow-hidden rounded-[40px] ${
            isDark
              ? "bg-gradient-to-b from-gray-800 via-gray-900 to-black"
              : "bg-gradient-to-b from-purple-400 via-purple-600 to-purple-900"
          }`}
        >
          <div className="flex h-full flex-col items-center justify-center px-8 text-center text-white">
            <div className="mb-8">
              <h1 className="text-3xl font-bold">AURA</h1>
            </div>
            <h2 className="mb-6 text-4xl font-bold">Comece Conosco</h2>
            <p className="mb-12 text-lg opacity-90">
              Complete estes passos simples para criar sua conta de Super Administrador.
            </p>

            <div className="w-full max-w-sm space-y-4">
              <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm border border-white/20">
                <div className="flex items-center gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-purple-600 font-bold">
                    1
                  </span>
                  <span className="text-lg font-medium">Digite o código de acesso</span>
                </div>
              </div>
              <div className="rounded-xl bg-white/5 p-4 backdrop-blur-sm border border-white/10">
                <div className="flex items-center gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white font-bold">
                    2
                  </span>
                  <span className="text-lg">Cadastre sua conta</span>
                </div>
              </div>
              <div className="rounded-xl bg-white/5 p-4 backdrop-blur-sm border border-white/10">
                <div className="flex items-center gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white font-bold">
                    3
                  </span>
                  <span className="text-lg">Torne-se Super Admin</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex w-full items-center justify-center bg-background p-6 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mx-auto max-w-sm">
            <h2 className="mb-2 text-3xl font-bold text-foreground">Criar Conta</h2>
            <p className="mb-8 text-muted-foreground">
              Digite o código de acesso e seus dados para criar uma conta de Super Administrador.
            </p>

            <form onSubmit={handleSignUp} className="space-y-6">
              {/* Access Code Field */}
              <div className="space-y-2">
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className={`h-12 pl-10 bg-background border-input text-foreground placeholder:text-muted-foreground ${
                      accessCodeError ? "border-red-500" : ""
                    }`}
                    placeholder="Código de acesso"
                    type="text"
                    value={accessCode}
                    onChange={handleAccessCodeChange}
                    required
                  />
                </div>
                {accessCodeError ? (
                  <p className="text-sm text-red-500">{accessCodeError}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Digite o código de acesso para criar uma conta de Super Administrador.
                  </p>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="h-12 pl-10 bg-background border-input text-foreground placeholder:text-muted-foreground"
                      placeholder="Nome"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="h-12 pl-10 bg-background border-input text-foreground placeholder:text-muted-foreground"
                      placeholder="Sobrenome"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className={`h-12 pl-10 bg-background border-input text-foreground placeholder:text-muted-foreground ${
                      emailError ? "border-red-500" : ""
                    }`}
                    placeholder="seu@email.com"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    required
                  />
                </div>
                {emailError && <p className="text-sm text-red-500">{emailError}</p>}
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <UserCheck className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className={`h-12 pl-10 bg-background border-input text-foreground placeholder:text-muted-foreground ${
                      usernameError ? "border-red-500" : ""
                    }`}
                    placeholder="Nome de usuário"
                    type="text"
                    value={username}
                    onChange={handleUsernameChange}
                    required
                  />
                </div>
                {usernameError ? (
                  <p className="text-sm text-red-500">{usernameError}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Este será seu nome de usuário para fazer login.</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className={`h-12 pl-10 pr-10 bg-background border-input text-foreground placeholder:text-muted-foreground ${
                      passwordError ? "border-red-500" : ""
                    }`}
                    placeholder="Sua melhor senha"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={handlePasswordChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
                {!passwordError && password && (
                  <p className={`text-sm ${validatePassword(password) ? "text-green-500" : "text-muted-foreground"}`}>
                    Deve ter pelo menos 8 caracteres.
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="h-12 w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                disabled={isLoading || !isFormValid}
              >
                {isLoading ? "Criando conta..." : "Criar Conta de Super Admin"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Já tem uma conta?{" "}
                <a href="/login" className="text-foreground hover:underline font-medium transition-colors">
                  Fazer login
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
