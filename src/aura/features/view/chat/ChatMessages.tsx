// src/aura/features/view/chat/ChatMessages.tsx
import React, { useEffect, useRef } from 'react';
import { Message, User, MessageBubbleProps } from './types';

const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
};

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isSender }) => {
    const renderStatusIcon = () => {
        if (!isSender || !message.status) return null;
        if (message.status === 'sending') return null;

        switch (message.status) {
            case 'sent':
                return <span className="chat-message-status-icon sent-icon">✓</span>;
            case 'delivered':
                return <span className="chat-message-status-icon delivered-icon">✓✓</span>;
            case 'read':
                return <span className="chat-message-status-icon read-icon">✓✓</span>;
            case 'error':
                return <span className="chat-message-status-icon error-icon">⚠️</span>;
            default:
                return null;
        }
    };

    return (
        <div
            className={`chat-message-bubble ${
                isSender ? 'sent' : 'received'
            } ${message.status === 'sending' && isSender ? 'sending-opacity' : ''}`}
        >
            <div className="chat-message-text">{message.text}</div>
            <div className="chat-message-meta">
                <span className="chat-message-time">
                    {formatTime(message.timestamp)}
                </span>
                {isSender && renderStatusIcon()}
            </div>
        </div>
    );
};

interface ChatMessagesProps {
    messages: Message[];
    currentUser: User;
    participants: User[];
}

const ChatMessages: React.FC<ChatMessagesProps> = ({
                                                       messages,
                                                       currentUser,
                                                       participants,
                                                   }) => {
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    };

    useEffect(() => {
        scrollToBottom('auto');
    }, [messages]);

    if (!messages || messages.length === 0) {
        return (
            <div
                className="chat-messages"
                style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: '#777',
                }}
            >
                Nenhuma mensagem ainda. Envie uma para começar!
            </div>
        );
    }

    return (
        <div className="chat-messages" ref={messagesContainerRef}>
            {messages.map((msg, index) => {
                const isSender = msg.senderId === currentUser.id;
                return (
                    <MessageBubble
                        key={`${msg.id}-${index}`}
                        message={msg}
                        isSender={isSender}
                    />
                );
            })}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default ChatMessages;