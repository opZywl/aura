// src/aura/App.tsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import Footer from './components/Footer';
import './App.css';

import Artigo from './pages/Artigo';
import Changelog from './pages/Changelog';
import CRM from './pages/CRM';
import Privacidade from './pages/Privacidade';
import Prompts from './pages/Prompts';
import Terms from './pages/Terms';
import Login from './pages/Login';
import Tecnologias from './pages/Tecnologias';
import Orientadores from './pages/Orientadores';
import Feedback from './pages/Feedback';

import Home from './settings/Home';
import Conta from './settings/Conta';
import Chat from './settings/Chat';
import SettingsComponent from './settings/Settings';
import Teste from './settings/Teste';
import Conversations from './settings/Conversations';

interface AppContentProps {
    toggleTheme: () => void;
    theme: 'light' | 'dark';
}

const AppContent: React.FC<AppContentProps> = ({ toggleTheme, theme }) => {
    const location = useLocation();
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    const paginasSemHeader = [
        '/artigo',
        '/changelog',
        '/crm',
        '/github',
        '/privacidade',
        '/prompts',
        '/terms',
        '/tecnologias',
        '/orientadores',
        '/feedback',
    ];

    const paginasSemFooter = [
        '/artigo',
        '/changelog',
        '/crm',
        '/github',
        '/privacidade',
        '/prompts',
        '/terms',
        '/tecnologias',
        '/orientadores',
        '/feedback',
    ];

    const hideHeaderFooter = location.pathname.startsWith('/settings');

    return (
        <div className={`bg-background min-h-screen scroll-smooth antialiased ${theme === 'dark' ? 'dark' : ''}`}>
            {!paginasSemHeader.includes(location.pathname) && !hideHeaderFooter && <Header toggleTheme={toggleTheme} theme={theme} />}

            <main className="mx-auto flex-1 overflow-hidden">
                <Routes>
                    <Route path="/" element={<Hero />} />
                    <Route path="/artigo" element={<Artigo />} />
                    <Route path="/changelog" element={<Changelog />} />
                    <Route path="/crm" element={<CRM />} />
                    <Route path="/privacidade" element={<Privacidade />} />
                    <Route path="/prompts" element={<Prompts />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/tecnologias" element={<Tecnologias />} />
                    <Route path="/orientadores" element={<Orientadores />} />
                    <Route path="/feedback" element={<Feedback />} />
                    {/* Passa a prop theme para o Login */}
                    <Route path="/login" element={<Login theme={theme} />} />
                    <Route path="/" element={isLoggedIn ? <Navigate to="/settings/home" /> : <Navigate to="/login" />} />

                    {/* Rota principal para settings */}
                    <Route path="/settings/home" element={isLoggedIn ? <Home /> : <Navigate to="/login" />} />
                    <Route path="/settings/conta" element={isLoggedIn ? <Conta /> : <Navigate to="/login" />} />
                    <Route path="/settings/chat" element={isLoggedIn ? <Chat /> : <Navigate to="/login" />} />
                    <Route path="/settings/settings" element={isLoggedIn ? <SettingsComponent /> : <Navigate to="/login" />} />
                    <Route path="/settings/teste" element={isLoggedIn ? <Teste /> : <Navigate to="/login" />} />
                    <Route path="/settings/conversations" element={isLoggedIn ? <Conversations /> : <Navigate to="/login" />} />
                </Routes>
                {!hideHeaderFooter && (
                    <section style={{ backgroundColor: "#000", height: "400px" }}></section>
                )}
            </main>

            {!paginasSemFooter.includes(location.pathname) && !hideHeaderFooter && <Footer theme={theme} />}
        </div>
    );
};

const App: React.FC = () => {
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');

    const toggleTheme = () => {
        setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    };

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            document.documentElement.style.colorScheme = 'dark';
        } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.style.colorScheme = 'light';
        }
    }, [theme]);

    return (
        <BrowserRouter>
            <AppContent toggleTheme={toggleTheme} theme={theme} />
        </BrowserRouter>
    );
};

export default App;