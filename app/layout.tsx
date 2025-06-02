import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { SettingsProvider } from "@/contexts/settings-context"
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
          {`
  // Desabilitar React DevTools
  if (typeof window !== 'undefined') {
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
      isDisabled: true,
      supportsFiber: true,
      inject: () => {},
      onCommitFiberRoot: () => {},
      onCommitFiberUnmount: () => {},
    };
    
    // Desabilitar Next.js DevTools e indicadores
    window.__NEXT_DATA__ = window.__NEXT_DATA__ || {};
    
    // Remover qualquer indicador visual do Next.js
    const removeNextIndicators = () => {
      const indicators = document.querySelectorAll('[data-nextjs-toast], [data-nextjs-dialog], .nextjs-portal, .__next-dev-overlay, [id*="__next"], [class*="__next"]');
      indicators.forEach(el => {
        if (el && el.style) {
          el.style.display = 'none !important';
          el.style.visibility = 'hidden !important';
          el.style.opacity = '0 !important';
        }
      });
    };
    
    // Executar imediatamente e em intervalos
    removeNextIndicators();
    setInterval(removeNextIndicators, 100);
    
    // Observer para remover elementos que aparecem dinamicamente
    if (typeof MutationObserver !== 'undefined') {
      const observer = new MutationObserver(removeNextIndicators);
      document.addEventListener('DOMContentLoaded', () => {
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
      });
    }
  }
`}
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
