"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, AlertTriangle } from "lucide-react"
import type { ThemeSettings } from "./ChatTemplate"

interface NewMessageModalProps {
  onCloseAction: () => void
  onSendTemplateAction: (template: { message: string; params: Record<string, string> }) => void
  theme: string
  themeSettings?: ThemeSettings
}

interface MessageTemplate {
  id: string
  text: string
  hasParams: boolean
}

export default function NewMessageModal({ onCloseAction, onSendTemplateAction, theme, themeSettings }: NewMessageModalProps) {
  const [phoneCode, setPhoneCode] = useState("+55")
  const [customCode, setCustomCode] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [params, setParams] = useState<Record<string, string>>({})
  const [previewMessage, setPreviewMessage] = useState("")

  const templates: MessageTemplate[] = [
    { id: "id", text: "Seu código de identificação é {{1}}.", hasParams: true },
    { id: "invoice", text: "Olá {{1}}, sua fatura vence em {{2}}.", hasParams: true },
    { id: "welcome", text: "Bem-vindo à nossa plataforma! Seu onboarding começa agora.", hasParams: false },
  ]

  const getSelectedTemplate = () => {
    return templates.find((t) => t.id === selectedTemplate)
  }

  useEffect(() => {
    if (selectedTemplate) {
      const template = getSelectedTemplate()
      if (template) {
        let message = template.text

        // Replace parameters in the message
        Object.entries(params).forEach(([key, value]) => {
          message = message.replace(`{{${key}}}`, value || `{{${key}}}`)
        })

        setPreviewMessage(message)
      }
    }
  }, [selectedTemplate, params])

  const handleSend = () => {
    const template = getSelectedTemplate()
    if (template) {
      onSendTemplateAction({
        message: template.text,
        params,
      })
    }
  }

  const handleParamChange = (paramId: string, value: string) => {
    setParams((prev) => ({
      ...prev,
      [paramId]: value,
    }))
  }

  const getEffectivePhoneCode = () => {
    if (phoneCode === "custom") {
      return customCode
    }
    return phoneCode
  }

  // Get theme-based colors
  const getThemeColors = () => {
    const currentGradient = themeSettings?.currentGradient

    if (currentGradient === "Pure Black") {
      return {
        bg: "#000000",
        bgSecondary: "#0a0a0a",
        bgCard: "#111111",
        text: "#ffffff",
        textSecondary: "#e5e5e5",
        textMuted: "#a0a0a0",
        border: "#333333",
        glow: "rgba(255, 255, 255, 0.8)",
      }
    } else if (currentGradient === "Pure White") {
      return {
        bg: "#ffffff",
        bgSecondary: "#f8fafc",
        bgCard: "#f1f5f9",
        text: "#000000",
        textSecondary: "#1f2937",
        textMuted: "#4b5563",
        border: "#e2e8f0",
        glow: "rgba(0, 0, 0, 0.8)",
      }
    } else {
      // Default theme colors
      return theme === "dark"
        ? {
            bg: "#1a1a1a",
            bgSecondary: "#0f0f0f",
            bgCard: "#222222",
            text: "#ffffff",
            textSecondary: "#e5e5e5",
            textMuted: "#9ca3af",
            border: "#333333",
            glow: "var(--chat-glow-color)",
          }
        : {
            bg: "#ffffff",
            bgSecondary: "#f8fafc",
            bgCard: "#f1f5f9",
            text: "#1f2937",
            textSecondary: "#374151",
            textMuted: "#6b7280",
            border: "#e2e8f0",
            glow: "var(--chat-glow-color)",
          }
    }
  }

  const themeColors = getThemeColors()

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div
        className="w-full max-w-md rounded-lg overflow-hidden transition-all duration-300"
        style={{
          background: `linear-gradient(180deg, ${themeColors.bg} 0%, ${themeColors.bgSecondary} 100%)`,
          boxShadow: themeSettings?.glowEffects
            ? `0 0 50px ${themeColors.glow}, 0 0 100px ${themeColors.glow.replace("0.8", "0.3")}`
            : "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          border: themeSettings?.glowEffects ? `1px solid ${themeColors.glow}` : `1px solid ${themeColors.border}`,
        }}
      >
        {/* Header */}
        <div
          className="p-4 border-b flex items-center justify-between transition-all duration-300"
          style={{
            borderColor: themeColors.border,
            background: `linear-gradient(90deg, ${themeColors.bgSecondary} 0%, ${themeColors.bg} 100%)`,
            boxShadow: themeSettings?.glowEffects ? `0 0 20px ${themeColors.glow.replace("0.8", "0.3")}` : "none",
          }}
        >
          <h3
            className={`font-semibold text-lg transition-all duration-300 ${
              themeSettings?.fadeEnabled ? "chat-fade-text" : ""
            } ${themeSettings?.glowEffects ? "chat-glow-title" : ""} ${themeSettings?.textAnimations ? "chat-text-animated" : ""}`}
            style={{
              color: themeColors.text,
              textShadow: themeSettings?.glowEffects
                ? `0 0 20px ${themeColors.glow}, 0 0 40px ${themeColors.glow.replace("0.8", "0.4")}`
                : "none",
            }}
          >
            Nova mensagem ativa
          </h3>
          <Button
            onClick={onCloseAction}
            variant="ghost"
            size="sm"
            className={`rounded-full w-8 h-8 p-0 transition-all duration-300 transform hover:scale-110 ${themeSettings?.textAnimations ? "chat-text-animated" : ""}`}
            style={{
              background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
              color: "#ffffff",
              boxShadow: themeSettings?.glowEffects ? "0 0 20px #ef4444, 0 0 40px rgba(239, 68, 68, 0.3)" : "none",
              border: themeSettings?.glowEffects ? "1px solid #ef4444" : "none",
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-4 space-y-6">
          {/* Warning */}
          <div
            className="rounded-lg p-3 flex items-center space-x-3 transition-all duration-300"
            style={{
              background:
                theme === "dark"
                  ? "linear-gradient(135deg, rgba(217, 119, 6, 0.3) 0%, rgba(180, 83, 9, 0.2) 100%)"
                  : "linear-gradient(135deg, rgba(252, 211, 77, 0.3) 0%, rgba(245, 158, 11, 0.2) 100%)",
              border: `1px solid ${theme === "dark" ? "rgba(217, 119, 6, 0.5)" : "rgba(245, 158, 11, 0.5)"}`,
              boxShadow: themeSettings?.glowEffects ? `0 0 15px ${theme === "dark" ? "#d97706" : "#f59e0b"}` : "none",
            }}
          >
            <AlertTriangle
              className={`w-5 h-5 transition-all duration-300 ${themeSettings?.glowEffects ? "chat-glow-title" : ""}`}
              style={{
                color: theme === "dark" ? "#fbbf24" : "#d97706",
                filter: themeSettings?.glowEffects
                  ? `drop-shadow(0 0 10px ${theme === "dark" ? "#fbbf24" : "#d97706"})`
                  : "none",
              }}
            />
            <p
              className={`text-sm transition-all duration-300 ${themeSettings?.fadeEnabled ? "chat-fade-text" : ""} ${themeSettings?.glowEffects ? "chat-glow-title" : ""}`}
              style={{
                color: theme === "dark" ? "#fcd34d" : "#92400e",
                textShadow: themeSettings?.glowEffects
                  ? `0 0 10px ${theme === "dark" ? "#fcd34d" : "#92400e"}`
                  : "none",
              }}
            >
              Certifique-se de que o número está correto
            </p>
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <label
              className={`block text-sm font-medium transition-all duration-300 ${themeSettings?.fadeEnabled ? "chat-fade-text" : ""} ${themeSettings?.glowEffects ? "chat-glow-title" : ""}`}
              style={{
                color: themeColors.text,
                textShadow: themeSettings?.glowEffects ? `0 0 15px ${themeColors.glow}` : "none",
              }}
            >
              Número de Telefone
            </label>
            <div className="flex space-x-2">
              <Select value={phoneCode} onValueChange={setPhoneCode}>
                <SelectTrigger
                  className={`w-40 transition-all duration-300 ${themeSettings?.glowEffects ? "focus:chat-glow-border" : ""}`}
                  style={{
                    backgroundColor: themeColors.bgCard,
                    borderColor: themeColors.border,
                    color: themeColors.textSecondary,
                    boxShadow: themeSettings?.glowEffects
                      ? `0 0 10px ${themeColors.glow.replace("0.8", "0.3")}`
                      : "none",
                  }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  className="transition-all duration-300"
                  style={{
                    backgroundColor: themeColors.bgCard,
                    borderColor: themeColors.border,
                    color: themeColors.text,
                    boxShadow: themeSettings?.glowEffects
                      ? `0 0 20px ${themeColors.glow.replace("0.8", "0.3")}`
                      : "none",
                  }}
                >
                  <SelectItem value="+55" style={{ color: themeColors.text }}>
                    +55 (Brasil)
                  </SelectItem>
                  <SelectItem value="+1" style={{ color: themeColors.text }}>
                    +1 (EUA/Canadá)
                  </SelectItem>
                  <SelectItem value="+44" style={{ color: themeColors.text }}>
                    +44 (Reino Unido)
                  </SelectItem>
                  <SelectItem value="custom" style={{ color: themeColors.text }}>
                    Personalizado
                  </SelectItem>
                </SelectContent>
              </Select>

              {phoneCode === "custom" && (
                <Input
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  placeholder="+XX"
                  className={`w-20 transition-all duration-300 ${themeSettings?.glowEffects ? "focus:chat-glow-border" : ""}`}
                  style={{
                    backgroundColor: themeColors.bgCard,
                    borderColor: themeColors.border,
                    color: themeColors.textSecondary,
                    boxShadow: themeSettings?.glowEffects
                      ? `0 0 10px ${themeColors.glow.replace("0.8", "0.3")}`
                      : "none",
                  }}
                />
              )}

              <Input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Número completo com DDD"
                className={`flex-1 transition-all duration-300 ${themeSettings?.glowEffects ? "focus:chat-glow-border" : ""}`}
                style={{
                  backgroundColor: themeColors.bgCard,
                  borderColor: themeColors.border,
                  color: themeColors.textSecondary,
                  boxShadow: themeSettings?.glowEffects ? `0 0 10px ${themeColors.glow.replace("0.8", "0.3")}` : "none",
                }}
              />
            </div>
          </div>

          {/* Message Templates */}
          <div className="space-y-2">
            <label
              className={`block text-sm font-medium transition-all duration-300 ${themeSettings?.fadeEnabled ? "chat-fade-text" : ""} ${themeSettings?.glowEffects ? "chat-glow-title" : ""}`}
              style={{
                color: themeColors.text,
                textShadow: themeSettings?.glowEffects ? `0 0 15px ${themeColors.glow}` : "none",
              }}
            >
              Escolha a mensagem desejada
            </label>
            <RadioGroup value={selectedTemplate || ""} onValueChange={setSelectedTemplate}>
              <div className="space-y-2">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`flex items-center space-x-2 p-3 rounded-lg border transition-all duration-300 ${themeSettings?.textAnimations ? "chat-text-animated hover:scale-[1.02]" : ""}`}
                    style={{
                      borderColor: themeColors.border,
                      backgroundColor: themeColors.bgCard,
                      boxShadow: themeSettings?.glowEffects
                        ? `0 0 10px ${themeColors.glow.replace("0.8", "0.2")}`
                        : "none",
                    }}
                  >
                    <RadioGroupItem
                      value={template.id}
                      id={template.id}
                      className="transition-all duration-300"
                      style={{
                        borderColor: themeSettings?.glowEffects ? themeColors.glow : "#3b82f6",
                        color: "#3b82f6",
                      }}
                    />
                    <Label
                      htmlFor={template.id}
                      className={`flex-1 cursor-pointer transition-all duration-300 ${themeSettings?.fadeEnabled ? "chat-fade-text" : ""} ${themeSettings?.glowEffects ? "chat-glow-title" : ""}`}
                      style={{
                        color: themeColors.textSecondary,
                        textShadow: themeSettings?.glowEffects ? `0 0 10px ${themeColors.glow}` : "none",
                      }}
                    >
                      {template.text}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Parameters */}
          {selectedTemplate && getSelectedTemplate()?.hasParams && (
            <div className="space-y-4">
              <label
                className={`block text-sm font-medium transition-all duration-300 ${themeSettings?.fadeEnabled ? "chat-fade-text" : ""} ${themeSettings?.glowEffects ? "chat-glow-title" : ""}`}
                style={{
                  color: themeColors.text,
                  textShadow: themeSettings?.glowEffects ? `0 0 15px ${themeColors.glow}` : "none",
                }}
              >
                Preencha os parâmetros
              </label>

              {/* Parameter fields based on selected template */}
              {selectedTemplate === "id" && (
                <div className="space-y-2">
                  <label
                    className={`block text-xs transition-all duration-300 ${themeSettings?.fadeEnabled ? "chat-fade-text" : ""}`}
                    style={{ color: themeColors.textMuted }}
                  >
                    Parâmetro 1:
                  </label>
                  <Input
                    value={params["1"] || ""}
                    onChange={(e) => handleParamChange("1", e.target.value)}
                    placeholder="Valor para {1}"
                    className={`transition-all duration-300 ${themeSettings?.glowEffects ? "focus:chat-glow-border" : ""}`}
                    style={{
                      backgroundColor: themeColors.bgCard,
                      borderColor: themeColors.border,
                      color: themeColors.textSecondary,
                      boxShadow: themeSettings?.glowEffects
                        ? `0 0 10px ${themeColors.glow.replace("0.8", "0.3")}`
                        : "none",
                    }}
                  />
                </div>
              )}

              {selectedTemplate === "invoice" && (
                <>
                  <div className="space-y-2">
                    <label
                      className={`block text-xs transition-all duration-300 ${themeSettings?.fadeEnabled ? "chat-fade-text" : ""}`}
                      style={{ color: themeColors.textMuted }}
                    >
                      Parâmetro 1:
                    </label>
                    <Input
                      value={params["1"] || ""}
                      onChange={(e) => handleParamChange("1", e.target.value)}
                      placeholder="Nome do cliente"
                      className={`transition-all duration-300 ${themeSettings?.glowEffects ? "focus:chat-glow-border" : ""}`}
                      style={{
                        backgroundColor: themeColors.bgCard,
                        borderColor: themeColors.border,
                        color: themeColors.textSecondary,
                        boxShadow: themeSettings?.glowEffects
                          ? `0 0 10px ${themeColors.glow.replace("0.8", "0.3")}`
                          : "none",
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      className={`block text-xs transition-all duration-300 ${themeSettings?.fadeEnabled ? "chat-fade-text" : ""}`}
                      style={{ color: themeColors.textMuted }}
                    >
                      Parâmetro 2:
                    </label>
                    <Input
                      value={params["2"] || ""}
                      onChange={(e) => handleParamChange("2", e.target.value)}
                      placeholder="Data de vencimento"
                      className={`transition-all duration-300 ${themeSettings?.glowEffects ? "focus:chat-glow-border" : ""}`}
                      style={{
                        backgroundColor: themeColors.bgCard,
                        borderColor: themeColors.border,
                        color: themeColors.textSecondary,
                        boxShadow: themeSettings?.glowEffects
                          ? `0 0 10px ${themeColors.glow.replace("0.8", "0.3")}`
                          : "none",
                      }}
                    />
                  </div>
                </>
              )}

              {/* Preview */}
              {selectedTemplate && (
                <div
                  className="mt-4 p-3 border rounded-lg transition-all duration-300"
                  style={{
                    borderColor: themeColors.border,
                    backgroundColor: themeColors.bgSecondary,
                    boxShadow: themeSettings?.glowEffects
                      ? `0 0 15px ${themeColors.glow.replace("0.8", "0.2")}`
                      : "none",
                  }}
                >
                  <label
                    className={`block text-xs mb-1 transition-all duration-300 ${themeSettings?.fadeEnabled ? "chat-fade-text" : ""}`}
                    style={{ color: themeColors.textMuted }}
                  >
                    Preview:
                  </label>
                  <p
                    className={`text-sm transition-all duration-300 ${themeSettings?.fadeEnabled ? "chat-fade-text" : ""} ${themeSettings?.glowEffects ? "chat-glow-title" : ""}`}
                    style={{
                      color: themeColors.text,
                      textShadow: themeSettings?.glowEffects ? `0 0 10px ${themeColors.glow}` : "none",
                    }}
                  >
                    {previewMessage}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Send Button */}
          <Button
            onClick={handleSend}
            disabled={!selectedTemplate || (getSelectedTemplate()?.hasParams && Object.keys(params).length === 0)}
            className={`w-full py-2 transition-all duration-300 transform hover:scale-105 ${themeSettings?.textAnimations ? "chat-text-animated" : ""}`}
            style={{
              background:
                !selectedTemplate || (getSelectedTemplate()?.hasParams && Object.keys(params).length === 0)
                  ? themeColors.textMuted
                  : "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
              color: "#ffffff",
              boxShadow:
                themeSettings?.glowEffects &&
                selectedTemplate &&
                (!getSelectedTemplate()?.hasParams || Object.keys(params).length > 0)
                  ? "0 0 25px #3b82f6, 0 0 50px rgba(59, 130, 246, 0.3)"
                  : "none",
              border: themeSettings?.glowEffects ? "1px solid #3b82f6" : "none",
              textShadow: themeSettings?.glowEffects ? "0 0 15px rgba(255, 255, 255, 0.8)" : "none",
            }}
          >
            Enviar Template
          </Button>
        </div>
      </div>
    </div>
  )
}
