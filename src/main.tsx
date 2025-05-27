// src/main.tsx
import React from "react";
import { BrowserRouter } from "react-router-dom";
import App from "./aura/App";

// Importe o provider de contexto
import { SettingsProvider } from "./aura/features/view/lobby/settings-context";

export default function Main() {
    return (
        <BrowserRouter>
            <SettingsProvider>
                <App />
            </SettingsProvider>
        </BrowserRouter>
    );
}
