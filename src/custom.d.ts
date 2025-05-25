// src/custom.d.ts

// TailwindCSS
declare module 'tailwindcss' {
    import type { Config } from 'tailwindcss/dist/cli';
    const config: Config;
    export = config;
}

declare module 'tailwindcss-animate';
declare module '@tailwindcss/typography';
declare module 'tailwindcss-animation-delay';
declare module 'tailwindcss-filters';
declare module 'lucide-react';

// Imagens e outros assets
declare module '*.png' {
    const value: string;
    export default value;
}

declare module '*.jpg' {
    const value: string;
    export default value;
}

// Tipagem para SVG com suporte a componente React (SVGR) e URL
declare module '*.svg' {
    import * as React from 'react';

    // Se você fizer: import { ReactComponent as Icon } from '…svg'
    export const ReactComponent: React.FunctionComponent<
        React.SVGProps<SVGSVGElement> & { title?: string }
    >;

    // Se você fizer: import logoUrl from '…svg'
    const src: string;
    export default src;
}

// Outros assets de mídia
declare module '*.wav';
declare module '*.mp3';
declare module '*.ogg';
