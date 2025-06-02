export interface Message {
  id: string
  content: string
  role: "user" | "assistant" | "system"
  timestamp: Date
  status: "sent" | "delivered" | "read" | "error"
}

export interface Conversation {
  id: string
  title: string
  lastMessage?: string
  messages: Message[]
  unreadCount: number
  status: string
  createdAt: Date
  updatedAt: Date
  isPinned: boolean
  situacao?: string
  isArchived?: boolean
  showDetails?: boolean
}

export interface AIAgent {
  id: string
  name: string
  status: "online" | "offline" | "away"
}

export interface ChatSettings {
  theme: "dark" | "light"
  glowEffects: boolean
  animations: boolean
  sounds: boolean
  notifications: boolean
  isFullscreen: boolean
}

export interface ThemeSettings {
  glowEffects: boolean
  textAnimations: boolean
  glowIntensity: number
  glowThickness: number
  glowAnimation: boolean
  fadeMode: string
  fadeColor1: string
  fadeColor2: string
  fadeSpeed: number
  fadeEnabled: boolean
  currentGradient: string
}
