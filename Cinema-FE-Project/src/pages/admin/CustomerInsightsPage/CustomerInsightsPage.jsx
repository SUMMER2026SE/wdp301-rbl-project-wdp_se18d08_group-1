import React, { useEffect, useState } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { adminService } from '../../../services/adminService';
import { formatVND } from '../../../utils/format';

export default function CustomerInsightsPage() {
    const [loading, setLoading] = useState(true);
    const [list, setList] = useState([]);
    const [error, setError] = useState(null);
    const [limit, setLimit] = useState(10);

    useEffect(() => {
        const fetch = async () => {
            try {
                setLoading(true);
                const res = await adminService.getTopCustomers(limit);
                setList(res?.data || []);
            } catch (err) {
                setError('Không tải được dữ liệu');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [limit]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-red-600" size={40} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Khách hàng thân thiết</h2>
                    <p className="text-gray-400 text-sm mt-1">Top khách hàng chi tiêu nhiều nhất (để tri ân).</p>
                </div>
                <select
                    value={limit}
                    onChange={(e) => setLimit(Number(e.target.value))}
                    className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-600"
                >
                    <option value={5}>Top 5</option>
                    <option value={10}>Top 10</option>
                    <option value={20}>Top 20</option>
                    <option value={50}>Top 50</option>
                </select>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-gray-400 text-sm border-b border-white/10">
                            <th className="px-6 py-4 font-medium">#</th>
                            <th className="px-6 py-4 font-medium">Họ tên</th>
                            <th className="px-6 py-4 font-medium">Email</th>
                            <th className="px-6 py-4 font-medium">SĐT</th>
                            <th className="px-6 py-4 font-medium">Tổng chi tiêu</th>
                            <th className="px-6 py-4 font-medium">Số đơn</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.map((c, i) => (
                            <tr key={c.userId} className="border-b border-white/5 hover:bg-white/5">
                                <td className="px-6 py-4 font-bold">{i + 1}</td>
                                <td className="px-6 py-4">{c.fullName || '—'}</td>
                                <td className="px-6 py-4">{c.email}</td>
                                <td className="px-6 py-4">{c.phoneNumber || '—'}</td>
                                <td className="px-6 py-4 text-amber-400 font-bold">{formatVND(c.totalSpent || 0)}</td>
                                <td className="px-6 py-4">{c.totalOrders ?? 0}</td>
                            </tr>
                        ))}
                        {list.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    Chưa có dữ liệu
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
