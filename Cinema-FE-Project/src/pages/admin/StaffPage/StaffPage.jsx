import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Loader2, X, Lock, Unlock, Pencil, Trash2 } from 'lucide-react';
import { adminService } from '../../../services/adminService';

const EMAIL_REG = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REG = /^0\d{9}$/;

/** Lấy id gửi API: Mongo _id (chuỗi hoặc ObjectId) hoặc UUID */
function staffRowId(u) {
    if (!u) return '';
    const raw = u._id ?? u.id;
    if (raw != null && typeof raw === 'object') {
        return typeof raw.toString === 'function' ? raw.toString() : String(raw);
    }
    if (raw != null) return String(raw);
    return u.UUID ? String(u.UUID) : '';
}

export default function StaffPage() {
    const [loading, setLoading] = useState(true);
    const [branches, setBranches] = useState([]);
    const [list, setList] = useState([]);
    const [error, setError] = useState(null);
    const [branchFilter, setBranchFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    /** @type {null | object} */
    const [editingUser, setEditingUser] = useState(null);
    const [form, setForm] = useState({
        email: '',
        password: '',
        fullName: '',
        phoneNumber: '',
        role: 'staff',
        branchId: '',
    });
    const [submitErr, setSubmitErr] = useState('');
    const [actionId, setActionId] = useState(null);

    const fetchBranches = useCallback(async () => {
        try {
            const res = await adminService.getBranches();
            setBranches(res?.data || []);
        } catch {
            /* ignore */
        }
    }, []);

    const fetchStaff = useCallback(async () => {
        try {
            setLoading(true);
            const params = branchFilter ? { branchId: branchFilter } : {};
            const res = await adminService.getStaff(params);
            setList(res?.data || []);
        } catch (err) {
            setError(err?.response?.data?.message || 'Không tải được danh sách');
        } finally {
            setLoading(false);
        }
    }, [branchFilter]);

    useEffect(() => {
        fetchBranches();
    }, [fetchBranches]);

    useEffect(() => {
        fetchStaff();
    }, [fetchStaff]);

    const resetForm = () =>
        setForm({
            email: '',
            password: '',
            fullName: '',
            phoneNumber: '',
            role: 'staff',
            branchId: '',
        });

    const openCreate = () => {
        setEditingUser(null);
        resetForm();
        setSubmitErr('');
        setShowModal(true);
    };

    const openEdit = (u) => {
        const bid = u.branch?._id != null ? String(u.branch._id) : '';
        setEditingUser(u);
        setForm({
            email: u.email || '',
            password: '',
            fullName: u.fullName || '',
            phoneNumber: u.phoneNumber || '',
            role: u.role === 'manager' ? 'manager' : 'staff',
            branchId: bid,
        });
        setSubmitErr('');
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingUser(null);
        resetForm();
        setSubmitErr('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitErr('');

        if (!form.email) {
            setSubmitErr('Email là bắt buộc');
            return;
        }
        if (!editingUser && !form.password) {
            setSubmitErr('Mật khẩu là bắt buộc khi tạo mới');
            return;
        }
        if (!EMAIL_REG.test(form.email) || !form.email.endsWith('@gmail.com')) {
            setSubmitErr('Email phải là địa chỉ Gmail hợp lệ (ví dụ: user@gmail.com)');
            return;
        }
        if (form.phoneNumber && !PHONE_REG.test(form.phoneNumber)) {
            setSubmitErr('Số điện thoại phải 10 số, bắt đầu bằng 0');
            return;
        }
        if (!form.branchId) {
            setSubmitErr('Chọn chi nhánh làm việc cho nhân viên');
            return;
        }

        try {
            if (editingUser) {
                const payload = {
                    email: form.email,
                    fullName: form.fullName,
                    phoneNumber: form.phoneNumber || undefined,
                    role: form.role,
                    branchId: form.branchId,
                };
                if (form.password.trim()) {
                    payload.password = form.password;
                }
                await adminService.updateStaff(staffRowId(editingUser), payload);
            } else {
                await adminService.createStaff({ ...form });
            }
            closeModal();
            fetchStaff();
        } catch (err) {
            const apiMsg = err?.response?.data?.message;
            const status = err?.response?.status;
            const netMsg =
                err?.message === 'Network Error'
                    ? 'Không kết nối được API — kiểm tra BACKEND_URL (phải là http://HOST:PORT/api, không dùng /api/v1).'
                    : null;
            setSubmitErr(
                apiMsg ||
                netMsg ||
                (status === 404 ? 'API không tồn tại (404) — sai URL backend hoặc chưa deploy route PUT /admin/staff/:id).' : null) ||
                (status === 401 ? 'Hết phiên đăng nhập hoặc token không hợp lệ.' : null) ||
                (status === 403 ? 'Không có quyền Admin.' : null) ||
                (editingUser ? 'Cập nhật thất bại' : 'Tạo thất bại')
            );
        }
    };

    const handleDelete = async (u) => {
        const id = staffRowId(u);
        if (!id) return;
        if (!window.confirm(`Xóa vĩnh viễn tài khoản ${u.email}?\nThao tác không thể hoàn tác.`)) {
            return;
        }
        try {
            setActionId(id);
            await adminService.deleteStaff(id);
            await fetchStaff();
        } catch (err) {
            alert(err?.response?.data?.message || 'Xóa thất bại');
        } finally {
            setActionId(null);
        }
    };

    const handleToggleBlock = async (u) => {
        const id = staffRowId(u);
        if (!id) return;
        const willBlock = !u.isBlocked;
        if (willBlock) {
            const ok = window.confirm(
                `Khóa tài khoản ${u.email}?\nNhân viên nghỉ việc sẽ không đăng nhập được.`
            );
            if (!ok) return;
        }
        try {
            setActionId(id);
            if (willBlock) {
                await adminService.blockStaff(id);
            } else {
                await adminService.unblockStaff(id);
            }
            await fetchStaff();
        } catch (err) {
            alert(err?.response?.data?.message || 'Thao tác thất bại');
        } finally {
            setActionId(null);
        }
    };

    if (loading && list.length === 0 && !branchFilter) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-red-600" size={40} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold">Quản lý Nhân viên</h2>
                    <p className="text-gray-400 text-sm mt-1">
                        Sửa / phân quyền (Staff–Manager), gán chi nhánh, xóa tài khoản; khóa khi nghỉ việc.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <select
                        value={branchFilter}
                        onChange={(e) => setBranchFilter(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm min-w-[200px]"
                    >
                        <option value="">Tất cả chi nhánh</option>
                        {branches.map((b) => (
                            <option key={b._id || b.id} value={b._id || b.id}>
                                {b.name}
                            </option>
                        ))}
                    </select>
                    <button
                        type="button"
                        onClick={openCreate}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-medium"
                    >
                        <Plus size={18} />
                        Tạo tài khoản
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-x-auto">
                <table className="w-full text-left min-w-[1040px]">
                    <thead>
                        <tr className="text-gray-400 text-sm border-b border-white/10">
                            <th className="px-6 py-4 font-medium">Chi nhánh làm việc</th>
                            <th className="px-6 py-4 font-medium">Email</th>
                            <th className="px-6 py-4 font-medium">Họ tên</th>
                            <th className="px-6 py-4 font-medium">SĐT</th>
                            <th className="px-6 py-4 font-medium">Mật khẩu (lưu)</th>
                            <th className="px-6 py-4 font-medium">Vai trò</th>
                            <th className="px-6 py-4 font-medium">Trạng thái</th>
                            <th className="px-6 py-4 font-medium min-w-[200px]">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.map((u) => (
                            <tr key={u._id || u.UUID} className="border-b border-white/5 hover:bg-white/5">
                                <td className="px-6 py-4 text-sm max-w-[200px]">
                                    {u.branch?.name ? (
                                        <div>
                                            <div className="font-medium text-white">{u.branch.name}</div>
                                            {u.branch.address && (
                                                <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                                    {u.branch.address}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-gray-500">— (chưa gán chi nhánh)</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">{u.email}</td>
                                <td className="px-6 py-4">{u.fullName || '—'}</td>
                                <td className="px-6 py-4">{u.phoneNumber || '—'}</td>
                                <td className="px-6 py-4 font-mono text-sm text-amber-200/90">
                                    {u.passwordPlainForAdmin || '—'}
                                </td>
                                <td className="px-6 py-4">
                                    <span
                                        className={`px-2 py-1 rounded text-xs ${u.role === 'manager'
                                                ? 'bg-amber-500/20 text-amber-400'
                                                : 'bg-gray-500/20 text-gray-400'
                                            }`}
                                    >
                                        {u.role === 'manager' ? 'Manager' : 'Staff'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span
                                        className={`px-2 py-1 rounded text-xs ${u.isBlocked ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                                            }`}
                                    >
                                        {u.isBlocked ? 'Đã khóa' : 'Hoạt động'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-2 items-stretch">
                                        <div className="flex flex-wrap gap-1.5">
                                            <button
                                                type="button"
                                                disabled={actionId === staffRowId(u)}
                                                onClick={() => openEdit(u)}
                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-white/20 text-gray-200 hover:bg-white/10 disabled:opacity-50"
                                            >
                                                <Pencil size={14} />
                                                Sửa
                                            </button>
                                            <button
                                                type="button"
                                                disabled={actionId === staffRowId(u)}
                                                onClick={() => handleDelete(u)}
                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-red-500/40 text-red-300 hover:bg-red-500/10 disabled:opacity-50"
                                            >
                                                <Trash2 size={14} />
                                                Xóa
                                            </button>
                                        </div>
                                        <button
                                            type="button"
                                            disabled={actionId === staffRowId(u)}
                                            onClick={() => handleToggleBlock(u)}
                                            className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${u.isBlocked
                                                    ? 'border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10'
                                                    : 'border-red-500/40 text-red-300 hover:bg-red-500/10'
                                                } disabled:opacity-50`}
                                        >
                                            {actionId === staffRowId(u) ? (
                                                <Loader2 size={14} className="animate-spin" />
                                            ) : u.isBlocked ? (
                                                <>
                                                    <Unlock size={14} />
                                                    Mở khóa
                                                </>
                                            ) : (
                                                <>
                                                    <Lock size={14} />
                                                    Khóa (nghỉ việc)
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {list.length === 0 && (
                            <tr>
                                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                    Chưa có nhân viên
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div
                    className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
                    onClick={closeModal}
                >
                    <div
                        className="bg-[#1a0a0a] border border-white/10 rounded-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">
                                {editingUser ? 'Sửa tài khoản nhân viên' : 'Tạo tài khoản nhân viên'}
                            </h3>
                            <button type="button" onClick={closeModal} className="text-gray-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {submitErr && (
                                <div className="text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-lg">{submitErr}</div>
                            )}
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Chi nhánh *</label>
                                <select
                                    value={form.branchId}
                                    onChange={(e) => setForm({ ...form, branchId: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-red-600"
                                    required
                                >
                                    <option value="">— Chọn chi nhánh —</option>
                                    {branches.map((b) => (
                                        <option key={b._id || b.id} value={b._id || b.id}>
                                            {b.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Email (Gmail) *</label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-red-600"
                                    placeholder="user@gmail.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">
                                    {editingUser ? 'Mật khẩu mới (để trống nếu giữ nguyên)' : 'Mật khẩu *'}
                                </label>
                                <input
                                    type="password"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-red-600"
                                    placeholder={editingUser ? 'Không đổi nếu để trống' : '••••••••'}
                                    autoComplete="new-password"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Họ tên</label>
                                <input
                                    type="text"
                                    value={form.fullName}
                                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-red-600"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">SĐT (10 số, bắt đầu 0)</label>
                                <input
                                    type="text"
                                    value={form.phoneNumber}
                                    onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-red-600"
                                    placeholder="0901234567"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Phân quyền (vai trò)</label>
                                <select
                                    value={form.role}
                                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-red-600"
                                >
                                    <option value="staff">Staff — nhân viên rạp</option>
                                    <option value="manager">Manager — quản lý chi nhánh (1 manager / rạp)</option>
                                </select>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 py-2 border border-white/20 rounded-lg hover:bg-white/5"
                                >
                                    Hủy
                                </button>
                                <button type="submit" className="flex-1 py-2 bg-red-600 hover:bg-red-500 rounded-lg font-medium">
                                    {editingUser ? 'Cập nhật' : 'Tạo'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
