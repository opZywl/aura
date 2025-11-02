import { cn } from "@/lib/utils"

interface LoadingScreenProps {
    text?: string
    className?: string
}

export function LoadingScreen({ text = "LOADING..", className }: LoadingScreenProps) {
    return (
        <div className={cn("relative flex min-h-screen w-full items-center justify-center overflow-hidden", className)}>
            <div className="absolute inset-0 bg-[url('/grad2.svg')] bg-cover bg-center transition-all duration-500 dark:bg-[url('/grad1.svg')]" />
            <div className="absolute inset-0 bg-white/60 transition-colors duration-500 dark:bg-black/70" />
            <div className="relative z-10 flex flex-col items-center gap-4 text-center">
                <span className="text-xs font-medium uppercase tracking-[0.55em] text-black/60 dark:text-white/60">
                    Sistema Aura
                </span>
                <span className="text-3xl font-semibold uppercase tracking-[0.6em] text-black/90 dark:text-white">
                    {text}
                </span>
                <div className="mt-2 h-1 w-32 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                    <div className="h-full w-[200%] -translate-x-full animate-[loading-bar_1.6s_ease-in-out_infinite] bg-black/40 dark:bg-white/60" />
                </div>
            </div>
        </div>
    )
}

export default LoadingScreen
