"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Code, Shield, AlertTriangle, FileText, Users, Globe } from "lucide-react"
import Link from "next/link"
import { useTheme } from "next-themes"

export default function TermsPage() {
  const { theme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // Detecta o tema atual (incluindo system)
  const currentTheme = theme === "system" ? systemTheme : theme
  const isDark = currentTheme === "dark"

  return (
    <div
      className={`min-h-screen transition-all duration-500 relative ${
        isDark
          ? "bg-gradient-to-br from-gray-900 via-black to-gray-900 text-gray-100"
          : "bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900"
      }`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className={`w-full h-full ${isDark ? "bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),transparent)]" : "bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent)]"}`}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16 text-center"
        >
          <Link href="/">
            <Button
              variant="outline"
              className={`mb-8 transition-all duration-300 ${
                isDark
                  ? "border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500"
                  : "border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400"
              }`}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Início
            </Button>
          </Link>

          <motion.h1
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={`text-6xl md:text-7xl font-black mb-6 ${isDark ? "text-white" : "text-gray-900"}`}
            style={{
              textShadow: isDark ? "0 0 30px rgba(192, 192, 192, 0.3)" : "0 0 30px rgba(0, 0, 0, 0.1)",
              letterSpacing: "-0.02em",
            }}
          >
            Aura Terms of Service
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className={`inline-flex items-center px-6 py-3 rounded-full ${
              isDark
                ? "bg-gradient-to-r from-green-900/40 to-blue-900/40 border border-green-500/30"
                : "bg-gradient-to-r from-green-100 to-blue-100 border border-green-400/30"
            }`}
          >
            <Code className={`w-5 h-5 mr-2 ${isDark ? "text-green-400" : "text-green-600"}`} />
            <span className={`text-lg font-semibold ${isDark ? "text-green-300" : "text-green-700"}`}>
              100% Open Source Project
            </span>
          </motion.div>
        </motion.div>

        {/* Content Sections */}
        <div className="space-y-16">
          {/* Section 1 - Terms */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className={`p-8 rounded-3xl ${
              isDark
                ? "bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50"
                : "bg-gradient-to-br from-white/80 to-gray-50/80 border border-gray-200/50"
            } backdrop-blur-sm`}
          >
            <div className="flex items-center mb-6">
              <div className={`p-3 rounded-xl mr-4 ${isDark ? "bg-blue-900/50" : "bg-blue-100"}`}>
                <FileText className={`w-8 h-8 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
              </div>
              <h2 className={`text-4xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>1. Terms</h2>
            </div>
            <p className={`text-lg leading-relaxed ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              By accessing this site, you agree to be bound by these Terms and Conditions of Use of the site, all
              applicable laws and regulations, and agree that you are responsible for compliance with any applicable
              local laws. If you do not agree with any of these terms, you are prohibited from using or accessing this
              site. The materials contained on this site are protected by applicable copyright and trademark laws.
            </p>
            <div className={`mt-6 p-4 rounded-xl ${isDark ? "bg-blue-900/20" : "bg-blue-50"}`}>
              <p className={`text-sm ${isDark ? "text-blue-300" : "text-blue-700"}`}>
                <strong>Note:</strong> This is an academic open-source project. All source code is available on GitHub
                for transparency and community contribution.
              </p>
            </div>
          </motion.section>

          {/* Section 2 - Disclaimer */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className={`p-8 rounded-3xl ${
              isDark
                ? "bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50"
                : "bg-gradient-to-br from-white/80 to-gray-50/80 border border-gray-200/50"
            } backdrop-blur-sm`}
          >
            <div className="flex items-center mb-6">
              <div className={`p-3 rounded-xl mr-4 ${isDark ? "bg-yellow-900/50" : "bg-yellow-100"}`}>
                <AlertTriangle className={`w-8 h-8 ${isDark ? "text-yellow-400" : "text-yellow-600"}`} />
              </div>
              <h2 className={`text-4xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>2. Disclaimer</h2>
            </div>
            <p className={`text-lg leading-relaxed mb-4 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              The materials on the Aura site are provided "as is". We do not offer warranties, express or implied, and
              hereby deny and disclaim all other warranties, including, without limitation, implied warranties or
              conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual
              property or other violation of rights.
            </p>
            <p className={`text-lg leading-relaxed ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              Furthermore, Aura does not warrant or make any representations concerning the accuracy, likely results, or
              reliability of the use of the materials on its Internet site or otherwise relating to such materials or on
              any sites linked to this site.
            </p>
          </motion.section>

          {/* Section 3 - Limitations */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className={`p-8 rounded-3xl ${
              isDark
                ? "bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50"
                : "bg-gradient-to-br from-white/80 to-gray-50/80 border border-gray-200/50"
            } backdrop-blur-sm`}
          >
            <div className="flex items-center mb-6">
              <div className={`p-3 rounded-xl mr-4 ${isDark ? "bg-red-900/50" : "bg-red-100"}`}>
                <Shield className={`w-8 h-8 ${isDark ? "text-red-400" : "text-red-600"}`} />
              </div>
              <h2 className={`text-4xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>3. Limitations</h2>
            </div>
            <p className={`text-lg leading-relaxed ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              In no event shall Aura and its suppliers be liable for any damages (including, without limitation, damages
              for loss of data or profit, or due to business interruption) arising out of the use or inability to use
              the materials on the Aura Internet site, even if Aura or an Aura authorized representative has been
              notified orally or in writing of the possibility of such damage. Because some jurisdictions do not allow
              limitations on implied warranties, or limitations of liability for consequential or incidental damages,
              these limitations may not apply to you.
            </p>
          </motion.section>

          {/* Section 4 - Revisions and Errata */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className={`p-8 rounded-3xl ${
              isDark
                ? "bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50"
                : "bg-gradient-to-br from-white/80 to-gray-50/80 border border-gray-200/50"
            } backdrop-blur-sm`}
          >
            <div className="flex items-center mb-6">
              <div className={`p-3 rounded-xl mr-4 ${isDark ? "bg-purple-900/50" : "bg-purple-100"}`}>
                <FileText className={`w-8 h-8 ${isDark ? "text-purple-400" : "text-purple-600"}`} />
              </div>
              <h2 className={`text-4xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                4. Revisions and Errata
              </h2>
            </div>
            <p className={`text-lg leading-relaxed ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              The materials displayed on the Aura site may include technical, typographical, or photographic errors.
              Aura does not warrant that any of the materials on its site are accurate, complete, or current. Aura may
              make changes to the materials contained on its site at any time without notice. However, Aura does not
              make any commitment to update the materials.
            </p>
          </motion.section>

          {/* Section 5 - Links */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            className={`p-8 rounded-3xl ${
              isDark
                ? "bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50"
                : "bg-gradient-to-br from-white/80 to-gray-50/80 border border-gray-200/50"
            } backdrop-blur-sm`}
          >
            <div className="flex items-center mb-6">
              <div className={`p-3 rounded-xl mr-4 ${isDark ? "bg-green-900/50" : "bg-green-100"}`}>
                <Globe className={`w-8 h-8 ${isDark ? "text-green-400" : "text-green-600"}`} />
              </div>
              <h2 className={`text-4xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>5. Links</h2>
            </div>
            <p className={`text-lg leading-relaxed ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              Aura has not reviewed all of the sites linked to its Internet site and is not responsible for the contents
              of any such linked site. The inclusion of any link does not imply endorsement by Aura of the site. Use of
              any such linked website is at the user's own risk.
            </p>
          </motion.section>

          {/* Section 6 - Modifications */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.6 }}
            className={`p-8 rounded-3xl ${
              isDark
                ? "bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50"
                : "bg-gradient-to-br from-white/80 to-gray-50/80 border border-gray-200/50"
            } backdrop-blur-sm`}
          >
            <div className="flex items-center mb-6">
              <div className={`p-3 rounded-xl mr-4 ${isDark ? "bg-indigo-900/50" : "bg-indigo-100"}`}>
                <Users className={`w-8 h-8 ${isDark ? "text-indigo-400" : "text-indigo-600"}`} />
              </div>
              <h2 className={`text-4xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                6. Modifications to the Site's Terms of Use
              </h2>
            </div>
            <p className={`text-lg leading-relaxed ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              We may revise these terms of use for our site at any time without notice. By using this site, you agree to
              be bound by the then current version of these Terms and Conditions of Use. All modifications will be
              documented in our GitHub repository for transparency.
            </p>
            <div className={`mt-6 p-4 rounded-xl ${isDark ? "bg-indigo-900/20" : "bg-indigo-50"}`}>
              <p className={`text-sm ${isDark ? "text-indigo-300" : "text-indigo-700"}`}>
                <strong>GitHub Repository:</strong>{" "}
                <a
                  href="https://github.com/opzywl/aura"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:no-underline"
                >
                  https://github.com/opzywl/aura
                </a>
              </p>
            </div>
          </motion.section>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.8 }}
          className="mt-20 pt-12 border-t border-gray-600 text-center"
        >
          <p className={`text-sm mb-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Última atualização: {new Date().toLocaleDateString("pt-BR")}
          </p>
          <Link href="/">
            <Button
              className={`${
                isDark
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  : "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              } text-white px-10 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 transform hover:scale-105`}
            >
              Voltar ao Início
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
