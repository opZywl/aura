// src/features/view/chat/ChatMessages.tsx
import React from 'react';
import { MessageType } from './types';

interface ChatMessagesProps {
    msgs: MessageType[];
    loading: boolean;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({ msgs, loading }) => (
    <div
        className="flex-1 flex flex-col overflow-y-auto p-6 space-y-4"
        style={{ backgroundColor: 'var(--chat-bg)' }}
    >
        {loading ? (
            <p className="text-center text-[var(--text-muted)]">Carregando mensagens…</p>
        ) : (
            msgs.map(m => {
                const isYou = m.sender === 'you';
                return (
                    <div key={m.id} className={isYou ? 'flex justify-end' : 'flex justify-start'}>
                        <div
                            className="min-w-[150px] max-w-[60%] px-4 py-2 rounded-lg flex flex-col break-words"
                            style={{
                                background: isYou
                                    ? `linear-gradient(135deg, var(--msg-orange-start), var(--msg-orange-end))`
                                    : 'var(--msg-other-bg)'
                            }}
                        >
                            {!isYou && <span className="text-xs text-[var(--text-muted)]">{m.sender}</span>}
                            <p className="text-[var(--text-primary)]">{m.text}</p>
                            <span className="self-end text-2xs text-[var(--text-muted)]">
                {new Date(m.timestamp + 'Z').toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                })}
              </span>
                        </div>
                    </div>
                );
            })
        )}
    </div>
);