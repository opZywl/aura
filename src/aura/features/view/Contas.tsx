import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import whatsappIcon  from '../../../resources/social/whatsapp.svg';
import telegramIcon  from '../../../resources/social/telegram.svg';
import messengerIcon from '../../../resources/social/messenger.svg';

type ServiceKey = 'telegram' | 'messenger' | 'whatsapp';

interface TelegramAccount {
    id: string;
    apiKey: string;
    botName: string;
}

const API_BASE = 'http://localhost:3001/api';

const services: Record<ServiceKey, { label: string; icon: string }> = {
    telegram:  { label: 'Telegram',  icon: telegramIcon  },
    messenger: { label: 'Messenger', icon: messengerIcon },
    whatsapp:  { label: 'WhatsApp',  icon: whatsappIcon  },
};

const Contas: React.FC = () => {
    const [active, setActive]             = useState<ServiceKey|null>(null);
    const [accounts, setAccounts]         = useState<TelegramAccount[]>([]);
    const [apiKey, setApiKey]             = useState('');
    const [botName, setBotName]           = useState('');
    const [deleteCandidate, setDeleteCandidate] = useState<string|null>(null);

    useEffect(() => {
        fetch(`${API_BASE}/accounts`)
            .then(res => res.json())
            .then(setAccounts)
            .catch(console.error);
    }, []);

    const toggleService = (key: ServiceKey) => {
        if (key !== 'telegram') {
            alert(`${services[key].label} ainda está em desenvolvimento.`);
            return;
        }
        setActive(active === key ? null : key);
        setApiKey('');
        setBotName('');
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!apiKey.trim() || !botName.trim()) return;
        if (accounts.length >= 3) {
            alert('Limite de 3 contas');
            return;
        }
        try {
            const res = await fetch(`${API_BASE}/accounts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apiKey: apiKey.trim(), botName: botName.trim() })
            });
            if (!res.ok) throw new Error('Erro ao conectar');
            const newAcc = await res.json();
            setAccounts(prev => [...prev, newAcc]);
            setActive(null);
            setApiKey('');
            setBotName('');
        } catch (err: any) {
            alert(err.message || 'Erro desconhecido');
        }
    };

    const askDelete = (id: string) => {
        setDeleteCandidate(id);
    };

    const confirmDelete = async () => {
        if (!deleteCandidate) return;
        const id = deleteCandidate;
        setDeleteCandidate(null);
        try {
            const res = await fetch(`${API_BASE}/accounts/${id}`, { method: 'DELETE' });
            if (res.status === 204) {
                setAccounts(prev => prev.filter(a => a.id !== id));
            } else {
                alert('Erro ao excluir');
            }
        } catch {
            alert('Erro ao excluir');
        }
    };

    return (
        <div className="contas-wrapper">
            <aside className="sidebar">
                <Link to="/features/view/home" className="back-btn">
                    Voltar
                </Link>
            </aside>

            <main className="main">
                <div className="hero">
                    <h1 className="hero-title">Conectar Novos Canais</h1>
                    <p className="hero-subtitle">Clique no ícone para configurar.</p>
                    <div className="social-icons">
                        {(Object.keys(services) as ServiceKey[]).map(key => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => toggleService(key)}
                                className={`icon-btn${active === key ? ' active' : ''}`}
                            >
                                <img
                                    src={services[key].icon}
                                    alt={services[key].label}
                                    className="icon-img"
                                />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="content">
                    {active === 'telegram' && (
                        <section className="form-container">
                            <form onSubmit={handleSave} className="form-flex">
                                <h2 className="form-title">
                                    <img src={telegramIcon} alt="Telegram" className="icon-6" />
                                    Integre-se com o Telegram
                                </h2>

                                <div className="field">
                                    <label htmlFor="apiKey">
                                        API Key <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="apiKey"
                                        type="text"
                                        placeholder="sua-api-key-aqui"
                                        value={apiKey}
                                        onChange={e => setApiKey(e.target.value)}
                                    />
                                </div>

                                <div className="field">
                                    <label htmlFor="botName">
                                        Bot Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="botName"
                                        type="text"
                                        placeholder="@seu_bot"
                                        value={botName}
                                        onChange={e => setBotName(e.target.value)}
                                    />
                                </div>

                                <div className="actions">
                                    <button
                                        type="button"
                                        onClick={() => toggleService('telegram')}
                                        className="btn-cancel"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!apiKey.trim() || !botName.trim()}
                                        className="btn-save"
                                    >
                                        Salvar Conta
                                    </button>
                                </div>
                            </form>
                        </section>
                    )}

                    <section className="space-y-6">
                        {accounts.map(acc => (
                            <div key={acc.id} className="account-item">
                                <div className="account-name">
                                    <img
                                        src={services.telegram.icon}
                                        alt="Telegram"
                                        className="icon-list"
                                    />
                                    <span>{acc.botName}</span>
                                </div>
                                <div className="account-actions">
                                    <span className="status-live">Live</span>
                                    <button
                                        type="button"
                                        onClick={() => askDelete(acc.id)}
                                        className="btn-delete"
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
                </div>
            </main>

            {deleteCandidate && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <p>Deseja mesmo excluir esta conta?</p>
                        <div className="modal-buttons">
                            <button
                                type="button"
                                onClick={() => setDeleteCandidate(null)}
                                className="btn-cancel"
                            >
                                Voltar
                            </button>
                            <button
                                type="button"
                                onClick={confirmDelete}
                                className="btn-delete"
                            >
                                Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Contas;