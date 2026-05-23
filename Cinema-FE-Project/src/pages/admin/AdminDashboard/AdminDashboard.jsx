import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Ticket, DollarSign, Loader2, AlertCircle } from 'lucide-react';
import { adminService } from '../../../services/adminService';
import { formatVND } from '../../../utils/format';

export default function AdminDashboard() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [movieRevenue, setMovieRevenue] = useState([]);
    const [cinemaRevenue, setCinemaRevenue] = useState([]);
    const [todayStats, setTodayStats] = useState({ tickets: 0, revenue: 0, topMovie: null });

    useEffect(() => {
        const fetch = async () => {
            try {
                setLoading(true);
                const [movieRes, cinemaRes] = await Promise.all([
                    adminService.getMovieRevenue(),
                    adminService.getCinemaRevenue()
                ]);
                const movies = movieRes?.data || [];
                const cinemas = cinemaRes?.data || [];
                setMovieRevenue(movies);
                setCinemaRevenue(cinemas);
                console.log(movies);
                console.log(cinemas);

                const totalTickets = movies.reduce((s, m) => s + (m.tickets || 0), 0);
                const totalRev = movies.reduce((s, m) => s + (m.revenue || 0), 0);
                setTodayStats({
                    tickets: totalTickets,
                    revenue: totalRev,
                    topMovie: movies[0] || null
                });
            } catch (err) {
                console.error(err);
                setError('Không tải được dữ liệu');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    if (loading) {
        return (
            <div className="h-[calc(100vh-10rem)] flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="animate-spin text-red-600 mx-auto" size={48} />
                    <p className="text-gray-400 animate-pulse">Đang tải...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold">Dashboard tổng quan</h2>
                    <p className="text-gray-400 mt-1">Thống kê nhanh hệ thống rạp.</p>
                </div>
                {error && (
                    <div className="flex items-center gap-2 text-amber-500 text-xs bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
                        <AlertCircle size={14} />
                        {error}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 rounded-2xl bg-red-500/20 text-red-500">
                            <Ticket size={24} />
                        </div>
                        <p className="text-gray-400 text-sm">Tổng vé bán</p>
                    </div>
                    <h3 className="text-2xl font-bold">{todayStats.tickets.toLocaleString()}</h3>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 rounded-2xl bg-green-500/20 text-green-500">
                            <DollarSign size={24} />
                        </div>
                        <p className="text-gray-400 text-sm">Tổng doanh thu</p>
                    </div>
                    <h3 className="text-2xl font-bold">{formatVND(todayStats.revenue)}</h3>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-500">
                            <TrendingUp size={24} />
                        </div>
                        <p className="text-gray-400 text-sm">Phim top 1</p>
                    </div>
                    <h3 className="text-lg font-bold truncate" title={todayStats.topMovie?.title}>
                        {todayStats.topMovie?.title || '—'}
                    </h3>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm"
                >
                    <h3 className="text-xl font-bold mb-6">Doanh thu theo phim</h3>
                    <div className="space-y-4 max-h-80 overflow-y-auto">
                        {movieRevenue.slice(0, 8).map((m, i) => (
                            <div key={m.movieId} className="flex justify-between items-center py-2 border-b border-white/5">
                                <span className="font-medium truncate pr-2">{m.title}</span>
                                <span className="text-red-500 font-bold">{formatVND(m.revenue || 0)}</span>
                            </div>
                        ))}
                        {movieRevenue.length === 0 && (
                            <p className="text-gray-500 text-sm py-4">Chưa có dữ liệu</p>
                        )}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm"
                >
                    <h3 className="text-xl font-bold mb-6">Doanh thu</h3>
                    <div className="space-y-4 max-h-80 overflow-y-auto">
                        {cinemaRevenue.slice(0, 8).map((c, i) => (
                            <div key={c.branchId || i} className="flex justify-between items-center py-2 border-b border-white/5">
                                <span className="font-medium truncate pr-2">Tổng:</span>
                                <span className="text-green-500 font-bold">{formatVND(c.revenue || 0)}</span>
                            </div>
                        ))}
                        {cinemaRevenue.length === 0 && (
                            <p className="text-gray-500 text-sm py-4">Chưa có dữ liệu</p>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
