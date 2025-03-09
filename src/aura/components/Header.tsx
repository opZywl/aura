import React from 'react';
import { Link } from 'react-router-dom';

interface HeaderProps {
    toggleTheme: () => void;
    theme: 'light' | 'dark';
}

const navLinks = [
    { name: 'Artigo', href: '#Artigo' },
    { name: 'Prompts', href: '#prompts' },
    { name: 'Changelog', href: '#changelog' },
    { name: 'CRM', href: '#CRM' },
];

const Header: React.FC<HeaderProps> = ({ toggleTheme, theme }) => {
    const textColorClass = theme === 'light' ? 'text-black' : 'text-white';

    return (
        <header className="animate-fade-in delay-600 left-0 top-0 z-50 w-full -translate-y-4 border-b opacity-0 backdrop-blur-md">
            <div className="container flex h-14 items-center justify-between">
                <a className={`flex items-center text-lg font-extrabold ${textColorClass}`} href="/">
                    Aura
                </a>

                <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 rounded-full border p-1 md:flex">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            className={`mx-4 text-sm hover:opacity-50 ${textColorClass}`}
                            href={link.href}
                        >
                            {link.name}
                        </a>
                    ))}
                </nav>

                <div className="ml-auto flex h-full items-center gap-2 md:ml-0 md:gap-4">
                    <button className="ml-0 md:hidden" type="button" aria-label="Abrir menu">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={textColorClass}
                        >
                            <line x1="3" x2="21" y1="6" y2="6" />
                            <line x1="3" x2="21" y1="12" y2="12" />
                            <line x1="3" x2="21" y1="18" y2="18" />
                        </svg>
                    </button>
                    <Link to="/login">
                        <button
                            type="button"
                            className="ring-offset-background focus-visible:ring-ring inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border-input bg-background hover:bg-accent hover:text-accent-foreground border h-10 px-4 py-2"
                        >
                            Login
                        </button>
                    </Link>
                    <button
                        type="button"
                        onClick={toggleTheme}
                        className="ring-offset-background focus-visible:ring-ring inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                    >
                        {theme === 'light' ? 'dark' : 'light'}
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;