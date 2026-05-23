import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { Bell, Search, User } from 'lucide-react';

const AdminTopBar = () => (
    <header className="h-20 border-b border-white/10 bg-[#140405]/40 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-40">
        <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
                type="text"
                placeholder="Tìm kiếm..."
                className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-red-600/50 focus:bg-white/10 transition-all"
            />
        </div>

        <div className="flex items-center gap-6">
            <button className="relative text-gray-400 hover:text-white transition-colors">
                <Bell size={20} />
            </button>

            <div className="flex items-center gap-3 pl-6 border-l border-white/10">
                <div className="text-right">
                    <p className="text-sm font-semibold text-white">Super Admin</p>
                    <p className="text-xs text-gray-400">Quản trị viên tối cao</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 to-amber-500 p-0.5">
                    <div className="w-full h-full rounded-full bg-[#140405] flex items-center justify-center overflow-hidden">
                        <User className="text-amber-400" size={24} />
                    </div>
                </div>
            </div>
        </div>
    </header>
);

export default function AdminLayout() {
    const token = localStorage.getItem('token');
    if (!token) {
        return <Navigate to="/admin/login" replace />;
    }

    return (
        <div className="min-h-screen bg-[#140405] text-white">
            <AdminSidebar />
            <div className="pl-72 flex flex-col min-h-screen">
                <AdminTopBar />
                <main className="flex-1 p-8 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
