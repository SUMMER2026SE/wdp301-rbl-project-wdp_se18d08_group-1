import React, { useEffect, useState, memo, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp,
    Users,
    Ticket,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { managerService } from '../../../services/managerService';
import { formatVND } from '../../../utils/format';
import { API_BASE_URL } from '../../../config/api';

const iconMap = {
    DollarSign,
    Ticket,
    Users,
    TrendingUp
};

const StatCard = memo(({ title, value, change, icon, color, isCurrency }) => {
    const Icon = iconMap[icon] || TrendingUp;
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
        >
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl bg-${color}-500/20 text-${color}-500`}>
                    <Icon size={24} />
                </div>
                <div className={`flex items-center gap-1 text-sm ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {change >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    <span>{Math.abs(change)}%</span>
                </div>
            </div>
            <p className="text-gray-400 text-sm font-medium">{title}</p>
            <h3 className="text-2xl font-bold mt-1">
                {isCurrency ? formatVND(value) : value.toLocaleString()}
            </h3>
        </motion.div>
    );
});

const OrderDetailsModal = ({ order, onClose }) => {
    if (!order) return null;
    return (
        <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
            onClick={onClose}
        >
            <motion.div 
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                className="bg-neutral-900 border border-white/10 rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                    <div>
                        <h4 className="text-white font-black uppercase tracking-widest text-lg italic">Order Details</h4>
                        <p className="text-white/40 text-xs mt-1">UUID: {order.UUID}</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-all">✕</button>
                </div>
                
                <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {/* Customer & Summary */}
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <p className="text-white/20 text-[10px] uppercase font-black tracking-widest mb-1">Customer</p>
                            <p className="text-white font-bold">{order.name}</p>
                            <p className="text-white/40 text-xs">{order.email}</p>
                        </div>
                        <div>
                            <p className="text-white/20 text-[10px] uppercase font-black tracking-widest mb-1">Total Paid</p>
                            <p className="text-primary font-black text-xl">{formatVND(order.amount)}</p>
                            {order.voucher && (
                                <p className="text-green-500 text-[10px] font-bold uppercase">Code: {order.voucher.code} (-{formatVND(order.voucher.discount)})</p>
                            )}
                        </div>
                    </div>

                    {/* Tickets Section */}
                    {order.details?.tickets?.length > 0 && (
                        <div className="space-y-4">
                            <h5 className="text-white/40 text-[10px] uppercase font-black tracking-[0.2em] border-b border-white/5 pb-2">Tickets ({order.details.tickets.length})</h5>
                            <div className="space-y-3">
                                {order.details.tickets.map((t, i) => (
                                    <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <div>
                                            <p className="text-white font-bold text-sm uppercase italic">{t.movie}</p>
                                            <p className="text-white/40 text-[10px] font-bold uppercase">{t.hall} • SEAT {t.seat}</p>
                                        </div>
                                        <p className="text-white/60 font-mono text-xs">{formatVND(t.price)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Concessions Section */}
                    {order.details?.concessions?.length > 0 && (
                        <div className="space-y-4">
                            <h5 className="text-white/40 text-[10px] uppercase font-black tracking-[0.2em] border-b border-white/5 pb-2">F&B Add-ons ({order.details.concessions.length})</h5>
                            <div className="space-y-3">
                                {order.details.concessions.map((it, i) => (
                                    <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-500 text-[10px] font-black">{it.quantity}x</div>
                                            <p className="text-white font-bold text-sm uppercase">{it.name}</p>
                                        </div>
                                        <p className="text-white/60 font-mono text-xs">{formatVND(it.price * it.quantity)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="p-8 bg-white/[0.02] border-t border-white/5 flex justify-end">
                    <button onClick={onClose} className="bg-white text-black px-10 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">Close Details</button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default memo(function ManagerDashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [summary, setSummary] = useState(null);
    const [movieStats, setMovieStats] = useState([]);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [selectedOrder, setSelectedOrder] = useState(null);

    const fetchData = useCallback(async (isSilent = false) => {
        try {
            if (!isSilent) setLoading(true);
            else setRefreshing(true);

            const [summaryRes, movieRes] = await Promise.all([
                managerService.getDashboardStats(),
                managerService.getMovieStats()
            ]);
            setSummary(summaryRes.data);
            setMovieStats(movieRes.data.popularMovies || []);
            setLastUpdated(new Date());
            setError(null);
        } catch (err) {
            console.error('Dashboard error:', err);
            setError('Failed to sync real-time data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    const handleExport = async () => {
        try {
            const data = await managerService.exportDashboardSummary();
            const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Cinema_Sales_Report.xlsx');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Export error:', err);
            alert('Failed to export report');
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(() => {
            fetchData(true);
        }, 15000);
        return () => clearInterval(interval);
    }, [fetchData]);


    const stats = useMemo(() => summary?.stats || [], [summary?.stats]);

    if (loading) {
        return (
            <div className="h-[calc(100vh-10rem)] flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="animate-spin text-red-600 mx-auto" size={48} />
                    <p className="text-gray-400 animate-pulse font-medium">Syncing live analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-3xl font-black tracking-tight uppercase italic">Dashboard</h2>
                        <div className="flex items-center gap-2 bg-green-500/10 text-green-500 px-3 py-1 rounded-full border border-green-500/20 text-[10px] font-black uppercase tracking-widest">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            Live Updates
                        </div>
                    </div>
                    <p className="text-gray-400 text-sm font-medium italic">
                        Real-time analytics monitor. Last updated: {lastUpdated.toLocaleTimeString()}
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    {error && (
                        <div className="flex items-center gap-2 text-amber-500 text-[10px] font-black uppercase tracking-widest bg-amber-500/10 px-4 py-2 rounded-2xl border border-amber-500/20">
                            <AlertCircle size={14} />
                            {error}
                        </div>
                    )}
                    <button 
                        onClick={() => fetchData(true)}
                        disabled={refreshing}
                        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-6 py-2.5 rounded-2xl border border-white/5 transition-all disabled:opacity-50 text-xs font-black uppercase tracking-widest"
                    >
                        {refreshing ? <Loader2 className="w-4 h-4 animate-spin text-red-600" /> : <TrendingUp className="w-4 h-4" />}
                        Refresh
                    </button>
                    <button 
                        onClick={handleExport}
                        className="bg-primary text-white px-8 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-red-600/20"
                    >
                        Export Report
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.length > 0 ? (
                    stats.map((stat, index) => (
                        <StatCard key={index} {...stat} />
                    ))
                ) : (
                    <div className="col-span-full py-10 text-center text-gray-500 border border-dashed border-white/10 rounded-3xl font-bold uppercase text-xs italic tracking-widest">
                        Wait for incoming data...
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2 bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-sm"
                >
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-black uppercase italic tracking-wider">Revenue Stream</h3>
                        <select className="bg-white/5 border border-white/10 rounded-xl px-5 py-2 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-red-600 cursor-pointer text-white [&>option]:text-gray-900">
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                        </select>
                    </div>
                    <div className="h-64 flex items-end justify-between gap-3">
                        {(summary?.revenueChart || [0, 0, 0, 0, 0, 0, 0]).map((val, i) => (
                            <motion.div
                                key={i}
                                initial={{ height: 0 }}
                                animate={{ height: `${val > 0 ? (val / 1000000) * 80 + 10 : 10}%` }}
                                transition={{ duration: 1, delay: i * 0.1 }}
                                className="w-full bg-gradient-to-t from-red-600 to-red-400 rounded-t-2xl relative group cursor-pointer hover:shadow-[0_0_20px_rgba(230,10,21,0.3)] transition-all"
                            >
                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-black px-3 py-1.5 rounded-xl text-[10px] font-black opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-2xl">
                                    {formatVND(val)}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-6 text-white/20 text-[10px] font-black uppercase tracking-[0.2em]">
                        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-sm"
                >
                    <h3 className="text-xl font-black uppercase italic tracking-wider mb-8">Top Titles</h3>
                    <div className="space-y-8">
                        {movieStats.length > 0 ? (
                            movieStats.slice(0, 4).map((movie, i) => (
                                <div key={i} className="space-y-3">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                        <span className="truncate pr-4 text-white/60" title={movie.name}>{movie.name}</span>
                                        <span className="text-primary italic">{movie.sales} TICKETS</span>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${movie.progress}%` }}
                                            transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                                            className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full"
                                        />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-10 text-center text-white/20 text-[10px] font-black uppercase italic tracking-widest">
                                No sales recorded...
                            </div>
                        )}
                    </div>
                    <button 
                        onClick={() => navigate('/manager/movies')}
                        className="w-full mt-10 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] font-black uppercase tracking-widest transition-all text-white/60 hover:text-white"
                    >
                        Catalogue View
                    </button>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-sm shadow-2xl"
            >
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                    <h3 className="text-xl font-black uppercase italic tracking-wider">Transaction Feed</h3>
                    <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full text-[10px] font-bold text-white/40 uppercase tracking-widest">
                        Last 50 Records
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-white/20 text-[10px] font-black uppercase tracking-widest border-b border-white/5">
                                <th className="px-8 py-5">Customer Profile</th>
                                <th className="px-8 py-5">Revenue</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.02]">
                            {(summary?.transactions || []).map((item, idx) => (
                                <tr key={idx} className="hover:bg-white/[0.03] transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-red-400 p-0.5">
                                                <div className="w-full h-full bg-neutral-950 rounded-[0.9rem] flex items-center justify-center text-white font-black text-xs">
                                                    {(item.name || 'U').split(' ').map(n => n[0]).join('')}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">{item.name}</p>
                                                <p className="text-[10px] text-white/40 font-medium uppercase tracking-tight">{new Date(item.date).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <p className="text-sm font-black text-white">{formatVND(item.amount)}</p>
                                        {item.voucher && <p className="text-[10px] text-green-500 font-bold uppercase">PROMO USED</p>}
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                            item.status === 'PAID' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                                            item.status === 'CANCELLED' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                                            'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                        }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <button 
                                            onClick={() => setSelectedOrder(item)}
                                            className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-red-500 transition-colors"
                                        >
                                            View Slip
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {(!summary?.transactions || summary.transactions.length === 0) && (
                                <tr>
                                    <td colSpan="4" className="px-8 py-10 text-center text-gray-500 italic">
                                        No recent transactions found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            <AnimatePresence>
                {selectedOrder && (
                    <OrderDetailsModal 
                        order={selectedOrder} 
                        onClose={() => setSelectedOrder(null)} 
                    />
                )}
            </AnimatePresence>
        </div>
    );
});
