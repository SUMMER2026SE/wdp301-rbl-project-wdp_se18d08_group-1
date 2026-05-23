import React, { useEffect, useState } from 'react';
import { Building2, Plus, Loader2, Edit2, X, Eye } from 'lucide-react';
import { adminService } from '../../../services/adminService';
import BranchDetailModal from './BranchDetailModal';

export default function BranchesPage() {
    const [loading, setLoading] = useState(true);
    const [list, setList] = useState([]);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [detailBranchId, setDetailBranchId] = useState(null);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', address: '', hotline: '' });
    const [submitErr, setSubmitErr] = useState('');

    const fetchBranches = async () => {
        try {
            setLoading(true);
            const res = await adminService.getBranches();
            setList(res?.data || []);
        } catch (err) {
            setError('Không tải được danh sách');
        } finally {
            setLoading(false);
        }
    };

    const openCreate = () => {
        setEditing(null);
        setForm({ name: '', address: '', hotline: '' });
        setShowModal(true);
        setSubmitErr('');
    };

    const openEdit = (b) => {
        setEditing(b);
        setForm({ name: b.name, address: b.address, hotline: b.hotline });
        setShowModal(true);
        setSubmitErr('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitErr('');
        if (!form.name || !form.address || !form.hotline) {
            setSubmitErr('Tên, địa chỉ và hotline là bắt buộc');
            return;
        }
        try {
            if (editing) {
                const bid = editing._id || editing.id;
                await adminService.updateBranch(bid, form);
            } else {
                await adminService.createBranch(form);
            }
            setShowModal(false);
            fetchBranches();
        } catch (err) {
            setSubmitErr(err?.response?.data?.message || 'Thao tác thất bại');
        }
    };

    useEffect(() => {
        fetchBranches();
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
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Quản lý Chi nhánh rạp</h2>
                    <p className="text-gray-400 text-sm mt-1">Thêm/Sửa địa chỉ, hotline các chi nhánh.</p>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-medium"
                >
                    <Plus size={18} />
                    Thêm chi nhánh
                </button>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {list.map((b) => (
                    <div key={b._id || b.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2">
                                <Building2 className="text-red-500" size={24} />
                                <h3 className="font-bold">{b.name}</h3>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => setDetailBranchId(b._id || b.id)}
                                    className="text-gray-400 hover:text-amber-400 p-1 flex items-center gap-1 text-xs"
                                    title="Chi tiết phòng chiếu & nhân sự"
                                >
                                    <Eye size={16} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => openEdit(b)}
                                    className="text-gray-400 hover:text-white p-1"
                                >
                                    <Edit2 size={16} />
                                </button>
                            </div>
                        </div>
                        <p className="text-gray-400 text-sm mb-1">{b.address}</p>
                        <p className="text-amber-400 text-sm font-medium">Hotline: {b.hotline}</p>
                        <button
                            type="button"
                            onClick={() => setDetailBranchId(b._id || b.id)}
                            className="mt-4 w-full py-2 text-sm rounded-lg border border-white/15 hover:bg-white/10 text-gray-300"
                        >
                            Chi tiết chi nhánh
                        </button>
                    </div>
                ))}
                {list.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-500 border border-dashed border-white/10 rounded-2xl">
                        Chưa có chi nhánh
                    </div>
                )}
            </div>

            {detailBranchId && (
                <BranchDetailModal branchId={detailBranchId} onClose={() => setDetailBranchId(null)} />
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
                    <div className="bg-[#1a0a0a] border border-white/10 rounded-2xl p-8 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">{editing ? 'Sửa chi nhánh' : 'Thêm chi nhánh'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {submitErr && (
                                <div className="text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-lg">{submitErr}</div>
                            )}
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Tên chi nhánh *</label>
                                <input
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-red-600"
                                    placeholder="Chi nhánh Quận 1"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Địa chỉ *</label>
                                <input
                                    value={form.address}
                                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-red-600"
                                    placeholder="123 Đường A, Q.1, TP.HCM"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Hotline *</label>
                                <input
                                    value={form.hotline}
                                    onChange={(e) => setForm({ ...form, hotline: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-red-600"
                                    placeholder="19001001"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 border border-white/20 rounded-lg hover:bg-white/5">
                                    Hủy
                                </button>
                                <button type="submit" className="flex-1 py-2 bg-red-600 hover:bg-red-500 rounded-lg font-medium">
                                    {editing ? 'Cập nhật' : 'Thêm'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
