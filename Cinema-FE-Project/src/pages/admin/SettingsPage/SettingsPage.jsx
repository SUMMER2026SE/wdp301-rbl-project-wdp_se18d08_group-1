import React, { useEffect, useState } from 'react';
import { Settings, Loader2, Save } from 'lucide-react';
import { adminService } from '../../../services/adminService';

const DEFAULT_KEYS = [
    { key: 'EMAIL_SERVER', label: 'Email Server', placeholder: 'smtp.gmail.com' },
    { key: 'LOGO_URL', label: 'Logo Web', placeholder: 'https://...' },
    { key: 'FOOTER_TEXT', label: 'Thông tin chân trang', placeholder: '© 2026 My Cinema' },
    { key: 'MAINTENANCE_MODE', label: 'Bảo trì hệ thống', placeholder: 'off | on' },
];

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({});
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetch = async () => {
            try {
                setLoading(true);
                const res = await adminService.getSystemSettings();
                setForm(res?.data || {});
            } catch (err) {
                setError('Không tải được cấu hình');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            await adminService.updateSystemSettings(form);
            setError(null);
        } catch (err) {
            setError(err?.response?.data?.message || 'Lưu thất bại');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-red-600" size={40} />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h2 className="text-2xl font-bold">Cấu hình Hệ thống</h2>
                <p className="text-gray-400 text-sm mt-1">Email server, Logo web, thông tin chân trang, bảo trì hệ thống.</p>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSave} className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">
                {DEFAULT_KEYS.map(({ key, label, placeholder }) => (
                    <div key={key}>
                        <label className="block text-sm text-gray-400 mb-2">{label}</label>
                        <input
                            value={form[key] ?? ''}
                            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-red-600"
                            placeholder={placeholder}
                        />
                    </div>
                ))}
                <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 rounded-lg font-medium"
                >
                    {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    Lưu cấu hình
                </button>
            </form>
        </div>
    );
}
