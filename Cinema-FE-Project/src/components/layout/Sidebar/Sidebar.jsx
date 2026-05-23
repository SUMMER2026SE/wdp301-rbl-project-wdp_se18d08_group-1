import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Clapperboard,
    Calendar,
    Armchair,
    Popcorn,
    Ticket,
    Newspaper,
    Image as ImageIcon,
    MessageSquare,
    Hash,
    LogOut,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const SidebarItem = ({ to, icon: Icon, label }) => (
    <NavLink
        to={to}
        className={({ isActive }) => `
      flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-500 group relative overflow-hidden
      ${isActive
                ? "bg-gradient-to-r from-red-600/20 to-transparent text-white border-l-4 border-red-600 shadow-[20px_0_40px_-20px_rgba(220,38,38,0.3)]"
                : "text-gray-500 hover:bg-white/5 hover:text-gray-200"
            }
    `}
    >
        <div className="flex items-center gap-4 relative z-10">
            <div
                className={`p-2 rounded-xl transition-colors duration-500 ${window.location.pathname === to ? "bg-red-600 text-white shadow-lg" : "group-hover:bg-white/10"
                    }`}
            >
                <Icon size={18} className="group-hover:scale-110 transition-transform duration-300" />
            </div>
            <span className="font-bold text-sm tracking-wide">{label}</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </NavLink>
);

export default function Sidebar() {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const menuItems = [
        { to: "/manager/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { to: "/manager/movies", icon: Clapperboard, label: "Movies" },
        { to: "/manager/genres", icon: Hash, label: "Genres" },
        { to: "/manager/showtimes", icon: Calendar, label: "Showtimes" },
        { to: "/manager/halls", icon: Armchair, label: "Halls" },
        { to: "/manager/concessions", icon: Popcorn, label: "Concessions" },
        { to: "/manager/pricing", icon: Ticket, label: "Pricing" },
        { to: "/manager/news", icon: Newspaper, label: "News" },
        { to: "/manager/banners", icon: ImageIcon, label: "Banners" },
        { to: "/manager/reviews", icon: MessageSquare, label: "Reviews" },
    ];

    const handleLogout = () => {
        logout();
        navigate("/", { replace: true });
    };

    return (
        <aside className="w-72 h-screen fixed left-0 top-0 bg-[#140405]/80 backdrop-blur-xl border-r border-white/10 flex flex-col p-6 z-50">
            <div className="flex items-center gap-3 mb-10 px-2">
                <div className="w-10 h-10 bg-gradient-to-tr from-red-600 to-red-400 rounded-lg flex items-center justify-center shadow-lg shadow-red-600/20">
                    <Clapperboard className="text-white" size={24} />
                </div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 font-display">
                    CineManager
                </h1>
            </div>

            <nav className="flex-1 space-y-2 overflow-y-auto no-scrollbar pr-2">
                <p className="px-4 text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-4">
                    Management
                </p>
                {menuItems.map((item) => (
                    <SidebarItem key={item.to} {...item} />
                ))}
            </nav>

            <div className="pt-6 border-t border-white/10 mt-6">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-4 px-4 py-3.5 w-full text-gray-500 hover:text-red-500 hover:bg-red-500/5 rounded-2xl transition-all duration-300 group"
                >
                    <div className="p-2 rounded-xl group-hover:bg-red-500/10 transition-colors">
                        <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                    </div>
                    <span className="font-bold text-sm tracking-wide">Logout</span>
                </button>
            </div>
        </aside>
    );
}
