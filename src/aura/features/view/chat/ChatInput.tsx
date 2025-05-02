// src/features/view/chat/ChatInput.tsx
import React, { FormEvent } from 'react';
import { IconWrapper } from './IconWrapper';
import { FiPaperclip, FiSend } from 'react-icons/fi';

interface ChatInputProps {
    text: string;
    onChange(v: string): void;
    onSend(e: FormEvent): void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ text, onChange, onSend }) => (
    <form
        onSubmit={onSend}
        className="flex items-center px-6 py-4 border-t"
        style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--border-color)' }}
    >
        <IconWrapper Icon={FiPaperclip} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]" />
        <input
            type="text"
            value={text}
            onChange={e => onChange(e.target.value)}
            placeholder="Type a message…"
            className="flex-1 px-4 py-2 rounded-[var(--radius)] focus:outline-none"
            style={{ backgroundColor: 'var(--chat-bg)', color: 'var(--text-primary)' }}
        />
        <button type="submit" className="ml-4">
            <IconWrapper Icon={FiSend} size={28} className="text-[var(--text-primary)] hover:text-[var(--text-muted)]" />
        </button>
    </form>
);