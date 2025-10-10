"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Menu, X, Settings } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"
import { useTheme } from "next-themes"
import SettingsModal from "./SettingsModal"
import ThemeToggle from "./ThemeToggle"
import { useSettings } from "../contexts/SettingsContext"
import { useLanguage } from "../contexts/LanguageContext"
import { Button } from "@/components/ui/button"

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const isMobile = useMobile()
  const { theme } = useTheme()
  const { glowEffects, reducedMotion } = useSettings()
  const { language, setLanguage, t } = useLanguage()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    {
      name: "Artigo",
      href: "#artigo",
      gradient: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(37,99,235,0.06) 50%, rgba(29,78,216,0) 100%)",
      color: "text-blue-500",
    },
    {
      name: language === "pt-BR" ? "🇧🇷 PT" : "🇺🇸 EN",
      href: "#",
      gradient: "radial-gradient(circle, rgba(168,85,247,0.15) 0%, rgba(147,51,234,0.06) 50%, rgba(126,34,206,0) 100%)",
      color: "text-purple-500",
      isLanguageSelector: true,
    },
    {
      name: "Changelog",
      href: "#changelog",
      gradient: "radial-gradient(circle, rgba(34,197,94,0.15) 0%, rgba(22,163,74,0.06) 50%, rgba(21,128,61,0) 100%)",
      color: "text-green-500",
    },
  ]

  const itemVariants = {
    initial: { rotateX: 0, opacity: 1 },
    hover: { rotateX: reducedMotion ? 0 : -90, opacity: reducedMotion ? 1 : 0 },
  }

  const backVariants = {
    initial: { rotateX: reducedMotion ? 0 : 90, opacity: reducedMotion ? 1 : 0 },
    hover: { rotateX: 0, opacity: 1 },
  }

  const glowVariants = {
    initial: { opacity: 0, scale: 0.8 },
    hover:
      glowEffects && !reducedMotion
        ? {
            opacity: 1,
            scale: 2,
            transition: {
              opacity: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
              scale: { duration: 0.5, type: "spring", stiffness: 300, damping: 25 },
            },
          }
        : { opacity: 0, scale: 0.8 },
  }

  const sharedTransition = {
    type: "spring",
    stiffness: 100,
    damping: 20,
    duration: reducedMotion ? 0.1 : 0.5,
  }

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage)
  }

  const handleNavItemClick = (item: any, e: React.MouseEvent) => {
    if (item.isLanguageSelector) {
      e.preventDefault()
      // Toggle language
      const newLanguage = language === "pt-BR" ? "en-US" : "pt-BR"
      handleLanguageChange(newLanguage)
    }
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? theme === "dark"
              ? "bg-black/80 backdrop-blur-md py-2"
              : "bg-white/90 backdrop-blur-md py-2 border-b border-gray-200"
            : "bg-transparent py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <motion.div
                whileHover={reducedMotion ? {} : { scale: 1.05 }}
                className={`text-2xl font-bold tracking-wider ${theme === "dark" ? "text-white" : "text-black"}`}
                style={{
                  letterSpacing: "0.15em",
                  textShadow: glowEffects
                    ? theme === "dark"
                      ? "0 0 10px rgba(255, 255, 255, 0.5), 0 0 20px rgba(255, 255, 255, 0.3), 0 0 30px rgba(255, 255, 255, 0.2)"
                      : "0 0 10px rgba(0, 0, 0, 0.3), 0 0 20px rgba(0, 0, 0, 0.2)"
                    : "none",
                }}
              >
                AURA
              </motion.div>
            </Link>

            {/* Desktop Navigation with glow effects */}
            {!isMobile && (
              <nav className="hidden md:flex">
                <div
                  className={`flex space-x-2 px-4 py-2 border rounded-full backdrop-blur-lg ${
                    theme === "dark" ? "border-gray-600 bg-black/20" : "border-gray-300 bg-white/60"
                  }`}
                >
                  {navItems.map((item) => (
                    <motion.div key={item.name} className="relative">
                      <motion.div
                        className="block rounded-lg overflow-visible group relative"
                        style={{ perspective: "600px" }}
                        whileHover="hover"
                        initial="initial"
                      >
                        <motion.div
                          className="absolute inset-0 z-0 pointer-events-none"
                          variants={glowVariants}
                          style={{
                            background: item.gradient,
                            opacity: 0,
                            borderRadius: "8px",
                          }}
                        />
                        <motion.a
                          href={item.href}
                          onClick={(e) => handleNavItemClick(item, e)}
                          className={`flex items-center px-3 py-1 relative z-10 bg-transparent transition-colors rounded-lg cursor-pointer ${
                            theme === "dark"
                              ? "text-gray-300 group-hover:text-white"
                              : "text-gray-700 group-hover:text-black"
                          }`}
                          variants={itemVariants}
                          transition={sharedTransition}
                          style={{ transformStyle: "preserve-3d", transformOrigin: "center bottom" }}
                        >
                          <span
                            className={`transition-colors duration-300 ${glowEffects ? `group-hover:${item.color}` : ""}`}
                          >
                            {item.name}
                          </span>
                        </motion.a>
                        {!reducedMotion && (
                          <motion.a
                            href={item.href}
                            onClick={(e) => handleNavItemClick(item, e)}
                            className={`flex items-center px-3 py-1 absolute inset-0 z-10 bg-transparent transition-colors rounded-lg cursor-pointer ${
                              theme === "dark"
                                ? "text-gray-300 group-hover:text-white"
                                : "text-gray-700 group-hover:text-black"
                            }`}
                            variants={backVariants}
                            transition={sharedTransition}
                            style={{ transformStyle: "preserve-3d", transformOrigin: "center top", rotateX: 90 }}
                          >
                            <span
                              className={`transition-colors duration-300 ${glowEffects ? `group-hover:${item.color}` : ""}`}
                            >
                              {item.name}
                            </span>
                          </motion.a>
                        )}
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              </nav>
            )}

            {/* Right side buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Settings Button */}
              <Button
                onClick={() => setIsSettingsOpen(true)}
                variant="ghost"
                size="icon"
                className={`transition-colors ${
                  theme === "dark" ? "text-white hover:text-gray-300" : "text-black hover:text-gray-700"
                }`}
              >
                <Settings className="h-5 w-5" />
              </Button>

              <Link href="/login">
                <div
                  className={`px-4 py-2 border rounded-full backdrop-blur-lg cursor-pointer transition-colors hover:bg-opacity-80 ${
                    theme === "dark"
                      ? "border-gray-600 bg-black/20 text-white hover:bg-black/30"
                      : "border-gray-300 bg-white/60 text-black hover:bg-white/80"
                  }`}
                >
                  <span>Login</span>
                </div>
              </Link>
              <ThemeToggle />
            </div>

            {/* Mobile Menu Button */}
            {isMobile && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`md:hidden focus:outline-none ${theme === "dark" ? "text-white" : "text-black"}`}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            )}
          </div>
        </div>

        {/* Separator line */}
        <div className={`w-full h-px mt-2 ${theme === "dark" ? "bg-gray-800" : "bg-gray-200"}`}></div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && isMobile && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={`md:hidden backdrop-blur-md ${theme === "dark" ? "bg-black/95" : "bg-white/95"}`}
            >
              <div className="px-4 pt-2 pb-6 space-y-4">
                <div
                  className={`flex flex-col space-y-2 px-4 py-3 border rounded-lg ${
                    theme === "dark" ? "border-gray-600 bg-black/20" : "border-gray-300 bg-white/60"
                  }`}
                >
                  {navItems.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      onClick={(e) => {
                        handleNavItemClick(item, e)
                        if (!item.isLanguageSelector) {
                          setMobileMenuOpen(false)
                        }
                      }}
                      className={`block py-2 transition-colors cursor-pointer ${
                        theme === "dark" ? "text-gray-300 hover:text-white" : "text-gray-700 hover:text-black"
                      }`}
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
                <div className="flex items-center justify-between px-4 py-3 border border-gray-600 rounded-lg">
                  {/* Settings Button Mobile */}
                  <Button
                    onClick={() => setIsSettingsOpen(true)}
                    variant="ghost"
                    size="icon"
                    className={`transition-colors ${
                      theme === "dark" ? "text-white hover:text-gray-300" : "text-black hover:text-gray-700"
                    }`}
                  >
                    <Settings className="h-5 w-5" />
                  </Button>

                  <Link href="/login">
                    <div
                      className={`px-4 py-2 border rounded-full cursor-pointer transition-colors hover:bg-opacity-80 ${
                        theme === "dark"
                          ? "border-gray-600 bg-black/20 text-white hover:bg-black/30"
                          : "border-gray-300 bg-white/60 text-black hover:bg-white/80"
                      }`}
                    >
                      <span>Login</span>
                    </div>
                  </Link>
                  <ThemeToggle />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  )
}

export default Header
