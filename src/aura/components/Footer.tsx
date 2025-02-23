import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../resources/seta.png';
import xLogo from '../../resources/x_logo.jpg';
import linkedinLogo from '../../resources/linkedin.png';
import githubLogo from '../../resources/github.png';

const Footer: React.FC = () => {
    return (
        <footer className="bg-gray-900 text-white">
            <div className="mx-auto w-full max-w-screen-xl xl:pb-2">
                <div className="gap-4 p-4 px-8 py-16 sm:pb-16 md:flex md:justify-between">
                    <div className="mb-12 flex flex-col gap-4">
                        <Link className="flex items-center gap-2" to="/">
                            <img src={logo} alt="Aura AI Logo" className="h-8 w-8" />
                            <span className="self-center whitespace-nowrap text-2xl font-semibold dark:text-white">
                                Aura
                            </span>
                        </Link>
                        <p className="max-w-xs">Produzido por estudantes.</p>
                    </div>
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-10">
                        {/* Produto */}
                        <div>
                            <h2 className="mb-6 text-sm font-medium uppercase tracking-tighter dark:text-white">
                                Produto
                            </h2>
                            <ul className="grid gap-2">
                                <li>
                                    <Link
                                        className="cursor-pointer text-sm font-medium text-gray-400 duration-200 hover:text-gray-200"
                                        to="/artigo"
                                    >
                                        Artigo
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        className="cursor-pointer text-sm font-medium text-gray-400 duration-200 hover:text-gray-200"
                                        to="/tecnologias"
                                    >
                                        Tecnologia
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        className="cursor-pointer text-sm font-medium text-gray-400 duration-200 hover:text-gray-200"
                                        to="/orientadores"
                                    >
                                        Orientadores
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        className="cursor-pointer text-sm font-medium text-gray-400 duration-200 hover:text-gray-200"
                                        to="/crm"
                                    >
                                        CRM
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        className="cursor-pointer text-sm font-medium text-gray-400 duration-200 hover:text-gray-200"
                                        to="/"
                                    >
                                        Home
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Seção Contribuidores */}
                        <div>
                            <h2 className="mb-6 text-sm font-medium uppercase tracking-tighter dark:text-white">
                                Contribuidores
                            </h2>
                            <ul className="grid gap-2">
                                <li>
                                    <a
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="cursor-pointer text-sm font-medium text-gray-400 duration-200 hover:text-gray-200"
                                        href="https://lucas-lima.vercel.app/"
                                    >
                                        Lucas Lima
                                    </a>
                                </li>
                                <li>
                                    <a
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="cursor-pointer text-sm font-medium text-gray-400 duration-200 hover:text-gray-200"
                                        href="https://caio-gabriel.vercel.app/"
                                    >
                                        Caio Gabriel
                                    </a>
                                </li>
                                <li>
                                    <a
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="cursor-pointer text-sm font-medium text-gray-400 duration-200 hover:text-gray-200"
                                        href="https://mateustheobald.github.io/"
                                    >
                                        Matheus Theobald
                                    </a>
                                </li>
                                <li>
                                    <a
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="cursor-pointer text-sm font-medium text-gray-400 duration-200 hover:text-gray-200"
                                        href="https://rhyan019.github.io/"
                                    >
                                        Rhyan Yassin
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Seção Legal */}
                        <div>
                            <h2 className="mb-6 text-sm font-medium uppercase tracking-tighter dark:text-white">
                                Legal
                            </h2>
                            <ul className="grid gap-2">
                                <li>
                                    <a
                                        className="cursor-pointer text-sm font-medium text-gray-400 duration-200 hover:text-gray-200"
                                        href="https://github.com/unaspht/aura"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Codigo Fonte
                                    </a>
                                </li>
                                <li>
                                    <Link
                                        className="cursor-pointer text-sm font-medium text-gray-400 duration-200 hover:text-gray-200"
                                        to="/terms"
                                    >
                                        Terms
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        className="cursor-pointer text-sm font-medium text-gray-400 duration-200 hover:text-gray-200"
                                        to="/privacidade"
                                    >
                                        Privacy
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        className="cursor-pointer text-sm font-medium text-gray-400 duration-200 hover:text-gray-200"
                                        to="/feedback"
                                    >
                                        Feedback
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-2 rounded-md border border-gray-700 px-8 py-4 sm:flex sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex space-x-5 sm:justify-center">
                        {/* X */}
                        <a
                            target="_blank"
                            rel="noopener noreferrer"
                            className="fill-gray-500 text-gray-500 hover:fill-gray-300 hover:text-gray-300"
                            href="https://twitter.com/"
                        >
                            <img src={xLogo} alt="X logo" className="h-8 w-8" />
                            <span className="sr-only">X</span>
                        </a>
                        {/* LinkedIn */}
                        <a
                            target="_blank"
                            rel="noopener noreferrer"
                            className="fill-gray-500 text-gray-500 hover:fill-gray-300 hover:text-gray-300"
                            href="https://www.linkedin.com/"
                        >
                            <img src={linkedinLogo} alt="LinkedIn logo" className="h-8 w-8" />
                            <span className="sr-only">LinkedIn</span>
                        </a>
                        {/* GitHub */}
                        <a
                            target="_blank"
                            rel="noopener noreferrer"
                            className="fill-gray-500 text-gray-500 hover:fill-gray-300 hover:text-gray-300"
                            href="https://github.com/"
                        >
                            <img src={githubLogo} alt="GitHub logo" className="h-8 w-8" />
                            <span className="sr-only">GitHub</span>
                        </a>
                    </div>
                    <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">
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
