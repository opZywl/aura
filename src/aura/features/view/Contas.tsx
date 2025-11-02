"use client"

import { useEffect, useMemo, useState } from "react"
import { AlertCircle, Eye, EyeOff, PlusCircle, RefreshCw, Trash2 } from "lucide-react"

import { useTheme } from "@/src/aura/features/view/homePanels/ThemeContext"

interface TelegramAccount {
    id: string
    apiKey: string
    botName: string
}

type FeedbackState = {
    type: "success" | "error"
    message: string
} | null

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export default function Contas() {
    const { theme } = useTheme()

    const [accounts, setAccounts] = useState<TelegramAccount[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isConnecting, setIsConnecting] = useState(false)
    const [apiError, setApiError] = useState<string | null>(null)
    const [feedback, setFeedback] = useState<FeedbackState>(null)
    const [showToken, setShowToken] = useState(false)
    const [connectionData, setConnectionData] = useState({ botToken: "", botName: "" })

    const themedCard = useMemo(
        () =>
            theme === "dark"
                ? "bg-[#121212] border border-[#1f1f1f] text-gray-100"
                : "bg-white border border-gray-200 text-gray-900",
        [theme],
    )

    const themedMutedText = theme === "dark" ? "text-gray-400" : "text-gray-500"
    const themedInput =
        theme === "dark"
            ? "bg-[#0f0f0f] border-[#2a2a2a] text-gray-100 placeholder:text-gray-500"
            : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"

    const fetchAccounts = async () => {
        setIsLoading(true)
        setApiError(null)
        try {
            const response = await fetch(`${API_BASE_URL}/api/accounts`, { cache: "no-store" })
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`)
            }
            const data: TelegramAccount[] = await response.json()
            setAccounts(data)
        } catch (error) {
            console.error("Erro ao carregar contas:", error)
            setApiError(String(error))
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchAccounts()
    }, [])

    const handleConnect = async () => {
        if (!connectionData.botName.trim() || !connectionData.botToken.trim()) {
            setFeedback({ type: "error", message: "Preencha todos os campos" })
            return
        }

        setIsConnecting(true)
        setFeedback(null)
        try {
            const response = await fetch(`${API_BASE_URL}/api/accounts`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ apiKey: connectionData.botToken.trim(), botName: connectionData.botName.trim() }),
            })

            if (!response.ok) {
                const payload = await response.json().catch(() => ({}))
                throw new Error(payload?.erro || `HTTP ${response.status}`)
            }

            setConnectionData({ botToken: "", botName: "" })
            setFeedback({ type: "success", message: "Conta conectada com sucesso!" })
            fetchAccounts()
        } catch (error) {
            console.error("Erro ao conectar conta:", error)
            setFeedback({ type: "error", message: `Erro ao conectar conta: ${String(error)}` })
        } finally {
            setIsConnecting(false)
        }
    }

    const handleRemove = async (accountId: string) => {
        setFeedback(null)
        try {
            const response = await fetch(`${API_BASE_URL}/api/accounts/${accountId}`, { method: "DELETE" })
            if (!response.ok) {
                const payload = await response.json().catch(() => ({}))
                throw new Error(payload?.erro || `HTTP ${response.status}`)
            }

            setFeedback({ type: "success", message: "Conta removida com sucesso!" })
            fetchAccounts()
        } catch (error) {
            console.error("Erro ao remover conta:", error)
            setFeedback({ type: "error", message: `Erro ao excluir conta: ${String(error)}` })
        }
    }

    const handleRefresh = () => {
        setFeedback(null)
        fetchAccounts()
    }

    return (
        <div className={`min-h-screen w-full ${theme === "dark" ? "bg-[#050505] text-white" : "bg-gray-50 text-gray-900"}`}>
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
                <header className={`flex flex-col gap-2 rounded-xl p-6 ${themedCard}`}>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-semibold">Contas Conectadas</h1>
                            <p className={`mt-1 text-sm ${themedMutedText}`}>
                                Gerencie suas contas de redes sociais conectadas ao Aura
                            </p>
                        </div>
                        <button
                            onClick={handleRefresh}
                            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                                theme === "dark"
                                    ? "border-[#2a2a2a] bg-[#101010] hover:bg-[#181818]"
                                    : "border-gray-200 bg-white hover:bg-gray-100"
                            }`}
                            title="Refresh"
                        >
                            <RefreshCw className="h-4 w-4" />
                            <span className="sr-only">Refresh</span>
                        </button>
                    </div>
                    {apiError && (
                        <div className={`mt-4 flex items-start gap-3 rounded-lg border-l-4 border-red-500 px-4 py-3 ${themedCard}`}>
                            <AlertCircle className="mt-0.5 h-5 w-5 text-red-400" />
                            <div>
                                <p className="text-sm font-medium text-red-300">Servidor Flask não detectado</p>
                                <p className={`text-sm ${themedMutedText}`}>{apiError}</p>
                                <code className={`mt-2 block rounded bg-black/40 px-3 py-1 text-xs ${themedMutedText}`}>
                                    Execute: cd src/aura && python app.py
                                </code>
                            </div>
                        </div>
                    )}
                </header>

                {feedback && (
                    <div
                        className={`rounded-lg border px-4 py-3 text-sm font-medium ${
                            feedback.type === "success"
                                ? theme === "dark"
                                    ? "border-green-700 bg-green-900/40 text-green-200"
                                    : "border-green-200 bg-green-50 text-green-700"
                                : theme === "dark"
                                    ? "border-red-700 bg-red-900/40 text-red-200"
                                    : "border-red-200 bg-red-50 text-red-700"
                        }`}
                    >
                        {feedback.message}
                    </div>
                )}

                <section className={`rounded-xl p-6 ${themedCard}`}>
                    <div className="mb-6 flex items-center gap-3">
                        <PlusCircle className="h-5 w-5 text-blue-500" />
                        <div>
                            <h2 className="text-lg font-semibold">Conectar Telegram</h2>
                            <p className={`text-sm ${themedMutedText}`}>Preencha os dados do seu bot</p>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="flex flex-col gap-2 text-sm font-medium">
                            Nome do Bot
                            <input
                                type="text"
                                value={connectionData.botName}
                                onChange={(event) => setConnectionData((prev) => ({ ...prev, botName: event.target.value }))}
                                placeholder="Ex.: Meu Bot"
                                className={`rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${themedInput}`}
                            />
                        </label>
                        <label className="flex flex-col gap-2 text-sm font-medium">
                            Token do Bot
                            <div className="relative">
                                <input
                                    type={showToken ? "text" : "password"}
                                    value={connectionData.botToken}
                                    onChange={(event) => setConnectionData((prev) => ({ ...prev, botToken: event.target.value }))}
                                    placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                                    className={`w-full rounded-lg border px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 ${themedInput}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowToken((prev) => !prev)}
                                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-200"
                                >
                                    {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </label>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-3">
                        <button
                            onClick={handleConnect}
                            disabled={isConnecting}
                            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors ${
                                isConnecting ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                            }`}
                        >
                            {isConnecting && <RefreshCw className="h-4 w-4 animate-spin" />}
                            {isConnecting ? "Conectando..." : "Conectar"}
                        </button>
                        <span className={`text-xs ${themedMutedText}`}>Modo Offline - As alterações serão salvas localmente</span>
                    </div>
                </section>

                <section className={`rounded-xl p-6 ${themedCard}`}>
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold">Total de Contas</h2>
                            <p className={`text-sm ${themedMutedText}`}>
                                {accounts.length > 0 ? `${accounts.length} ativas` : "Nenhuma conta conectada"}
                            </p>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center gap-3 rounded-lg border border-dashed border-blue-400/50 px-4 py-6 text-blue-400">
                            <RefreshCw className="h-5 w-5 animate-spin" />
                            <span>Carregando contas...</span>
                        </div>
                    ) : accounts.length === 0 ? (
                        <div
                            className={`flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-10 ${
                                theme === "dark" ? "border-[#2a2a2a]" : "border-gray-300"
                            }`}
                        >
                            <UsersPlaceholder theme={theme} />
                            <p className="text-sm font-medium">Conecte sua primeira conta de rede social para começar</p>
                            <p className={`text-xs ${themedMutedText}`}>Clique no ícone para configurar.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {accounts.map((account) => (
                                <article
                                    key={account.id}
                                    className={`relative rounded-lg border p-4 ${
                                        theme === "dark" ? "border-[#1f1f1f] bg-[#0b0b0f]" : "border-gray-200 bg-gray-50"
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-base font-semibold">{account.botName}</h3>
                                            <p className={`mt-1 text-xs ${themedMutedText}`}>{account.id}</p>
                                        </div>
                                        <button
                                            onClick={() => handleRemove(account.id)}
                                            className="rounded-md border border-red-500/40 px-3 py-1 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/10"
                                        >
                                            <Trash2 className="mr-1 inline h-4 w-4" />
                                            Excluir
                                        </button>
                                    </div>
                                    <div className={`mt-3 rounded-md px-3 py-2 text-xs ${themedMutedText}`}>{account.apiKey}</div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}

function UsersPlaceholder({ theme }: { theme: string }) {
    return (
        <div
            className={`flex h-16 w-16 items-center justify-center rounded-full border ${
                theme === "dark" ? "border-[#2a2a2a] bg-[#121212]" : "border-gray-200 bg-white"
            }`}
        >
            <AlertCircle className={`h-8 w-8 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`} />
        </div>
    )
}
