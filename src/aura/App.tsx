// src/aura/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
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

import Tecnologias from './pages/Tecnologias';
import Orientadores from './pages/Orientadores';
import Feedback from './pages/Feedback';

const AppContent: React.FC = () => {
    const location = useLocation();

    const paginasSemHeader = [
        "/artigo",
        "/changelog",
        "/crm",
        "/github",
        "/privacidade",
        "/prompts",
        "/terms",
        "/tecnologias",
        "/orientadores",
        "/feedback"
    ];

    return (
        <div className="bg-background min-h-screen scroll-smooth antialiased dark">
            {/* Exibe o Header apenas se a página atual não estiver na lista */}
            {!paginasSemHeader.includes(location.pathname) && <Header />}

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
                </Routes>
                <section style={{ backgroundColor: "#000", height: "500px" }}></section>
            </main>

            <Footer />
        </div>
    );
};

const App: React.FC = () => {
    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    );
};

export default App;
