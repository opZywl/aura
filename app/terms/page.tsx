"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Code, Shield, AlertTriangle, FileText, Users, Globe } from "lucide-react"
import Link from "next/link"
import { useTheme } from "next-themes"

export default function TermsPage() {
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
              Termos de Serviço da Aura
            </motion.h1>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className={`inline-flex items-center px-6 py-3 rounded-full ${
                    isDark
                        ? "bg-gradient-to-r from-green-900/40 to-blue-900/40 border border-green-500/30"
                        : "bg-gradient-to-r from-green-100 to-blue-100 border border-green-400/30"
                }`}
            >
              <Code className={`w-5 h-5 mr-2 ${isDark ? "text-green-400" : "text-green-600"}`} />
              <span className={`text-lg font-semibold ${isDark ? "text-green-300" : "text-green-700"}`}>
              Projeto 100% Open Source
            </span>
            </motion.div>
          </motion.div>

          {/* Content Sections */}
          <div className="space-y-16">
            {/* Section 1 - Terms */}
            <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className={`p-8 rounded-3xl ${
                    isDark
                        ? "bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50"
                        : "bg-gradient-to-br from-white/80 to-gray-50/80 border border-gray-200/50"
                } backdrop-blur-sm`}
            >
              <div className="flex items-center mb-6">
                <div className={`p-3 rounded-xl mr-4 ${isDark ? "bg-blue-900/50" : "bg-blue-100"}`}>
                  <FileText className={`w-8 h-8 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
                </div>
                <h2 className={`text-4xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>1. Termos</h2>
              </div>
              <p className={`text-lg leading-relaxed ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                Ao acessar este site, você concorda em estar vinculado a estes Termos e Condições de Uso do site, todas as
                leis e regulamentos aplicáveis, e concorda que é responsável pelo cumprimento de quaisquer leis locais
                aplicáveis. Se você não concordar com qualquer um destes termos, está proibido de usar ou acessar este
                site. Os materiais contidos neste site são protegidos pelas leis de direitos autorais e marcas registradas
                aplicáveis.
              </p>
              <div className={`mt-6 p-4 rounded-xl ${isDark ? "bg-blue-900/20" : "bg-blue-50"}`}>
                <p className={`text-sm ${isDark ? "text-blue-300" : "text-blue-700"}`}>
                  <strong>Nota:</strong> Este é um projeto acadêmico open source. Todo o código fonte está disponível no
                  GitHub para transparência e contribuição da comunidade.
                </p>
              </div>
            </motion.section>

            {/* Section 2 - Disclaimer */}
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
                <div className={`p-3 rounded-xl mr-4 ${isDark ? "bg-yellow-900/50" : "bg-yellow-100"}`}>
                  <AlertTriangle className={`w-8 h-8 ${isDark ? "text-yellow-400" : "text-yellow-600"}`} />
                </div>
                <h2 className={`text-4xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                  2. Isenção de Responsabilidade
                </h2>
              </div>
              <p className={`text-lg leading-relaxed mb-4 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                Os materiais no site da Aura são fornecidos "como estão". Não oferecemos garantias, expressas ou
                implícitas, e por meio deste negamos e renunciamos a todas as outras garantias, incluindo, sem limitação,
                garantias implícitas ou condições de comercialização, adequação para um propósito específico ou não
                violação de propriedade intelectual ou outra violação de direitos.
              </p>
              <p className={`text-lg leading-relaxed ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                Além disso, a Aura não garante ou faz qualquer representação sobre a precisão, resultados prováveis ou
                confiabilidade do uso dos materiais em seu site da Internet ou de outra forma relacionados a tais
                materiais ou em quaisquer sites vinculados a este site.
              </p>
            </motion.section>

            {/* Section 3 - Limitations */}
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
                <div className={`p-3 rounded-xl mr-4 ${isDark ? "bg-red-900/50" : "bg-red-100"}`}>
                  <Shield className={`w-8 h-8 ${isDark ? "text-red-400" : "text-red-600"}`} />
                </div>
                <h2 className={`text-4xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>3. Limitações</h2>
              </div>
              <p className={`text-lg leading-relaxed ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                Em nenhum caso a Aura e seus fornecedores serão responsáveis por quaisquer danos (incluindo, sem
                limitação, danos por perda de dados ou lucro, ou devido à interrupção dos negócios) decorrentes do uso ou
                incapacidade de usar os materiais no site da Internet da Aura, mesmo que a Aura ou um representante
                autorizado da Aura tenha sido notificado oralmente ou por escrito da possibilidade de tal dano. Como
                algumas jurisdições não permitem limitações em garantias implícitas, ou limitações de responsabilidade por
                danos consequenciais ou incidentais, essas limitações podem não se aplicar a você.
              </p>
            </motion.section>

            {/* Section 4 - Revisions and Errata */}
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
                  <FileText className={`w-8 h-8 ${isDark ? "text-purple-400" : "text-purple-600"}`} />
                </div>
                <h2 className={`text-4xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>4. Revisões e Erratas</h2>
              </div>
              <p className={`text-lg leading-relaxed ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                Os materiais exibidos no site da Aura podem incluir erros técnicos, tipográficos ou fotográficos. A Aura
                não garante que qualquer um dos materiais em seu site seja preciso, completo ou atual. A Aura pode fazer
                alterações nos materiais contidos em seu site a qualquer momento sem aviso. No entanto, a Aura não se
                compromete a atualizar os materiais.
              </p>
            </motion.section>

            {/* Section 5 - Links */}
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
                <div className={`p-3 rounded-xl mr-4 ${isDark ? "bg-green-900/50" : "bg-green-100"}`}>
                  <Globe className={`w-8 h-8 ${isDark ? "text-green-400" : "text-green-600"}`} />
                </div>
                <h2 className={`text-4xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>5. Links</h2>
              </div>
              <p className={`text-lg leading-relaxed ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                A Aura não revisou todos os sites vinculados ao seu site da Internet e não é responsável pelo conteúdo de
                qualquer site vinculado. A inclusão de qualquer link não implica endosso pela Aura do site. O uso de
                qualquer site vinculado é por conta e risco do usuário.
              </p>
            </motion.section>

            {/* Section 6 - Modifications */}
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
                <div className={`p-3 rounded-xl mr-4 ${isDark ? "bg-indigo-900/50" : "bg-indigo-100"}`}>
                  <Users className={`w-8 h-8 ${isDark ? "text-indigo-400" : "text-indigo-600"}`} />
                </div>
                <h2 className={`text-4xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                  6. Modificações dos Termos de Uso do Site
                </h2>
              </div>
              <p className={`text-lg leading-relaxed ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                Podemos revisar estes termos de uso para nosso site a qualquer momento sem aviso. Ao usar este site, você
                concorda em estar vinculado à versão atual destes Termos e Condições de Uso. Todas as modificações serão
                documentadas em nosso repositório GitHub para transparência.
              </p>
              <div className={`mt-6 p-4 rounded-xl ${isDark ? "bg-indigo-900/20" : "bg-indigo-50"}`}>
                <p className={`text-sm ${isDark ? "text-indigo-300" : "text-indigo-700"}`}>
                  <strong>Repositório GitHub:</strong>{" "}
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
