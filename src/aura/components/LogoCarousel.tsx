"use client"

import { useEffect, useRef } from "react"
import { useSettings } from "../contexts/AnimationsSettingsContext"
import { useTheme } from "next-themes"

const logos = [
  { src: "ERA.svg", alt: "ERA" },
  { src: "LinharesDistribuidora.svg", alt: "LINHARES" },
  { src: "Unasp.svg", alt: "UNASP" },
  { src: "Pirelli.svg", alt: "PIRELLI" },
  { src: "Desktop.svg", alt: "DESKTOP" },
  { src: "Microsoft.svg", alt: "MICROSOFT" },
  { src: "Google.svg", alt: "GOOGLE" },
]

export default function LogoCarousel() {
  const { animationsEnabled } = useSettings()
  const { theme } = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>()
  const positionRef = useRef(0)

  useEffect(() => {
    if (!animationsEnabled || !containerRef.current) return

    const speed = 1

    const animate = () => {
      if (!containerRef.current) {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
        }
        return
      }

      const container = containerRef.current
      positionRef.current -= speed
      container.style.transform = `translateX(${positionRef.current}px)`

      if (container.scrollWidth > 0 && positionRef.current <= -container.scrollWidth / 2) {
        positionRef.current = 0
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [animationsEnabled])

  return (
      <div className="w-full overflow-hidden py-8">
        <div
            ref={containerRef}
            className="flex items-center gap-8 sm:gap-12 md:gap-16"
            style={{ width: "fit-content", transform: "translateX(0)" }}
        >
          {[...logos, ...logos].map((logo, idx) => (
              <div
                  key={idx}
                  className="flex-shrink-0 flex items-center justify-center"
                  style={{
                    minWidth: "120px",
                    height: "60px",
                  }}
              >
                <img
                    src={`/carrossel/${logo.src}`}
                    alt={logo.alt}
                    className={`
                max-w-full max-h-full object-contain transition-opacity duration-300
                opacity-80 hover:opacity-100
                filter brightness-0
                ${theme === "dark" ? "invert" : ""}
              `}
                    style={{
                      width: "auto",
                      height: "auto",
                      maxWidth: "120px",
                      maxHeight: "60px",
                    }}
                    onError={(e) => {
                      console.error(`Falha ao carregar: /carrossel/${logo.src}`)
                      e.currentTarget.style.display = "none"
                    }}
                />
              </div>
          ))}
        </div>
      </div>
  )
}
