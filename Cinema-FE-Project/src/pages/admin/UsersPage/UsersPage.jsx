import React, { useEffect, useState } from 'react';
import { Users, Loader2, Ban } from 'lucide-react';
import { adminService } from '../../../services/adminService';

export default function UsersPage() {
    const [loading, setLoading] = useState(true);
    const [list, setList] = useState([]);
    const [error, setError] = useState(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await adminService.getUsers();
            setList(res?.data || []);
        } catch (err) {
            setError('Không tải được danh sách');
        } finally {
            setLoading(false);
        }
    };

    const handleBlock = async (id) => {
        if (!window.confirm('Bạn có chắc muốn khóa tài khoản này?')) return;
        try {
            await adminService.blockUser(id);
            fetchUsers();
        } catch (err) {
            setError(err?.response?.data?.message || 'Không thể khóa');
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-red-600" size={40} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">Quản lý Khách hàng</h2>
                <p className="text-gray-400 text-sm mt-1">Xem danh sách khách hàng (email, tên, SĐT). Mật khẩu không hiển thị.</p>
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
                            <th className="px-6 py-4 font-medium">ID</th>
                            <th className="px-6 py-4 font-medium">Email</th>
                            <th className="px-6 py-4 font-medium">Họ tên</th>
                            <th className="px-6 py-4 font-medium">SĐT</th>
                            <th className="px-6 py-4 font-medium">Trạng thái</th>
                            <th className="px-6 py-4 font-medium">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.map((u) => (
                            <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                                <td className="px-6 py-4">{u.id}</td>
                                <td className="px-6 py-4">{u.email}</td>
                                <td className="px-6 py-4">{u.fullName || '—'}</td>
                                <td className="px-6 py-4">{u.phoneNumber || '—'}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs ${u.isBlocked ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                        {u.isBlocked ? 'Đã khóa' : 'Hoạt động'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {!u.isBlocked && (
                                        <button
                                            onClick={() => handleBlock(u.id)}
                                            className="flex items-center gap-1 text-red-400 hover:text-red-300 text-sm"
                                        >
                                            <Ban size={14} />
                                            Khóa
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {list.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    Chưa có khách hàng
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
