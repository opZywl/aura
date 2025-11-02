"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, RotateCcw, Globe, Eye, Mouse, Accessibility, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    useSettings,
    type AnimationType,
    type MouseEffectType,
} from "@/src/aura/contexts/AnimationsSettingsContext"

// ===== Ponte de tipo local (somente neste arquivo) =====
type BaseSettings = ReturnType<typeof useSettings>
type LocalSettings = BaseSettings & {
    accessibilityMode?: boolean
    setAccessibilityMode?: (v: boolean) => void
    reducedMotion?: boolean
    setReducedMotion?: (v: boolean) => void
    highContrast?: boolean
    setHighContrast?: (v: boolean) => void
    glowEffects?: boolean
    setGlowEffects?: (v: boolean) => void
    fadeEffects?: boolean
    setFadeEffects?: (v: boolean) => void
    particleIntensity?: number
    setParticleIntensity?: (v: number) => void
    performanceMode?: boolean
    setPerformanceMode?: (v: boolean) => void
    currentMixAnimation?: string
    currentMixMouseEffect?: string
}
interface SettingsModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {

    const [activeTab, setActiveTab] = useState("general")
    // usa o hook normalmente, mas com o tipo ampliado localmente
    const settings = useSettings() as LocalSettings

    // fallbacks locais caso o provider não exponha ainda esses campos
    const [accLocal, setAccLocal] = useState(false)
    const [redLocal, setRedLocal] = useState(false)
    const [hcLocal, setHcLocal] = useState(false)
    const [glowLocal, setGlowLocal] = useState(true)
    const [fadeLocal, setFadeLocal] = useState(true)
    const [intensityLocal, setIntensityLocal] = useState(50)
    const [perfLocal, setPerfLocal] = useState(false)

    const {
        animationsEnabled,
        setAnimationsEnabled,
        animationType,
        setAnimationType,
        mouseEffectsEnabled,
        setMouseEffectsEnabled,
        mouseEffectType,
        setMouseEffectType,

        // usa valores do provider se existirem; senão, usa os fallbacks
        accessibilityMode = accLocal,
        setAccessibilityMode = setAccLocal,
        reducedMotion = redLocal,
        setReducedMotion = setRedLocal,
        highContrast = hcLocal,
        setHighContrast = setHcLocal,
        glowEffects = glowLocal,
        setGlowEffects = setGlowLocal,
        fadeEffects = fadeLocal,
        setFadeEffects = setFadeLocal,
        particleIntensity = intensityLocal,
        setParticleIntensity = setIntensityLocal,
        performanceMode = perfLocal,
        setPerformanceMode = setPerfLocal,

        currentMixAnimation,
        currentMixMouseEffect,
    } = settings

    const resetToDefaults = () => {
        setAnimationsEnabled(true)
        setAnimationType("dots")
        setMouseEffectsEnabled(true)
        setMouseEffectType("explode")
        setAccessibilityMode(false)
        setReducedMotion(false)
        setHighContrast(false)
        setGlowEffects(true)
        setFadeEffects(true)
        setParticleIntensity(50)
        setPerformanceMode(false)
    }

    const tabs = [
        { id: "general", label: "Geral", icon: Globe },
        { id: "visual", label: "Visual", icon: Eye },
        { id: "mouse", label: "Mouse", icon: Mouse },
        { id: "accessibility", label: "Acessibilidade", icon: Accessibility },
        { id: "performance", label: "Performance", icon: Zap },
    ]

    const animationTypes: { value: AnimationType; label: string; description: string }[] = [
        {
            value: "dots",
            label: "Pontos",
            description: "Pontos animados flutuantes",
        },
        {
            value: "particles",
            label: "Partículas",
            description: "Sistema de partículas dinâmico",
        },
        {
            value: "waves",
            label: "Ondas fluidas em movimento",
            description: "Ondas fluidas em movimento",
        },
        {
            value: "geometric",
            label: "Formas geométricas animadas",
            description: "Formas geométricas animadas",
        },
        {
            value: "neural",
            label: "Rede neural interativa",
            description: "Rede neural interativa",
        },
        {
            value: "matrix",
            label: "Matrix com caracteres caindo",
            description: "Efeito Matrix com caracteres caindo",
        },
        {
            value: "matrix-rain",
            label: "Matrix Rain Interativo",
            description: "Efeito Matrix com caracteres japoneses que respondem ao mouse",
        },
        {
            value: "spiral",
            label: "Espirais hipnóticas em movimento",
            description: "Espirais hipnóticas em movimento",
        },
        {
            value: "constellation",
            label: "Constelação de estrelas conectadas",
            description: "Constelação de estrelas conectadas",
        },
        {
            value: "none",
            label: "Nenhum",
            description: "Sem animações de fundo",
        },
        { value: "mix", label: "Mix (Aleatório)", description: "Alterna entre todos os tipos automaticamente" },
    ]

    const mouseEffectTypes: { value: MouseEffectType; label: string; description: string }[] = [
        { value: "none", label: "Nenhum", description: "Sem efeitos de mouse" },
        {
            value: "explode",
            label: "Explosão",
            description: "Partículas explodem ao passar o mouse",
        },
        { value: "fade", label: "Desaparecer", description: "Partículas desaparecem gradualmente" },
        { value: "repel", label: "Repelir", description: "Partículas são repelidas pelo mouse" },
        {
            value: "attract",
            label: "Atrair",
            description: "Partículas são atraídas pelo mouse",
        },
        {
            value: "sparkle",
            label: "Brilho",
            description: "Efeito de brilho ao passar o mouse",
        },
        {
            value: "rainbow",
            label: "Arco-íris",
            description: "Rastro colorido arco-íris",
        },
        {
            value: "magnetic",
            label: "Magnético",
            description: "Campo magnético que distorce partículas",
        },
        { value: "vortex", label: "Vórtice", description: "Cria um vórtice que puxa as partículas" },
        { value: "mix", label: "Mix (Aleatório)", description: "Alterna entre todos os efeitos automaticamente" },
    ]

    const renderTabContent = () => {
        switch (activeTab) {
            case "general":
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Idioma</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Selecione o idioma da interface</p>
                        </div>
                    </div>
                )

            case "visual":
                return (
                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold">Animações Gerais</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Controle principal de todas as animações</p>
                                </div>
                                <Switch checked={animationsEnabled} onCheckedChange={setAnimationsEnabled} />
                            </div>

                            {animationsEnabled && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Tipo de Animação de Fundo</label>
                                        <Select value={animationType} onValueChange={(value: AnimationType) => setAnimationType(value)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {animationTypes.map((type) => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        {type.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {animationTypes.find((t) => t.value === animationType)?.description}
                                        </p>
                                        {animationType === "mix" && (
                                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                                Alterna entre todos os tipos automaticamente: {currentMixAnimation}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Intensidade das Partículas</label>
                                        <Slider
                                            value={[particleIntensity]}
                                            onValueChange={(value) => setParticleIntensity(value[0])}
                                            max={100}
                                            step={1}
                                            className="w-full"
                                        />
                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                            <span>0</span>
                                            <span>{particleIntensity}</span>
                                            <span>100</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium">Efeitos de Brilho</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Ativar efeitos de glow e sombras</p>
                            </div>
                            <Switch checked={glowEffects} onCheckedChange={setGlowEffects} />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium">Efeitos de Fade</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Ativar transições suaves de fade</p>
                            </div>
                            <Switch checked={fadeEffects} onCheckedChange={setFadeEffects} />
                        </div>
                    </div>
                )

            case "mouse":
                return (
                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold">Efeitos de Mouse</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Ativar interações com o mouse nas partículas
                                    </p>
                                </div>
                                <Switch checked={mouseEffectsEnabled} onCheckedChange={setMouseEffectsEnabled} />
                            </div>

                            {mouseEffectsEnabled && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Tipo de Efeito do Mouse</label>
                                        <Select
                                            value={mouseEffectType}
                                            onValueChange={(value: MouseEffectType) => setMouseEffectType(value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {mouseEffectTypes.map((type) => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        {type.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {mouseEffectTypes.find((t) => t.value === mouseEffectType)?.description}
                                        </p>
                                        {mouseEffectType === "mix" && (
                                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                                Efeito Ativo: {currentMixMouseEffect}
                                            </p>
                                        )}
                                    </div>

                                    {mouseEffectType !== "none" && (
                                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                                Passe o mouse sobre as partículas para ver o efeito!
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )

            case "accessibility":
                return (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold">Modo Acessibilidade</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Ativa todas as configurações de acessibilidade automaticamente
                                </p>
                            </div>
                            <Switch checked={accessibilityMode} onCheckedChange={setAccessibilityMode} />
                        </div>

                        {accessibilityMode && (
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Modo Acessibilidade Ativo:</h4>
                                <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                                    <li>• Movimento reduzido ativado</li>
                                    <li>• Efeitos de brilho desativados</li>
                                    <li>• Animações de fundo removidas</li>
                                    <li>• Efeitos de mouse desativados</li>
                                    <li>• Intensidade de partículas zerada</li>
                                    <li>• Texto aumentado</li>
                                    <li>• Alto contraste ativado</li>
                                    <li>• Indicadores de foco melhorados</li>
                                </ul>
                            </div>
                        )}

                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium">Movimento Reduzido</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Reduz animações complexas e movimentos rápidos
                                </p>
                            </div>
                            <Switch checked={reducedMotion} onCheckedChange={setReducedMotion} disabled={accessibilityMode} />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium">Alto Contraste</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Aumenta o contraste para melhor legibilidade</p>
                            </div>
                            <Switch checked={highContrast} onCheckedChange={setHighContrast} />
                        </div>
                    </div>
                )

            case "performance":
                return (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold">Modo Performance</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Otimiza automaticamente para melhor performance
                                </p>
                            </div>
                            <Switch checked={performanceMode} onCheckedChange={setPerformanceMode} />
                        </div>

                        {performanceMode && (
                            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-2">Modo Performance Ativo:</h4>
                                <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
                                    <li>• Animações de fundo desativadas</li>
                                    <li>• Efeitos de brilho reduzidos</li>
                                    <li>• Efeitos de fade simplificados</li>
                                    <li>• Efeitos de mouse desativados</li>
                                    <li>• Intensidade de partículas reduzida</li>
                                    <li>• Taxa de quadros limitada</li>
                                    <li>• Uso de memória otimizado</li>
                                </ul>
                            </div>
                        )}

                        <div className="space-y-4">
                            <h4 className="font-medium">Status do Sistema</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div className="text-sm font-medium">Animações</div>
                                    <div className={`text-xs ${animationsEnabled ? "text-green-600" : "text-red-600"}`}>
                                        {animationsEnabled ? "Ativas" : "Inativas"}
                                    </div>
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div className="text-sm font-medium">Efeitos de Mouse</div>
                                    <div className={`text-xs ${mouseEffectsEnabled ? "text-green-600" : "text-red-600"}`}>
                                        {mouseEffectsEnabled ? "Ativos" : "Inativos"}
                                    </div>
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div className="text-sm font-medium">Tipo de Fundo</div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">{animationType}</div>
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div className="text-sm font-medium">Intensidade</div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">{particleIntensity}%</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )

            default:
                return null
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-4xl max-h-[90vh] overflow-hidden"
                    >
                        <Card className="h-full flex flex-col">
                            <div className="flex items-center justify-between p-6 border-b">
                                <h2 className="text-2xl font-bold">Preferências</h2>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" onClick={resetToDefaults}>
                                        <RotateCcw className="w-4 h-4 mr-2" />
                                        Restaurar padrões
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={onClose}>
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="flex flex-1 overflow-hidden">
                                <div className="w-64 border-r p-4 overflow-y-auto">
                                    <nav className="space-y-2">
                                        {tabs.map((tab) => (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                                                    activeTab === tab.id
                                                        ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
                                                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                                                }`}
                                            >
                                                <tab.icon className="w-4 h-4" />
                                                {tab.label}
                                            </button>
                                        ))}
                                    </nav>
                                </div>

                                <div className="flex-1 p-6 overflow-y-auto">{renderTabContent()}</div>
                            </div>
                        </Card>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
