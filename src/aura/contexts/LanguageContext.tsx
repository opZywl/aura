"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { ptBR } from "../languages/pt-br"
import { enUS } from "../languages/en-us"

type Language = "pt-BR" | "en-US"

interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

interface LanguageProviderProps {
  children: ReactNode
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>("pt-BR")
  const [translations, setTranslations] = useState<Record<string, any>>(ptBR)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    try {
      const savedLanguage = localStorage.getItem("language") as Language
      if (savedLanguage === "pt-BR" || savedLanguage === "en-US") {
        setLanguage(savedLanguage)
      }
    } catch (error) {
      console.error("Error loading language from localStorage:", error)
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem("language", language)
        setTranslations(language === "pt-BR" ? ptBR : enUS)
      } catch (error) {
        console.error("Error saving language to localStorage:", error)
      }
    }
  }, [language, isLoaded])

  const t = (key: string): string => {
    const keys = key.split(".")
    let value: any = translations

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k]
      } else {
        console.warn(`Translation key not found: ${key}`)
        return key
      }
    }

    if (typeof value === "string") {
      return value
    }

    console.warn(`Translation value is not a string for key: ${key}`)
    return key
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}
