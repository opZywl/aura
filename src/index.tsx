import React from 'react';
import ReactDOM from 'react-dom/client';
import './aura/index.css';
import App from './aura/App';
import reportWebVitals from './aura/reportWebVitals';

const rootElement = document.getElementById('root') as HTMLElement;
const root = ReactDOM.createRoot(rootElement);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

reportWebVitals();