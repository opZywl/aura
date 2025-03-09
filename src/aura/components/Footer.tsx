import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../resources/seta.png';
import xLogo from '../../resources/x_logo.jpg';
import linkedinLogo from '../../resources/linkedin.png';
import githubLogo from '../../resources/github.png';

interface FooterProps {
    theme: 'light' | 'dark';
}

const productLinks = [
    { name: 'Artigo', to: '/artigo' },
    { name: 'Tecnologia', to: '/tecnologias' },
    { name: 'Orientadores', to: '/orientadores' },
    { name: 'CRM', to: '/crm' },
    { name: 'Home', to: '/' },
];

const contributorLinks = [
    { name: 'Lucas Lima', href: 'https://lucas-lima.vercel.app/' },
    { name: 'Caio Gabriel', href: 'https://caio-gabriel.vercel.app/' },
    { name: 'Matheus Theobald', href: 'https://mateustheobald.github.io/' },
    { name: 'Rhyan Yassin', href: 'https://rhyan019.github.io/' },
];

const legalLinks = [
    { name: 'Código Fonte', href: 'https://github.com/unaspht/aura', external: true },
    { name: 'Terms', to: '/terms' },
    { name: 'Privacy', to: '/privacidade' },
    { name: 'Feedback', to: '/feedback' },
];

const Footer: React.FC<FooterProps> = ({ theme }) => {
    const bgClass = theme === 'light' ? 'bg-white' : 'bg-gray-900';
    const textClass = theme === 'light' ? 'text-black' : 'text-white';
    const linkClass =
        theme === 'light'
            ? 'cursor-pointer text-sm font-medium text-gray-600 duration-200 hover:text-gray-800'
            : 'cursor-pointer text-sm font-medium text-gray-400 duration-200 hover:text-gray-200';
    const headingClass = 'mb-6 text-sm font-medium uppercase tracking-tighter';

    const iconClass =
        theme === 'light'
            ? 'fill-gray-500 text-gray-500 hover:fill-gray-300 hover:text-gray-300'
            : 'fill-gray-500 text-gray-500 hover:fill-gray-300 hover:text-gray-300';

    return (
        <footer className={`${bgClass} ${textClass}`}>
            <div className="mx-auto w-full max-w-screen-xl xl:pb-2">
                <div className="gap-4 p-4 px-8 py-16 sm:pb-16 md:flex md:justify-between">
                    {/* Branding */}
                    <div className="mb-12 flex flex-col gap-4">
                        <Link className="flex items-center gap-2" to="/">
                            <img src={logo} alt="Aura AI Logo" className="h-8 w-8" />
                            <span className="self-center whitespace-nowrap text-2xl font-semibold">
                Aura
              </span>
                        </Link>
                        <p className="max-w-xs">Produzido por estudantes.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-10">
                        <div>
                            <h2 className={headingClass}>Produto</h2>
                            <ul className="grid gap-2">
                                {productLinks.map((link) => (
                                    <li key={link.name}>
                                        <Link className={linkClass} to={link.to}>
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h2 className={headingClass}>Contribuidores</h2>
                            <ul className="grid gap-2">
                                {contributorLinks.map((contributor) => (
                                    <li key={contributor.name}>
                                        <a
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={linkClass}
                                            href={contributor.href}
                                        >
                                            {contributor.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h2 className={headingClass}>Legal</h2>
                            <ul className="grid gap-2">
                                {legalLinks.map((link) => (
                                    <li key={link.name}>
                                        {link.external ? (
                                            <a
                                                className={linkClass}
                                                href={link.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {link.name}
                                            </a>
                                        ) : (
                                            <Link className={linkClass} to={link.to!}>
                                                {link.name}
                                            </Link>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-2 rounded-md border border-gray-700 px-8 py-4 sm:flex sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex space-x-5 sm:justify-center">
                        <a
                            target="_blank"
                            rel="noopener noreferrer"
                            className={iconClass}
                            href="https://twitter.com/"
                        >
                            <img src={xLogo} alt="X logo" className="h-8 w-8" />
                            <span className="sr-only">X</span>
                        </a>
                        <a
                            target="_blank"
                            rel="noopener noreferrer"
                            className={iconClass}
                            href="https://www.linkedin.com/"
                        >
                            <img src={linkedinLogo} alt="LinkedIn logo" className="h-8 w-8" />
                            <span className="sr-only">LinkedIn</span>
                        </a>
                        <a
                            target="_blank"
                            rel="noopener noreferrer"
                            className={iconClass}
                            href="https://github.com/"
                        >
                            <img src={githubLogo} alt="GitHub logo" className="h-8 w-8" />
                            <span className="sr-only">GitHub</span>
                        </a>
                    </div>
                    <span className="text-sm sm:text-center">
            Copyright © 2025{' '}
                        <Link className="cursor-pointer" to="/">
              Aura, Inc
            </Link>
            . All Rights Reserved.
          </span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
