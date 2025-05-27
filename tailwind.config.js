import animatePlugin from "tailwindcss-animate"
import typographyPlugin from "@tailwindcss/typography"
import animationDelayPlugin from "tailwindcss-animation-delay"
import filtersPlugin from "tailwindcss-filters"

const config = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{ts,tsx,js,jsx,html}",
    "./public/index.html",
    "*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  safelist: [
    "text-balance",
    { pattern: /^animate-(fade-in|marquee|gradient|pulse|shimmer|spin|chart-glow|chart-pulse)$/ },
    { pattern: /^data-\[.*]/ },
    { pattern: /^home-(bg|text|border)-(dark|light)-(primary|secondary|card|white|gray|yellow|blue)(-\d+)?$/ },
    {
      pattern:
          /^home-(sidebar|header|stats|menu|card|metric|project|team|circular)-(gradient|light|item|hover|member|progress)(-light)?$/
    },
    { pattern: /^home-(upgrade|text|hover)-(btn|glow|glow-light)$/ },
    { pattern: /^hover:home-(bg|text)-(yellow|blue)-(400|50|600)(-10)?:hover$/ }
  ],
  theme: {
    fontFamily: {
      sans: [
        "Inter",
        "ui-sans-serif",
        "system-ui",
        "Apple Color Emoji",
        "Segoe UI Emoji",
        "Segoe UI Symbol",
        "Noto Color Emoji"
      ],
      mono: [
        "ui-monospace",
        "SFMono-Regular",
        "Menlo",
        "Monaco",
        "Consolas",
        "Liberation Mono",
        "Courier New",
        "monospace"
      ]
    },
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px"
      }
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },

        // Home Dashboard specific colors
        "home-dark": {
          primary: "#0a0a0a",
          secondary: "#1a1a1a",
          card: "#1e1e1e",
          border: "#2a2a2a"
        },
        "home-light": {
          primary: "#f8fafc",
          secondary: "#ffffff",
          card: "#ffffff",
          border: "#e2e8f0"
        },
        "home-text": {
          white: "#ffffff",
          "gray-900": "#1f2937",
          "gray-400": "#9ca3af",
          "gray-600": "#4b5563",
          "yellow-400": "#fbbf24",
          "blue-400": "#60a5fa",
          "blue-600": "#2563eb"
        }
      },
      borderRadius: {
        DEFAULT: "var(--radius)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "none" }
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" }
        },
        gradient: {
          to: { backgroundPosition: "var(--bg-size) 0" }
        },
        pulse: {
          "50%": { opacity: "0.5" }
        },
        shimmer: {
          "0%, 90%, to": { backgroundPosition: "calc(-100% - var(--shimmer-width)) 0" },
          "30%, 60%": { backgroundPosition: "calc(100% + var(--shimmer-width)) 0" }
        },
        spin: {
          to: { transform: "rotate(1turn)" }
        },
        "chart-glow": {
          "0%, 100%": { filter: "drop-shadow(0 0 5px rgba(59, 130, 246, 0.3))" },
          "50%": { filter: "drop-shadow(0 0 15px rgba(59, 130, 246, 0.6))" }
        },
        "chart-pulse": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.05)" }
        },
        "dot-pulse": {
          "0%, 100%": { r: "3", opacity: "1" },
          "50%": { r: "5", opacity: "0.7" }
        },
        "draw-path": {
          to: { strokeDashoffset: "0" }
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "home-shimmer": {
          "0%": { transform: "translateX(-100%) translateY(-100%) rotate(45deg)" },
          "100%": { transform: "translateX(100%) translateY(100%) rotate(45deg)" }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        marquee: "marquee 40s linear infinite",
        "fade-in": "fadeIn 1s var(--animation-delay,0s) ease forwards",
        gradient: "gradient 8s linear infinite",
        pulse: "pulse 2s cubic-bezier(.4,0,.6,1) infinite",
        shimmer: "shimmer 8s infinite",
        spin: "spin 1s linear infinite",
        "chart-glow": "chart-glow 3s ease-in-out infinite",
        "chart-pulse": "chart-pulse 2s ease-in-out infinite",
        "dot-pulse": "dot-pulse 2s ease-in-out infinite",
        "draw-path": "draw-path 2s ease-in-out forwards",
        "home-shimmer": "home-shimmer 1.5s ease-in-out infinite"
      },
      animationDelay: {
        100: "100ms",
        200: "200ms",
        300: "300ms",
        400: "400ms",
        500: "500ms",
        600: "600ms",
        700: "700ms",
        800: "800ms",
        900: "900ms"
      },
      width: {
        shimmer: "100px"
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "home-gradient-primary":
            "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)",
        "home-gradient-secondary":
            "linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #f472b6 100%)",
        "home-sidebar-dark":
            "linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 50%, #0a0a0a 100%)",
        "home-sidebar-light": "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
        "home-header-dark": "linear-gradient(90deg, #1a1a1a 0%, #0f0f0f 100%)",
        "home-header-light": "linear-gradient(90deg, #ffffff 0%, #f8fafc 100%)",
        "home-circular-progress":
            "conic-gradient(from 0deg, #3b82f6 0deg, #8b5cf6 120deg, #ec4899 240deg, #f59e0b 300deg, #3b82f6 360deg)"
      },
      boxShadow: {
        "home-glow": "0 10px 25px rgba(59, 130, 246, 0.15)",
        "home-glow-light": "0 10px 25px rgba(59, 130, 246, 0.1)",
        "home-card": "0 8px 25px rgba(59, 130, 246, 0.15)",
        "home-card-light": "0 8px 25px rgba(59, 130, 246, 0.1)",
        "home-upgrade": "0 8px 25px rgba(59, 130, 246, 0.4)"
      },
      dropShadow: {
        "home-chart": "0 0 8px rgba(59, 130, 246, 0.4)",
        "home-icon": "0 2px 4px rgba(59, 130, 246, 0.3)"
      },
      textShadow: {
        "home-glow": "0 0 10px rgba(59, 130, 246, 0.5)"
      },
      strokeDasharray: {
        "home-path": "1000"
      },
      strokeDashoffset: {
        "home-path": "1000"
      }
    }
  },
  plugins: [
    animatePlugin,
    typographyPlugin,
    animationDelayPlugin,
    filtersPlugin,
    // Plugin customizado para classes específicas do Home Dashboard
    ({ addUtilities, theme }) => {
      const homeUtilities = {
        // Background utilities
        ".home-bg-dark-primary": { backgroundColor: theme("colors.home-dark.primary") },
        ".home-bg-dark-secondary": { backgroundColor: theme("colors.home-dark.secondary") },
        ".home-bg-dark-card": {
          backgroundColor: theme("colors.home-dark.card"),
          border: `1px solid ${theme("colors.home-dark.border")}`
        },
        ".home-bg-light-primary": { backgroundColor: theme("colors.home-light.primary") },
        ".home-bg-light-secondary": { backgroundColor: theme("colors.home-light.secondary") },
        ".home-bg-light-card": {
          backgroundColor: theme("colors.home-light.card"),
          border: `1px solid ${theme("colors.home-light.border")}`
        },

        // Text utilities
        ".home-text-white": { color: theme("colors.home-text.white") },
        ".home-text-gray-900": { color: theme("colors.home-text.gray-900") },
        ".home-text-gray-400": { color: theme("colors.home-text.gray-400") },
        ".home-text-gray-600": { color: theme("colors.home-text.gray-600") },
        ".home-text-yellow-400": { color: theme("colors.home-text.yellow-400") },
        ".home-text-blue-400": { color: theme("colors.home-text.blue-400") },
        ".home-text-blue-600": { color: theme("colors.home-text.blue-600") },

        // Hover utilities
        ".hover\\:home-bg-yellow-400-10:hover": { backgroundColor: "rgba(251, 191, 36, 0.1)" },
        ".hover\\:home-bg-blue-50:hover": { backgroundColor: "#eff6ff" },
        ".hover\\:home-text-blue-400:hover": { color: theme("colors.home-text.blue-400") },
        ".hover\\:home-text-blue-600:hover": { color: theme("colors.home-text.blue-600") },

        // Text shadow utilities
        ".home-text-glow": { textShadow: theme("textShadow.home-glow") },

        // Animation utilities
        ".home-animated-path": {
          strokeDasharray: theme("strokeDasharray.home-path"),
          strokeDashoffset: theme("strokeDashoffset.home-path"),
          animation: "draw-path 2s ease-in-out forwards"
        }
      }

      addUtilities(homeUtilities)
    }
  ]
}

export default config
