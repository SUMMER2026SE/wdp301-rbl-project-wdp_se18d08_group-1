import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    UserCog,
    Building2,
    Ticket,
    BarChart3,
    Heart,
    Settings,
    LogOut,
    Shield
} from 'lucide-react';

const SidebarItem = ({ to, icon: Icon, label }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-500 group relative overflow-hidden
      ${isActive
                ? 'bg-gradient-to-r from-red-600/20 to-transparent text-white border-l-4 border-red-600 shadow-[20px_0_40px_-20px_rgba(220,38,38,0.3)]'
                : 'text-gray-500 hover:bg-white/5 hover:text-gray-200'}`
        }
    >
        {({ isActive }) => (
            <div className="flex items-center gap-4 relative z-10">
                <div className={`p-2 rounded-xl transition-colors duration-500 ${isActive ? 'bg-red-600 text-white shadow-lg' : 'group-hover:bg-white/10'}`}>
                    <Icon size={18} className="group-hover:scale-110 transition-transform duration-300" />
                </div>
                <span className="font-bold text-sm tracking-wide">{label}</span>
            </div>
        )}
    </NavLink>
);

export default function AdminSidebar() {
    const menuItems = [
        { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/admin/users', icon: Users, label: 'Khách hàng' },
        { to: '/admin/staff', icon: UserCog, label: 'Nhân viên' },
        { to: '/admin/branches', icon: Building2, label: 'Chi nhánh rạp' },
        { to: '/admin/vouchers', icon: Ticket, label: 'Mã giảm giá' },
        { to: '/admin/reports', icon: BarChart3, label: 'Báo cáo doanh thu' },
        { to: '/admin/customers', icon: Heart, label: 'Khách hàng thân thiết' },
        { to: '/admin/settings', icon: Settings, label: 'Cấu hình hệ thống' },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/';
    };

    return (
        <aside className="w-72 h-screen fixed left-0 top-0 bg-[#140405]/80 backdrop-blur-xl border-r border-white/10 flex flex-col p-6 z-50">
            <div className="flex items-center gap-3 mb-10 px-2">
                <div className="w-10 h-10 bg-gradient-to-tr from-amber-600 to-amber-400 rounded-lg flex items-center justify-center shadow-lg shadow-amber-600/20">
                    <Shield className="text-white" size={24} />
                </div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 font-display">
                    Super Admin
                </h1>
            </div>

            <nav className="flex-1 space-y-2 overflow-y-auto no-scrollbar pr-2">
                <p className="px-4 text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-4">
                    Quản trị
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
                    <span className="font-bold text-sm tracking-wide">Đăng xuất</span>
                </button>
            </div>
        </aside>
    );
}
