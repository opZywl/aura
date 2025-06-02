"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"

interface AnimatedFooterTextProps {
  text: string
  className?: string
  delay?: number
}

const AnimatedFooterText = ({ text, className = "", delay = 0 }: AnimatedFooterTextProps) => {
  const [currentIndex, setCurrentIndex] = useState(-1)
  const { theme } = useTheme()

  useEffect(() => {
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % (text.length + 5)) // +5 for pause between cycles
      }, 100) // 100ms delay between each letter

      return () => clearInterval(interval)
    }, delay)

    return () => clearTimeout(timeout)
  }, [text.length, delay])

  return (
    <span className={className}>
      {text.split("").map((char, index) => (
        <motion.span
          key={index}
          className="inline-block"
          animate={{
            opacity: index === currentIndex ? [0.4, 1, 0.4] : 0.7,
            textShadow:
              index === currentIndex
                ? theme === "dark"
                  ? [
                      "0 0 5px rgba(255, 255, 255, 0.3)",
                      "0 0 10px rgba(255, 255, 255, 0.6)",
                      "0 0 5px rgba(255, 255, 255, 0.3)",
                    ]
                  : ["0 0 5px rgba(0, 0, 0, 0.3)", "0 0 10px rgba(0, 0, 0, 0.6)", "0 0 5px rgba(0, 0, 0, 0.3)"]
                : "0 0 0px rgba(255, 255, 255, 0)",
          }}
          transition={{
            duration: 0.3,
            ease: "easeInOut",
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  )
}

export default AnimatedFooterText
