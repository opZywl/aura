// src/aura/App.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";

import { ThemeProvider as NextThemeProvider } from "next-themes";
import { SettingsProvider as LobbySettingsProvider } from "./features/view/lobby/settings-context";

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
import Tecnologias from "./pages/Tecnologias";
import Orientadores from "./pages/Orientadores";
import Feedback from "./pages/Feedback";
import Login from "./pages/Login";

// páginas internas
import Lobby from "./features/view/Lobby";
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

    if (location.pathname === "/lobby") {
        return (
            <NextThemeProvider
                attribute="class"
                defaultTheme="dark"
                enableSystem={false}
                disableTransitionOnChange={false}
            >
                <LobbySettingsProvider>
                    <Lobby />
                </LobbySettingsProvider>
            </NextThemeProvider>
        );
    }

    const paginasSemHeader = [
        "/artigo",
        "/changelog",
        "/crm",
        "/privacidade",
        "/prompts",
        "/terms",
        "/tecnologias",
        "/orientadores",
        "/feedback",
    ];
    const paginasSemFooter = [...paginasSemHeader];
    const hideHeaderFooter =
        location.pathname.startsWith("/features/view") ||
        false;

    return (
        <div
            className={`bg-background min-h-screen scroll-smooth antialiased ${
                theme === "dark" ? "dark" : ""
            }`}
        >
            {/* Header global */}
            {!paginasSemHeader.includes(location.pathname) && !hideHeaderFooter && (
                <Header toggleTheme={toggleTheme} theme={theme} />
            )}

            <main className="mx-auto flex-1 overflow-auto">
                <Routes>
                    <Route path="/" element={<Hero />} />

                    {/* Páginas públicas */}
                    <Route path="/artigo" element={<Artigo />} />
                    <Route path="/changelog" element={<Changelog />} />
                    <Route path="/crm" element={<CRM />} />
                    <Route path="/privacidade" element={<Privacidade />} />
                    <Route path="/prompts" element={<Prompts />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/tecnologias" element={<Tecnologias />} />
                    <Route path="/orientadores" element={<Orientadores />} />
                    <Route path="/feedback" element={<Feedback />} />

                    {/* Login */}
                    <Route path="/login" element={<Login theme={theme} />} />

                    {/* Rotas protegidas */}
                    <Route
                        path="/features/view/home"
                        element={isLoggedIn ? <Home /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/features/view/conta"
                        element={isLoggedIn ? <Contas /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/features/view/chat"
                        element={isLoggedIn ? <Chat /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/features/view/settings"
                        element={isLoggedIn ? <SettingsComponent /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/features/view/teste"
                        element={isLoggedIn ? <Teste /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/features/view/conversations"
                        element={
                            isLoggedIn ? <Conversations /> : <Navigate to="/login" />
                        }
                    />

                    {/* Catch-all */}
                    <Route
                        path="*"
                        element={
                            isLoggedIn ? (
                                <Navigate to="/features/view/home" replace />
                            ) : (
                                <Navigate to="/login" replace />
                            )
                        }
                    />
                </Routes>

                {/* spacer extra (não aparece em /features/view) */}
                {!hideHeaderFooter && (
                    <section style={{ backgroundColor: "#000", height: "400px" }} />
                )}
            </main>

            {/* Footer global */}
            {!paginasSemFooter.includes(location.pathname) && !hideHeaderFooter && (
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

    const [theme, setTheme] = useState<"light" | "dark">(initialTheme);

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
