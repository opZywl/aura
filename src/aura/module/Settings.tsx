import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Cog, SunMoon, Shield, MessageSquare, ArrowLeft } from 'lucide-react'; // Importando ArrowLeft

interface SettingsProps {}

const Settings: React.FC<SettingsProps> = () => {
    const location = useLocation();
    const [theme] = React.useState(localStorage.getItem('theme') || 'light');
    const [activeSection, setActiveSection] = useState<string | null>(null);

    const menuItems = [
        { id: 'system', label: 'Sistema', icon: Cog },
        { id: 'themes', label: 'Temas', icon: SunMoon },
        { id: 'blockedWords', label: 'Palavras Bloqueadas', icon: Shield },
        { id: 'messages', label: 'Mensagens', icon: MessageSquare },
    ];

    const textColorClass = theme === 'light' ? 'text-gray-800' : 'text-gray-200';
    const bgColorClass = theme === 'light' ? 'bg-white' : 'bg-gray-800';
    const hoverBgColorClass = theme === 'light' ? 'hover:bg-gray-200' : 'hover:bg-gray-700';
    const shadowClass = theme === 'light' ? 'shadow-md' : 'shadow-none';
    const sidebarTextColorClass = theme === 'light' ? 'text-gray-600' : 'text-gray-400';

    const SidebarItem: React.FC<{ to: string; icon: React.ComponentType<any>; label: string }> = ({ to, icon: Icon, label }) => {
        const isActive = location.hash === to;
        const activeClass = isActive ? 'bg-blue-100 text-blue-800' : hoverBgColorClass;

        return (
            <li>
                <Link
                    to={`/module/settings${to}`}
                    className={`flex items-center p-2 rounded transition-colors duration-200 ${sidebarTextColorClass} ${activeClass}`}
                    onClick={() => setActiveSection(to.slice(1))}
                >
                    <Icon className="mr-2" /> {label}
                </Link>
            </li>
        );
    };

    const BackButton: React.FC = () => {
        return (
            <li>
                <Link
                    to="/module/home" // Defina a rota correta
                    className={`flex items-center p-2 rounded transition-colors duration-200 ${sidebarTextColorClass} ${hoverBgColorClass}`}
                >
                    <ArrowLeft className="mr-2" /> Voltar
                </Link>
            </li>
        );
    };

    const renderSection = (id: string, title: string, content: React.ReactNode) => {
        if (activeSection !== id) {
            return null;
        }

        return (
            <section id={id} className="mb-8">
                <h2 className={`text-xl font-semibold ${textColorClass}`}>{title}</h2>
                <div className="mt-2">{content}</div>
            </section>
        );
    };

    return (
        <div className={`flex h-screen ${theme === 'light' ? 'bg-gray-100' : 'bg-gray-900'}`}>
            <aside className={`w-64 ${bgColorClass} ${shadowClass}`}>
                <nav className="p-4 flex flex-col justify-center h-full">
                    <ul className="space-y-2">
                        <BackButton />
                        {menuItems.map((item) => (
                            <SidebarItem key={item.id} to={`#${item.id}`} icon={item.icon} label={item.label} />
                        ))}
                    </ul>
                </nav>
            </aside>

            <main className="flex-1 p-10 flex flex-col items-center justify-start">
                <h1 className={`text-2xl font-semibold ${textColorClass} mb-4`}>Configurações</h1>
                <p className={`${textColorClass}`}>Gerencie as configurações do sistema.</p>

                <div className="w-full max-w-2xl">
                    {renderSection(
                        'system',
                        'Sistema',
                        <>
                            <label htmlFor="systemMessage" className={`block text-sm font-bold mb-2 ${textColorClass}`}>
                                Mensagem da opção inválida:
                            </label>
                            <input
                                type="text"
                                id="systemMessage"
                                className={`shadow appearance-none border rounded w-full py-2 px-3 ${textColorClass} ${theme === 'light' ? 'bg-white' : 'bg-gray-700 dark:border-gray-600'} leading-tight focus:outline-none focus:shadow-outline`}
                                placeholder="Opção inválida! Escolha uma das opções do sistema."
                            />
                        </>
                    )}

                    {renderSection(
                        'themes',
                        'Temas',
                        <>
                            <p className={`${textColorClass}`}>Escolha o tema da aplicação:</p>
                            <div className="flex space-x-4 mt-2">
                                <button className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">Tema Amarelo</button>
                                <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Tema Vermelho</button>
                                <button className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">Tema Roxo</button>
                            </div>
                        </>
                    )}

                    {renderSection(
                        'blockedWords',
                        'Palavras Bloqueadas',
                        <>
                            <label htmlFor="blockedWordsMessage" className={`block text-sm font-bold mb-2 ${textColorClass}`}>
                                Lista de palavras bloqueadas:
                            </label>
                            <input
                                type="text"
                                id="blockedWordsMessage"
                                className={`shadow appearance-none border rounded w-full py-2 px-3 ${textColorClass} ${theme === 'light' ? 'bg-white' : 'bg-gray-700 dark:border-gray-600'} leading-tight focus:outline-none focus:shadow-outline`}
                                placeholder="Palavra 1, Palavra 2, Palavra 3..."
                            />
                        </>
                    )}

                    {renderSection(
                        'messages',
                        'Mensagens',
                        <>
                            <label htmlFor="welcomeMessage" className={`block text-sm font-bold mb-2 ${textColorClass}`}>
                                Mensagem de boas-vindas:
                            </label>
                            <input
                                type="text"
                                id="welcomeMessage"
                                className={`shadow appearance-none border rounded w-full py-2 px-3 ${textColorClass} ${theme === 'light' ? 'bg-white' : 'bg-gray-700 dark:border-gray-600'} leading-tight focus:outline-none focus:shadow-outline`}
                                placeholder="Bem-vindo ao sistema!"
                            />
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Settings;