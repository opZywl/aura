"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"
import { useTheme } from "next-themes"
import ThemeToggle from "./ThemeToggle"
import { useSettings } from "@/src/aura/features/view/lobby/contexts/SettingsContext"

const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const isMobile = useMobile()
    const { theme } = useTheme()
    const { glowEffects, reducedMotion } = useSettings()

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10)
        }

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    type NavItem = {
        name: string
        href: string
        gradient: string
        color: string
        isLanguageSelector?: boolean
    }

    const navItems: NavItem[] = [
        {
            name: "Serviços",
            href: "#o-que-fazemos",
            gradient: "radial-gradient(circle, rgba(168,85,247,0.15) 0%, rgba(147,51,234,0.06) 50%, rgba(126,34,206,0) 100%)",
            color: "text-purple-500",
        },
        {
            name: "Sobre",
            href: "#sobre-projeto",
            gradient: "radial-gradient(circle, rgba(168,85,247,0.15) 0%, rgba(147,51,234,0.06) 50%, rgba(126,34,206,0) 100%)",
            color: "text-purple-500",
        },
        {
            name: "Contato",
            href: "#contato",
            gradient: "radial-gradient(circle, rgba(168,85,247,0.15) 0%, rgba(147,51,234,0.06) 50%, rgba(126,34,206,0) 100%)",
            color: "text-purple-500",
        },
    ]

    const handleNavItemClick = (item: NavItem, e: React.MouseEvent<HTMLAnchorElement>) => {
        if (item.href.startsWith("#")) {
            e.preventDefault()
            const el = document.querySelector(item.href)
            if (el) el.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" })
        }
        if (!item.isLanguageSelector) setMobileMenuOpen(false)
    }

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

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                    isScrolled ? "bg-black/20 backdrop-blur-xl py-3 border-b border-white/5" : "bg-transparent py-4"
                }`}
                style={{
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        <Link href="/" className="flex items-center gap-2">
                            <motion.div
                                whileHover={reducedMotion ? {} : { scale: 1.05 }}
                                className="flex items-center gap-2 text-xl sm:text-2xl font-light tracking-[0.1em] text-white font-modernmono"
                            >
                                <span className="text-2xl">✨</span>
                                <span>Aura</span>
                            </motion.div>
                        </Link>

                        {!isMobile && (
                            <nav className="hidden md:flex absolute left-1/2 transform -translate-x-1/2">
                                <div className="flex items-center gap-1 px-2 py-1.5 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
                                    {navItems.map((item) => (
                                        <motion.a
                                            key={item.name}
                                            href={item.href}
                                            onClick={(e) => handleNavItemClick(item, e)}
                                            className="px-4 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200 relative overflow-hidden group font-modernmono"
                                            whileHover={reducedMotion ? {} : { scale: 1.05 }}
                                        >
                      <span className="relative z-10 inline-flex">
                        {item.name.split("").map((char, index) => (
                            <motion.span
                                key={index}
                                className="inline-block"
                                initial={{ y: 0 }}
                                whileHover={{
                                    y: reducedMotion ? 0 : [-2, -4, -2, 0],
                                    transition: {
                                        duration: 0.4,
                                        delay: index * 0.05,
                                        ease: "easeInOut",
                                    },
                                }}
                            >
                                {char === " " ? "\u00A0" : char}
                            </motion.span>
                        ))}
                      </span>
                                        </motion.a>
                                    ))}
                                </div>
                            </nav>
                        )}

                        <div className="hidden md:flex items-center gap-3">
                            <Link href="/login">
                                <motion.div
                                    className="px-4 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 border border-white/10 rounded-full backdrop-blur-md transition-all duration-200 cursor-pointer font-modernmono"
                                    whileHover={reducedMotion ? {} : { scale: 1.05 }}
                                    whileTap={reducedMotion ? {} : { scale: 0.95 }}
                                >
                                    Login
                                </motion.div>
                            </Link>

                            <ThemeToggle />
                        </div>

                        {isMobile && (
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden focus:outline-none text-white"
                            >
                                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                        )}
                    </div>
                </div>

                <AnimatePresence>
                    {mobileMenuOpen && isMobile && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden bg-black/80 backdrop-blur-lg border-t border-white/10"
                        >
                            <div className="px-4 pt-4 pb-6 space-y-4">
                                <div className="flex flex-col space-y-2 px-4 py-3 bg-white/5 border border-white/10 rounded-lg">
                                    {navItems.map((item) => (
                                        <a
                                            key={item.name}
                                            href={item.href}
                                            onClick={(e) => handleNavItemClick(item, e)}
                                            className="block py-2 text-gray-300 hover:text-white transition-colors cursor-pointer"
                                        >
                                            {item.name}
                                        </a>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between px-4 py-3 bg-white/5 border border-white/10 rounded-lg">
                                    <Link href="/login">
                                        <div className="px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 border border-white/10 rounded-full cursor-pointer transition-all">
                                            Login
                                        </div>
                                    </Link>
                                    <ThemeToggle />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>
        </>
    )
}

export default Header
