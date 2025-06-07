"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Code, Database, Globe, Zap, Cpu, Brain, Shield, Rocket, Monitor, Smartphone } from "lucide-react"
import Link from "next/link"
import { useTheme } from "next-themes"

export default function TechnologyPage() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const technologies = [
    {
      icon: <Code className="w-8 h-8" />,
      title: "Next.js",
      description: "Framework React com App Router, Server Components e otimizações automáticas para performance.",
      category: "Frontend",
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "TypeScript",
      description: "Linguagem tipada que garante maior segurança e produtividade no desenvolvimento.",
      category: "Linguagem",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Tailwind CSS",
      description: "Framework CSS utility-first para estilização rápida e responsiva.",
      category: "Estilização",
    },
    {
      icon: <Rocket className="w-8 h-8" />,
      title: "Framer Motion",
      description: "Biblioteca de animações declarativas para React com performance otimizada.",
      category: "Animações",
    },
    {
      icon: <Database className="w-8 h-8" />,
      title: "Python",
      description: "Backend em Python para processamento de dados e integração com APIs de IA.",
      category: "Backend",
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "WhatsApp API",
      description: "Integração oficial com WhatsApp Business API para automação de mensagens.",
      category: "Integração",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Shadcn/ui",
      description: "Componentes UI acessíveis e customizáveis baseados em Radix UI.",
      category: "Componentes",
    },
    {
      icon: <Monitor className="w-8 h-8" />,
      title: "Vercel",
      description: "Plataforma de deploy otimizada para aplicações Next.js com CDN global.",
      category: "Deploy",
    },
    {
      icon: <Cpu className="w-8 h-8" />,
      title: "React",
      description: "Biblioteca JavaScript com Concurrent Features e Server Components.",
      category: "Frontend",
    },
  ]

  const architectureLayers = [
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "Interface do Usuário",
      description: "Next.js + React com componentes responsivos e acessíveis",
      color: "purple",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Camada de Lógica",
      description: "TypeScript para tipagem segura e lógica de negócio",
      color: "blue",
    },
    {
      icon: <Database className="w-8 h-8" />,
      title: "Processamento Backend",
      description: "Python para integração com APIs e processamento de dados",
      color: "green",
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Integrações Externas",
      description: "APIs do WhatsApp, serviços de IA e outras integrações",
      color: "yellow",
    },
  ]

  return (
    <div
      className={`min-h-screen transition-colors duration-300 relative overflow-hidden ${
        theme === "dark"
          ? "bg-gradient-to-br from-gray-900 via-black to-gray-900 text-gray-200"
          : "bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900"
      }`}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-2 h-2 rounded-full ${theme === "dark" ? "bg-purple-500/20" : "bg-purple-400/20"}`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        {/* Header com botão voltar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <Link href="/">
            <Button
              variant="outline"
              className={`mb-8 ${
                theme === "dark"
                  ? "border-gray-600 text-gray-300 hover:bg-gray-800"
                  : "border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Início
            </Button>
          </Link>

          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={`text-5xl md:text-7xl font-extrabold mb-6 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
            style={{
              textShadow: theme === "dark" ? "0 0 30px rgba(192, 192, 192, 0.5)" : "0 0 30px rgba(0, 0, 0, 0.3)",
              letterSpacing: "0.02em",
            }}
          >
            Stack Tecnológica
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className={`text-xl ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
          >
            Tecnologias Modernas que Impulsionam o Aura
          </motion.p>
        </motion.div>

        {/* Visão Geral Animada */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className={`text-4xl font-bold mb-8 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            Inovação Open Source
          </h2>
          <p
            className={`text-xl leading-relaxed max-w-5xl mx-auto ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
          >
            O Aura utiliza as tecnologias mais modernas e confiáveis do mercado para criar uma experiência excepcional.
            Nossa stack é 100% open source, garantindo transparência, segurança e possibilidade de auditoria completa do
            código.
          </p>
        </motion.section>

        {/* Grid de Tecnologias com Animações */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mb-20"
        >
          <h2 className={`text-4xl font-bold text-center mb-12 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            Tecnologias Utilizadas
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {technologies.map((tech, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 + 1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className={`p-8 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                  theme === "dark"
                    ? "bg-gray-900/50 border-gray-700 hover:border-purple-500/50 hover:bg-gray-800/50"
                    : "bg-white/80 border-gray-200 hover:border-purple-400/50 hover:bg-white"
                } backdrop-blur-sm shadow-lg hover:shadow-2xl`}
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className={`mb-6 ${theme === "dark" ? "text-purple-400" : "text-purple-600"}`}
                >
                  {tech.icon}
                </motion.div>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full mb-4 inline-block ${
                    theme === "dark" ? "bg-purple-900/50 text-purple-300" : "bg-purple-100 text-purple-700"
                  }`}
                >
                  {tech.category}
                </span>
                <h3 className={`text-2xl font-bold mb-4 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  {tech.title}
                </h3>
                <p className={`text-base leading-relaxed ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                  {tech.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Arquitetura do Sistema */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.5 }}
          className={`p-10 rounded-3xl mb-16 ${
            theme === "dark" ? "bg-gray-900/50 border-2 border-gray-700" : "bg-white/80 border-2 border-gray-200"
          } backdrop-blur-sm`}
        >
          <h2 className={`text-4xl font-bold text-center mb-12 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            Arquitetura do Sistema
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {architectureLayers.map((layer, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 + 1.7 }}
                className="text-center"
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
                    layer.color === "purple" && theme === "dark"
                      ? "bg-purple-600/20 text-purple-400"
                      : layer.color === "purple" && theme === "light"
                        ? "bg-purple-100 text-purple-600"
                        : layer.color === "blue" && theme === "dark"
                          ? "bg-blue-600/20 text-blue-400"
                          : layer.color === "blue" && theme === "light"
                            ? "bg-blue-100 text-blue-600"
                            : layer.color === "green" && theme === "dark"
                              ? "bg-green-600/20 text-green-400"
                              : layer.color === "green" && theme === "light"
                                ? "bg-green-100 text-green-600"
                                : layer.color === "yellow" && theme === "dark"
                                  ? "bg-yellow-600/20 text-yellow-400"
                                  : "bg-yellow-100 text-yellow-600"
                  }`}
                >
                  {layer.icon}
                </motion.div>
                <h3 className={`text-xl font-bold mb-3 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  {layer.title}
                </h3>
                <p className={`text-sm leading-relaxed ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                  {layer.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Performance e Métricas Animadas */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2 }}
          className="mb-16"
        >
          <h2 className={`text-4xl font-bold text-center mb-12 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            Performance e Qualidade
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { value: "100%", label: "Open Source", color: "green" },
              { value: "TypeScript", label: "Type Safety", color: "blue" },
              { value: "SSR", label: "Server Rendering", color: "purple" },
              { value: "PWA", label: "Progressive Web App", color: "yellow" },
            ].map((metric, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 + 2.2 }}
                whileHover={{ scale: 1.1 }}
                className={`p-6 rounded-2xl ${
                  theme === "dark" ? "bg-gray-800/50" : "bg-white/80"
                } backdrop-blur-sm border-2 border-transparent hover:border-purple-500/50 transition-all duration-300`}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.8, delay: index * 0.1 + 2.4 }}
                  className={`text-4xl font-bold mb-3 ${
                    metric.color === "green" && theme === "dark"
                      ? "text-green-400"
                      : metric.color === "green" && theme === "light"
                        ? "text-green-600"
                        : metric.color === "blue" && theme === "dark"
                          ? "text-blue-400"
                          : metric.color === "blue" && theme === "light"
                            ? "text-blue-600"
                            : metric.color === "purple" && theme === "dark"
                              ? "text-purple-400"
                              : metric.color === "purple" && theme === "light"
                                ? "text-purple-600"
                                : metric.color === "yellow" && theme === "dark"
                                  ? "text-yellow-400"
                                  : "text-yellow-600"
                  }`}
                >
                  {metric.value}
                </motion.div>
                <p className={`text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                  {metric.label}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Footer da página */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 2.5 }}
          className="mt-20 pt-8 border-t border-gray-600 text-center"
        >
          <Link href="/">
            <Button
              className={`${
                theme === "dark"
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  : "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              } text-white px-10 py-4 rounded-xl text-lg font-semibold transform hover:scale-105 transition-all duration-300`}
            >
              Voltar ao Início
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
