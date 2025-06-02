"use client"

import Link from "next/link"
import { Github, Linkedin } from "lucide-react"
import AnimatedFooterText from "./animated-footer-text"
import { useSettings } from "@/contexts/settings-context"
import { useTheme } from "next-themes"

const Footer = () => {
  const { animationsEnabled } = useSettings()
  const { theme } = useTheme()

  const contributorLinks = [
    { name: "Lucas Lima", href: "https://lucas-lima.vercel.app/" },
    { name: "Caio Gabriel", href: "https://caio-gabriel.vercel.app/" },
    { name: "Matheus Theobald", href: "https://mateustheobald.github.io/" },
    { name: "Rhyan Yassin", href: "https://rhyan019.github.io/" },
  ]

  const legalLinks = [
    { name: "Código Fonte", href: "https://github.com/opzywl/aura", external: true },
    { name: "Terms", href: "#" },
    { name: "Privacy", href: "#" },
    { name: "Feedback", href: "#" },
  ]

  return (
    <footer className="relative py-16 px-4 sm:px-6 lg:px-8 bg-background">
      {/* Background with animations */}
      {animationsEnabled && (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/50 to-background"></div>
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                theme === "dark"
                  ? "radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)"
                  : "radial-gradient(circle at 25% 25%, rgba(0, 0, 0, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(0, 0, 0, 0.1) 0%, transparent 50%)",
              backgroundSize: "100px 100px",
              animation: "float 6s ease-in-out infinite",
            }}
          ></div>
        </>
      )}

      {/* Main footer content with border */}
      <div className="relative max-w-7xl mx-auto border border-border rounded-2xl p-8 bg-background/40 backdrop-blur-sm">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Logo and description */}
          <div className="md:col-span-1">
            <h3 className="text-2xl font-bold mb-4 text-foreground">Aura</h3>
            <p className="text-muted-foreground text-sm">Produzido por estudantes.</p>
          </div>

          {/* PRODUTO */}
          <div>
            <h4 className="text-sm font-semibold mb-6 text-muted-foreground uppercase tracking-wider">
              {animationsEnabled ? <AnimatedFooterText text="PRODUTO" delay={0} /> : "PRODUTO"}
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  Artigo
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  Tecnologia
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  Orientadores
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  CRM
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  Home
                </Link>
              </li>
            </ul>
          </div>

          {/* CONTRIBUIDORES */}
          <div>
            <h4 className="text-sm font-semibold mb-6 text-muted-foreground uppercase tracking-wider">
              {animationsEnabled ? <AnimatedFooterText text="CONTRIBUIDORES" delay={1000} /> : "CONTRIBUIDORES"}
            </h4>
            <ul className="space-y-3">
              {contributorLinks.map((contributor, index) => (
                <li key={index}>
                  <a
                    href={contributor.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm hover:underline"
                  >
                    {contributor.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* LEGAL */}
          <div>
            <h4 className="text-sm font-semibold mb-6 text-muted-foreground uppercase tracking-wider">
              {animationsEnabled ? <AnimatedFooterText text="LEGAL" delay={2000} /> : "LEGAL"}
            </h4>
            <ul className="space-y-3">
              {legalLinks.map((link, index) => (
                <li key={index}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors text-sm hover:underline"
                    >
                      {link.name}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground transition-colors text-sm hover:underline"
                    >
                      {link.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-border pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* Social media icons */}
            <div className="flex space-x-4 mb-4 md:mb-0">
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Github className="h-5 w-5" />
              </Link>
            </div>

            {/* Copyright */}
            <div className="text-muted-foreground text-sm">Copyright © 2025 Aura, Inc. All Rights Reserved.</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </footer>
  )
}

export default Footer
