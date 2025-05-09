import React from 'react';
import { Link } from 'react-router-dom';

interface HeaderProps {
    toggleTheme: () => void;
    theme: 'light' | 'dark';
}

const navLinks = [
    { name: 'Artigo',    href: '#Artigo'    },
    { name: 'Prompts',   href: '#prompts'   },
    { name: 'Changelog', href: '#changelog' },
    { name: 'CRM',       href: '#CRM'       },
];

const Header: React.FC<HeaderProps> = ({ toggleTheme, theme }) => {
    const txt = theme === 'light' ? 'text-black' : 'text-white';

    return (
        <header className="header header--editable fixed top-0 left-0 z-50 w-full border-b backdrop-blur-md">
            <div className="header__inner">
                <a href="/" className={`text-lg font-extrabold ${txt}`}>Aura</a>

                <nav className="header__nav rounded-full border p-1">
                    {navLinks.map(l => (
                        <a
                            key={l.name}
                            href={l.href}
                            className={`mx-4 text-sm hover:opacity-50 ${txt}`}
                        >
                            {l.name}
                        </a>
                    ))}
                </nav>

                <div className="flex items-center gap-2">
                    <button className="md:hidden" aria-label="Abrir menu">
                        <svg width="24" height="24" stroke="currentColor" strokeWidth="2"
                             strokeLinecap="round" strokeLinejoin="round" className={txt}>
                            <line x1="3"  y1="6"  x2="21" y2="6"/>
                            <line x1="3"  y1="12" x2="21" y2="12"/>
                            <line x1="3"  y1="18" x2="21" y2="18"/>
                        </svg>
                    </button>

                    <Link to="/login">
                        <button className="btn hover:bg-accent hover:text-accent-foreground">
                            Login
                        </button>
                    </Link>

                    <button onClick={toggleTheme} className="btn btn-primary hover:bg-primary/90">
                        {theme === 'light' ? 'dark' : 'light'}
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;