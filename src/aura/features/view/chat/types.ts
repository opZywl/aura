// src/aura/features/view/chat/types.ts

export type UserChatStatus = 'online' | 'offline' | 'digitando...' | 'ausente' | string;

export type ContactSituation = 'aguardando' | 'em_atendimento' | 'resolvido' | 'pendente' | string | '';

export interface User {
    id: string;
    name: string;
    nickname?: string;
    avatarSeed: string;
    avatarColor?: 'blue' | 'green' | 'red' | 'default';
    status?: UserChatStatus;
    phoneNumber?: string;
    messageCount?: number;
    observation?: string;
    situation?: ContactSituation;
    tags?: string[];
    createdAt?: Date;
}

export interface Message {
    id: string;
    senderId: string;
    text: string;
    timestamp: Date;
    status?: 'sending' | 'sent' | 'delivered' | 'read' | 'error';
}

export interface Conversation {
    id: string;
    participants: User[];
    lastMessage?: Message;
    unreadCount?: number;
    name?: string;
    avatarSeed?: string;
    avatarColor?: 'blue' | 'green' | 'red' | 'default';
    createdAt: Date;
}

export interface ChatAppProps {
    currentUser: User;
}

export interface ConversationItemProps {
    conversation: Conversation;
    isActive: boolean;
    onClick: () => void;
    currentUser: User;
    isDetailedView?: boolean;
}

export interface MessageBubbleProps {
    message: Message;
    isSender: boolean;
    sender?: User;
}

export interface ChatInfoProps {
    contact?: User;
    onClose: () => void;
    onUpdateContactDetails: (
        contactId: string,
        details: Partial<Pick<User, 'observation' | 'situation'>>
    ) => void;
}

export type NotificationMode = 'off' | 'all' | 'awaiting';

export interface ChatNotificationDropdownProps {
    currentMode: NotificationMode;
    onChangeMode: (mode: NotificationMode) => void;
    contactName?: string;
    onClose: () => void;
}