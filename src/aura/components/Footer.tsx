"use client"

import Link from "next/link"
import AnimatedFooterText from "./AnimatedFooterText"
import AnimatedCopyrightText from "./AnimatedCopyrightText"
import { useSettings } from "@/src/aura/features/view/lobby/contexts/SettingsContext"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

const Footer = () => {
    const { animationsEnabled } = useSettings()
    const { theme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const currentTheme = mounted ? theme : "dark"

    const contributorLinks = [
        { name: "Lucas Lima", href: "https://lucas-lima.vercel.app/" },
        { name: "Caio Gabriel", href: "https://caio-gabriel.vercel.app/" },
        { name: "Matheus Theobald", href: "https://mateustheobald.github.io/" },
        { name: "Rhyan Yassin", href: "https://rhyan019.github.io/" },
    ]

    const legalLinks = [
        { name: "Código Fonte", href: "https://github.com/opzywl/aura", external: true },
        { name: "Terms", href: "/terms", external: true },
        { name: "Privacy", href: "/privacy" },
        { name: "Feedback", href: "/feedback" },
    ]

    return (
        <footer className="relative py-8 px-4 sm:px-6 lg:px-8">
            <div className="relative max-w-7xl mx-auto z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div className="md:col-span-1">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-xl">✨</span>
                            <h3 className="text-xl font-bold text-white font-modernmono">Aura</h3>
                        </div>
                        <p className="text-gray-300 text-xs leading-relaxed">
                            Sistema de chatbot integrado para oficinas mecânicas.
                        </p>
                        <p className="text-xs text-gray-400 font-modernmono mt-2">Criado por estudantes</p>
                    </div>

                    <div>
                        <h4 className="text-xs font-bold mb-4 text-gray-200 uppercase tracking-wider font-modernmono">
                            {animationsEnabled ? <AnimatedFooterText text="PRODUTO" delay={0} /> : "PRODUTO"}
                        </h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="#" className="text-gray-300 hover:text-white transition-colors text-xs">
                                    Artigo
                                </Link>
                            </li>
                            <li>
                                <Link href="/technology" className="text-gray-300 hover:text-white transition-colors text-xs">
                                    Tecnologia
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-gray-300 hover:text-white transition-colors text-xs">
                                    Orientadores
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-gray-300 hover:text-white transition-colors text-xs">
                                    Home
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-xs font-bold mb-4 text-gray-200 uppercase tracking-wider font-modernmono">
                            {animationsEnabled ? <AnimatedFooterText text="CONTRIBUIDORES" delay={1000} /> : "CONTRIBUIDORES"}
                        </h4>
                        <ul className="space-y-2">
                            {contributorLinks.map((contributor, index) => (
                                <li key={index}>
                                    <a
                                        href={contributor.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-300 hover:text-white transition-colors text-xs"
                                    >
                                        {contributor.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-xs font-bold mb-4 text-gray-200 uppercase tracking-wider font-modernmono">
                            {animationsEnabled ? <AnimatedFooterText text="LEGAL" delay={2000} /> : "LEGAL"}
                        </h4>
                        <ul className="space-y-2">
                            {legalLinks.map((link, index) => (
                                <li key={index}>
                                    {link.external ? (
                                        <a
                                            href={link.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-gray-300 hover:text-white transition-colors text-xs"
                                        >
                                            {link.name}
                                        </a>
                                    ) : (
                                        <Link href={link.href} className="text-gray-300 hover:text-white transition-colors text-xs">
                                            {link.name}
                                        </Link>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="pt-6">
                    <div className="flex justify-center items-center">
                        <AnimatedCopyrightText />
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
