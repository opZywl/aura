"use client"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

interface GradientOption {
    id: string
    name: string
    preview: string
    gradient: string
}

const gradients: GradientOption[] = [
    {
        id: "silver",
        name: "Silver Chrome",
        preview: "/gradients/frame1.svg",
        gradient: "url('/grad1.svg')",
    },
    {
        id: "copper",
        name: "Copper Bronze",
        preview: "/gradients/frame2.svg",
        gradient: "url('/grad2.svg')",
    },
    {
        id: "rainbow",
        name: "Rainbow Iridescent",
        preview: "/gradients/frame3.svg",
        gradient: "url('/grad3.svg')",
    },
    {
        id: "purple",
        name: "Deep Purple",
        preview: "/gradients/frame4.svg",
        gradient: "url('/grad4.svg')",
    },
]

interface GradientSelectorProps {
    isOpen: boolean
    onClose: () => void
    currentGradient: string
    onSelectGradient: (gradient: string) => void
}

export default ({
                    isOpen,
                    onClose,
                    currentGradient,
                    onSelectGradient,
                }: GradientSelectorProps) => (
    <AnimatePresence>
        {isOpen && (
            <>
                <motion.div
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    exit={{opacity: 0}}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    onClick={onClose}
                />
                <motion.div
                    initial={{opacity: 0, scale: 0.9, y: 20}}
                    animate={{opacity: 1, scale: 1, y: 0}}
                    exit={{opacity: 0, scale: 0.9, y: 20}}
                    className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
                >
                    <div className="bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white font-modernmono">Selecionar Gradiente</h3>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-400"/>
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {gradients.map((gradient) => (
                                <motion.button
                                    key={gradient.id}
                                    onClick={() => {
                                        onSelectGradient(gradient.gradient)
                                        onClose()
                                    }}
                                    className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                                        currentGradient === gradient.gradient
                                            ? "border-white/50 bg-white/5"
                                            : "border-white/10 hover:border-white/30 hover:bg-white/5"
                                    }`}
                                    whileHover={{scale: 1.05}}
                                    whileTap={{scale: 0.95}}
                                >
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-16 h-16 rounded-full overflow-hidden border border-white/20">
                                            <img
                                                src={gradient.preview || "/placeholder.svg"}
                                                alt={gradient.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <span
                                            className="text-sm text-gray-300 font-modernmono text-center">{gradient.name}</span>
                                    </div>
                                    {currentGradient === gradient.gradient && (
                                        <motion.div
                                            layoutId="selected"
                                            className="absolute inset-0 border-2 border-white/50 rounded-xl"
                                            initial={false}
                                            transition={{type: "spring", stiffness: 300, damping: 30}}
                                        />
                                    )}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </>
        )}
    </AnimatePresence>
)
