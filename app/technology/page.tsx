"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Code2, Database, Globe, Monitor, Cpu } from "lucide-react"
import Link from "next/link"
import { useTheme } from "next-themes"

export default function TechnologyPage() {
  const { theme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // Detecta o tema atual (incluindo system)
  const currentTheme = theme === "system" ? systemTheme : theme
  const isDark = currentTheme === "dark"

  const technologies = [
    {
      name: "Next.js",
      category: "Frontend",
      icon: "⚛️",
      description: "Framework React com App Router, Server Components e otimizações automáticas para performance.",
      color: isDark ? "from-blue-900/50 to-cyan-900/50" : "from-blue-100 to-cyan-100",
      borderColor: isDark ? "border-blue-500/30" : "border-blue-400/30",
    },
    {
      name: "TypeScript",
      category: "Linguagem",
      icon: "📘",
      description: "Linguagem tipada que garante maior segurança e produtividade no desenvolvimento.",
      color: isDark ? "from-indigo-900/50 to-purple-900/50" : "from-indigo-100 to-purple-100",
      borderColor: isDark ? "border-indigo-500/30" : "border-indigo-400/30",
    },
    {
      name: "Tailwind CSS",
      category: "Estilização",
      icon: "🎨",
      description: "Framework CSS utility-first para estilização rápida e responsiva.",
      color: isDark ? "from-teal-900/50 to-green-900/50" : "from-teal-100 to-green-100",
      borderColor: isDark ? "border-teal-500/30" : "border-teal-400/30",
    },
    {
      name: "Framer Motion",
      category: "Animações",
      icon: "✨",
      description: "Biblioteca de animações declarativas para React com performance otimizada.",
      color: isDark ? "from-pink-900/50 to-rose-900/50" : "from-pink-100 to-rose-100",
      borderColor: isDark ? "border-pink-500/30" : "border-pink-400/30",
    },
    {
      name: "Python",
      category: "Backend",
      icon: "🐍",
      description: "Backend em Python para processamento de dados e integração com APIs de IA.",
      color: isDark ? "from-yellow-900/50 to-orange-900/50" : "from-yellow-100 to-orange-100",
      borderColor: isDark ? "border-yellow-500/30" : "border-yellow-400/30",
    },
    {
      name: "WhatsApp API",
      category: "Integração",
      icon: "💬",
      description: "Integração oficial com WhatsApp Business API para automação de mensagens.",
      color: isDark ? "from-green-900/50 to-emerald-900/50" : "from-green-100 to-emerald-100",
      borderColor: isDark ? "border-green-500/30" : "border-green-400/30",
    },
    {
      name: "shadcn/ui",
      category: "Componentes",
      icon: "🧩",
      description: "Componentes UI acessíveis e customizáveis baseados em Radix UI.",
      color: isDark ? "from-gray-800/50 to-slate-800/50" : "from-gray-100 to-slate-100",
      borderColor: isDark ? "border-gray-500/30" : "border-gray-400/30",
    },
    {
      name: "Vercel",
      category: "Deploy",
      icon: "🚀",
      description: "Plataforma de deploy otimizada para aplicações Next.js com CDN global.",
      color: isDark ? "from-violet-900/50 to-purple-900/50" : "from-violet-100 to-purple-100",
      borderColor: isDark ? "border-violet-500/30" : "border-violet-400/30",
    },
  ]

  const architectureItems = [
    {
      title: "Interface do Usuário",
      description: "Next.js + React com componentes responsivos e acessíveis",
      icon: <Monitor className="w-8 h-8" />,
      color: isDark ? "text-blue-400" : "text-blue-600",
    },
    {
      title: "Camada de Lógica",
      description: "TypeScript para tipagem segura e lógica de negócio",
      icon: <Cpu className="w-8 h-8" />,
      color: isDark ? "text-purple-400" : "text-purple-600",
    },
    {
      title: "Processamento Backend",
      description: "Python para integração com APIs e processamento de dados",
      icon: <Database className="w-8 h-8" />,
      color: isDark ? "text-green-400" : "text-green-600",
    },
    {
      title: "Integrações Externas",
      description: "APIs do WhatsApp, serviços de IA e outras integrações",
      icon: <Globe className="w-8 h-8" />,
      color: isDark ? "text-orange-400" : "text-orange-600",
    },
  ]

  const metrics = [
    { label: "Open Source", value: "100%" },
    { label: "Type Safety", value: "100%" },
    { label: "Server Rendering", value: "✓" },
    { label: "Progressive Web App", value: "✓" },
  ]

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

        <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
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
              Stack Tecnológica
            </motion.h1>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className={`text-xl ${isDark ? "text-gray-300" : "text-gray-600"}`}
            >
              Tecnologias Modernas que Impulsionam o Aura
            </motion.p>
          </motion.div>

          {/* Overview */}
          <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className={`p-8 rounded-3xl mb-16 ${
                  isDark
                      ? "bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50"
                      : "bg-gradient-to-br from-white/80 to-gray-50/80 border border-gray-200/50"
              } backdrop-blur-sm`}
          >
            <div className="flex items-center mb-6">
              <Code2 className={`w-10 h-10 mr-4 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
              <h2 className={`text-4xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Inovação Open Source</h2>
            </div>
            <p className={`text-lg leading-relaxed ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              O Aura utiliza as tecnologias mais modernas e confiáveis do mercado para criar uma experiência excepcional.
              Nossa stack é 100% open source, garantindo transparência, segurança e possibilidade de auditoria completa do
              código.
            </p>
          </motion.section>

          {/* Technologies Grid */}
          <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mb-16"
          >
            <h2 className={`text-3xl font-bold mb-8 text-center ${isDark ? "text-white" : "text-gray-900"}`}>
              Tecnologias Utilizadas
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {technologies.map((tech, index) => (
                  <motion.div
                      key={tech.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 * index }}
                      className={`p-6 rounded-2xl bg-gradient-to-br ${tech.color} border ${tech.borderColor} backdrop-blur-sm hover:scale-105 transition-all duration-300`}
                  >
                    <div className="text-3xl mb-3">{tech.icon}</div>
                    <h3 className={`text-xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>{tech.name}</h3>
                    <p className={`text-sm mb-3 ${isDark ? "text-gray-300" : "text-gray-600"}`}>{tech.category}</p>
                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-700"}`}>{tech.description}</p>
                  </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Architecture */}
          <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
              className="mb-16"
          >
            <h2 className={`text-3xl font-bold mb-8 text-center ${isDark ? "text-white" : "text-gray-900"}`}>
              Arquitetura do Sistema
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {architectureItems.map((item, index) => (
                  <motion.div
                      key={item.title}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.1 * index }}
                      className={`p-6 rounded-2xl text-center ${
                          isDark
                              ? "bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50"
                              : "bg-gradient-to-br from-white/80 to-gray-50/80 border border-gray-200/50"
                      } backdrop-blur-sm`}
                  >
                    <div className={`${item.color} mb-4 flex justify-center`}>{item.icon}</div>
                    <h3 className={`text-lg font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>{item.title}</h3>
                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>{item.description}</p>
                  </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Performance Metrics */}
          <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="mb-16"
          >
            <h2 className={`text-3xl font-bold mb-8 text-center ${isDark ? "text-white" : "text-gray-900"}`}>
              Performance e Qualidade
            </h2>
            <div className="grid md:grid-cols-4 gap-6">
              {metrics.map((metric, index) => (
                  <motion.div
                      key={metric.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 * index }}
                      className={`p-6 rounded-2xl text-center ${
                          isDark
                              ? "bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-500/30"
                              : "bg-gradient-to-br from-green-100 to-emerald-100 border border-green-400/30"
                      }`}
                  >
                    <div className={`text-3xl font-bold mb-2 ${isDark ? "text-green-400" : "text-green-600"}`}>
                      {metric.value}
                    </div>
                    <p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>{metric.label}</p>
                  </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Footer */}
          <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.4 }}
              className="text-center"
          >
            <Link href="/">
              <Button
                  className={`${
                      isDark
                          ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                          : "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                  } text-white px-10 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 transform hover:scale-105`}
              >
                Voltar ao Início
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
  )
}
