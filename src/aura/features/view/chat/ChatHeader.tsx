import React from 'react';
import { IconWrapper } from './IconWrapper';
import { FiBell, FiSettings } from 'react-icons/fi';

interface ChatHeaderProps {
    title?: string;
    onAvatarClick?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
    title, onAvatarClick }) => (
    <header
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{ backgroundColor: 'var(--header-bg)', borderColor: 'var(--border-color)' }}
    >
        {title ? (
            <div className="flex items-center space-x-4">
                <img
                    src="/avatars/contact.jpg"
                    alt="Contato"
                    className="w-12 h-12 rounded-full cursor-pointer"
                    onClick={onAvatarClick}
                />
                <div>
                    <h3 className="font-semibold text-[var(--text-primary)]">{title}</h3>
                    <span className="text-green-400 text-sm">Active Now</span>
                </div>
            </div>
        ) : (
            <span className="text-[var(--text-muted)]">Selecione uma conversa</span>
        )}
        <div className="flex space-x-4">
            <IconWrapper
                Icon={FiBell}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            />
            <IconWrapper
                Icon={FiSettings}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            />
        </div>
    </header>
);