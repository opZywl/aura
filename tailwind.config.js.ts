export default {
    darkMode: 'class',
    content: [
        './src/**/*.{ts,tsx}',
    ],
    theme: {
        container: {
            center: true,
            padding: '2rem',
            screens: { '2xl': '1400px' }
        },
        extend: {
            colors: {
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
                secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
                destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
                muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
                accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
                popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
                card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' }
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)'
            },
            keyframes: {
                fadeIn: {
                    '0%': {
                        opacity: '0',
                        transform: 'translateY(-10px)'
                    },
                    '100%': {
                        opacity: '1',
                        transform: 'none'
                    }
                },
                marquee: {
                    '0%': { transform: 'translateX(0%)' },
                    '100%': { transform: 'translateX(-50%)' }
                },
                gradient: {
                    to: {
                        backgroundPosition: 'var(--bg-size) 0'
                    }
                },
                pulse: {
                    '50%': {
                        opacity: .5
                    }
                },
                shimmer: {
                    '0%, 90%, to': {
                        backgroundPosition: 'calc(-100% - var(--shimmer-width)) 0'
                    },
                    '30%, 60%': {
                        backgroundPosition: 'calc(100% + var(--shimmer-width)) 0'
                    }
                },
                spin: {
                    to: {
                        transform: 'rotate(1turn)'
                    }
                }
            },
            animation: {
                marquee: 'marquee 40s linear infinite',
                'fade-in': 'fadeIn 1s var(--animation-delay, 0s) ease forwards',
                gradient: 'gradient 8s linear infinite',
                pulse: 'pulse 2s cubic-bezier(.4, 0, .6, 1) infinite',
                shimmer: 'shimmer 8s infinite',
                spin: 'spin 1s linear infinite',
            },
            animationDelay: {
                '100': '100ms',
                '200': '200ms',
                '300': '300ms',
                '400': '400ms',
                '500': '500ms',
                '600': '600ms',
                '700': '700ms',
                '800': '800ms',
                '900': '900ms',
            },
            width: { // width
                'shimmer': '100px',
            },
        }
    },
    plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography'), require('tailwindcss-animation-delay')]
};