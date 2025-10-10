"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"
import { useTheme } from "next-themes"
import SettingsModal from "./settings-modal"

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isMobile = useMobile()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { name: "Artigo", href: "#artigo" },
    { name: "Prompts", href: "#prompts" },
    { name: "Changelog", href: "#changelog" },
  ]

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/80 backdrop-blur-md py-2" : "bg-transparent py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-2xl font-bold text-foreground tracking-wider"
              style={{
                letterSpacing: "0.15em",
                textShadow:
                  theme === "dark"
                    ? "0 0 10px rgba(255, 255, 255, 0.5), 0 0 20px rgba(255, 255, 255, 0.3), 0 0 30px rgba(255, 255, 255, 0.2)"
                    : "0 0 10px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 0, 0, 0.3), 0 0 30px rgba(0, 0, 0, 0.2)",
              }}
            >
              AURA
            </motion.div>
          </Link>

          {/* Desktop Navigation - Grouped in single rounded container */}
          {!isMobile && (
            <nav className="hidden md:flex">
              <div className="flex space-x-6 px-6 py-2 border border-border rounded-full">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-foreground hover:text-muted-foreground transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </nav>
          )}

          {/* Right side buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <SettingsModal />
            <div className="px-4 py-2 bg-muted border border-border rounded-full">
              <span className="text-foreground">Login</span>
            </div>
            <Button
              onClick={toggleTheme}
              variant="outline"
              className="bg-primary-foreground text-primary hover:bg-muted border border-border rounded-full px-6 py-2 font-medium"
            >
              {theme === "dark" ? "light" : "dark"}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          {isMobile && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-foreground focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          )}
        </div>
      </div>

      {/* Separator line */}
      <div className="w-full h-px bg-border mt-2"></div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background/95 backdrop-blur-md"
          >
            <div className="px-4 pt-2 pb-6 space-y-4">
              <div className="flex flex-col space-y-2 px-4 py-3 border border-border rounded-lg">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block py-2 text-foreground hover:text-muted-foreground transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              <div className="flex items-center justify-between px-4 py-3 border border-border rounded-lg">
                <SettingsModal />
                <div className="px-4 py-2 bg-muted border border-border rounded-full">
                  <span className="text-foreground">Login</span>
                </div>
                <Button
                  onClick={toggleTheme}
                  variant="outline"
                  className="bg-primary-foreground text-primary hover:bg-muted border border-border rounded-full px-6 py-2 font-medium"
                >
                  {theme === "dark" ? "light" : "dark"}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

export default Header
