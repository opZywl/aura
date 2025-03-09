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

import Home from './module/Home';
import Conta from './module/Conta';
import Chat from './module/Chat';
import SettingsComponent from './module/Settings';
import Teste from './module/Teste';
import Conversations from './module/Conversations';

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

    const hideHeaderFooter = location.pathname.startsWith('/module');

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

                    <Route path="/login" element={<Login theme={theme} />} />


                    <Route path="/module/home" element={isLoggedIn ? <Home /> : <Navigate to="/login" />} />
                    <Route path="/module/conta" element={isLoggedIn ? <Conta /> : <Navigate to="/login" />} />
                    <Route path="/module/chat" element={isLoggedIn ? <Chat /> : <Navigate to="/login" />} />
                    <Route path="/module/settings" element={isLoggedIn ? <SettingsComponent /> : <Navigate to="/login" />} />
                    <Route path="/module/teste" element={isLoggedIn ? <Teste /> : <Navigate to="/login" />} />
                    <Route path="/module/conversations" element={isLoggedIn ? <Conversations /> : <Navigate to="/login" />} />
                    <Route path="/" element={isLoggedIn ? <Navigate to="/module/home" /> : <Navigate to="/login" />} />
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
    const storedTheme = localStorage.getItem('theme');
    // Default to 'dark' if localStorage is empty or has an invalid value
    const initialTheme = (storedTheme === 'light') ? 'light' : 'dark';

    const [theme, setTheme] = useState<'light' | 'dark'>(initialTheme);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            document.documentElement.style.colorScheme = 'dark';
        } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.style.colorScheme = 'light';
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    return (
        <BrowserRouter>
            <AppContent toggleTheme={toggleTheme} theme={theme} />
        </BrowserRouter>
    );
};

export default App;