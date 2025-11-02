"use client"

import type React from "react"

import { createContext, useContext, useMemo, type ReactNode } from "react"

// Tipo recursivo para suportar strings, números, booleanos, arrays e objetos aninhados
export type TranslationValue =
  | string
  | number
  | boolean
  | TranslationValue[]
  | { [key: string]: TranslationValue }

interface LanguageContextType {
  t: (key: string) => TranslationValue
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const translations: { [key: string]: TranslationValue } = {
  // Geral
  common: {
    search: "Pesquisar",
    searchPlaceholder: "Pesquisar no menu...",
    welcome: "Olá",
    hello: "Olá",
    loading: "Carregando...",
    save: "Salvar",
    cancel: "Cancelar",
    delete: "Excluir",
    edit: "Editar",
    add: "Adicionar",
    update: "Atualizar",
    yes: "Sim",
    no: "Não",
    confirm: "Confirmar",
    success: "Sucesso",
    error: "Erro",
    warning: "Aviso",
    info: "Informação",
    close: "Fechar",
    back: "Voltar",
    next: "Próximo",
    previous: "Anterior",
    actions: "Ações",
    seeAll: "Ver todos",
    noResults: "Nenhum resultado encontrado",
    tryAgain: "Tentar novamente",
    emDevelopment: "EM DESENVOLVIMENTO!!!!!!!",
    pixOn: "pix onnnn.",
    upgradeNow: "AURA",
    apply: "Aplicar",
    reset: "Resetar",
    enabled: "Ativado",
    disabled: "Desativado",
    active: "Ativo",
    inactive: "Inativo",
    online: "online",
    offline: "offline",
  },

  // Menu
  menu: {
    dashboard: "Dashboard",
    products: "Produtos",
    account: "Conta",
    lobby: "Lobby",
    analytics: "Analytics",
    chat: "Chat",
    settings: "Configurações",
    components: "Componentes",
    colors: "Cores",
    channels: "Canais",
    menu: "MENU",
    tools: "FERRAMENTAS",
    insights: "INSIGHTS",
    elements: "ELEMENTOS",
    themes: "TEMAS",
    searchResults: "Resultados da busca para",
    noResultsFound: "Nenhum resultado encontrado para",
  },

  // Header
  header: {
    notifications: "Notificações do Chat",
    profile: "Perfil",
    logout: "Sair",
    changePassword: "Alterar Senha",
    settings: "Configurações",
    language: "Idioma",
    theme: "Tema",
    darkMode: "Modo Escuro",
    lightMode: "Modo Claro",
    hello: "Olá Mundo",
    finalize: "Finalizar",
    contactInfo: "Info do Contato",
    disableNotifications: "Desativar Notificações",
    notifyAllMessages: "Notificar Todas Mensagens",
    onlyWaiting: "Somente Aguardando",
    editNickname: "Editar apelido",
  },

  // Chat
  chat: {
    placeholder: "Digite uma mensagem...",
    sendMessage: "Enviar mensagem",
    newConversation: "Nova conversa",
    searchConversations: "Pesquisar conversas...",
    noConversations: "Nenhuma conversa encontrada",
    typing: "digitando...",
    online: "online",
    offline: "offline",
    lastSeen: "visto por último",
    messageDelivered: "Entregue",
    messageRead: "Lida",
    messageSent: "Enviada",
    attachFile: "Anexar arquivo",
    recordAudio: "Gravar áudio",
    sendEmoji: "Enviar emoji",
    stopRecording: "Parar gravação",
    startRecording: "Iniciar gravação",
    audioPermissionDenied: "Permissão de áudio negada",
    fileSelected: "Arquivo selecionado",
    conversationFinalized: "Conversa finalizada com sucesso!",
    confirmFinalize: "Tem certeza que deseja finalizar esta conversa?",
    exitChat: "Sair do Chat",
    active: "Ativo",
    waiting: "Aguardando",
    archived: "Arquivadas",
    details: "Detalhes",
    days: "Dias",
    situation: "Situação",
    inService: "Em Atendimento",
    pending: "Pendente",
    resolved: "Resolvido",
    exitConfirmation: "Deseja realmente sair do chat?",
  },

  // User Account
  userAccount: {
    changePassword: "Alterar Senha",
    settings: "Configurações",
    logout: "Sair",
    currentPassword: "Senha Atual",
    newPassword: "Nova Senha",
    confirmPassword: "Confirmar Nova Senha",
    enterCurrentPassword: "Digite sua senha atual",
    enterNewPassword: "Digite a nova senha",
    confirmNewPassword: "Confirme a nova senha",
    allFieldsRequired: "Todos os campos são obrigatórios",
    passwordsDontMatch: "As senhas não coincidem",
    passwordMinLength: "A nova senha deve ter pelo menos 8 caracteres",
    incorrectCurrentPassword: "Senha atual incorreta",
    changingPassword: "Alterando...",
    changePasswordButton: "Alterar",
    passwordChangedSuccess: "Senha alterada com sucesso!",
  },

  // Home Page
  home: {
    hero: {
      badge: "100% experimental – válido até o final do semestre!",
      title: "Habilidades de Conversação Hoje!",
      subtitle: "Junte-se ao melhor chatbot do planeta 1%!",
      description: "O sucesso dos engenheiros e designers foi graças à passagem por lugares como",
      chatButton: "Fale com AURA",
    },
    about: {
      title: "yzyzyzyzy",
      description1: "flashlightttttttttttts",
      description2: "onsighttttttttttt",
    },
    services: {
      title: "Áreas de Aplicação",
      sales: {
        title: "Vendas",
        description: "omggggg",
      },
      support: {
        title: "Suporte ao Cliente",
        description: "Melhoria da satisfação do cliente com suporte 24 horas.",
      },
      billing: {
        title: "Cobrança",
        description: "Automação de processos de cobrança.",
      },
      scheduling: {
        title: "Agendamento",
        description: "Coordenação automática de horários e reuniões.",
      },
      operations: {
        title: "Operações",
        description: "Automação de processos repetitivos nas operações.",
      },
      custom: {
        title: "Soluções Personalizadas",
        description: "oomgggggg",
      },
    },
    features: {
      title: "Funcionalidades",
      actions: {
        title: "Executa Ações",
        description: "Interação e execução de tarefas.",
      },
      language: {
        title: "Linguagem Humana",
        description: "simmmmmmm",
      },
      integrations: {
        title: "Integrações com Sistemas",
        description: "Conexão com sistemas existentes para uma integração fluida.",
      },
    },
    cta: {
      title: "yesyesyeys",
      description: "botzaoo",
      demoButton: "butaozao2",
      consultButton: "butaozao1",
    },
  },

  // Settings Modal
  settings: {
    title: "Preferências",
    resetDefaults: "Restaurar padrões",
    language: {
      title: "Idioma",
      description: "A interface está disponível apenas em português (Brasil).",
    },
    tabs: {
      general: "Geral",
      visual: "Visual",
      mouse: "Mouse",
      accessibility: "Acessibilidade",
      performance: "Performance",
    },
    animations: {
      title: "Animações Gerais",
      description: "Controle principal de todas as animações",
      enabled: "Ativado",
      disabled: "Desativado",
      backgroundType: "Tipo de Animação de Fundo",
      types: {
        dots: "Pontos",
        particles: "Partículas",
        waves: "Ondas fluidas em movimento",
        geometric: "Formas geométricas animadas",
        neural: "Rede neural interativa",
        matrix: "Matrix com caracteres caindo",
        "matrix-rain": "Matrix Rain Interativo",
        spiral: "Espirais hipnóticas em movimento",
        constellation: "Constelação de estrelas conectadas",
        none: "Nenhum",
        mix: "Mix (Aleatório)",
      },
      descriptions: {
        dots: "Pontos animados flutuantes",
        particles: "Sistema de partículas dinâmico",
        waves: "Ondas fluidas em movimento",
        geometric: "Formas geométricas animadas",
        neural: "Rede neural interativa",
        matrix: "Efeito Matrix com caracteres caindo",
        "matrix-rain": "Efeito Matrix com caracteres japoneses que respondem ao mouse",
        spiral: "Espirais hipnóticas em movimento",
        constellation: "Constelação de estrelas conectadas",
        none: "Sem animações de fundo",
        mix: "Alterna entre todos os tipos automaticamente",
      },
      intensity: "Intensidade das Partículas",
    },
    mouse: {
      title: "Efeitos de Mouse",
      description: "Ativar interações com o mouse nas partículas",
      enabled: "Ativado",
      disabled: "Desativado",
      effectType: "Tipo de Efeito do Mouse",
      types: {
        none: "Nenhum",
        explode: "Explosão",
        fade: "Desaparecer",
        repel: "Repelir",
        attract: "Atrair",
        sparkle: "Brilho",
        rainbow: "Arco-íris",
        magnetic: "Magnético",
        vortex: "Vórtice",
        mix: "Mix (Aleatório)",
      },
      descriptions: {
        none: "Sem efeitos de mouse",
        explode: "Partículas explodem ao passar o mouse",
        fade: "Partículas desaparecem gradualmente",
        repel: "Partículas são repelidas pelo mouse",
        attract: "Partículas são atraídas pelo mouse",
        sparkle: "Efeito de brilho ao passar o mouse",
        rainbow: "Rastro colorido arco-íris",
        magnetic: "Campo magnético que distorce partículas",
        vortex: "Cria um vórtice que puxa as partículas",
        mix: "Alterna entre todos os efeitos automaticamente",
      },
      activeEffect: "Efeito Ativo",
      hoverTip: "Passe o mouse sobre as partículas para ver o efeito!",
    },
    visual: {
      glowEffects: "Efeitos de Brilho",
      glowDescription: "Ativar efeitos de glow e sombras",
      fadeEffects: "Efeitos de Fade",
      fadeDescription: "Ativar transições suaves de fade",
    },
    accessibility: {
      mode: "Modo Acessibilidade",
      modeDescription: "Ativa todas as configurações de acessibilidade automaticamente",
      reducedMotion: "Movimento Reduzido",
      reducedMotionDescription: "Reduz animações complexas e movimentos rápidos",
      highContrast: "Alto Contraste",
      highContrastDescription: "Aumenta o contraste para melhor legibilidade",
      largeText: "Texto Grande",
      largeTextDescription: "Aumenta o tamanho da fonte para melhor leitura",
      focusIndicators: "Indicadores de Foco",
      focusIndicatorsDescription: "Melhora a visibilidade dos elementos focados",
      screenReader: "Otimização para Leitor de Tela",
      screenReaderDescription: "Otimiza a interface para leitores de tela",
      colorBlindness: "Suporte para Daltonismo",
      colorBlindnessDescription: "Ajusta cores para pessoas com daltonismo",
      keyboardNavigation: "Navegação por Teclado",
      keyboardNavigationDescription: "Melhora a navegação usando apenas o teclado",
      activeFeatures: "Modo Acessibilidade Ativo:",
      features: [
        "• Movimento reduzido ativado",
        "• Efeitos de brilho desativados",
        "• Animações de fundo removidas",
        "• Efeitos de mouse desativados",
        "• Intensidade de partículas zerada",
        "• Texto aumentado",
        "• Alto contraste ativado",
        "• Indicadores de foco melhorados",
      ],
    },
    performance: {
      mode: "Modo Performance",
      modeDescription: "Otimiza automaticamente para melhor performance",
      enabled: "Ativado",
      disabled: "Desativado",
      lowEnd: "Dispositivo Básico",
      lowEndDescription: "Otimizações para dispositivos com hardware limitado",
      reducedAnimations: "Animações Reduzidas",
      reducedAnimationsDescription: "Diminui a quantidade de animações simultâneas",
      lowFrameRate: "Taxa de Quadros Reduzida",
      lowFrameRateDescription: "Reduz FPS para economizar recursos",
      preloadOptimization: "Otimização de Carregamento",
      preloadOptimizationDescription: "Otimiza o carregamento de recursos",
      memoryOptimization: "Otimização de Memória",
      memoryOptimizationDescription: "Reduz o uso de memória RAM",
      activeFeatures: "Modo Performance Ativo:",
      features: [
        "• Animações de fundo desativadas",
        "• Efeitos de brilho reduzidos",
        "• Efeitos de fade simplificados",
        "• Efeitos de mouse desativados",
        "• Intensidade de partículas reduzida",
        "• Taxa de quadros limitada",
        "• Uso de memória otimizado",
      ],
      systemStatus: "Status do Sistema",
      animations: "Animações",
      mouseEffects: "Efeitos de Mouse",
      backgroundType: "Tipo de Fundo",
      mouseEffect: "Efeito do Mouse",
      intensity: "Intensidade",
      active: "Ativas",
      inactive: "Inativas",
      frameRate: "Taxa de Quadros",
      memoryUsage: "Uso de Memória",
      batteryLevel: "Nível da Bateria",
    },
  },

  // Home Panels
  homePanels: {
    header: {
      welcome: "Bem-vindo",
      searchPlaceholder: "Buscar no painel...",
      notifications: "Notificações",
      settings: "Configurações",
      theme: "Tema",
    },
    sidebar: {
      searchPlaceholder: "Pesquisar...",
      recent: "Recentes",
      favorites: "Favoritos",
      integrations: "Integrações",
      channels: "Canais",
      support: "Suporte",
      billing: "Cobrança",
      marketing: "Marketing",
      operations: "Operações",
    },
    userAccount: {
      welcomeBack: "Bem-vindo de volta",
      activeSessions: "Sessões Ativas",
      lastAccess: "Último Acesso",
      changePassword: "Alterar Senha",
      logout: "Sair",
    },
    searchPanel: {
      title: "Pesquisar",
      placeholder: "Pesquisar no painel...",
      recentSearches: "Buscas Recentes",
      suggestions: "Sugestões",
      clearAll: "Limpar tudo",
    },
    colorPanel: {
      title: "Personalização de Cores",
      primary: "Cor Primária",
      secondary: "Cor Secundária",
      background: "Plano de Fundo",
      text: "Texto",
      apply: "Aplicar",
      reset: "Resetar",
    },
  },

  // Flow Feature
  flow: {
    header: {
      title: "Fluxo de Atendimento",
      description: "Configure a automação do atendimento com blocos personalizados.",
    },
    sidebar: {
      blocks: "Blocos",
      settings: "Configurações",
      integrations: "Integrações",
    },
    blocks: {
      start: "Início",
      message: "Mensagem",
      condition: "Condição",
      action: "Ação",
      integration: "Integração",
      end: "Fim",
    },
    settings: {
      title: "Configurações do Fluxo",
      general: {
        title: "Geral",
        name: "Nome do Fluxo",
        description: "Descrição",
      },
      execution: {
        title: "Execução",
        delay: "Delay entre blocos (ms)",
        maxRetries: "Máximo de tentativas",
      },
      ai: {
        title: "Configurações de IA",
        provider: "Provedor",
        model: "Modelo",
        temperature: "Temperatura",
      },
    },
  },
}

const getTranslation = (key: string): TranslationValue => {
  const segments = key.split(".")
  let current: TranslationValue = translations

  for (const segment of segments) {
    if (typeof current === "object" && current !== null && segment in current) {
      current = (current as { [key: string]: TranslationValue })[segment]
    } else {
      console.warn(`Chave de tradução não encontrada: ${key}`)
      return key
    }
  }

  return current
}

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

interface LanguageProviderProps {
  children: ReactNode
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const value = useMemo(() => ({ t: getTranslation }), [])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}
