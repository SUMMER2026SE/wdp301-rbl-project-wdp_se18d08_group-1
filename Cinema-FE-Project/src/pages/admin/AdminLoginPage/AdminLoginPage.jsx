import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Loader2 } from 'lucide-react';
import apiClient from '../../../api/apiClient';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!email || !password) {
            setError('Vui lòng nhập email và mật khẩu');
            return;
        }
        try {
            setLoading(true);
            const res = await apiClient.post('/auth/login', { email, password });
            // apiClient đã trả về response.data (ApiResponse)
            const apiData = res || {};
            if (!apiData.success) {
                setError(apiData.message || 'Đăng nhập thất bại');
                return;
            }

            const { user, token } = apiData.data || {};
            if (user?.role !== 'admin') {
                setError('Chỉ tài khoản Super Admin mới được đăng nhập');
                return;
            }

            localStorage.setItem('token', token);
            navigate('/admin/dashboard', { replace: true });
        } catch (err) {
            setError(err?.response?.data?.message || 'Đăng nhập thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#140405] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-gradient-to-tr from-amber-600 to-amber-400 rounded-xl flex items-center justify-center">
                        <Shield className="text-white" size={28} />
                    </div>
                    <h1 className="text-2xl font-bold">Super Admin</h1>
                </div>

                <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">
                    <h2 className="text-xl font-bold text-center">Đăng nhập</h2>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-red-600"
                            placeholder="admin@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Mật khẩu</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-red-600"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-red-600 hover:bg-red-500 disabled:opacity-50 rounded-lg font-medium flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : null}
                        Đăng nhập
                    </button>
                </form>

                <p className="text-center text-gray-500 text-sm mt-6">
                    Chỉ tài khoản có vai trò Admin mới truy cập được.
                </p>
            </div>
        </div>
    );
 }
