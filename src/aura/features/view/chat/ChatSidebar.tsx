// src/aura/features/view/chat/ChatSidebar.tsx
import React, { useMemo, useState } from 'react';
import IconWrapper from './IconWrapper';
import { Conversation, User, ConversationItemProps as ImportedConversationItemProps, ContactSituation } from './types';

export type ActiveSidebarFilter = 'all' | 'awaiting';

const formatDateForSidebar = (date: Date | undefined): string => {
    if (!date) return '';
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }).replace('.', '');
};

const getDaysDifference = (date: Date | undefined): number => {
    if (!date) return 0;
    const today = new Date();
    today.setHours(0,0,0,0);

    const pastDateObj = new Date(date);
    pastDateObj.setHours(0,0,0,0);

    const diffTime = Math.abs(today.getTime() - pastDateObj.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const getSituationTextAndClass = (situation?: ContactSituation): { text: string, className: string } => {
    if (!situation) return { text: 'N/D', className: 'unknown' };
    switch (situation) {
        case 'aguardando': return { text: 'Aguardando', className: 'aguardando' };
        case 'em_atendimento': return { text: 'Em Atendimento', className: 'em_atendimento' };
        case 'resolvido': return { text: 'Resolvido', className: 'resolvido' };
        case 'pendente': return { text: 'Pendente', className: 'pendente' };
        default:
            const defaultText = typeof situation === 'string' ? situation.charAt(0).toUpperCase() + situation.slice(1) : 'N/D';
            return { text: defaultText, className: 'unknown' };
    }
};

const ConversationItem: React.FC<ImportedConversationItemProps> = ({
                                                                       conversation,
                                                                       isActive,
                                                                       onClick,
                                                                       currentUser,
                                                                       isDetailedView,
                                                                   }) => {
    const otherParticipant = useMemo(() =>
            conversation.participants.find((p: User) => p.id !== currentUser.id) || conversation.participants[0],
        [conversation.participants, currentUser.id]
    );

    const displayName = conversation.name || (otherParticipant ? otherParticipant.name : "Conversa");
    const avatarSeed = conversation.avatarSeed || (otherParticipant ? otherParticipant.name : "C");
    const avatarColor = conversation.avatarColor || (otherParticipant ? otherParticipant.avatarColor : "default");

    const lastMessageDateFormatted = isDetailedView && conversation.lastMessage ? formatDateForSidebar(conversation.lastMessage.timestamp) : '';
    const daysAgo = isDetailedView ? getDaysDifference(conversation.createdAt) : 0;
    const situationInfo = isDetailedView && otherParticipant ? getSituationTextAndClass(otherParticipant.situation) : null;

    return (
        <div
            className={`chat-conversation-item ${isActive ? 'active' : ''} ${isDetailedView ? 'detailed' : ''}`}
            onClick={onClick}
        >
            <IconWrapper seed={avatarSeed} color={avatarColor} />
            <div className="chat-conversation-info">
                <div className="chat-conversation-main-line">
                    <div className="chat-conversation-name">{displayName}</div>
                    {isDetailedView && lastMessageDateFormatted && (
                        <div className="chat-conversation-last-message-date">{lastMessageDateFormatted}</div>
                    )}
                </div>

                {conversation.lastMessage && (
                    <div className={`chat-conversation-preview ${isDetailedView ? 'detailed-preview' : ''}`}>
                        {conversation.lastMessage.text}
                    </div>
                )}
                {!conversation.lastMessage && isDetailedView && (
                    <div className="chat-conversation-preview detailed-preview"><em>Sem mensagens recentes</em></div>
                )}

                {isDetailedView && (
                    <div className="chat-conversation-details-row">
                        <span className="chat-conversation-days-ago">{daysAgo} Dias</span>
                        {situationInfo && (
                            <span className={`chat-conversation-status-badge status-${situationInfo.className}`}>
                                {situationInfo.text}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

interface ChatSidebarProps {
    conversations: Conversation[];
    activeConversationId: string | null;
    onConversationSelect: (conversationId: string) => void;
    currentUser: User;
    knownUsers: User[];
    onNewChat: () => void;
    searchTerm: string;
    onSearchTermChange: (term: string) => void;
    activeFilter: ActiveSidebarFilter;
    onChangeFilter: (filter: ActiveSidebarFilter) => void;
    totalActiveCount: number;
    totalAwaitingCount: number;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
                                                     conversations,
                                                     activeConversationId,
                                                     onConversationSelect,
                                                     currentUser,
                                                     knownUsers,
                                                     onNewChat,
                                                     searchTerm,
                                                     onSearchTermChange,
                                                     activeFilter,
                                                     onChangeFilter,
                                                     totalActiveCount,
                                                     totalAwaitingCount,
                                                 }) => {
    const [isDetailedViewActive, setIsDetailedViewActive] = useState(false);

    const toggleDetailedView = () => {
        setIsDetailedViewActive(prev => !prev);
    };

    const menuIcon = { id: 'menu', icon: '☰', action: () => console.log('Menu clicked (funcionalidade futura)') };
    const mainNavIcons = [
        { id: 'new', icon: '+', action: onNewChat, active: true },
        { id: 'users', icon: '👤', action: () => console.log('Users clicked (funcionalidade futura)') },
    ];
    const bottomNavIcons = [
        {
            id: 'settings',
            icon: '⚙️',
            action: toggleDetailedView,
            isActiveDynamic: isDetailedViewActive
        },
    ];

    const conversationsWithFullDetails = useMemo(() => {
        return conversations.map(conv => {
            const updatedParticipants = conv.participants.map(pRef =>
                knownUsers.find(u => u.id === pRef.id) || pRef
            );
            let conversationName = conv.name;
            if ((!conversationName || updatedParticipants.length === 2) && updatedParticipants.length > 0) {
                const otherP = updatedParticipants.find(p => p.id !== currentUser.id) || updatedParticipants[0];
                conversationName = otherP?.nickname || otherP?.name || "Conversa";
            }

            return {
                ...conv,
                name: conversationName,
                participants: updatedParticipants
            };
        });
    }, [conversations, knownUsers, currentUser.id]);


    return (
        <div className={`chat-sidebar ${isDetailedViewActive ? 'detailed-view-active' : ''}`}>
            <div className="chat-sidebar-icon-nav">
                <div className="chat-sidebar-icon-nav-header">
                    <div
                        key={menuIcon.id}
                        className="chat-sidebar-nav-icon menu-icon"
                        onClick={menuIcon.action}
                        title="Menu"
                    >
                        {menuIcon.icon}
                    </div>
                </div>
                <div className="chat-sidebar-icon-nav-main">
                    {mainNavIcons.map(item => (
                        <div
                            key={item.id}
                            className={`chat-sidebar-nav-icon ${item.active ? 'active' : ''}`}
                            onClick={item.action}
                            title={item.id.charAt(0).toUpperCase() + item.id.slice(1)}
                        >
                            {item.icon}
                        </div>
                    ))}
                </div>
                <div className="chat-sidebar-icon-nav-footer">
                    {bottomNavIcons.map(item => (
                        <div
                            key={item.id}
                            className={`chat-sidebar-nav-icon ${item.isActiveDynamic ? 'settings-active' : ''}`}
                            onClick={item.action}
                            title={item.id === 'settings' ? (isDetailedViewActive ? "Desativar Detalhes" : "Ativar Detalhes") : item.id.charAt(0).toUpperCase() + item.id.slice(1)}
                        >
                            {item.icon}
                        </div>
                    ))}
                </div>
            </div>

            <div className="chat-sidebar-main-content">
                <div className="chat-sidebar-header">
                    <div className="chat-sidebar-search-container">
                        <span className="chat-sidebar-search-icon-input">🔍</span>
                        <input
                            type="text"
                            placeholder="Chats"
                            className="chat-sidebar-search-input"
                            value={searchTerm}
                            onChange={(e) => onSearchTermChange(e.target.value)}
                        />
                    </div>
                </div>

                <div className="chat-conversation-list">
                    {conversationsWithFullDetails.length > 0 ? (
                        conversationsWithFullDetails.map((conv) => (
                            <ConversationItem
                                key={conv.id}
                                conversation={conv}
                                isActive={conv.id === activeConversationId}
                                onClick={() => onConversationSelect(conv.id)}
                                currentUser={currentUser}
                                isDetailedView={isDetailedViewActive}
                            />
                        ))
                    ) : (
                        <div className="chat-no-conversations-found">
                            {searchTerm ? "Nenhum chat encontrado." : (activeFilter === 'awaiting' ? "Nenhum chat aguardando sua resposta." : "Nenhum chat.")}
                        </div>
                    )}
                </div>

                <div className="chat-sidebar-filters">
                    <button
                        className={`chat-filter-button ${activeFilter === 'all' ? 'active' : ''}`}
                        onClick={() => onChangeFilter('all')}
                    >
                        <div className="chat-filter-button-content">
                            <span className="chat-filter-badge total-badge">{totalActiveCount}</span>
                            <span>Ativo</span>
                        </div>
                    </button>
                    <button
                        className={`chat-filter-button ${activeFilter === 'awaiting' ? 'active' : ''}`}
                        onClick={() => onChangeFilter('awaiting')}
                    >
                        <div className="chat-filter-button-content">
                            <span className="chat-filter-badge awaiting-badge">{totalAwaitingCount}</span>
                            <span>Aguardando</span>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatSidebar;