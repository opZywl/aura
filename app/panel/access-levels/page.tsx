"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  ArrowLeft,
  Trash,
  Edit,
  UserPlus,
  Shield,
  Search,
  Check,
  BarChart3,
  Package,
  Users,
  Home,
  TrendingUp,
  MessageCircle,
  Settings,
  Layers,
  FileText,
  Table,
  Palette,
  ShoppingBag,
} from "lucide-react"
import Link from "next/link"

// Tipos
interface User {
  id: string
  username: string
  name: string
  email: string
  password?: string
  accessLevel: "DEV" | "SUPER_ADMIN" | "AGENT" | "SUPERVISOR"
  allowedChannels?: string[]
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
    allowedChannels: [] as string[],
  })

  // Icon mapping
  const iconMap = {
    BarChart3,
    Package,
    Users,
    Home,
    TrendingUp,
    MessageCircle,
    Settings,
    Layers,
    FileText,
    Table,
    Palette,
    ShoppingBag,
  }

  // Páginas disponíveis no sidebar organizadas por categoria
  const [availablePages] = useState([
    // MENU
    { id: "dashboard", name: "Dashboard", category: "MENU", icon: "BarChart3" },
    { id: "sales", name: "Vendas", category: "MENU", icon: "ShoppingBag" },

    // TOOLS
    { id: "account", name: "Conta", category: "TOOLS", icon: "Users" },
    { id: "lobby", name: "Lobby", category: "TOOLS", icon: "Home" },

    // INSIGHTS
    { id: "chat", name: "Chat", category: "INSIGHTS", icon: "MessageCircle" },

    // ELEMENTS
    { id: "components", name: "Componentes", category: "ELEMENTS", icon: "Layers" },

    // THEMES
    { id: "colors", name: "Cores", category: "THEMES", icon: "Palette" },
  ])

  const [formError, setFormError] = useState("")
  const [language, setLanguage] = useState("pt-BR")

  const t = (key: string): string => {
    const translations: Record<string, string> = {
      // Access Levels
      access_levels: "Níveis de Acesso",
      new_user: "Novo Usuário",
      search_users: "Buscar usuários...",
      name: "Nome",
      username: "Usuário",
      email: "Email",
      access_level: "Nível de Acesso",
      allowed_pages: "Páginas Permitidas",
      actions: "Ações",
      no_users_found: "Nenhum usuário encontrado",
      adjust_search_terms: "Tente ajustar os termos de busca",

      // User Form
      edit_user: "Editar Usuário",
      full_name: "Nome Completo",
      password: "Senha",
      new_password_leave_blank: "Nova Senha (deixe em branco para manter)",
      confirm_password: "Confirmar Senha",
      cancel: "Cancelar",
      save: "Salvar",
      create_user: "Criar Usuário",

      // Access Levels
      developer: "Desenvolvedor",
      super_admin: "Super Admin",
      agent: "Agente",
      supervisor: "Supervisor",

      // Error Messages
      all_fields_are_required: "Todos os campos são obrigatórios",
      passwords_do_not_match: "As senhas não coincidem",
      password_must_be_at_least_8_characters: "A senha deve ter pelo menos 8 caracteres",
      this_username_is_already_in_use: "Este nome de usuário já está em uso",
      username_name_email_required: "Nome de usuário, nome e email são obrigatórios",
      cannot_delete_dev_user: "Não é possível excluir o usuário de desenvolvimento",
      are_you_sure_delete_user: "Tem certeza que deseja excluir este usuário?",
    }

    return translations[key] || key
  }

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
      setFormError(t("all_fields_are_required"))
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError(t("passwords_do_not_match"))
      return
    }

    if (formData.password.length < 8) {
      setFormError(t("password_must_be_at_least_8_characters"))
      return
    }

    // Check if username already exists
    if (users.some((user) => user.username.toLowerCase() === formData.username.toLowerCase())) {
      setFormError(t("this_username_is_already_in_use"))
      return
    }

    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      username: formData.username,
      name: formData.name,
      email: formData.email,
      password: formData.password,
      accessLevel: formData.accessLevel,
      allowedChannels: formData.allowedChannels,
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
      allowedChannels: [],
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
      allowedChannels: user.allowedChannels || [],
    })
    setShowAddUser(true)
  }

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    setFormError("")

    // Validation
    if (!formData.username || !formData.name || !formData.email) {
      setFormError(t("username_name_email_required"))
      return
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      setFormError(t("passwords_do_not_match"))
      return
    }

    if (formData.password && formData.password.length < 8) {
      setFormError(t("password_must_be_at_least_8_characters"))
      return
    }

    // Check if username already exists (excluding current user)
    if (
      users.some(
        (user) => user.id !== editingUser.id && user.username.toLowerCase() === formData.username.toLowerCase(),
      )
    ) {
      setFormError(t("this_username_is_already_in_use"))
      return
    }

    // Update user
    const updatedUsers = users.map((user) => {
      if (user.id === editingUser.id) {
        const updatedUser = {
          ...user,
          username: formData.username,
          name: formData.name,
          email: formData.email,
          accessLevel: formData.accessLevel,
          allowedChannels: formData.allowedChannels,
        }

        // Atualizar senha apenas se foi fornecida
        if (formData.password) {
          updatedUser.password = formData.password
        }

        return updatedUser
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
      allowedChannels: [],
    })
    setEditingUser(null)
    setShowAddUser(false)
  }

  const handlePageToggle = (pageId: string) => {
    setFormData((prev) => ({
      ...prev,
      allowedChannels: prev.allowedChannels.includes(pageId)
        ? prev.allowedChannels.filter((id) => id !== pageId)
        : [...prev.allowedChannels, pageId],
    }))
  }

  const handleDeleteUser = (userId: string) => {
    // Cannot delete DEV user
    if (userId === "dev-user") {
      alert(t("cannot_delete_dev_user"))
      return
    }

    // Confirm deletion
    if (!confirm(t("are_you_sure_delete_user"))) {
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
        return t("developer")
      case "SUPER_ADMIN":
        return t("super_admin")
      case "AGENT":
        return t("agent")
      case "SUPERVISOR":
        return t("supervisor")
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

  const getIconComponent = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap]
    return IconComponent || Package // fallback icon
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
              {t("access_levels")}
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
                allowedChannels: [],
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
            {t("new_user")}
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
              placeholder={t("search_users")}
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
              <div className={`col-span-2 font-semibold ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>
                {t("name")}
              </div>
              <div className={`col-span-2 font-semibold ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>
                {t("username")}
              </div>
              <div className={`col-span-2 font-semibold ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>
                {t("email")}
              </div>
              <div className={`col-span-2 font-semibold ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>
                {t("access_level")}
              </div>
              <div className={`col-span-2 font-semibold ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>
                {t("allowed_pages")}
              </div>
              <div
                className={`col-span-2 font-semibold text-right ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}
              >
                {t("actions")}
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
                    <div className="col-span-2 flex items-center">
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
                    <div className={`col-span-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
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
                    <div className="col-span-2">
                      <div className="flex flex-wrap gap-1">
                        {(user.allowedChannels || []).slice(0, 3).map((pageId) => {
                          const page = availablePages.find((p) => p.id === pageId)
                          if (!page) return null
                          const IconComponent = getIconComponent(page.icon)
                          return (
                            <span
                              key={pageId}
                              className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                                theme === "dark"
                                  ? "bg-blue-900/50 text-blue-300 border-blue-700"
                                  : "bg-blue-100 text-blue-800 border-blue-300"
                              } border`}
                              title={page.name}
                            >
                              <IconComponent className="w-3 h-3" />
                            </span>
                          )
                        })}
                        {(user.allowedChannels || []).length > 3 && (
                          <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                            +{(user.allowedChannels || []).length - 3}
                          </span>
                        )}
                      </div>
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
                <p className="text-lg font-medium mb-2">{t("no_users_found")}</p>
                <p className="text-sm">{t("adjust_search_terms")}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className={`w-full max-w-lg rounded-xl shadow-2xl overflow-hidden transition-all duration-300 ${
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
                {editingUser ? t("edit_user") : t("new_user")}
              </h2>
            </div>

            <form onSubmit={editingUser ? handleUpdateUser : handleAddUser} className="p-6">
              <div className="space-y-4">
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    {t("full_name")}
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
                    {t("username")}
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
                    {t("email")}
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                    >
                      {editingUser ? t("new_password_leave_blank") : t("password")}
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
                      {t("confirm_password")}
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
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    {t("access_level")}
                  </label>
                  <div className="relative">
                    <select
                      name="accessLevel"
                      value={formData.accessLevel}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 focus:scale-[1.02] appearance-none ${
                        theme === "dark"
                          ? "bg-gray-800/50 border-gray-600 text-white focus:border-blue-500"
                          : "bg-gray-50/50 border-gray-300 text-gray-900 focus:border-blue-500"
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                      style={{
                        boxShadow: `0 0 10px var(--glow-color)`,
                      }}
                    >
                      <option value="AGENT">{t("agent")}</option>
                      <option value="SUPERVISOR">{t("supervisor")}</option>
                      {currentUser?.accessLevel === "DEV" && <option value="SUPER_ADMIN">{t("super_admin")}</option>}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Páginas do Sidebar com Checkboxes */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-3 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    {t("allowed_pages")}
                  </label>
                  <div
                    className={`rounded-lg border max-h-64 overflow-y-auto ${
                      theme === "dark" ? "border-gray-600 bg-gray-800/30" : "border-gray-300 bg-gray-50/30"
                    }`}
                    style={{
                      boxShadow: `0 0 10px var(--glow-color)`,
                    }}
                  >
                    {availablePages.map((page) => {
                      const IconComponent = getIconComponent(page.icon)
                      return (
                        <label
                          key={page.id}
                          className={`flex items-center px-4 py-3 cursor-pointer transition-all duration-200 hover:scale-[1.01] border-b last:border-b-0 ${
                            theme === "dark"
                              ? "border-gray-700 hover:bg-gray-700/30"
                              : "border-gray-200 hover:bg-gray-100/50"
                          }`}
                        >
                          <div className="flex items-center">
                            <div
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-3 transition-all duration-200 ${
                                formData.allowedChannels.includes(page.id)
                                  ? "bg-blue-500 border-blue-500"
                                  : theme === "dark"
                                    ? "border-gray-500 hover:border-blue-400"
                                    : "border-gray-400 hover:border-blue-500"
                              }`}
                              style={{
                                boxShadow: formData.allowedChannels.includes(page.id)
                                  ? "0 0 20px rgba(59, 130, 246, 0.8), 0 0 40px rgba(59, 130, 246, 0.4)"
                                  : "none",
                                background: formData.allowedChannels.includes(page.id)
                                  ? "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
                                  : theme === "dark"
                                    ? "#374151"
                                    : "#e5e7eb",
                              }}
                            >
                              {formData.allowedChannels.includes(page.id) && (
                                <Check className="w-3 h-3 text-white" strokeWidth={3} />
                              )}
                            </div>
                            <input
                              type="checkbox"
                              checked={formData.allowedChannels.includes(page.id)}
                              onChange={() => handlePageToggle(page.id)}
                              className="sr-only"
                            />
                            <div
                              className="mr-3 p-1 rounded transition-all duration-200"
                              style={{
                                background: formData.allowedChannels.includes(page.id)
                                  ? "var(--gradient-primary)"
                                  : theme === "dark"
                                    ? "#374151"
                                    : "#e5e7eb",
                                boxShadow: formData.allowedChannels.includes(page.id)
                                  ? "0 0 15px var(--glow-color)"
                                  : "none",
                              }}
                            >
                              <IconComponent
                                className={`w-4 h-4 ${
                                  formData.allowedChannels.includes(page.id)
                                    ? "text-white"
                                    : theme === "dark"
                                      ? "text-gray-400"
                                      : "text-gray-600"
                                }`}
                                style={{
                                  filter: formData.allowedChannels.includes(page.id)
                                    ? "drop-shadow(0 0 8px rgba(255, 255, 255, 0.8))"
                                    : "none",
                                }}
                              />
                            </div>
                            <div>
                              <span
                                className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                                style={{
                                  textShadow: `0 0 8px var(--glow-color)`,
                                }}
                              >
                                {page.name}
                              </span>
                              <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                                {page.category}
                              </div>
                            </div>
                          </div>
                        </label>
                      )
                    })}
                  </div>
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
                  {t("cancel")}
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
                  {editingUser ? t("save") : t("create_user")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
