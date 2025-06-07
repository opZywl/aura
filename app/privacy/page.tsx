"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Shield, Code, Database, Lock, AlertTriangle, Users } from "lucide-react"
import Link from "next/link"
import { useTheme } from "next-themes"

export default function PrivacyPage() {
  const { theme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // Detecta o tema atual (incluindo system)
  const currentTheme = theme === "system" ? systemTheme : theme
  const isDark = currentTheme === "dark"

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

        <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
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
              Política de Privacidade
            </motion.h1>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className={`inline-flex items-center px-6 py-3 rounded-full ${
                    isDark
                        ? "bg-gradient-to-r from-red-900/40 to-orange-900/40 border border-red-500/30"
                        : "bg-gradient-to-r from-red-100 to-orange-100 border border-red-400/30"
                }`}
            >
              <Shield className={`w-5 h-5 mr-2 ${isDark ? "text-red-400" : "text-red-600"}`} />
              <span className={`text-lg font-semibold ${isDark ? "text-red-300" : "text-red-700"}`}>
              Zero Coleta de Dados
            </span>
            </motion.div>
          </motion.div>

          {/* Critical Notice */}
          <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className={`p-8 rounded-3xl mb-16 border-2 ${
                  isDark
                      ? "bg-gradient-to-r from-red-900/30 to-orange-900/30 border-red-500/50"
                      : "bg-gradient-to-r from-red-50 to-orange-50 border-red-400/50"
              }`}
          >
            <div className="flex items-center justify-center mb-6">
              <AlertTriangle className={`w-12 h-12 mr-4 ${isDark ? "text-red-400" : "text-red-600"}`} />
              <h2 className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Aviso Importante</h2>
            </div>
            <p className={`text-center text-xl leading-relaxed ${isDark ? "text-gray-200" : "text-gray-800"}`}>
              <strong className={`${isDark ? "text-red-300" : "text-red-700"}`}>NÃO COLETAMOS DADOS PESSOAIS.</strong>
              <br />
              Este é um projeto open source acadêmico. Não há coleta, armazenamento ou processamento de informações
              pessoais dos usuários.
            </p>
          </motion.div>

          {/* Content Sections */}
          <div className="space-y-12">
            {/* Open Source Nature */}
            <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className={`p-8 rounded-3xl ${
                    isDark
                        ? "bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50"
                        : "bg-gradient-to-br from-white/80 to-gray-50/80 border border-gray-200/50"
                } backdrop-blur-sm`}
            >
              <div className="flex items-center mb-6">
                <div className={`p-3 rounded-xl mr-4 ${isDark ? "bg-green-900/50" : "bg-green-100"}`}>
                  <Code className={`w-8 h-8 ${isDark ? "text-green-400" : "text-green-600"}`} />
                </div>
                <h2 className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                  Transparência Open Source
                </h2>
              </div>
              <p className={`text-lg leading-relaxed mb-4 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                A Aura é um projeto acadêmico completamente open source desenvolvido por estudantes. Todo o código fonte
                está disponível publicamente no GitHub para auditoria e verificação. Não há funcionalidades ocultas ou
                práticas de coleta de dados não declaradas.
              </p>
              <div className={`p-4 rounded-xl ${isDark ? "bg-green-900/20" : "bg-green-50"}`}>
                <p className={`text-sm ${isDark ? "text-green-300" : "text-green-700"}`}>
                  <strong>Repositório:</strong>{" "}
                  <a
                      href="https://github.com/opzywl/aura"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:no-underline"
                  >
                    https://github.com/opzywl/aura
                  </a>
                </p>
              </div>
            </motion.section>

            {/* No Data Collection */}
            <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.0 }}
                className={`p-8 rounded-3xl ${
                    isDark
                        ? "bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50"
                        : "bg-gradient-to-br from-white/80 to-gray-50/80 border border-gray-200/50"
                } backdrop-blur-sm`}
            >
              <div className="flex items-center mb-6">
                <div className={`p-3 rounded-xl mr-4 ${isDark ? "bg-blue-900/50" : "bg-blue-100"}`}>
                  <Database className={`w-8 h-8 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
                </div>
                <h2 className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                  Política de Coleta de Dados
                </h2>
              </div>
              <div className="space-y-4">
                <p className={`text-xl font-bold ${isDark ? "text-red-400" : "text-red-600"}`}>
                  NÃO COLETAMOS DADOS PESSOAIS
                </p>
                <p className={`text-lg leading-relaxed ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  Este software não coleta, armazena, processa ou transmite informações pessoais dos usuários. Não há
                  formulários de cadastro, cookies de rastreamento ou qualquer mecanismo de coleta de dados.
                </p>
                <p className={`text-lg leading-relaxed ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  Qualquer pessoa pode verificar isso auditando o código fonte disponível publicamente.
                </p>
              </div>
            </motion.section>

            {/* Local Operation */}
            <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.2 }}
                className={`p-8 rounded-3xl ${
                    isDark
                        ? "bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50"
                        : "bg-gradient-to-br from-white/80 to-gray-50/80 border border-gray-200/50"
                } backdrop-blur-sm`}
            >
              <div className="flex items-center mb-6">
                <div className={`p-3 rounded-xl mr-4 ${isDark ? "bg-purple-900/50" : "bg-purple-100"}`}>
                  <Lock className={`w-8 h-8 ${isDark ? "text-purple-400" : "text-purple-600"}`} />
                </div>
                <h2 className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Operação Local</h2>
              </div>
              <p className={`text-lg leading-relaxed ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                A Aura é projetada para funcionar localmente no dispositivo do usuário. Não há comunicação com servidores
                externos para coleta de dados ou telemetria. Todos os dados processados permanecem no ambiente local do
                usuário.
              </p>
            </motion.section>

            {/* User Responsibility */}
            <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.4 }}
                className={`p-8 rounded-3xl ${
                    isDark
                        ? "bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50"
                        : "bg-gradient-to-br from-white/80 to-gray-50/80 border border-gray-200/50"
                } backdrop-blur-sm`}
            >
              <div className="flex items-center mb-6">
                <div className={`p-3 rounded-xl mr-4 ${isDark ? "bg-yellow-900/50" : "bg-yellow-100"}`}>
                  <Users className={`w-8 h-8 ${isDark ? "text-yellow-400" : "text-yellow-600"}`} />
                </div>
                <h2 className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                  Responsabilidade do Usuário
                </h2>
              </div>
              <p className={`text-lg leading-relaxed mb-4 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                Como este é um software open source fornecido gratuitamente, os usuários são responsáveis por:
              </p>
              <ul className={`space-y-2 text-lg ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                <li>• Usar o software por sua própria conta e risco</li>
                <li>• Implementar suas próprias medidas de segurança se necessário</li>
                <li>• Verificar a conformidade com suas políticas internas</li>
                <li>• Auditar o código antes do uso em ambientes críticos</li>
              </ul>
            </motion.section>

            {/* Liability Limitation */}
            <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.6 }}
                className={`p-8 rounded-3xl ${
                    isDark
                        ? "bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50"
                        : "bg-gradient-to-br from-white/80 to-gray-50/80 border border-gray-200/50"
                } backdrop-blur-sm`}
            >
              <div className="flex items-center mb-6">
                <div className={`p-3 rounded-xl mr-4 ${isDark ? "bg-red-900/50" : "bg-red-100"}`}>
                  <Shield className={`w-8 h-8 ${isDark ? "text-red-400" : "text-red-600"}`} />
                </div>
                <h2 className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                  Limitação de Responsabilidade
                </h2>
              </div>
              <p className={`text-lg leading-relaxed mb-4 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                Os desenvolvedores não assumem responsabilidade por:
              </p>
              <ul className={`space-y-2 text-lg ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                <li>• Uso inadequado do software</li>
                <li>• Problemas de segurança em implementações customizadas</li>
                <li>• Perdas ou danos decorrentes do uso</li>
                <li>• Conformidade com regulamentações específicas</li>
              </ul>
            </motion.section>
          </div>

          {/* Footer */}
          <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.8 }}
              className="mt-20 pt-12 border-t border-gray-600 text-center"
          >
            <p className={`text-sm mb-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Última atualização: {new Date().toLocaleDateString("pt-BR")}
            </p>
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
