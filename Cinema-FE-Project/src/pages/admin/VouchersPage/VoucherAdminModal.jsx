import React, { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { adminService } from '../../../services/adminService';

const defaultForm = {
    code: '',
    type: 'PERCENTAGE',
    value: 10,
    usageLimit: 100,
    perUserLimit: 1,
    startDate: '',
    endDate: '',
    minOrderValue: '',
    maxDiscountAmount: '',
    isActive: true,
};

/**
 * Modal tạo / sửa voucher (admin).
 * BE: POST/PUT /api/vouchers — type PERCENTAGE = %, usageLimit = tổng lượt (0 = không giới hạn).
 */
export default function VoucherAdminModal({ mode, voucher, onClose, onSaved }) {
    const [form, setForm] = useState(defaultForm);
    const [submitErr, setSubmitErr] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (mode === 'edit' && voucher) {
            const toLocal = (d) => {
                if (!d) return '';
                const dt = new Date(d);
                const pad = (n) => String(n).padStart(2, '0');
                return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
            };
            setForm({
                code: voucher.code || '',
                type: voucher.type || 'PERCENTAGE',
                value: voucher.value ?? 10,
                usageLimit: voucher.usageLimit ?? 0,
                perUserLimit: voucher.perUserLimit ?? 1,
                startDate: toLocal(voucher.startDate),
                endDate: toLocal(voucher.endDate),
                minOrderValue: voucher.minOrderValue != null ? String(voucher.minOrderValue) : '',
                maxDiscountAmount: voucher.maxDiscountAmount != null ? String(voucher.maxDiscountAmount) : '',
                isActive: voucher.isActive !== false,
            });
        } else {
            const now = new Date();
            const tomorrow = new Date(now.getTime() + 86400000);
            const toLocal = (dt) => {
                const pad = (n) => String(n).padStart(2, '0');
                return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
            };
            setForm({
                ...defaultForm,
                startDate: toLocal(now),
                endDate: toLocal(tomorrow),
            });
        }
        setSubmitErr('');
    }, [mode, voucher]);

    const validate = () => {
        if (!form.code?.trim()) return 'Nhập mã code';
        if (form.value === '' || Number(form.value) < 0) return 'Giá trị giảm không hợp lệ';
        if (form.type === 'PERCENTAGE' && Number(form.value) > 100) return 'Phần trăm không quá 100';
        if (!form.startDate || !form.endDate) return 'Chọn ngày bắt đầu và hết hạn';
        if (new Date(form.startDate) >= new Date(form.endDate)) return 'Ngày hết hạn phải sau ngày bắt đầu';
        const ul = Number(form.usageLimit);
        if (Number.isNaN(ul) || ul < 0) return 'Số lượng (usageLimit) >= 0 (0 = không giới hạn)';
        return '';
    };

    const buildPayload = () => {
        const payload = {
            code: form.code.trim(),
            type: form.type,
            value: Number(form.value),
            usageLimit: Number(form.usageLimit) || 0,
            perUserLimit: Number(form.perUserLimit) || 1,
            startDate: new Date(form.startDate).toISOString(),
            endDate: new Date(form.endDate).toISOString(),
            isActive: !!form.isActive,
        };
        if (form.minOrderValue !== '' && !Number.isNaN(Number(form.minOrderValue))) {
            payload.minOrderValue = Number(form.minOrderValue);
        }
        if (form.maxDiscountAmount !== '' && !Number.isNaN(Number(form.maxDiscountAmount))) {
            payload.maxDiscountAmount = Number(form.maxDiscountAmount);
        }
        return payload;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const err = validate();
        if (err) {
            setSubmitErr(err);
            return;
        }
        setSaving(true);
        setSubmitErr('');
        try {
            const payload = buildPayload();
            if (mode === 'create') {
                await adminService.createVoucher(payload);
            } else if (voucher?.UUID) {
                await adminService.updateVoucher(voucher.UUID, payload);
            } else {
                setSubmitErr('Thiếu UUID voucher');
                return;
            }
            onSaved?.();
            onClose();
        } catch (err) {
            setSubmitErr(err?.response?.data?.message || err?.message || 'Lưu thất bại');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div
                className="bg-[#1a0a0a] border border-white/10 rounded-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">{mode === 'create' ? 'Tạo mã giảm giá' : 'Sửa mã giảm giá'}</h3>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {submitErr && (
                        <div className="text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-lg">{submitErr}</div>
                    )}

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Mã code *</label>
                        <input
                            value={form.code}
                            onChange={(e) => setForm({ ...form, code: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 font-mono uppercase"
                            placeholder="SALE10"
                            disabled={mode === 'edit'}
                        />
                        {mode === 'edit' && <p className="text-xs text-gray-500 mt-1">Mã không đổi sau khi tạo</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Loại *</label>
                            <select
                                value={form.type}
                                onChange={(e) => setForm({ ...form, type: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2"
                            >
                                <option value="PERCENTAGE">Giảm theo %</option>
                                <option value="FIXED">Giảm cố định (VNĐ)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">
                                {form.type === 'PERCENTAGE' ? 'Phần trăm (%) *' : 'Số tiền (VNĐ) *'}
                            </label>
                            <input
                                type="number"
                                min="0"
                                step={form.type === 'PERCENTAGE' ? '1' : '1000'}
                                value={form.value}
                                onChange={(e) => setForm({ ...form, value: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Tổng số lượng mã (usageLimit)</label>
                        <input
                            type="number"
                            min="0"
                            value={form.usageLimit}
                            onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2"
                        />
                        <p className="text-xs text-gray-500 mt-1">0 = không giới hạn tổng lượt</p>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Giới hạn / user (perUserLimit)</label>
                        <input
                            type="number"
                            min="1"
                            value={form.perUserLimit}
                            onChange={(e) => setForm({ ...form, perUserLimit: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Bắt đầu *</label>
                            <input
                                type="datetime-local"
                                value={form.startDate}
                                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Hết hạn *</label>
                            <input
                                type="datetime-local"
                                value={form.endDate}
                                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Đơn tối thiểu (VNĐ)</label>
                            <input
                                type="number"
                                min="0"
                                value={form.minOrderValue}
                                onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2"
                                placeholder="Tùy chọn"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Giảm tối đa (VNĐ)</label>
                            <input
                                type="number"
                                min="0"
                                value={form.maxDiscountAmount}
                                onChange={(e) => setForm({ ...form, maxDiscountAmount: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2"
                                placeholder="Áp dụng khi %"
                            />
                        </div>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={form.isActive}
                            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                            className="rounded"
                        />
                        <span className="text-sm">Đang hoạt động</span>
                    </label>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2 border border-white/20 rounded-lg hover:bg-white/5"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 py-2 bg-red-600 hover:bg-red-500 rounded-lg font-medium flex items-center justify-center gap-2"
                        >
                            {saving ? <Loader2 className="animate-spin" size={18} /> : null}
                            {mode === 'create' ? 'Tạo mã' : 'Lưu'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
