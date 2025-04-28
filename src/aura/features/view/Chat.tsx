import React from 'react';

// Definição de cada conversa
export interface Conversation {
    id: string;
    title: string;
    lastMessage?: string;
    unreadCount?: number;
    lastAt?: string;
    isGroup?: boolean; // opcional: identificar chat em grupo
}

interface ChatProps {
    conversations?: Conversation[];               // lista de conversas dinâmicas
    onSelectConversation?: (id: string) => void;   // callback ao selecionar conversa
}

// Item de lista de conversas
const ChatItem: React.FC<Conversation & { onClick?: () => void }> = ({
                                                                         id,
                                                                         title,
                                                                         lastMessage,
                                                                         unreadCount,
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
            {unreadCount !== undefined && unreadCount > 0 && (
                <span className="inline-block bg-blue-500 text-white text-xs font-semibold px-2 py-0.5 rounded">
          {unreadCount}
        </span>
            )}
        </div>
    </div>
);

// Componente principal de Chat
const Chat: React.FC<ChatProps> = ({ conversations = [], onSelectConversation }) => {
    // Filtra apenas conversas individuais (ignora grupos se necessário)
    const chatsFiltradas = conversations.filter(c => !c.isGroup);

    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <aside className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
                {/* Status */}
                <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-gray-300" />
                        <span className="font-medium text-gray-700">Disponível</span>
                    </div>
                    {/* Menu de ações */}
                    <button className="p-1 hover:bg-gray-200 rounded">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-gray-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
                {/* Estatísticas */}
                <div className="px-4 pb-2 grid grid-cols-2 gap-2 text-center">
                    <div className="bg-white p-3 rounded shadow">
                        <p className="text-sm text-gray-500">Ativo</p>
                        <p className="text-lg font-semibold">{chatsFiltradas.length}</p>
                        <p className="text-xs text-gray-400">Tempo médio: --</p>
                    </div>
                    <div className="bg-white p-3 rounded shadow">
                        <p className="text-sm text-gray-500">Aguardando</p>
                        <p className="text-lg font-semibold">0</p>
                        <p className="text-xs text-gray-400">Tempo médio: --</p>
                    </div>
                </div>
                {/* Busca */}
                <div className="px-4 py-2">
                    <input
                        type="text"
                        placeholder="Pesquisar"
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring"
                    />
                </div>
                {/* Lista de conversas */}
                <div className="flex-1 overflow-y-auto">
                    {chatsFiltradas.length > 0 ? (
                        chatsFiltradas.map(c => (
                            <ChatItem
                                key={c.id}
                                {...c}
                                onClick={() => onSelectConversation?.(c.id)}
                            />
                        ))
                    ) : (
                        <p className="text-center text-gray-500 mt-4">Nenhuma conversa ativa</p>
                    )}
                </div>
                {/* Botão nova mensagem */}
                <div className="p-4">
                    <button className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700">
                        + Nova mensagem
                    </button>
                </div>
            </aside>

            {/* Janela de chat */}
            <main className="flex-1 bg-white">
                <div className="p-6">
                    <h2 className="text-2xl font-semibold text-gray-800">Home</h2>
                    <p className="mt-2 text-gray-600">Selecione uma conversa para visualizar as mensagens.</p>
                </div>
                {/* Aqui pode ficar o painel de mensagens da conversa selecionada */}
            </main>
        </div>
    );
};

export default Chat;
