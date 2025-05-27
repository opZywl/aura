"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "./components/ui/button"
import { Settings, X, Zap, Palette, Accessibility, RotateCcw, Mouse } from "lucide-react"
import { useSettings, type AnimationType, type MouseEffectType } from "./contexts/SettingsContext"
import { useTheme } from "next-themes"

export default function SettingsModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"visual" | "mouse" | "accessibility" | "performance">("visual")
  const { theme } = useTheme()
  const {
    animationsEnabled,
    setAnimationsEnabled,
    animationType,
    setAnimationType,
    mouseEffectsEnabled,
    setMouseEffectsEnabled,
    mouseEffectType,
    setMouseEffectType,
    accessibilityMode,
    setAccessibilityMode,
    reducedMotion,
    setReducedMotion,
    highContrast,
    setHighContrast,
    glowEffects,
    setGlowEffects,
    fadeEffects,
    setFadeEffects,
    particleIntensity,
    setParticleIntensity,
    performanceMode,
    setPerformanceMode,
  } = useSettings()

  const animationTypes: { value: AnimationType; label: string; description: string }[] = [
    { value: "dots", label: "Pontos", description: "Pontos animados flutuantes" },
    { value: "particles", label: "Partículas", description: "Sistema de partículas dinâmico" },
    { value: "waves", label: "Ondas", description: "Ondas fluidas em movimento" },
    { value: "geometric", label: "Geométrico", description: "Formas geométricas animadas" },
    { value: "neural", label: "Neural", description: "Rede neural interativa" },
    { value: "none", label: "Nenhum", description: "Sem animações de fundo" },
  ]

  const mouseEffectTypes: { value: MouseEffectType; label: string; description: string }[] = [
    { value: "none", label: "Nenhum", description: "Sem efeitos de mouse" },
    { value: "explode", label: "Explosão", description: "Partículas explodem ao passar o mouse" },
    { value: "fade", label: "Desaparecer", description: "Partículas desaparecem gradualmente" },
    { value: "repel", label: "Repelir", description: "Partículas são repelidas pelo mouse" },
    { value: "attract", label: "Atrair", description: "Partículas são atraídas pelo mouse" },
    { value: "sparkle", label: "Brilho", description: "Efeito de brilho ao passar o mouse" },
  ]

  const tabs = [
    { id: "visual", label: "Visual", icon: Palette },
    { id: "mouse", label: "Mouse", icon: Mouse },
    { id: "accessibility", label: "Acessibilidade", icon: Accessibility },
    { id: "performance", label: "Performance", icon: Zap },
  ]

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

  return (
    <>
      {/* Settings Button */}
      <Button
        onClick={() => setIsOpen(true)}
        variant="ghost"
        size="icon"
        className={`transition-colors ${
          theme === "dark" ? "text-white hover:text-gray-300" : "text-black hover:text-gray-700"
        }`}
      >
        <Settings className="h-5 w-5" />
      </Button>

      {/* Settings Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className={`border rounded-2xl p-6 w-full max-w-lg mx-4 shadow-xl backdrop-blur-lg ${
                theme === "dark" ? "bg-gray-900 border-gray-700" : "bg-white border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  Preferências
                </h3>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={resetToDefaults}
                    variant="ghost"
                    size="icon"
                    className={`${
                      theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"
                    }`}
                    title="Restaurar padrões"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => setIsOpen(false)}
                    variant="ghost"
                    size="icon"
                    className={`${
                      theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex space-x-1 mb-6 overflow-x-auto">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                        activeTab === tab.id
                          ? theme === "dark"
                            ? "bg-blue-600 text-white"
                            : "bg-blue-100 text-blue-900"
                          : theme === "dark"
                            ? "text-gray-400 hover:text-white hover:bg-gray-800"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* Tab Content */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {activeTab === "visual" && (
                  <>
                    {/* Master Animation Toggle */}
                    <div
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        theme === "dark" ? "bg-gray-800" : "bg-gray-100"
                      }`}
                    >
                      <div>
                        <div className={`font-medium text-sm ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                          Animações Gerais
                        </div>
                        <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                          Controle principal de todas as animações
                        </div>
                      </div>
                      <Button
                        onClick={() => setAnimationsEnabled(!animationsEnabled)}
                        size="sm"
                        className={`text-xs px-3 py-1 h-7 ${
                          animationsEnabled
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "bg-red-600 hover:bg-red-700 text-white"
                        }`}
                      >
                        {animationsEnabled ? "Ativado" : "Desativado"}
                      </Button>
                    </div>

                    {/* Animation Type */}
                    <div>
                      <h4 className={`font-medium mb-3 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                        Tipo de Animação de Fundo
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {animationTypes.map((type) => (
                          <button
                            key={type.value}
                            onClick={() => setAnimationType(type.value)}
                            disabled={!animationsEnabled}
                            className={`p-3 rounded-lg text-left transition-colors ${
                              animationType === type.value
                                ? theme === "dark"
                                  ? "bg-blue-600 text-white"
                                  : "bg-blue-100 text-blue-900 border-blue-300"
                                : theme === "dark"
                                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                            } ${!animationsEnabled ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            <div className="font-medium text-sm">{type.label}</div>
                            <div className="text-xs opacity-75">{type.description}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Particle Intensity */}
                    <div className={`p-3 rounded-lg ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
                      <div className={`font-medium text-sm mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                        Intensidade das Partículas: {particleIntensity}%
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={particleIntensity}
                        onChange={(e) => setParticleIntensity(Number(e.target.value))}
                        disabled={!animationsEnabled || animationType === "none"}
                        className={`w-full ${
                          !animationsEnabled || animationType === "none" ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      />
                    </div>

                    {/* Visual Effects */}
                    <div className="space-y-3">
                      <h4 className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                        Efeitos Visuais
                      </h4>

                      <div
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          theme === "dark" ? "bg-gray-800" : "bg-gray-100"
                        }`}
                      >
                        <div>
                          <div className={`font-medium text-sm ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                            Efeitos de Brilho
                          </div>
                          <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                            Ativar efeitos de glow e sombras
                          </div>
                        </div>
                        <Button
                          onClick={() => setGlowEffects(!glowEffects)}
                          disabled={!animationsEnabled}
                          size="sm"
                          className={`text-xs px-3 py-1 h-7 ${
                            glowEffects && animationsEnabled
                              ? "bg-blue-600 hover:bg-blue-700 text-white"
                              : theme === "dark"
                                ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                                : "bg-gray-300 hover:bg-gray-400 text-gray-700"
                          } ${!animationsEnabled ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          {glowEffects ? "Ativado" : "Desativado"}
                        </Button>
                      </div>

                      <div
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          theme === "dark" ? "bg-gray-800" : "bg-gray-100"
                        }`}
                      >
                        <div>
                          <div className={`font-medium text-sm ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                            Efeitos de Fade
                          </div>
                          <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                            Ativar transições suaves de fade
                          </div>
                        </div>
                        <Button
                          onClick={() => setFadeEffects(!fadeEffects)}
                          disabled={!animationsEnabled}
                          size="sm"
                          className={`text-xs px-3 py-1 h-7 ${
                            fadeEffects && animationsEnabled
                              ? "bg-blue-600 hover:bg-blue-700 text-white"
                              : theme === "dark"
                                ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                                : "bg-gray-300 hover:bg-gray-400 text-gray-700"
                          } ${!animationsEnabled ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          {fadeEffects ? "Ativado" : "Desativado"}
                        </Button>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === "mouse" && (
                  <>
                    {/* Mouse Effects Toggle */}
                    <div
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        theme === "dark" ? "bg-gray-800" : "bg-gray-100"
                      }`}
                    >
                      <div>
                        <div className={`font-medium text-sm ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                          Efeitos de Mouse
                        </div>
                        <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                          Ativar interações com o mouse nas partículas
                        </div>
                      </div>
                      <Button
                        onClick={() => setMouseEffectsEnabled(!mouseEffectsEnabled)}
                        disabled={!animationsEnabled}
                        size="sm"
                        className={`text-xs px-3 py-1 h-7 ${
                          mouseEffectsEnabled && animationsEnabled
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "bg-red-600 hover:bg-red-700 text-white"
                        } ${!animationsEnabled ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        {mouseEffectsEnabled ? "Ativado" : "Desativado"}
                      </Button>
                    </div>

                    {/* Mouse Effect Types */}
                    <div>
                      <h4 className={`font-medium mb-3 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                        Tipo de Efeito do Mouse
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {mouseEffectTypes.map((effect) => (
                          <button
                            key={effect.value}
                            onClick={() => setMouseEffectType(effect.value)}
                            disabled={!mouseEffectsEnabled || !animationsEnabled}
                            className={`p-3 rounded-lg text-left transition-colors ${
                              mouseEffectType === effect.value
                                ? theme === "dark"
                                  ? "bg-purple-600 text-white"
                                  : "bg-purple-100 text-purple-900 border-purple-300"
                                : theme === "dark"
                                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                            } ${!mouseEffectsEnabled || !animationsEnabled ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            <div className="font-medium text-sm">{effect.label}</div>
                            <div className="text-xs opacity-75">{effect.description}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {mouseEffectsEnabled && mouseEffectType !== "none" && (
                      <div
                        className={`p-3 rounded-lg border-l-4 border-purple-500 ${
                          theme === "dark" ? "bg-purple-900/20" : "bg-purple-100"
                        }`}
                      >
                        <div className={`text-sm ${theme === "dark" ? "text-purple-300" : "text-purple-800"}`}>
                          <strong>Efeito Ativo:</strong>{" "}
                          {mouseEffectTypes.find((e) => e.value === mouseEffectType)?.label}
                          <div className="mt-1 text-xs">Passe o mouse sobre as partículas para ver o efeito!</div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {activeTab === "accessibility" && (
                  <div className="space-y-3">
                    <div
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        theme === "dark" ? "bg-gray-800" : "bg-gray-100"
                      }`}
                    >
                      <div>
                        <div className={`font-medium text-sm ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                          Modo Acessibilidade
                        </div>
                        <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                          Ativa todas as configurações de acessibilidade automaticamente
                        </div>
                      </div>
                      <Button
                        onClick={() => setAccessibilityMode(!accessibilityMode)}
                        size="sm"
                        className={`text-xs px-3 py-1 h-7 ${
                          accessibilityMode
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : theme === "dark"
                              ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                              : "bg-gray-300 hover:bg-gray-400 text-gray-700"
                        }`}
                      >
                        {accessibilityMode ? "Ativado" : "Desativado"}
                      </Button>
                    </div>

                    <div
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        theme === "dark" ? "bg-gray-800" : "bg-gray-100"
                      }`}
                    >
                      <div>
                        <div className={`font-medium text-sm ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                          Movimento Reduzido
                        </div>
                        <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                          Reduz animações complexas e movimentos rápidos
                        </div>
                      </div>
                      <Button
                        onClick={() => setReducedMotion(!reducedMotion)}
                        disabled={accessibilityMode}
                        size="sm"
                        className={`text-xs px-3 py-1 h-7 ${
                          reducedMotion
                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                            : theme === "dark"
                              ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                              : "bg-gray-300 hover:bg-gray-400 text-gray-700"
                        } ${accessibilityMode ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        {reducedMotion ? "Ativado" : "Desativado"}
                      </Button>
                    </div>

                    <div
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        theme === "dark" ? "bg-gray-800" : "bg-gray-100"
                      }`}
                    >
                      <div>
                        <div className={`font-medium text-sm ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                          Alto Contraste
                        </div>
                        <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                          Aumenta o contraste para melhor legibilidade
                        </div>
                      </div>
                      <Button
                        onClick={() => setHighContrast(!highContrast)}
                        disabled={accessibilityMode}
                        size="sm"
                        className={`text-xs px-3 py-1 h-7 ${
                          highContrast
                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                            : theme === "dark"
                              ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                              : "bg-gray-300 hover:bg-gray-400 text-gray-700"
                        } ${accessibilityMode ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        {highContrast ? "Ativado" : "Desativado"}
                      </Button>
                    </div>

                    {accessibilityMode && (
                      <div
                        className={`p-3 rounded-lg border-l-4 border-green-500 ${
                          theme === "dark" ? "bg-green-900/20" : "bg-green-100"
                        }`}
                      >
                        <div className={`text-sm ${theme === "dark" ? "text-green-300" : "text-green-800"}`}>
                          <strong>Modo Acessibilidade Ativo:</strong>
                          <ul className="mt-2 text-xs space-y-1">
                            <li>• Movimento reduzido ativado</li>
                            <li>• Efeitos de brilho desativados</li>
                            <li>• Animações de fundo removidas</li>
                            <li>• Efeitos de mouse desativados</li>
                            <li>• Intensidade de partículas zerada</li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "performance" && (
                  <div className="space-y-3">
                    <div
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        theme === "dark" ? "bg-gray-800" : "bg-gray-100"
                      }`}
                    >
                      <div>
                        <div className={`font-medium text-sm ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                          Modo Performance
                        </div>
                        <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                          Otimiza automaticamente para melhor performance
                        </div>
                      </div>
                      <Button
                        onClick={() => setPerformanceMode(!performanceMode)}
                        size="sm"
                        className={`text-xs px-3 py-1 h-7 ${
                          performanceMode
                            ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                            : theme === "dark"
                              ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                              : "bg-gray-300 hover:bg-gray-400 text-gray-700"
                        }`}
                      >
                        {performanceMode ? "Ativado" : "Desativado"}
                      </Button>
                    </div>

                    {performanceMode && (
                      <div
                        className={`p-3 rounded-lg border-l-4 border-yellow-500 ${
                          theme === "dark" ? "bg-yellow-900/20" : "bg-yellow-100"
                        }`}
                      >
                        <div className={`text-sm ${theme === "dark" ? "text-yellow-300" : "text-yellow-800"}`}>
                          <strong>Modo Performance Ativo:</strong>
                          <ul className="mt-2 text-xs space-y-1">
                            <li>• Animações de fundo desativadas</li>
                            <li>• Efeitos de brilho reduzidos</li>
                            <li>• Efeitos de fade simplificados</li>
                            <li>• Efeitos de mouse desativados</li>
                            <li>• Intensidade de partículas reduzida</li>
                          </ul>
                        </div>
                      </div>
                    )}

                    <div className={`p-3 rounded-lg ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
                      <div className={`font-medium text-sm mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                        Status do Sistema
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>Animações:</span>
                          <span className={animationsEnabled ? "text-green-500" : "text-red-500"}>
                            {animationsEnabled ? "Ativas" : "Inativas"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                            Efeitos de Mouse:
                          </span>
                          <span className={mouseEffectsEnabled ? "text-green-500" : "text-red-500"}>
                            {mouseEffectsEnabled ? "Ativos" : "Inativos"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>Tipo de Fundo:</span>
                          <span className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
                            {animationTypes.find((t) => t.value === animationType)?.label || "Nenhum"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>Efeito do Mouse:</span>
                          <span className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
                            {mouseEffectTypes.find((t) => t.value === mouseEffectType)?.label || "Nenhum"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>Intensidade:</span>
                          <span className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
                            {particleIntensity}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className={`mt-6 pt-4 border-t ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}>
                <Button
                  onClick={() => setIsOpen(false)}
                  className={`w-full rounded-xl transition-all duration-300 hover:shadow-lg ${
                    theme === "dark"
                      ? "bg-gray-700 hover:bg-gray-600 text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                  }`}
                >
                  Fechar
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
