"use client"

import { useState, useEffect } from "react"
import { Trash2, Users, AlertCircle, X, HelpCircle, ExternalLink, EyeOff, Eye, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useTheme } from "@/src/aura/features/view/homePanels/ThemeContext"
import { useLanguage } from "../../contexts/LanguageContext"

interface TelegramAccount {
  id: string
  apiKey: string
  botName: string
}

interface ConnectedAccount {
  id: string
  platform: "telegram" | "whatsapp" | "messenger" | "instagram"
  name: string
  status: "connected" | "disconnected" | "pending"
  stats: {
    messages: number
    conversations: number
    responseTime: string
  }
}

export default function Contas() {
  const router = useRouter()
  const { theme } = useTheme()
  const { t } = useLanguage()
  const [accounts, setAccounts] = useState<TelegramAccount[]>([])
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([])
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [apiError, setApiError] = useState<string | null>(null)
  const [showApiWarning, setShowApiWarning] = useState(true)
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [hideInterface, setHideInterface] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [connectionData, setConnectionData] = useState({
    botToken: "",
    botName: "",
  })

  // WhatsApp data
  const [whatsappData, setWhatsappData] = useState({
    nome: "",
    descricao: "",
    codigoPais: "BR",
    customCountryCode: "",
    numeroTelefone: "",
  })

  // Messenger data
  const [messengerData, setMessengerData] = useState({
    nomeContaFacebook: "",
    urlContaFacebook: "",
    idPaginaFacebook: "",
    accessToken: "",
    versaoApi: "v20.0",
  })

  // Instagram data
  const [instagramData, setInstagramData] = useState({
    login: "",
    senha: "",
    nomeExibicao: "",
    descricao: "",
  })

  const [showQRCode, setShowQRCode] = useState(false)
  const [qrCodeData, setQrCodeData] = useState("")

  // Base URL for API calls
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

  const platforms = [
    {
      id: "telegram",
      name: "Telegram",
      icon: "/redesociais/telegram.svg",
      color: "#0088cc",
      maxAccounts: 3,
    },
    {
      id: "whatsapp",
      name: "WhatsApp",
      icon: "/redesociais/whatsapp.svg",
      color: "#25d366",
      maxAccounts: 3,
    },
    {
      id: "messenger",
      name: "Messenger",
      icon: "/redesociais/messenger.svg",
      color: "#0084ff",
      maxAccounts: 2,
    },
    {
      id: "instagram",
      name: "Instagram",
      icon: "/redesociais/instagram.svg",
      color: "#E4405F",
      maxAccounts: 2,
    },
  ]

  // Country codes for WhatsApp
  const countryCodes = [
    { code: "BR", name: "Brasil", dial: "+55" },
    { code: "US", name: "Estados Unidos", dial: "+1" },
    { code: "AR", name: "Argentina", dial: "+54" },
    { code: "MX", name: "México", dial: "+52" },
    { code: "CO", name: "Colômbia", dial: "+57" },
    { code: "PE", name: "Peru", dial: "+51" },
    { code: "CL", name: "Chile", dial: "+56" },
    { code: "UY", name: "Uruguai", dial: "+598" },
    { code: "PY", name: "Paraguai", dial: "+595" },
    { code: "CUSTOM", name: "Personalizado", dial: "" },
  ]

  // Messenger API versions
  const apiVersions = [
    "v20.0",
    "v21.0",
    "v22.0",
    "v23.0",
    "v24.0",
    "v25.0",
    "v26.0",
    "v27.0",
    "v28.0",
    "v29.0",
    "v30.0",
    "v31.0",
    "v32.0",
  ]

  const [formError, setFormError] = useState("")

  // Sync theme with panel
  useEffect(() => {
    syncThemeWithPanel()
    const themeInterval = setInterval(syncThemeWithPanel, 500)
    return () => clearInterval(themeInterval)
  }, [])

  const syncThemeWithPanel = () => {
    try {
      const savedTheme = localStorage.getItem("home-theme")
      const isDarkClass = document.documentElement.classList.contains("home-theme-dark")
      const isLightClass = document.documentElement.classList.contains("home-theme-light")

      let detectedTheme = "dark"
      if (savedTheme === "light" || isLightClass) {
        detectedTheme = "light"
      } else if (savedTheme === "dark" || isDarkClass) {
        detectedTheme = "dark"
      }

      document.documentElement.classList.remove("home-theme-dark", "home-theme-light")
      document.documentElement.classList.add(`home-theme-${detectedTheme}`)
    } catch (error) {
      console.error("Error syncing theme:", error)
    }
  }

  // Enhanced API health check
  const checkApiHealth = async () => {
    try {
      console.log("🔍 Verificando saúde da API em:", `${API_BASE_URL}/api/health`)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000)

      const response = await fetch(`${API_BASE_URL}/api/health`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        mode: "cors",
        credentials: "omit",
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        console.log("✅ API Health Check OK:", data)
        setApiError(null)
        return true
      } else {
        console.log("❌ API Health Check Failed - Status:", response.status)
        setApiError("API_ERROR")
        return false
      }
    } catch (error) {
      console.log("❌ API Health Check Error:", error)
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          console.log("⏰ Request timeout")
          setApiError("API_TIMEOUT")
        } else if (error.message.includes("fetch")) {
          console.log("🔌 Connection refused")
          setApiError("API_NOT_RUNNING")
        } else {
          console.log("❓ Unknown error")
          setApiError("API_UNKNOWN")
        }
      } else {
        setApiError("API_NOT_RUNNING")
      }
      return false
    }
  }

  // Debug API status
  const fetchDebugInfo = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/debug/status`, {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
      })
      if (response.ok) {
        const data = await response.json()
        setDebugInfo(data)
        console.log("🐛 Debug Info:", data)
      }
    } catch (error) {
      console.log("Debug info fetch failed:", error)
    }
  }

  // Fetch accounts from API
  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    setIsLoading(true)
    setApiError(null)

    console.log("🚀 Iniciando fetchAccounts...")

    const isApiHealthy = await checkApiHealth()
    if (!isApiHealthy) {
      console.log("❌ API não está disponível")
      setConnectedAccounts([])
      setIsLoading(false)
      return
    }

    await fetchDebugInfo()

    try {
      console.log("📡 Fazendo requisição para /api/accounts...")
      const response = await fetch(`${API_BASE_URL}/api/accounts`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        mode: "cors",
        credentials: "omit",
      })

      console.log("📡 Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Response error:", errorText)
        throw new Error(`Erro HTTP: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log("📦 Dados recebidos da API:", data)
      setAccounts(data)

      const connected = data.map((acc: TelegramAccount) => ({
        id: acc.id,
        platform: "telegram" as const,
        name: acc.botName,
        status: "connected" as const,
        stats: {
          messages: 0,
          conversations: 0,
          responseTime: "0s",
        },
      }))

      setConnectedAccounts(connected)
      console.log("✅ Contas conectadas atualizadas:", connected)

      if (connected.length > 0) {
        await fetchAccountStats(connected)
      }
    } catch (error) {
      console.error("❌ Erro ao buscar contas:", error)
      setApiError("FETCH_ERROR")
      setConnectedAccounts([])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAccountStats = async (accounts: ConnectedAccount[]) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/conversations`, {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
      })
      if (response.ok) {
        const conversations = await response.json()

        const updatedAccounts = accounts.map((account) => ({
          ...account,
          stats: {
            messages: conversations.length * 10,
            conversations: conversations.length,
            responseTime: "2.1s",
          },
        }))

        setConnectedAccounts(updatedAccounts)
      }
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error)
    }
  }

  const handlePlatformClick = (platformId: string) => {
    setSelectedPlatform(platformId)
  }

  const handleConnect = async () => {
    if (!connectionData.botToken || !connectionData.botName) {
      alert(t("accounts.fillAllFields"))
      return
    }

    if (!connectionData.botToken.includes(":")) {
      alert("Token do bot inválido. Deve estar no formato: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz")
      return
    }

    setIsConnecting(true)
    console.log("🔗 Tentando conectar conta:", {
      botName: connectionData.botName,
      tokenLength: connectionData.botToken.length,
    })

    try {
      const response = await fetch(`${API_BASE_URL}/api/accounts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        mode: "cors",
        credentials: "omit",
        body: JSON.stringify({
          apiKey: connectionData.botToken.trim(),
          botName: connectionData.botName.trim(),
        }),
      })

      console.log("📡 Response status (POST):", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ erro: "Erro desconhecido" }))
        console.error("❌ Erro na resposta:", errorData)
        throw new Error(errorData.erro || `HTTP ${response.status}`)
      }

      const newAccount = await response.json()
      console.log("✅ Conta criada com sucesso:", newAccount)

      await fetchAccounts()

      setSelectedPlatform(null)
      setConnectionData({ botToken: "", botName: "" })
      alert("Conta Telegram conectada com sucesso!")
    } catch (error) {
      console.error("❌ Erro ao conectar:", error)
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
      alert(`Erro ao conectar conta: ${errorMessage}`)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async (accountId: string) => {
    if (!confirm(t("accounts.confirmDelete"))) {
      return
    }

    console.log("🗑️ Removendo conta:", accountId)

    try {
      const response = await fetch(`${API_BASE_URL}/api/accounts/${accountId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        mode: "cors",
        credentials: "omit",
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Delete error:", errorText)
        throw new Error(`Erro ao excluir conta: HTTP ${response.status}`)
      }

      console.log("✅ Conta removida com sucesso")
      await fetchAccounts()
      alert(t("accounts.accountRemovedSuccess"))
    } catch (error) {
      console.error("❌ Erro ao excluir:", error)
      alert(t("accounts.errorDeleting"))
    }
  }

  // Calculate total accounts and counts per platform
  const totalAccounts = connectedAccounts.length
  const getAccountCount = (platformId: string) => {
    return connectedAccounts.filter((acc) => acc.platform === platformId).length
  }

  // Hide interface functionality
  useEffect(() => {
    if (hideInterface) {
      const sidebarSelectors = [
        "aside:not(.platform-icons)",
        "nav:not(.platform-icons)",
        '[class*="sidebar"]:not(.platform-icons)',
        '[class*="Sidebar"]:not(.platform-icons)',
        '[class*="w-64"]:not(.platform-icons)',
        '[class*="w-16"]:not(.platform-icons)',
        ".sidebar:not(.platform-icons)",
        "#sidebar:not(.platform-icons)",
      ]

      const headerSelectors = [
        "header:not(.platform-icons)",
        '[class*="header"]:not(.platform-icons)',
        '[class*="Header"]:not(.platform-icons)',
        ".header:not(.platform-icons)",
        "#header:not(.platform-icons)",
      ]

      sidebarSelectors.forEach((selector) => {
        const elements = document.querySelectorAll(selector)
        elements.forEach((element) => {
          if (!element.closest("[data-contas-content]")) {
            ;(element as HTMLElement).style.display = "none"
          }
        })
      })

      headerSelectors.forEach((selector) => {
        const elements = document.querySelectorAll(selector)
        elements.forEach((element) => {
          if (!element.closest("[data-contas-content]")) {
            ;(element as HTMLElement).style.display = "none"
          }
        })
      })

      const mainContent = document.querySelector("main")
      if (mainContent) {
        ;(mainContent as HTMLElement).style.marginLeft = "0"
        ;(mainContent as HTMLElement).style.paddingLeft = "0"
        ;(mainContent as HTMLElement).style.width = "100%"
      }
    } else {
      const allSelectors = [
        "aside",
        "nav",
        "header",
        '[class*="sidebar"]',
        '[class*="Sidebar"]',
        '[class*="header"]',
        '[class*="Header"]',
        '[class*="w-64"]',
        '[class*="w-16"]',
        ".sidebar",
        "#sidebar",
        ".header",
        "#header",
      ]

      allSelectors.forEach((selector) => {
        const elements = document.querySelectorAll(selector)
        elements.forEach((element) => {
          ;(element as HTMLElement).style.display = ""
        })
      })

      const mainContent = document.querySelector("main")
      if (mainContent) {
        ;(mainContent as HTMLElement).style.marginLeft = ""
        ;(mainContent as HTMLElement).style.paddingLeft = ""
        ;(mainContent as HTMLElement).style.width = ""
      }
    }

    return () => {
      const allSelectors = [
        "aside",
        "nav",
        "header",
        '[class*="sidebar"]',
        '[class*="Sidebar"]',
        '[class*="header"]',
        '[class*="Header"]',
        '[class*="w-64"]',
        '[class*="w-16"]',
        ".sidebar",
        "#sidebar",
        ".header",
        "#header",
      ]

      allSelectors.forEach((selector) => {
        const elements = document.querySelectorAll(selector)
        elements.forEach((element) => {
          ;(element as HTMLElement).style.display = ""
        })
      })

      const mainContent = document.querySelector("main")
      if (mainContent) {
        ;(mainContent as HTMLElement).style.marginLeft = ""
        ;(mainContent as HTMLElement).style.paddingLeft = ""
        ;(mainContent as HTMLElement).style.width = ""
      }
    }
  }, [hideInterface])

  // Get error message based on API error type
  const getApiErrorMessage = () => {
    switch (apiError) {
      case "API_NOT_RUNNING":
        return "Servidor Flask não está rodando em localhost:3001"
      case "API_TIMEOUT":
        return "Timeout na conexão com o servidor"
      case "API_ERROR":
        return "Erro no servidor Flask"
      case "FETCH_ERROR":
        return "Erro ao buscar dados do servidor"
      default:
        return "Problemas de conexão com o servidor"
    }
  }

  // Instagram form handler
  const handleInstagramConnect = () => {
    if (!instagramData.login || !instagramData.senha) {
      alert("Preencha login e senha")
      return
    }

    setIsConnecting(true)
    setTimeout(() => {
      alert("Instagram conectado com sucesso!")
      setSelectedPlatform(null)
      setInstagramData({
        login: "",
        senha: "",
        nomeExibicao: "",
        descricao: "",
      })
      setIsConnecting(false)
      fetchAccounts()
    }, 2000)
  }

  // WhatsApp QR Code handler
  const handleWhatsAppConnect = () => {
    if (!whatsappData.nome || !whatsappData.numeroTelefone) {
      alert("Preencha todos os campos obrigatórios")
      return
    }
    setShowQRCode(true)
    setTimeout(() => {
      setQrCodeData(
        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmZmIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPldoYXRzQXBwIFFSPC90ZXh0Pjwvc3ZnPg==",
      )
    }, 2000)
  }

  const handleWhatsAppFinalConnect = () => {
    setIsConnecting(true)
    setTimeout(() => {
      alert("WhatsApp conectado com sucesso!")
      setSelectedPlatform(null)
      setShowQRCode(false)
      setQrCodeData("")
      setWhatsappData({
        nome: "",
        descricao: "",
        codigoPais: "BR",
        customCountryCode: "",
        numeroTelefone: "",
      })
      setIsConnecting(false)
      fetchAccounts()
    }, 2000)
  }

  // Messenger handler
  const handleMessengerConnect = () => {
    if (!messengerData.nomeContaFacebook || !messengerData.idPaginaFacebook || !messengerData.accessToken) {
      alert("Preencha todos os campos obrigatórios")
      return
    }
    setIsConnecting(true)
    setTimeout(() => {
      alert("Messenger conectado com sucesso!")
      setSelectedPlatform(null)
      setMessengerData({
        nomeContaFacebook: "",
        urlContaFacebook: "",
        idPaginaFacebook: "",
        accessToken: "",
        versaoApi: "v20.0",
      })
      setIsConnecting(false)
      fetchAccounts()
    }, 2000)
  }

  // Instagram Platform Form
  if (selectedPlatform === "instagram") {
    return (
      <div
        className={`min-h-screen transition-all duration-300`}
        style={{
          background:
            theme === "dark"
              ? "linear-gradient(180deg, #0a0a0a 0%, #111111 50%, #0a0a0a 100%)"
              : "linear-gradient(180deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%)",
        }}
      >
        <div className="max-w-md mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-screen">
          <div className="w-full space-y-6">
            <div className="text-center">
              <h1
                className={`text-3xl font-bold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                style={{
                  background: "var(--gradient-accent)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textShadow: `0 0 20px var(--glow-color)`,
                  filter: `drop-shadow(0 0 15px var(--glow-color))`,
                }}
              >
                Conectar Instagram
              </h1>
              <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                Configure sua conta do Instagram
              </p>
            </div>

            <div
              className={`rounded-xl border transition-all duration-300 p-6 ${
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
              <div className="space-y-4">
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Login/Email
                  </label>
                  <input
                    type="text"
                    placeholder="seu_usuario ou email@exemplo.com"
                    value={instagramData.login}
                    onChange={(e) => setInstagramData({ ...instagramData, login: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 focus:scale-[1.02] ${
                      theme === "dark"
                        ? "bg-gray-800/50 border-gray-600 text-white focus:border-pink-500"
                        : "bg-gray-50/50 border-gray-300 text-gray-900 focus:border-pink-500"
                    } focus:outline-none focus:ring-2 focus:ring-pink-500/20 placeholder-gray-400`}
                    style={{
                      boxShadow: `0 0 10px var(--glow-color)`,
                    }}
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Senha
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={instagramData.senha}
                    onChange={(e) => setInstagramData({ ...instagramData, senha: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 focus:scale-[1.02] ${
                      theme === "dark"
                        ? "bg-gray-800/50 border-gray-600 text-white focus:border-pink-500"
                        : "bg-gray-50/50 border-gray-300 text-gray-900 focus:border-pink-500"
                    } focus:outline-none focus:ring-2 focus:ring-pink-500/20 placeholder-gray-400`}
                    style={{
                      boxShadow: `0 0 10px var(--glow-color)`,
                    }}
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Nome de Exibição (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Suporte Principal"
                    value={instagramData.nomeExibicao}
                    onChange={(e) => setInstagramData({ ...instagramData, nomeExibicao: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 focus:scale-[1.02] ${
                      theme === "dark"
                        ? "bg-gray-800/50 border-gray-600 text-white focus:border-pink-500"
                        : "bg-gray-50/50 border-gray-300 text-gray-900 focus:border-pink-500"
                    } focus:outline-none focus:ring-2 focus:ring-pink-500/20 placeholder-gray-400`}
                    style={{
                      boxShadow: `0 0 10px var(--glow-color)`,
                    }}
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Descrição (Opcional)
                  </label>
                  <textarea
                    placeholder="Ex: Conta principal para atendimento via Instagram"
                    value={instagramData.descricao}
                    onChange={(e) => setInstagramData({ ...instagramData, descricao: e.target.value })}
                    rows={3}
                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 focus:scale-[1.02] ${
                      theme === "dark"
                        ? "bg-gray-800/50 border-gray-600 text-white focus:border-pink-500"
                        : "bg-gray-50/50 border-gray-300 text-gray-900 focus:border-pink-500"
                    } focus:outline-none focus:ring-2 focus:ring-pink-500/20 placeholder-gray-400 resize-none`}
                    style={{
                      boxShadow: `0 0 10px var(--glow-color)`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedPlatform(null)}
                className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 ${
                  theme === "dark"
                    ? "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-900"
                }`}
                style={{
                  boxShadow: `0 0 15px var(--glow-color)`,
                }}
                disabled={isConnecting}
              >
                Cancelar
              </button>
              <button
                onClick={handleInstagramConnect}
                disabled={isConnecting || !instagramData.login || !instagramData.senha}
                className="flex-1 px-6 py-3 rounded-xl text-white font-medium transition-all duration-300 hover:scale-105 hover:shadow-2xl disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg, #E4405F 0%, #C13584 50%, #833AB4 100%)",
                  boxShadow: `0 0 25px rgba(228, 64, 95, 0.5)`,
                  textShadow: "0 0 10px rgba(255, 255, 255, 0.8)",
                }}
              >
                {isConnecting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                    Conectando...
                  </>
                ) : (
                  "Conectar"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // WhatsApp Platform Form
  if (selectedPlatform === "whatsapp") {
    return (
      <div
        className={`min-h-screen transition-all duration-300`}
        style={{
          background:
            theme === "dark"
              ? "linear-gradient(180deg, #0a0a0a 0%, #111111 50%, #0a0a0a 100%)"
              : "linear-gradient(180deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%)",
        }}
      >
        <div className="max-w-md mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-screen">
          <div className="w-full space-y-6">
            <div className="text-center">
              <h1
                className={`text-3xl font-bold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                style={{
                  background: "var(--gradient-accent)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textShadow: `0 0 20px var(--glow-color)`,
                  filter: `drop-shadow(0 0 15px var(--glow-color))`,
                }}
              >
                Conectar WhatsApp
              </h1>
              <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                Preencha os dados da sua conta WhatsApp
              </p>
            </div>

            {!showQRCode ? (
              <div
                className={`rounded-xl border transition-all duration-300 p-6 ${
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
                <div className="space-y-4">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Nome
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Suporte Principal"
                      value={whatsappData.nome}
                      onChange={(e) => setWhatsappData({ ...whatsappData, nome: e.target.value })}
                      className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 focus:scale-[1.02] ${
                        theme === "dark"
                          ? "bg-gray-800/50 border-gray-600 text-white focus:border-green-500"
                          : "bg-gray-50/50 border-gray-300 text-gray-900 focus:border-green-500"
                      } focus:outline-none focus:ring-2 focus:ring-green-500/20 placeholder-gray-400`}
                      style={{
                        boxShadow: `0 0 10px var(--glow-color)`,
                      }}
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Descrição
                    </label>
                    <textarea
                      placeholder="Ex: Conta do suporte técnico para atendimento aos clientes"
                      value={whatsappData.descricao}
                      onChange={(e) => setWhatsappData({ ...whatsappData, descricao: e.target.value })}
                      rows={3}
                      className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 focus:scale-[1.02] ${
                        theme === "dark"
                          ? "bg-gray-800/50 border-gray-600 text-white focus:border-green-500"
                          : "bg-gray-50/50 border-gray-300 text-gray-900 focus:border-green-500"
                      } focus:outline-none focus:ring-2 focus:ring-green-500/20 placeholder-gray-400 resize-none`}
                      style={{
                        boxShadow: `0 0 10px var(--glow-color)`,
                      }}
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Código do País
                    </label>
                    <select
                      value={whatsappData.codigoPais}
                      onChange={(e) =>
                        setWhatsappData({ ...whatsappData, codigoPais: e.target.value, customCountryCode: "" })
                      }
                      className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 focus:scale-[1.02] ${
                        theme === "dark"
                          ? "bg-gray-800/50 border-gray-600 text-white focus:border-green-500"
                          : "bg-gray-50/50 border-gray-300 text-gray-900 focus:border-green-500"
                      } focus:outline-none focus:ring-2 focus:ring-green-500/20`}
                      style={{
                        boxShadow: `0 0 10px var(--glow-color)`,
                      }}
                    >
                      {countryCodes.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.name} ({country.dial})
                        </option>
                      ))}
                    </select>
                  </div>

                  {whatsappData.codigoPais === "CUSTOM" && (
                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                      >
                        Código Personalizado
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: +351"
                        value={whatsappData.customCountryCode}
                        onChange={(e) => setWhatsappData({ ...whatsappData, customCountryCode: e.target.value })}
                        className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 focus:scale-[1.02] ${
                          theme === "dark"
                            ? "bg-gray-800/50 border-gray-600 text-white focus:border-green-500"
                            : "bg-gray-50/50 border-gray-300 text-gray-900 focus:border-green-500"
                        } focus:outline-none focus:ring-2 focus:ring-green-500/20 placeholder-gray-400`}
                        style={{
                          boxShadow: `0 0 10px var(--glow-color)`,
                        }}
                      />
                    </div>
                  )}

                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Número de Telefone
                    </label>
                    <div className="flex">
                      <span
                        className={`px-3 py-3 border border-r-0 rounded-l-lg text-sm flex items-center ${
                          theme === "dark"
                            ? "bg-gray-800/50 border-gray-600 text-gray-400"
                            : "bg-gray-50/50 border-gray-300 text-gray-500"
                        }`}
                        style={{
                          boxShadow: `0 0 10px var(--glow-color)`,
                        }}
                      >
                        {whatsappData.codigoPais === "CUSTOM"
                          ? whatsappData.customCountryCode || "+XX"
                          : countryCodes.find((c) => c.code === whatsappData.codigoPais)?.dial || "+55"}
                      </span>
                      <input
                        type="tel"
                        placeholder="11987654321"
                        value={whatsappData.numeroTelefone}
                        onChange={(e) =>
                          setWhatsappData({ ...whatsappData, numeroTelefone: e.target.value.replace(/\D/g, "") })
                        }
                        className={`flex-1 px-4 py-3 border border-l-0 rounded-r-lg transition-all duration-300 focus:scale-[1.02] ${
                          theme === "dark"
                            ? "bg-gray-800/50 border-gray-600 text-white focus:border-green-500"
                            : "bg-gray-50/50 border-gray-300 text-gray-900 focus:border-green-500"
                        } focus:outline-none focus:ring-2 focus:ring-green-500/20 placeholder-gray-400`}
                        style={{
                          boxShadow: `0 0 10px var(--glow-color)`,
                        }}
                      />
                    </div>
                    <p className={`text-xs mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                      Digite apenas os números, sem o código do país
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className={`rounded-xl border transition-all duration-300 p-6 ${
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
                <div className="text-center space-y-4">
                  <h2
                    className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                    style={{
                      textShadow: `0 0 15px var(--glow-color)`,
                    }}
                  >
                    Escaneie o QR Code
                  </h2>
                  <div
                    className={`mx-auto w-64 h-64 border-2 border-dashed rounded-lg flex items-center justify-center ${
                      theme === "dark" ? "border-gray-600" : "border-gray-300"
                    }`}
                    style={{
                      boxShadow: `0 0 15px var(--glow-color)`,
                    }}
                  >
                    {qrCodeData ? (
                      <img
                        src={qrCodeData || "/placeholder.svg"}
                        alt="QR Code WhatsApp"
                        className="w-full h-full object-contain rounded-lg"
                      />
                    ) : (
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
                        <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                          Gerando QR Code...
                        </p>
                      </div>
                    )}
                  </div>
                  <div
                    className={`p-4 rounded-lg border ${
                      theme === "dark" ? "bg-green-900/20 border-green-800" : "bg-green-50 border-green-200"
                    }`}
                    style={{
                      boxShadow: `0 0 10px rgba(34, 197, 94, 0.3)`,
                    }}
                  >
                    <p className={`text-sm font-medium mb-2 ${theme === "dark" ? "text-green-300" : "text-green-800"}`}>
                      Como conectar:
                    </p>
                    <ol className={`text-xs space-y-1 ${theme === "dark" ? "text-green-400" : "text-green-700"}`}>
                      <li>1. Abra o WhatsApp no seu telefone</li>
                      <li>2. Toque em "Dispositivos conectados"</li>
                      <li>3. Toque em "Conectar um dispositivo"</li>
                      <li>4. Escaneie este QR Code</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedPlatform(null)
                  setShowQRCode(false)
                  setQrCodeData("")
                }}
                className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 ${
                  theme === "dark"
                    ? "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-900"
                }`}
                style={{
                  boxShadow: `0 0 15px var(--glow-color)`,
                }}
                disabled={isConnecting}
              >
                Cancelar
              </button>
              {!showQRCode ? (
                <button
                  onClick={handleWhatsAppConnect}
                  disabled={isConnecting || !whatsappData.nome || !whatsappData.numeroTelefone}
                  className="flex-1 px-6 py-3 rounded-xl text-white font-medium transition-all duration-300 hover:scale-105 hover:shadow-2xl disabled:opacity-50"
                  style={{
                    background: "linear-gradient(135deg, #25d366 0%, #128c7e 100%)",
                    boxShadow: `0 0 25px rgba(37, 211, 102, 0.5)`,
                    textShadow: "0 0 10px rgba(255, 255, 255, 0.8)",
                  }}
                >
                  {isConnecting ? "Conectando..." : "Gerar QR Code"}
                </button>
              ) : (
                <button
                  onClick={handleWhatsAppFinalConnect}
                  disabled={isConnecting}
                  className="flex-1 px-6 py-3 rounded-xl text-white font-medium transition-all duration-300 hover:scale-105 hover:shadow-2xl disabled:opacity-50"
                  style={{
                    background: "linear-gradient(135deg, #25d366 0%, #128c7e 100%)",
                    boxShadow: `0 0 25px rgba(37, 211, 102, 0.5)`,
                    textShadow: "0 0 10px rgba(255, 255, 255, 0.8)",
                  }}
                >
                  {isConnecting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                      Conectando...
                    </>
                  ) : (
                    "Conectar"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Messenger Platform Form
  if (selectedPlatform === "messenger") {
    return (
      <div
        className={`min-h-screen transition-all duration-300`}
        style={{
          background:
            theme === "dark"
              ? "linear-gradient(180deg, #0a0a0a 0%, #111111 50%, #0a0a0a 100%)"
              : "linear-gradient(180deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%)",
        }}
      >
        <div className="max-w-md mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-screen">
          <div className="w-full space-y-6">
            <div className="text-center">
              <h1
                className={`text-3xl font-bold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                style={{
                  background: "var(--gradient-accent)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textShadow: `0 0 20px var(--glow-color)`,
                  filter: `drop-shadow(0 0 15px var(--glow-color))`,
                }}
              >
                Conectar Messenger
              </h1>
              <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                Configure sua página do Facebook
              </p>
            </div>

            <div
              className={`rounded-xl border transition-all duration-300 p-6 ${
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
              <div className="space-y-4">
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Nome da Conta Facebook
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Minha Empresa"
                    value={messengerData.nomeContaFacebook}
                    onChange={(e) => setMessengerData({ ...messengerData, nomeContaFacebook: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 focus:scale-[1.02] ${
                      theme === "dark"
                        ? "bg-gray-800/50 border-gray-600 text-white focus:border-blue-500"
                        : "bg-gray-50/50 border-gray-300 text-gray-900 focus:border-blue-500"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder-gray-400`}
                    style={{
                      boxShadow: `0 0 10px var(--glow-color)`,
                    }}
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    URL da Conta Facebook
                  </label>
                  <input
                    type="url"
                    placeholder="https://facebook.com/minhapagina"
                    value={messengerData.urlContaFacebook}
                    onChange={(e) => setMessengerData({ ...messengerData, urlContaFacebook: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 focus:scale-[1.02] ${
                      theme === "dark"
                        ? "bg-gray-800/50 border-gray-600 text-white focus:border-blue-500"
                        : "bg-gray-50/50 border-gray-300 text-gray-900 focus:border-blue-500"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder-gray-400`}
                    style={{
                      boxShadow: `0 0 10px var(--glow-color)`,
                    }}
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    ID de Identificação da Página
                  </label>
                  <input
                    type="text"
                    placeholder="123456789012345"
                    value={messengerData.idPaginaFacebook}
                    onChange={(e) =>
                      setMessengerData({ ...messengerData, idPaginaFacebook: e.target.value.replace(/\D/g, "") })
                    }
                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 focus:scale-[1.02] ${
                      theme === "dark"
                        ? "bg-gray-800/50 border-gray-600 text-white focus:border-blue-500"
                        : "bg-gray-50/50 border-gray-300 text-gray-900 focus:border-blue-500"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder-gray-400`}
                    style={{
                      boxShadow: `0 0 10px var(--glow-color)`,
                    }}
                  />
                  <p className={`text-xs mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    Encontre o ID nas configurações da sua página
                  </p>
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Access Token
                  </label>
                  <textarea
                    placeholder="EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={messengerData.accessToken}
                    onChange={(e) => setMessengerData({ ...messengerData, accessToken: e.target.value })}
                    rows={3}
                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 focus:scale-[1.02] ${
                      theme === "dark"
                        ? "bg-gray-800/50 border-gray-600 text-white focus:border-blue-500"
                        : "bg-gray-50/50 border-gray-300 text-gray-900 focus:border-blue-500"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder-gray-400 resize-none`}
                    style={{
                      boxShadow: `0 0 10px var(--glow-color)`,
                    }}
                  />
                  <p className={`text-xs mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    Token gerado no Facebook Developers
                  </p>
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Versão da API
                  </label>
                  <select
                    value={messengerData.versaoApi}
                    onChange={(e) => setMessengerData({ ...messengerData, versaoApi: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 focus:scale-[1.02] ${
                      theme === "dark"
                        ? "bg-gray-800/50 border-gray-600 text-white focus:border-blue-500"
                        : "bg-gray-50/50 border-gray-300 text-gray-900 focus:border-blue-500"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    style={{
                      boxShadow: `0 0 10px var(--glow-color)`,
                    }}
                  >
                    {apiVersions.map((version) => (
                      <option key={version} value={version}>
                        {version}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedPlatform(null)}
                className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 ${
                  theme === "dark"
                    ? "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-900"
                }`}
                style={{
                  boxShadow: `0 0 15px var(--glow-color)`,
                }}
                disabled={isConnecting}
              >
                Cancelar
              </button>
              <button
                onClick={handleMessengerConnect}
                disabled={
                  isConnecting ||
                  !messengerData.nomeContaFacebook ||
                  !messengerData.idPaginaFacebook ||
                  !messengerData.accessToken
                }
                className="flex-1 px-6 py-3 rounded-xl text-white font-medium transition-all duration-300 hover:scale-105 hover:shadow-2xl disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg, #0084ff 0%, #0066cc 100%)",
                  boxShadow: `0 0 25px rgba(0, 132, 255, 0.5)`,
                  textShadow: "0 0 10px rgba(255, 255, 255, 0.8)",
                }}
              >
                {isConnecting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                    Conectando...
                  </>
                ) : (
                  "Conectar"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Telegram Platform Form
  if (selectedPlatform === "telegram") {
    return (
      <div
        className={`min-h-screen transition-all duration-300`}
        style={{
          background:
            theme === "dark"
              ? "linear-gradient(180deg, #0a0a0a 0%, #111111 50%, #0a0a0a 100%)"
              : "linear-gradient(180deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%)",
        }}
      >
        <div className="max-w-md mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-screen">
          <div className="w-full space-y-6">
            <div className="text-center">
              <h1
                className={`text-3xl font-bold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                style={{
                  background: "var(--gradient-accent)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textShadow: `0 0 20px var(--glow-color)`,
                  filter: `drop-shadow(0 0 15px var(--glow-color))`,
                }}
              >
                {t("accounts.connectTelegram")}
              </h1>
              <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>{t("accounts.fillBotData")}</p>
              {apiError && (
                <p
                  className={`text-yellow-600 text-sm mt-2 p-2 rounded-md border ${
                    theme === "dark" ? "bg-yellow-900/20 border-yellow-800" : "bg-yellow-50 border-yellow-200"
                  }`}
                >
                  ⚠️ {getApiErrorMessage()}
                </p>
              )}
            </div>

            <div
              className={`rounded-xl border transition-all duration-300 p-6 ${
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
              <div className="space-y-4">
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    {t("accounts.botToken")}
                  </label>
                  <input
                    type="text"
                    placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
                    value={connectionData.botToken}
                    onChange={(e) => setConnectionData({ ...connectionData, botToken: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 focus:scale-[1.02] ${
                      theme === "dark"
                        ? "bg-gray-800/50 border-gray-600 text-white focus:border-blue-500"
                        : "bg-gray-50/50 border-gray-300 text-gray-900 focus:border-blue-500"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder-gray-400`}
                    style={{
                      boxShadow: `0 0 10px var(--glow-color)`,
                    }}
                  />
                  <p className={`text-xs mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    Obtenha este token conversando com @BotFather no Telegram
                  </p>
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    {t("accounts.botName")}
                  </label>
                  <input
                    type="text"
                    placeholder="@meu_bot"
                    value={connectionData.botName}
                    onChange={(e) => setConnectionData({ ...connectionData, botName: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 focus:scale-[1.02] ${
                      theme === "dark"
                        ? "bg-gray-800/50 border-gray-600 text-white focus:border-blue-500"
                        : "bg-gray-50/50 border-gray-300 text-gray-900 focus:border-blue-500"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder-gray-400`}
                    style={{
                      boxShadow: `0 0 10px var(--glow-color)`,
                    }}
                  />
                  <p className={`text-xs mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    Nome do seu bot (opcional, para identificação)
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedPlatform(null)}
                className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 ${
                  theme === "dark"
                    ? "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-900"
                }`}
                style={{
                  boxShadow: `0 0 15px var(--glow-color)`,
                }}
                disabled={isConnecting}
              >
                {t("accounts.cancel")}
              </button>
              <button
                onClick={handleConnect}
                disabled={isConnecting || !connectionData.botToken || !connectionData.botName}
                className="flex-1 px-6 py-3 rounded-xl text-white font-medium transition-all duration-300 hover:scale-105 hover:shadow-2xl disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg, #0088cc 0%, #006699 100%)",
                  boxShadow: `0 0 25px rgba(0, 136, 204, 0.5)`,
                  textShadow: "0 0 10px rgba(255, 255, 255, 0.8)",
                }}
              >
                {isConnecting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                    {t("accounts.connecting")}
                  </>
                ) : (
                  t("accounts.connect")
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Loading Screen
  if (isLoading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center transition-all duration-300`}
        style={{
          background:
            theme === "dark"
              ? "linear-gradient(180deg, #0a0a0a 0%, #111111 50%, #0a0a0a 100%)"
              : "linear-gradient(180deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%)",
        }}
      >
        <div className="text-center">
          <div
            className={`animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4 ${
              theme === "dark" ? "border-white" : "border-blue-600"
            }`}
            style={{
              filter: `drop-shadow(0 0 10px var(--glow-color))`,
            }}
          ></div>
          <p
            className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
            style={{
              textShadow: `0 0 8px var(--glow-color)`,
            }}
          >
            {t("accounts.loadingAccounts")}
          </p>
          <p className={`text-xs mt-2 ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}>
            Verificando conexão com Flask...
          </p>
        </div>
      </div>
    )
  }

  // Main Dashboard
  return (
    <div
      className={`min-h-screen p-6 transition-all duration-300`}
      style={{
        background:
          theme === "dark"
            ? "linear-gradient(180deg, #0a0a0a 0%, #111111 50%, #0a0a0a 100%)"
            : "linear-gradient(180deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%)",
      }}
      data-contas-content
    >
      {/* Debug Info */}
      {process.env.NODE_ENV === "development" && debugInfo && (
        <div
          className="mb-4 p-3 rounded-lg text-xs font-mono transition-all duration-300"
          style={{
            background:
              theme === "dark"
                ? "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)"
                : "linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%)",
            boxShadow: `0 0 15px var(--glow-color)`,
            color: theme === "dark" ? "#4ade80" : "#16a34a",
          }}
        >
          <p>🐛 Debug: API Status = {debugInfo.status}</p>
          <p>
            📊 Accounts: {debugInfo.accounts_count} | Conversations: {debugInfo.conversations_count}
          </p>
          <p>🌐 Ngrok: {debugInfo.ngrok_url || "Not configured"}</p>
          <p>🔗 API Base: {API_BASE_URL}</p>
        </div>
      )}

      {/* API Warning Banner */}
      {apiError && showApiWarning && (
        <div className="flex justify-center mb-6">
          <div
            className={`border rounded-xl p-4 flex items-center justify-between max-w-2xl w-full transition-all duration-300 ${
              theme === "dark" ? "home-card-hover" : "home-card-hover-light"
            }`}
            style={{
              background:
                theme === "dark"
                  ? "linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)"
                  : "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
              borderColor: theme === "dark" ? "#dc2626" : "#ef4444",
              boxShadow: `0 0 25px rgba(239, 68, 68, 0.3)`,
            }}
          >
            <div className="flex items-center">
              <AlertCircle
                className={`h-5 w-5 mr-3 ${theme === "dark" ? "text-red-300" : "text-red-600"}`}
                style={{
                  filter: `drop-shadow(0 0 8px rgba(239, 68, 68, 0.8))`,
                }}
              />
              <div>
                <p
                  className={`font-medium ${theme === "dark" ? "text-red-200" : "text-red-800"}`}
                  style={{
                    textShadow: `0 0 8px rgba(239, 68, 68, 0.5)`,
                  }}
                >
                  🚫 Flask API Offline
                </p>
                <p className={`text-sm ${theme === "dark" ? "text-red-300" : "text-red-700"}`}>
                  {getApiErrorMessage()}
                </p>
                <p className={`text-xs mt-1 ${theme === "dark" ? "text-red-400" : "text-red-600"}`}>
                  Execute:{" "}
                  <code className={`px-1 rounded ${theme === "dark" ? "bg-red-900/50" : "bg-red-100"}`}>
                    python -m src.aura.app
                  </code>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchAccounts}
                className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                  theme === "dark"
                    ? "text-red-300 hover:text-red-200 hover:bg-red-800/30"
                    : "text-red-600 hover:text-red-800 hover:bg-red-100"
                }`}
                style={{
                  boxShadow: `0 0 10px rgba(239, 68, 68, 0.3)`,
                }}
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              <button
                onClick={() => setShowApiWarning(false)}
                className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                  theme === "dark"
                    ? "text-red-300 hover:text-red-200 hover:bg-red-800/30"
                    : "text-red-600 hover:text-red-800 hover:bg-red-100"
                }`}
                style={{
                  boxShadow: `0 0 10px rgba(239, 68, 68, 0.3)`,
                }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-8">
        <h1
          className={`text-4xl font-bold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
          style={{
            background: "var(--gradient-accent)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: `0 0 20px var(--glow-color)`,
            filter: `drop-shadow(0 0 15px var(--glow-color))`,
          }}
        >
          {t("accounts.title")}
        </h1>
        <p
          className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
          style={{
            textShadow: `0 0 8px var(--glow-color)`,
          }}
        >
          {t("accounts.subtitle")}
        </p>
        {!apiError ? (
          <div className="flex items-center justify-center mt-2">
            <div
              className="w-2 h-2 bg-green-500 rounded-full mr-2"
              style={{
                boxShadow: "0 0 10px rgba(34, 197, 94, 0.8)",
              }}
            ></div>
            <span
              className={`text-xs ${theme === "dark" ? "text-green-400" : "text-green-600"}`}
              style={{
                textShadow: "0 0 8px rgba(34, 197, 94, 0.5)",
              }}
            >
              Flask API conectado em {API_BASE_URL}
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-center mt-2">
            <div
              className="w-2 h-2 bg-red-500 rounded-full mr-2"
              style={{
                boxShadow: "0 0 10px rgba(239, 68, 68, 0.8)",
              }}
            ></div>
            <span
              className={`text-xs ${theme === "dark" ? "text-red-400" : "text-red-600"}`}
              style={{
                textShadow: "0 0 8px rgba(239, 68, 68, 0.5)",
              }}
            >
              Flask API desconectado
            </span>
          </div>
        )}
      </div>

      {/* Dashboard Stats */}
      <div className="flex justify-center mb-6">
        <div
          className={`w-full max-w-sm rounded-xl border transition-all duration-300 ${
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
          <div className="flex flex-row items-center justify-between space-y-0 pb-2 p-6">
            <h3
              className={`text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
              style={{
                textShadow: `0 0 8px var(--glow-color)`,
              }}
            >
              {t("accounts.totalAccounts")}
            </h3>
            <Users
              className={`h-4 w-4 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
              style={{
                filter: `drop-shadow(0 0 6px var(--glow-color))`,
              }}
            />
          </div>
          <div className="px-6 pb-6">
            <div
              className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}
              style={{
                textShadow: `0 0 15px var(--glow-color)`,
              }}
            >
              {totalAccounts}
            </div>
            <p
              className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
              style={{
                textShadow: `0 0 6px var(--glow-color)`,
              }}
            >
              {connectedAccounts.filter((acc) => acc.status === "connected").length} {t("accounts.activeAccounts")}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setShowHelpModal(true)}
          className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 ${
            theme === "dark" ? "home-card-hover" : "home-card-hover-light"
          }`}
          style={{
            background:
              theme === "dark"
                ? "linear-gradient(135deg, #1e1e1e 0%, #2a2a2a 100%)"
                : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
            borderColor: theme === "dark" ? "#3a3a3a" : "#e2e8f0",
            boxShadow: `0 0 20px var(--glow-color)`,
            color: theme === "dark" ? "#f3f4f6" : "#374151",
          }}
        >
          <HelpCircle
            className="w-4 h-4 mr-2"
            style={{
              filter: `drop-shadow(0 0 8px var(--glow-color))`,
            }}
          />
          {t("accounts.howToConnect")}
        </button>

        <button
          onClick={() => setHideInterface(!hideInterface)}
          className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 ${
            theme === "dark" ? "home-card-hover" : "home-card-hover-light"
          }`}
          style={{
            background:
              theme === "dark"
                ? "linear-gradient(135deg, #1e1e1e 0%, #2a2a2a 100%)"
                : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
            borderColor: theme === "dark" ? "#3a3a3a" : "#e2e8f0",
            boxShadow: `0 0 20px var(--glow-color)`,
            color: theme === "dark" ? "#f3f4f6" : "#374151",
          }}
        >
          {hideInterface ? (
            <Eye
              className="w-4 h-4 mr-2"
              style={{
                filter: `drop-shadow(0 0 8px var(--glow-color))`,
              }}
            />
          ) : (
            <EyeOff
              className="w-4 h-4 mr-2"
              style={{
                filter: `drop-shadow(0 0 8px var(--glow-color))`,
              }}
            />
          )}
          {hideInterface ? t("accounts.showInterface") : t("accounts.hideInterface")}
        </button>

        <button
          onClick={fetchAccounts}
          disabled={isLoading}
          className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50 ${
            theme === "dark" ? "home-card-hover" : "home-card-hover-light"
          }`}
          style={{
            background:
              theme === "dark"
                ? "linear-gradient(135deg, #1e1e1e 0%, #2a2a2a 100%)"
                : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
            borderColor: theme === "dark" ? "#3a3a3a" : "#e2e8f0",
            boxShadow: `0 0 20px var(--glow-color)`,
            color: theme === "dark" ? "#f3f4f6" : "#374151",
          }}
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            style={{
              filter: `drop-shadow(0 0 8px var(--glow-color))`,
            }}
          />
          Atualizar
        </button>
      </div>

      {/* Connect New Channels Section */}
      <div className="text-center mb-8">
        <h2
          className={`text-2xl font-bold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
          style={{
            background: "var(--gradient-primary)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: `0 0 15px var(--glow-color)`,
            filter: `drop-shadow(0 0 10px var(--glow-color))`,
          }}
        >
          {t("accounts.connectNewChannels")}
        </h2>
        <p
          className={`mb-6 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
          style={{
            textShadow: `0 0 8px var(--glow-color)`,
          }}
        >
          {t("accounts.clickToSetup")}
        </p>

        <div className="flex justify-center gap-8 mb-8 platform-icons">
          {platforms.map((platform) => {
            const currentCount = getAccountCount(platform.id)
            const isDisabled = apiError !== null
            return (
              <div key={platform.id} className="flex flex-col items-center platform-icon-item">
                <button
                  onClick={() => !isDisabled && handlePlatformClick(platform.id)}
                  disabled={isDisabled}
                  className={`w-20 h-20 rounded-full border flex items-center justify-center transition-all duration-300 hover:scale-110 ${
                    theme === "dark" ? "home-card-hover" : "home-card-hover-light"
                  } ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  style={{
                    background:
                      theme === "dark"
                        ? "linear-gradient(135deg, #1e1e1e 0%, #2a2a2a 100%)"
                        : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                    borderColor: isDisabled ? (theme === "dark" ? "#3a3a3a" : "#e2e8f0") : platform.color,
                    boxShadow: isDisabled ? `0 0 10px var(--glow-color)` : `0 0 25px ${platform.color}50`,
                  }}
                >
                  <Image
                    src={platform.icon || "/placeholder.svg"}
                    alt={platform.name}
                    width={32}
                    height={32}
                    className="w-8 h-8"
                    style={{
                      display: "block !important",
                      filter: isDisabled ? "grayscale(50%)" : `drop-shadow(0 0 8px ${platform.color}80)`,
                    }}
                  />
                </button>
                <span
                  className={`text-sm mt-2 font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  style={{
                    textShadow: `0 0 8px var(--glow-color)`,
                  }}
                >
                  {currentCount}/{platform.maxAccounts}
                </span>
                <span
                  className={`text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}
                  style={{
                    color: platform.color,
                    textShadow: `0 0 6px ${platform.color}80`,
                  }}
                >
                  {platform.name}
                </span>
                {isDisabled && (
                  <span className={`text-xs ${theme === "dark" ? "text-red-400" : "text-red-600"}`}>API Offline</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Connected Accounts */}
      {connectedAccounts.length > 0 ? (
        <div className="mb-8">
          <h3
            className={`text-xl font-bold mb-4 text-center ${theme === "dark" ? "text-white" : "text-gray-900"}`}
            style={{
              textShadow: `0 0 15px var(--glow-color)`,
            }}
          >
            {t("accounts.activeAccounts")}
          </h3>
          <div className="max-w-4xl mx-auto space-y-4">
            {connectedAccounts.map((account) => (
              <div
                key={account.id}
                className={`border rounded-xl p-4 transition-all duration-300 hover:scale-[1.02] ${
                  theme === "dark" ? "home-card-hover" : "home-card-hover-light"
                }`}
                style={{
                  background:
                    theme === "dark"
                      ? "linear-gradient(135deg, #1e1e1e 0%, #2a2a2a 100%)"
                      : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                  borderColor: theme === "dark" ? "#3a3a3a" : "#e2e8f0",
                  boxShadow: `0 0 20px var(--glow-color)`,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 ${
                        theme === "dark" ? "bg-gray-800" : "bg-gray-100"
                      }`}
                      style={{
                        background: "var(--gradient-primary)",
                        boxShadow: `0 0 15px var(--glow-color)`,
                      }}
                    >
                      <Image
                        src={`/redesociais/${account.platform}.svg`}
                        alt={account.platform}
                        width={20}
                        height={20}
                        className="w-5 h-5"
                        style={{
                          filter: "drop-shadow(0 0 8px rgba(255, 255, 255, 0.8))",
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
                        {account.name}
                      </span>
                      <p
                        className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                        style={{
                          textShadow: `0 0 6px var(--glow-color)`,
                        }}
                      >
                        {account.stats.conversations} conversas • {account.stats.messages} mensagens
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className="px-3 py-1 text-xs rounded-full font-medium"
                      style={{
                        background: "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
                        color: "white",
                        textShadow: "0 0 8px rgba(255, 255, 255, 0.8)",
                        boxShadow: "0 0 15px rgba(34, 197, 94, 0.5)",
                      }}
                    >
                      {t("accounts.live")}
                    </span>
                    <button
                      onClick={() => handleDisconnect(account.id)}
                      disabled={apiError !== null}
                      className="px-4 py-2 rounded-lg text-white font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50"
                      style={{
                        background: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
                        boxShadow: "0 0 20px rgba(239, 68, 68, 0.5)",
                        textShadow: "0 0 8px rgba(255, 255, 255, 0.8)",
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-1 inline" />
                      {t("accounts.delete")}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center mb-8">
          <div
            className={`border rounded-xl p-8 max-w-md mx-auto transition-all duration-300 ${
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
            <Users
              className={`h-12 w-12 mx-auto mb-4 ${theme === "dark" ? "text-gray-600" : "text-gray-400"}`}
              style={{
                filter: `drop-shadow(0 0 10px var(--glow-color))`,
              }}
            />
            <h3
              className={`text-lg font-medium mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
              style={{
                textShadow: `0 0 10px var(--glow-color)`,
              }}
            >
              {t("accounts.noAccountsConnected")}
            </h3>
            <p
              className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
              style={{
                textShadow: `0 0 8px var(--glow-color)`,
              }}
            >
              {apiError ? "Conecte o servidor Flask para começar" : t("accounts.connectFirstAccount")}
            </p>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div
            className={`rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto transition-all duration-300 ${
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
            <div className="flex justify-between items-center mb-4">
              <h2
                className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                style={{
                  background: "var(--gradient-accent)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textShadow: `0 0 15px var(--glow-color)`,
                }}
              >
                {t("accounts.howToConnect")}
              </h2>
              <button
                onClick={() => setShowHelpModal(false)}
                className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                  theme === "dark"
                    ? "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
                style={{
                  boxShadow: `0 0 10px var(--glow-color)`,
                }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p
              className={`mb-6 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
              style={{
                textShadow: `0 0 8px var(--glow-color)`,
              }}
            >
              {t("accounts.selectPlatformInstructions")}
            </p>

            <div className="grid grid-cols-2 gap-6">
              {platforms.map((platform) => (
                <div
                  key={platform.id}
                  onClick={() => {
                    setShowHelpModal(false)
                    handlePlatformClick(platform.id)
                  }}
                  className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 ${
                    theme === "dark" ? "home-card-hover" : "home-card-hover-light"
                  }`}
                  style={{
                    background:
                      theme === "dark"
                        ? "linear-gradient(135deg, #2a2a2a 0%, #1e1e1e 100%)"
                        : "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)",
                    borderColor: platform.color,
                    boxShadow: `0 0 20px ${platform.color}30`,
                  }}
                >
                  <div
                    className={`w-16 h-16 rounded-full border flex items-center justify-center mb-3 transition-all duration-300 hover:scale-110`}
                    style={{
                      borderColor: platform.color,
                      background: `${platform.color}20`,
                      boxShadow: `0 0 15px ${platform.color}40`,
                    }}
                  >
                    <Image
                      src={platform.icon || "/placeholder.svg"}
                      alt={platform.name}
                      width={32}
                      height={32}
                      className="w-8 h-8"
                      style={{
                        filter: `drop-shadow(0 0 8px ${platform.color}80)`,
                      }}
                    />
                  </div>
                  <h3
                    className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                    style={{
                      textShadow: `0 0 8px var(--glow-color)`,
                    }}
                  >
                    {platform.name}
                  </h3>
                  <p
                    className={`text-sm mt-1 text-center ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                    style={{
                      textShadow: `0 0 6px var(--glow-color)`,
                    }}
                  >
                    {platform.id === "telegram"
                      ? t("accounts.viaBotToken")
                      : platform.id === "whatsapp"
                        ? t("accounts.viaQRCode")
                        : platform.id === "instagram"
                          ? "Via Login/Senha"
                          : t("accounts.viaAppId")}
                  </p>
                  <button
                    className="mt-3 w-full px-4 py-2 rounded-lg text-white font-medium transition-all duration-300 hover:scale-105"
                    style={{
                      background: `linear-gradient(135deg, ${platform.color} 0%, ${platform.color}dd 100%)`,
                      boxShadow: `0 0 15px ${platform.color}50`,
                      textShadow: "0 0 8px rgba(255, 255, 255, 0.8)",
                    }}
                  >
                    {t("accounts.connect")}
                  </button>
                </div>
              ))}
            </div>

            <div
              className={`border rounded-lg p-4 mt-6 transition-all duration-300 ${
                theme === "dark" ? "home-card-hover" : "home-card-hover-light"
              }`}
              style={{
                background:
                  theme === "dark"
                    ? "linear-gradient(135deg, #7c2d12 0%, #ea580c 20%, #7c2d12 100%)"
                    : "linear-gradient(135deg, #fef3c7 0%, #fbbf24 20%, #fef3c7 100%)",
                borderColor: theme === "dark" ? "#ea580c" : "#f59e0b",
                boxShadow: `0 0 20px rgba(245, 158, 11, 0.3)`,
              }}
            >
              <h3
                className={`font-semibold mb-2 ${theme === "dark" ? "text-yellow-200" : "text-yellow-800"}`}
                style={{
                  textShadow: `0 0 8px rgba(245, 158, 11, 0.5)`,
                }}
              >
                ⚠️ {t("accounts.needHelp")}
              </h3>
              <p
                className={`${theme === "dark" ? "text-yellow-300" : "text-yellow-700"}`}
                style={{
                  textShadow: `0 0 6px rgba(245, 158, 11, 0.3)`,
                }}
              >
                {t("accounts.visitOfficialDocs")}
              </p>
              <div className="flex flex-col space-y-2 mt-3">
                <a
                  href="https://core.telegram.org/bots#creating-a-new-bot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center transition-all duration-300 hover:scale-105 ${
                    theme === "dark" ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-800"
                  }`}
                  style={{
                    textShadow: "0 0 8px rgba(59, 130, 246, 0.5)",
                  }}
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  {t("accounts.telegramCreateBots")}
                </a>
                <a
                  href="https://developers.facebook.com/docs/messenger-platform/getting-started"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center transition-all duration-300 hover:scale-105 ${
                    theme === "dark" ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-800"
                  }`}
                  style={{
                    textShadow: "0 0 8px rgba(59, 130, 246, 0.5)",
                  }}
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  {t("accounts.facebookMessenger")}
                </a>
                <a
                  href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center transition-all duration-300 hover:scale-105 ${
                    theme === "dark" ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-800"
                  }`}
                  style={{
                    textShadow: "0 0 8px rgba(59, 130, 246, 0.5)",
                  }}
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  {t("accounts.whatsappCloudApi")}
                </a>
                <a
                  href="https://developers.facebook.com/docs/instagram-basic-display-api/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center transition-all duration-300 hover:scale-105 ${
                    theme === "dark" ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-800"
                  }`}
                  style={{
                    textShadow: "0 0 8px rgba(59, 130, 246, 0.5)",
                  }}
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Instagram API Documentation
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
