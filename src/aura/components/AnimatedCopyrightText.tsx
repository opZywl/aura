"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useSettings } from "../contexts/SettingsContext"
import { useTheme } from "next-themes"

const AnimatedCopyrightText = () => {
  const [currentIndex, setCurrentIndex] = useState(-1)
  const { animationsEnabled } = useSettings()
  const { theme } = useTheme()

  const text = "Copyright © 2025 Aura, Inc. All Rights Reserved."
  const auraStartIndex = text.indexOf("Aura")
  const auraEndIndex = auraStartIndex + 4

  useEffect(() => {
    if (!animationsEnabled) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % (text.length + 10)) // +10 for pause between cycles
    }, 150) // 150ms delay between each letter

    return () => clearInterval(interval)
  }, [text.length, animationsEnabled])

  if (!animationsEnabled) {
    return (
      <div className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
        Copyright © 2025 <span className="text-blue-400">Aura</span>, Inc. All Rights Reserved.
      </div>
    )
  }

  return (
    <div className="text-sm">
      {text.split("").map((char, index) => {
        const isAura = index >= auraStartIndex && index < auraEndIndex
        const isActive = index === currentIndex

        return (
          <motion.span
            key={index}
            className="inline-block"
            animate={{
              opacity: isActive ? [0.4, 1, 0.4] : isAura ? 1 : 0.7,
              textShadow: isActive
                ? [
                    `0 0 5px ${theme === "dark" ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)"}`,
                    `0 0 10px ${theme === "dark" ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)"}`,
                    `0 0 5px ${theme === "dark" ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)"}`,
                  ]
                : isAura
                  ? "0 0 8px rgba(96, 165, 250, 0.6)"
                  : `0 0 0px ${theme === "dark" ? "rgba(255, 255, 255, 0)" : "rgba(0, 0, 0, 0)"}`,
              color: isAura ? "#60a5fa" : theme === "dark" ? "#9ca3af" : "#6b7280",
            }}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
            }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        )
      })}
    </div>
  )
}

export default AnimatedCopyrightText
