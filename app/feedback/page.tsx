"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Star, MessageSquare, Clock, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useTheme } from "next-themes"

export default function FeedbackPage() {
    const { theme, systemTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    const [rating, setRating] = useState(0)
    const [email, setEmail] = useState("")
    const [message, setMessage] = useState("")
    const [submitted, setSubmitted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    // Detecta o tema atual (incluindo system)
    const currentTheme = theme === "system" ? systemTheme : theme
    const isDark = currentTheme === "dark"

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Simular envio do feedback
        setSubmitted(true)
        setTimeout(() => {
            setSubmitted(false)
            setRating(0)
            setEmail("")
            setMessage("")
        }, 3000)
    }

    return (
        <div
            className={`min-h-screen transition-all duration-500 relative ${
                isDark
                    ? "bg-gradient-to-br from-gray-900 via-black to-gray-900 text-gray-100"
                    : "bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900"
            }`}
        >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div
                    className={`w-full h-full ${isDark ? "bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),transparent)]" : "bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent)]"}`}
                />
            </div>

            <div className="fixed inset-0 z-0">
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `
                  linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
                `,
                        backgroundSize: "50px 50px",
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black" />
            </div>

            <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-16 text-center"
                >
                    <Link href="/">
                        <Button
                            variant="outline"
                            className={`mb-8 transition-all duration-300 ${
                                isDark
                                    ? "border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500"
                                    : "border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400"
                            }`}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Voltar ao Início
                        </Button>
                    </Link>

                    <motion.h1
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className={`text-6xl md:text-7xl font-black mb-6 ${isDark ? "text-white" : "text-gray-900"}`}
                        style={{
                            textShadow: isDark ? "0 0 30px rgba(192, 192, 192, 0.3)" : "0 0 30px rgba(0, 0, 0, 0.1)",
                            letterSpacing: "-0.02em",
                        }}
                    >
                        Feedback da Aura
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className={`text-xl ${isDark ? "text-gray-300" : "text-gray-600"}`}
                    >
                        Sua opinião é fundamental para melhorarmos nossos serviços de IA
                    </motion.p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-12">
                    {/* Feedback Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className={`p-8 rounded-3xl ${
                            isDark
                                ? "bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50"
                                : "bg-gradient-to-br from-white/80 to-gray-50/80 border border-gray-200/50"
                        } backdrop-blur-sm`}
                    >
                        <h2 className={`text-3xl font-bold mb-6 ${isDark ? "text-white" : "text-gray-900"}`}>
                            Compartilhe sua Experiência
                        </h2>

                        {submitted ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-12"
                            >
                                <CheckCircle className={`w-16 h-16 mx-auto mb-4 ${isDark ? "text-green-400" : "text-green-600"}`} />
                                <h3 className={`text-2xl font-bold mb-2 ${isDark ? "text-green-400" : "text-green-600"}`}>
                                    Feedback Enviado!
                                </h3>
                                <p className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>Obrigado por sua contribuição!</p>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Rating */}
                                <div>
                                    <label className={`block text-sm font-medium mb-3 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                                        Como você avalia nossos serviços?
                                    </label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setRating(star)}
                                                className={`p-2 rounded-lg transition-all duration-200 ${
                                                    star <= rating
                                                        ? "text-yellow-400 scale-110"
                                                        : isDark
                                                            ? "text-gray-600 hover:text-yellow-400"
                                                            : "text-gray-300 hover:text-yellow-400"
                                                }`}
                                            >
                                                <Star className="w-8 h-8 fill-current" />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Email */}
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                                        Email (opcional)
                                    </label>
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="seu@email.com"
                                        className={`${
                                            isDark
                                                ? "bg-gray-800/50 border-gray-600 text-gray-100 placeholder-gray-400"
                                                : "bg-white/50 border-gray-300 text-gray-900 placeholder-gray-500"
                                        }`}
                                    />
                                </div>

                                {/* Message */}
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                                        Seu Feedback
                                    </label>
                                    <Textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Conte-nos sobre sua experiência com a Aura..."
                                        rows={5}
                                        required
                                        className={`${
                                            isDark
                                                ? "bg-gray-800/50 border-gray-600 text-gray-100 placeholder-gray-400"
                                                : "bg-white/50 border-gray-300 text-gray-900 placeholder-gray-500"
                                        }`}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className={`w-full ${
                                        isDark
                                            ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                                            : "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                                    } text-white py-3 text-lg font-semibold transition-all duration-300 transform hover:scale-105`}
                                >
                                    Enviar Feedback
                                </Button>
                            </form>
                        )}
                    </motion.div>

                    {/* Info Cards */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                        className="space-y-6"
                    >
                        {/* Why Feedback Matters */}
                        <div
                            className={`p-6 rounded-2xl ${
                                isDark
                                    ? "bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-500/30"
                                    : "bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200/50"
                            }`}
                        >
                            <div className="flex items-center mb-4">
                                <MessageSquare className={`w-8 h-8 mr-3 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
                                <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                                    Por que seu feedback importa?
                                </h3>
                            </div>
                            <p className={`${isDark ? "text-gray-300" : "text-gray-700"}`}>
                                Cada feedback nos ajuda a aprimorar nossos agentes de IA e criar soluções mais eficazes para sua
                                empresa.
                            </p>
                        </div>

                        {/* Quick Response */}
                        <div
                            className={`p-6 rounded-2xl ${
                                isDark
                                    ? "bg-gradient-to-br from-green-900/30 to-teal-900/30 border border-green-500/30"
                                    : "bg-gradient-to-br from-green-50 to-teal-50 border border-green-200/50"
                            }`}
                        >
                            <div className="flex items-center mb-4">
                                <Clock className={`w-8 h-8 mr-3 ${isDark ? "text-green-400" : "text-green-600"}`} />
                                <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Resposta Rápida</h3>
                            </div>
                            <p className={`${isDark ? "text-gray-300" : "text-gray-700"}`}>
                                Nossa equipe analisa todos os feedbacks e responde em até 24 horas para questões que requerem atenção.
                            </p>
                        </div>

                        {/* Open Source Note */}
                        <div
                            className={`p-6 rounded-2xl ${
                                isDark
                                    ? "bg-gradient-to-br from-orange-900/30 to-red-900/30 border border-orange-500/30"
                                    : "bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200/50"
                            }`}
                        >
                            <div className="flex items-center mb-4">
                                <Star className={`w-8 h-8 mr-3 ${isDark ? "text-orange-400" : "text-orange-600"}`} />
                                <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Projeto Open Source</h3>
                            </div>
                            <p className={`${isDark ? "text-gray-300" : "text-gray-700"}`}>
                                Como projeto acadêmico open source, valorizamos a transparência e a colaboração da comunidade.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
