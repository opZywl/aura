// src/features/view/Chat.tsx
import React, { useState, useEffect, FormEvent } from 'react';
import type { IconType } from 'react-icons';
import {
    FiHome,
    FiUsers,
    FiBell,
    FiSettings,
    FiSearch,
    FiStar,
    FiPaperclip,
    FiSend,
    FiDownload
} from 'react-icons/fi';

export interface Conversation {
    id: string;
    title: string;
    lastMessage?: string;
    lastAt?: string;
}

export interface MessageType {
    id: string;
    sender: string;
    text: string;
    timestamp: string;
}


// Pequeno wrapper para evitar o erro TS2786 e padronizar uso de ícones
const IconWrapper: React.FC<{
    Icon: IconType;
    size?: number;
    className?: string;
}> = ({ Icon, size = 24, className }) =>
    React.createElement((Icon as any), { size, className });

const Chat: React.FC = () => {
    const [convs, setConvs] = useState<Conversation[]>([]);
    const [sel, setSel] = useState<string | null>(null);
    const [msgs, setMsgs] = useState<MessageType[]>([]);
    const [txt, setTxt] = useState('');
    const [ldr, setLdr] = useState(false);

    // Carregar lista de conversas a cada 5s
    useEffect(() => {
        const fetchConvs = () =>
            fetch('/api/conversations')
                .then(r => r.json())
                .then(d => setConvs(Array.isArray(d) ? d : []))
                .catch(console.error);

        fetchConvs();
        const id = setInterval(fetchConvs, 5000);
        return () => clearInterval(id);
    }, []);

    // Carregar mensagens ao selecionar conversa
    useEffect(() => {
        if (!sel) {
            setMsgs([]);
            return;
        }
        setLdr(true);
        fetch(`/api/conversations/${sel}/messages`)
            .then(r => r.json())
            .then(d => setMsgs(Array.isArray(d) ? d : []))
            .catch(console.error)
            .finally(() => setLdr(false));
    }, [sel]);

    // Enviar nova mensagem
    const handleSend = (e: FormEvent) => {
        e.preventDefault();
        if (!sel || !txt.trim()) return;
        fetch(`/api/conversations/${sel}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sender: 'you', text: txt.trim() })
        })
            .then(r => r.json())
            .then((m: MessageType) => {
                if (m && typeof m === 'object' && 'id' in m) {
                    setMsgs(ms => [...ms, m]);
                }
            })
            .catch(console.error)
            .finally(() => setTxt(''));
    };

    return (
        <div className="flex h-screen font-sans">
            {/* ← NAV LATERAL */}
            <nav
                className="w-16 flex flex-col items-center justify-between py-6"
                style={{ backgroundColor: 'var(--sidebar-bg)' }}
            >
                <img
                    src="/avatars/me.jpg"
                    alt="Meu avatar"
                    className="w-10 h-10 rounded-full"
                />
                <div className="space-y-6">
                    {[FiHome, FiUsers, FiBell, FiSettings].map((Ic, i) => (
                        <IconWrapper
                            key={i}
                            Icon={Ic}
                            className="text-[var(--text-primary)] hover:scale-110 transition-transform cursor-pointer"
                        />
                    ))}
                </div>
            </nav>

            {/* ← SIDEBAR DE CONVERSAS */}
            <aside
                className="w-80 flex flex-col border-r"
                style={{
                    backgroundColor: 'var(--sidebar-bg)',
                    borderColor: 'var(--border-color)'
                }}
            >
                {/* Search */}
                <div className="p-4">
                    <div className="relative">
                        <IconWrapper
                            Icon={FiSearch}
                            size={20}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                        />
                        <input
                            placeholder="Search in your inbox"
                            className="w-full pl-12 pr-4 py-2 rounded-[var(--radius)] focus:outline-none"
                            style={{
                                backgroundColor: 'var(--input-bg)',
                                color: 'var(--text-primary)'
                            }}
                        />
                    </div>
                </div>
                {/* Lista */}
                <div className="flex-1 overflow-y-auto px-2 space-y-2">
                    {convs.length === 0 && (
                        <p className="text-center text-[var(--text-muted)]">
                            Nenhuma conversa
                        </p>
                    )}
                    {convs.map(c => (
                        <div
                            key={c.id}
                            onClick={() => setSel(c.id)}
                            className={`
                flex items-center justify-between p-3 rounded-[var(--radius)] cursor-pointer transition
                ${
                                sel === c.id
                                    ? 'bg-gradient-to-r from-[var(--msg-purple-start)] to-[var(--msg-purple-end)] text-white'
                                    : 'hover:bg-[var(--input-bg)] text-[var(--text-primary)]'
                            }
              `}
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-9 h-9 rounded-full bg-gray-600 flex items-center justify-center text-sm text-white">
                                    {c.title.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                    <span className="truncate font-medium">{c.title}</span>
                                    {c.lastMessage && (
                                        <span className="text-xs text-[var(--text-muted)] truncate">
                      {c.lastMessage}
                    </span>
                                    )}
                                </div>
                            </div>
                            {c.lastAt && (
                                <span className="text-xs text-[var(--text-muted)]">
                  {c.lastAt}
                </span>
                            )}
                        </div>
                    ))}
                </div>
            </aside>

            {/* → ÁREA DE MENSAGENS */}
            <main className="flex-1 flex flex-col">
                {/* Header */}
                <header
                    className="flex items-center justify-between px-6 py-4 border-b"
                    style={{
                        backgroundColor: 'var(--header-bg)',
                        borderColor: 'var(--border-color)'
                    }}
                >
                    {sel ? (
                        <div className="flex items-center space-x-4">
                            <img
                                src="/avatars/contact.jpg"
                                alt="Contato"
                                className="w-12 h-12 rounded-full"
                            />
                            <div>
                                <h3 className="font-semibold text-[var(--text-primary)]">
                                    {convs.find(c => c.id === sel)?.title}
                                </h3>
                                <span className="text-green-400 text-sm">Active Now</span>
                            </div>
                        </div>
                    ) : (
                        <span className="text-[var(--text-muted)]">
              Selecione uma conversa
            </span>
                    )}
                    <div className="flex space-x-4">
                        <IconWrapper
                            Icon={FiSearch}
                            className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                        />
                        <IconWrapper
                            Icon={FiStar}
                            className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                        />
                    </div>
                </header>

                {/* Mensagens */}
                <div
                    className="flex-1 overflow-y-auto p-6 space-y-4"
                    style={{ backgroundColor: 'var(--chat-bg)' }}
                >
                    {ldr && (
                        <p className="text-center text-[var(--text-muted)]">
                            Carregando mensagens…
                        </p>
                    )}
                    {!ldr &&
                        msgs.map(m => {
                            const isYou = m.sender === 'you';
                            return (
                                <div
                                    key={m.id}
                                    className="max-w-xl p-4 rounded-[var(--radius)] flex flex-col"
                                    style={{
                                        background: isYou
                                            ? `linear-gradient(135deg, var(--msg-orange-start), var(--msg-orange-end))`
                                            : 'var(--msg-other-bg)',
                                        alignSelf: isYou ? 'flex-end' : 'flex-start'
                                    }}
                                >
                                    {!isYou && (
                                        <span className="text-xs text-[var(--text-muted)]">
                      {m.sender}
                    </span>
                                    )}
                                    <p className="text-[var(--text-primary)]">{m.text}</p>
                                    <span className="self-end text-2xs text-[var(--text-muted)]">
                    {new Date(m.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                  </span>
                                </div>
                            );
                        })}
                </div>

                {/* Input */}
                <form
                    onSubmit={handleSend}
                    className="flex items-center px-6 py-4 border-t"
                    style={{
                        backgroundColor: 'var(--input-bg)',
                        borderColor: 'var(--border-color)'
                    }}
                >
                    <IconWrapper
                        Icon={FiPaperclip}
                        className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    />
                    <input
                        type="text"
                        value={txt}
                        onChange={e => setTxt(e.target.value)}
                        placeholder="Type a message…"
                        className="flex-1 px-4 py-2 rounded-[var(--radius)] focus:outline-none"
                        style={{
                            backgroundColor: 'var(--chat-bg)',
                            color: 'var(--text-primary)'
                        }}
                    />
                    <button type="submit" className="ml-4">
                        <IconWrapper
                            Icon={FiSend}
                            size={28}
                            className="text-[var(--text-primary)] hover:text-[var(--text-muted)]"
                        />
                    </button>
                </form>
            </main>

            {/* → Painel direito de informações */}
            {sel && (
                <aside
                    className="w-80 flex flex-col p-6 border-l"
                    style={{
                        backgroundColor: 'var(--sidebar-bg)',
                        borderColor: 'var(--border-color)'
                    }}
                >
                    <img
                        src="/avatars/contact.jpg"
                        alt="Contato"
                        className="w-24 h-24 rounded-full mx-auto"
                    />
                    <h4 className="mt-4 text-center text-[var(--text-primary)]">
                        {convs.find(c => c.id === sel)?.title}
                    </h4>
                    <span className="text-green-400 text-center mb-6">
            Active Now
          </span>

                    <h5 className="text-[var(--text-muted)] uppercase text-xs mb-2">
                        Attachment
                    </h5>
                    <div className="grid grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => (
                            <img
                                key={i}
                                src={`/attachments/${i}.jpg`}
                                alt={`att${i}`}
                                className="w-full h-20 object-cover rounded-[var(--radius)]"
                            />
                        ))}
                    </div>

                    <div className="mt-4 flex justify-center">
                        <IconWrapper
                            Icon={FiDownload}
                            className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                        />
                    </div>
                </aside>
            )}
        </div>
    );
};

export default Chat;
