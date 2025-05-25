// src/main.tsx
import React from "react";
import { BrowserRouter } from "react-router-dom";
import App from "./aura/App";

export default function Main() {
    return (
        <BrowserRouter>
            <App />
        </BrowserRouter>
    );
}
