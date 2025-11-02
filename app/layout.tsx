import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { SettingsProvider } from "@/src/aura/features/view/lobby/contexts/SettingsContext"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
    title: "Aura",
    description: "Aura",
    icons: {
        icon: "/favicon.png",
        shortcut: "/favicon.png",
        apple: "/favicon.png",
    },
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="pt-BR" suppressHydrationWarning>
        <head>
            <Script id="disable-react-devtools" strategy="beforeInteractive">
                {`/* ...omitido... */`}
            </Script>
        </head>
        <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange={false}>
            <SettingsProvider>{children}</SettingsProvider>
        </ThemeProvider>
        </body>
        </html>
    )
}
