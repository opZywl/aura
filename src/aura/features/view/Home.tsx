"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Minus } from "lucide-react"
import Header from "../../components/Header"
import Footer from "../../components/Footer"
import LogoCarousel from "../../components/LogoCarousel"
import NeuralNetworkAnimation from "../../components/NeuralNetworkAnimation"
import CalendarModal from "@/components/calendar-modal"
import GradientSelector from "../../components/GradientSelector"
import { useMobile } from "@/hooks/use-mobile"
import { useSettings } from "@/src/aura/features/view/lobby/contexts/SettingsContext"
import { SettingsProvider } from "../../contexts/AnimationsSettingsContext"
import AuraFlowBot from "./flow/aura-flow-bot"

function HomeContent() {
    const isMobile = useMobile()
    const [scrollY, setScrollY] = useState(0)
    const [mounted, setMounted] = useState(false)
    const { highContrast, reducedMotion } = useSettings()
    const [isCalendarOpen, setIsCalendarOpen] = useState(false)
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)
    const [showCarouselTooltip, setShowCarouselTooltip] = useState(false)
    const [isInFooterSection, setIsInFooterSection] = useState(false)
    const [isGradientSelectorOpen, setIsGradientSelectorOpen] = useState(false)
    const [currentGradient, setCurrentGradient] = useState("url('/grad1.svg')")

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY)

            const footerSection = document.getElementById("footer-section")
            if (footerSection) {
                const rect = footerSection.getBoundingClientRect()
                setIsInFooterSection(rect.top <= 300)
            }
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const whatWeDoItems = [
        {
            title: "WORKFLOW DE MENSAGENS",
            description:
                "Visualize e configure o fluxo completo de mensagens do chatbot. Crie workflows personalizados para automatizar respostas e ações baseadas nas interações dos clientes.",
            image: "/workflow-diagram-automation.jpg",
        },
        {
            title: "CHAT INTELIGENTE",
            description:
                "Interface de chat em tempo real integrada ao sistema. Acompanhe conversas, responda manualmente quando necessário e veja o histórico completo de interações.",
            image: "/chat-interface-messaging.jpg",
        },
        {
            title: "GESTÃO DE CONTAS",
            description:
                "Sistema completo de gestão financeira e ordens de serviço. Controle pagamentos, visualize status de serviços e mantenha o histórico de todas as transações da oficina.",
            image: "/financial-dashboard-accounts.jpg",
        },
        {
            title: "PAINEL DE AGENDAMENTOS",
            description:
                "Visualização completa de agendamentos confirmados e relatórios de conversas. Configure links de agendamento, horários disponíveis e acompanhe todo o histórico de interações dos clientes.",
            image: "/appointment-calendar-dashboard.jpg",
        },
    ]

    const faqItems = [
        {
            question: "O QUE É O PROJETO AURA?",
            answer:
                "AURA é um sistema de chatbot integrado desenvolvido por estudantes para automatizar o atendimento de oficinas mecânicas, incluindo agendamentos, consultas e gestão de processos.",
        },
        {
            question: "QUAIS TECNOLOGIAS SÃO UTILIZADAS?",
            answer:
                "O projeto utiliza Flask, React, PostgreSQL, TypeScript e Python, seguindo a arquitetura MVC para garantir escalabilidade e manutenibilidade.",
        },
        {
            question: "COMO FUNCIONA A INTEGRAÇÃO?",
            answer:
                "O AURA se integra aos sistemas internos da oficina através de APIs, permitindo acesso em tempo real a informações de agendamentos, ordens de serviço e disponibilidade.",
        },
        {
            question: "O SISTEMA É PERSONALIZÁVEL?",
            answer:
                "Sim! O AURA oferece fluxos personalizados que podem ser adaptados às necessidades específicas de cada oficina mecânica.",
        },
        {
            question: "QUAL O DIFERENCIAL DO AURA?",
            answer:
                "Diferente de soluções genéricas, o AURA foi desenvolvido especificamente para oficinas mecânicas, com funcionalidades direcionadas para este segmento e integração completa com sistemas internos.",
        },
    ]

    const getContrastClass = () => (highContrast ? "text-white" : "text-white")
    const getSecondaryContrastClass = () => (highContrast ? "text-gray-100" : "text-gray-300")

    return (
        <div className="min-h-screen overflow-hidden transition-colors duration-300 relative bg-black">
            {/* Fundo decorativo – não intercepta cliques */}
            <div className="fixed inset-0 z-0 pointer-events-none">
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
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-300"
                    style={{ backgroundImage: currentGradient }}
                />
                <div className="absolute inset-0 bg-black/60" />
            </div>

            <div className="relative z-10">
                {/* Header sempre clicável e acima das camadas */}
                <div
                    className={`relative z-10 transition-all duration-500 ${
                        isInFooterSection ? "opacity-0 -translate-y-4" : "opacity-100 translate-y-0"
                    }`}
                >
                    <Header onOpenGradientSelector={() => setIsGradientSelectorOpen(true)} />
                </div>

                <section className="relative h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
                    <motion.div
                        initial={reducedMotion ? {} : { opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={reducedMotion ? {} : { duration: 0.8 }}
                        className="text-center max-w-4xl mx-auto w-full"
                    >
                        <div className="mb-4 sm:mb-6">
                            <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-zinc-800/60 border border-zinc-700/40 rounded-full text-xs sm:text-sm text-white backdrop-blur-md shadow-lg relative overflow-hidden">
                                <span className="relative z-10 font-modernmono">Chatbot pronto para sua oficina</span>
                            </div>
                        </div>

                        <h1
                            className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 font-modernmono text-white"
                            style={{
                                letterSpacing: "0.05em",
                                textShadow: "0 0 40px rgba(255, 255, 255, 0.5), 0 0 80px rgba(255, 255, 255, 0.3)",
                            }}
                        >
                            AURA: chatbot com sistema integrado
                        </h1>

                        <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 text-gray-200 font-medium">
                            Automatize atendimento, agendamentos e operações da sua oficina mecânica.
                        </p>

                        <p className="text-sm sm:text-base text-gray-300 mb-6">
                            Produzido por estudantes | Chatbot inteligente com integrações de sistemas
                        </p>

                        <div className="hidden">
                            <AuraFlowBot standalone={true} />
                        </div>

                        <div
                            className="mt-4 sm:mt-6 relative"
                            onMouseEnter={() => setShowCarouselTooltip(true)}
                            onMouseLeave={() => setShowCarouselTooltip(false)}
                        >
                            {showCarouselTooltip && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-zinc-900/90 backdrop-blur-md border border-white/10 rounded-lg px-4 py-2 text-sm text-gray-300 whitespace-nowrap z-50 font-modernmono"
                                >
                                    Empresas e instituições que apoiaram nossa jornada acadêmica
                                </motion.div>
                            )}
                            <LogoCarousel />
                        </div>
                    </motion.div>

                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
                    >
                        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
                            <motion.div
                                animate={{ y: [0, 12, 0] }}
                                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                                className="w-1.5 h-1.5 bg-white rounded-full"
                            />
                        </div>
                    </motion.div>
                </section>

                <section
                    id="que-son"
                    className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 relative bg-black"
                >
                    <motion.div
                        initial={reducedMotion ? {} : { opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={reducedMotion ? {} : { duration: 1 }}
                        viewport={{ once: true }}
                        className="max-w-6xl mx-auto relative z-10"
                    >
                        <h2
                            className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-8 sm:mb-12 text-center text-white font-modernmono`}
                            style={{ letterSpacing: "0.05em" }}
                        >
                            O que é o Sistema AURA?
                        </h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
                            <motion.div
                                initial={reducedMotion ? {} : { x: -50, opacity: 0 }}
                                whileInView={{ x: 0, opacity: 1 }}
                                transition={reducedMotion ? {} : { duration: 0.8 }}
                                viewport={{ once: true }}
                                className="order-2 lg:order-1"
                            >
                                <p className={`text-base sm:text-lg lg:text-xl leading-relaxed text-gray-300`}>
                                    O AURA é um sistema de chatbot integrado desenvolvido especificamente para oficinas mecânicas
                                    automotivas, automatizando atendimento ao cliente, agendamentos e consultas de serviços.
                                </p>
                                <p className={`text-base sm:text-lg lg:text-xl leading-relaxed mt-4 sm:mt-6 text-gray-300`}>
                                    Com integração completa aos sistemas internos da oficina, o AURA centraliza atendimentos de múltiplos
                                    canais em um único painel, oferecendo respostas rápidas e precisas 24 horas por dia.
                                </p>
                            </motion.div>
                            <div className="relative h-64 sm:h-80 lg:h-96 w-full rounded-2xl overflow-hidden shadow-2xl shadow-black/50 order-1 lg:order-2 border border-white/10">
                                <NeuralNetworkAnimation />
                            </div>
                        </div>
                    </motion.div>
                </section>

                {/* alvo do menu: #o-que-fazemos */}
                <section
                    id="o-que-fazemos"
                    className="scroll-mt-24 py-20 sm:py-32 lg:py-40 px-4 sm:px-6 lg:px-8 relative bg-black"
                >
                    <div className="max-w-6xl mx-auto relative z-10">
                        <motion.div
                            initial={reducedMotion ? {} : { opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={reducedMotion ? {} : { duration: 1 }}
                            viewport={{ once: true }}
                            className="mb-20"
                        >
                            <div className="flex items-center justify-center mb-4">
                                <div className="h-px w-12 bg-white/30"></div>
                            </div>
                            <h2
                                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-white font-modernmono"
                                style={{ letterSpacing: "0.1em" }}
                            >
                                O QUE FAZEMOS?
                            </h2>
                        </motion.div>

                        <div className="space-y-40 sm:space-y-60">
                            {whatWeDoItems.map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={reducedMotion ? {} : { opacity: 0, scale: 0.8 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={reducedMotion ? {} : { duration: 1, ease: "easeOut" }}
                                    viewport={{ once: false, margin: "-20%" }}
                                    className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
                                >
                                    {index % 2 === 0 ? (
                                        <>
                                            <motion.div
                                                initial={reducedMotion ? {} : { x: -100, opacity: 0 }}
                                                whileInView={{ x: 0, opacity: 1 }}
                                                transition={reducedMotion ? {} : { duration: 1.2, delay: 0.2 }}
                                                viewport={{ once: false, margin: "-20%" }}
                                                className="space-y-6"
                                            >
                                                <div className="h-px w-16 bg-white/50"></div>
                                                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white font-modernmono tracking-wider">
                                                    {item.title}
                                                </h3>
                                                <p className="text-lg sm:text-xl text-gray-300 leading-relaxed">{item.description}</p>
                                            </motion.div>
                                            <motion.div
                                                initial={reducedMotion ? {} : { x: 100, opacity: 0, rotateY: -15 }}
                                                whileInView={{ x: 0, opacity: 1, rotateY: 0 }}
                                                transition={reducedMotion ? {} : { duration: 1.2, delay: 0.4 }}
                                                viewport={{ once: false, margin: "-20%" }}
                                                className="relative h-80 sm:h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl border border-white/10"
                                                style={{ perspective: "1000px" }}
                                            >
                                                <img
                                                    src={item.image || "/placeholder.svg"}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                            </motion.div>
                                        </>
                                    ) : (
                                        <>
                                            <motion.div
                                                initial={reducedMotion ? {} : { x: -100, opacity: 0, rotateY: 15 }}
                                                whileInView={{ x: 0, opacity: 1, rotateY: 0 }}
                                                transition={reducedMotion ? {} : { duration: 1.2, delay: 0.4 }}
                                                viewport={{ once: false, margin: "-20%" }}
                                                className="relative h-80 sm:h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 order-2 lg:order-1"
                                                style={{ perspective: "1000px" }}
                                            >
                                                <img
                                                    src={item.image || "/placeholder.svg"}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                            </motion.div>
                                            <motion.div
                                                initial={reducedMotion ? {} : { x: 100, opacity: 0 }}
                                                whileInView={{ x: 0, opacity: 1 }}
                                                transition={reducedMotion ? {} : { duration: 1.2, delay: 0.2 }}
                                                viewport={{ once: false, margin: "-20%" }}
                                                className="space-y-6 order-1 lg:order-2"
                                            >
                                                <div className="h-px w-16 bg-white/50"></div>
                                                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white font-modernmono tracking-wider">
                                                    {item.title}
                                                </h3>
                                                <p className="text-lg sm:text-xl text-gray-300 leading-relaxed">{item.description}</p>
                                            </motion.div>
                                        </>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* alvo do menu: #sobre-projeto */}
                <div
                    className={`transition-opacity duration-300 ${
                        isInFooterSection ? "opacity-0 pointer-events-none h-0 overflow-hidden" : "opacity-100"
                    }`}
                >
                    <section
                        id="sobre-projeto"
                        className="scroll-mt-24 py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 relative bg-black"
                    >
                        <div className="max-w-4xl mx-auto relative z-10">
                            <motion.div
                                initial={reducedMotion ? {} : { opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                transition={reducedMotion ? {} : { duration: 1 }}
                                viewport={{ once: true }}
                                className="mb-12"
                            >
                                <div className="flex items-center justify-center mb-6">
                                    <div
                                        className="h-0.5 w-12"
                                        style={{
                                            background: "linear-gradient(90deg, rgb(255, 255, 255) 0%, rgba(255, 255, 255, 0.5) 100%)",
                                            borderRadius: "100px",
                                            opacity: 1,
                                        }}
                                    ></div>
                                </div>
                                <h2
                                    className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-white font-modernmono"
                                    style={{ letterSpacing: "0.1em" }}
                                >
                                    SOBRE O PROJETO
                                </h2>
                            </motion.div>

                            <div className="space-y-4">
                                {faqItems.map((item, index) => (
                                    <motion.div
                                        key={index}
                                        initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={reducedMotion ? {} : { duration: 0.5, delay: index * 0.1 }}
                                        viewport={{ once: true }}
                                        className="rounded-2xl overflow-hidden bg-zinc-900/50 backdrop-blur-sm border border-white/10"
                                    >
                                        <button
                                            onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                                            className="w-full px-6 py-5 flex items-center justify-between text-left transition-all duration-200 hover:bg-white/5"
                                        >
                      <span className="text-sm sm:text-base font-bold text-white font-modernmono tracking-wide">
                        {item.question}
                      </span>
                                            <motion.div
                                                animate={{ rotate: openFaqIndex === index ? 180 : 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="flex-shrink-0 ml-4"
                                            >
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10">
                                                    {openFaqIndex === index ? (
                                                        <Minus className="h-4 w-4 text-white" />
                                                    ) : (
                                                        <Plus className="h-4 w-4 text-white" />
                                                    )}
                                                </div>
                                            </motion.div>
                                        </button>
                                        <motion.div
                                            initial={false}
                                            animate={{
                                                height: openFaqIndex === index ? "auto" : 0,
                                                opacity: openFaqIndex === index ? 1 : 0,
                                            }}
                                            transition={{ duration: 0.3 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-6 pb-5 text-sm sm:text-base text-gray-300 leading-relaxed font-modernmono">
                                                {item.answer}
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>

                <section id="footer-section" className="relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-black via-teal-950/20 to-black">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-900/30 via-transparent to-transparent" />

                        <div className="absolute top-32 left-10 w-64 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-60 rotate-[-15deg]" />
                        <div className="absolute top-20 right-20 w-96 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-60" />
                        <div className="absolute bottom-40 right-10 w-80 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-60 rotate-[25deg]" />
                    </div>

                    <motion.div
                        initial={reducedMotion ? {} : { opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={reducedMotion ? {} : { duration: 0.6 }}
                        viewport={{ once: true }}
                        className="max-w-4xl mx-auto text-center relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8"
                    >
                        <div className="flex items-center justify-center mb-8">
                            <div
                                className="h-0.5 w-16"
                                style={{
                                    background:
                                        "linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 0) 100%)",
                                }}
                            />
                        </div>

                        <h2
                            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-8 text-white font-modernmono"
                            style={{ letterSpacing: "0.15em" }}
                        >
                            TRANSFORME SUA
                            <br />
                            OFICINA HOJE
                        </h2>
                        <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto font-modernmono leading-relaxed">
                            Desenvolvido por estudantes apaixonados por tecnologia e inovação.
                            <br />
                            Entre em contato para saber mais sobre o projeto AURA e como ele
                            <br />
                            pode transformar sua oficina mecânica.
                        </p>
                    </motion.div>

                    <div className="relative z-10 flex items-center justify-center pb-12">
                        <div
                            className="h-px w-full max-w-6xl"
                            style={{
                                background:
                                    "linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.5) 50.42933558558559%, rgba(255, 255, 255, 0) 100%)",
                                willChange: "transform",
                                opacity: 1,
                            }}
                        />
                    </div>

                    <div className="relative z-10">
                        <Footer />
                    </div>
                </section>

                {isCalendarOpen && <CalendarModal onClose={() => setIsCalendarOpen(false)} />}
                <GradientSelector
                    isOpen={isGradientSelectorOpen}
                    onClose={() => setIsGradientSelectorOpen(false)}
                    currentGradient={currentGradient}
                    onSelectGradient={setCurrentGradient}
                />
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
