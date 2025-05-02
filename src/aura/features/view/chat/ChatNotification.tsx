import React, { useState, useRef, useEffect } from 'react';
import { IconWrapper } from './IconWrapper';
import { FiBell } from 'react-icons/fi';

export type NotificationMode = 'off' | 'all' | 'awaiting';

interface ChatNotificationProps {
    mode: NotificationMode;
    onChangeMode: (mode: NotificationMode) => void;
    contactName?: string;
}

export const ChatNotification: React.FC<ChatNotificationProps> = ({
         mode, onChangeMode, contactName = 'Contato' }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const onClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', onClickOutside);
        return () => document.removeEventListener('mousedown', onClickOutside);
    }, []);

    const getAudioUrl = (): string|null => {
        const a = document.createElement('audio');
        if (a.canPlayType('audio/wav'))   return '/notifications/message.wav';
        if (a.canPlayType('audio/mpeg'))  return '/notifications/message.mp3';
        if (a.canPlayType('audio/ogg'))   return '/notifications/message.ogg';
        return null;
    };

    const options: { label: string; value: NotificationMode }[] = [
        { label: 'Desativar Notificações',    value: 'off' },
        { label: 'Notificar Todas Mensagens',  value: 'all' },
        { label: 'Somente Aguardando',        value: 'awaiting' }
    ];

    const handleSelect = (value: NotificationMode, label: string) => {
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }

        const audioUrl = getAudioUrl();
        if (audioUrl) {
            new Audio(audioUrl).play().catch(()=>{});
        }

        if (Notification.permission === 'granted') {
            new Notification('Configuração de Notificações', {
                body: `${label} para ${contactName}`,
                silent: true
            });
        }

        onChangeMode(value);
        setOpen(false);
    };

    return (
        <div className="relative" ref={ref}>
            <div onClick={() => setOpen(o => !o)}>
                <IconWrapper
                    Icon={FiBell}
                    className="text-[var(--text-primary)] hover:scale-110 cursor-pointer"
                />
            </div>

            {open && (
                <div
                    className="
            absolute right-0 mt-2 w-48
            bg-[var(--sidebar-bg)] text-[var(--text-primary)]
            border border-[var(--border-color)]
            rounded-md shadow-lg z-20
          "
                >
                    {options.map(opt => {
                        const isActive = mode === opt.value;
                        return (
                            <div
                                key={opt.value}
                                onClick={() => handleSelect(opt.value, opt.label)}
                                className={`
                  px-4 py-2 text-sm
                  hover:bg-[var(--input-bg)]
                  cursor-pointer
                  ${isActive ? 'font-semibold' : ''}
                `}
                            >
                                {opt.label}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};