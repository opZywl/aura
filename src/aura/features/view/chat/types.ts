// src/features/view/chat/types.ts
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