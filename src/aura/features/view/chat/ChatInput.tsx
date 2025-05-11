// src/aura/features/view/chat/ChatInput.tsx
import React, { useState, useEffect, useRef } from 'react';

export interface ChatInputProps {
    onSendMessage: (messageText: string) => void;
    disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled = false }) => {
    const [message, setMessage] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = message.trim();
        if (trimmed && !disabled) {
            onSendMessage(trimmed);
            setMessage('');
            inputRef.current?.focus();
        }
    };

    useEffect(() => {
        if (!disabled) {
            inputRef.current?.focus();
        }
    }, [disabled]);

    return (
        <form className="chat-input-area" onSubmit={handleSubmit}>
            <input
                ref={inputRef}
                type="text"
                className="chat-input-field"
                placeholder={disabled ? "Aguarde..." : "Digite uma mensagem..."}
                value={message}
                onChange={e => setMessage(e.target.value)}
                disabled={disabled}
                aria-label="Mensagem"
            />
            <button
                type="submit"
                className="chat-send-button"
                disabled={disabled || message.trim() === ''}
                aria-label="Enviar mensagem"
            >
                ▶
            </button>
        </form>
    );
};

export default ChatInput;
