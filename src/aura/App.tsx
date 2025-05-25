// src/aura/App.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
    Routes,
    Route,
    useLocation,
    Navigate
} from "react-router-dom";

import Header from "./components/Header";
import Hero from "./components/Hero";
import Footer from "./components/Footer";
import { ThemeProvider } from "./features/view/homePanels/ThemeContext";

import Artigo from "./pages/Artigo";
import Changelog from "./pages/Changelog";
import CRM from "./pages/CRM";
import Privacidade from "./pages/Privacidade";
import Prompts from "./pages/Prompts";
import Terms from "./pages/Terms";
import Login from "./pages/Login";
import Tecnologias from "./pages/Tecnologias";
import Orientadores from "./pages/Orientadores";
import Feedback from "./pages/Feedback";

import Home from "./features/view/Home";
import Contas from "./features/view/Contas";
import Chat from "./features/view/Chat";
import SettingsComponent from "./features/view/Settings";
import Teste from "./features/view/Teste";
import Conversations from "./features/view/Conversations";

interface AppContentProps {
    toggleTheme: () => void;
    theme: "light" | "dark";
}

const AppContent: React.FC<AppContentProps> = ({ toggleTheme, theme }) => {
    const location = useLocation();
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

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
    const paginasSemFooter = [...paginasSemHeader];
    const hideHeaderFooter = location.pathname.startsWith("/features/view");

    return (
        <div
            className={`bg-background min-h-screen scroll-smooth antialiased ${
                theme === "dark" ? "dark" : ""
            }`}
        >
            {!paginasSemHeader.includes(location.pathname) &&
                !hideHeaderFooter && (
                    <Header toggleTheme={toggleTheme} theme={theme} />
                )}

            <main className="mx-auto flex-1 overflow-auto">
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

                    <Route
                        path="/features/view/home"
                        element={
                            isLoggedIn ? <Home /> : <Navigate to="/login" />
                        }
                    />
                    <Route
                        path="/features/view/conta"
                        element={
                            isLoggedIn ? <Contas /> : <Navigate to="/login" />
                        }
                    />
                    <Route
                        path="/features/view/chat"
                        element={
                            isLoggedIn ? <Chat /> : <Navigate to="/login" />
                        }
                    />
                    <Route
                        path="/features/view/settings"
                        element={
                            isLoggedIn ? (
                                <SettingsComponent />
                            ) : (
                                <Navigate to="/login" />
                            )
                        }
                    />
                    <Route
                        path="/features/view/teste"
                        element={
                            isLoggedIn ? <Teste /> : <Navigate to="/login" />
                        }
                    />
                    <Route
                        path="/features/view/conversations"
                        element={
                            isLoggedIn ? (
                                <Conversations />
                            ) : (
                                <Navigate to="/login" />
                            )
                        }
                    />

                    <Route
                        path="*"
                        element={
                            isLoggedIn ? (
                                <Navigate
                                    to="/features/view/home"
                                    replace
                                />
                            ) : (
                                <Navigate to="/login" replace />
                            )
                        }
                    />
                </Routes>

                {!hideHeaderFooter && (
                    <section
                        style={{
                            backgroundColor: "#000",
                            height: "400px"
                        }}
                    />
                )}
            </main>

            {!paginasSemFooter.includes(location.pathname) &&
                !hideHeaderFooter && (
                    <Footer theme={theme} />
                )}
        </div>
    );
};

const App: React.FC = () => {
    const storedTheme = localStorage.getItem("theme");
    const initialTheme =
        storedTheme === "light" || storedTheme === "dark"
            ? storedTheme
            : "dark";

    const [theme, setTheme] = useState<"light" | "dark">(
        initialTheme
    );

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
    };

    useEffect(() => {
        if (theme === "dark") {
            document.documentElement.classList.add("dark");
            document.documentElement.style.colorScheme = "dark";
        } else {
            document.documentElement.classList.remove("dark");
            document.documentElement.style.colorScheme = "light";
        }
    }, [theme]);

    return (
        <ThemeProvider>
            <AppContent toggleTheme={toggleTheme} theme={theme} />
        </ThemeProvider>
    );
};

export default App;