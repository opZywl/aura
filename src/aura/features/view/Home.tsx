import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Home as HomeIcon, MessageSquare, User, Settings, Zap, FileText } from 'lucide-react';

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
    const location = useLocation();
    const [theme, setTheme] = React.useState(localStorage.getItem('theme') || 'light');

    React.useEffect(() => {
        const handleStorageChange = () => {
            setTheme(localStorage.getItem('theme') || 'light');
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const textColorClass = theme === 'light' ? 'text-gray-800' : 'text-gray-200';
    const bgColorClass = theme === 'light' ? 'bg-white' : 'bg-gray-800';
    const hoverBgColorClass = theme === 'light' ? 'hover:bg-gray-200' : 'hover:bg-gray-700';
    const shadowClass = theme === 'light' ? 'shadow-md' : 'shadow-none';
    const sidebarTextColorClass = theme === 'light' ? 'text-gray-600' : 'text-gray-400';

    const SidebarItem: React.FC<{ to: string; icon: React.ComponentType<any>; label: string }> = ({ to, icon: Icon, label }) => {
        const isActive = location.pathname === to;
        const activeClass = isActive ? 'bg-blue-100 text-blue-800' : hoverBgColorClass;

        return (
            <li>
                <Link
                    to={to}
                    className={`flex items-center p-2 rounded transition-colors duration-200 ${sidebarTextColorClass} ${activeClass}`}
                >
                    <Icon className="mr-2" /> {label}
                </Link>
            </li>
        );
    };

    return (
        <div className={`flex h-screen ${theme === 'light' ? 'bg-gray-100' : 'bg-gray-900'}`}>
            <aside className={`w-64 ${bgColorClass} ${shadowClass}`}>
                <nav className="p-4 flex flex-col justify-center h-full">
                    <ul className="space-y-2">
                        <SidebarItem to="/" icon={HomeIcon} label="Lobby" />
                        <SidebarItem to="/features/view/conversations" icon={MessageSquare} label="Conversas" />
                        <SidebarItem to="/features/view/chat" icon={Zap} label="Chat" />
                        <SidebarItem to="/features/view/conta" icon={User} label="Conta" />
                        <SidebarItem to="/features/view/settings" icon={Settings} label="Configurações" />
                        <SidebarItem to="/features/view/teste" icon={FileText} label="Teste" />
                    </ul>
                </nav>
            </aside>

            <main className="flex-1 p-10 flex flex-col items-center justify-center">
                <h1 className={`text-3xl font-bold ${textColorClass} text-center animate-fade-in`}>Bem-vindo ao Aura</h1>
                <p className={`mt-4 ${textColorClass} text-center animate-fade-in`}>Selecione uma opção no menu lateral para começar.</p>

                <div className="mt-6 w-full max-w-md">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Home;