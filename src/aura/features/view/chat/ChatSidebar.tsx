import React from 'react';
import { Conversation } from './types';
import { IconWrapper } from './IconWrapper';
import { FiSearch } from 'react-icons/fi';

interface ChatSidebarProps {
    activeConvs: Conversation[];
    awaitingConvs: Conversation[];
    sel: string | null;
    filterView: 'ativo' | 'aguardando';
    onFilterChange(v: 'ativo' | 'aguardando'): void;
    onSelect(id: string): void;
    searchVisible: boolean;
    searchTerm: string;
    onSearchToggle(): void;
    onSearchChange(v: string): void;
    onSearchKey(e: React.KeyboardEvent<HTMLInputElement>): void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
activeConvs, awaitingConvs, sel, filterView, onFilterChange, onSelect, searchVisible, searchTerm, onSearchToggle, onSearchChange, onSearchKey }) => {
    const list = filterView === 'ativo' ? activeConvs : awaitingConvs;

    return (
        <aside className="w-80 flex flex-col border-r"
               style={{ backgroundColor:'var(--sidebar-bg)', borderColor:'var(--border-color)' }}>
            <div className="p-4 flex mb-4">
                <button
                    className={`flex-1 py-3 text-center ${
                        filterView === 'ativo'
                            ? 'bg-blue-600 text-white rounded-l-md'
                            : 'bg-gray-200 text-gray-700 rounded-l-md'
                    }`}
                    onClick={() => onFilterChange('ativo')}
                >
                    <div className="text-lg font-bold">{activeConvs.length}</div>
                    <div className="text-sm">Ativo</div>
                </button>
                <button
                    className={`flex-1 py-3 text-center ${
                        filterView === 'aguardando'
                            ? 'bg-blue-600 text-white rounded-r-md'
                            : 'bg-gray-200 text-gray-700 rounded-r-md'
                    }`}
                    onClick={() => onFilterChange('aguardando')}
                >
                    <div className="text-lg font-bold">{awaitingConvs.length}</div>
                    <div className="text-sm">Aguardando</div>
                </button>
            </div>

            <div className="px-4">
                <button
                    onClick={onSearchToggle}
                    className="w-full flex items-center justify-center bg-gray-800 text-gray-300 hover:bg-gray-700 px-4 py-2 rounded-xl transition-colors"
                >
                    <IconWrapper Icon={FiSearch} className="mr-2" />
                    <span className="font-medium">Pesquisar</span>
                </button>
                {searchVisible && (
                    <input
                        type="text"
                        placeholder="Digite para buscar…"
                        className="mt-3 w-full bg-gray-800 text-gray-100 placeholder-gray-500 px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={e => onSearchChange(e.target.value)}
                        onKeyDown={onSearchKey}
                    />
                )}
            </div>

            <div className="flex-1 overflow-y-auto px-2 space-y-2 mt-4">
                {list.length === 0 ? (
                    <p className="text-center text-[var(--text-muted)] py-6">Nenhuma conversa</p>
                ) : (
                    list.map(c => (
                        <div
                            key={c.id}
                            onClick={() => onSelect(c.id)}
                            className={`
                flex items-center justify-between p-3 rounded-[var(--radius)] cursor-pointer transition
                ${sel === c.id
                                ? 'bg-gradient-to-r from-[var(--msg-purple-start)] to-[var(--msg-purple-end)] text-white'
                                : 'hover:bg-[var(--input-bg)] text-[var(--text-primary)]'}
              `}
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-9 h-9 rounded-full bg-gray-600 flex items-center justify-center text-sm text-white">
                                    {c.title.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                    <span className="truncate font-medium">{c.title}</span>
                                    {c.lastMessage && (
                                        <span className="text-xs text-[var(--text-muted)]">
                      {c.lastMessage.length > 15
                          ? `${c.lastMessage.slice(0, 15)}...`
                          : c.lastMessage}
                    </span>
                                    )}
                                </div>
                            </div>
                            {c.lastAt && (
                                <span className="text-xs text-[var(--text-muted)]">
                  {new Date(c.lastAt + 'Z').toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                  })}
                </span>
                            )}
                        </div>
                    ))
                )}
            </div>
        </aside>
    );
};
