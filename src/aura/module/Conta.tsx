import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import telegramIcon  from '../../resources/social/telegram.svg';
import messengerIcon from '../../resources/social/telegram.svg';
import whatsappIcon  from '../../resources/social/telegram.svg';

type ServiceKey = 'telegram' | 'messenger' | 'whatsapp';

interface Account {
    id: string;
    apiKey: string;
    botName: string;
}

const ConnectChannels: React.FC = () => {
    const [active, setActive] = useState<ServiceKey | null>(null);
    const [telegramAccounts, setTelegramAccounts] = useState<Account[]>([]);
    const [formApiKey, setFormApiKey]   = useState('');
    const [formBotName, setFormBotName] = useState('');

    const services: Record<ServiceKey, { label: string; icon: string }> = {
        telegram:  { label: 'Telegram',  icon: telegramIcon  },
        messenger: { label: 'Messenger', icon: messengerIcon },
        whatsapp:  { label: 'WhatsApp',  icon: whatsappIcon  },
    };

    const toggleService = (key: ServiceKey) => {
        setActive(active === key ? null : key);
        setFormApiKey('');
        setFormBotName('');
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formApiKey.trim() || !formBotName.trim()) return;
        if (telegramAccounts.length >= 3) {
            alert('Limite de 3 contas do Telegram atingido');
            return;
        }
        setTelegramAccounts(prev => [
            ...prev,
            { id: Date.now().toString(), apiKey: formApiKey.trim(), botName: formBotName.trim() }
        ]);
        setFormApiKey('');
        setFormBotName('');
        setActive(null);
    };

    const handleDelete = (id: string) => {
        setTelegramAccounts(prev => prev.filter(acc => acc.id !== id));
    };

    return (
        <div className="flex h-screen">
            <aside className="w-64 bg-black">
                <nav className="flex flex-col justify-center items-center h-full">
                    <Link to="/module/home" className="text-gray-200 hover:text-white">
                        Sair
                    </Link>
                </nav>
            </aside>

            <main className="flex-1 bg-gray-900 p-8">
                <header className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-white">
                        Conectar Novos Canais
                    </h1>
                    <p className="mt-2 text-sm text-gray-400">
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
                                : 'hover:bg-gray-800'}
              `}
                            disabled={telegramAccounts.length >= 3 && key === 'telegram'}
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
                    <section className="mb-12 rounded-lg border border-gray-700 p-6">
                        <form onSubmit={handleSave} className="space-y-6">
                            <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
                                <img src={telegramIcon} alt="Telegram" className="h-6 w-6" />
                                Integre-se com o Telegram
                            </h2>

                            <div>
                                <label
                                    htmlFor="apiKey"
                                    className="block text-sm font-medium text-gray-300"
                                >
                                    API Key <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="apiKey"
                                    type="text"
                                    value={formApiKey}
                                    onChange={e => setFormApiKey(e.target.value)}
                                    placeholder="sua-api-key-aqui"
                                    className="
                    mt-1 w-full rounded-md border border-gray-600
                    bg-gray-800 px-3 py-2 text-white
                    focus:border-blue-600 focus:ring-blue-600
                  "
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="botName"
                                    className="block text-sm font-medium text-gray-300"
                                >
                                    Bot Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="botName"
                                    type="text"
                                    value={formBotName}
                                    onChange={e => setFormBotName(e.target.value)}
                                    placeholder="@seu_bot"
                                    className="
                    mt-1 w-full rounded-md border border-gray-600
                    bg-gray-800 px-3 py-2 text-white
                    focus:border-blue-600 focus:ring-blue-600
                  "
                                />
                            </div>

                            <div className="flex justify-end gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => toggleService('telegram')}
                                    className="rounded-md border border-gray-600 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={!formApiKey.trim() || !formBotName.trim()}
                                    className={`
                    rounded-md px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600
                    ${formApiKey.trim() && formBotName.trim()
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'}
                  `}
                                >
                                    Salvar Conta
                                </button>
                            </div>
                        </form>
                    </section>
                )}

                <section className="space-y-4">
                    {telegramAccounts.map(acc => (
                        <div
                            key={acc.id}
                            className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-lg border border-gray-700 p-4"
                        >
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-300">
                                    Bot Name
                                </label>
                                <input
                                    type="text"
                                    readOnly
                                    value={acc.botName}
                                    className="mt-1 w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-white"
                                />
                            </div>
                            <div className="flex flex-col items-center gap-2 md:w-40">
                <span className="inline-block rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-400">
                  Live
                </span>
                                <button
                                    onClick={() => handleDelete(acc.id)}
                                    className="w-full rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition"
                                >
                                    Excluir Conta
                                </button>
                            </div>
                        </div>
                    ))}

                    {telegramAccounts.length >= 3 && (
                        <p className="text-center text-sm text-red-500 mt-2">
                            Você atingiu o limite de 3 contas do Telegram.
                        </p>
                    )}
                </section>
            </main>
        </div>
    );
};

export default ConnectChannels;