"use client"

import Link from "next/link"
import { Github, Linkedin } from "lucide-react"
import AnimatedFooterText from "./AnimatedFooterText"
import AnimatedCopyrightText from "./AnimatedCopyrightText"
import { useSettings } from "../contexts/SettingsContext"
import { useTheme } from "next-themes"

const Footer = () => {
  const { animationsEnabled } = useSettings()
  const { theme } = useTheme()

  return (
    <footer className={`relative py-16 px-4 sm:px-6 lg:px-8 ${theme === "dark" ? "bg-black" : "bg-white"}`}>
      {/* Background with animations */}
      {animationsEnabled && (
        <>
          <div
            className={`absolute inset-0 ${
              theme === "dark"
                ? "bg-gradient-to-b from-black via-gray-900/50 to-black"
                : "bg-gradient-to-b from-white via-gray-100/50 to-white"
            }`}
          ></div>
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
      <div
        className={`relative max-w-7xl mx-auto border rounded-2xl p-8 backdrop-blur-sm ${
          theme === "dark" ? "border-gray-700 bg-black/40 text-white" : "border-gray-300 bg-white/40 text-black"
        }`}
      >
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Logo and description */}
          <div className="md:col-span-1">
            <h3
              className={`text-2xl font-bold mb-4 ${theme === "dark" ? "text-white" : "text-black"}`}
              style={{
                textShadow: animationsEnabled
                  ? theme === "dark"
                    ? "0 0 10px rgba(255, 255, 255, 0.3), 0 0 20px rgba(255, 255, 255, 0.2)"
                    : "0 0 10px rgba(0, 0, 0, 0.3), 0 0 20px rgba(0, 0, 0, 0.2)"
                  : "none",
              }}
            >
              AURA
            </h3>
            <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              Produzido por estudantes.
            </p>
          </div>

          {/* PRODUTO */}
          <div>
            <h4
              className={`text-sm font-semibold mb-6 uppercase tracking-wider ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {animationsEnabled ? <AnimatedFooterText text="PRODUTO" delay={0} /> : "PRODUTO"}
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#"
                  className={`text-sm transition-colors ${
                    theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"
                  }`}
                >
                  Artigo
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className={`text-sm transition-colors ${
                    theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"
                  }`}
                >
                  Orientadores
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className={`text-sm transition-colors ${
                    theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"
                  }`}
                >
                  Home
                </Link>
              </li>
            </ul>
          </div>

          {/* CONTRIBUIDORES */}
          <div>
            <h4
              className={`text-sm font-semibold mb-6 uppercase tracking-wider ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {animationsEnabled ? <AnimatedFooterText text="CONTRIBUIDORES" delay={1000} /> : "CONTRIBUIDORES"}
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="https://lucas-lima.vercel.app/" target="_blank" rel="noopener noreferrer"
                  className={`text-sm transition-colors ${
                    theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"
                  }`}
                >
                  Lucas Lima
                </Link>
              </li>
              <li>
                <Link
                    href="https://caio-gabriel.vercel.app/" target="_blank" rel="noopener noreferrer"
                  className={`text-sm transition-colors ${
                    theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"
                  }`}
                >
                  Caio Gabriel
                </Link>
              </li>
              <li>
                <Link
                    href="https://mateustheobald.github.io/" target="_blank" rel="noopener noreferrer"
                  className={`text-sm transition-colors ${
                    theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"
                  }`}
                >
                  Matheus Theobald
                </Link>
              </li>
              <li>
                <Link
                    href="https://rhyan019.github.io/" target="_blank" rel="noopener noreferrer"
                  className={`text-sm transition-colors ${
                    theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"
                  }`}
                >
                  Rhyan Yassin
                </Link>
              </li>
            </ul>
          </div>

          {/* LEGAL */}
          <div>
            <h4
              className={`text-sm font-semibold mb-6 uppercase tracking-wider ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {animationsEnabled ? <AnimatedFooterText text="LEGAL" delay={2000} /> : "LEGAL"}
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="https://github.com/opzywl/aura/" target="_blank" rel="noopener noreferrer"
                  className={`text-sm transition-colors ${
                    theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"
                  }`}
                >
                  Código Fonte
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className={`text-sm transition-colors ${
                    theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"
                  }`}
                >
                  Terms
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className={`text-sm transition-colors ${
                    theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"
                  }`}
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  href="/feedback"
                  className={`text-sm transition-colors ${
                    theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"
                  }`}
                >
                  Feedback
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className={`border-t pt-8 ${theme === "dark" ? "border-gray-800" : "border-gray-200"}`}>
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* Social media icons */}
            <div className="flex space-x-4 mb-4 md:mb-0">
              <Link
                href="#"
                className={`transition-colors ${
                  theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"
                }`}
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </Link>
              <Link
                href="#"
                className={`transition-colors ${
                  theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"
                }`}
              >
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className={`transition-colors ${
                  theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"
                }`}
              >
                <Github className="h-5 w-5" />
              </Link>
            </div>

            {/* Copyright with animations */}
            <AnimatedCopyrightText />
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
