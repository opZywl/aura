"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { ArrowLeft, Trash, Edit, UserPlus, Shield, Search } from "lucide-react"
import Link from "next/link"

// Tipos
interface User {
  id: string
  username: string
  name: string
  email: string
  accessLevel: "DEV" | "SUPER_ADMIN" | "AGENT" | "SUPERVISOR"
  createdBy?: string
  createdAt: string
}

export default function AccessLevelsPage() {
  const [theme, setTheme] = useState("dark")
  const [users, setUsers] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddUser, setShowAddUser] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  // Form states
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    accessLevel: "AGENT" as "DEV" | "SUPER_ADMIN" | "AGENT" | "SUPERVISOR",
  })
  const [formError, setFormError] = useState("")

  useEffect(() => {
    // Check if user is authenticated and has proper access level
    const storedUser = localStorage.getItem("user")
    if (!storedUser) {
      window.location.href = "/"
      return
    }

    try {
      const user = JSON.parse(storedUser)
      setCurrentUser(user)

      // Only DEV and SUPER_ADMIN can access this page
      if (user.accessLevel !== "DEV" && user.accessLevel !== "SUPER_ADMIN") {
        window.location.href = "/panel"
        return
      }

      // Load users from localStorage
      loadUsers()
    } catch (error) {
      console.error("Error loading user data:", error)
      window.location.href = "/"
    }

    // Sync theme with panel
    syncThemeWithPanel()

    // Listen for theme changes
    const handleStorageChange = () => {
      syncThemeWithPanel()
    }

    window.addEventListener("storage", handleStorageChange)

    // Check for theme changes every 500ms
    const themeInterval = setInterval(syncThemeWithPanel, 500)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      clearInterval(themeInterval)
    }
  }, [])

  const syncThemeWithPanel = () => {
    try {
      // Get theme from panel
      const savedTheme = localStorage.getItem("home-theme")
      const isDarkClass = document.documentElement.classList.contains("home-theme-dark")
      const isLightClass = document.documentElement.classList.contains("home-theme-light")

      let detectedTheme = "dark"

      if (savedTheme === "light" || isLightClass) {
        detectedTheme = "light"
      } else if (savedTheme === "dark" || isDarkClass) {
        detectedTheme = "dark"
      }

      if (detectedTheme !== theme) {
        setTheme(detectedTheme)

        // Apply theme classes
        document.documentElement.classList.remove("home-theme-dark", "home-theme-light")
        document.documentElement.classList.add(`home-theme-${detectedTheme}`)
      }
    } catch (error) {
      console.error("Error syncing theme:", error)
    }
  }

  const loadUsers = () => {
    try {
      const storedUsers = localStorage.getItem("registeredUsers")
      if (storedUsers) {
        const parsedUsers = JSON.parse(storedUsers)
        setUsers(parsedUsers)
      } else {
        // If no users, create default array with Dev user
        const devUser = {
          id: "dev-user",
          username: "Dev@1",
          name: "Lucas",
          email: "dev@aura.com",
          accessLevel: "DEV" as const,
          createdAt: new Date().toISOString(),
        }
        setUsers([devUser])
        localStorage.setItem("registeredUsers", JSON.stringify([devUser]))
      }
    } catch (error) {
      console.error("Error loading users:", error)
      setUsers([])
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")

    // Validation
    if (!formData.username || !formData.name || !formData.email || !formData.password) {
      setFormError("Todos os campos são obrigatórios")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError("As senhas não coincidem")
      return
    }

    if (formData.password.length < 8) {
      setFormError("A senha deve ter pelo menos 8 caracteres")
      return
    }

    // Check if username already exists
    if (users.some((user) => user.username.toLowerCase() === formData.username.toLowerCase())) {
      setFormError("Este nome de usuário já está em uso")
      return
    }

    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      username: formData.username,
      name: formData.name,
      email: formData.email,
      accessLevel: formData.accessLevel,
      createdBy: currentUser?.id,
      createdAt: new Date().toISOString(),
    }

    // Add to users array
    const updatedUsers = [...users, newUser]
    setUsers(updatedUsers)
    localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers))

    // Reset form
    setFormData({
      username: "",
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      accessLevel: "AGENT",
    })
    setShowAddUser(false)
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setFormData({
      username: user.username,
      name: user.name,
      email: user.email,
      password: "",
      confirmPassword: "",
      accessLevel: user.accessLevel,
    })
    setShowAddUser(true)
  }

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    setFormError("")

    // Validation
    if (!formData.username || !formData.name || !formData.email) {
      setFormError("Nome de usuário, nome e email são obrigatórios")
      return
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      setFormError("As senhas não coincidem")
      return
    }

    if (formData.password && formData.password.length < 8) {
      setFormError("A senha deve ter pelo menos 8 caracteres")
      return
    }

    // Check if username already exists (excluding current user)
    if (
      users.some(
        (user) => user.id !== editingUser.id && user.username.toLowerCase() === formData.username.toLowerCase(),
      )
    ) {
      setFormError("Este nome de usuário já está em uso")
      return
    }

    // Update user
    const updatedUsers = users.map((user) => {
      if (user.id === editingUser.id) {
        return {
          ...user,
          username: formData.username,
          name: formData.name,
          email: formData.email,
          accessLevel: formData.accessLevel,
        }
      }
      return user
    })

    setUsers(updatedUsers)
    localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers))

    // Reset form
    setFormData({
      username: "",
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      accessLevel: "AGENT",
    })
    setEditingUser(null)
    setShowAddUser(false)
  }

  const handleDeleteUser = (userId: string) => {
    // Cannot delete DEV user
    if (userId === "dev-user") {
      alert("Não é possível excluir o usuário de desenvolvimento")
      return
    }

    // Confirm deletion
    if (!confirm("Tem certeza que deseja excluir este usuário?")) {
      return
    }

    const updatedUsers = users.filter((user) => user.id !== userId)
    setUsers(updatedUsers)
    localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers))
  }

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getAccessLevelLabel = (level: string) => {
    switch (level) {
      case "DEV":
        return "Desenvolvedor"
      case "SUPER_ADMIN":
        return "Super Admin"
      case "AGENT":
        return "Agente"
      case "SUPERVISOR":
        return "Supervisor"
      default:
        return level
    }
  }

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case "DEV":
        return theme === "dark"
          ? "bg-purple-900/50 text-purple-300 border-purple-700"
          : "bg-purple-100 text-purple-800 border-purple-300"
      case "SUPER_ADMIN":
        return theme === "dark" ? "bg-red-900/50 text-red-300 border-red-700" : "bg-red-100 text-red-800 border-red-300"
      case "AGENT":
        return theme === "dark"
          ? "bg-blue-900/50 text-blue-300 border-blue-700"
          : "bg-blue-100 text-blue-800 border-blue-300"
      case "SUPERVISOR":
        return theme === "dark"
          ? "bg-green-900/50 text-green-300 border-green-700"
          : "bg-green-100 text-green-800 border-green-300"
      default:
        return theme === "dark"
          ? "bg-gray-800 text-gray-300 border-gray-600"
          : "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  return (
    <div
      className={`min-h-screen transition-all duration-300 ${
        theme === "dark" ? "home-bg-dark-primary" : "home-bg-light-primary"
      }`}
      style={{
        background:
          theme === "dark"
            ? "linear-gradient(180deg, #0a0a0a 0%, #111111 50%, #0a0a0a 100%)"
            : "linear-gradient(180deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link
              href="/panel"
              className={`mr-4 p-3 rounded-xl transition-all duration-300 hover:scale-110 ${
                theme === "dark" ? "home-card-hover" : "home-card-hover-light"
              }`}
              style={{
                background:
                  theme === "dark"
                    ? "linear-gradient(135deg, #1e1e1e 0%, #2a2a2a 100%)"
                    : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                boxShadow: `0 0 20px var(--glow-color)`,
              }}
            >
              <ArrowLeft
                className={`w-5 h-5 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                style={{
                  filter: `drop-shadow(0 0 8px var(--glow-color))`,
                  textShadow: `0 0 10px var(--glow-color)`,
                }}
              />
            </Link>
            <h1
              className={`text-3xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}
              style={{
                background: "var(--gradient-accent)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: `0 0 20px var(--glow-color)`,
                filter: `drop-shadow(0 0 15px var(--glow-color))`,
              }}
            >
              Níveis de Acesso
            </h1>
          </div>

          <button
            onClick={() => {
              setEditingUser(null)
              setFormData({
                username: "",
                name: "",
                email: "",
                password: "",
                confirmPassword: "",
                accessLevel: "AGENT",
              })
              setFormError("")
              setShowAddUser(true)
            }}
            className="flex items-center px-6 py-3 rounded-xl text-white font-medium transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            style={{
              background: "var(--gradient-accent)",
              boxShadow: `0 0 25px var(--glow-color)`,
              textShadow: "0 0 10px rgba(255, 255, 255, 0.8)",
            }}
          >
            <UserPlus
              className="w-5 h-5 mr-2"
              style={{
                filter: "drop-shadow(0 0 8px rgba(255, 255, 255, 0.8))",
              }}
            />
            Novo Usuário
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div
            className={`flex items-center px-4 py-3 rounded-xl border transition-all duration-300 ${
              theme === "dark" ? "home-card-hover" : "home-card-hover-light"
            }`}
            style={{
              background:
                theme === "dark"
                  ? "linear-gradient(135deg, #1e1e1e 0%, #2a2a2a 100%)"
                  : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
              borderColor: theme === "dark" ? "#3a3a3a" : "#e2e8f0",
              boxShadow: `0 0 15px var(--glow-color)`,
            }}
          >
            <Search
              className={`w-5 h-5 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
              style={{
                filter: `drop-shadow(0 0 6px var(--glow-color))`,
              }}
            />
            <input
              type="text"
              placeholder="Buscar usuários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`ml-3 w-full bg-transparent border-none focus:outline-none ${
                theme === "dark" ? "text-white placeholder-gray-400" : "text-gray-900 placeholder-gray-500"
              }`}
              style={{
                textShadow: `0 0 8px var(--glow-color)`,
              }}
            />
          </div>
        </div>

        {/* User List */}
        <div
          className={`rounded-xl overflow-hidden border transition-all duration-300 ${
            theme === "dark" ? "home-card-hover" : "home-card-hover-light"
          }`}
          style={{
            background:
              theme === "dark"
                ? "linear-gradient(135deg, #1e1e1e 0%, #2a2a2a 100%)"
                : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
            borderColor: theme === "dark" ? "#3a3a3a" : "#e2e8f0",
            boxShadow: `0 0 25px var(--glow-color)`,
          }}
        >
          <div
            className={`px-6 py-4 border-b ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}
            style={{
              background:
                theme === "dark"
                  ? "linear-gradient(90deg, #2a2a2a 0%, #1e1e1e 100%)"
                  : "linear-gradient(90deg, #f8fafc 0%, #ffffff 100%)",
            }}
          >
            <div className="grid grid-cols-12 gap-4">
              <div className={`col-span-3 font-semibold ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>
                Nome
              </div>
              <div className={`col-span-2 font-semibold ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>
                Usuário
              </div>
              <div className={`col-span-3 font-semibold ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>
                Email
              </div>
              <div className={`col-span-2 font-semibold ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>
                Nível de Acesso
              </div>
              <div
                className={`col-span-2 font-semibold text-right ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}
              >
                Ações
              </div>
            </div>
          </div>

          <div>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, index) => (
                <div
                  key={user.id}
                  className={`px-6 py-4 border-t transition-all duration-300 hover:scale-[1.01] ${
                    theme === "dark" ? "border-gray-700 hover:bg-gray-800/30" : "border-gray-200 hover:bg-gray-50/50"
                  }`}
                  style={{
                    borderColor: theme === "dark" ? "#3a3a3a" : "#e2e8f0",
                  }}
                >
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-3 flex items-center">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center mr-3 transition-all duration-300 hover:scale-110"
                        style={{
                          background: "var(--gradient-primary)",
                          boxShadow: `0 0 15px var(--glow-color)`,
                        }}
                      >
                        <span
                          className="text-white font-bold text-sm"
                          style={{
                            textShadow: "0 0 10px rgba(255, 255, 255, 0.8)",
                          }}
                        >
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </span>
                      </div>
                      <span
                        className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                        style={{
                          textShadow: `0 0 8px var(--glow-color)`,
                        }}
                      >
                        {user.name}
                      </span>
                    </div>
                    <div className={`col-span-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                      @{user.username}
                    </div>
                    <div className={`col-span-3 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                      {user.email}
                    </div>
                    <div className="col-span-2">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getAccessLevelColor(
                          user.accessLevel,
                        )}`}
                        style={{
                          boxShadow: `0 0 10px var(--glow-color)`,
                        }}
                      >
                        <Shield className="w-3 h-3 mr-1" />
                        {getAccessLevelLabel(user.accessLevel)}
                      </span>
                    </div>
                    <div className="col-span-2 flex justify-end space-x-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                          theme === "dark"
                            ? "bg-gray-800 text-blue-400 hover:bg-gray-700 hover:text-blue-300"
                            : "bg-gray-100 text-blue-600 hover:bg-gray-200 hover:text-blue-700"
                        }`}
                        style={{
                          boxShadow: `0 0 10px var(--glow-color)`,
                        }}
                        disabled={user.accessLevel === "DEV"}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                          theme === "dark"
                            ? "bg-gray-800 text-red-400 hover:bg-gray-700 hover:text-red-300"
                            : "bg-gray-100 text-red-600 hover:bg-gray-200 hover:text-red-700"
                        }`}
                        style={{
                          boxShadow: `0 0 10px var(--glow-color)`,
                        }}
                        disabled={user.accessLevel === "DEV"}
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={`px-6 py-12 text-center ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Nenhum usuário encontrado</p>
                <p className="text-sm">Tente ajustar os termos de busca</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className={`w-full max-w-md rounded-xl shadow-2xl overflow-hidden transition-all duration-300 ${
              theme === "dark" ? "home-card-hover" : "home-card-hover-light"
            }`}
            style={{
              background:
                theme === "dark"
                  ? "linear-gradient(135deg, #1e1e1e 0%, #2a2a2a 100%)"
                  : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
              boxShadow: `0 0 40px var(--glow-color)`,
            }}
          >
            <div
              className={`px-6 py-4 border-b ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}
              style={{
                background:
                  theme === "dark"
                    ? "linear-gradient(90deg, #2a2a2a 0%, #1e1e1e 100%)"
                    : "linear-gradient(90deg, #f8fafc 0%, #ffffff 100%)",
              }}
            >
              <h2
                className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                style={{
                  textShadow: `0 0 15px var(--glow-color)`,
                }}
              >
                {editingUser ? "Editar Usuário" : "Novo Usuário"}
              </h2>
            </div>

            <form onSubmit={editingUser ? handleUpdateUser : handleAddUser} className="p-6">
              <div className="space-y-4">
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 focus:scale-[1.02] ${
                      theme === "dark"
                        ? "bg-gray-800/50 border-gray-600 text-white focus:border-blue-500"
                        : "bg-gray-50/50 border-gray-300 text-gray-900 focus:border-blue-500"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    style={{
                      boxShadow: `0 0 10px var(--glow-color)`,
                    }}
                    required
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Nome de Usuário
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 focus:scale-[1.02] ${
                      theme === "dark"
                        ? "bg-gray-800/50 border-gray-600 text-white focus:border-blue-500"
                        : "bg-gray-50/50 border-gray-300 text-gray-900 focus:border-blue-500"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    style={{
                      boxShadow: `0 0 10px var(--glow-color)`,
                    }}
                    required
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 focus:scale-[1.02] ${
                      theme === "dark"
                        ? "bg-gray-800/50 border-gray-600 text-white focus:border-blue-500"
                        : "bg-gray-50/50 border-gray-300 text-gray-900 focus:border-blue-500"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    style={{
                      boxShadow: `0 0 10px var(--glow-color)`,
                    }}
                    required
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    {editingUser ? "Nova Senha (deixe em branco para manter)" : "Senha"}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 focus:scale-[1.02] ${
                      theme === "dark"
                        ? "bg-gray-800/50 border-gray-600 text-white focus:border-blue-500"
                        : "bg-gray-50/50 border-gray-300 text-gray-900 focus:border-blue-500"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    style={{
                      boxShadow: `0 0 10px var(--glow-color)`,
                    }}
                    required={!editingUser}
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Confirmar Senha
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 focus:scale-[1.02] ${
                      theme === "dark"
                        ? "bg-gray-800/50 border-gray-600 text-white focus:border-blue-500"
                        : "bg-gray-50/50 border-gray-300 text-gray-900 focus:border-blue-500"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    style={{
                      boxShadow: `0 0 10px var(--glow-color)`,
                    }}
                    required={!editingUser}
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Nível de Acesso
                  </label>
                  <select
                    name="accessLevel"
                    value={formData.accessLevel}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 focus:scale-[1.02] ${
                      theme === "dark"
                        ? "bg-gray-800/50 border-gray-600 text-white focus:border-blue-500"
                        : "bg-gray-50/50 border-gray-300 text-gray-900 focus:border-blue-500"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    style={{
                      boxShadow: `0 0 10px var(--glow-color)`,
                    }}
                  >
                    <option value="AGENT">Agente</option>
                    <option value="SUPERVISOR">Supervisor</option>
                    {currentUser?.accessLevel === "DEV" && <option value="SUPER_ADMIN">Super Admin</option>}
                  </select>
                </div>

                {formError && (
                  <div
                    className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 text-sm"
                    style={{
                      boxShadow: "0 0 15px rgba(239, 68, 68, 0.3)",
                    }}
                  >
                    {formError}
                  </div>
                )}
              </div>

              <div className="mt-8 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddUser(false)}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 ${
                    theme === "dark"
                      ? "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-900"
                  }`}
                  style={{
                    boxShadow: `0 0 15px var(--glow-color)`,
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-lg font-medium text-white transition-all duration-300 hover:scale-105"
                  style={{
                    background: "var(--gradient-accent)",
                    boxShadow: `0 0 25px var(--glow-color)`,
                    textShadow: "0 0 10px rgba(255, 255, 255, 0.8)",
                  }}
                >
                  {editingUser ? "Atualizar" : "Adicionar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
