"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MessageSquare, DollarSign, Calendar, Settings, Code, Play, MessageCircle, LinkIcon } from "lucide-react"
import Link from "next/link"
import Header from "../../components/Header"
import Footer from "../../components/Footer"
import LogoCarousel from "../../components/LogoCarousel"
import AnimatedText from "../../components/AnimatedText"
import WaveDotsBackground from "../../components/WaveDotsBackground"
import NeuralNetworkAnimation from "../../components/NeuralNetworkAnimation"
import CalendarModal from "@/components/calendar-modal"
import { useMobile } from "@/hooks/use-mobile"
import { useSettings } from "@/src/aura/features/view/lobby/contexts/SettingsContext"
import { SettingsProvider } from "../../contexts/AnimationsSettingsContext"
import { useTheme } from "next-themes"
import AuraFlowBot from "./flow/aura-flow-bot"

function HomeContent() {
    const isMobile = useMobile()
    const [scrollY, setScrollY] = useState(0)
    const { theme } = useTheme()
    const { highContrast, reducedMotion, fadeEffects } = useSettings()
    const [isCalendarOpen, setIsCalendarOpen] = useState(false)

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
            description: "Qualificação de leads, follow-ups e automação de funil.",
            icon: <DollarSign className={`h-8 w-8 sm:h-10 sm:w-10 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`} />,
        },
        {
            title: "Suporte",
            description: "Atendimento 24/7 com escalonamento humano quando necessário.",
            icon: (
                <MessageSquare className={`h-8 w-8 sm:h-10 sm:w-10 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`} />
            ),
        },
        {
            title: "Financeiro",
            description: "Cobrança, 2ª via e conciliações automatizadas.",
            icon: <DollarSign className={`h-8 w-8 sm:h-10 sm:w-10 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`} />,
        },
        {
            title: "Agendamentos",
            description: "Marcação de reuniões, lembretes e reprogramações.",
            icon: <Calendar className={`h-8 w-8 sm:h-10 sm:w-10 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`} />,
        },
        {
            title: "Operações",
            description: "Rotinas, integrações e orquestração de processos.",
            icon: <Settings className={`h-8 w-8 sm:h-10 sm:w-10 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`} />,
        },
        {
            title: "Customizado",
            description: "Agentes sob medida para seu caso de uso.",
            icon: <Code className={`h-8 w-8 sm:h-10 sm:w-10 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`} />,
        },
    ]

    const features = [
        {
            title: "Ações e Automações",
            description: "Execução de tarefas reais via integrações seguras.",
            icon: <Play className={`h-8 w-8 sm:h-10 sm:w-10 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`} />,
        },
        {
            title: "Multicanal",
            description: "Conversas naturais por chat, e-mail, WhatsApp e mais.",
            icon: (
                <MessageCircle className={`h-8 w-8 sm:h-10 sm:w-10 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`} />
            ),
        },
        {
            title: "Integrações",
            description: "Conecte CRM, ERP, calendários e sua base de dados.",
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
            <div className="relative z-10">
                <Header />

                {/* Wave Dots Background */}
                <WaveDotsBackground />

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
                                            style={{ animation: "shimmer 3s ease-in-out infinite" }}
                                        ></div>
                                    </>
                                )}
                                <span className="relative z-10 font-medium">IA pronta para seu negócio</span>
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
                            AURA: agentes de IA para sua empresa
                        </h1>

                        <p className={`text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 ${getSecondaryContrastClass()}`}>
                            Automatize atendimento, vendas e operações com IA colaborativa.
                        </p>

                        {/* Botão "Fale com AURA" */}
                        <div className="flex justify-center mb-6 sm:mb-8">
                            <AuraFlowBot standalone={true} />
                        </div>

                        <div className={`text-xs sm:text-sm mt-6 sm:mt-8 max-w-2xl mx-auto px-4 ${getSecondaryContrastClass()}`}>
                            {fadeEffects ? (
                                <AnimatedText
                                    text="A AURA combina agentes inteligentes, integrações e automações para acelerar processos e oferecer experiências incríveis aos seus clientes."
                                    className={`text-xs sm:text-sm ${getSecondaryContrastClass()}`}
                                />
                            ) : (
                                <span>
                  A AURA combina agentes inteligentes, integrações e automações para acelerar processos e oferecer
                  experiências incríveis aos seus clientes.
                </span>
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
                            theme === "dark" ? "bg-gradient-to-t from-black to-transparent" : "bg-gradient-to-t from-white to-transparent"
                        }`}
                    />
                </section>

                {/* What are AI Agents Section */}
                <section id="que-son" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 relative">
                    <motion.div
                        initial={reducedMotion ? {} : { opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={reducedMotion ? {} : { duration: 1 }}
                        viewport={{ once: true }}
                        className="max-w-6xl mx-auto"
                    >
                        <h2
                            className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-8 sm:mb-12 text-center ${getContrastClass()}`}
                            style={{ letterSpacing: "0.05em" }}
                        >
                            O que são Agentes de IA?
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
                                    Agentes de IA entendem objetivos, executam tarefas e aprendem com o contexto para entregar resultados.
                                </p>
                                <p className={`text-base sm:text-lg lg:text-xl leading-relaxed mt-4 sm:mt-6 ${getSecondaryContrastClass()}`}>
                                    Com a AURA, eles se conectam às suas ferramentas e fluxos para operar de ponta a ponta, com segurança e
                                    controle.
                                </p>
                            </motion.div>
                            <div className="relative h-64 sm:h-80 lg:h-96 w-full rounded-2xl overflow-hidden shadow-2xl shadow-black/50 order-1 lg:order-2">
                                <NeuralNetworkAnimation />
                            </div>
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
                            className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-12 sm:mb-16 text-center ${getContrastClass()}`}
                            style={{ letterSpacing: "0.05em" }}
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
                                    whileHover={reducedMotion ? {} : { y: -10, transition: { duration: 0.2 } }}
                                >
                                    <Card className="h-full p-4 sm:p-6 transition-all duration-300">
                                        <div className="mb-3 sm:mb-4">{service.icon}</div>
                                        <h3 className={`text-lg sm:text-xl font-bold mb-2 sm:mb-3 ${getContrastClass()}`}>{service.title}</h3>
                                        <p className={`text-sm sm:text-base ${getSecondaryContrastClass()}`}>{service.description}</p>
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
                            className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-12 sm:mb-16 text-center ${getContrastClass()}`}
                            style={{ letterSpacing: "0.05em" }}
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
                                        className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-full border`}
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
                            className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 ${getContrastClass()}`}
                            style={{ letterSpacing: "0.05em" }}
                        >
                            Pronto para acelerar com IA?
                        </h2>
                        <p className={`text-lg sm:text-xl mb-8 sm:mb-10 ${getSecondaryContrastClass()}`}>
                            Implante agentes em dias, não em meses. Comece com um piloto guiado.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <motion.div whileHover={reducedMotion ? {} : { scale: 1.05 }} whileTap={reducedMotion ? {} : { scale: 0.95 }}>
                                <Link href="https://lucas-lima.vercel.app" target="_blank" rel="noopener noreferrer">
                                    <Button className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 rounded-xl shadow-lg w-full sm:w-auto">
                                        Ver demonstração
                                    </Button>
                                </Link>
                            </motion.div>
                            <motion.div whileHover={reducedMotion ? {} : { scale: 1.05 }} whileTap={reducedMotion ? {} : { scale: 0.95 }}>
                                <Link href="https://lucas-lima.vercel.app" target="_blank" rel="noopener noreferrer">
                                    <Button
                                        variant="outline"
                                        className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 border-2 rounded-xl w-full sm:w-auto transition-all duration-300"
                                    >
                                        Falar com especialista
                                    </Button>
                                </Link>
                            </motion.div>
                        </div>
                    </motion.div>
                </section>

                {/* Calendar Modal */}
                {isCalendarOpen && <CalendarModal onClose={() => setIsCalendarOpen(false)} />}

                <Footer />
            </div>
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

;<style jsx>{`
    @keyframes shimmer {
        0% {
            transform: translateX(-100%);
        }
        100% {
            transform: translateX(100%);
        }
    }
`}</style>
