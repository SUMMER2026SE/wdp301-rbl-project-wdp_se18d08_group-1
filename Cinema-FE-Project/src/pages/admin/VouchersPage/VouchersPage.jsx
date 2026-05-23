import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Loader2, Pencil, Trash2 } from 'lucide-react';
import { adminService } from '../../../services/adminService';
import { formatVND } from '../../../utils/format';
import VoucherAdminModal from './VoucherAdminModal';

export default function VouchersPage() {
    const [loading, setLoading] = useState(true);
    const [list, setList] = useState([]);
    const [error, setError] = useState(null);
    const [modalMode, setModalMode] = useState(null);
    const [editingVoucher, setEditingVoucher] = useState(null);

    const fetchList = useCallback(async () => {
        try {
            setLoading(true);
            const res = await adminService.getVouchers();
            setList(res?.data || []);
        } catch (err) {
            setError('Không tải được danh sách mã giảm giá');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchList();
    }, [fetchList]);

    const openCreate = () => {
        setEditingVoucher(null);
        setModalMode('create');
    };

    const openEdit = (v) => {
        setEditingVoucher(v);
        setModalMode('edit');
    };

    const closeModal = () => {
        setModalMode(null);
        setEditingVoucher(null);
    };

    const handleDelete = async (v) => {
        if (!v?.UUID) return;
        if (!window.confirm(`Xóa mã "${v.code}"?`)) return;
        try {
            await adminService.deleteVoucher(v.UUID);
            fetchList();
        } catch (err) {
            setError(err?.response?.data?.message || 'Xóa thất bại');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-red-600" size={40} />
            </div>
        );
    }

    const formatDate = (d) => {
        if (!d) return '—';
        const dt = new Date(d);
        return dt.toLocaleString('vi-VN');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl font-bold">Quản lý Mã giảm giá</h2>
                    <p className="text-gray-400 text-sm mt-1">
                        Tạo mã code, quy định số lượng, % giảm giá, ngày hết hạn.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={openCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-medium"
                >
                    <Plus size={18} />
                    Tạo mã giảm giá
                </button>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-x-auto">
                <table className="w-full text-left min-w-[900px]">
                    <thead>
                        <tr className="text-gray-400 text-sm border-b border-white/10">
                            <th className="px-6 py-4 font-medium">Code</th>
                            <th className="px-6 py-4 font-medium">Loại</th>
                            <th className="px-6 py-4 font-medium">Giá trị</th>
                            <th className="px-6 py-4 font-medium">Đã dùng / Tổng</th>
                            <th className="px-6 py-4 font-medium">Bắt đầu</th>
                            <th className="px-6 py-4 font-medium">Hết hạn</th>
                            <th className="px-6 py-4 font-medium">Trạng thái</th>
                            <th className="px-6 py-4 font-medium w-28">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.map((v) => (
                            <tr key={v.UUID || v._id} className="border-b border-white/5 hover:bg-white/5">
                                <td className="px-6 py-4 font-mono font-bold">{v.code}</td>
                                <td className="px-6 py-4">{v.type === 'PERCENTAGE' ? '%' : 'VNĐ cố định'}</td>
                                <td className="px-6 py-4">
                                    {v.type === 'PERCENTAGE' ? `${v.value}%` : formatVND(v.value)}
                                </td>
                                <td className="px-6 py-4">
                                    {v.usedCount ?? 0} / {v.usageLimit > 0 ? v.usageLimit : '∞'}
                                </td>
                                <td className="px-6 py-4 text-sm whitespace-nowrap">{formatDate(v.startDate)}</td>
                                <td className="px-6 py-4 text-sm whitespace-nowrap">{formatDate(v.endDate)}</td>
                                <td className="px-6 py-4">
                                    <span
                                        className={`px-2 py-1 rounded text-xs ${
                                            v.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                                        }`}
                                    >
                                        {v.isActive ? 'Hoạt động' : 'Tắt'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => openEdit(v)}
                                            className="p-2 text-amber-400 hover:bg-white/10 rounded-lg"
                                            title="Sửa"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(v)}
                                            className="p-2 text-red-400 hover:bg-white/10 rounded-lg"
                                            title="Xóa"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {list.length === 0 && (
                            <tr>
                                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                    Chưa có mã giảm giá. Nhấn &quot;Tạo mã giảm giá&quot; để thêm.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {modalMode && (
                <VoucherAdminModal
                    mode={modalMode === 'create' ? 'create' : 'edit'}
                    voucher={editingVoucher}
                    onClose={closeModal}
                    onSaved={fetchList}
                />
            )}
        </div>
    );
}
