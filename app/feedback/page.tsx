"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, MessageSquare, Star, Send } from "lucide-react"
import Link from "next/link"
import { useTheme } from "next-themes"

export default function FeedbackPage() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState("")
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aqui você pode implementar o envio do feedback
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  if (!mounted) return null

  return (
    <div
      className={`min-h-screen transition-colors duration-300 relative ${
        theme === "dark"
          ? "bg-gradient-to-br from-gray-900 via-black to-gray-900 text-gray-200"
          : "bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900"
      }`}
    >
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Header com botão voltar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Link href="/">
            <Button
              variant="outline"
              className={`mb-6 ${
                theme === "dark"
                  ? "border-gray-600 text-gray-300 hover:bg-gray-800"
                  : "border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Início
            </Button>
          </Link>

          <h1
            className={`text-4xl md:text-5xl font-extrabold text-center mb-4 ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
            style={{
              textShadow: theme === "dark" ? "0 0 10px rgba(192, 192, 192, 0.7)" : "0 0 10px rgba(0, 0, 0, 0.3)",
              letterSpacing: "0.1em",
            }}
          >
            Feedback da Aura
          </h1>
          <p className={`text-center text-lg ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
            Sua opinião é fundamental para melhorarmos nossos serviços de IA
          </p>
        </motion.div>

        {/* Conteúdo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-8"
        >
          {/* Formulário de Feedback */}
          <div
            className={`p-8 rounded-2xl ${
              theme === "dark" ? "bg-gray-900/50 border border-gray-700" : "bg-gray-50 border border-gray-200"
            }`}
          >
            <div className="flex items-center mb-6">
              <MessageSquare className={`w-6 h-6 mr-3 ${theme === "dark" ? "text-purple-400" : "text-purple-600"}`} />
              <h2 className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                Compartilhe sua Experiência
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Rating */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                >
                  Como você avalia nossos serviços?
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`p-1 transition-colors ${
                        star <= rating ? "text-yellow-400" : theme === "dark" ? "text-gray-600" : "text-gray-300"
                      }`}
                    >
                      <Star className="w-8 h-8 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                >
                  Email (opcional)
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className={`${
                    theme === "dark"
                      ? "bg-gray-800 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                />
              </div>

              {/* Feedback */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                >
                  Seu Feedback
                </label>
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Conte-nos sobre sua experiência com a Aura..."
                  rows={6}
                  className={`${
                    theme === "dark"
                      ? "bg-gray-800 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                  required
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={!feedback.trim() || submitted}
                className={`w-full ${
                  theme === "dark"
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    : "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                } text-white py-3 rounded-xl disabled:opacity-50`}
              >
                {submitted ? (
                  "Feedback Enviado! ✓"
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Feedback
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Informações Adicionais */}
          <div className="grid md:grid-cols-2 gap-6">
            <div
              className={`p-6 rounded-xl ${
                theme === "dark" ? "bg-gray-900/30 border border-gray-700" : "bg-gray-50 border border-gray-200"
              }`}
            >
              <h3 className={`text-xl font-bold mb-3 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                Por que seu feedback importa?
              </h3>
              <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                Cada feedback nos ajuda a aprimorar nossos agentes de IA e criar soluções mais eficazes para sua
                empresa.
              </p>
            </div>

            <div
              className={`p-6 rounded-xl ${
                theme === "dark" ? "bg-gray-900/30 border border-gray-700" : "bg-gray-50 border border-gray-200"
              }`}
            >
              <h3 className={`text-xl font-bold mb-3 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                Resposta Rápida
              </h3>
              <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                Nossa equipe analisa todos os feedbacks e responde em até 24 horas para questões que requerem atenção.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Footer da página */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-12 pt-8 border-t border-gray-600 text-center"
        >
          <Link href="/">
            <Button
              className={`${
                theme === "dark"
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  : "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              } text-white px-8 py-3 rounded-xl`}
            >
              Voltar ao Início
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
