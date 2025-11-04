"use client"

import { useEffect, useMemo, useState } from "react"
import { BarChart3, Calendar, MessageSquare, RefreshCw, TrendingUp, History, X } from "lucide-react"
import { useTheme } from "@/src/aura/features/view/homePanels/ThemeContext"

interface ConversationData {
    id: string
    title: string
    platform: string
    messageCount: number
    lastMessage: string
    createdAt: string
    lastAt: string
    isArchived: boolean
}

interface StatsData {
    today: number
    week: number
    month: number
    total: number
}

interface BookingStatsData {
    today_confirmed: number
    today_cancelled: number
    month_confirmed: number
    month_cancelled: number
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export default function Statistics() {
    const { theme } = useTheme()
    const isDark = theme === "dark"

    const [stats, setStats] = useState<StatsData>({ today: 0, week: 0, month: 0, total: 0 })
    const [bookingStats, setBookingStats] = useState<BookingStatsData>({
        today_confirmed: 0,
        today_cancelled: 0,
        month_confirmed: 0,
        month_cancelled: 0,
    })
    const [conversations, setConversations] = useState<ConversationData[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [filter, setFilter] = useState<"today" | "month">("today")
    const [selectedConversation, setSelectedConversation] = useState<ConversationData | null>(null)
    const [conversationHistory, setConversationHistory] = useState<any[]>([])
    const [isLoadingHistory, setIsLoadingHistory] = useState(false)

    const themedCard = useMemo(
        () =>
            theme === "dark"
                ? "bg-[#121212] border border-[#1f1f1f] text-gray-100"
                : "bg-white border border-gray-200 text-gray-900",
        [theme],
    )

    const themedMutedText = theme === "dark" ? "text-gray-400" : "text-gray-500"

    const fetchStats = async () => {
        setIsLoading(true)
        try {
            const now = new Date()
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

            const todayResponse = await fetch(
                `${API_BASE_URL}/api/statistics/telegram?start_date=${startOfDay.toISOString()}`,
                { cache: "no-store" },
            )
            const todayData = todayResponse.ok ? await todayResponse.json() : { total_conversations: 0, bookings: {} }

            const weekResponse = await fetch(
                `${API_BASE_URL}/api/statistics/telegram?start_date=${startOfWeek.toISOString()}`,
                { cache: "no-store" },
            )
            const weekData = weekResponse.ok ? await weekResponse.json() : { total_conversations: 0 }

            const monthResponse = await fetch(
                `${API_BASE_URL}/api/statistics/telegram?start_date=${startOfMonth.toISOString()}`,
                { cache: "no-store" },
            )
            const monthData = monthResponse.ok ? await monthResponse.json() : { total_conversations: 0, bookings: {} }

            const totalResponse = await fetch(`${API_BASE_URL}/api/statistics/telegram`, { cache: "no-store" })
            const totalData = totalResponse.ok ? await totalResponse.json() : { total_conversations: 0 }

            setStats({
                today: todayData.total_conversations,
                week: weekData.total_conversations,
                month: monthData.total_conversations,
                total: totalData.total_conversations,
            })

            setBookingStats({
                today_confirmed: todayData.bookings?.total_confirmed || 0,
                today_cancelled: todayData.bookings?.total_cancelled || 0,
                month_confirmed: monthData.bookings?.total_confirmed || 0,
                month_cancelled: monthData.bookings?.total_cancelled || 0,
            })
        } catch (error) {
            console.error("Erro ao carregar estatísticas:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const fetchConversations = async () => {
        try {
            const now = new Date()
            let startDate: Date

            if (filter === "today") {
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            } else {
                startDate = new Date(now.getFullYear(), now.getMonth(), 1)
            }

            const response = await fetch(`${API_BASE_URL}/api/statistics/telegram?start_date=${startDate.toISOString()}`, {
                cache: "no-store",
            })

            if (response.ok) {
                const data = await response.json()
                setConversations(data.conversations || [])
            }
        } catch (error) {
            console.error("Erro ao carregar conversas:", error)
        }
    }

    const fetchConversationHistory = async (conversationId: string) => {
        setIsLoadingHistory(true)
        try {
            const response = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}/messages`, {
                cache: "no-store",
            })

            if (response.ok) {
                const messages = await response.json()
                setConversationHistory(messages || [])
            } else {
                console.error("Erro ao buscar mensagens:", response.status)
                setConversationHistory([])
            }
        } catch (error) {
            console.error("Erro ao carregar histórico:", error)
            setConversationHistory([])
        } finally {
            setIsLoadingHistory(false)
        }
    }

    const openHistoryModal = (conversation: ConversationData) => {
        setSelectedConversation(conversation)
        fetchConversationHistory(conversation.id)
    }

    const closeHistoryModal = () => {
        setSelectedConversation(null)
        setConversationHistory([])
    }

    useEffect(() => {
        fetchStats()
        fetchConversations()
    }, [filter])

    const handleRefresh = () => {
        fetchStats()
        fetchConversations()
    }

    const percentage = stats.total > 0 ? Math.round((stats.today / stats.total) * 100) : 0

    const formatTimestamp = (timestamp: string) => {
        try {
            const date = new Date(timestamp)
            const now = new Date()
            const diffMs = now.getTime() - date.getTime()
            const diffMins = Math.floor(diffMs / 60000)
            const diffHours = Math.floor(diffMs / 3600000)
            const diffDays = Math.floor(diffMs / 86400000)

            if (diffMins < 1) return "Agora"
            if (diffMins < 60) return `${diffMins}min atrás`
            if (diffHours < 24) return `${diffHours}h atrás`
            if (diffDays < 7) return `${diffDays}d atrás`
            return date.toLocaleDateString("pt-BR")
        } catch {
            return timestamp
        }
    }

    const formatFullDate = (timestamp: string) => {
        try {
            const date = new Date(timestamp)
            return date.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            })
        } catch {
            return "Data inválida"
        }
    }

    return (
        <div className={`min-h-screen w-full ${theme === "dark" ? "bg-[#050505] text-white" : "bg-gray-50 text-gray-900"}`}>
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
                <header className={`flex flex-col gap-2 rounded-xl p-6 ${themedCard}`}>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-semibold">Estatísticas</h1>
                            <p className={`mt-1 text-sm ${themedMutedText}`}>Acompanhe suas conversas e mensagens do Telegram</p>
                        </div>
                        <button
                            onClick={handleRefresh}
                            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                                theme === "dark"
                                    ? "border-[#2a2a2a] bg-[#101010] hover:bg-[#181818]"
                                    : "border-gray-200 bg-white hover:bg-gray-100"
                            }`}
                        >
                            <RefreshCw className="h-4 w-4" />
                        </button>
                    </div>
                </header>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className={`rounded-xl p-4 ${themedCard}`}>
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-blue-500/10 p-2">
                                <MessageSquare className="h-5 w-5 text-blue-500" />
                            </div>
                            <div>
                                <p className={`text-xs ${themedMutedText}`}>Hoje</p>
                                <p className="text-2xl font-semibold">{stats.today}</p>
                            </div>
                        </div>
                    </div>

                    <div className={`rounded-xl p-4 ${themedCard}`}>
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-purple-500/10 p-2">
                                <Calendar className="h-5 w-5 text-purple-500" />
                            </div>
                            <div>
                                <p className={`text-xs ${themedMutedText}`}>Esta Semana</p>
                                <p className="text-2xl font-semibold">{stats.week}</p>
                            </div>
                        </div>
                    </div>

                    <div className={`rounded-xl p-4 ${themedCard}`}>
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-green-500/10 p-2">
                                <TrendingUp className="h-5 w-5 text-green-500" />
                            </div>
                            <div>
                                <p className={`text-xs ${themedMutedText}`}>Este Mês</p>
                                <p className="text-2xl font-semibold">{stats.month}</p>
                            </div>
                        </div>
                    </div>

                    <div className={`rounded-xl p-4 ${themedCard}`}>
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-orange-500/10 p-2">
                                <BarChart3 className="h-5 w-5 text-orange-500" />
                            </div>
                            <div>
                                <p className={`text-xs ${themedMutedText}`}>Total</p>
                                <p className="text-2xl font-semibold">{stats.total}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <section className={`rounded-xl p-6 ${themedCard}`}>
                    <h2 className="mb-6 text-lg font-semibold">Estatísticas de Agendamentos</h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div
                            className={`rounded-xl p-4 border ${theme === "dark" ? "border-[#1f1f1f] bg-[#0b0b0f]" : "border-gray-200 bg-gray-50"}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-emerald-500/10 p-2">
                                    <Calendar className="h-5 w-5 text-emerald-500" />
                                </div>
                                <div>
                                    <p className={`text-xs ${themedMutedText}`}>Confirmados Hoje</p>
                                    <p className="text-2xl font-semibold text-emerald-500">{bookingStats.today_confirmed}</p>
                                </div>
                            </div>
                        </div>

                        <div
                            className={`rounded-xl p-4 border ${theme === "dark" ? "border-[#1f1f1f] bg-[#0b0b0f]" : "border-gray-200 bg-gray-50"}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-red-500/10 p-2">
                                    <X className="h-5 w-5 text-red-500" />
                                </div>
                                <div>
                                    <p className={`text-xs ${themedMutedText}`}>Cancelados Hoje</p>
                                    <p className="text-2xl font-semibold text-red-500">{bookingStats.today_cancelled}</p>
                                </div>
                            </div>
                        </div>

                        <div
                            className={`rounded-xl p-4 border ${theme === "dark" ? "border-[#1f1f1f] bg-[#0b0b0f]" : "border-gray-200 bg-gray-50"}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-emerald-500/10 p-2">
                                    <Calendar className="h-5 w-5 text-emerald-500" />
                                </div>
                                <div>
                                    <p className={`text-xs ${themedMutedText}`}>Confirmados no Mês</p>
                                    <p className="text-2xl font-semibold text-emerald-500">{bookingStats.month_confirmed}</p>
                                </div>
                            </div>
                        </div>

                        <div
                            className={`rounded-xl p-4 border ${theme === "dark" ? "border-[#1f1f1f] bg-[#0b0b0f]" : "border-gray-200 bg-gray-50"}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-red-500/10 p-2">
                                    <X className="h-5 w-5 text-red-500" />
                                </div>
                                <div>
                                    <p className={`text-xs ${themedMutedText}`}>Cancelados no Mês</p>
                                    <p className="text-2xl font-semibold text-red-500">{bookingStats.month_cancelled}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className={`rounded-xl p-6 ${themedCard}`}>
                    <h2 className="mb-6 text-lg font-semibold">Visão Geral</h2>
                    <div className="flex items-center justify-center py-8">
                        <div className="relative h-48 w-48">
                            <svg className="h-full w-full -rotate-90 transform">
                                <circle
                                    cx="96"
                                    cy="96"
                                    r="80"
                                    stroke={theme === "dark" ? "#1f1f1f" : "#e5e7eb"}
                                    strokeWidth="16"
                                    fill="none"
                                />
                                <circle
                                    cx="96"
                                    cy="96"
                                    r="80"
                                    stroke="url(#gradient)"
                                    strokeWidth="16"
                                    fill="none"
                                    strokeDasharray={`${(percentage / 100) * 502.4} 502.4`}
                                    strokeLinecap="round"
                                    className="transition-all duration-1000"
                                />
                                <defs>
                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#3b82f6" />
                                        <stop offset="100%" stopColor="#8b5cf6" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-bold">{percentage}%</span>
                                <span className={`text-xs ${themedMutedText}`}>Hoje</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className={`rounded-xl p-6 ${themedCard}`}>
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Relatório de Conversas</h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilter("today")}
                                className={`rounded-lg px-3 py-1 text-sm transition-colors ${
                                    filter === "today"
                                        ? "bg-blue-500 text-white"
                                        : theme === "dark"
                                            ? "bg-[#1f1f1f] text-gray-400 hover:bg-[#2a2a2a]"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                            >
                                Hoje
                            </button>
                            <button
                                onClick={() => setFilter("month")}
                                className={`rounded-lg px-3 py-1 text-sm transition-colors ${
                                    filter === "month"
                                        ? "bg-blue-500 text-white"
                                        : theme === "dark"
                                            ? "bg-[#1f1f1f] text-gray-400 hover:bg-[#2a2a2a]"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                            >
                                Mês
                            </button>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center gap-3 rounded-lg border border-dashed border-blue-400/50 px-4 py-6 text-blue-400">
                            <RefreshCw className="h-5 w-5 animate-spin" />
                            <span>Carregando conversas...</span>
                        </div>
                    ) : conversations.length === 0 ? (
                        <div
                            className={`flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-10 ${
                                theme === "dark" ? "border-[#2a2a2a]" : "border-gray-300"
                            }`}
                        >
                            <MessageSquare className={`h-12 w-12 ${themedMutedText}`} />
                            <p className="text-sm font-medium">Nenhuma conversa encontrada</p>
                            <p className={`text-xs ${themedMutedText}`}>As conversas aparecerão aqui quando disponíveis</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {conversations.map((conv) => (
                                <div
                                    key={conv.id}
                                    className={`rounded-lg border p-4 transition-colors ${
                                        theme === "dark"
                                            ? "border-[#1f1f1f] bg-[#0b0b0f] hover:bg-[#121218]"
                                            : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold">{conv.title}</h3>
                                                <span
                                                    className={`rounded-full px-2 py-0.5 text-xs ${
                                                        theme === "dark" ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"
                                                    }`}
                                                >
                          {conv.platform}
                        </span>
                                            </div>
                                            <p className={`mt-1 text-sm ${themedMutedText}`}>
                                                {conv.lastMessage.length > 60 ? `${conv.lastMessage.substring(0, 60)}...` : conv.lastMessage}
                                            </p>
                                            <div className={`mt-2 flex items-center gap-3 text-xs ${themedMutedText}`}>
                                                <span>Início: {formatFullDate(conv.createdAt)}</span>
                                                <span>•</span>
                                                <span>Última msg: {formatFullDate(conv.lastAt)}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <p className="text-sm font-medium">{conv.messageCount} msgs</p>
                                                <p className={`text-xs ${themedMutedText}`}>{formatTimestamp(conv.lastAt)}</p>
                                            </div>
                                            <button
                                                onClick={() => openHistoryModal(conv)}
                                                className={`rounded-lg p-2 transition-colors ${
                                                    theme === "dark"
                                                        ? "bg-[#1f1f1f] hover:bg-[#2a2a2a] text-gray-400 hover:text-blue-400"
                                                        : "bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-blue-600"
                                                }`}
                                                title="Ver histórico de mensagens"
                                            >
                                                <History className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            {selectedConversation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div
                        className={`relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-xl ${
                            theme === "dark" ? "bg-[#0a0a0a] border border-[#1f1f1f]" : "bg-white border border-gray-200"
                        }`}
                    >
                        <div
                            className={`sticky top-0 z-10 border-b p-6 ${theme === "dark" ? "border-[#1f1f1f] bg-[#0a0a0a]" : "border-gray-200 bg-white"}`}
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold">Histórico de Mensagens</h2>
                                    <p className={`mt-1 text-sm ${themedMutedText}`}>Visualize todo histórico de mensagens da conversa</p>
                                </div>
                                <button
                                    onClick={closeHistoryModal}
                                    className={`rounded-lg p-2 transition-colors ${
                                        theme === "dark"
                                            ? "hover:bg-[#1f1f1f] text-gray-400 hover:text-white"
                                            : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                                    }`}
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        <div className="overflow-y-auto p-6" style={{ maxHeight: "calc(90vh - 120px)" }}>
                            {isLoadingHistory ? (
                                <div className="flex items-center justify-center gap-3 py-12">
                                    <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
                                    <span className={themedMutedText}>Carregando histórico...</span>
                                </div>
                            ) : conversationHistory.length === 0 ? (
                                <div className="flex flex-col items-center justify-center gap-3 py-12">
                                    <MessageSquare className={`h-12 w-12 ${themedMutedText}`} />
                                    <p className={`text-sm ${themedMutedText}`}>Nenhuma mensagem encontrada</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {conversationHistory.map((message, index) => {
                                        const senderRaw = typeof message.sender === "string" ? message.sender : ""
                                        const senderType = senderRaw.toLowerCase()
                                        const isOperator = ["operator", "attendant", "agent", "human", "atendente"].includes(senderType)
                                        const isBot = ["bot", "assistant", "system", "fluxo", "flow"].includes(senderType)
                                        const timestamp = new Date(message.timestamp).toLocaleString("pt-BR", {
                                            year: "numeric",
                                            month: "2-digit",
                                            day: "2-digit",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })

                                        return (
                                            <div
                                                key={message.id || index}
                                                className={`flex ${isBot || isOperator ? "justify-end" : "justify-start"}`}
                                            >
                                                <div
                                                    className={`max-w-[80%] ${
                                                        isBot || isOperator ? "items-end" : "items-start"
                                                    } flex flex-col gap-1`}
                                                >
                                                    <div
                                                        className="rounded-2xl px-4 py-3 border shadow-sm backdrop-blur-sm transition-transform"
                                                        style={{
                                                            background: isBot
                                                                ? "linear-gradient(135deg, rgba(59,130,246,0.95), rgba(59,130,246,0.8))"
                                                                : isOperator
                                                                    ? isDark
                                                                        ? "rgba(16,185,129,0.18)"
                                                                        : "rgba(16,185,129,0.12)"
                                                                    : isDark
                                                                        ? "rgba(31,31,31,0.92)"
                                                                        : "rgba(241,245,249,0.95)",
                                                            color: isBot
                                                                ? "#ffffff"
                                                                : isOperator
                                                                    ? isDark
                                                                        ? "#d1fae5"
                                                                        : "#065f46"
                                                                    : isDark
                                                                        ? "#f1f5f9"
                                                                        : "#111827",
                                                            borderColor: isBot
                                                                ? "rgba(96,165,250,0.45)"
                                                                : isOperator
                                                                    ? isDark
                                                                        ? "rgba(74,222,128,0.45)"
                                                                        : "rgba(16,185,129,0.45)"
                                                                    : isDark
                                                                        ? "rgba(255,255,255,0.06)"
                                                                        : "rgba(15,23,42,0.08)",
                                                            boxShadow: isBot
                                                                ? "0 18px 35px rgba(59,130,246,0.25)"
                                                                : isOperator
                                                                    ? "0 16px 32px rgba(16,185,129,0.22)"
                                                                    : isDark
                                                                        ? "0 12px 24px rgba(15,15,20,0.45)"
                                                                        : "0 10px 20px rgba(15,23,42,0.1)",
                                                        }}
                                                    >
                                                        <p
                                                            className="text-[11px] font-semibold uppercase tracking-[0.18em] mb-1 flex items-center gap-2"
                                                            style={{
                                                                color: isBot
                                                                    ? "#cbd5f5"
                                                                    : isOperator
                                                                        ? isDark
                                                                            ? "#34d399"
                                                                            : "#047857"
                                                                        : isDark
                                                                            ? "#94a3b8"
                                                                            : "#475569",
                                                                letterSpacing: "0.2em",
                                                            }}
                                                        >
                                                            {isBot ? "Fluxo automatizado" : isOperator ? "Operador" : "Cliente"}
                                                            {isOperator && (
                                                                <span
                                                                    className="inline-flex h-2.5 w-2.5 rounded-full"
                                                                    style={{
                                                                        background: isDark ? "rgba(74,222,128,0.8)" : "rgba(16,185,129,0.8)",
                                                                        boxShadow: isDark
                                                                            ? "0 0 10px rgba(74,222,128,0.8)"
                                                                            : "0 0 8px rgba(16,185,129,0.6)",
                                                                    }}
                                                                />
                                                            )}
                                                        </p>
                                                        <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{message.text}</p>
                                                    </div>
                                                    <span className={`text-xs px-2 ${themedMutedText}`}>{timestamp}</span>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        <div
                            className={`sticky bottom-0 border-t p-4 ${theme === "dark" ? "border-[#1f1f1f] bg-[#0a0a0a]" : "border-gray-200 bg-white"}`}
                        >
                            <button
                                onClick={closeHistoryModal}
                                className={`w-full rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                                    theme === "dark"
                                        ? "bg-[#1f1f1f] hover:bg-[#2a2a2a] text-white"
                                        : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                                }`}
                            >
                                Voltar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
