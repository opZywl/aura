// src/aura/features/view/chat/ChatSidebar.tsx
import React, { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import IconWrapper from './IconWrapper'
import {
    Conversation,
    User,
    ConversationItemProps as ImportedConversationItemProps,
    ContactSituation
} from './types'

export type ActiveSidebarFilter = 'all' | 'awaiting'

const formatDateForSidebar = (date: Date | undefined): string => {
    if (!date) return ''
    return date
        .toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })
        .replace('.', '')
}

const getDaysDifference = (date: Date | undefined): number => {
    if (!date) return 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const past = new Date(date)
    past.setHours(0, 0, 0, 0)
    const diff = Math.abs(today.getTime() - past.getTime())
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

const getSituationTextAndClass = (situation?: ContactSituation) => {
    if (!situation) return { text: 'N/D', className: 'unknown' }
    switch (situation) {
        case 'aguardando':
            return { text: 'Aguardando', className: 'aguardando' }
        case 'em_atendimento':
            return { text: 'Em Atendimento', className: 'em_atendimento' }
        case 'resolvido':
            return { text: 'Resolvido', className: 'resolvido' }
        case 'pendente':
            return { text: 'Pendente', className: 'pendente' }
        default:
            return {
                text: situation.charAt(0).toUpperCase() + situation.slice(1),
                className: 'unknown'
            }
    }
}

const ConversationItem: React.FC<ImportedConversationItemProps> = ({
                                                                       conversation,
                                                                       isActive,
                                                                       onClick,
                                                                       currentUser,
                                                                       isDetailedView
                                                                   }) => {
    const other = useMemo(
        () =>
            conversation.participants.find(p => p.id !== currentUser.id) ||
            conversation.participants[0],
        [conversation.participants, currentUser.id]
    )

    const displayName = conversation.name || other?.name || 'Conversa'
    const avatarSeed = conversation.avatarSeed || other?.name || 'C'
    const avatarColor = conversation.avatarColor || other?.avatarColor || 'default'

    const lastDate = isDetailedView
        ? formatDateForSidebar(conversation.lastMessage?.timestamp)
        : ''
    const daysAgo = isDetailedView ? getDaysDifference(conversation.createdAt) : 0
    const situationInfo = isDetailedView
        ? getSituationTextAndClass(other?.situation)
        : null

    return (
        <div
            className={`chat-conversation-item ${isActive ? 'active' : ''} ${
                isDetailedView ? 'detailed' : ''
            }`}
            onClick={onClick}
        >
            <IconWrapper seed={avatarSeed} color={avatarColor} />
            <div className="chat-conversation-info">
                <div className="chat-conversation-main-line">
                    <div className="chat-conversation-name">{displayName}</div>
                    {isDetailedView && lastDate && (
                        <div className="chat-conversation-last-message-date">{lastDate}</div>
                    )}
                </div>

                {conversation.lastMessage ? (
                    <div
                        className={`chat-conversation-preview ${
                            isDetailedView ? 'detailed-preview' : ''
                        }`}
                    >
                        {conversation.lastMessage.text}
                    </div>
                ) : isDetailedView ? (
                    <div className="chat-conversation-preview detailed-preview">
                        <em>Sem mensagens recentes</em>
                    </div>
                ) : null}

                {isDetailedView && (
                    <div className="chat-conversation-details-row">
                        <span className="chat-conversation-days-ago">{daysAgo} Dias</span>
                        {situationInfo && (
                            <span
                                className={`chat-conversation-status-badge status-${situationInfo.className}`}
                            >
                {situationInfo.text}
              </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

interface ChatSidebarProps {
    conversations: Conversation[]
    activeConversationId: string | null
    onConversationSelect: (conversationId: string) => void
    currentUser: User
    knownUsers: User[]
    onNewChat: () => void
    searchTerm: string
    onSearchTermChange: (term: string) => void
    activeFilter: ActiveSidebarFilter
    onChangeFilter: (filter: ActiveSidebarFilter) => void
    totalActiveCount: number
    totalAwaitingCount: number
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
                                                     totalAwaitingCount
                                                 }) => {
    const [detailedView, setDetailedView] = useState(false)
    const [showBackConfirm, setShowBackConfirm] = useState(false)

    const navigate = useNavigate()

    const toggleDetailedView = () => setDetailedView(prev => !prev)

    const openBackConfirm = (e: React.MouseEvent) => {
        e.preventDefault() // impede a navegação imediata
        setShowBackConfirm(true)
    }

    const confirmBack = () => {
        setShowBackConfirm(false)
        navigate('/features/view/home')
    }

    const menuIcon = { id: 'menu', icon: '☰', action: () => console.log('Menu futura') }

    const mainNav = [
        { id: 'new', icon: '+', action: onNewChat, active: true },
        { id: 'users', icon: '👤', action: () => console.log('Users futura') }
    ]

    const fullConvs = useMemo(
        () =>
            conversations.map(conv => {
                const parts = conv.participants.map(
                    p => knownUsers.find(u => u.id === p.id) || p
                )
                let name = conv.name
                if ((!name || parts.length === 2) && parts.length > 0) {
                    const other = parts.find(p => p.id !== currentUser.id) || parts[0]
                    name = other.nickname || other.name
                }
                return { ...conv, participants: parts, name }
            }),
        [conversations, knownUsers, currentUser.id]
    )

    return (
        <>
            <div className={`chat-sidebar ${detailedView ? 'detailed-view-active' : ''}`}>
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
                        {mainNav.map(i => (
                            <div
                                key={i.id}
                                className={`chat-sidebar-nav-icon ${i.active ? 'active' : ''}`}
                                onClick={i.action}
                                title={i.id}
                            >
                                {i.icon}
                            </div>
                        ))}
                    </div>

                    <div className="chat-sidebar-icon-nav-footer">
                        <div
                            className={`chat-sidebar-nav-icon ${
                                detailedView ? 'settings-active' : ''
                            }`}
                            onClick={toggleDetailedView}
                            title="Configurações"
                        >
                            ⚙️
                        </div>

                        <Link
                            to="/features/view/home"
                            className="back-btn sidebar-back-btn"
                            title="Voltar"
                            onClick={openBackConfirm}
                        >
                            Voltar
                        </Link>
                    </div>
                </div>

                <div className="chat-sidebar-main-content">
                    <div className="chat-sidebar-header">
                        <div className="chat-sidebar-search-container">
                            🔍
                            <input
                                type="text"
                                placeholder="Chats"
                                className="chat-sidebar-search-input"
                                value={searchTerm}
                                onChange={e => onSearchTermChange(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="chat-conversation-list">
                        {fullConvs.length > 0 ? (
                            fullConvs.map(conv => (
                                <ConversationItem
                                    key={conv.id}
                                    conversation={conv}
                                    isActive={conv.id === activeConversationId}
                                    onClick={() => onConversationSelect(conv.id)}
                                    currentUser={currentUser}
                                    isDetailedView={detailedView}
                                />
                            ))
                        ) : (
                            <div className="chat-no-conversations-found">
                                {searchTerm
                                    ? 'Nenhum chat encontrado.'
                                    : activeFilter === 'awaiting'
                                        ? 'Nenhum chat aguardando sua resposta.'
                                        : 'Nenhum chat.'}
                            </div>
                        )}
                    </div>

                    <div className="chat-sidebar-filters">
                        <button
                            className={`chat-filter-button ${activeFilter === 'all' ? 'active' : ''}`}
                            onClick={() => onChangeFilter('all')}
                        >
                            <span className="chat-filter-badge total-badge">{totalActiveCount}</span>
                            Ativo
                        </button>
                        <button
                            className={`chat-filter-button ${
                                activeFilter === 'awaiting' ? 'active' : ''
                            }`}
                            onClick={() => onChangeFilter('awaiting')}
                        >
              <span className="chat-filter-badge awaiting-badge">
                {totalAwaitingCount}
              </span>
                            Aguardando
                        </button>
                    </div>
                </div>
            </div>

            {showBackConfirm && (
                <div className="back-modal-overlay">
                    <div className="back-modal">
                        <p className="back-modal-title">Deseja voltar?</p>
                        <div className="back-modal-actions">
                            <button className="back-btn-cancel" onClick={() => setShowBackConfirm(false)}>
                                Cancelar
                            </button>
                            <button className="back-btn-confirm" onClick={confirmBack}>
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default ChatSidebar