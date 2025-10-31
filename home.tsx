"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MessageSquare, DollarSign, Calendar, Settings, Code, Play, MessageCircle, LinkIcon } from "lucide-react"
import Link from "next/link"
import Header from "./src/aura/components/Header"
import Footer from "./src/aura/components/Footer"
import { useMobile } from "@/hooks/use-mobile"
import WaveDotsBackground from "./src/aura/components/WaveDotsBackground"
import CalendarModal from "@/components/calendar-modal"
import NeuralNetworkAnimation from "@/components/neural-network-animation"
import AuraChat from "./components/tars-chat"
import LogoCarousel from "@/components/logo-carousel"
import AnimatedText from "@/components/animated-text"
import { SettingsProvider } from "./src/aura/contexts/SettingsContext"
import { useTheme } from "next-themes"
import { useSettings } from "./src/aura/contexts/SettingsContext"
import React from "react"

// Componente da barra lateral elegante
const ElegantSidebar = ({ theme }: { theme: string | undefined }) => {
  return (
      <div className="fixed left-0 top-0 h-full z-50 flex items-center pointer-events-none">
        <div
            className={`h-[80%] w-[3px] rounded-full ${
                theme === "dark" ? "bg-gray-800" : "bg-gray-200"
            } relative overflow-hidden`}
        >
          {/* Pontos decorativos */}
          <div
              className={`absolute top-[20%] left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full ${
                  theme === "dark" ? "bg-gray-600" : "bg-gray-400"
              }`}
          />
          <div
              className={`absolute top-[50%] left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full ${
                  theme === "dark" ? "bg-gray-600" : "bg-gray-400"
              }`}
          />
          <div
              className={`absolute top-[80%] left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full ${
                  theme === "dark" ? "bg-gray-600" : "bg-gray-400"
              }`}
          />

          {/* Efeito de brilho */}
          <div
              className={`absolute top-0 left-0 w-full h-full ${
                  theme === "dark"
                      ? "bg-gradient-to-b from-purple-500/10 via-transparent to-blue-500/10"
                      : "bg-gradient-to-b from-blue-500/10 via-transparent to-purple-500/10"
              }`}
          />
        </div>
      </div>
  )
}

function HomeContent() {
  const isMobile = useMobile()
  const [scrollY, setScrollY] = useState(0)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const { theme } = useTheme()
  const { highContrast, reducedMotion, fadeEffects } = useSettings()

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const serviceAreas = [
    {
      title: "Vendas",
      description: "Automação e aumento de vendas com agentes de IA.",
      icon: (
          <DollarSign className={`h-8 w-8 sm:h-10 sm:w-10 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`} />
      ),
    },
    {
      title: "Suporte ao Cliente",
      description: "Melhoria da satisfação do cliente com suporte 24 horas.",
      icon: (
          <MessageSquare className={`h-8 w-8 sm:h-10 sm:w-10 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`} />
      ),
    },
    {
      title: "Cobrança",
      description: "Automação de processos de cobrança.",
      icon: (
          <DollarSign className={`h-8 w-8 sm:h-10 sm:w-10 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`} />
      ),
    },
    {
      title: "Agendamento",
      description: "Coordenação automática de horários e reuniões.",
      icon: <Calendar className={`h-8 w-8 sm:h-10 sm:w-10 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`} />,
    },
    {
      title: "Operações",
      description: "Automação de processos repetitivos nas operações.",
      icon: <Settings className={`h-8 w-8 sm:h-10 sm:w-10 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`} />,
    },
    {
      title: "Soluções Personalizadas",
      description: "Criação de agentes de IA personalizados para a empresa.",
      icon: <Code className={`h-8 w-8 sm:h-10 sm:w-10 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`} />,
    },
  ]

  const features = [
    {
      title: "Executa Ações",
      description: "Interação e execução de tarefas.",
      icon: <Play className={`h-8 w-8 sm:h-10 sm:w-10 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`} />,
    },
    {
      title: "Linguagem Humana",
      description: "Capacidade de se comunicar de forma natural, incluindo envio de áudios e atendimento de chamadas.",
      icon: (
          <MessageCircle className={`h-8 w-8 sm:h-10 sm:w-10 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`} />
      ),
    },
    {
      title: "Integrações com Sistemas",
      description: "Conexão com sistemas existentes para uma integração fluida.",
      icon: <LinkIcon className={`h-8 w-8 sm:h-10 sm:w-10 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`} />,
    },
  ]

  const getContrastClass = () => {
    if (highContrast) {
      return theme === "dark" ? "text-white" : "text-black"
    }
    return theme === "dark" ? "text-gray-200" : "text-gray-900"
  }

  const getSecondaryContrastClass = () => {
    if (highContrast) {
      return theme === "dark" ? "text-gray-100" : "text-gray-800"
    }
    return theme === "dark" ? "text-gray-400" : "text-gray-600"
  }

  return (
      <div
          className={`min-h-screen overflow-hidden transition-colors duration-300 ${
              theme === "dark" ? "bg-black" : "bg-white"
          } ${getContrastClass()}`}
      >
        {/* Wave Dots Background */}
        <WaveDotsBackground />

        {/* Barra lateral elegante */}
        <ElegantSidebar theme={theme} />

        <div className="relative z-10">
          <Header />

          {/* Hero Section */}
          <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
            <motion.div
                initial={reducedMotion ? {} : { opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={reducedMotion ? {} : { duration: 0.8 }}
                className="text-center max-w-4xl mx-auto w-full"
            >
              <div className="mb-4 sm:mb-6">
                <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-900/40 via-blue-900/40 to-purple-900/40 border border-purple-500/30 rounded-full text-xs sm:text-sm text-white backdrop-blur-sm shadow-lg shadow-purple-500/20 relative overflow-hidden">
                  {!reducedMotion && (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
                        <div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/30 to-transparent animate-pulse"
                            style={{
                              animation: "shimmer 3s ease-in-out infinite",
                            }}
                        ></div>
                      </>
                  )}
                  <span className="relative z-10 font-medium">
                  100% experimental – válido até o final do semestre!
                </span>
                </div>
              </div>
              <h1
                  className={`text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 sm:mb-6 ${getContrastClass()}`}
                  style={{
                    textShadow: !reducedMotion
                        ? theme === "dark"
                            ? "0 0 10px rgba(192, 192, 192, 0.7), 0 0 20px rgba(192, 192, 192, 0.5)"
                            : "0 0 10px rgba(0, 0, 0, 0.3), 0 0 20px rgba(0, 0, 0, 0.2)"
                        : "none",
                    letterSpacing: "0.1em",
                  }}
              >
                Aura
              </h1>
              <p className={`text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 ${getSecondaryContrastClass()}`}>
                Junte-se ao melhor chatbot do planeta 1% AI!
              </p>

              {/* Botão "Fale com AURA" moved here */}
              <div className="flex justify-center mb-6 sm:mb-8">
                <AuraChat />
              </div>

              <div className={`text-xs sm:text-sm mt-6 sm:mt-8 max-w-2xl mx-auto px-4 ${getSecondaryContrastClass()}`}>
                {fadeEffects ? (
                    <AnimatedText
                        text="O sucesso dos engenheiros e designers foi graças à passagem por lugares como"
                        className={`text-xs sm:text-sm ${getSecondaryContrastClass()}`}
                    />
                ) : (
                    <span>O sucesso dos engenheiros e designers foi graças à passagem por lugares como</span>
                )}
              </div>

              {/* Logo Carousel */}
              <div className="mt-4 sm:mt-6">
                <LogoCarousel />
              </div>
            </motion.div>

            <motion.div
                style={reducedMotion ? {} : { y: scrollY * 0.2 }}
                className={`absolute bottom-0 left-0 w-full h-32 z-10 ${
                    theme === "dark"
                        ? "bg-gradient-to-t from-black to-transparent"
                        : "bg-gradient-to-t from-white to-transparent"
                }`}
            />
          </section>

          {/* What are AI Employees Section */}
          <section id="que-son" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 relative">
            <motion.div
                initial={reducedMotion ? {} : { opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={reducedMotion ? {} : { duration: 1 }}
                viewport={{ once: true }}
                className="max-w-6xl mx-auto"
            >
              <h2
                  className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-8 sm:mb-12 text-center ${getContrastClass()}`}
                  style={{
                    textShadow: !reducedMotion
                        ? theme === "dark"
                            ? "0 0 10px rgba(192, 192, 192, 0.7), 0 0 20px rgba(192, 192, 192, 0.5)"
                            : "0 0 10px rgba(0, 0, 0, 0.3), 0 0 20px rgba(0, 0, 0, 0.2)"
                        : "none",
                    letterSpacing: "0.1em",
                  }}
              >
                O que são os Agentes de Inteligência Artificial?
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
                <motion.div
                    initial={reducedMotion ? {} : { x: -50, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={reducedMotion ? {} : { duration: 0.8 }}
                    viewport={{ once: true }}
                    className="order-2 lg:order-1"
                >
                  <p className={`text-base sm:text-lg lg:text-xl leading-relaxed ${getSecondaryContrastClass()}`}>
                    Os agentes de IA são uma força de trabalho digital disponível 24/7 que assumem tarefas repetitivas e
                    rotineiras, liberando sua equipe para se concentrar em atividades de maior valor criativo e
                    estratégico.
                  </p>
                  <p
                      className={`text-base sm:text-lg lg:text-xl leading-relaxed mt-4 sm:mt-6 ${getSecondaryContrastClass()}`}
                  >
                    Ao contrário das ferramentas tradicionais, nossos agentes de IA aprendem, se adaptam e melhoram com o
                    tempo, tornando-se um ativo cada vez mais valioso para sua empresa.
                  </p>
                </motion.div>
                <motion.div
                    initial={reducedMotion ? {} : { x: 50, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={reducedMotion ? {} : { duration: 0.8 }}
                    viewport={{ once: true }}
                    className="relative h-64 sm:h-80 lg:h-96 w-full rounded-2xl overflow-hidden shadow-2xl shadow-black/50 order-1 lg:order-2"
                >
                  <NeuralNetworkAnimation />
                </motion.div>
              </div>
            </motion.div>
          </section>

          {/* Application Areas Section */}
          <section
              id="areas"
              className={`py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 relative ${theme === "dark" ? "bg-black/30" : "bg-gray-50/50"}`}
          >
            <div className="max-w-6xl mx-auto">
              <h2
                  className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-12 sm:mb-16 text-center ${getContrastClass()}`}
                  style={{
                    textShadow: !reducedMotion
                        ? theme === "dark"
                            ? "0 0 10px rgba(192, 192, 192, 0.7), 0 0 20px rgba(192, 192, 192, 0.5)"
                            : "0 0 10px rgba(0, 0, 0, 0.3), 0 0 20px rgba(0, 0, 0, 0.2)"
                        : "none",
                    letterSpacing: "0.1em",
                  }}
              >
                Áreas de Aplicação
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {serviceAreas.map((service, index) => (
                    <motion.div
                        key={index}
                        initial={reducedMotion ? {} : { y: 50, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        transition={reducedMotion ? {} : { duration: 0.5, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        whileHover={
                          reducedMotion
                              ? {}
                              : {
                                y: -10,
                                scale: 1.03,
                                transition: { duration: 0.3 },
                              }
                        }
                        className="group cursor-pointer"
                    >
                      <Card
                          className="h-full p-4 sm:p-6 transition-all duration-300 relative overflow-hidden rounded-xl
    bg-slate-800 border-slate-700 shadow-xl shadow-black/50 group-hover:shadow-lg group-hover:shadow-purple-500/30"
                      >
                        {/* Glow effect on hover */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-purple-500/10" />

                        <div className="relative z-10">
                          <div className="mb-3 sm:mb-4">
                            {React.cloneElement(service.icon, {
                              className: `h-8 w-8 sm:h-10 sm:w-10 text-white group-hover:text-purple-300 transition-colors duration-300`,
                            })}
                          </div>
                          <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-white">{service.title}</h3>
                          <p className="text-sm sm:text-base text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                            {service.description}
                          </p>
                        </div>
                      </Card>
                    </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section id="funcionalidades" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 relative">
            <div className="max-w-6xl mx-auto">
              <h2
                  className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-12 sm:mb-16 text-center ${getContrastClass()}`}
                  style={{
                    textShadow: !reducedMotion
                        ? theme === "dark"
                            ? "0 0 10px rgba(192, 192, 192, 0.7), 0 0 20px rgba(192, 192, 192, 0.5)"
                            : "0 0 10px rgba(0, 0, 0, 0.3), 0 0 20px rgba(0, 0, 0, 0.2)"
                        : "none",
                    letterSpacing: "0.1em",
                  }}
              >
                Funcionalidades
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                {features.map((feature, index) => (
                    <motion.div
                        key={index}
                        initial={reducedMotion ? {} : { scale: 0.9, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        transition={reducedMotion ? {} : { duration: 0.5, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className="flex flex-col items-center text-center"
                    >
                      <motion.div
                          whileHover={reducedMotion ? {} : { rotate: 5, scale: 1.1 }}
                          transition={reducedMotion ? {} : { duration: 0.2 }}
                          className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-full border ${
                              theme === "dark" ? "bg-gray-900/80 border-gray-700" : "bg-gray-100/80 border-gray-300"
                          }`}
                      >
                        {feature.icon}
                      </motion.div>
                      <h3 className={`text-lg sm:text-xl font-bold mb-2 sm:mb-3 ${getContrastClass()}`}>{feature.title}</h3>
                      <p className={`text-sm sm:text-base ${getSecondaryContrastClass()}`}>{feature.description}</p>
                    </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 relative">
            <motion.div
                initial={reducedMotion ? {} : { opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={reducedMotion ? {} : { duration: 0.8 }}
                viewport={{ once: true }}
                className="max-w-4xl mx-auto text-center"
            >
              <h2
                  className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-4 sm:mb-6 ${getContrastClass()}`}
                  style={{
                    textShadow: !reducedMotion
                        ? theme === "dark"
                            ? "0 0 10px rgba(192, 192, 192, 0.7), 0 0 20px rgba(192, 192, 192, 0.5)"
                            : "0 0 10px rgba(0, 0, 0, 0.3), 0 0 20px rgba(0, 0, 0, 0.2)"
                        : "none",
                    letterSpacing: "0.1em",
                  }}
              >
                Aura
              </h2>
              <p className={`text-lg sm:text-xl mb-8 sm:mb-10 ${getSecondaryContrastClass()}`}>
                Dê o primeiro passo rumo à transformação digital da sua empresa. Nossos especialistas irão guiá-lo em todo
                o processo.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.div
                    whileHover={reducedMotion ? {} : { scale: 1.05 }}
                    whileTap={reducedMotion ? {} : { scale: 0.95 }}
                >
                  <Link href="https://lucas-lima.vercel.app" target="_blank" rel="noopener noreferrer">
                    <Button
                        className={`text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 rounded-xl shadow-lg w-full sm:w-auto ${
                            theme === "dark"
                                ? "bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 shadow-black/50 text-gray-200"
                                : "bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black shadow-gray-400/50 text-white"
                        }`}
                    >
                      Simular demo de Agentes
                    </Button>
                  </Link>
                </motion.div>
                <motion.div
                    whileHover={reducedMotion ? {} : { scale: 1.05 }}
                    whileTap={reducedMotion ? {} : { scale: 0.95 }}
                >
                  <Link href="https://lucas-lima.vercel.app" target="_blank" rel="noopener noreferrer">
                    <Button
                        variant="outline"
                        className={`text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 border-2 rounded-xl w-full sm:w-auto ${
                            theme === "dark"
                                ? "border-gray-500 text-gray-300 hover:bg-gray-800/50 hover:text-white"
                                : "border-gray-400 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                    >
                      Agendar Consultoria Gratuita
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </section>

          <Footer />
        </div>

        {/* Calendar Modal */}
        {isCalendarOpen && <CalendarModal onClose={() => setIsCalendarOpen(false)} />}

        <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
        <style jsx>{`
  @keyframes shine {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
`}</style>
      </div>
  )
}

export default function Home() {
  return (
      <SettingsProvider>
        <HomeContent />
      </SettingsProvider>
  )
}
