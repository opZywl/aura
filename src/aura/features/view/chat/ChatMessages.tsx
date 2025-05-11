// src/aura/features/view/chat/ChatMessages.tsx
import React, { useEffect, useRef } from 'react'
import { Message, User } from './types'

export interface MessageBubbleProps {
    message: Message
    isSender: boolean
}

const formatTime = (date: Date): string =>
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isSender }) => {
    const renderStatusIcon = () => {
        if (!isSender || !message.status || message.status === 'sending') return null
        switch (message.status) {
            case 'sent':
                return <span className="chat-message-status-icon sent-icon">✓</span>
            case 'delivered':
                return <span className="chat-message-status-icon delivered-icon">✓✓</span>
            case 'read':
                return <span className="chat-message-status-icon read-icon">✓✓</span>
            case 'error':
                return <span className="chat-message-status-icon error-icon" title="Falha ao enviar">⚠️</span>
            default:
                return null
        }
    }

    return (
        <div
            className={[
                'chat-message-bubble',
                isSender ? 'sent' : 'received',
                isSender && message.status === 'sending' ? 'sending-opacity' : '',
            ]
                .filter(Boolean)
                .join(' ')}
            id={`message-${message.id}`}
        >
            <div className="chat-message-text">{message.text}</div>
            <div className="chat-message-meta">
                <span className="chat-message-time">{formatTime(message.timestamp)}</span>
                {renderStatusIcon()}
            </div>
        </div>
    )
}

export interface ChatMessagesProps {
    messages: Message[]
    currentUser: User
    participants: User[]
    isLoading?: boolean
}

const ChatMessages: React.FC<ChatMessagesProps> = ({
                                                       messages,
                                                       currentUser,
                                                       isLoading = false,
                                                   }) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const endRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
        endRef.current?.scrollIntoView({ behavior })
    }

    useEffect(() => {
        if (!isLoading && messages.length > 0) {
            scrollToBottom('auto')
        }
    }, [messages, isLoading])

    if (isLoading) {
        return (
            <div
                className="chat-messages"
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: '#777',
                    flexGrow: 1,
                }}
            >
                Carregando mensagens...
            </div>
        )
    }

    if (messages.length === 0) {
        return (
            <div
                className="chat-messages"
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: '#777',
                    flexGrow: 1,
                }}
            >
                Nenhuma mensagem ainda. Envie uma para começar!
            </div>
        )
    }

    return (
        <div className="chat-messages" ref={containerRef}>
            {messages.map(msg => {
                const isSender = msg.senderId === currentUser.id
                return <MessageBubble key={msg.id} message={msg} isSender={isSender} />
            })}
            <div ref={endRef} />
        </div>
    )
}

export default ChatMessages