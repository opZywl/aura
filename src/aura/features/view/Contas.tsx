"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  platform: "telegram" | "whatsapp" | "messenger"
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

  // Base URL for API calls - CORRIGIDO
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  const platforms = [
    {
      id: "telegram",
      name: "Telegram",
      icon: "/redesociais/telegram.svg",
      color: "#0088cc",
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
      id: "whatsapp",
      name: "WhatsApp",
      icon: "/redesociais/whatsapp.svg",
      color: "#25d366",
      maxAccounts: 3,
    },
  ]

  // Enhanced API health check with better error handling
  const checkApiHealth = async () => {
    try {
      console.log("🔍 Verificando saúde da API em:", `${API_BASE_URL}/api/health`)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000) // Aumentado para 8s

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
        setApiError(null) // Clear any existing error
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

  // Fetch accounts from API only
  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    setIsLoading(true)
    setApiError(null)

    console.log("🚀 Iniciando fetchAccounts...")

    // Check if API is running first
    const isApiHealthy = await checkApiHealth()
    if (!isApiHealthy) {
      console.log("❌ API não está disponível")
      setConnectedAccounts([])
      setIsLoading(false)
      return
    }

    // Fetch debug info
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

      // Convert to connected accounts format
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

      // Fetch stats for each account
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

    // Validate bot token format
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

      // Refresh accounts list
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

  // Hide interface styles - IMPROVED
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

  // Dynamic styles based on theme
  const isDark = theme === "dark"
  const bgColor = isDark ? "bg-black" : "bg-white"
  const textColor = isDark ? "text-white" : "text-black"
  const secondaryTextColor = isDark ? "text-gray-400" : "text-gray-600"
  const cardBgColor = isDark ? "bg-gray-900" : "bg-white"
  const borderColor = isDark ? "border-gray-700" : "border-gray-200"
  const inputBgColor = isDark ? "bg-gray-900" : "bg-white"
  const inputBorderColor = isDark ? "border-gray-600" : "border-gray-300"
  const hoverBgColor = isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"

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

  if (selectedPlatform === "telegram") {
    return (
      <div className={`min-h-screen p-6 flex flex-col items-center justify-center ${bgColor} ${textColor}`}>
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">{t("accounts.connectTelegram")}</h1>
            <p className={secondaryTextColor}>{t("accounts.fillBotData")}</p>
            {apiError && (
              <p
                className={`text-yellow-600 text-sm mt-2 p-2 rounded-md border ${
                  isDark ? "bg-yellow-900/20 border-yellow-800" : "bg-yellow-50 border-yellow-200"
                }`}
              >
                ⚠️ {getApiErrorMessage()}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">{t("accounts.botToken")}</label>
              <input
                type="text"
                placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
                value={connectionData.botToken}
                onChange={(e) => setConnectionData({ ...connectionData, botToken: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${inputBgColor} ${textColor} ${inputBorderColor} placeholder-gray-400`}
              />
              <p className={`text-xs mt-1 ${secondaryTextColor}`}>
                Obtenha este token conversando com @BotFather no Telegram
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t("accounts.botName")}</label>
              <input
                type="text"
                placeholder="@meu_bot"
                value={connectionData.botName}
                onChange={(e) => setConnectionData({ ...connectionData, botName: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${inputBgColor} ${textColor} ${inputBorderColor} placeholder-gray-400`}
              />
              <p className={`text-xs mt-1 ${secondaryTextColor}`}>Nome do seu bot (opcional, para identificação)</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => setSelectedPlatform(null)}
              variant="outline"
              className={`flex-1 bg-transparent ${borderColor} ${textColor} ${hoverBgColor}`}
              disabled={isConnecting}
            >
              {t("accounts.cancel")}
            </Button>
            <Button
              onClick={handleConnect}
              disabled={isConnecting || !connectionData.botToken || !connectionData.botName}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
            >
              {isConnecting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t("accounts.connecting")}
                </>
              ) : (
                t("accounts.connect")
              )}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${bgColor} ${textColor}`}>
        <div className="text-center">
          <div
            className={`animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4 ${
              isDark ? "border-white" : "border-blue-600"
            }`}
          ></div>
          <p className={secondaryTextColor}>{t("accounts.loadingAccounts")}</p>
          <p className={`text-xs mt-2 ${secondaryTextColor}`}>Verificando conexão com Flask...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen p-6 ${bgColor} ${textColor}`} data-contas-content>
      {/* Debug Info - Apenas em desenvolvimento */}
      {process.env.NODE_ENV === "development" && debugInfo && (
        <div className="mb-4 p-3 bg-gray-800 text-green-400 rounded-lg text-xs font-mono">
          <p>🐛 Debug: API Status = {debugInfo.status}</p>
          <p>
            📊 Accounts: {debugInfo.accounts_count} | Conversations: {debugInfo.conversations_count}
          </p>
          <p>🌐 Ngrok: {debugInfo.ngrok_url || "Not configured"}</p>
          <p>🔗 API Base: {API_BASE_URL}</p>
        </div>
      )}

      {/* API Warning Banner - MELHORADO */}
      {apiError && showApiWarning && (
        <div className="flex justify-center mb-6">
          <div
            className={`border rounded-lg p-4 flex items-center justify-between max-w-2xl w-full ${
              isDark ? "bg-red-900/20 border-red-800 text-red-200" : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            <div className="flex items-center">
              <AlertCircle className={`h-5 w-5 mr-3 ${isDark ? "text-red-400" : "text-red-600"}`} />
              <div>
                <p className="font-medium">🚫 Flask API Offline</p>
                <p className="text-sm">{getApiErrorMessage()}</p>
                <p className="text-xs mt-1">
                  Execute:{" "}
                  <code className={`px-1 rounded ${isDark ? "bg-gray-800" : "bg-gray-200"}`}>
                    python -m src.aura.app
                  </code>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchAccounts}
                className={`${isDark ? "text-red-400 hover:text-red-200" : "text-red-600 hover:text-red-800"}`}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowApiWarning(false)}
                className={`${isDark ? "text-red-400 hover:text-red-200" : "text-red-600 hover:text-red-800"}`}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">{t("accounts.title")}</h1>
        <p className={secondaryTextColor}>{t("accounts.subtitle")}</p>
        {!apiError ? (
          <div className="flex items-center justify-center mt-2">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span className={`text-xs ${isDark ? "text-green-400" : "text-green-600"}`}>
              Flask API conectado em {API_BASE_URL}
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-center mt-2">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
            <span className={`text-xs ${isDark ? "text-red-400" : "text-red-600"}`}>Flask API desconectado</span>
          </div>
        )}
      </div>

      {/* Dashboard Stats */}
      <div className="flex justify-center mb-6">
        <Card className={`w-full max-w-sm ${cardBgColor} ${borderColor}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium ${textColor}`}>{t("accounts.totalAccounts")}</CardTitle>
            <Users className={`h-4 w-4 ${secondaryTextColor}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${textColor}`}>{totalAccounts}</div>
            <p className={`text-xs ${secondaryTextColor}`}>
              {connectedAccounts.filter((acc) => acc.status === "connected").length} {t("accounts.activeAccounts")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 mb-8">
        <Button
          onClick={() => setShowHelpModal(true)}
          variant="outline"
          className={`${cardBgColor} ${borderColor} ${textColor} ${hoverBgColor}`}
        >
          <HelpCircle className="w-4 h-4 mr-2" />
          {t("accounts.howToConnect")}
        </Button>

        <Button
          onClick={() => setHideInterface(!hideInterface)}
          variant="outline"
          className={`${cardBgColor} ${borderColor} ${textColor} ${hoverBgColor}`}
        >
          {hideInterface ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
          {hideInterface ? t("accounts.showInterface") : t("accounts.hideInterface")}
        </Button>

        <Button
          onClick={fetchAccounts}
          variant="outline"
          className={`${cardBgColor} ${borderColor} ${textColor} ${hoverBgColor}`}
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {/* Connect New Channels Section */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">{t("accounts.connectNewChannels")}</h2>
        <p className={`mb-6 ${secondaryTextColor}`}>{t("accounts.clickToSetup")}</p>

        <div className="flex justify-center gap-8 mb-8 platform-icons">
          {platforms.map((platform) => {
            const currentCount = getAccountCount(platform.id)
            const isDisabled = apiError !== null
            return (
              <div key={platform.id} className="flex flex-col items-center platform-icon-item">
                <button
                  onClick={() => !isDisabled && handlePlatformClick(platform.id)}
                  disabled={isDisabled}
                  className={`w-16 h-16 rounded-full border flex items-center justify-center transition-colors ${cardBgColor} ${borderColor} ${
                    isDisabled ? "opacity-50 cursor-not-allowed" : "hover:border-gray-500 cursor-pointer"
                  }`}
                  style={{ borderColor: isDisabled ? undefined : platform.color }}
                >
                  <Image
                    src={platform.icon || "/placeholder.svg"}
                    alt={platform.name}
                    width={32}
                    height={32}
                    className="w-8 h-8"
                    style={{ display: "block !important" }}
                  />
                </button>
                <span className={`text-sm mt-2 ${secondaryTextColor}`}>
                  {currentCount}/{platform.maxAccounts}
                </span>
                {isDisabled && (
                  <span className={`text-xs ${isDark ? "text-red-400" : "text-red-600"}`}>API Offline</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Connected Accounts */}
      {connectedAccounts.length > 0 ? (
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4 text-center">{t("accounts.activeAccounts")}</h3>
          <div className="max-w-4xl mx-auto space-y-4">
            {connectedAccounts.map((account) => (
              <div key={account.id} className={`border rounded-lg p-4 ${cardBgColor} ${borderColor}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isDark ? "bg-gray-800" : "bg-gray-100"
                      }`}
                    >
                      <Image
                        src={`/redesociais/${account.platform}.svg`}
                        alt={account.platform}
                        width={20}
                        height={20}
                        className="w-5 h-5"
                      />
                    </div>
                    <div>
                      <span className={`font-medium ${textColor}`}>{account.name}</span>
                      <p className={`text-xs ${secondaryTextColor}`}>
                        {account.stats.conversations} conversas • {account.stats.messages} mensagens
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 bg-green-600 text-green-100 text-xs rounded-full">
                      {t("accounts.live")}
                    </span>
                    <Button
                      onClick={() => handleDisconnect(account.id)}
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white"
                      disabled={apiError !== null}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      {t("accounts.delete")}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center mb-8">
          <div className={`border rounded-lg p-8 max-w-md mx-auto ${cardBgColor} ${borderColor}`}>
            <Users className={`h-12 w-12 mx-auto mb-4 ${isDark ? "text-gray-600" : "text-gray-400"}`} />
            <h3 className={`text-lg font-medium mb-2 ${textColor}`}>{t("accounts.noAccountsConnected")}</h3>
            <p className={secondaryTextColor}>
              {apiError ? "Conecte o servidor Flask para começar" : t("accounts.connectFirstAccount")}
            </p>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${cardBgColor} rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-2xl font-bold ${textColor}`}>{t("accounts.howToConnect")}</h2>
              <Button
                onClick={() => setShowHelpModal(false)}
                variant="ghost"
                size="sm"
                className={`${isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}`}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <p className={`${secondaryTextColor} mb-6`}>{t("accounts.selectPlatformInstructions")}</p>

            <div className="grid grid-cols-3 gap-6">
              {platforms.map((platform) => (
                <div
                  key={platform.id}
                  onClick={() => {
                    setShowHelpModal(false)
                    handlePlatformClick(platform.id)
                  }}
                  className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer transition-colors ${borderColor} ${
                    isDark ? "hover:bg-gray-800" : "hover:bg-gray-50"
                  }`}
                >
                  <div
                    className={`w-16 h-16 rounded-full border flex items-center justify-center mb-3 ${borderColor}`}
                    style={{ borderColor: platform.color }}
                  >
                    <Image
                      src={platform.icon || "/placeholder.svg"}
                      alt={platform.name}
                      width={32}
                      height={32}
                      className="w-8 h-8"
                    />
                  </div>
                  <h3 className={`font-medium ${textColor}`}>{platform.name}</h3>
                  <p className={`text-sm ${secondaryTextColor} mt-1`}>
                    {platform.id === "telegram"
                      ? t("accounts.viaBotToken")
                      : platform.id === "whatsapp"
                        ? t("accounts.viaQRCode")
                        : t("accounts.viaAppId")}
                  </p>
                  <Button className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white">
                    {t("accounts.connect")}
                  </Button>
                </div>
              ))}
            </div>

            <div
              className={`border rounded-lg p-4 mt-6 ${
                isDark
                  ? "bg-yellow-900/20 border-yellow-800 text-yellow-200"
                  : "bg-yellow-50 border-yellow-200 text-yellow-700"
              }`}
            >
              <h3 className="font-semibold mb-2">⚠️ {t("accounts.needHelp")}</h3>
              <p>{t("accounts.visitOfficialDocs")}</p>
              <div className="flex flex-col space-y-2 mt-3">
                <a
                  href="https://core.telegram.org/bots#creating-a-new-bot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center ${
                    isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-800"
                  }`}
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  {t("accounts.telegramCreateBots")}
                </a>
                <a
                  href="https://developers.facebook.com/docs/messenger-platform/getting-started"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center ${
                    isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-800"
                  }`}
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  {t("accounts.facebookMessenger")}
                </a>
                <a
                  href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center ${
                    isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-800"
                  }`}
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  {t("accounts.whatsappCloudApi")}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
