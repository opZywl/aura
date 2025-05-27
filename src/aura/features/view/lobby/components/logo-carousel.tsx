"use client"

import { useEffect, useRef } from "react"
import { useTheme } from "next-themes"

const logos = [
  { path: '/carrossel/Unasp.svg', alt: 'Unasp' },
  { path: '/carrossel/ERA.svg', alt: 'ERA' },
  { path: '/carrossel/Pirelli.svg', alt: 'Pirelli' },
  { path: '/carrossel/Desktop.svg', alt: 'Desktop' },
  { path: '/carrossel/LinharesDistribuidora.svg', alt: 'Linhares Distribuidora' },
];

export default function LogoCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  const displayLogos = logos;

  const baseScrollSet = [];
  if (displayLogos.length > 0) {
    for (let i = 0; i < 3; i++) {
      baseScrollSet.push(...displayLogos);
    }
  }

  const logosToRender = baseScrollSet.length > 0 ? [...baseScrollSet, ...baseScrollSet] : [];

  useEffect(() => {
    if (logosToRender.length === 0 || !containerRef.current) {
      return;
    }

    const container = containerRef.current;
    let animationId: number;
    let position = 0;
    const speed = 0.07;

    const animate = () => {
      position -= speed;

      if (position <= -50) {
        position += 50;
      }

      container.style.transform = `translateX(${position}%)`;
      animationId = requestAnimationFrame(animate);
    };

    const timeoutId = setTimeout(animate, 100);

    return () => {
      clearTimeout(timeoutId);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [logosToRender]);

  if (logosToRender.length === 0) {
    return null;
  }

  return (
      <div className="w-full overflow-hidden mt-8">
        <div className="relative">
          <div
              className={`absolute left-0 top-0 w-16 h-full z-10 pointer-events-none ${
                  theme === "dark"
                      ? "bg-gradient-to-r from-black to-transparent"
                      : "bg-gradient-to-r from-white to-transparent"
              }`}
          ></div>
          <div
              className={`absolute right-0 top-0 w-16 h-full z-10 pointer-events-none ${
                  theme === "dark"
                      ? "bg-gradient-to-l from-black to-transparent"
                      : "bg-gradient-to-l from-white to-transparent"
              }`}
          ></div>

          <div
              ref={containerRef}
              className="flex items-center space-x-6 py-4"
              style={{ width: "200%" }}
          >
            {logosToRender.map((logo, index) => (
                <div
                    key={`${logo.path}-${index}`}
                    className="flex-shrink-0 flex justify-center items-center opacity-70 hover:opacity-100 transition-opacity duration-300"
                    style={{
                      minWidth: "90px",
                      height: "32px"
                    }}
                >
                  <img
                      src={logo.path}
                      alt={logo.alt}
                      className="max-h-full w-auto object-contain"
                      style={
                        theme === "dark"
                            ? { filter: "grayscale(100%) brightness(0) invert(1)" }
                            : { filter: "grayscale(100%) brightness(0)" }
                      }
                  />
                </div>
            ))}
          </div>
        </div>
      </div>
  );
}