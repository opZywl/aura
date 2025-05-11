// src/aura/features/view/chat/ChatNotificationDropdown.tsx
import React, { useRef, useEffect } from 'react';

export type NotificationMode = 'off' | 'all' | 'awaiting';

interface ChatNotificationDropdownProps {
    currentMode: NotificationMode;
    onChangeMode: (mode: NotificationMode) => void;
    contactName?: string;
    onClose: () => void;
}

export const ChatNotificationDropdown: React.FC<ChatNotificationDropdownProps> = ({
                                                                                      currentMode,
                                                                                      onChangeMode,
                                                                                      contactName = 'este chat',
                                                                                      onClose
                                                                                  }) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const onClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', onClickOutside);
        return () => {
            document.removeEventListener('mousedown', onClickOutside);
        };
    }, [onClose]);

    const getAudioUrl = (): string | null => {
        const audio = document.createElement('audio');
        if (audio.canPlayType('audio/wav')) return '/notifications/message.wav';
        if (audio.canPlayType('audio/mpeg')) return '/notifications/message.mp3';
        if (audio.canPlayType('audio/ogg')) return '/notifications/message.ogg';
        console.warn('Nenhum formato de áudio suportado encontrado para notificação.');
        return null;
    };

    const options: { label: string; value: NotificationMode }[] = [
        { label: 'Desativar Notificações', value: 'off' },
        { label: 'Notificar Todas Mensagens', value: 'all' },
        { label: 'Somente Aguardando', value: 'awaiting' }
    ];

    const handleSelect = async (value: NotificationMode, label: string) => {
        let permissionGranted = false;

        if (typeof Notification !== 'undefined') {
            if (Notification.permission === 'granted') {
                permissionGranted = true;
            } else if (Notification.permission === 'default') {
                const permission = await Notification.requestPermission();
                permissionGranted = permission === 'granted';
                console.log(
                    permissionGranted
                        ? 'Permissão para notificações concedida.'
                        : 'Permissão para notificações negada.'
                );
            }
        } else {
            console.warn('API de Notificações do Navegador não disponível.');
        }

        const audioUrl = getAudioUrl();
        if (audioUrl) {
            const audioElem = new Audio(audioUrl);
            audioElem.play().catch(err => console.warn('Erro ao tocar áudio:', err));

            (window as any).__notifAudio = audioElem;
        }

        if (permissionGranted) {
            new Notification('Configuração de Notificações', {
                body: `${label} para ${contactName}.`,
                icon: '/favicon.ico',
                silent: false
            });
        }

        onChangeMode(value);
        onClose();
    };

    return (
        <div
            ref={ref}
            className="chat-options-dropdown chat-notification-dropdown"
            onClick={e => e.stopPropagation()}
        >
            <div className="chat-notification-dropdown-title">
                Notificações do Chat
            </div>
            {options.map(opt => {
                const isActive = currentMode === opt.value;
                return (
                    <div
                        key={opt.value}
                        onClick={() => handleSelect(opt.value, opt.label)}
                        className={`chat-options-dropdown-item${
                            isActive ? ' active-notification-mode' : ''
                        }`}
                    >
                        {opt.label}
                    </div>
                );
            })}
        </div>
    );
};
