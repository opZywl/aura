"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useSettings } from "../contexts/AnimationsSettingsContext"

interface AnimatedTextProps {
  text: string
  className?: string
}

const AnimatedText = ({ text, className = "" }: AnimatedTextProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const { fadeEffects } = useSettings()

  useEffect(() => {
    if (!fadeEffects) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % text.length)
    }, 150) // 150ms delay between each letter

    return () => clearInterval(interval)
  }, [text.length, fadeEffects])

  if (!fadeEffects) {
    return <span className={className}>{text}</span>
  }

  return (
    <span className={className}>
      {text.split("").map((char, index) => (
        <motion.span
          key={index}
          className="inline-block"
          animate={{
            textShadow:
              index === currentIndex
                ? [
                    "0 0 5px rgba(255, 255, 255, 0.8)",
                    "0 0 10px rgba(255, 255, 255, 1)",
                    "0 0 15px rgba(255, 255, 255, 0.8)",
                    "0 0 5px rgba(255, 255, 255, 0.4)",
                  ]
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

export default AnimatedText
