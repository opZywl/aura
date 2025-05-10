// src/aura/features/view/Chat.tsx
import React, { useState, useEffect, useMemo } from 'react';
import ChatSidebar, { ActiveSidebarFilter } from './chat/ChatSidebar';
import ChatHeader from './chat/ChatHeader';
import ChatMessages from './chat/ChatMessages';
import ChatInput from './chat/ChatInput';
import ChatInfo from './chat/ChatInfo';
import ChatTemplate from './chat/ChatTemplate';

import { User, Message, Conversation, ChatAppProps, ContactSituation } from './chat/types';
import { NotificationMode } from './chat/ChatNotificationDropdown';
import '../../styles/index.css';

// --- MOCK DATA ---
const mockCurrentUser: User = {
    id: 'user_currentUser',
    name: 'Você',
    avatarSeed: 'VC',
    avatarColor: 'default',
    phoneNumber: '550000000000',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 365)
};

const initialMockUsers: User[] = [
    { id: 'user1', name: 'Ceo ð', nickname: undefined, avatarSeed: 'Cð', avatarColor: 'blue', status: 'online', phoneNumber: '554788092419', messageCount: 152, observation: 'Cliente antigo, prefere contato por telefone.', situation: 'aguardando', tags: ['VIP'], createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 200) },
    { id: 'user2', name: 'Test User', nickname: 'Tester', avatarSeed: 'TU', avatarColor: 'green', status: 'digitando...', phoneNumber: '5511999990000', messageCount: 1062, observation: 'Interessado no plano X.', situation: 'em_atendimento', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 150) },
    { id: 'user3', name: 'Jane Moore', nickname: undefined, avatarSeed: 'JM', avatarColor: 'green', status: 'Online', phoneNumber: '5521888881111', messageCount: 75, observation: 'Contato da última vez queria tal coisa.', situation: 'aguardando', tags: ['Importante'], createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 100) },
    { id: 'user4', name: 'Another Userz', nickname: 'Anônimo', avatarSeed: 'AU', avatarColor: 'red', status: 'offline', phoneNumber: '5531777772222', messageCount: 301, observation: '', situation: 'pendente', tags: ['Aprovado'], createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 50) },
    { id: 'user5', name: 'Another Userd', nickname: 'Anônimo', avatarSeed: 'AD', avatarColor: 'default', status: 'offline', phoneNumber: '5531777772223', messageCount: 20, observation: 'Novo Lead', situation: 'aguardando', tags: [], createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30) },
    { id: 'user6', name: 'Another Userw', nickname: 'Anônimo', avatarSeed: 'AW', avatarColor: 'blue', status: 'online', phoneNumber: '5531777772224', messageCount: 450, observation: 'Cliente fiel', situation: 'resolvido', tags: ['Premium'], createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 250) },
    { id: 'user7', name: 'Another Userx', nickname: 'Anônimo', avatarSeed: 'AX', avatarColor: 'green', status: 'ausente', phoneNumber: '5531777772225', messageCount: 12, observation: '', situation: 'pendente', tags: [], createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10) },
    { id: 'user8', name: 'Another Userc', nickname: 'Anônimo', avatarSeed: 'AC', avatarColor: 'red', status: 'offline', phoneNumber: '5531777772226', messageCount: 500, observation: 'Requer atenção', situation: 'aguardando', tags: ['Urgente'], createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180) },
];

const availableTemplates = [
    { id: 'template_1', text: "Seu código de identificação é {{1}}.", paramCount: 1 },
    { id: 'template_2', text: "Olá {{1}}, sua fatura vence em {{2}}.", paramCount: 2 },
    { id: 'template_3', text: "Bem-vindo à nossa plataforma! Seu onboarding começa agora.", paramCount: 0 },
];

const mockConversationsBaseData: Omit<Conversation, 'name' | 'createdAt'>[] = [
    { id: 'conv1', participants: [mockCurrentUser, initialMockUsers[0]], lastMessage: { id: 'm1_ceo', senderId: initialMockUsers[0].id, text: 'belezaaaa', timestamp: new Date('2024-01-14T10:30:00Z'), status: 'read' }, unreadCount: 0, avatarSeed: initialMockUsers[0].avatarSeed, avatarColor: initialMockUsers[0].avatarColor },
    { id: 'convJaneMoore', participants: [mockCurrentUser, initialMockUsers[2]], lastMessage: { id: 'mJane1', senderId: mockCurrentUser.id, text: 'Duis aute irure dolor in reprehenderit...', timestamp: new Date(Date.now() - 50000), status: 'read' }, unreadCount: 0, avatarSeed: initialMockUsers[2].avatarSeed, avatarColor: initialMockUsers[2].avatarColor },
    { id: 'conv2', participants: [mockCurrentUser, initialMockUsers[1]], lastMessage: { id: 'm2', senderId: initialMockUsers[1].id, text: 'Excepteur sint occaecat cupidatat...', timestamp: new Date(Date.now() - 200000), status: 'delivered' }, unreadCount: 1, avatarSeed: initialMockUsers[1].avatarSeed, avatarColor: initialMockUsers[1].avatarColor },
    { id: 'conv4', participants: [mockCurrentUser, initialMockUsers[3]], lastMessage: { id: 'm4', senderId: initialMockUsers[3].id, text: 'Sed ut perspiciatis unde omnis...', timestamp: new Date(Date.now() - 250000), status: 'sent' }, unreadCount: 0, avatarSeed: initialMockUsers[3].avatarSeed, avatarColor: initialMockUsers[3].avatarColor },
    { id: 'conv5', participants: [mockCurrentUser, initialMockUsers[4]], lastMessage: { id: 'm5', senderId: initialMockUsers[4].id, text: 'Nova conversa aqui...', timestamp: new Date(Date.now() - 300000), status: 'sent' }, unreadCount: 0, avatarSeed: initialMockUsers[4].avatarSeed, avatarColor: initialMockUsers[4].avatarColor },
    { id: 'conv6', participants: [mockCurrentUser, initialMockUsers[5]], lastMessage: { id: 'm6', senderId: initialMockUsers[5].id, text: 'Outra mensagem interessante.', timestamp: new Date(Date.now() - 350000), status: 'read' }, unreadCount: 0, avatarSeed: initialMockUsers[5].avatarSeed, avatarColor: initialMockUsers[5].avatarColor },
    { id: 'conv7', participants: [mockCurrentUser, initialMockUsers[6]], lastMessage: undefined, unreadCount: 0, avatarSeed: initialMockUsers[6].avatarSeed, avatarColor: initialMockUsers[6].avatarColor },
    { id: 'conv8', participants: [mockCurrentUser, initialMockUsers[7]], lastMessage: { id: 'm8', senderId: initialMockUsers[7].id, text: 'Finalizando os testes.', timestamp: new Date(Date.now() - 400000), status: 'read'}, unreadCount: 2, avatarSeed: initialMockUsers[7].avatarSeed, avatarColor: initialMockUsers[7].avatarColor },
];


const initializeConversations = (
    conversationsData: Omit<Conversation, 'name' | 'createdAt'>[],
    currentUser: User,
    allUsers: User[]
): Conversation[] => {
    return conversationsData.map((convData) => {
        const participantsWithDetails = convData.participants.map(pRef => {
            const fullUser = allUsers.find(mu => mu.id === pRef.id) || { ...pRef, name: "Usuário Desconhecido", avatarSeed: "?" };
            return { ...fullUser, nickname: fullUser.nickname || undefined };
        });
        const otherParticipant = participantsWithDetails.find(p => p.id !== currentUser.id) || participantsWithDetails[0];
        const conversationName = otherParticipant?.nickname || otherParticipant?.name || "Conversa";

        let createdAtDate;
        if (convData.id === 'conv1') {
            createdAtDate = new Date();
            createdAtDate.setDate(createdAtDate.getDate() - 116);
        } else {
            const randomDaysAgo = Math.floor(Math.random() * 300) + 1;
            createdAtDate = new Date(Date.now() - randomDaysAgo * 24 * 60 * 60 * 1000);
        }

        return {
            ...convData,
            participants: participantsWithDetails,
            name: conversationName,
            createdAt: createdAtDate,
        };
    }).sort((a, b) => (b.lastMessage?.timestamp.getTime() || 0) - (a.lastMessage?.timestamp.getTime() || 0));
};


const mockMessagesJaneMoore: Message[] = [
    { id: 'jm_msg0', senderId: mockCurrentUser.id, text: 'Olá Jane, como você está hoje?', timestamp: new Date(Date.now() - 500000), status: 'read' },
    { id: 'jm_msg1', senderId: initialMockUsers[2].id, text: 'Olá! Estou bem, obrigada por perguntar. E você?', timestamp: new Date(Date.now() - 450000)},
    { id: 'jm_msg2', senderId: mockCurrentUser.id, text: 'Estou ótimo também! Trabalhando em algumas coisas interessantes.', timestamp: new Date(Date.now() - 400000), status: 'read'},
    { id: 'jm_msg3', senderId: mockCurrentUser.id, text: 'Queria te mostrar um design novo, o que acha?', timestamp: new Date(Date.now() - 390000), status: 'delivered'},
    { id: 'jm_msg4', senderId: initialMockUsers[2].id, text: 'Claro, adoraria ver! Pode me enviar.', timestamp: new Date(Date.now() - 300000)},
    { id: 'jm_msg5', senderId: mockCurrentUser.id, text: 'Perfeito! Enviando agora mesmo...', timestamp: new Date(Date.now() - 200000), status: 'sent'},
    { id: 'jm_msg6', senderId: mockCurrentUser.id, text: 'Este é um teste de mensagem mais longa para ver como o balão se comporta com múltiplas linhas de texto e se o alinhamento do horário e status permanece correto no final do conteúdo.', timestamp: new Date(Date.now() - 150000), status: 'read'},
    { id: 'jm_msg7', senderId: initialMockUsers[2].id, text: 'Recebido! Vou dar uma olhada e te dou um feedback em breve. Parece promissor!', timestamp: new Date(Date.now() - 100000)},
    { id: 'jm_msg8', senderId: mockCurrentUser.id, text: 'Ótimo, fico no aguardo!', timestamp: new Date(Date.now() - 90000), status: 'read'},
    { id: 'jm_msg9_sending', senderId: mockCurrentUser.id, text: 'Só mais uma coisinha que esqueci de mencionar...', timestamp: new Date(Date.now() - 5000), status: 'sending'},
    { id: 'jm_msg10_error', senderId: mockCurrentUser.id, text: 'Ops, esta mensagem falhou ao enviar.', timestamp: new Date(Date.now() - 60000), status: 'error'}
];
// --- FIM MOCK DATA ---

type ViewMode = 'normal' | 'full';

const ChatPage: React.FC<Partial<ChatAppProps>> = ({ currentUser = mockCurrentUser }) => {
    const [knownUsers, setKnownUsers] = useState<User[]>([...initialMockUsers, currentUser]);

    const [conversations, setConversations] = useState<Conversation[]>(() =>
        initializeConversations(mockConversationsBaseData, currentUser, knownUsers)
    );

    const [activeConversationId, setActiveConversationId] = useState<string | null>(() => {
        const initialSorted = initializeConversations(mockConversationsBaseData, currentUser, knownUsers);
        return initialSorted.length > 0 ? initialSorted[0].id : null;
    });

    const [messages, setMessages] = useState<Message[]>([]);
    const [viewMode, setViewMode] = useState<ViewMode>('normal');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [notificationMode, setNotificationMode] = useState<NotificationMode>('all');
    const [isContactInfoPanelOpen, setContactInfoPanelOpen] = useState(false);
    const [isTemplatePanelOpen, setIsTemplatePanelOpen] = useState(false);
    const [activeSidebarFilter, setActiveSidebarFilter] = useState<ActiveSidebarFilter>('all');

    const activeConversation = useMemo(() =>
            conversations.find(c => c.id === activeConversationId),
        [conversations, activeConversationId]
    );

    const activeContact = useMemo(() => {
        if (activeConversation && activeConversation.participants) {
            const contactInConv = activeConversation.participants.find(p => p.id !== currentUser.id) || activeConversation.participants[0];
            return knownUsers.find(u => u.id === contactInConv?.id) || contactInConv;
        }
        return undefined;
    }, [activeConversation, currentUser.id, knownUsers]);

    const conversationsAfterSearch = useMemo(() => {
        if (!searchTerm.trim()) {
            return conversations;
        }
        const lowerSearchTerm = searchTerm.toLowerCase();
        return conversations.filter(conv => {
            const otherParticipant = conv.participants.find(p => p.id !== currentUser.id) || conv.participants[0];
            const nameToSearch = otherParticipant?.nickname || conv.name || (otherParticipant ? otherParticipant.name : '');
            return nameToSearch.toLowerCase().includes(lowerSearchTerm);
        });
    }, [conversations, searchTerm, currentUser.id]);

    const totalActiveConversations = useMemo(() => {
        return conversationsAfterSearch.length;
    }, [conversationsAfterSearch]);

    const totalAwaitingConversations = useMemo(() => {
        return conversationsAfterSearch.filter(conv =>
            conv.lastMessage && conv.lastMessage.senderId !== currentUser.id
        ).length;
    }, [conversationsAfterSearch, currentUser.id]);

    const filteredConversationsForDisplay = useMemo(() => {
        if (activeSidebarFilter === 'awaiting') {
            return conversationsAfterSearch.filter(conv =>
                conv.lastMessage && conv.lastMessage.senderId !== currentUser.id
            );
        }
        return conversationsAfterSearch;
    }, [conversationsAfterSearch, activeSidebarFilter, currentUser.id]);

    useEffect(() => {
        if (activeConversationId) {
            if (activeConversationId === 'convJaneMoore') {
                setMessages(mockMessagesJaneMoore);
            } else {
                const contactForMessages = activeConversation?.participants.find(p => p.id !== currentUser.id) || activeConversation?.participants[0];
                setMessages([
                    { id: `generic1_${activeConversationId}`, senderId: contactForMessages?.id || 'otherUser', text: `Olá! Este é o início da sua conversa com ${contactForMessages?.nickname || contactForMessages?.name || 'Usuário'}.`, timestamp: new Date(Date.now() - 172800000) },
                    { id: `generic2_${activeConversationId}`, senderId: currentUser.id, text: 'Como posso ajudar hoje?', timestamp: new Date(Date.now() - 86400000), status: 'read' },
                ]);
            }
        } else {
            setMessages([]);
        }
    }, [activeConversationId, currentUser.id, activeConversation]);

    const handleSendMessage = (messageText: string) => {
        if (!activeConversationId || !activeContact) { return; }
        const newMessage: Message = { id: `msg_${Date.now()}`, senderId: currentUser.id, text: messageText, timestamp: new Date(), status: 'sending' };
        setMessages(prevMessages => [...prevMessages, newMessage]);
        setTimeout(() => setMessages(prevMsgs => prevMsgs.map(m => m.id === newMessage.id ? {...m, status: 'sent'} : m)), 500);

        setConversations(prevConvs => prevConvs.map(conv =>
            conv.id === activeConversationId ? { ...conv, lastMessage: newMessage } : conv
        ).sort((a,b) => (b.lastMessage?.timestamp.getTime() || 0) - (a.lastMessage?.timestamp.getTime() || 0)));

        setTimeout(() => {
            const currentConvCheck = conversations.find(c => c.id === activeConversationId);
            const currentContactForReply = currentConvCheck?.participants.find(p => p.id === activeContact?.id);

            if (document.hidden || !currentContactForReply) return;

            const replyMessage: Message = { id: `msg_reply_${Date.now()}`, senderId: activeContact.id, text: `Entendido: "${messageText.substring(0, 20)}..."`, timestamp: new Date() };
            setMessages(prevMessages => [...prevMessages, replyMessage]);
            setConversations(prevConvs => prevConvs.map(conv =>
                conv.id === activeConversationId ? { ...conv, lastMessage: replyMessage } : conv
            ).sort((a,b) => (b.lastMessage?.timestamp.getTime() || 0) - (a.lastMessage?.timestamp.getTime() || 0)));

            setTimeout(() => {
                setMessages(prevMsgs => prevMsgs.map(m => m.id === newMessage.id ? {...m, status: 'delivered'} : m));
                setTimeout(() => setMessages(prevMsgs => prevMsgs.map(m => m.id === newMessage.id ? {...m, status: 'read'} : m)), 1000);
            }, 500);
        }, 1500 + Math.random() * 1500);
    };

    const handleViewModeChange = (mode: ViewMode) => { setViewMode(mode); };
    const handleSearchTermChange = (term: string) => { setSearchTerm(term); };
    const handleToggleTheme = () => { document.body.classList.toggle('theme-dark'); document.body.classList.toggle('theme-light'); };
    const handleChangeNotificationMode = (mode: NotificationMode) => { setNotificationMode(mode); };
    const handleShowContactInfo = () => { if (activeContact) { setIsTemplatePanelOpen(false); setContactInfoPanelOpen(true); } };

    const handleUpdateContactNickname = (contactId: string, newNickname: string | null) => {
        let updatedKnownUsers = knownUsers.map(u => u.id === contactId ? { ...u, nickname: newNickname === null ? undefined : newNickname } : u);
        setKnownUsers(updatedKnownUsers);

        setConversations(prevConvs =>
            prevConvs.map(conv => {
                const updatedParticipants = conv.participants.map(p => {
                    const userFromKnown = updatedKnownUsers.find(ku => ku.id === p.id) || p;
                    return p.id === contactId ? { ...userFromKnown, nickname: newNickname === null ? undefined : newNickname } : userFromKnown;
                });

                let updatedConvName = conv.name;
                if (conv.participants.length === 2) {
                    const otherP = updatedParticipants.find(p => p.id !== currentUser.id);
                    if (otherP?.id === contactId) {
                        updatedConvName = newNickname === null ? otherP.name : newNickname;
                    }
                }
                return { ...conv, participants: updatedParticipants, name: updatedConvName };
            }).sort((a,b) => (b.lastMessage?.timestamp.getTime() || 0) - (a.lastMessage?.timestamp.getTime() || 0))
        );
    };

    const handleUpdateContactDetails = (contactId: string, details: Partial<Pick<User, 'observation' | 'situation'>>) => {
        const updatedKnownUsers = knownUsers.map(u => u.id === contactId ? { ...u, ...details } : u);
        setKnownUsers(updatedKnownUsers);

        setConversations(prevConvs =>
            prevConvs.map(conv => ({
                ...conv,
                participants: conv.participants.map(p => {
                    const userFromKnown = updatedKnownUsers.find(ku => ku.id === p.id) || p;
                    return p.id === contactId ? { ...userFromKnown, ...details } : userFromKnown;
                }),
            }))
        );
    };

    const handleOpenNewTemplatePanel = () => { setIsTemplatePanelOpen(true); setContactInfoPanelOpen(false); };
    const handleCloseTemplatePanel = () => { setIsTemplatePanelOpen(false); };

    const handleSendTemplateMessage = (phoneNumber: string, ddi: string, templateId: string, params: string[]) => {
        const selectedTemplateInfo = availableTemplates.find(t => t.id === templateId);
        if (!selectedTemplateInfo) { console.error("Template não encontrado"); return; }

        let messageText = selectedTemplateInfo.text;
        params.forEach((param, index) => { messageText = messageText.replace(new RegExp(`\\{\\{${index + 1}\\}\\}`, 'g'), param); });

        const fullPhoneNumberForSearch = `${ddi.replace('+', '')}${phoneNumber}`.replace(/\D/g, '');

        let finalTargetContact: User;
        let updatedKnownUsersList = [...knownUsers];
        const existingUserInList = updatedKnownUsersList.find(u => u.phoneNumber?.replace(/\D/g, '') === fullPhoneNumberForSearch);

        if (existingUserInList) {
            finalTargetContact = existingUserInList;
        } else {
            finalTargetContact = {
                id: `user_template_${Date.now()}`,
                name: `Contato ${phoneNumber}`,
                avatarSeed: phoneNumber.slice(-2),
                phoneNumber: `${ddi}${phoneNumber}`,
                messageCount: 0,
                status: 'offline',
                situation: 'aguardando',
                observation: 'Criado via template.',
                createdAt: new Date()
            };
            updatedKnownUsersList.push(finalTargetContact);
            setKnownUsers(updatedKnownUsersList);
        }

        const newMessage: Message = { id: `msg_template_${Date.now()}`, senderId: currentUser.id, text: messageText, timestamp: new Date(), status: 'sent' };

        let existingConversation = conversations.find(conv =>
            conv.participants.length === 2 &&
            conv.participants.some(p => p.id === currentUser.id) &&
            conv.participants.some(p => p.id === finalTargetContact.id)
        );

        if (existingConversation) {
            setConversations(prevConvs => prevConvs.map(c =>
                c.id === existingConversation!.id
                    ? {
                        ...c,
                        lastMessage: newMessage,
                        participants: c.participants.map(p => updatedKnownUsersList.find(u=>u.id===p.id)||p)
                    }
                    : c
            ).sort((a,b) => (b.lastMessage?.timestamp.getTime() || 0) - (a.lastMessage?.timestamp.getTime() || 0)));
            if (activeConversationId === existingConversation.id) { setMessages(prevMsgs => [...prevMsgs, newMessage]); }
        } else {
            const newConvName = finalTargetContact.nickname || finalTargetContact.name;
            const newConversation: Conversation = {
                id: `conv_template_${Date.now()}`,
                participants: [currentUser, finalTargetContact].map(p => updatedKnownUsersList.find(u=>u.id===p.id)||p),
                name: newConvName,
                lastMessage: newMessage,
                avatarSeed: finalTargetContact.avatarSeed,
                avatarColor: finalTargetContact.avatarColor,
                createdAt: new Date()
            };
            setConversations(prevConvs => [newConversation, ...prevConvs].sort((a,b) => (b.lastMessage?.timestamp.getTime() || 0) - (a.lastMessage?.timestamp.getTime() || 0)));
            setActiveConversationId(newConversation.id);
            setMessages([newMessage]);
        }
        setIsTemplatePanelOpen(false);
    };
    const handleNewChat = handleOpenNewTemplatePanel;

    const handleChangeSidebarFilter = (filter: ActiveSidebarFilter) => {
        setActiveSidebarFilter(filter);
    };

    return (
        <div className="chat-app-container">
            <div className={`chat-layout 
                ${viewMode === 'normal' ? 'normal-mode' : 'full-mode'} 
                ${isContactInfoPanelOpen || isTemplatePanelOpen ? 'with-side-panel' : ''}`
            }>
                <ChatSidebar
                    conversations={filteredConversationsForDisplay}
                    activeConversationId={activeConversationId}
                    onConversationSelect={(convId) => {
                        setActiveConversationId(convId);
                        if (isContactInfoPanelOpen) setContactInfoPanelOpen(false);
                        if (isTemplatePanelOpen) setIsTemplatePanelOpen(false);
                    }}
                    currentUser={currentUser}
                    knownUsers={knownUsers}
                    onNewChat={handleNewChat}
                    searchTerm={searchTerm}
                    onSearchTermChange={handleSearchTermChange}
                    activeFilter={activeSidebarFilter}
                    onChangeFilter={handleChangeSidebarFilter}
                    totalActiveCount={totalActiveConversations}
                    totalAwaitingCount={totalAwaitingConversations}
                />
                <div className="chat-main">
                    {isTemplatePanelOpen ? (
                        <ChatTemplate
                            onSendTemplate={handleSendTemplateMessage}
                            onClose={handleCloseTemplatePanel}
                        />
                    ) : (
                        <>
                            <ChatHeader
                                contact={activeContact}
                                viewMode={viewMode}
                                notificationMode={notificationMode}
                                onViewModeChange={handleViewModeChange}
                                onToggleTheme={handleToggleTheme}
                                onShowContactInfo={handleShowContactInfo}
                                onChangeNotificationMode={handleChangeNotificationMode}
                                onUpdateContactNickname={handleUpdateContactNickname}
                            />
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
                                <div style={{flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#777', padding: '20px', textAlign: 'center'}}>
                                    {searchTerm && filteredConversationsForDisplay.length === 0
                                        ? 'Nenhuma conversa encontrada para sua pesquisa.'
                                        : (!activeConversationId && activeSidebarFilter === 'awaiting' && filteredConversationsForDisplay.length === 0
                                            ? 'Nenhuma conversa aguardando sua resposta.'
                                            : 'Selecione uma conversa para começar ou crie uma nova.')
                                    }
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
        </div>
    );
};

export default ChatPage;