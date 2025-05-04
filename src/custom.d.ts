declare module 'tailwindcss' {
    import type { Config } from 'tailwindcss/dist/cli'
    const config: Config
    export = config
}

declare module 'tailwindcss-animate'
declare module '@tailwindcss/typography'
declare module 'tailwindcss-animation-delay'

declare module '*.png' {
    const value: string;
    export default value;
}
declare module '*.jpg' {
    const value: string;
    export default value;
}
declare module '*.svg' {
    const content: string;
    export default content;
}

declare module '*.wav';
declare module '*.mp3';
declare module '*.ogg';