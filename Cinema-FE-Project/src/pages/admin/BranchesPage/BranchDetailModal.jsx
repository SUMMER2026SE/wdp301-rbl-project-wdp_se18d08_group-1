import React, { useEffect, useState } from 'react';
import { X, Loader2, Building2, Users, Armchair } from 'lucide-react';
import { adminService } from '../../../services/adminService';

export default function BranchDetailModal({ branchId, onClose }) {
    const [loading, setLoading] = useState(true);
    const [detail, setDetail] = useState(null);
    const [err, setErr] = useState(null);

    useEffect(() => {
        const load = async () => {
            if (!branchId) return;
            try {
                setLoading(true);
                setErr(null);
                const res = await adminService.getBranchDetail(branchId);
                setDetail(res?.data || null);
            } catch (e) {
                setErr(e?.response?.data?.message || 'Không tải được chi tiết');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [branchId]);

    const b = detail?.branch;
    const halls = detail?.halls || [];
    const managers = detail?.managers || [];
    const staff = detail?.staff || [];

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div
                className="bg-[#1a0a0a] border border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                        <Building2 className="text-red-500" size={28} />
                        <div>
                            <h3 className="text-xl font-bold">{b?.name || 'Chi nhánh'}</h3>
                            <p className="text-gray-400 text-sm mt-1">{b?.address}</p>
                            <p className="text-amber-400 text-sm">Hotline: {b?.hotline}</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={22} />
                    </button>
                </div>

                {loading && (
                    <div className="flex justify-center py-12">
                        <Loader2 className="animate-spin text-red-600" size={36} />
                    </div>
                )}
                {!loading && err && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm">{err}</div>
                )}
                {!loading && !err && detail && (
                    <div className="space-y-8">
                        <section>
                            <div className="flex items-center gap-2 mb-3 text-sm font-bold text-gray-300">
                                <Armchair size={18} className="text-red-400" />
                                Phòng chiếu ({halls.length})
                            </div>
                            {halls.length === 0 ? (
                                <p className="text-gray-500 text-sm">Chưa gán phòng chiếu cho chi nhánh này.</p>
                            ) : (
                                <ul className="space-y-2">
                                    {halls.map((h) => (
                                        <li
                                            key={h._id || h.UUID}
                                            className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm flex justify-between"
                                        >
                                            <span className="font-medium">{h.name}</span>
                                            <span className="text-gray-400">
                                                {h.type || '—'} · {h.capacity ?? '—'} chỗ
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>

                        <section>
                            <div className="flex items-center gap-2 mb-3 text-sm font-bold text-gray-300">
                                <Users size={18} className="text-amber-400" />
                                Manager chi nhánh
                            </div>
                            {managers.length === 0 ? (
                                <p className="text-gray-500 text-sm">Chưa có manager (mỗi chi nhánh tối đa 1 manager).</p>
                            ) : (
                                <ul className="space-y-2">
                                    {managers.map((m) => (
                                        <li
                                            key={m._id || m.UUID}
                                            className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-2 text-sm"
                                        >
                                            <span className="font-medium">{m.fullName || m.email}</span>
                                            <span className="text-gray-400 ml-2">{m.email}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>

                        <section>
                            <div className="flex items-center gap-2 mb-3 text-sm font-bold text-gray-300">
                                <Users size={18} className="text-gray-400" />
                                Nhân viên ({staff.length})
                            </div>
                            {staff.length === 0 ? (
                                <p className="text-gray-500 text-sm">Chưa có nhân viên thuộc chi nhánh.</p>
                            ) : (
                                <ul className="space-y-2">
                                    {staff.map((s) => (
                                        <li
                                            key={s._id || s.UUID}
                                            className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm flex justify-between"
                                        >
                                            <span>{s.fullName || s.email}</span>
                                            <span className="text-gray-400">{s.email}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
}
