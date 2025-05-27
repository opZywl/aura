import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "./lobby/components/ui/button";
import { Card } from "./lobby/components/ui/card";
import { MessageSquare, DollarSign, Calendar, Settings, Code, Play, MessageCircle, LinkIcon as LucideLinkIcon } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "./lobby/components/header";
import Footer from "./lobby/components/footer";
import WaveDotsBackground from "./lobby/WaveDotsBackground";
import CalendarModal from "./lobby/components/calendar-modal";
import NeuralNetworkAnimation from "./lobby/components/neural-network-animation";
import AuraChat from "./lobby/components/tars-chat";
import LogoCarousel from "./lobby/components/logo-carousel";
import AnimatedText from "./lobby/components/animated-text";
import { SettingsProvider } from "./lobby/contexts/SettingsContext";
import { useTheme } from "next-themes";
import { useSettings } from "./lobby/contexts/SettingsContext";

function HomeContent() {
  const [scrollY, setScrollY] = useState(0);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const { theme } = useTheme();
  const { highContrast, reducedMotion, fadeEffects } = useSettings();

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const serviceAreas = [
    {
      title: "Vendas",
      description: "pixpix",
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
      description: "Coordenação automática de horários.",
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
  ];

  const features = [
    {
      title: "Executa Ações",
      description: "Interação e execução de tarefas do chatbot.",
      icon: <Play className={`h-8 w-8 sm:h-10 sm:w-10 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`} />,
    },
    {
      title: "wdygwhujdwkd",
      description: "wtfdygwhujidkiowpdddwddwdws",
      icon: (
        <MessageCircle className={`h-8 w-8 sm:h-10 sm:w-10 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`} />
      ),
    },
    {
      title: "Integrações com Sistemas",
      description: "Conexão com sistemas existentes para uma integração fluida.",
      icon: <LucideLinkIcon className={`h-8 w-8 sm:h-10 sm:w-10 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`} />,
    },
  ];

  const getContrastClass = () => {
    if (highContrast) {
      return theme === "dark" ? "text-white" : "text-black";
    }
    return theme === "dark" ? "text-gray-200" : "text-gray-900";
  };

  const getSecondaryContrastClass = () => {
    if (highContrast) {
      return theme === "dark" ? "text-gray-100" : "text-gray-800";
    }
    return theme === "dark" ? "text-gray-400" : "text-gray-600";
  };

  return (
    <div
      className={`min-h-screen overflow-hidden transition-colors duration-300 ${
    theme === "dark" ? "bg-black" : "bg-white"
} ${getContrastClass()}`}
    >
      <WaveDotsBackground />

      <div className="relative z-10">
        <Header />

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
                  ✨ 100% experimental – válido até o final do semestre!
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
              Habilidades de Conversação Hoje!
            </h1>
            <p className={`text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 ${getSecondaryContrastClass()}`}>
              Junte-se ao melhor chatbot do planeta 1% AI!
            </p>

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
              style={{
                textShadow: !reducedMotion
                  ? theme === "dark"
                    ? "0 0 8px rgba(192, 192, 192, 0.6), 0 0 15px rgba(192, 192, 192, 0.4)"
                    : "0 0 8px rgba(0, 0, 0, 0.3), 0 0 15px rgba(0, 0, 0, 0.2)"
                  : "none",
                letterSpacing: "0.05em",
              }}
            >
              yzyzyzyzy?
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
                 fe!n fein fein fein fein.
                </p>
                <p
                  className={`text-base sm:text-lg lg:text-xl leading-relaxed mt-4 sm:mt-6 ${getSecondaryContrastClass()}`}
                >
                 ONNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN SIGHTTTTTTTTTTTTTTTTTTTTTTTTTTT.
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

        <section
          id="areas"
          className={`py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 relative ${theme === "dark" ? "bg-black/30" : "bg-gray-50/50"}`}
        >
          <div className="max-w-6xl mx-auto">
            <h2
              className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-12 sm:mb-16 text-center ${getContrastClass()}`}
              style={{
                textShadow: !reducedMotion
                  ? theme === "dark"
                    ? "0 0 8px rgba(192, 192, 192, 0.6), 0 0 15px rgba(192, 192, 192, 0.4)"
                    : "0 0 8px rgba(0, 0, 0, 0.3), 0 0 15px rgba(0, 0, 0, 0.2)"
                  : "none",
                letterSpacing: "0.05em",
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
                  whileHover={reducedMotion ? {} : { y: -10, transition: { duration: 0.2 } }}
                >
                  <Card
                    className={`h-full p-4 sm:p-6 transition-all duration-300 ${
    theme === "dark"
        ? "bg-gradient-to-br from-gray-900 to-black border-gray-800 shadow-xl shadow-black/50 hover:shadow-gray-700/20"
        : "bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-xl shadow-gray-300/50 hover:shadow-gray-400/30"
}`}
                  >
                    <div className="mb-3 sm:mb-4">{service.icon}</div>
                    <h3 className={`text-lg sm:text-xl font-bold mb-2 sm:mb-3 ${getContrastClass()}`}>
                      {service.title}
                    </h3>
                    <p className={`text-sm sm:text-base ${getSecondaryContrastClass()}`}>{service.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="funcionalidades" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-6xl mx-auto">
            <h2
              className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-12 sm:mb-16 text-center ${getContrastClass()}`}
              style={{
                textShadow: !reducedMotion
                  ? theme === "dark"
                    ? "0 0 8px rgba(192, 192, 192, 0.6), 0 0 15px rgba(192, 192, 192, 0.4)"
                    : "0 0 8px rgba(0, 0, 0, 0.3), 0 0 15px rgba(0, 0, 0, 0.2)"
                  : "none",
                letterSpacing: "0.05em",
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
              style={{
                textShadow: !reducedMotion
                  ? theme === "dark"
                    ? "0 0 8px rgba(192, 192, 192, 0.6), 0 0 15px rgba(192, 192, 192, 0.4)"
                    : "0 0 8px rgba(0, 0, 0, 0.3), 0 0 15px rgba(0, 0, 0, 0.2)"
                  : "none",
                letterSpacing: "0.05em",
              }}
            >
              Vem com o certo faz o pix
            </h2>
            <p className={`text-lg sm:text-xl mb-8 sm:mb-10 ${getSecondaryContrastClass()}`}>
              GOGOGOGOGOGOGOGOGOGOG.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div
                whileHover={reducedMotion ? {} : { scale: 1.05 }}
                whileTap={reducedMotion ? {} : { scale: 0.95 }}
              >
                <Link to="https://n8n.io" target="_blank" rel="noopener noreferrer">
                  <Button
                    className={`text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 rounded-xl shadow-lg w-full sm:w-auto ${
    theme === "dark"
        ? "bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 shadow-black/50 text-gray-200"
        : "bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black shadow-gray-400/50 text-white"
}`}
                  >
                    BUTAOZINHO1
                  </Button>
                </Link>
              </motion.div>
              <motion.div
                whileHover={reducedMotion ? {} : { scale: 1.05 }}
                whileTap={reducedMotion ? {} : { scale: 0.95 }}
              >
                <Link to="https://www.lucas-lima.xyz" target="_blank" rel="noopener noreferrer">
                  <Button
                    variant="outline"
                    className={`text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 border-2 rounded-xl w-full sm:w-auto ${
    theme === "dark"
        ? "border-gray-500 text-gray-300 hover:bg-gray-800/50 hover:text-white"
        : "border-gray-400 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
}`}
                  >
                    BUTAOZINHO2
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </section>

        <Footer />
      </div>

      {isCalendarOpen && <CalendarModal onClose={() => setIsCalendarOpen(false)} />}

      <style>{`
@keyframes shimmer {
    0% {
        transform: translateX(-100%);
    }
    100% {
        transform: translateX(100%);
    }
}
`}</style>
    </div>
  );
}

export default function Lobby() {
  return (
    <SettingsProvider>
      <HomeContent />
    </SettingsProvider>
  );
}
