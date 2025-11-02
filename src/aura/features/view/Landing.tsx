"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";
import LoadingScreen from "@/components/ui/loading-screen";

interface LandingProps {
    onContinue: () => void;
}

export default ({onContinue}: LandingProps) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleContinue = async () => {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setIsLoading(false);
        onContinue();
    };

    if (isLoading) {
        return <LoadingScreen />;
    }

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
                className="absolute top-5 left-5 z-50 flex items-center justify-start gap-2 font-modernmono text-zinc-400 hover:text-white/80 transition-colors"
            >
                Chatbot com Sistema Integrado
            </a>

            <div className="relative z-40 flex min-h-screen flex-col items-center justify-center px-4 gap-3">
                <div className="flex items-center gap-1 w-full max-w-[220px] sm:max-w-[210px]">
                    <input
                        type="text"
                        placeholder="Vamos Lá!"
                        className="flex h-7 w-full rounded-md border border-zinc-200/20 px-2 py-0.5 text-xs shadow-sm transition-colors
               placeholder:text-white/60 bg-zinc-800/20 backdrop-blur-xl backdrop-saturate-200 text-white
               outline-none disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={handleContinue}
                        readOnly
                    />
                    <button
                        onClick={handleContinue}
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-200/20 bg-zinc-800/20
               backdrop-blur-xl backdrop-saturate-200 text-white hover:bg-zinc-800/30 transition-colors"
                    >
                        <ArrowRight className="h-3 w-3" />
                    </button>
                </div>

                <span className="text-[0.6rem] text-white/90 font-['modernmono']">
          Feito por estudantes
        </span>
            </div>
        </div>
    );
}
