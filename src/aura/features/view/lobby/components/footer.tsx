"use client"

import { Link } from "react-router-dom"
import { Github, Linkedin } from "lucide-react"
import AnimatedFooterText from "./animated-footer-text"
import { useSettings } from "../settings-context"
import { useTheme } from "next-themes"

const Footer = () => {
  const { animationsEnabled } = useSettings()
  const { theme } = useTheme()

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
                            ? "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 50%)"
                            : "radial-gradient(circle at 25% 25%, rgba(0,0,0,0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(0,0,0,0.1) 0%, transparent 50%)",
                    backgroundSize: "100px 100px",
                    animation: "float 6s ease-in-out infinite",
                  }}
              ></div>
            </>
        )}

        <div className="relative max-w-7xl mx-auto border border-border rounded-2xl p-8 bg-background/40 backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-1">
              <h3 className="text-2xl font-bold mb-4 text-foreground">Aura</h3>
              <p className="text-muted-foreground text-sm">Produzido por estudantes.</p>
            </div>

            {/* PRODUTO */}
            <div>
              <h4 className="text-sm font-semibold mb-6 text-muted-foreground uppercase tracking-wider">
                {animationsEnabled
                    ? <AnimatedFooterText text="PRODUTO" delay={0} />
                    : "PRODUTO"}
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/artigo" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    Artigo
                  </Link>
                </li>
                <li>
                  <Link to="/tecnologia" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    Tecnologia
                  </Link>
                </li>
                <li>
                  <Link to="/orientadores" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    Orientadores
                  </Link>
                </li>
                <li>
                  <Link to="/crm" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    CRM
                  </Link>
                </li>
                <li>
                  <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    Home
                  </Link>
                </li>
              </ul>
            </div>

            {/* CONTRIBUIDORES */}
            <div>
              <h4 className="text-sm font-semibold mb-6 text-muted-foreground uppercase tracking-wider">
                {animationsEnabled
                    ? <AnimatedFooterText text="CONTRIBUIDORES" delay={1000} />
                    : "CONTRIBUIDORES"}
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/contributors/lucas-lima" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    Lucas Lima
                  </Link>
                </li>
                <li>
                  <Link to="/contributors/caio-gabriel" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    Caio Gabriel
                  </Link>
                </li>
                <li>
                  <Link to="/contributors/matheus-theobald" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    Matheus Theobald
                  </Link>
                </li>
                <li>
                  <Link to="/contributors/rhyan-yassin" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    Rhyan Yassin
                  </Link>
                </li>
              </ul>
            </div>

            {/* LEGAL */}
            <div>
              <h4 className="text-sm font-semibold mb-6 text-muted-foreground uppercase tracking-wider">
                {animationsEnabled
                    ? <AnimatedFooterText text="LEGAL" delay={2000} />
                    : "LEGAL"}
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/codigo-fonte" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    Código Fonte
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link to="/feedback" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    Feedback
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              {/* Social media icons */}
              <div className="flex space-x-4 mb-4 md:mb-0">
                <Link to="/social/facebook" className="text-muted-foreground hover:text-foreground transition-colors">
                  {/* ícone customizado */}
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </Link>
                <Link to="/social/linkedin" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Linkedin className="h-5 w-5" />
                </Link>
                <Link to="/social/github" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Github className="h-5 w-5" />
                </Link>
              </div>

              <div className="text-muted-foreground text-sm">
                Copyright © 2025 Aura, Inc. All Rights Reserved.
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50%      { transform: translateY(-10px); }
          }
        `}</style>
      </footer>
  )
}

export default Footer
