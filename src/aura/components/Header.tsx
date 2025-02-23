import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="animate-fade-in left-0 top-0 z-50 w-full -translate-y-4 border-b opacity-0 backdrop-blur-md [--animation-delay:600ms]">
            <div className="container flex h-14 items-center justify-between">
                <a className="flex items-center text-lg font-extrabold text-white" href="/">Aura</a>
                <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 rounded-full border p-1 md:flex">
                    <a className="mx-4 text-sm hover:opacity-50 text-white" href="#Artigo">Artigo</a>
                    <a className="mx-4 text-sm hover:opacity-50 text-white" href="#prompts">Prompts</a>
                    <a className="mx-4 text-sm hover:opacity-50 text-white" href="#changelog">Changelog</a>
                    <a className="mx-4 text-sm hover:opacity-50 text-white" href="#CRM">CRM</a>
                </nav>
                <div className="ml-auto flex h-full items-center gap-2 md:ml-0 md:gap-4">
                    <button className="ml-0 md:hidden">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-align-justify text-white">
                            <line x1="3" x2="21" y1="6" y2="6" />
                            <line x1="3" x2="21" y1="12" y2="12" />
                            <line x1="3" x2="21" y1="18" y2="18" />
                        </svg>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
