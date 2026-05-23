import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar/Sidebar';
import { Bell, User, LogOut } from 'lucide-react';

const Header = () => {
    const location = useLocation();
    const [showNotifications, setShowNotifications] = React.useState(false);
    
    // Convert path like "/manager/movie-management" to "Movie Management"
    const getPageTitle = () => {
        const path = location.pathname.split('/').pop();
        if (!path || path === 'dashboard') return 'Dashboard Overview';
        return path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
    };

    return (
        <header className="h-20 border-b border-white/10 bg-[#140405]/40 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-40">
            <div className="flex-1">
                <h1 className="text-lg font-bold text-white/90 uppercase tracking-widest">{getPageTitle()}</h1>
            </div>

            <div className="flex items-center gap-6">
                <div className="relative">
                    <button 
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`relative text-gray-400 hover:text-white transition-all p-2 rounded-xl ${showNotifications ? 'bg-white/10 text-white' : 'hover:bg-white/5'}`}
                    >
                        <Bell size={20} />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full border-2 border-[#140405]"></span>
                    </button>

                    {showNotifications && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
                            <div className="absolute right-0 mt-2 w-80 bg-[#1a0607] border border-white/10 rounded-2xl shadow-2xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="p-4 border-b border-white/10 bg-white/[0.02]">
                                    <h4 className="font-bold text-sm">Notifications</h4>
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                    <div className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group">
                                        <p className="text-xs text-red-500 font-bold mb-1">Inventory Alert</p>
                                        <p className="text-sm text-gray-300">3 items are running low on stock in F&B.</p>
                                        <p className="text-[10px] text-gray-500 mt-2">2 minutes ago</p>
                                    </div>
                                    <div className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group">
                                        <p className="text-xs text-blue-500 font-bold mb-1">System Update</p>
                                        <p className="text-sm text-gray-300">Backup completed successfully.</p>
                                        <p className="text-[10px] text-gray-500 mt-2">1 hour ago</p>
                                    </div>
                                </div>
                                <button className="w-full py-3 text-xs text-gray-500 hover:text-white hover:bg-white/5 transition-all font-medium">
                                    Mark all as read
                                </button>
                            </div>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-4 pl-6 border-l border-white/10">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-semibold text-white">Manager User</p>
                        <p className="text-xs text-gray-400">Senior Admin</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 p-0.5 cursor-pointer hover:scale-105 transition-transform">
                        <div className="w-full h-full rounded-full bg-[#140405] flex items-center justify-center overflow-hidden">
                            <User className="text-gray-400" size={24} />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default function ManagerLayout() {
    return (
        <div className="min-h-screen bg-[#140405] text-white">
            <Sidebar />
            <div className="pl-72 flex flex-col min-h-screen">
                <Header />
                <main className="flex-1 p-8 overflow-y-auto overflow-x-hidden">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
