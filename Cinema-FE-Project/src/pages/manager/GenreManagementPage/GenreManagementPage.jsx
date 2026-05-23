import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import { Hash, Plus, X, Loader2, Trash2, Edit2, Search } from 'lucide-react';
import { managerService } from '../../../services/managerService';

function getGenreDocumentId(g) {
    if (!g) return '';
    const v = g.id ?? g._id ?? g.UUID;
    return v != null && v !== '' ? String(v) : '';
}

export default function GenreManagementPage() {
    const [genres, setGenres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newGenre, setNewGenre] = useState('');

    const fetchGenres = useCallback(async () => {
        try {
            setLoading(true);
            const response = await managerService.getGenres();
            setGenres(response.data || response);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGenres();
    }, [fetchGenres]);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newGenre.trim()) return;
        try {
            await managerService.createGenre({ name: newGenre });
            Swal.fire({
                title: 'Thành công!',
                text: 'Thể loại mới đã được thêm.',
                icon: 'success',
                background: '#1a0607',
                color: '#fff',
                confirmButtonColor: '#dc2626'
            });
            setNewGenre('');
            fetchGenres();
        } catch (err) {
            console.error(err);
            Swal.fire({
                title: 'Lỗi!',
                text: err?.response?.data?.message || 'Không thể tạo thể loại.',
                icon: 'error',
                background: '#1a0607',
                color: '#fff',
                confirmButtonColor: '#dc2626'
            });
        }
    };

    const handleDelete = async (genre) => {
        const id = getGenreDocumentId(genre);
        if (!id) return;

        const result = await Swal.fire({
            title: 'Xóa thể loại này?',
            text: "Hành động này không thể hoàn tác!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#1a0607',
            confirmButtonText: 'Đồng ý xóa',
            background: '#1a0607',
            color: '#fff'
        });

        if (result.isConfirmed) {
            try {
                await managerService.deleteGenre(id);
                Swal.fire({
                    title: 'Đã xóa!',
                    text: 'Thể loại đã được loại bỏ.',
                    icon: 'success',
                    background: '#1a0607',
                    color: '#fff',
                    confirmButtonColor: '#dc2626'
                });
                fetchGenres();
            } catch (err) {
                console.error(err);
                Swal.fire({
                    title: 'Lỗi!',
                    text: 'Không thể xóa thể loại.',
                    icon: 'error',
                    background: '#1a0607',
                    color: '#fff',
                    confirmButtonColor: '#dc2626'
                });
            }
        }
    };

    return (
        <div className="space-y-8 pb-10 max-w-4xl">
            <div>
                <h2 className="text-3xl font-bold">Quản lý Thể loại</h2>
                <p className="text-gray-400 mt-1">Quản lý các danh mục thể loại dùng để phân loại phim.</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full -mr-16 -mt-16 blur-2xl" />

                <form onSubmit={handleAdd} className="flex gap-4 mb-10 relative z-10">
                    <div className="relative flex-1">
                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            value={newGenre}
                            onChange={(e) => setNewGenre(e.target.value)}
                            placeholder="VD: Hành động, Kinh dị..."
                            className="w-full bg-[#140405] border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-red-600 transition-all font-medium text-white"
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-red-600/20 active:scale-95 flex items-center gap-2"
                    >
                        <Plus size={20} /> Thêm Thể loại
                    </button>
                </form>

                {loading ? (
                    <div className="flex justify-center p-10"><Loader2 className="animate-spin text-red-600" size={32} /></div>
                ) : (
                    <div className="flex flex-wrap gap-3">
                        <AnimatePresence>
                            {genres.map((genre) => (
                                <motion.div
                                    key={getGenreDocumentId(genre)}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="group bg-white/5 border border-white/10 hover:border-red-600/50 hover:bg-red-600/5 px-4 py-2 rounded-xl flex items-center gap-3 transition-all cursor-default"
                                >
                                    <span className="text-sm font-bold text-gray-300 group-hover:text-white">
                                        {genre.name}
                                    </span>
                                    <button
                                        onClick={() => handleDelete(genre)}
                                        className="p-1 text-gray-600 hover:text-red-500 transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500 font-black text-xs">OK</div>
                    <div>
                        <p className="font-bold text-sm text-white">Hệ thống ổn định</p>
                        <p className="text-xs text-gray-500">Công cụ tự động gắn thẻ đang hoạt động.</p>
                    </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex items-center gap-4 text-white">
                    <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 font-black text-xs">!</div>
                    <div>
                        <p className="font-bold text-sm">Gợi ý kiểm tra</p>
                        <p className="text-xs text-gray-500">Có một số thể loại chưa được gán cho phim nào.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
