import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import telegramIcon  from '../../resources/social/telegram.svg';
import messengerIcon from '../../resources/social/telegram.svg';
import whatsappIcon  from '../../resources/social/telegram.svg';

type ServiceKey = 'telegram' | 'messenger' | 'whatsapp';
interface Account { id: string; apiKey: string; botName: string; }

const ConnectChannels: React.FC = () => {
    const [theme, setTheme] = useState<'light'|'dark'>(
        (localStorage.getItem('theme') as 'light'|'dark') || 'light'
    );
    useEffect(() => {
        const onStorage = () =>
            setTheme((localStorage.getItem('theme') as 'light'|'dark') || 'light');
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);
    const pageBg       = theme === 'light' ? 'bg-gray-100'     : 'bg-gray-900';
    const sidebarBg    = theme === 'light' ? 'bg-white'        : 'bg-black';
    const sidebarText  = theme === 'light' ? 'text-gray-600'   : 'text-gray-400';
    const sidebarHover = theme === 'light' ? 'hover:bg-gray-200' : 'hover:bg-gray-700';
    const shadowSide   = theme === 'light' ? 'shadow-md'       : 'shadow-none';

    const textPrimary   = theme === 'light' ? 'text-gray-900'   : 'text-gray-100';
    const textSecondary = theme === 'light' ? 'text-gray-600'   : 'text-gray-300';

    const containerBg   = theme === 'light' ? 'bg-white'        : 'bg-gray-900';
    const borderColor   = theme === 'light' ? 'border-gray-200' : 'border-gray-700';
    const inputBg       = theme === 'light' ? 'bg-white'        : 'bg-gray-700';
    const inputBorder   = theme === 'light' ? 'border-gray-300' : 'border-gray-600';
    const buttonHover   = sidebarHover;

    const [active, setActive] = useState<ServiceKey | null>(null);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [apiKey, setApiKey]     = useState('');
    const [botName, setBotName]   = useState('');

    const services: Record<ServiceKey,{label:string;icon:string}> = {
        telegram:  { label: 'Telegram',  icon: telegramIcon  },
        messenger: { label: 'Messenger', icon: messengerIcon },
        whatsapp:  { label: 'WhatsApp',  icon: whatsappIcon  },
    };

    const toggleService = (key: ServiceKey) => {
        setActive(active === key ? null : key);
        setApiKey(''); setBotName('');
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!apiKey.trim() || !botName.trim()) return;
        if (accounts.length >= 3) {
            alert('Limite de 3 contas');
            return;
        }
        setAccounts(prev => [
            ...prev,
            { id: Date.now().toString(), apiKey: apiKey.trim(), botName: botName.trim() }
        ]);
        setActive(null); setApiKey(''); setBotName('');
    };

    const handleDelete = (id: string) => {
        setAccounts(prev => prev.filter(a => a.id !== id));
    };

    return (
        <div className={`flex h-screen ${pageBg}`}>
            <aside className={`w-64 ${sidebarBg} ${shadowSide}`}>
                <nav className="flex justify-center items-center h-full">
                    <Link
                        to="/features/view/home"
                        className={`ml-10 px-4 py-2 rounded transition-colors ${sidebarText} ${sidebarHover}`}
                    >
                        Voltar
                    </Link>
                </nav>
            </aside>

            <main className="flex-1 p-8 overflow-auto">
                <header className="text-center mb-8">
                    <h1 className={`text-3xl font-bold ${textPrimary}`}>
                        Conectar Novos Canais
                    </h1>
                    <p className={`text-sm ${textSecondary} mt-2`}>
                        Clique no ícone para configurar.
                    </p>
                </header>

                <div className="flex justify-center space-x-8 mb-8">
                    {(Object.keys(services) as ServiceKey[]).map(key => (
                        <button
                            key={key}
                            onClick={() => toggleService(key)}
                            className={`
                p-2 rounded-lg transition 
                ${active === key
                                ? 'border-2 border-blue-600 bg-blue-50'
                                : buttonHover}
              `}
                        >
                            <img
                                src={services[key].icon}
                                alt={services[key].label}
                                className="h-10 w-10"
                            />
                        </button>
                    ))}
                </div>

                {active === 'telegram' && (
                    <section className={`mb-12 rounded-lg border ${borderColor} p-6 ${containerBg}`}>
                        <form onSubmit={handleSave} className="space-y-6">
                            <h2 className={`flex items-center gap-2 text-xl font-semibold ${textPrimary}`}>
                                <img src={telegramIcon} alt="Telegram" className="h-6 w-6" />
                                Integre-se com o Telegram
                            </h2>

                            <div>
                                <label htmlFor="apiKey" className={`block text-sm font-medium ${textSecondary}`}>
                                    API Key <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="apiKey"
                                    type="text"
                                    value={apiKey}
                                    onChange={e => setApiKey(e.target.value)}
                                    placeholder="sua-api-key-aqui"
                                    className={`
                    mt-1 w-full rounded-md border ${inputBorder}
                    ${inputBg} px-3 py-2 ${textPrimary}
                    focus:border-blue-600 focus:ring-blue-600
                  `}
                                />
                            </div>

                            <div>
                                <label htmlFor="botName" className={`block text-sm font-medium ${textSecondary}`}>
                                    Bot Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="botName"
                                    type="text"
                                    value={botName}
                                    onChange={e => setBotName(e.target.value)}
                                    placeholder="@seu_bot"
                                    className={`
                    mt-1 w-full rounded-md border ${inputBorder}
                    ${inputBg} px-3 py-2 ${textPrimary}
                    focus:border-blue-600 focus:ring-blue-600
                  `}
                                />
                            </div>

                            <div className="flex justify-end gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => toggleService('telegram')}
                                    className={`
                    rounded-md border ${inputBorder} px-4 py-2 text-sm
                    ${textSecondary} ${buttonHover}
                  `}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={!apiKey.trim() || !botName.trim()}
                                    className={`
                    rounded-md px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600
                    ${apiKey.trim() && botName.trim()
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'bg-gray-400 text-gray-600 cursor-not-allowed'}
                  `}
                                >
                                    Salvar Conta
                                </button>
                            </div>
                        </form>
                    </section>
                )}

                <section className="space-y-6">
                    {accounts.map(acc => (
                        <div
                            key={acc.id}
                            className={`flex flex-col md:flex-row items-center justify-between gap-4 rounded-lg border ${borderColor} p-4 ${containerBg}`}
                        >
                            <div className="flex-1">
                                <label className={`block text-sm font-medium ${textSecondary}`}>
                                    Bot Name
                                </label>
                                <input
                                    readOnly
                                    value={acc.botName}
                                    className={`
                    mt-1 w-full rounded-md border ${inputBorder}
                    ${containerBg} px-3 py-2 ${textPrimary}
                  `}
                                />
                            </div>

                            <div className="flex flex-col items-center gap-2">
                <span className="bg-green-500 text-white px-3 py-1 text-xs font-semibold rounded-full">
                  Live
                </span>
                                <button
                                    onClick={() => handleDelete(acc.id)}
                                    className={`px-4 py-2 rounded transition-colors ${sidebarText} ${sidebarHover} text-sm font-medium`}
                                >
                                    Excluir
                                </button>
                            </div>
                        </div>
                    ))}

                    {accounts.length >= 3 && (
                        <p className="text-center text-sm text-red-600">
                            Você atingiu o limite de 3 contas do Telegram.
                        </p>
                    )}
                </section>
            </main>
        </div>
    );
};

export default ConnectChannels;