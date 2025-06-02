"use client"

import { useEffect, useRef } from "react"
import { useTheme } from "next-themes"

export default function LogoCarousel() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()

  const companies = [
    "ERA.svg",
    "LinharesDistribuidora.svg",
    "Pirelli.svg",
    "Unasp.svg",
    "Desktop.svg",
  ]

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let animationId: number
    let position = 0
    const speed = 0.1

    const animate = () => {
      position -= speed

      if (position <= -100) {
        position = 0
      }

      container.style.transform = `translateX(${position}%)`
      animationId = requestAnimationFrame(animate)
    }

    container.style.transform = "translateX(0%)"
    animate()

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
      <div className="w-full overflow-hidden mt-8">
        <div className="relative">
          <div
              className={`absolute left-0 top-0 w-20 h-full z-10 pointer-events-none ${
                  theme === "dark"
                      ? "bg-gradient-to-r from-black to-transparent"
                      : "bg-gradient-to-r from-white to-transparent"
              }`}
          />
          <div
              className={`absolute right-0 top-0 w-20 h-full z-10 pointer-events-none ${
                  theme === "dark"
                      ? "bg-gradient-to-l from-black to-transparent"
                      : "bg-gradient-to-l from-white to-transparent"
              }`}
          />
          <div
              ref={containerRef}
              className="flex items-center space-x-12 py-4"
              style={{
                width: "200%",
                transform: "translateX(0%)",
              }}
          >
            {companies.map((company, idx) => (
                <div
                    key={`first-${idx}`}
                    className="flex-shrink-0 flex items-center justify-center"
                    style={{ minWidth: "120px", height: "60px", border: "1px solid transparent" /* só pra debug */ }}
                >
                  <img
                      src={`/carrossel/${company}`}
                      alt={company.replace(".svg", "")}
                      className={`max-w-full max-h-full object-contain opacity-60 hover:opacity-100 transition-opacity duration-300 ${
                          theme === "dark" ? "filter brightness-0 invert" : ""
                      }`}
                      style={{ width: "auto", height: "auto", maxWidth: "120px", maxHeight: "60px" }}
                      onError={(e) => {
                        console.error(`Falha ao carregar: /carrossel/${company}`)
                        e.currentTarget.style.display = "none"
                      }}
                  />
                </div>
            ))}
            {companies.map((company, idx) => (
                <div
                    key={`second-${idx}`}
                    className="flex-shrink-0 flex items-center justify-center"
                    style={{ minWidth: "120px", height: "60px", border: "1px solid transparent" }}
                >
                  <img
                      src={`/carrossel/${company}`}
                      alt={company.replace(".svg", "")}
                      className={`max-w-full max-h-full object-contain opacity-60 hover:opacity-100 transition-opacity duration-300 ${
                          theme === "dark" ? "filter brightness-0 invert" : ""
                      }`}
                      style={{ width: "auto", height: "auto", maxWidth: "120px", maxHeight: "60px" }}
                      onError={(e) => {
                        console.error(`Falha ao carregar: /carrossel/${company}`)
                        e.currentTarget.style.display = "none"
                      }}
                  />
                </div>
            ))}
          </div>
        </div>
      </div>
  )
}
