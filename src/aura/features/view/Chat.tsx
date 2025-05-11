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
const BACKEND_WS   = ''

const toDate = (iso: string) =>
    new Date(iso.endsWith('Z') ? iso : iso + 'Z')

const pickSound = () => {
    const t = document.createElement('audio')
    if (t.canPlayType('audio/mpeg')) return '/notifications/message.mp3'
    if (t.canPlayType('audio/ogg'))  return '/notifications/message.ogg'
    if (t.canPlayType('audio/wav'))  return '/notifications/message.wav'
    return null
}
const audioSrc = pickSound()

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
    const [activeConversationId, setActiveConversationId] =
        useState<string | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [viewMode, setViewMode] = useState<ViewMode>('normal')
    const [searchTerm, setSearchTerm] = useState('')
    const [notificationMode] = useState<NotificationMode>('all')
    const [isContactInfoPanelOpen, setContactInfoPanelOpen] = useState(false)
    const [isTemplatePanelOpen, setIsTemplatePanelOpen] = useState(false)
    const [activeSidebarFilter, setActiveSidebarFilter] =
        useState<ActiveSidebarFilter>('all')

    const [toasts, setToasts] = useState<Array<{ id: number; text: string }>>([])
    const pushToast = (text: string) => {
        const id = Date.now()
        setToasts(p => [...p, { id, text }])
        setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 5000)
    }

    useEffect(() => {
        if (!audioSrc) return
        const unlock = () => {
            if (!(window as any).__notifAudio) {
                const a = new Audio(audioSrc)
                a.volume = 0.9
                ;(window as any).__notifAudio = a
            }
            window.removeEventListener('click', unlock)
            window.removeEventListener('keydown', unlock)
        }
        window.addEventListener('click', unlock)
        window.addEventListener('keydown', unlock)
        return () => {
            window.removeEventListener('click', unlock)
            window.removeEventListener('keydown', unlock)
        }
    }, [])

    const playNotificationSound = () => {
        const player = (window as any).__notifAudio as HTMLAudioElement | undefined
        if (player) {
            player.currentTime = 0
            player.play().catch(() => {})
        }
    }

    const triggerNotification = (msg: Message, sender: string) => {
        playNotificationSound()
        pushToast(`${sender}: ${msg.text}`)

        if ('Notification' in window) {
            const show = () =>
                new Notification(sender, { body: msg.text, icon: '/favicon.ico' })
            if (Notification.permission === 'granted') show()
            else if (Notification.permission === 'default') {
                Notification.requestPermission().then(p => p === 'granted' && show())
            }
        }
    }

    const [contactDetailsMap, setContactDetailsMap] = useState<
        Record<string, { observation?: string; situation?: ContactSituation }>
    >(() => {
        try {
            return JSON.parse(localStorage.getItem('contactDetailsMap') || '{}')
        } catch { return {} }
    })
    const persistDetailsMap = (next: typeof contactDetailsMap) =>
        localStorage.setItem('contactDetailsMap', JSON.stringify(next))

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/conversations`)
                if (!res.ok) throw new Error()
                const data: { id: string; title: string; lastMessage: string | null; lastAt: string | null }[] =
                    await res.json()

                const contacts = data.map<User>(c => {
                    const id = `user_${c.id}`
                    const saved = contactDetailsMap[id] || {}
                    return {
                        id,
                        name: c.title,
                        avatarSeed: c.title.slice(0, 2),
                        avatarColor: 'default',
                        observation: saved.observation,
                        situation: saved.situation,
                        createdAt: new Date()
                    }
                })
                setKnownUsers([currentUser, ...contacts])

                const convs = data.map<Conversation>(c => {
                    const other = contacts.find(u => u.id === `user_${c.id}`)!
                    const lastAt = c.lastAt ? toDate(c.lastAt) : new Date()
                    const lastMsg = c.lastMessage
                        ? {
                            id: `msg_${c.id}`,
                            senderId: other.id,
                            text: c.lastMessage,
                            timestamp: lastAt,
                            status: 'read' as const
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
            } catch { console.error('Falha ao carregar conversas') }
        }
        load()
    }, [])

    useEffect(() => {
        const poll = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/conversations`)
                if (!res.ok) return
                const data: { id: string; title: string; lastMessage: string | null; lastAt: string | null }[] =
                    await res.json()

                setConversations(prev => {
                    let changed = false
                    let next = [...prev]

                    data.forEach(c => {
                        const idx = next.findIndex(v => v.id === c.id)
                        const lastAt = c.lastAt ? toDate(c.lastAt) : new Date()
                        const lastMsg = c.lastMessage
                            ? {
                                id: `msg_${c.id}`,
                                senderId: `user_${c.id}`,
                                text: c.lastMessage,
                                timestamp: lastAt,
                                status: 'delivered' as const
                            }
                            : undefined

                        if (idx !== -1) {
                            if (
                                (!next[idx].lastMessage && lastMsg) ||
                                next[idx].lastMessage?.text !== c.lastMessage
                            ) {
                                if (activeConversationId !== c.id && lastMsg)
                                    triggerNotification(lastMsg, c.title)
                                next[idx] = { ...next[idx], lastMessage: lastMsg }
                                changed = true
                            }
                        } else {
                            const contactId = `user_${c.id}`
                            const saved = contactDetailsMap[contactId] || {}

                            const contact =
                                knownUsers.find(u => u.id === contactId) ||
                                {
                                    id: contactId,
                                    name: c.title,
                                    avatarSeed: c.title.slice(0, 2),
                                    avatarColor: 'default',
                                    observation: saved.observation,
                                    situation: saved.situation,
                                    createdAt: new Date()
                                }

                            const stub: Conversation = {
                                id: c.id,
                                participants: [currentUser, contact],
                                lastMessage: lastMsg,
                                unreadCount: 1,
                                name: contact.name,
                                avatarSeed: contact.avatarSeed,
                                avatarColor: contact.avatarColor,
                                createdAt: lastAt
                            }

                            next = [stub, ...next]
                            if (!knownUsers.find(u => u.id === contactId)) {
                                setKnownUsers(u => [...u, contact!])
                            }
                            if (lastMsg) triggerNotification(lastMsg, contact.name)
                            changed = true
                        }
                    })

                    return changed ? next : prev
                })
            } catch {/* ignore */}
        }
        const iv = setInterval(poll, 5000)
        return () => clearInterval(iv)
    }, [
        currentUser,
        knownUsers,
        activeConversationId,
        contactDetailsMap
    ])

    const fetchMessages = useCallback(
        async (convId: string) => {
            try {
                const res = await fetch(`${API_BASE_URL}/conversations/${convId}/messages`)
                const data: any[] = await res.json()
                setMessages(
                    data
                        .filter(m => m.sender !== 'system')
                        .map(
                            m =>
                                ({
                                    id: m.id,
                                    senderId: m.sender,
                                    text: m.text,
                                    timestamp: toDate(m.timestamp),
                                    status:
                                        m.sender === currentUser.id ? 'read' : 'delivered'
                                } as Message)
                        )
                )
            } catch {}
        },
        [currentUser.id]
    )

    useEffect(() => {
        if (!activeConversationId) { setMessages([]); return }
        fetchMessages(activeConversationId)
        const iv = setInterval(() => fetchMessages(activeConversationId), 3000)
        return () => clearInterval(iv)
    }, [activeConversationId, fetchMessages])

    const lastNotified = useRef<string | null>(null)
    useEffect(() => {
        if (!messages.length) return
        const last = messages[messages.length - 1]
        if (last.senderId === currentUser.id) return
        if (lastNotified.current === last.id) return
        const sender =
            knownUsers.find(u => u.id === last.senderId)?.nickname ||
            knownUsers.find(u => u.id === last.senderId)?.name ||
            'Contato'
        triggerNotification(last, sender)
        lastNotified.current = last.id
    }, [messages, knownUsers, currentUser.id])

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
            if (!res.ok) throw new Error()
            const saved = await res.json()
            await fetchMessages(activeConversationId)
            setConversations(prev =>
                prev.map(c =>
                    c.id === activeConversationId
                        ? {
                            ...c,
                            lastMessage: {
                                id: saved.id,
                                senderId: currentUser.id,
                                text,
                                timestamp: toDate(saved.timestamp),
                                status: 'sent' as const
                            }
                        }
                        : c
                )
            )
        } catch {
            setMessages(prev =>
                prev.map(m => (m.id === tmpId ? { ...m, status: 'error' } : m))
            )
        }
    }

    const handleCloseConversation = async () => {
        if (!activeConversationId) return
        await fetch(
            `${API_BASE_URL}/conversations/${activeConversationId}`,
            { method: 'DELETE' }
        ).catch(console.error)
        setConversations(prev => prev.filter(c => c.id !== activeConversationId))
        setActiveConversationId(null)
        setMessages([])
    }

    const handleUpdateContactNickname = (
        contactId: string,
        nick: string | null
    ) => {
        setKnownUsers(prev =>
            prev.map(u => (u.id === contactId ? { ...u, nickname: nick || undefined } : u))
        )
        setConversations(prev =>
            prev.map(conv => ({
                ...conv,
                name: conv.participants.some(p => p.id === contactId)
                    ? nick || knownUsers.find(u => u.id === contactId)?.name
                    : conv.name
            }))
        )
    }

    const handleUpdateContactDetails = (
        contactId: string,
        details: Partial<Pick<User, 'observation' | 'situation'>>
    ) => {
        setKnownUsers(prev =>
            prev.map(u => (u.id === contactId ? { ...u, ...details } : u))
        )
        setConversations(prev =>
            prev.map(conv => ({
                ...conv,
                participants: conv.participants.map(p =>
                    p.id === contactId ? { ...p, ...details } : p
                )
            }))
        )
        setContactDetailsMap(prev => {
            const next = { ...prev, [contactId]: { ...prev[contactId], ...details } }
            persistDetailsMap(next)
            return next
        })
    }

    useEffect(() => {
        if (!BACKEND_WS) return
        const ws = new WebSocket(BACKEND_WS)

        ws.addEventListener('message', evt => {
            const incoming = JSON.parse(evt.data) as {
                conversationId: string; id: string; senderId: string; text: string; timestamp: string
            }

            setConversations(prev => {
                const idx = prev.findIndex(c => c.id === incoming.conversationId)

                if (idx !== -1) {
                    const upd: Conversation = {
                        ...prev[idx],
                        lastMessage: {
                            id: incoming.id,
                            senderId: incoming.senderId,
                            text: incoming.text,
                            timestamp: new Date(incoming.timestamp),
                            status: 'delivered' as const
                        },
                        unreadCount:
                            prev[idx].id === activeConversationId
                                ? prev[idx].unreadCount ?? 0
                                : (prev[idx].unreadCount ?? 0) + 1
                    }
                    if (activeConversationId !== upd.id)
                        triggerNotification(upd.lastMessage!, upd.name || 'Contato')
                    return [upd, ...prev.slice(0, idx), ...prev.slice(idx + 1)]
                }

                const contactId = `user_${incoming.conversationId}`
                const saved = contactDetailsMap[contactId] || {}
                let contact = knownUsers.find(u => u.id === contactId)
                if (!contact) {
                    contact = {
                        id: contactId,
                        name: incoming.senderId,
                        avatarSeed: incoming.senderId.slice(0, 2),
                        avatarColor: 'default',
                        observation: saved.observation,
                        situation: saved.situation,
                        createdAt: new Date()
                    }
                    setKnownUsers(u => [...u, contact!])
                }
                const stub: Conversation = {
                    id: incoming.conversationId,
                    participants: [currentUser, contact!],
                    lastMessage: {
                        id: incoming.id,
                        senderId: incoming.senderId,
                        text: incoming.text,
                        timestamp: new Date(incoming.timestamp),
                        status: 'delivered' as const
                    },
                    unreadCount: 1,
                    name: contact!.name,
                    avatarSeed: contact!.avatarSeed,
                    avatarColor: contact!.avatarColor,
                    createdAt: new Date(incoming.timestamp)
                }
                triggerNotification(stub.lastMessage!, stub.name || 'Contato')
                return [stub, ...prev]
            })
        })

        return () => ws.close()
    }, [
        BACKEND_WS,
        currentUser,
        knownUsers,
        contactDetailsMap,
        activeConversationId
    ])

    const filteredConversations = useMemo(() => {
        let list = conversations
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase()
            list = list.filter(c => c.name?.toLowerCase().includes(term))
        }
        if (activeSidebarFilter === 'awaiting') {
            list = list.filter(c => c.lastMessage?.senderId !== currentUser.id)
        }
        return list
    }, [conversations, searchTerm, activeSidebarFilter, currentUser.id])

    const activeConversation = useMemo(
        () => conversations.find(c => c.id === activeConversationId) || null,
        [conversations, activeConversationId]
    )

    const activeContact = useMemo(() => {
        if (!activeConversation) return undefined
        const other = activeConversation.participants.find(
            p => p.id !== currentUser.id
        ) as User | undefined
        return knownUsers.find(u => u.id === other?.id) ?? other
    }, [activeConversation, knownUsers, currentUser.id])

    return (
        <div className="chat-app-container">
            <div
                className={`
          chat-layout
          ${viewMode === 'normal' ? 'normal-mode' : 'full-mode'}
          ${
                    isContactInfoPanelOpen || isTemplatePanelOpen ? 'with-side-panel' : ''
                }
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
                    totalAwaitingCount={
                        filteredConversations.filter(
                            c => c.lastMessage?.senderId !== currentUser.id
                        ).length
                    }
                />

                <div className="chat-main">
                    {isTemplatePanelOpen ? (
                        <ChatTemplate
                            onSendTemplate={() => {}}
                            onClose={() => setIsTemplatePanelOpen(false)}
                        />
                    ) : activeConversationId ? (
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
                                    onChangeNotificationMode={() => {}}
                                    onUpdateContactNickname={handleUpdateContactNickname}
                                    onCloseConversation={handleCloseConversation}
                                />
                            )}

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