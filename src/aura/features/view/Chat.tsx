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

const pickSound = (): string | null => {
    const t = document.createElement('audio')
    if (t.canPlayType('audio/mpeg')) return '/notifications/message.mp3'
    if (t.canPlayType('audio/ogg'))  return '/notifications/message.ogg'
    if (t.canPlayType('audio/wav'))  return '/notifications/message.wav'
    console.warn('Nenhum formato de áudio suportado encontrado para notificação (pickSound).');
    return null
}
const audioSrc = pickSound()

const ChatPage: React.FC<Partial<ChatAppProps>> = ({
                                                       currentUser: initialCurrentUser
                                                   }) => {
    const currentUser = initialCurrentUser || {
        id: 'user_currentUser',
        name: 'Você',
        avatarSeed: 'VC',
        avatarColor: 'default',
        phoneNumber: '550000000000',
        createdAt: new Date()
    };

    const [knownUsers, setKnownUsers] = useState<User[]>([currentUser])
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [activeConversationId, setActiveConversationId] =
        useState<string | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [viewMode, setViewMode] = useState<ViewMode>('normal')
    const [searchTerm, setSearchTerm] = useState('')
    const [notificationMode, setNotificationMode] =
        useState<NotificationMode>('all')
    const [isContactInfoPanelOpen, setContactInfoPanelOpen] = useState(false)
    const [isTemplatePanelOpen, setIsTemplatePanelOpen] = useState(false)
    const [activeSidebarFilter, setActiveSidebarFilter] =
        useState<ActiveSidebarFilter>('all')

    const [toasts, setToasts] = useState<Array<{ id: number; text: string }>>([])
    const pushToast = useCallback((text: string) => {
        const id = Date.now()
        setToasts(p => [...p, { id, text }])
        setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 5000)
    }, [])

    useEffect(() => {
        if (!audioSrc) return;
        const unlockAudioContext = () => {
            if (!(window as any).__notifAudio) {
                const audio = new Audio(audioSrc!);
                audio.volume = 0.9;
                (window as any).__notifAudio = audio;
            }
        };
        window.addEventListener('click', unlockAudioContext, { once: true });
        window.addEventListener('keydown', unlockAudioContext, { once: true });
        return () => {
            window.removeEventListener('click', unlockAudioContext);
            window.removeEventListener('keydown', unlockAudioContext);
        };
    }, []);

    const playNotificationSound = useCallback(() => {
        const player = (window as any).__notifAudio as HTMLAudioElement | undefined
        if (player) {
            player.currentTime = 0
            player.play().catch(error => console.warn('Erro ao tocar som de notificação:', error))
        }
    }, [])

    const triggerNotification = useCallback((
        msg: Message,
        senderName: string,
        convId: string
    ) => {
        if (notificationMode === 'off') return;

        const isMessageFromSelf = msg.senderId === currentUser.id;
        const isChatActiveAndFocused = convId === activeConversationId && document.hasFocus();

        if (notificationMode === 'awaiting') {
            if (isMessageFromSelf || isChatActiveAndFocused) return;
        } else if (notificationMode === 'all') {
            if (isMessageFromSelf && isChatActiveAndFocused) {

                // return;
            }
        }

        playNotificationSound();
        if (!isMessageFromSelf) {
            pushToast(`${senderName}: ${msg.text}`);
        }

        if ('Notification' in window && Notification.permission === 'granted' && !isMessageFromSelf) {
            new Notification(senderName, {
                body: msg.text, icon: '/favicon.ico', tag: convId, renotify: true,
            });
        } else if ('Notification' in window && Notification.permission === 'default' && !isMessageFromSelf) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification(senderName, {
                        body: msg.text, icon: '/favicon.ico', tag: convId, renotify: true,
                    });
                }
            });
        }
    }, [notificationMode, currentUser.id, activeConversationId, playNotificationSound, pushToast]);

    const [contactDetailsMap, setContactDetailsMap] = useState<
        Record<string, { observation?: string; situation?: ContactSituation }>
    >(() => {
        try {
            const stored = localStorage.getItem('contactDetailsMap');
            return stored ? JSON.parse(stored) : {};
        } catch { return {} }
    });

    const persistDetailsMap = useCallback((next: typeof contactDetailsMap) => {
        try {
            localStorage.setItem('contactDetailsMap', JSON.stringify(next));
        } catch (e) {
            console.error("Failed to persist contact details map:", e);
        }
    }, []);

    useEffect(() => {
        const loadInitialConversations = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/conversations`)
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                const data: {
                    id: string; title: string; lastMessage: string | null; lastAt: string | null;
                }[] = await res.json()

                const newKnownUsers = [...knownUsers];
                const loadedConversations = data.map<Conversation>(c => {
                    const contactId = `user_${c.id}`;
                    let contact = newKnownUsers.find(u => u.id === contactId);
                    const savedDetails = contactDetailsMap[contactId] || {};

                    if (!contact) {
                        contact = {
                            id: contactId, name: c.title, avatarSeed: c.title.slice(0, 2).toUpperCase(),
                            avatarColor: 'default', observation: savedDetails.observation,
                            situation: savedDetails.situation, createdAt: new Date()
                        };
                        newKnownUsers.push(contact);
                    } else {
                        contact = { ...contact, ...savedDetails, nickname: contact.nickname };
                    }


                    const lastMessageTimestamp = c.lastAt ? toDate(c.lastAt) : new Date(0);
                    const lastMsg: Message | undefined = c.lastMessage
                        ? {
                            id: `msg_initial_${c.id}_${Date.now()}`, senderId: contact.id,
                            text: c.lastMessage, timestamp: lastMessageTimestamp, status: 'read'
                        }
                        : undefined;

                    return {
                        id: c.id, participants: [currentUser, contact], lastMessage: lastMsg,
                        unreadCount: (lastMsg && lastMsg.senderId !== currentUser.id) ? 1 : 0,
                        name: contact.nickname || contact.name, avatarSeed: contact.avatarSeed,
                        avatarColor: contact.avatarColor, createdAt: lastMessageTimestamp
                    };
                });

                loadedConversations.sort(
                    (a, b) =>
                        (b.lastMessage?.timestamp.getTime() || b.createdAt.getTime()) -
                        (a.lastMessage?.timestamp.getTime() || a.createdAt.getTime())
                );

                setKnownUsers(newKnownUsers);
                setConversations(loadedConversations);
                if (loadedConversations.length > 0) {
                    setActiveConversationId(loadedConversations[0].id);
                }
            } catch (error) {
                console.error('Falha ao carregar conversas iniciais:', error);
                pushToast('Erro ao carregar conversas.');
            }
        };
        loadInitialConversations();
    }, [currentUser.id, persistDetailsMap]);

    useEffect(() => {
        const pollConversations = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/conversations`);
                if (!res.ok) { console.warn(`Polling conversations failed: ${res.status}`); return; }
                const data: {
                    id: string; title: string; lastMessage: string | null; lastAt: string | null;
                }[] = await res.json();

                setConversations(prevConvs => {
                    let conversationsChanged = false;
                    let nextConvs = [...prevConvs];

                    let tempKnownUsers = [...knownUsers];
                    let knownUsersUpdatedInLoop = false;


                    data.forEach(apiConv => {
                        const existingConvIndex = nextConvs.findIndex(c => c.id === apiConv.id);
                        const lastMessageTimestamp = apiConv.lastAt ? toDate(apiConv.lastAt) : new Date();
                        const contactIdForLastMessage = `user_${apiConv.id}`;

                        const lastMsg: Message | undefined = apiConv.lastMessage
                            ? {
                                id: `msg_poll_${apiConv.id}_${Date.now()}`, senderId: contactIdForLastMessage,
                                text: apiConv.lastMessage, timestamp: lastMessageTimestamp, status: 'delivered',
                            }
                            : undefined;

                        if (existingConvIndex !== -1) {
                            const currentConv = nextConvs[existingConvIndex];
                            if (
                                (!currentConv.lastMessage && lastMsg) ||
                                (currentConv.lastMessage && lastMsg && currentConv.lastMessage.text !== lastMsg.text) ||
                                (currentConv.lastMessage && lastMsg && currentConv.lastMessage.timestamp.getTime() < lastMsg.timestamp.getTime())
                            ) {
                                const updatedConv = { ...currentConv, lastMessage: lastMsg };
                                if (lastMsg && lastMsg.senderId !== currentUser.id) {
                                    updatedConv.unreadCount = (updatedConv.unreadCount || 0) + 1;
                                    const sender = tempKnownUsers.find(u => u.id === lastMsg.senderId);
                                    triggerNotification(lastMsg, sender?.name || apiConv.title, apiConv.id);
                                }
                                nextConvs[existingConvIndex] = updatedConv;
                                conversationsChanged = true;
                            }
                        } else {
                            const contactId = `user_${apiConv.id}`;
                            let contact = tempKnownUsers.find(u => u.id === contactId);
                            const savedDetails = contactDetailsMap[contactId] || {};
                            if (!contact) {
                                contact = {
                                    id: contactId, name: apiConv.title, avatarSeed: apiConv.title.slice(0, 2).toUpperCase(),
                                    avatarColor: 'default', observation: savedDetails.observation,
                                    situation: savedDetails.situation, createdAt: new Date(),
                                };
                                tempKnownUsers.push(contact);
                                knownUsersUpdatedInLoop = true;
                            } else {
                                contact = {...contact, ...savedDetails, nickname: contact.nickname};
                                tempKnownUsers = tempKnownUsers.map(u => u.id === contactId ? contact! : u);
                                knownUsersUpdatedInLoop = true;
                            }


                            const newConversation: Conversation = {
                                id: apiConv.id, participants: [currentUser, contact!], lastMessage: lastMsg,
                                unreadCount: (lastMsg && lastMsg.senderId !== currentUser.id) ? 1 : 0,
                                name: contact!.nickname || contact!.name, avatarSeed: contact!.avatarSeed,
                                avatarColor: contact!.avatarColor, createdAt: lastMessageTimestamp,
                            };
                            nextConvs = [newConversation, ...nextConvs];
                            if (lastMsg && lastMsg.senderId !== currentUser.id) {
                                triggerNotification(lastMsg, contact!.name, apiConv.id);
                            }
                            conversationsChanged = true;
                        }
                    });

                    if (knownUsersUpdatedInLoop) {
                        setKnownUsers(tempKnownUsers);
                    }

                    if (conversationsChanged) {
                        nextConvs.sort(
                            (a, b) =>
                                (b.lastMessage?.timestamp.getTime() || b.createdAt.getTime()) -
                                (a.lastMessage?.timestamp.getTime() || a.createdAt.getTime())
                        );
                        return nextConvs;
                    }
                    return prevConvs;
                });
            } catch (error) { console.error('Erro durante polling de conversas:', error); }
        };
        const intervalId = setInterval(pollConversations, 5000);
        return () => clearInterval(intervalId);
    }, [currentUser.id, triggerNotification, contactDetailsMap, knownUsers]);

    const fetchMessages = useCallback(
        async (convId: string) => {
            if (!convId) return;
            try {
                const res = await fetch(`${API_BASE_URL}/conversations/${convId}/messages`)
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                const data: {
                    id: string; sender: string; text: string; timestamp: string;
                }[] = await res.json();
                const newMessages = data
                    .filter(m => m.sender !== 'system')
                    .map(m => ({
                        id: m.id, senderId: m.sender, text: m.text,
                        timestamp: toDate(m.timestamp),
                        status: m.sender === currentUser.id ? 'read' : 'delivered'
                    } as Message));
                setMessages(newMessages);
                setConversations(prev => prev.map(c => c.id === convId ? { ...c, unreadCount: 0 } : c));
            } catch (error) {
                console.error(`Falha ao carregar mensagens para ${convId}:`, error);
                pushToast('Erro ao carregar mensagens.');
            }
        }, [currentUser.id, pushToast]
    );

    useEffect(() => {
        if (!activeConversationId) { setMessages([]); return; }
        fetchMessages(activeConversationId);
        const intervalId = setInterval(() => fetchMessages(activeConversationId!), 3000);
        return () => clearInterval(intervalId);
    }, [activeConversationId, fetchMessages]);

    const lastNotifiedMessageId = useRef<string | null>(null);
    useEffect(() => {
        if (!messages.length || !activeConversationId) return;
        const lastMessage = messages[messages.length - 1];
        if (lastMessage.senderId === currentUser.id || lastMessage.id === lastNotifiedMessageId.current) return;
        const contact = knownUsers.find(u => u.id === lastMessage.senderId);
        triggerNotification(lastMessage, contact?.name || 'Nova mensagem', activeConversationId);
        lastNotifiedMessageId.current = lastMessage.id;
    }, [messages, currentUser.id, activeConversationId, knownUsers, triggerNotification]);

    interface SavedMessageAPIResponse { id: string; timestamp: string; }

    const handleSendMessage = async (text: string) => {
        if (!activeConversationId || !text.trim()) return;
        const tempId = `tmp_${Date.now()}`;
        const newMessageToSend: Message = {
            id: tempId, senderId: currentUser.id, text,
            timestamp: new Date(), status: 'sending'
        };
        setMessages(prev => [...prev, newMessageToSend]);
        try {
            const res = await fetch(
                `${API_BASE_URL}/conversations/${activeConversationId}/messages`,
                { method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sender: currentUser.id, text }) }
            );
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const savedMessageData = await res.json() as SavedMessageAPIResponse;
            setMessages(prev =>
                prev.map(m => m.id === tempId ? {
                    ...m, id: savedMessageData.id,
                    timestamp: toDate(savedMessageData.timestamp), status: 'sent'
                } : m)
            );
            const finalLastMessage: Message = {
                id: savedMessageData.id, senderId: currentUser.id, text,
                timestamp: toDate(savedMessageData.timestamp), status: 'sent'
            };
            setConversations(prev =>
                prev.map(c => c.id === activeConversationId ? { ...c, lastMessage: finalLastMessage } : c)
                    .sort((a, b) =>
                        (b.lastMessage?.timestamp.getTime() || b.createdAt.getTime()) -
                        (a.lastMessage?.timestamp.getTime() || a.createdAt.getTime())
                    )
            );
        } catch (error) {
            console.error('Falha ao enviar mensagem:', error);
            pushToast('Erro ao enviar mensagem.');
            setMessages(prev => prev.map(m => (m.id === tempId ? { ...m, status: 'error' } : m)));
        }
    };

    const handleCloseConversation = async () => {
        if (!activeConversationId) return;
        const conversationToClose = activeConversationId;
        setActiveConversationId(null);
        setMessages([]);
        setConversations(prev => prev.filter(c => c.id !== conversationToClose));
        try {
            const res = await fetch(`${API_BASE_URL}/conversations/${conversationToClose}`, { method: 'DELETE' });
            if (!res.ok) {
                console.error(`Falha ao encerrar conversa ${conversationToClose}: ${res.status}`);
                pushToast('Erro ao encerrar conversa.');
            } else {
                pushToast('Conversa encerrada.');
            }
        } catch (error) {
            console.error(`Falha ao encerrar conversa ${conversationToClose}:`, error);
            pushToast('Erro ao encerrar conversa.');
        }
    };

    const handleUpdateContactNickname = (contactId: string, nick: string | null) => {
        const newNickname = nick || undefined;
        const contactUserObject = knownUsers.find(u => u.id === contactId);
        const baseName = contactUserObject?.name;

        setKnownUsers(prev =>
            prev.map(u => (u.id === contactId ? { ...u, nickname: newNickname } : u))
        );

        setConversations(prev =>
            prev.map(conv => {
                const isParticipantInConv = conv.participants.some(p => p.id === contactId);
                if (isParticipantInConv) {
                    const updatedConvName = newNickname || baseName || 'Desconhecido';
                    return {
                        ...conv,
                        name: updatedConvName,
                        participants: conv.participants.map(p =>
                            p.id === contactId ? { ...p, nickname: newNickname } : p
                        )
                    };
                }
                return conv;
            })
        );
    };

    const handleUpdateContactDetails = (
        contactId: string,
        details: Partial<Pick<User, 'observation' | 'situation'>>
    ) => {
        setKnownUsers(prev =>
            prev.map(u => (u.id === contactId ? { ...u, ...details } : u))
        );
        setConversations(prev =>
            prev.map(conv => ({
                ...conv,
                participants: conv.participants.map(p =>
                    p.id === contactId ? { ...p, ...details } : p
                )
            }))
        );
        setContactDetailsMap(prev => {
            const next = { ...prev, [contactId]: { ...(prev[contactId] || {}), ...details } };
            persistDetailsMap(next);
            return next;
        });
    };

    useEffect(() => {
        if (!BACKEND_WS) return;
        const ws = new WebSocket(BACKEND_WS);
        ws.onopen = () => console.log('WebSocket conectado');
        ws.onclose = () => console.log('WebSocket desconectado');
        ws.onerror = (error) => console.error('WebSocket erro:', error);
        ws.onmessage = (event) => {
            try {
                const incoming = JSON.parse(event.data as string) as {
                    conversationId: string; id: string; senderId: string; text: string; timestamp: string;
                };
                if (incoming.conversationId === activeConversationId) {
                    const newMessage: Message = {
                        id: incoming.id, senderId: incoming.senderId, text: incoming.text,
                        timestamp: toDate(incoming.timestamp), status: 'delivered',
                    };
                    setMessages(prev => [...prev, newMessage]);
                }
                setConversations(prevConvs => {
                    const convIndex = prevConvs.findIndex(c => c.id === incoming.conversationId);
                    const newLastMessage: Message = {
                        id: incoming.id, senderId: incoming.senderId, text: incoming.text,
                        timestamp: toDate(incoming.timestamp), status: 'delivered',
                    };
                    let updatedConvs = [...prevConvs];
                    let contactForNotification: User | undefined;
                    let tempKnownUsers = [...knownUsers];
                    let knownUsersChanged = false;

                    if (convIndex !== -1) {
                        const existingConv = updatedConvs[convIndex];
                        contactForNotification = existingConv.participants.find(p => p.id === incoming.senderId);
                        updatedConvs[convIndex] = {
                            ...existingConv, lastMessage: newLastMessage,
                            unreadCount: incoming.conversationId === activeConversationId && document.hasFocus()
                                ? existingConv.unreadCount
                                : (existingConv.unreadCount || 0) + (incoming.senderId !== currentUser.id ? 1 : 0),
                        };
                        const convToMove = updatedConvs.splice(convIndex, 1)[0];
                        updatedConvs.unshift(convToMove);
                    } else {
                        let contact = tempKnownUsers.find(u => u.id === incoming.senderId);
                        const savedDetails = contactDetailsMap[incoming.senderId] || {};
                        if (!contact) {
                            contact = {
                                id: incoming.senderId, name: `Usuário ${incoming.senderId.slice(-4)}`,
                                avatarSeed: incoming.senderId.slice(0, 2).toUpperCase(), avatarColor: 'default',
                                observation: savedDetails.observation, situation: savedDetails.situation,
                                createdAt: new Date(),
                            };
                            tempKnownUsers.push(contact);
                            knownUsersChanged = true;
                        } else {
                            contact = {...contact, ...savedDetails, nickname: contact.nickname};
                            tempKnownUsers = tempKnownUsers.map(u => u.id === incoming.senderId ? contact! : u);
                            knownUsersChanged = true;
                        }
                        contactForNotification = contact;
                        const newConv: Conversation = {
                            id: incoming.conversationId, participants: [currentUser, contact!],
                            lastMessage: newLastMessage,
                            unreadCount: (incoming.senderId !== currentUser.id) ? 1 : 0,
                            name: contact!.nickname || contact!.name, avatarSeed: contact!.avatarSeed,
                            avatarColor: contact!.avatarColor, createdAt: toDate(incoming.timestamp),
                        };
                        updatedConvs.unshift(newConv);
                    }
                    if (knownUsersChanged) {
                        setKnownUsers(tempKnownUsers);
                    }
                    if (incoming.senderId !== currentUser.id) {
                        triggerNotification(newLastMessage, contactForNotification?.name || 'Nova mensagem', incoming.conversationId);
                    }
                    return updatedConvs;
                });
            } catch (e) { console.error("Erro ao processar mensagem WebSocket:", e, event.data); }
        };
        return () => { if (ws.readyState === WebSocket.OPEN) ws.close(); };
    }, [currentUser.id, activeConversationId, triggerNotification, contactDetailsMap, knownUsers]);

    const filteredConversations = useMemo(() => {
        let list = conversations;
        if (searchTerm.trim()) {
            const lowerSearchTerm = searchTerm.toLowerCase();
            list = list.filter(c =>
                (c.name?.toLowerCase() || '').includes(lowerSearchTerm) ||
                c.participants.some(p => p.id !== currentUser.id && (p.phoneNumber?.includes(searchTerm.trim()) || (p.name?.toLowerCase() || '').includes(lowerSearchTerm)))
            );
        }
        if (activeSidebarFilter === 'awaiting') {
            list = list.filter(c => (c.lastMessage?.senderId !== currentUser.id) || (c.unreadCount && c.unreadCount > 0));
        }
        return list;
    }, [conversations, searchTerm, activeSidebarFilter, currentUser.id]);

    const activeConversation = useMemo(
        () => conversations.find(c => c.id === activeConversationId) || null,
        [conversations, activeConversationId]
    );

    const activeContact = useMemo(() => {
        if (!activeConversation) return undefined;
        const otherParticipantInfo = activeConversation.participants.find(p => p.id !== currentUser.id);
        return knownUsers.find(u => u.id === otherParticipantInfo?.id) ?? otherParticipantInfo;
    }, [activeConversation, knownUsers, currentUser.id]);

    return (
        <div className="chat-app-container">
            <div
                className={`chat-layout ${viewMode === 'normal' ? 'normal-mode' : 'full-mode'} ${isContactInfoPanelOpen || isTemplatePanelOpen ? 'with-side-panel' : ''}`}>
                <ChatSidebar
                    conversations={filteredConversations}
                    activeConversationId={activeConversationId}
                    onConversationSelect={id => {
                        setActiveConversationId(id); setContactInfoPanelOpen(false);
                        setIsTemplatePanelOpen(false); setMessages([]);
                        lastNotifiedMessageId.current = null;
                    }}
                    currentUser={currentUser} knownUsers={knownUsers}
                    onNewChat={() => {
                        setActiveConversationId(null); setIsTemplatePanelOpen(true);
                        setContactInfoPanelOpen(false);
                    }}
                    searchTerm={searchTerm} onSearchTermChange={setSearchTerm}
                    activeFilter={activeSidebarFilter} onChangeFilter={setActiveSidebarFilter}
                    totalActiveCount={conversations.length}
                    totalAwaitingCount={conversations.filter(c => (c.lastMessage?.senderId !== currentUser.id) || (c.unreadCount && c.unreadCount > 0)).length}
                />
                <div className="chat-main">
                    {isTemplatePanelOpen ? (
                        <ChatTemplate
                            onSendTemplate={(templateText: string) => {
                                setIsTemplatePanelOpen(false);
                            }}
                            onClose={() => setIsTemplatePanelOpen(false)}
                        />
                    ) : activeConversationId && activeContact ? (
                        <>
                            <ChatHeader
                                contact={activeContact} viewMode={viewMode}
                                notificationMode={notificationMode}
                                onViewModeChange={setViewMode}
                                onToggleTheme={() => {
                                    const currentTheme = document.body.classList.contains('theme-dark') ? 'theme-dark' : 'theme-light';
                                    document.body.classList.replace(currentTheme, currentTheme === 'theme-dark' ? 'theme-light' : 'theme-dark');
                                }}
                                onShowContactInfo={() => {
                                    setContactInfoPanelOpen(true); setIsTemplatePanelOpen(false);
                                }}
                                onChangeNotificationMode={setNotificationMode}
                                onUpdateContactNickname={handleUpdateContactNickname}
                                onCloseConversation={handleCloseConversation}
                            />
                            <ChatMessages
                                messages={messages} currentUser={currentUser}
                                participants={activeConversation?.participants || [currentUser, activeContact]}
                            />
                            <ChatInput onSendMessage={handleSendMessage} disabled={!activeConversationId} />
                        </>
                    ) : (
                        <div className="chat-empty-prompt">
                            {!activeConversationId && !isTemplatePanelOpen && "Selecione uma conversa para começar ou inicie uma nova."}
                            {activeConversationId && !activeContact && "Carregando dados do contato..."}
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
                {toasts.map(t => ( <div key={t.id} className="chat-toast" role="alert">{t.text}</div> ))}
            </div>
        </div>
    );
};
export default ChatPage;