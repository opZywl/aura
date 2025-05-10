// src/aura/features/view/chat/IconWrapper.tsx
import React from 'react';

interface IconWrapperProps {
    seed: string;
    color?: 'blue' | 'green' | 'red' | 'default' | string;
    size?: number;
    fontSize?: number;
    isImage?: boolean;
    imageUrl?: string;
    children?: React.ReactNode;
}

const IconWrapper: React.FC<IconWrapperProps> = ({
                                                     seed,
                                                     color = 'default',
                                                     size = 40,
                                                     fontSize = 18,
                                                     isImage = false,
                                                     imageUrl,
                                                     children
                                                 }) => {
    const initials = seed.substring(0, 2).toUpperCase();

    const style: React.CSSProperties = {
        width: `${size}px`,
        height: `${size}px`,
        fontSize: `${fontSize}px`,
    };

    if (isImage && imageUrl) {
        return (
            <img src={imageUrl} alt={seed} className="chat-icon-wrapper" style={{...style, objectFit: 'cover'}} />
        );
    }

    if (children) {
        return (
            <div className={`chat-icon-wrapper ${typeof color === 'string' && ['blue', 'green', 'red', 'default'].includes(color) ? color : ''}`} style={typeof color === 'string' && !['blue', 'green', 'red', 'default'].includes(color) ? {...style, backgroundColor: color} : style}>
                {children}
            </div>
        )
    }

    return (
        <div className={`chat-icon-wrapper ${color}`} style={style}>
            {initials}
        </div>
    );
};

export default IconWrapper;