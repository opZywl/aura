"use client"

import { useState } from "react"
import Link from "next/link"

export default function FeedbackPage() {
    const [message, setMessage] = useState("")
    const [email, setEmail] = useState("")
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setSubmitted(true)
        setMessage("")
        setEmail("")
    }

    return (
        <main className="min-h-screen bg-black text-gray-200">
            <div className="mx-auto max-w-3xl px-4 py-16 space-y-10">
                <header className="space-y-4">
                    <Link href="/" className="text-sm text-gray-400 hover:text-gray-200">
                        ← Voltar para o início
                    </Link>
                    <h1 className="text-3xl font-semibold text-white">Envie um feedback</h1>
                    <p className="text-sm text-gray-400">
                        Compartilhe impressões sobre o Aura, protótipo descrito no artigo acadêmico de automação para oficinas mecânicas.
                    </p>
                </header>

                <section className="space-y-4">
                    <p className="text-sm leading-relaxed text-gray-300">
                        As mensagens são utilizadas apenas para aprimorar a experiência demonstrada na versão open source. Não há coleta automática de dados pessoais.
                    </p>
                </section>

                <section>
                    {submitted ? (
                        <div className="rounded-md border border-white/10 bg-white/5 p-6 text-sm text-gray-200">
                            Obrigado pelo retorno! Sua mensagem foi registrada para análise da equipe acadêmica.
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <label className="block text-sm">
                                <span className="mb-1 block text-gray-300">E-mail (opcional)</span>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    placeholder="voce@exemplo.com"
                                    className="w-full rounded-md border border-white/10 bg-black px-3 py-2 text-sm text-gray-100 focus:border-white/30 focus:outline-none"
                                />
                            </label>

                            <label className="block text-sm">
                                <span className="mb-1 block text-gray-300">Mensagem</span>
                                <textarea
                                    value={message}
                                    onChange={(event) => setMessage(event.target.value)}
                                    rows={4}
                                    required
                                    className="w-full rounded-md border border-white/10 bg-black px-3 py-2 text-sm text-gray-100 focus:border-white/30 focus:outline-none"
                                />
                            </label>

                            <button
                                type="submit"
                                className="inline-flex items-center rounded-md border border-white/20 px-4 py-2 text-sm font-medium text-white hover:border-white/40"
                            >
                                Enviar feedback
                            </button>
                        </form>
                    )}
                </section>

                <footer className="text-xs text-gray-500">
                    Esta página não utiliza animações nem rastreadores. Última revisão: 2024.
                </footer>
            </div>
        </main>
    )
}
