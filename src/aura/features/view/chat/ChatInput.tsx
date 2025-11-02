"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Mic, MicOff, Smile, Paperclip, Square } from "lucide-react"
import EmojiPicker from "./EmojiPicker"
import type { ThemeSettings } from "./ChatTemplate"

interface ChatInputProps {
  onSendMessageAction: (message: string) => void
  theme: string
  themeSettings: ThemeSettings
  disabled?: boolean
}

// Componente para placeholder animado
const AnimatedPlaceholder = ({
  theme,
  themeSettings,
  disabled,
}: { theme: string; themeSettings: ThemeSettings; disabled?: boolean }) => {
  const text = disabled ? "API indisponível - conecte o backend" : "Digite uma mensagem..."
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (!themeSettings.textAnimations || disabled) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= text.length - 1) {
          setIsVisible(false)
          setTimeout(() => {
            setIsVisible(true)
          }, 500)
          return 0
        }
        return prev + 1
      })
    }, 150)

    return () => clearInterval(interval)
  }, [themeSettings.textAnimations, disabled, text])

  // Get theme-based colors
  const getThemeColors = () => {
    const currentGradient = themeSettings.currentGradient

    if (currentGradient === "Pure Black") {
      return {
        text: disabled ? "#666666" : "#a0a0a0",
      }
    } else if (currentGradient === "Pure White") {
      return {
        text: disabled ? "#999999" : "#4b5563",
      }
    } else {
      return theme === "dark"
        ? {
            text: disabled ? "#666666" : "#9ca3af",
          }
        : {
            text: disabled ? "#999999" : "#6b7280",
          }
    }
  }

  const themeColors = getThemeColors()

  if (!themeSettings.textAnimations || disabled) {
    return (
      <span
        className={`transition-all duration-300 ${themeSettings.fadeEnabled && !disabled ? "chat-fade-text" : ""} ${themeSettings.glowEffects && !disabled ? "chat-glow-title" : ""}`}
        style={{
          color: themeColors.text,
          textShadow: themeSettings.glowEffects && !disabled ? `0 0 10px var(--chat-glow-color)` : "none",
        }}
      >
        {text}
      </span>
    )
  }

  return (
    <span className="relative">
      {text.split("").map((char, index) => (
        <span
          key={index}
          className={`transition-all duration-300 ${
            index <= currentIndex && isVisible
              ? `${themeSettings.fadeEnabled ? "chat-fade-text" : ""} ${themeSettings.glowEffects ? "chat-glow-title" : ""} opacity-100`
              : "opacity-30"
          }`}
          style={
            index <= currentIndex && isVisible && themeSettings.glowEffects
              ? {
                  color: themeColors.text,
                  textShadow: `0 0 8px var(--chat-glow-color)`,
                  animation: "glow-pulse 1s ease-in-out infinite alternate",
                }
              : {
                  color: themeColors.text,
                }
          }
        >
          {char}
        </span>
      ))}
      {isVisible && (
        <span
          className={`ml-1 animate-pulse ${themeSettings.fadeEnabled ? "chat-fade-text" : ""} ${themeSettings.glowEffects ? "chat-glow-title" : ""}`}
          style={
            themeSettings.glowEffects
              ? {
                  color: themeColors.text,
                  textShadow: `0 0 15px var(--chat-glow-color)`,
                }
              : {
                  color: themeColors.text,
                }
          }
        >
          |
        </span>
      )}
    </span>
  )
}

export default function ChatInput({ onSendMessageAction, theme, themeSettings, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [hasRecordedAudio, setHasRecordedAudio] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Get theme-based colors
  const getThemeColors = () => {
    const currentGradient = themeSettings.currentGradient

    if (currentGradient === "Pure Black") {
      return {
        bg: disabled ? "#0a0a0a" : "#1a1a1a",
        border: disabled ? "#222222" : "#333333",
        text: disabled ? "#666666" : "#ffffff",
        textMuted: disabled ? "#444444" : "#a0a0a0",
        glow: "rgba(255, 255, 255, 0.8)",
      }
    } else if (currentGradient === "Pure White") {
      return {
        bg: disabled ? "#f0f0f0" : "#ffffff",
        border: disabled ? "#d0d0d0" : "#e2e8f0",
        text: disabled ? "#999999" : "#1f2937",
        textMuted: disabled ? "#bbbbbb" : "#4b5563",
        glow: "rgba(0, 0, 0, 0.8)",
      }
    } else {
      return theme === "dark"
        ? {
            bg: disabled ? "#0a0a0a" : "#1a1a1a",
            border: disabled ? "#222222" : "#374151",
            text: disabled ? "#666666" : "#ffffff",
            textMuted: disabled ? "#444444" : "#9ca3af",
            glow: "var(--chat-glow-color)",
          }
        : {
            bg: disabled ? "#f0f0f0" : "#ffffff",
            border: disabled ? "#d0d0d0" : "#d1d5db",
            text: disabled ? "#999999" : "#1f2937",
            textMuted: disabled ? "#bbbbbb" : "#6b7280",
            glow: "var(--chat-glow-color)",
          }
    }
  }

  const themeColors = getThemeColors()

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const startRecording = async () => {
    if (disabled) return

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      const chunks: BlobPart[] = []
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/wav" })
        setAudioBlob(blob)
        setHasRecordedAudio(true)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      console.error("Error starting recording:", error)
      alert("Erro ao acessar o microfone. Verifique as permissões.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }
  }

  const cancelRecording = () => {
    if (isRecording) {
      stopRecording()
    }
    setAudioBlob(null)
    setHasRecordedAudio(false)
    setRecordingTime(0)
  }

  const sendAudio = () => {
    if (audioBlob && !disabled) {
      // Convert audio blob to base64 or upload to server
      const reader = new FileReader()
      reader.onload = () => {
        const audioData = reader.result as string
        onSendMessageAction(`Audio gravado (${formatTime(recordingTime)})`)
        // TODO: Implement actual audio upload to server
        console.log("Audio data:", audioData.substring(0, 100) + "...")
      }
      reader.readAsDataURL(audioBlob)

      setAudioBlob(null)
      setHasRecordedAudio(false)
      setRecordingTime(0)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && !disabled) {
      const reader = new FileReader()
      reader.onload = () => {
        const fileData = reader.result as string
        const fileType = file.type.startsWith("image/") ? "[imagem]" : "[arquivo]"
        onSendMessageAction(`${fileType} ${file.name} (${(file.size / 1024).toFixed(1)}KB)`)
        // TODO: Implement actual file upload to server
        console.log("File data:", fileData.substring(0, 100) + "...")
      }
      reader.readAsDataURL(file)
    }
    // Reset input
    event.target.value = ""
  }

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessageAction(message)
      setMessage("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !disabled) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleEmojiSelect = (emoji: string) => {
    if (!disabled) {
      setMessage((prev) => prev + emoji)
      setShowEmojiPicker(false)
      inputRef.current?.focus()
    }
  }

  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }
  }, [])

  return (
    <div
      className={`border-t p-4 transition-all duration-300 ${themeSettings.glowEffects && !disabled ? "chat-glow-container" : ""} ${disabled ? "opacity-60" : ""}`}
      style={{
        backgroundColor: themeColors.bg,
        borderColor: themeColors.border,
        boxShadow: themeSettings.glowEffects && !disabled ? `0 -2px 20px var(--chat-glow-color-light)` : "none",
      }}
    >
      {disabled && (
        <div className="mb-3 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400 text-sm text-center">
            Chat indisponível - execute o backend para enviar mensagens
          </p>
        </div>
      )}

      {/* Audio Recording State */}
      {(isRecording || hasRecordedAudio) && !disabled && (
        <div
          className={`mb-4 p-3 rounded-lg border transition-all duration-300 ${themeSettings.glowEffects ? "chat-glow-border" : ""}`}
          style={{
            backgroundColor: theme === "dark" ? "#374151" : "#f3f4f6",
            borderColor: themeColors.border,
            boxShadow: themeSettings.glowEffects ? `0 0 15px var(--chat-glow-color-light)` : "none",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isRecording ? (
                <>
                  <div
                    className="w-3 h-3 bg-red-500 rounded-full animate-pulse"
                    style={
                      themeSettings.glowEffects
                        ? {
                            boxShadow: "0 0 10px #ef4444, 0 0 20px #ef4444",
                          }
                        : {}
                    }
                  ></div>
                  <span
                    className={`text-sm font-mono transition-all duration-300 ${themeSettings.fadeEnabled ? "chat-fade-text" : ""} ${themeSettings.glowEffects ? "chat-glow-title" : ""} ${themeSettings.textAnimations ? "chat-text-animated" : ""}`}
                    style={{
                      color: themeColors.text,
                      textShadow: themeSettings.glowEffects ? `0 0 15px var(--chat-glow-color)` : "none",
                    }}
                  >
                    Gravando... {formatTime(recordingTime)}
                  </span>
                </>
              ) : (
                <>
                  <div
                    className="w-3 h-3 bg-green-500 rounded-full"
                    style={
                      themeSettings.glowEffects
                        ? {
                            boxShadow: "0 0 10px #10b981, 0 0 20px #10b981",
                          }
                        : {}
                    }
                  ></div>
                  <span
                    className={`text-sm font-mono transition-all duration-300 ${themeSettings.fadeEnabled ? "chat-fade-text" : ""} ${themeSettings.glowEffects ? "chat-glow-title" : ""} ${themeSettings.textAnimations ? "chat-text-animated" : ""}`}
                    style={{
                      color: themeColors.text,
                      textShadow: themeSettings.glowEffects ? `0 0 15px var(--chat-glow-color)` : "none",
                    }}
                  >
                    Áudio gravado: {formatTime(recordingTime)}
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {isRecording ? (
                <Button
                  onClick={stopRecording}
                  size="sm"
                  className={`bg-red-600 hover:bg-red-700 text-white transition-all duration-300 transform hover:scale-105 ${themeSettings.textAnimations ? "chat-text-animated" : ""} ${themeSettings.glowEffects ? "chat-glow-border" : ""}`}
                  style={
                    themeSettings.glowEffects
                      ? {
                          boxShadow: "0 0 20px #ef4444",
                          textShadow: "0 0 8px rgba(255, 255, 255, 0.8)",
                        }
                      : {}
                  }
                >
                  <Square className="w-4 h-4 mr-1" />
                  Parar
                </Button>
              ) : (
                <>
                  <Button
                    onClick={sendAudio}
                    size="sm"
                    className={`bg-green-600 hover:bg-green-700 text-white transition-all duration-300 transform hover:scale-105 ${themeSettings.textAnimations ? "chat-text-animated" : ""} ${themeSettings.glowEffects ? "chat-glow-border" : ""}`}
                    style={
                      themeSettings.glowEffects
                        ? {
                            boxShadow: "0 0 20px #10b981",
                            textShadow: "0 0 8px rgba(255, 255, 255, 0.8)",
                          }
                        : {}
                    }
                  >
                    <Send className="w-4 h-4 mr-1" />
                    Enviar
                  </Button>
                  <Button
                    onClick={cancelRecording}
                    size="sm"
                    variant="outline"
                    className={`transition-all duration-300 transform hover:scale-105 ${themeSettings.textAnimations ? "chat-text-animated" : ""} ${themeSettings.glowEffects ? "chat-glow-border" : ""}`}
                    style={
                      themeSettings.glowEffects
                        ? {
                            borderColor: "var(--chat-glow-color)",
                            boxShadow: `0 0 10px var(--chat-glow-color-light)`,
                            color: themeColors.text,
                          }
                        : {
                            color: themeColors.text,
                            borderColor: themeColors.border,
                          }
                    }
                  >
                    Cancelar
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Emoji Picker */}
      {showEmojiPicker && !disabled && (
        <div className="mb-4">
          <EmojiPicker onEmojiSelectAction={handleEmojiSelect} theme={theme} />
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-center space-x-2">
        {/* Attachment Button */}
        <div className="relative">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileUpload}
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
            disabled={disabled}
          />
          <Button
            variant="ghost"
            size="icon"
            disabled={disabled}
            onClick={() => document.getElementById("file-upload")?.click()}
            className={`transition-all duration-300 transform hover:scale-110 ${themeSettings.textAnimations ? "chat-text-animated" : ""} ${themeSettings.glowEffects && !disabled ? "chat-glow-title hover:chat-glow-border" : ""}`}
            style={{
              color: themeColors.textMuted,
              filter: themeSettings.glowEffects && !disabled ? `drop-shadow(0 0 8px var(--chat-glow-color))` : "none",
            }}
          >
            <Paperclip className="w-5 h-5" />
          </Button>
        </div>

        {/* Message Input */}
        <div className="flex-1 relative">
          <div className="relative">
            <Input
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              disabled={disabled || isRecording || hasRecordedAudio}
              className={`pr-12 transition-all duration-300 ${themeSettings.glowEffects && !disabled ? "focus:chat-glow-border" : ""} ${themeSettings.fadeEnabled ? "chat-fade-text" : ""}`}
              style={{
                backgroundColor: theme === "dark" ? "#374151" : "#f9fafb",
                borderColor: themeColors.border,
                color: themeColors.text,
                boxShadow:
                  themeSettings.glowEffects && isFocused && !disabled
                    ? `0 0 20px var(--chat-glow-color-light)`
                    : "none",
              }}
            />
            {!message && !isFocused && (
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <AnimatedPlaceholder theme={theme} themeSettings={themeSettings} disabled={disabled} />
              </div>
            )}
          </div>

          {/* Emoji Button */}
          <Button
            onClick={() => !disabled && setShowEmojiPicker(!showEmojiPicker)}
            variant="ghost"
            size="icon"
            disabled={disabled}
            className={`absolute right-1 top-1/2 transform -translate-y-1/2 w-8 h-8 transition-all duration-300 transform hover:scale-110 ${themeSettings.textAnimations ? "chat-text-animated" : ""} ${themeSettings.glowEffects && !disabled ? "chat-glow-title" : ""}`}
            style={{
              color: themeColors.textMuted,
              filter: themeSettings.glowEffects && !disabled ? `drop-shadow(0 0 8px var(--chat-glow-color))` : "none",
            }}
          >
            <Smile className="w-4 h-4" />
          </Button>
        </div>

        {/* Voice/Send Button */}
        {message.trim() || hasRecordedAudio ? (
          <Button
            onClick={hasRecordedAudio ? sendAudio : handleSend}
            disabled={disabled}
            className={`transition-all duration-300 transform hover:scale-105 ${themeSettings.textAnimations ? "chat-text-animated" : ""} ${themeSettings.glowEffects && !disabled ? "chat-glow-border" : ""}`}
            style={
              themeSettings.glowEffects && !disabled
                ? {
                    background: "var(--chat-gradient-primary)",
                    boxShadow: `0 0 20px var(--chat-glow-color)`,
                    textShadow: "0 0 8px rgba(255, 255, 255, 0.8)",
                    color: "#ffffff",
                  }
                : {
                    background: disabled ? "#666666" : "var(--chat-gradient-primary)",
                    color: "#ffffff",
                  }
            }
          >
            <Send className="w-5 h-5" />
          </Button>
        ) : (
          <Button
            onClick={isRecording ? stopRecording : startRecording}
            variant={isRecording ? "destructive" : "ghost"}
            size="icon"
            disabled={disabled}
            className={`transition-all duration-300 transform hover:scale-110 ${themeSettings.textAnimations ? "chat-text-animated" : ""} ${themeSettings.glowEffects && !disabled ? "chat-glow-title hover:chat-glow-border" : ""}`}
            style={
              isRecording
                ? {
                    background: "#ef4444",
                    color: "#ffffff",
                    boxShadow: themeSettings.glowEffects ? "0 0 20px #ef4444" : "none",
                  }
                : {
                    color: themeColors.textMuted,
                    filter:
                      themeSettings.glowEffects && !disabled ? `drop-shadow(0 0 8px var(--chat-glow-color))` : "none",
                  }
            }
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </Button>
        )}
      </div>
    </div>
  )
}
