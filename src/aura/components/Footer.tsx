"use client"

import Link from "next/link"
import AnimatedFooterText from "./AnimatedFooterText"
import AnimatedCopyrightText from "./AnimatedCopyrightText"
import { useSettings } from "@/src/aura/features/view/lobby/contexts/SettingsContext"

const Footer = () => {
    const { animationsEnabled } = useSettings()
    const projectLinks: { name: string; href: string; external?: boolean }[] = [
        { name: "Visão geral", href: "/" },
        {
            name: "Artigo do Projeto",
            href: "https://drive.google.com/drive/folders/aura-projeto",
            external: true,
        },
        {
            name: "Repositório no GitHub",
            href: "https://github.com/opzywl/aura",
            external: true,
        },
    ]

    const teamMembers: { name: string; href?: string; role?: string }[] = [
        { name: "Lucas de Lima Almeida", href: "https://lucas-lima.vercel.app/" },
        { name: "Caio Gabriel Pereira do Nascimento", href: "https://caio-gabriel.vercel.app/" },
        { name: "Mateus Delucas Theobald", href: "https://mateustheobald.github.io/" },
        { name: "Rhyan Yassin Freitas Ahmad", href: "https://rhyan019.github.io/" },
        {
            name: "Adriana Aparecida Carnevalli Demetrio",
            role: "Orientadora",
        },
    ]

    const legalLinks: { name: string; href: string; external?: boolean }[] = [
        { name: "Termos de Uso", href: "/terms" },
        { name: "Privacidade", href: "/privacy" },
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
                            {animationsEnabled ? <AnimatedFooterText text="PROJETO" delay={0} /> : "PROJETO"}
                        </h4>
                        <ul className="space-y-2">
                            {projectLinks.map((link, index) => (
                                <li key={`${link.name}-${index}`}>
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

                    <div>
                        <h4 className="text-xs font-bold mb-4 text-gray-200 uppercase tracking-wider font-modernmono">
                            {animationsEnabled ? <AnimatedFooterText text="EQUIPE" delay={1000} /> : "EQUIPE"}
                        </h4>
                        <ul className="space-y-2">
                            {teamMembers.map((member, index) => (
                                <li key={`${member.name}-${index}`} className="text-gray-300 text-xs">
                                    {member.href ? (
                                        <a
                                            href={member.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-gray-300 hover:text-white transition-colors text-xs"
                                        >
                                            {member.name}
                                        </a>
                                    ) : (
                                        <span className="font-semibold text-white">{member.name}</span>
                                    )}
                                    {member.role && (
                                        <span className="block text-gray-400 font-modernmono">{member.role}</span>
                                    )}
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