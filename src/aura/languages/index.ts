"use client"

import { createContext, useContext } from "react"

// Tipos
export type Language = "pt-BR" | "en-US"

export interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

// Contexto
export const LanguageContext = createContext<LanguageContextType>({
  language: "pt-BR",
  setLanguage: () => {},
  t: (key: string) => key,
})

// Hook para usar o idioma
export const useLanguage = () => useContext(LanguageContext)

// Traduções
import { ptBR } from "./pt-br"
import { enUS } from "./en-us"

export const translations = {
  "pt-BR": ptBR,
  "en-US": enUS,
}

// Função para obter tradução
export const getTranslation = (language: Language, key: string): string => {
  const keys = key.split(".")
  let translation: any = translations[language]

  for (const k of keys) {
    if (!translation[k]) {
      // Fallback para pt-BR se a tradução não existir
      if (language !== "pt-BR") {
        return getTranslation("pt-BR", key)
      }
      return key
    }
    translation = translation[k]
  }

  return translation
}

// Função para salvar idioma no localStorage
export const saveLanguage = (language: Language): void => {
  try {
    localStorage.setItem("aura-language", language)
  } catch (error) {
    console.error("Error saving language to localStorage:", error)
  }
}

// Função para obter idioma do localStorage
export const getSavedLanguage = (): Language => {
  try {
    const savedLanguage = localStorage.getItem("aura-language")
    return (savedLanguage as Language) || "pt-BR"
  } catch (error) {
    console.error("Error getting language from localStorage:", error)
    return "pt-BR"
  }
}
