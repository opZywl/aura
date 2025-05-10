// src/aura/features/view/chat/ChatInput.tsx
import React, { useState } from 'react';

interface ChatInputProps {
    onSendMessage: (messageText: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
    const [message, setMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = message.trim();
        if (trimmed) {
            onSendMessage(trimmed);
            setMessage('');
        }
    };

    return (
        <form className="chat-input-area" onSubmit={handleSubmit}>
            <input
                type="text"
                className="chat-input-field"
                placeholder="Message"
                value={message}
                onChange={e => setMessage(e.target.value)}
            />
            <button type="submit" className="chat-send-button">
                ▶
            </button>
        </form>
    );
};

export default ChatInput;
