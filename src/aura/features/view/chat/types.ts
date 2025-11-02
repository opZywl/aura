/**
 * Representa uma única mensagem dentro de uma conversa.
 * Cada mensagem pertence a um `Conversation`.
 */
export interface Message {
    /** Identificador único da mensagem */
    id: string

    /** Conteúdo textual da mensagem */
    content: string

    /** Origem da mensagem — enviada pelo usuário, assistente ou sistema */
    role: "user" | "assistant" | "system"

    /** Data e hora em que a mensagem foi criada */
    timestamp: Date

    /** Estado de entrega da mensagem */
    status: "sent" | "delivered" | "read" | "error"
}

/**
 * Representa uma conversa completa (chat entre usuário e assistente).
 * Contém uma lista de mensagens e metadados.
 */
export interface Conversation {
    /** Identificador único da conversa */
    id: string

    /** Título da conversa — mostrado na lista lateral */
    title: string

    /** Última mensagem (resumo da conversa) */
    lastMessage?: string

    /** Histórico de mensagens trocadas */
    messages: Message[]

    /** Quantidade de mensagens não lidas */
    unreadCount: number

    /** Estado da conversa (ex: "Ativo", "Encerrado", "Em espera") */
    status: string

    /** Data de criação da conversa */
    createdAt: Date

    /** Data da última atualização */
    updatedAt: Date

    /** Indica se a conversa está fixada no topo */
    isPinned: boolean

    /** Situação opcional (por exemplo, "aguardando resposta") */
    situacao?: string

    /** Indica se a conversa foi arquivada */
    isArchived?: boolean

    /** Define se os detalhes da conversa estão visíveis no painel lateral */
    showDetails?: boolean

    /** Plataforma de origem (por exemplo: "WhatsApp", "Web", "Telegram") */
    platform?: string

    /** Data formatada para exibição no painel de detalhes */
    messageDate?: string

    /** Quantidade de dias desde a criação da conversa */
    daysCount?: number
}

/**
 * Representa o agente de IA com quem o usuário está conversando.
 */
export interface AIAgent {
    /** Identificador único do agente */
    id: string

    /** Nome do agente exibido no chat */
    name: string

    /** Status atual do agente (online, offline, ausente) */
    status: "online" | "offline" | "away"
}

/**
 * Configurações gerais da interface do chat.
 * Controla aparência, notificações e comportamento visual.
 */
export interface ChatSettings {
    /** Tema ativo do chat: modo claro ou escuro */
    theme: "dark" | "light"

    /** Efeitos de brilho (glow) em elementos da interface */
    glowEffects: boolean

    /** Animações ativas (transições suaves, fade, etc.) */
    animations: boolean

    /** Habilita sons ao enviar/receber mensagens */
    sounds: boolean

    /** Notificações visuais ou de sistema */
    notifications: boolean

    /** Exibe o chat em modo tela cheia */
    isFullscreen: boolean
}

/**
 * Configurações avançadas do tema visual.
 * Permite controlar intensidade, cores e animações de gradiente.
 */
export interface ThemeSettings {
    /** Efeitos de brilho (glow) nos elementos */
    glowEffects: boolean

    /** Animações de texto (ex: digitação simulada, fade) */
    textAnimations: boolean

    /** Intensidade do brilho (0–10 recomendado) */
    glowIntensity: number

    /** Espessura da borda luminosa */
    glowThickness: number

    /** Ativa ou desativa a animação do brilho */
    glowAnimation: boolean

    /** Tipo de fade aplicado ao fundo (ex: linear, radial, pulse) */
    fadeMode: string

    /** Cor inicial do gradiente animado */
    fadeColor1: string

    /** Cor final do gradiente animado */
    fadeColor2: string

    /** Velocidade de transição do gradiente */
    fadeSpeed: number

    /** Define se o gradiente animado está ativo */
    fadeEnabled: boolean

    /** Valor atual do gradiente (string CSS gerada dinamicamente) */
    currentGradient: string
}
