// src/aura/features/view/chat/ChatHeader.tsx
import React, { useState, useEffect, useRef } from 'react'
import IconWrapper from './IconWrapper'
import refreshIcon from '../../../../resources/refresh.svg';
import successIcon from '../../../../resources/sucess.svg';
import cancelIcon from '../../../../resources/cancel.svg';

import { User } from './types'
import {
    ChatNotificationDropdown,
    NotificationMode
} from './ChatNotificationDropdown'

type ViewMode = 'normal' | 'full'

interface ChatHeaderProps {
    contact?: User
    viewMode: ViewMode
    notificationMode: NotificationMode
    onViewModeChange: (mode: ViewMode) => void
    onToggleTheme: () => void
    onShowContactInfo: () => void
    onChangeNotificationMode: (mode: NotificationMode) => void
    onUpdateContactNickname: (contactId: string, newNickname: string | null) => void
    onCloseConversation: () => void
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
                                                   contact,
                                                   viewMode,
                                                   notificationMode,
                                                   onViewModeChange,
                                                   onToggleTheme,
                                                   onShowContactInfo,
                                                   onChangeNotificationMode,
                                                   onUpdateContactNickname,
                                                   onCloseConversation
                                               }) => {
    const [optionsMenuOpen, setOptionsMenuOpen] = useState(false)
    const [notificationDropdownOpen, setNotificationDropdownOpen] =
        useState(false)
    const [isEditingNickname, setIsEditingNickname] = useState(false)
    const [editableNickname, setEditableNickname] = useState('')
    const [showFinishConfirm, setShowFinishConfirm] = useState(false)

    const optionsMenuRef = useRef<HTMLDivElement>(null)
    const nicknameInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (isEditingNickname && contact) {
            setEditableNickname(contact.nickname || contact.name)
            nicknameInputRef.current?.focus()
            nicknameInputRef.current?.select()
        }
    }, [isEditingNickname, contact])

    const toggleOptionsMenu = (e: React.MouseEvent) => {
        e.stopPropagation()
        setOptionsMenuOpen(prev => !prev)
        if (notificationDropdownOpen) setNotificationDropdownOpen(false)
    }

    const toggleNotificationDropdown = (e: React.MouseEvent) => {
        e.stopPropagation()
        setNotificationDropdownOpen(prev => !prev)
        if (optionsMenuOpen) setOptionsMenuOpen(false)
    }

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                optionsMenuRef.current &&
                !optionsMenuRef.current.contains(e.target as Node)
            ) {
                setOptionsMenuOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleResolutionToggle = () => {
        onViewModeChange(viewMode === 'normal' ? 'full' : 'normal')
        setOptionsMenuOpen(false)
    }

    const ResolutionDropdownIcon =
        viewMode === 'normal'
            ? () => (
                <span title="Mudar para Tela Cheia" className="chat-dropdown-icon">
            🖼️
          </span>
            )
            : () => (
                <span title="Mudar para Modo Normal" className="chat-dropdown-icon">
            🔳
          </span>
            )

    const handleNicknameClick = () => {
        if (contact && !isEditingNickname) setIsEditingNickname(true)
    }

    const handleSaveNickname = () => {
        if (contact) {
            const finalNickname =
                editableNickname.trim() === contact.name
                    ? null
                    : editableNickname.trim()
            onUpdateContactNickname(contact.id, finalNickname)
        }
        setIsEditingNickname(false)
    }

    const handleResetNickname = () => {
        if (contact) {
            onUpdateContactNickname(contact.id, null)
            setEditableNickname(contact.name)
            nicknameInputRef.current?.focus()
        }
    }

    const handleCancelEditNickname = () => {
        setIsEditingNickname(false)
        if (contact) setEditableNickname(contact.nickname || contact.name)
    }

    const openFinishConfirm = (e: React.MouseEvent) => {
        e.stopPropagation()
        setShowFinishConfirm(true)
    }

    const confirmFinish = () => {
        setShowFinishConfirm(false)
        onCloseConversation()
    }

    const displayName = contact?.nickname || contact?.name || 'Conversa'

    return (
        <>
            <div className="chat-header">
                {contact ? (
                    <>
                        <IconWrapper
                            seed={contact.name}
                            color={contact.avatarColor || 'green'}
                        />
                        <div className="chat-header-info">
                            {isEditingNickname ? (
                                <div className="chat-nickname-edit-container">
                                    <input
                                        ref={nicknameInputRef}
                                        type="text"
                                        value={editableNickname}
                                        onChange={e => setEditableNickname(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') handleSaveNickname()
                                            if (e.key === 'Escape') handleCancelEditNickname()
                                        }}
                                        className="chat-nickname-input"
                                        placeholder="Digite o apelido"
                                    />
                                    <button
                                        onClick={handleSaveNickname}
                                        className="back-btn"
                                        title="Salvar Apelido"
                                    >
                                        <img src={successIcon} alt="" className="icon" />
                                        <span>Salvar</span>
                                    </button>
                                    <button
                                        onClick={handleResetNickname}
                                        className="back-btn"
                                        title="Resetar para nome original"
                                    >
                                        <img src={refreshIcon} alt="" className="icon" />
                                        <span>Resetar</span>
                                    </button>
                                    <button
                                        onClick={handleCancelEditNickname}
                                        className="back-btn"
                                        title="Cancelar Edição"
                                    >
                                        <img src={cancelIcon} alt="" className="icon" />
                                        <span>Sair</span>
                                    </button>
                                </div>
                            ) : (
                                <div
                                    className="chat-header-name"
                                    onClick={handleNicknameClick}
                                    title={
                                        contact.name === displayName
                                            ? 'Clique para definir apelido'
                                            : 'Clique para editar apelido'
                                    }
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter' || e.key === ' ') handleNicknameClick()
                                    }}
                                >
                                    {displayName}
                                </div>
                            )}

                            {contact.status && !isEditingNickname && (
                                <div className="chat-header-status">{contact.status}</div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="chat-header-name" style={{ flexGrow: 1 }}>
                        Selecione uma conversa
                    </div>
                )}

                {!isEditingNickname && (
                    <div className="chat-header-actions">
                        <button
                            className="back-btn chat-header-finish-btn"
                            onClick={openFinishConfirm}
                            title="Encerrar Conversa"
                        >
                            <span className="finish-icon">☑</span>
                            <span className="finish-text">Finalizar</span>
                        </button>

                        <div className="chat-notification-container">
                            <button
                                className="chat-header-icon-button"
                                onClick={toggleNotificationDropdown}
                                title="Configurar Notificações"
                            >
                                <span className="chat-header-main-icon">🔔</span>
                            </button>
                            {notificationDropdownOpen && (
                                <ChatNotificationDropdown
                                    currentMode={notificationMode}
                                    onChangeMode={onChangeNotificationMode}
                                    contactName={contact?.name}
                                    onClose={() => setNotificationDropdownOpen(false)}
                                />
                            )}
                        </div>

                        {/* opções */}
                        <div className="chat-options-menu-container" ref={optionsMenuRef}>
                            <button
                                className="chat-header-icon-button options-button"
                                onClick={toggleOptionsMenu}
                                title="Mais opções"
                            >
                                <span className="three-dots-icon" />
                            </button>
                            {optionsMenuOpen && (
                                <div
                                    className="chat-options-dropdown"
                                    onClick={e => e.stopPropagation()}
                                >
                                    <button
                                        onClick={handleResolutionToggle}
                                        className="chat-options-dropdown-item"
                                    >
                                        <ResolutionDropdownIcon />{' '}
                                        {viewMode === 'normal' ? 'Tela Cheia' : 'Modo Normal'}
                                    </button>
                                    {contact && (
                                        <button
                                            onClick={() => {
                                                onShowContactInfo()
                                                setOptionsMenuOpen(false)
                                            }}
                                            className="chat-options-dropdown-item"
                                        >
                      <span
                          title="Informações do Contato"
                          className="chat-dropdown-icon"
                      >
                        ℹ️
                      </span>{' '}
                                            Info do Contato
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {showFinishConfirm && (
                <div
                    className="finish-modal-overlay"
                    onClick={() => setShowFinishConfirm(false)}
                >
                    <div
                        className="finish-modal"
                        onClick={e => e.stopPropagation()}
                    >
                        <p className="finish-modal-title">
                            Deseja mesmo finalizar a conversa?
                        </p>
                        <div className="finish-modal-actions">
                            <button
                                className="finish-btn-cancel"
                                onClick={() => setShowFinishConfirm(false)}
                            >
                                Cancelar
                            </button>
                            <button
                                className="finish-btn-confirm"
                                onClick={confirmFinish}
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default ChatHeader