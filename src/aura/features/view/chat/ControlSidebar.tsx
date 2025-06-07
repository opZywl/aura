"use client"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Sun, Moon, ArrowLeft, Info, Maximize, Minimize, EyeOff, Settings, Palette, Plus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { useLanguage } from "../../../contexts/LanguageContext"
import type { ThemeSettings } from "./ChatTemplate"

interface PerformanceSettings {
  performanceMode: boolean
  reducedAnimations: boolean
  lowFrameRate: boolean
  memoryOptimization: boolean
}

interface ControlSidebarProps {
  onNewConversation: () => void
  onShowDetails: () => void
  onGoBack: () => void
  onToggleTheme: () => void
  onToggleFullscreen: () => void
  onToggleControlSidebar: () => void
  theme: string
  isFullscreen: boolean
  performanceSettings: PerformanceSettings
  onPerformanceSettingsChange: (settings: PerformanceSettings) => void
  themeSettings: ThemeSettings
  onThemeSettingsChange: (settings: ThemeSettings) => void
  onSaveSettings: () => void
  onResetSettings: () => void
}

const gradientThemes = [
  {
    name: "Blue Purple",
    primary: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
    secondary: "linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)",
    accent: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)",
    glow: "rgba(59, 130, 246, 0.6)",
    colors: { color1: "#3b82f6", color2: "#8b5cf6" },
  },
  {
    name: "Green Teal",
    primary: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
    secondary: "linear-gradient(135deg, #34d399 0%, #22d3ee 100%)",
    accent: "linear-gradient(135deg, #10b981 0%, #06b6d4 50%, #8b5cf6 100%)",
    glow: "rgba(16, 185, 129, 0.6)",
    colors: { color1: "#10b981", color2: "#06b6d4" },
  },
  {
    name: "Orange Red",
    primary: "linear-gradient(135deg, #f97316 0%, #ef4444 100%)",
    secondary: "linear-gradient(135deg, #fb923c 0%, #f87171 100%)",
    accent: "linear-gradient(135deg, #f97316 0%, #ef4444 50%, #ec4899 100%)",
    glow: "rgba(249, 115, 22, 0.6)",
    colors: { color1: "#f97316", color2: "#ef4444" },
  },
  {
    name: "Purple Pink",
    primary: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
    secondary: "linear-gradient(135deg, #a78bfa 0%, #f472b6 100%)",
    accent: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #f59e0b 100%)",
    glow: "rgba(139, 92, 246, 0.6)",
    colors: { color1: "#8b5cf6", color2: "#ec4899" },
  },
  {
    name: "Cyan Blue",
    primary: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
    secondary: "linear-gradient(135deg, #22d3ee 0%, #60a5fa 100%)",
    accent: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)",
    glow: "rgba(6, 182, 212, 0.6)",
    colors: { color1: "#06b6d4", color2: "#3b82f6" },
  },
]

export default function ControlSidebar({
  onNewConversation,
  onShowDetails,
  onGoBack,
  onToggleTheme,
  onToggleFullscreen,
  onToggleControlSidebar,
  theme,
  isFullscreen,
  performanceSettings,
  onPerformanceSettingsChange,
  themeSettings,
  onThemeSettingsChange,
  onSaveSettings,
  onResetSettings,
}: ControlSidebarProps) {
  const { t } = useLanguage()

  const handlePerformanceModeChange = (enabled: boolean) => {
    if (enabled) {
      onPerformanceSettingsChange({
        performanceMode: true,
        reducedAnimations: true,
        lowFrameRate: true,
        memoryOptimization: true,
      })
    } else {
      onPerformanceSettingsChange({
        performanceMode: false,
        reducedAnimations: false,
        lowFrameRate: false,
        memoryOptimization: false,
      })
    }
  }

  const handleIndividualSettingChange = (setting: keyof PerformanceSettings, value: boolean) => {
    const newSettings = { ...performanceSettings, [setting]: value }

    if (!value) {
      newSettings.performanceMode = false
    }

    if (newSettings.reducedAnimations && newSettings.lowFrameRate && newSettings.memoryOptimization) {
      newSettings.performanceMode = true
    }

    onPerformanceSettingsChange(newSettings)
  }

  const handleThemeSettingChange = (setting: keyof ThemeSettings, value: any) => {
    const newSettings = { ...themeSettings, [setting]: value }
    console.log(`🔧 Alterando ${setting}:`, value)
    onThemeSettingsChange(newSettings)
  }

  const applyGradientTheme = (gradientTheme: any) => {
    console.log("🎨 Aplicando tema gradiente:", gradientTheme.name)

    const root = document.documentElement
    root.style.setProperty("--chat-gradient-primary", gradientTheme.primary)
    root.style.setProperty("--chat-gradient-secondary", gradientTheme.secondary)
    root.style.setProperty("--chat-gradient-accent", gradientTheme.accent)
    root.style.setProperty("--chat-glow-color", gradientTheme.glow)
    root.style.setProperty("--chat-glow-color-light", gradientTheme.glow.replace("0.6", "0.3"))
    root.style.setProperty("--chat-glow-color-strong", gradientTheme.glow.replace("0.6", "0.9"))

    const newSettings = {
      ...themeSettings,
      currentGradient: gradientTheme.name,
    }

    onThemeSettingsChange(newSettings)
  }

  // Define icon colors based on theme - much whiter in dark mode
  const getIconStyle = () => {
    const baseStyle = {
      transition: "all 0.3s ease",
    }

    if (theme === "dark") {
      return {
        ...baseStyle,
        color: "#f8fafc", // Very white color for dark mode
        filter: themeSettings.glowEffects ? "drop-shadow(0 0 8px rgba(248, 250, 252, 0.8))" : "none",
      }
    } else {
      return {
        ...baseStyle,
        color: "#374151", // Dark gray for light mode
        filter: themeSettings.glowEffects ? "drop-shadow(0 0 8px rgba(55, 65, 81, 0.6))" : "none",
      }
    }
  }

  const getButtonStyle = () => {
    if (themeSettings.glowEffects) {
      return {
        background: "var(--chat-gradient-primary)",
        boxShadow: "0 0 20px var(--chat-glow-color), 0 0 40px var(--chat-glow-color-light)",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "var(--chat-glow-color)",
      }
    }
    return {}
  }

  return (
    <TooltipProvider>
      <div
        className={`w-20 border-r flex flex-col items-center py-6 scrollbar-hide ${
          theme === "dark"
            ? "bg-gradient-to-b from-[#0a0a0a] to-[#000000] border-gray-900"
            : "bg-gradient-to-b from-white to-gray-50 border-gray-200"
        }`}
        style={
          themeSettings.glowEffects
            ? {
                boxShadow: `inset 0 0 20px var(--chat-glow-color-light), 0 0 40px var(--chat-glow-color-light)`,
                borderRightWidth: "1px",
                borderRightStyle: "solid",
                borderRightColor: "var(--chat-glow-color)",
              }
            : {}
        }
      >
        <div className="flex-1 flex flex-col items-center space-y-4">
          {/* Hide Sidebars Button (Eye Icon) */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onToggleControlSidebar}
                variant="ghost"
                size="icon"
                className={`w-12 h-12 rounded-xl transition-all duration-300 border-2 transform hover:scale-110 hover:rotate-12 ${
                  theme === "dark"
                    ? "hover:bg-gray-800 hover:shadow-lg border-gray-700 hover:border-gray-600"
                    : "hover:bg-gray-100 hover:shadow-md border-gray-300 hover:border-gray-400"
                } ${themeSettings.textAnimations ? "chat-text-animated" : ""}`}
                style={getButtonStyle()}
              >
                <EyeOff className="w-5 h-5" style={getIconStyle()} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Ocultar Sidebar</p>
            </TooltipContent>
          </Tooltip>

          {/* Settings Button */}
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`w-12 h-12 rounded-xl transition-all duration-300 border-2 transform hover:scale-110 hover:rotate-180 ${
                      theme === "dark"
                        ? "hover:bg-gray-800 hover:shadow-lg border-gray-700 hover:border-gray-600"
                        : "hover:bg-gray-100 hover:shadow-md border-gray-300 hover:border-gray-400"
                    } ${themeSettings.textAnimations ? "chat-text-animated" : ""}`}
                    style={getButtonStyle()}
                  >
                    <Settings className="w-5 h-5" style={getIconStyle()} />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Configurações</p>
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent
              align="start"
              side="right"
              className={`w-64 backdrop-blur-sm ${theme === "dark" ? "bg-gray-900/90 text-gray-100 border-gray-700" : "bg-white/90 border-gray-200"}`}
            >
              <DropdownMenuLabel className="chat-glow-title">
                {t("settings.performance.mode") || "Performance Settings"}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium chat-fade-text">
                    {t("settings.performance.mode") || "Performance Mode"}
                  </span>
                  <Switch checked={performanceSettings.performanceMode} onCheckedChange={handlePerformanceModeChange} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm chat-fade-text">
                    {t("settings.performance.reducedAnimations") || "Reduced Animations"}
                  </span>
                  <Switch
                    checked={performanceSettings.reducedAnimations}
                    onCheckedChange={(value) => handleIndividualSettingChange("reducedAnimations", value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm chat-fade-text">
                    {t("settings.performance.lowFrameRate") || "Low Frame Rate"}
                  </span>
                  <Switch
                    checked={performanceSettings.lowFrameRate}
                    onCheckedChange={(value) => handleIndividualSettingChange("lowFrameRate", value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm chat-fade-text">
                    {t("settings.performance.memoryOptimization") || "Memory Optimization"}
                  </span>
                  <Switch
                    checked={performanceSettings.memoryOptimization}
                    onCheckedChange={(value) => handleIndividualSettingChange("memoryOptimization", value)}
                  />
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onToggleTheme}
                variant="ghost"
                size="icon"
                className={`w-12 h-12 rounded-xl transition-all duration-300 border-2 transform hover:scale-110 hover:rotate-180 ${
                  theme === "dark"
                    ? "hover:bg-gray-800 hover:shadow-lg border-gray-700 hover:border-gray-600"
                    : "hover:bg-gray-100 hover:shadow-md border-gray-300 hover:border-gray-400"
                } ${themeSettings.textAnimations ? "chat-text-animated" : ""}`}
                style={getButtonStyle()}
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5" style={getIconStyle()} />
                ) : (
                  <Moon className="w-5 h-5" style={getIconStyle()} />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{theme === "dark" ? "Modo Claro" : "Modo Escuro"}</p>
            </TooltipContent>
          </Tooltip>

          {/* Themes and Effects Button */}
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`w-12 h-12 rounded-xl transition-all duration-300 border-2 transform hover:scale-110 hover:rotate-12 ${
                      theme === "dark"
                        ? "hover:bg-gray-800 hover:shadow-lg border-gray-700 hover:border-gray-600"
                        : "hover:bg-gray-100 hover:shadow-md border-gray-300 hover:border-gray-400"
                    } ${themeSettings.textAnimations ? "chat-text-animated" : ""}`}
                    style={getButtonStyle()}
                  >
                    <Palette className="w-5 h-5" style={getIconStyle()} />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Temas</p>
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent
              align="start"
              side="right"
              className={`w-96 max-h-[80vh] overflow-y-auto scrollbar-hide backdrop-blur-sm ${theme === "dark" ? "bg-gray-900/95 text-gray-100 border-gray-700" : "bg-white/95 border-gray-200"}`}
            >
              <DropdownMenuLabel className="text-lg font-bold chat-glow-title">
                {t("colorPanel.title") || "🎨 Personalização Visual"}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="p-4 space-y-6">
                {/* Predefined Themes */}
                <div>
                  <h3 className="text-sm font-medium mb-3 chat-fade-text">
                    {t("colorPanel.predefinedThemes") || "Temas Predefinidos"}
                  </h3>
                  <div className="grid grid-cols-5 gap-2">
                    {gradientThemes.map((gradientTheme, index) => (
                      <button
                        key={index}
                        onClick={() => applyGradientTheme(gradientTheme)}
                        className={`w-12 h-12 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                          themeSettings.currentGradient === gradientTheme.name
                            ? "border-blue-500 shadow-lg ring-2 ring-blue-400"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        style={{ background: gradientTheme.primary }}
                        title={gradientTheme.name}
                      />
                    ))}
                  </div>
                </div>

                <DropdownMenuSeparator />

                {/* Glow Effects */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium chat-glow-title">
                    {t("colorPanel.glowSettings") || "✨ Configurações de Glow"}
                  </h3>

                  <div className="flex items-center justify-between">
                    <span className="text-sm chat-fade-text">
                      {t("settings.visual.glowEffects") || "Efeitos de Brilho"}
                    </span>
                    <Switch
                      checked={themeSettings.glowEffects}
                      onCheckedChange={(value) => handleThemeSettingChange("glowEffects", value)}
                    />
                  </div>

                  {themeSettings.glowEffects && (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm chat-fade-text">
                            {t("colorPanel.glowIntensity") || "Intensidade do Glow"}
                          </span>
                          <span className="text-xs text-blue-400 font-mono">{themeSettings.glowIntensity}%</span>
                        </div>
                        <Slider
                          value={[themeSettings.glowIntensity]}
                          onValueChange={([value]) => handleThemeSettingChange("glowIntensity", value)}
                          max={100}
                          step={1}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm chat-fade-text">
                            {t("colorPanel.glowThickness") || "Espessura do Glow"}
                          </span>
                          <span className="text-xs text-blue-400 font-mono">{themeSettings.glowThickness}px</span>
                        </div>
                        <Slider
                          value={[themeSettings.glowThickness]}
                          onValueChange={([value]) => handleThemeSettingChange("glowThickness", value)}
                          max={50}
                          step={1}
                          className="w-full"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm chat-fade-text">
                          {t("colorPanel.glowAnimation") || "Animação do Glow"}
                        </span>
                        <Switch
                          checked={themeSettings.glowAnimation}
                          onCheckedChange={(value) => handleThemeSettingChange("glowAnimation", value)}
                        />
                      </div>
                    </>
                  )}
                </div>

                <DropdownMenuSeparator />

                {/* Fade Effects */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium chat-glow-title">
                    {t("colorPanel.fadeEffects") || "🌈 Efeitos de Fade"}
                  </h3>

                  <div className="flex items-center justify-between">
                    <span className="text-sm chat-fade-text">
                      {t("settings.visual.fadeEffects") || "Efeitos de Fade"}
                    </span>
                    <Switch
                      checked={themeSettings.fadeEnabled}
                      onCheckedChange={(value) => handleThemeSettingChange("fadeEnabled", value)}
                    />
                  </div>

                  {themeSettings.fadeEnabled && (
                    <>
                      <div className="space-y-2">
                        <span className="text-sm chat-fade-text">{t("colorPanel.fadeMode") || "Modo de Fade"}</span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleThemeSettingChange("fadeMode", "singular")}
                            className={`px-3 py-1 text-xs rounded transition-all ${
                              themeSettings.fadeMode === "singular"
                                ? "bg-blue-600 text-white shadow-lg"
                                : theme === "dark"
                                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                          >
                            {t("colorPanel.singular") || "Singular"}
                          </button>
                          <button
                            onClick={() => handleThemeSettingChange("fadeMode", "movement")}
                            className={`px-3 py-1 text-xs rounded transition-all ${
                              themeSettings.fadeMode === "movement"
                                ? "bg-blue-600 text-white shadow-lg"
                                : theme === "dark"
                                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                          >
                            {t("colorPanel.movement") || "Movimento"}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm chat-fade-text">
                            {t("colorPanel.movementSpeed") || "Velocidade do Movimento"}
                          </span>
                          <span className="text-xs text-blue-400 font-mono">{themeSettings.fadeSpeed}s</span>
                        </div>
                        <Slider
                          value={[themeSettings.fadeSpeed]}
                          onValueChange={([value]) => handleThemeSettingChange("fadeSpeed", value)}
                          min={1}
                          max={10}
                          step={0.5}
                          className="w-full"
                        />
                      </div>
                    </>
                  )}
                </div>

                <DropdownMenuSeparator />

                {/* Text Animations */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium chat-glow-title">
                    {t("settings.themes.textAnimations") || "🎭 Animações de Texto"}
                  </span>
                  <Switch
                    checked={themeSettings.textAnimations}
                    onCheckedChange={(value) => handleThemeSettingChange("textAnimations", value)}
                  />
                </div>

                <DropdownMenuSeparator />

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <Button
                    onClick={onSaveSettings}
                    size="sm"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white transition-all hover:scale-105"
                    data-save-button
                  >
                    {t("colorPanel.saveSettings") || "💾 Salvar"}
                  </Button>
                  <Button
                    onClick={onResetSettings}
                    size="sm"
                    variant="outline"
                    className="flex-1 hover:scale-105 transition-all"
                    data-reset-button
                  >
                    {t("colorPanel.resetSettings") || "🔄 Reset"}
                  </Button>
                </div>

                {/* Status Indicator */}
                <div className="text-xs text-center opacity-70">
                  <div className="chat-fade-text">
                    Glow: {themeSettings.glowEffects ? "✅" : "❌"} | Fade: {themeSettings.fadeEnabled ? "✅" : "❌"} |
                    Anim: {themeSettings.textAnimations ? "✅" : "❌"}
                  </div>
                  <div className="text-xs mt-1 opacity-50">Tema: {themeSettings.currentGradient}</div>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Fullscreen Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onToggleFullscreen}
                variant="ghost"
                size="icon"
                className={`w-12 h-12 rounded-xl transition-all duration-300 border-2 transform hover:scale-110 hover:rotate-12 ${
                  theme === "dark"
                    ? "hover:bg-gray-800 hover:shadow-lg border-gray-700 hover:border-gray-600"
                    : "hover:bg-gray-100 hover:shadow-md border-gray-300 hover:border-gray-400"
                } ${themeSettings.textAnimations ? "chat-text-animated" : ""}`}
                style={getButtonStyle()}
              >
                {isFullscreen ? (
                  <Minimize className="w-5 h-5" style={getIconStyle()} />
                ) : (
                  <Maximize className="w-5 h-5" style={getIconStyle()} />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{isFullscreen ? "Sair da Tela Cheia" : "Tela Cheia"}</p>
            </TooltipContent>
          </Tooltip>

          {/* Details Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onShowDetails}
                variant="ghost"
                size="icon"
                className={`w-12 h-12 rounded-xl transition-all duration-300 border-2 transform hover:scale-110 hover:rotate-12 ${
                  theme === "dark"
                    ? "hover:bg-gray-800 hover:shadow-lg border-gray-700 hover:border-gray-600"
                    : "hover:bg-gray-100 hover:shadow-md border-gray-300 hover:border-gray-400"
                } ${themeSettings.textAnimations ? "chat-text-animated" : ""}`}
                style={getButtonStyle()}
              >
                <Info className="w-5 h-5" style={getIconStyle()} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Detalhes</p>
            </TooltipContent>
          </Tooltip>

          {/* Templates Section with Plus Button */}
          <div className="mt-4 flex flex-col items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onNewConversation}
                  className={`w-12 h-12 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-125 hover:rotate-90 border-2 border-red-500 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white ${themeSettings.textAnimations ? "chat-text-animated" : ""}`}
                  style={
                    themeSettings.glowEffects
                      ? {
                          boxShadow: "0 0 20px rgba(239, 68, 68, 0.6), 0 0 40px rgba(239, 68, 68, 0.3)",
                          borderWidth: "1px",
                          borderStyle: "solid",
                          borderColor: "rgba(239, 68, 68, 0.8)",
                        }
                      : {}
                  }
                >
                  <Plus
                    className="w-5 h-5"
                    style={{
                      color: "white",
                      filter: themeSettings.glowEffects ? "drop-shadow(0 0 8px rgba(255, 255, 255, 0.8))" : "none",
                    }}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Nova Template</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="mt-auto">
          {/* Back Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onGoBack}
                variant="ghost"
                size="icon"
                className={`w-12 h-12 rounded-xl transition-all duration-300 border-2 transform hover:scale-110 hover:rotate-12 ${
                  theme === "dark"
                    ? "hover:text-red-400 hover:bg-red-900/20 hover:shadow-lg border-gray-700 hover:border-red-600"
                    : "hover:text-red-600 hover:bg-red-50 hover:shadow-md border-gray-300 hover:border-red-400"
                } ${themeSettings.textAnimations ? "chat-text-animated" : ""}`}
                style={getButtonStyle()}
              >
                <ArrowLeft className="w-5 h-5" style={getIconStyle()} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Voltar</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  )
}
