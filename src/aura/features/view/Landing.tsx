"use client"

import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LandingProps {
    onContinue: () => void
}

export default function Landing({ onContinue }: LandingProps) {
    return (
        <div className="relative min-h-screen w-full overflow-hidden">
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: "url('/grad1.svg')" }}
            />
            <div className="absolute inset-0 bg-black/60" />

            <a
                href="https://github.com/"
                target="_blank"
                rel="noreferrer"
                className="absolute left-6 top-6 z-20 text-xs font-semibold uppercase tracking-[0.6em] text-white/80 transition hover:text-white"
            >
                Chatbot com sistema integravo ♾
            </a>

            <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4">
                <div className="flex flex-col items-center justify-center gap-6 rounded-3xl border border-white/10 bg-white/5 p-12 text-center shadow-2xl backdrop-blur-md">
                    <span className="text-[0.65rem] uppercase tracking-[0.65em] text-white/60">
                        Produzido por autodidatas.
                    </span>

                    <Button
                        size="lg"
                        className="group flex items-center gap-3 rounded-full border border-white/20 bg-white/20 px-10 py-6 text-lg font-semibold uppercase tracking-[0.6em] text-white shadow-lg backdrop-blur-lg transition hover:scale-105 hover:border-white/40 hover:bg-white/30"
                        onClick={onContinue}
                    >
                        Vamos lá!
                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>

                    <span className="text-xs uppercase tracking-[0.5em] text-white/50">
                        Pronto para automatizar.
                    </span>
                </div>
            </div>
        </div>
    )
}
