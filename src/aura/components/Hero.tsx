import React from 'react';
import Companies from './Companies';

const Hero: React.FC = () => {
    return (
        <section id="hero" className="relative mx-auto mt-44 max-w-7xl px-6 text-center md:px-8">
            <div className="backdrop-filter-[12px] animate-fade-in group inline-flex h-7 -translate-y-4 items-center justify-between gap-1 rounded-full border border-white/5 bg-white/10 px-3 text-xs text-white opacity-0 transition-all ease-in hover:cursor-pointer hover:bg-white/20 dark:text-black">
                <p
                    style={{ '--shimmer-width': '100px' } as React.CSSProperties}
                    className="mx-auto max-w-md text-neutral-600/50 dark:text-white/80 animate-shimmer bg-clip-text bg-no-repeat [background-position:0_0] [background-size:var(--shimmer-width)_100%] [transition:background-position_1s_cubic-bezier(.6,.6,0,1)_infinite] bg-gradient-to-r from-neutral-100 via-black/80 via-50% to-neutral-100 dark:from-neutral-900 dark:via-white/80 dark:to-neutral-900 inline-flex items-center justify-center"
                >
                    <a href="/login-quandotivepronto"><span>✨ 100% experimental – válido até o final do semestre!</span></a>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5">
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                    </svg>
                </p>
            </div>
            <h1 className="animate-fade-in -translate-y-4 text-balance bg-gradient-to-br from-black from-30% to-black/40 bg-clip-text py-6 text-4xl font-medium leading-none tracking-tighter text-transparent opacity-0 [--animation-delay:200ms] sm:text-5xl md:text-6xl lg:text-7xl dark:from-white dark:to-white/80">
                 Habilidades de Conversação Hoje!<br className="hidden md:block" />
            </h1>
            <p className="animate-fade-in mb-6 -translate-y-4 text-balance text-lg tracking-tight text-gray-300 opacity-0 [--animation-delay:400ms] md:text-xl">
               Junte-se ao melhor chatbot do planeta 1% AI!<br className="hidden md:block" />
            </p>
            <div className="mt-12">
                <Companies />
            </div>
        </section>
    );
};

export default Hero;