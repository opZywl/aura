"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme()

    const toggleTheme = () => {
        setTheme(theme === "light" ? "dark" : "light")
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="relative flex items-center space-x-2 px-3 py-2 rounded-full border border-gray-300 dark:border-gray-600 bg-white/60 dark:bg-black/20 backdrop-blur-lg transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-105"
            aria-label="Toggle theme"
        >
            <Sun
                className={`h-4 w-4 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                    theme === "dark"
                        ? "text-muted-foreground scale-75 rotate-12 opacity-50"
                        : "text-foreground scale-100 rotate-0 opacity-100"
                }`}
            />
            <div className="w-px h-4 bg-gray-300 dark:bg-gray-600" />
            <Moon
                className={`h-4 w-4 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                    theme === "light"
                        ? "text-muted-foreground scale-75 rotate-12 opacity-50"
                        : "text-foreground scale-100 rotate-0 opacity-100"
                }`}
            />
        </Button>
    )
}
