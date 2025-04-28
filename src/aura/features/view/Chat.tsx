import React, { useState, useEffect } from 'react';

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

const ChatItem: React.FC<Conversation & { onClick: () => void }> = ({
                                                                        id,
                                                                        title,
                                                                        lastMessage,
                                                                        lastAt,
                                                                        onClick,
                                                                    }) => (
    <div
        onClick={onClick}
        className="flex items-center justify-between p-3 hover:bg-gray-100 cursor-pointer"
    >
        <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-lg font-bold text-white">
                {title.charAt(0)}
            </div>
            <div>
                <p className="font-medium text-gray-800">{title}</p>
                {lastMessage && <p className="text-sm text-gray-500 truncate">{lastMessage}</p>}
            </div>
        </div>
        <div className="text-right space-y-1">
            {lastAt && <span className="text-xs text-gray-400">{lastAt}</span>}
        </div>
    </div>
);

const Chat: React.FC = () => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConv, setSelectedConv] = useState<string | null>(null);

    const [messages, setMessages] = useState<MessageType[]>([]);
    const [loadingMsgs, setLoadingMsgs] = useState(false);

    const fetchConversations = () => {
        fetch('/api/conversations')
            .then(res => res.json())
            .then((data: Conversation[]) => setConversations(data))
            .catch(err => console.error('Erro ao buscar conversas:', err));
    };

    useEffect(() => {
        fetchConversations();
        const interval = setInterval(fetchConversations, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!selectedConv) return;
        setLoadingMsgs(true);
        fetch(`/api/conversations/${selectedConv}/messages`)
            .then(async res => {
                const data = await res.json();
                if (Array.isArray(data)) {
                    setMessages(data as MessageType[]);
                } else {
                    console.error('Resposta inesperada de mensagens:', data);
                    setMessages([]);
                }
            })
            .catch(err => {
                console.error('Erro ao buscar mensagens:', err);
                setMessages([]);
            })
            .finally(() => setLoadingMsgs(false));
    }, [selectedConv]);

    return (
        <div className="flex h-screen">
            <aside className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
                <div className="px-4 py-2">
                    <input
                        type="text"
                        placeholder="Pesquisar"
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring"
                    />
                </div>
                <div className="flex-1 overflow-y-auto">
                    {conversations.length > 0 ? (
                        conversations.map(conv => (
                            <ChatItem
                                key={conv.id}
                                {...conv}
                                onClick={() => setSelectedConv(conv.id)}
                            />
                        ))
                    ) : (
                        <p className="text-center text-gray-500 mt-4">Nenhuma conversa disponível</p>
                    )}
                </div>
            </aside>

            <main className="flex-1 flex flex-col bg-white">
                {selectedConv ? (
                    <>
                        <div className="p-4 border-b">
                            <h2 className="text-xl font-semibold">
                                {conversations.find(c => c.id === selectedConv)?.title}
                            </h2>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {loadingMsgs && <p className="text-center text-gray-500">Carregando mensagens...</p>}
                            {!loadingMsgs && Array.isArray(messages) && messages.map(m => (
                                <div
                                    key={m.id}
                                    className={`max-w-xs p-2 rounded ${m.sender === 'system' ? 'bg-gray-200 self-center' : 'bg-blue-100 self-start'}`}
                                >
                                    <span className="font-semibold text-sm">{m.sender}:</span> {m.text}
                                    <div className="text-xs text-gray-400 text-right">
                                        {new Date(m.timestamp).toLocaleTimeString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-gray-500">Selecione uma conversa para exibir</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Chat;