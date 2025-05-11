// src/aura/features/view/Chat.tsx
import React, {
    useState,
    useEffect,
    useMemo,
    useCallback,
    useRef
} from 'react'
import ChatSidebar, { ActiveSidebarFilter } from './chat/ChatSidebar'
import ChatHeader from './chat/ChatHeader'
import ChatMessages from './chat/ChatMessages'
import ChatInput from './chat/ChatInput'
import ChatInfo from './chat/ChatInfo'
import ChatTemplate from './chat/ChatTemplate'
import {
    User,
    Message,
    Conversation,
    ChatAppProps,
    ContactSituation
} from './chat/types'
import { NotificationMode } from './chat/ChatNotificationDropdown'
import '../../styles/index.css'

type ViewMode = 'normal' | 'full'
const API_BASE_URL = 'http://localhost:3001/api'
const toDate = (iso: string): Date =>
    new Date(iso.endsWith('Z') ? iso : iso + 'Z')

const pickNotificationSound = (): string | null => {
    const tester = document.createElement('audio')
    if (tester.canPlayType('audio/mpeg')) return '/notifications/message.mp3'
    if (tester.canPlayType('audio/ogg')) return '/notifications/message.ogg'
    if (tester.canPlayType('audio/wav')) return '/notifications/message.wav'
    return null
}

const ChatPage: React.FC<Partial<ChatAppProps>> = ({
                                                       currentUser = {
                                                           id: 'user_currentUser',
                                                           name: 'Você',
                                                           avatarSeed: 'VC',
                                                           avatarColor: 'default',
                                                           phoneNumber: '550000000000',
                                                           createdAt: new Date()
                                                       }
                                                   }) => {
    const [knownUsers, setKnownUsers] = useState<User[]>([currentUser])
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [viewMode, setViewMode] = useState<ViewMode>('normal')
    const [searchTerm, setSearchTerm] = useState<string>('')
    const [notificationMode, setNotificationMode] = useState<NotificationMode>('all')
    const [isContactInfoPanelOpen, setContactInfoPanelOpen] = useState(false)
    const [isTemplatePanelOpen, setIsTemplatePanelOpen] = useState(false)
    const [activeSidebarFilter, setActiveSidebarFilter] = useState<ActiveSidebarFilter>('all')

    const [toasts, setToasts] = useState<Array<{ id: number; text: string }>>([])
    const pushToast = (text: string) => {
        const id = Date.now()
        setToasts(p => [...p, { id, text }])
        setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 5000)
    }

    const [contactDetailsMap, setContactDetailsMap] = useState<
        Record<string, { observation?: string; situation?: ContactSituation }>
    >(() => {
        try {
            return JSON.parse(localStorage.getItem('contactDetailsMap') || '{}')
        } catch {
            return {}
        }
    })
    const persistDetailsMap = (next: typeof contactDetailsMap) => {
        localStorage.setItem('contactDetailsMap', JSON.stringify(next))
    }

    useEffect(() => {
        const init = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/conversations`)
                if (!res.ok) throw new Error('Falha ao carregar conversas')
                const data = (await res.json()) as Array<{
                    id: string
                    title: string
                    lastMessage: string | null
                    lastAt: string | null
                }>

                const contacts: User[] = data.map(c => {
                    const id = `user_${c.id}`
                    const saved = contactDetailsMap[id] || {}
                    return {
                        id,
                        name: c.title,
                        avatarSeed: c.title.slice(0, 2),
                        avatarColor: 'default',
                        observation: saved.observation || '',
                        situation: saved.situation || '',
                        createdAt: new Date()
                    }
                })
                setKnownUsers([currentUser, ...contacts])

                const convs: Conversation[] = data.map(c => {
                    const other = contacts.find(u => u.id === `user_${c.id}`)!
                    const lastAt = c.lastAt ? toDate(c.lastAt) : new Date()
                    const lastMsg: Message | undefined = c.lastMessage
                        ? {
                            id: `msg_${c.id}`,
                            senderId: other.id,
                            text: c.lastMessage,
                            timestamp: lastAt,
                            status: 'read'
                        }
                        : undefined
                    return {
                        id: c.id,
                        participants: [currentUser, other],
                        lastMessage: lastMsg,
                        unreadCount:
                            lastMsg && lastMsg.senderId !== currentUser.id ? 1 : 0,
                        name: other.nickname || other.name,
                        avatarSeed: other.avatarSeed,
                        avatarColor: other.avatarColor,
                        createdAt: lastAt
                    }
                })
                convs.sort(
                    (a, b) =>
                        (b.lastMessage?.timestamp.getTime() || 0) -
                        (a.lastMessage?.timestamp.getTime() || 0)
                )
                setConversations(convs)
                if (convs.length) setActiveConversationId(convs[0].id)
            } catch (err) {
                console.error(err)
            }
        }
        init()
    }, [])

    const fetchMessages = useCallback(
        async (convId: string) => {
            try {
                const res = await fetch(`${API_BASE_URL}/conversations/${convId}/messages`)
                const data = (await res.json()) as any[]
                setMessages(
                    data
                        .filter(m => m.sender !== 'system')
                        .map(
                            (m): Message => ({
                                id: m.id,
                                senderId: m.sender,
                                text: m.text,
                                timestamp: toDate(m.timestamp),
                                status: m.sender === currentUser.id ? 'read' : 'delivered'
                            })
                        )
                )
            } catch (err) {
                console.error('Erro ao carregar mensagens:', err)
            }
        },
        [currentUser.id]
    )

    useEffect(() => {
        if (!activeConversationId) {
            setMessages([])
            return
        }
        fetchMessages(activeConversationId)
        const iv = setInterval(() => fetchMessages(activeConversationId!), 3000)
        return () => clearInterval(iv)
    }, [activeConversationId, fetchMessages])

    const playNotificationSound = () => {
        const unlocked = (window as any).__notifAudio as HTMLAudioElement | undefined
        if (unlocked) {
            unlocked.currentTime = 0
            unlocked.play().catch(() => {})
            return
        }
        const url = pickNotificationSound()
        if (url) new Audio(url).play().catch(() => {})
    }

    const lastMsgIdNotified = useRef<string | null>(null)
    const triggerNotification = (msg: Message, senderName: string) => {
        playNotificationSound()
        pushToast(`${senderName}: ${msg.text}`)

        if ('Notification' in window) {
            const notify = () =>
                new Notification(senderName, {
                    body: msg.text,
                    icon: '/favicon.ico',
                    silent: false
                })
            if (Notification.permission === 'granted') {
                notify()
            } else if (Notification.permission === 'default') {
                Notification.requestPermission().then(p => p === 'granted' && notify())
            }
        }
    }

    useEffect(() => {
        if (!messages.length) return
        const last = messages[messages.length - 1]

        if (last.senderId === currentUser.id) return
        if (lastMsgIdNotified.current === last.id) return

        if (notificationMode === 'off') return
        if (notificationMode === 'awaiting') {
            const conv = conversations.find(c => c.id === activeConversationId)
            if (conv && conv.lastMessage?.senderId === currentUser.id) return
        }

        const sender =
            knownUsers.find(u => u.id === last.senderId)?.nickname ||
            knownUsers.find(u => u.id === last.senderId)?.name ||
            'Nova mensagem'

        triggerNotification(last, sender)
        lastMsgIdNotified.current = last.id
    }, [
        messages,
        notificationMode,
        currentUser.id,
        knownUsers,
        activeConversationId,
        conversations
    ])

    const handleSendMessage = async (text: string) => {
        if (!activeConversationId) return
        const tmpId = `tmp_${Date.now()}`
        setMessages(prev => [
            ...prev,
            {
                id: tmpId,
                senderId: currentUser.id,
                text,
                timestamp: new Date(),
                status: 'sending'
            }
        ])
        try {
            const res = await fetch(
                `${API_BASE_URL}/conversations/${activeConversationId}/messages`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sender: currentUser.id, text })
                }
            )
            if (!res.ok) throw new Error(await res.text())
            const saved = await res.json()
            setConversations(prev =>
                prev.map(conv =>
                    conv.id === activeConversationId
                        ? {
                            ...conv,
                            lastMessage: {
                                id: saved.id,
                                senderId: currentUser.id,
                                text,
                                timestamp: toDate(saved.timestamp),
                                status: 'sent'
                            }
                        }
                        : conv
                )
            )
            await fetchMessages(activeConversationId)
        } catch (err) {
            console.error('Erro ao enviar mensagem:', err)
            setMessages(prev =>
                prev.map(m => (m.id === tmpId ? { ...m, status: 'error' } : m))
            )
        }
    }

    const handleCloseConversation = async () => {
        if (!activeConversationId) return
        try {
            await fetch(`${API_BASE_URL}/conversations/${activeConversationId}`, {
                method: 'DELETE'
            })
        } catch (err) {
            console.error('Erro ao encerrar conversa:', err)
        }
        setConversations(prev => prev.filter(c => c.id !== activeConversationId))
        setActiveConversationId(null)
        setMessages([])
    }

    const availableTemplates = useMemo(
        () => [
            { id: 'template_1', text: 'Seu código de identificação é {{1}}.', paramCount: 1 },
            { id: 'template_2', text: 'Olá {{1}}, sua fatura vence em {{2}}.', paramCount: 2 },
            { id: 'template_3', text: 'Bem-vindo à nossa plataforma! Seu onboarding começa agora.', paramCount: 0 }
        ],
        []
    )

    const handleSendTemplateMessage = async (
        phoneNumber: string,
        ddi: string,
        templateId: string,
        params: string[]
    ) => {
        const tpl = availableTemplates.find(t => t.id === templateId)
        if (!tpl) return
        let texto = tpl.text
        params.forEach((p, i) => (texto = texto.replace(`{{${i + 1}}}`, p)))
        await handleSendMessage(texto)
        setIsTemplatePanelOpen(false)
    }

    const handleUpdateContactNickname = (contactId: string, nick: string | null) => {
        setKnownUsers(prev =>
            prev.map(u => (u.id === contactId ? { ...u, nickname: nick || undefined } : u))
        )
        setConversations(prev =>
            prev.map(conv => ({
                ...conv,
                name: conv.participants.some(p => p.id === contactId)
                    ? nick || knownUsers.find(u => u.id === contactId)!.name
                    : conv.name
            }))
        )
    }

    const handleUpdateContactDetails = (
        contactId: string,
        details: Partial<Pick<User, 'observation' | 'situation'>>
    ) => {
        setKnownUsers(p => p.map(u => (u.id === contactId ? { ...u, ...details } : u)))
        setConversations(p =>
            p.map(conv => ({
                ...conv,
                participants: conv.participants.map(c =>
                    c.id === contactId ? { ...c, ...details } : c
                )
            }))
        )
        setContactDetailsMap(prev => {
            const next = { ...prev, [contactId]: { ...prev[contactId], ...details } }
            persistDetailsMap(next)
            return next
        })
    }

    const filteredConversations = useMemo(() => {
        let list = conversations
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase()
            list = list.filter(conv => conv.name?.toLowerCase().includes(term))
        }
        if (activeSidebarFilter === 'awaiting') {
            list = list.filter(conv => conv.lastMessage?.senderId !== currentUser.id)
        }
        return list
    }, [conversations, searchTerm, activeSidebarFilter, currentUser.id])

    const activeConversation = useMemo(
        () => conversations.find(c => c.id === activeConversationId) || null,
        [conversations, activeConversationId]
    )
    const otherId = activeConversation?.participants.find(p => p.id !== currentUser.id)?.id
    const activeContact = useMemo(
        () => (otherId ? knownUsers.find(u => u.id === otherId) : undefined),
        [knownUsers, otherId]
    )

    return (
        <div className="chat-app-container">
            <div
                className={`
          chat-layout
          ${viewMode === 'normal' ? 'normal-mode' : 'full-mode'}
          ${(isContactInfoPanelOpen || isTemplatePanelOpen) ? 'with-side-panel' : ''}
        `}
            >
                <ChatSidebar
                    conversations={filteredConversations}
                    activeConversationId={activeConversationId}
                    onConversationSelect={id => {
                        setActiveConversationId(id)
                        setContactInfoPanelOpen(false)
                        setIsTemplatePanelOpen(false)
                    }}
                    currentUser={currentUser}
                    knownUsers={knownUsers}
                    onNewChat={() => setIsTemplatePanelOpen(true)}
                    searchTerm={searchTerm}
                    onSearchTermChange={setSearchTerm}
                    activeFilter={activeSidebarFilter}
                    onChangeFilter={setActiveSidebarFilter}
                    totalActiveCount={filteredConversations.length}
                    totalAwaitingCount={filteredConversations.filter(
                        c => c.lastMessage?.senderId !== currentUser.id
                    ).length}
                />

                <div className="chat-main">
                    {isTemplatePanelOpen ? (
                        <ChatTemplate
                            onSendTemplate={handleSendTemplateMessage}
                            onClose={() => setIsTemplatePanelOpen(false)}
                        />
                    ) : (
                        <>
                            {activeContact && (
                                <ChatHeader
                                    contact={activeContact}
                                    viewMode={viewMode}
                                    notificationMode={notificationMode}
                                    onViewModeChange={setViewMode}
                                    onToggleTheme={() => {
                                        document.body.classList.toggle('theme-dark')
                                        document.body.classList.toggle('theme-light')
                                    }}
                                    onShowContactInfo={() => {
                                        setContactInfoPanelOpen(true)
                                        setIsTemplatePanelOpen(false)
                                    }}
                                    onChangeNotificationMode={setNotificationMode}
                                    onUpdateContactNickname={handleUpdateContactNickname}
                                    onCloseConversation={handleCloseConversation}
                                />
                            )}

                            {activeConversationId ? (
                                <>
                                    <ChatMessages
                                        messages={messages}
                                        currentUser={currentUser}
                                        participants={activeConversation?.participants || []}
                                    />
                                    <ChatInput onSendMessage={handleSendMessage} />
                                </>
                            ) : (
                                <div className="chat-empty-prompt">
                                    Selecione uma conversa para começar.
                                </div>
                            )}
                        </>
                    )}
                </div>

                {isContactInfoPanelOpen && activeContact && (
                    <ChatInfo
                        contact={activeContact}
                        onClose={() => setContactInfoPanelOpen(false)}
                        onUpdateContactDetails={handleUpdateContactDetails}
                    />
                )}
            </div>

            <div className="chat-toast-container">
                {toasts.map(t => (
                    <div key={t.id} className="chat-toast">
                        {t.text}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ChatPage