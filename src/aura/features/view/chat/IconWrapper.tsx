// src/features/view/chat/IconWrapper.tsx
import React from 'react';

interface IconWrapperProps {
    Icon: any;
    size?: number;
    className?: string;
}

export const IconWrapper: React.FC<IconWrapperProps> = ({
 Icon,
 size = 24,
 className }) => <Icon size={size} className={className} />;