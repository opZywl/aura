// index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';

// importa o “wrapper” que você vai criar em src/aura/main.tsx
import Main from './main';

// estilos globais (caso ainda não importe dentro do Main)
import './aura/styles/index.css';

ReactDOM
    .createRoot(document.getElementById('root') as HTMLElement)
    .render(
        <React.StrictMode>
            <Main />
        </React.StrictMode>
    );
