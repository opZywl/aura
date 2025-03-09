// Login.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface LoginProps {
    theme: 'light' | 'dark';
}

const Login: React.FC<LoginProps> = ({ theme }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showResetPopup, setShowResetPopup] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem('isLoggedIn') === 'true') {
            navigate('/module/home');
        }
    }, [navigate]);

    const handleResetPassword = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        setShowResetPopup(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (email === 'Dev@123' && password === '1234') {
            localStorage.setItem('isLoggedIn', 'true');
            navigate('/module/home');
        } else {
            alert('Credenciais inválidas. Por favor, tente novamente.');
        }
    };

    const outerBg = theme === 'light' ? 'bg-gray-100' : 'bg-black';
    const cardBg = theme === 'light' ? 'bg-white' : 'bg-gray-800';
    const cardText = theme === 'light' ? 'text-black' : 'text-white';

    const inputBase =
        theme === 'light'
            ? 'appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-black focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50'
            : 'appearance-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-700';

    const checkboxClass =
        theme === 'light'
            ? 'h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded'
            : 'h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-600 rounded';

    const overlayClass = theme === 'light' ? 'bg-gray-300 bg-opacity-50' : 'bg-black bg-opacity-50';
    const popupBg = theme === 'light' ? 'bg-white' : 'bg-gray-900';
    const popupText = theme === 'light' ? 'text-black' : 'text-white';

    return (
        <div className={`min-h-screen flex items-center justify-center ${outerBg}`}>
            <div className={`max-w-md w-full space-y-8 p-8 ${cardBg} rounded shadow`}>
                <div>
                    <h2 className={`mt-6 text-center text-3xl font-extrabold ${cardText}`}>
                        Realizar Login
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email-address" className="sr-only">
                                Endereço de Email
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className={`${inputBase} rounded-t-md`}
                                placeholder="Endereço de email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                Senha
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className={`${inputBase} rounded-b-md`}
                                placeholder="Senha"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className={checkboxClass}
                            />
                            <label htmlFor="remember-me" className={`ml-2 block text-sm ${cardText}`}>
                                Lembrar de mim
                            </label>
                        </div>
                        <div className="text-sm">
                            <a
                                href="#"
                                onClick={handleResetPassword}
                                className="font-medium text-indigo-400 hover:text-indigo-300"
                            >
                                Redefinir senha
                            </a>
                        </div>
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            Entrar
                        </button>
                    </div>
                </form>
            </div>

            {showResetPopup && (
                <div className={`fixed inset-0 flex items-center justify-center ${overlayClass}`}>
                    <div className={`p-6 rounded shadow-lg ${popupBg}`}>
                        <p className={`mb-4 ${popupText}`}>
                            Por gentileza, entre em contato com os administradores.
                        </p>
                        <button
                            onClick={() => setShowResetPopup(false)}
                            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;