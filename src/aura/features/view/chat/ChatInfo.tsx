// src/features/view/chat/ChatInfo.tsx
import React from 'react';
import { Conversation } from './types';

interface ChatInfoProps {
    conv: Conversation;
    messages: { id: string; sender: string; text: string; timestamp: string }[];
    onClose: () => void;
}

export const ChatInfo: React.FC<ChatInfoProps> = ({ conv, messages, onClose }) => (
    <aside
        className="w-80 flex flex-col p-6 border-l bg-[var(--sidebar-bg)] text-[var(--text-primary)]"
        style={{ borderColor: 'var(--border-color)' }}
    >
        <button
            onClick={onClose}
            className="self-end mb-4 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        >
            Fechar
        </button>
        <img
            src="/avatars/contact.jpg"
            alt="Contato"
            className="w-24 h-24 rounded-full mx-auto"
        />
        <h4 className="mt-4 text-center font-semibold">{conv.title}</h4>
        <span className="text-center text-sm mb-4">ID: {conv.id}</span>

        <h5 className="uppercase text-xs text-[var(--text-muted)] mb-2">Mensagens enviadas</h5>
        <p className="text-sm mb-4">{messages.length}</p>

        <h5 className="uppercase text-xs text-[var(--text-muted)] mb-2">Última mensagem</h5>
        <p className="text-sm">{conv.lastMessage ?? '—'}</p>
        <p className="text-2xs text-[var(--text-muted)]">
            {conv.lastAt
                ? new Date(conv.lastAt + 'Z').toLocaleString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                })
                : '—'}
        </p>
    </aside>
);