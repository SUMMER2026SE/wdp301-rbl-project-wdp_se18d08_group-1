import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import {
    Clapperboard,
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    Loader2,
    Edit2,
    Trash2,
    X,
    PlusCircle,
    FileImage,
    Calendar,
    Video
} from 'lucide-react';
import { managerService } from '../../../services/managerService';

/** BE (Mongoose) trả về _id / UUID, thường không có id → tránh gọi API .../undefined/... */
function getMovieDocumentId(movie) {
    if (!movie) return '';
    const v = movie.id ?? movie._id ?? movie.UUID;
    return v != null && v !== '' ? String(v) : '';
}

function getGenreDocumentId(g) {
    if (!g) return '';
    const v = g.id ?? g._id ?? g.UUID;
    return v != null && v !== '' ? String(v) : '';
}

const GenreMultiSelect = ({ genres, selectedIds, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedGenres = genres.filter(g => selectedIds.includes(getGenreDocumentId(g)));

    const toggleGenre = (genreId) => {
        const newSelected = selectedIds.includes(genreId)
            ? selectedIds.filter(id => id !== genreId)
            : [...selectedIds, genreId];
        onChange(newSelected);
    };

    return (
        <div className="relative">
            <label className="text-sm text-gray-400 font-medium mb-2 block">Thể loại (Genres)</label>
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className="min-h-[52px] w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 cursor-pointer flex flex-wrap gap-2 hover:border-red-600/50 transition-all items-center"
            >
                {selectedGenres.length === 0 ? (
                    <span className="text-gray-500 text-sm ml-1">Select genres...</span>
                ) : (
                    selectedGenres.map(g => {
                        const gid = getGenreDocumentId(g);
                        return (
                            <span 
                                key={gid} 
                                className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg shadow-red-600/20"
                            >
                                {g.name}
                                <X 
                                    size={14} 
                                    className="cursor-pointer hover:text-gray-200" 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleGenre(gid);
                                    }}
                                />
                            </span>
                        );
                    })
                )}
            </div>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute z-20 top-full left-0 right-0 mt-2 bg-[#1a0607] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto no-scrollbar"
                        >
                            {genres.length === 0 ? (
                                <div className="p-4 text-center text-gray-500 text-sm">No genres available</div>
                            ) : (
                                genres.map(g => {
                                    const gid = getGenreDocumentId(g);
                                    const isSelected = selectedIds.includes(gid);
                                    return (
                                        <div 
                                            key={gid}
                                            onClick={() => toggleGenre(gid)}
                                            className={`p-4 cursor-pointer flex items-center justify-between hover:bg-white/5 transition-colors ${isSelected ? 'bg-red-600/10' : ''}`}
                                        >
                                            <span className={`text-sm ${isSelected ? 'text-red-500 font-bold' : 'text-gray-300'}`}>{g.name}</span>
                                            {isSelected && <PlusCircle size={16} className="text-red-500 rotate-45" />}
                                        </div>
                                    );
                                })
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

const MovieModal = ({ isOpen, onClose, movie = null, onSave }) => {
    const [genres, setGenres] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        duration: '',
        genreIds: [],
        status: 'Now Showing',
        description: '',
        releaseDate: new Date().toISOString().split('T')[0],
        posterUrl: '',
        trailerUrl: ''
    });

    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const res = await managerService.getGenres();
                setGenres(res.data || res);
            } catch (err) { console.error(err); }
        };
        fetchGenres();
    }, []);

    useEffect(() => {
        if (movie) {
            setFormData({
                title: movie.title || '',
                duration: movie.duration || '',
                genreIds: movie.genres ? movie.genres.map(g => getGenreDocumentId(g)).filter(Boolean) : [],
                status: movie.status || 'Now Showing',
                description: movie.description || '',
                releaseDate: movie.releaseDate ? new Date(movie.releaseDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                posterUrl: movie.posterUrl || '',
                trailerUrl: movie.trailerUrl || ''
            });
        }
    }, [movie]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...formData,
            duration: Number(formData.duration),
            genreIds: formData.genreIds.map(String),
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#0a0203]/90 backdrop-blur-md"
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-[#1a0607] border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl"
            >
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                    <h3 className="text-xl font-bold text-white">{movie ? 'Chi tiết Phim' : 'Thêm Phim mới'}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form className="p-8 space-y-6 max-h-[80vh] overflow-y-auto no-scrollbar" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400 font-medium">Tên Phim</label>
                            <input
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="VD: Avatar: The Way of Water"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-red-600 transition-all text-white"
                                required
                            />
                        </div>
                        <div className="space-y-2 relative">
                            <label className="text-sm text-gray-400 font-medium">Trạng thái</label>
                            <div className="relative">
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-red-600 appearance-none text-white [&>option]:text-gray-900 cursor-pointer"
                                >
                                    <option value="Now Showing">Now Showing</option>
                                    <option value="Coming Soon">Coming Soon</option>
                                    <option value="Stopped">Stopped</option>
                                </select>
                                <MoreHorizontal size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none rotate-90" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400 font-medium">Thời lượng (phút)</label>
                            <input
                                type="number"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                placeholder="120"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-red-600 transition-all text-white"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400 font-medium">Ngày khởi chiếu</label>
                            <input
                                type="date"
                                value={formData.releaseDate}
                                onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-red-600 transition-all text-white"
                                required
                            />
                        </div>
                    </div>

                    <GenreMultiSelect 
                        genres={genres} 
                        selectedIds={formData.genreIds}
                        onChange={(ids) => setFormData({ ...formData, genreIds: ids })}
                    />

                    <div className="space-y-2">
                        <label className="text-sm text-gray-400 font-medium">Mô tả Phim</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            placeholder="Tóm tắt nội dung phim..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-red-600 transition-all resize-none text-white"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400 font-medium">Poster Upload</label>
                            <div className="flex gap-4 items-center">
                                {formData.posterUrl && (
                                    <img src={formData.posterUrl} className="h-12 w-10 object-cover rounded-md border border-white/10" alt="Preview" />
                                )}
                                <label className="flex-1 cursor-pointer">
                                    <div className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 hover:bg-white/10 transition-all text-center">
                                        <span className="text-xs text-red-500 font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                                            <FileImage size={16}/> Choose file
                                        </span>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setFormData({ ...formData, posterUrl: reader.result });
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400 font-medium">Trailer URL (Youtube)</label>
                            <input
                                value={formData.trailerUrl}
                                onChange={(e) => setFormData({ ...formData, trailerUrl: e.target.value })}
                                placeholder="https://youtube.com/watch?v=..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-red-600 transition-all text-white"
                            />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/10 flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-bold transition-all text-white active:scale-95"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold shadow-lg shadow-red-600/20 transition-all active:scale-95"
                        >
                            {movie ? 'Lưu Thay đổi' : 'Thêm Phim'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default function MovieManagementPage() {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [sortBy, setSortBy] = useState('newest');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMovie, setEditingMovie] = useState(null);

    const fetchMovies = useCallback(async () => {
        try {
            setLoading(true);
            const response = await managerService.getMovies();
            setMovies(response.data || response);
        } catch (err) {
            console.error('Failed to fetch movies:', err);
            setMovies([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMovies();
    }, [fetchMovies]);

    const handleCreate = () => {
        setEditingMovie(null);
        setIsModalOpen(true);
    };

    const handleEdit = (movie) => {
        setEditingMovie(movie);
        setIsModalOpen(true);
    };

    const handleSave = async (data) => {
        try {
            if (editingMovie) {
                await managerService.updateMovie(getMovieDocumentId(editingMovie), data);
                Swal.fire({
                    title: 'Đã cập nhật!',
                    text: 'Thông tin phim đã được lưu.',
                    icon: 'success',
                    background: '#1a0607',
                    color: '#fff',
                    confirmButtonColor: '#dc2626'
                });
            } else {
                await managerService.createMovie(data);
                Swal.fire({
                    title: 'Thành công!',
                    text: 'Phim mới đã được thêm vào danh sách.',
                    icon: 'success',
                    background: '#1a0607',
                    color: '#fff',
                    confirmButtonColor: '#dc2626'
                });
            }
            setIsModalOpen(false);
            fetchMovies();
        } catch (err) {
            console.error('Save failed:', err);
            Swal.fire({
                title: 'Lỗi!',
                text: err?.response?.data?.message || 'Không thể lưu dữ liệu phim.',
                icon: 'error',
                background: '#1a0607',
                color: '#fff',
                confirmButtonColor: '#dc2626'
            });
        }
    };

    const handleDelete = async (movie) => {
        const id = getMovieDocumentId(movie);
        if (!id) return;

        const result = await Swal.fire({
            title: 'Xóa phim này?',
            text: "Các lịch chiếu liên quan cũng sẽ bị ảnh hưởng.",
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
                await managerService.deleteMovie(id);
                Swal.fire({
                    title: 'Đã xóa!',
                    text: 'Phim đã được loại bỏ.',
                    icon: 'success',
                    background: '#1a0607',
                    color: '#fff',
                    confirmButtonColor: '#dc2626'
                });
                fetchMovies();
            } catch (err) {
                console.error('Delete failed:', err);
                Swal.fire({
                    title: 'Lỗi!',
                    text: 'Không thể xóa phim.',
                    icon: 'error',
                    background: '#1a0607',
                    color: '#fff',
                    confirmButtonColor: '#dc2626'
                });
            }
        }
    };

    const handleTrailer = async (movie) => {
        const { value: url } = await Swal.fire({
            title: 'Thêm Trailer',
            text: `Phim: ${movie.title}`,
            input: 'url',
            inputLabel: 'Link YouTube Trailer',
            inputPlaceholder: 'https://www.youtube.com/watch?v=...',
            inputValue: movie.trailerUrl || '',
            background: '#1a0607',
            color: '#fff',
            confirmButtonColor: '#dc2626',
            showCancelButton: true,
            cancelButtonText: 'Hủy',
            preConfirm: (val) => {
                if (!val || !val.trim()) {
                    Swal.showValidationMessage('Vui lòng nhập link trailer');
                    return false;
                }
                return val.trim();
            },
        });
        if (!url) return;
        const movieId = getMovieDocumentId(movie);
        try {
            await managerService.updateTrailer(movieId, url);
            Swal.fire({
                title: 'Đã cập nhật!',
                text: 'Link trailer đã được lưu.',
                icon: 'success',
                background: '#1a0607',
                color: '#fff',
                confirmButtonColor: '#dc2626',
            });
            fetchMovies();
        } catch (err) {
            Swal.fire({
                title: 'Lỗi!',
                text: err?.response?.data?.message || 'Không cập nhật được trailer.',
                icon: 'error',
                background: '#1a0607',
                color: '#fff',
                confirmButtonColor: '#dc2626',
            });
        }
    };

    const filteredMovies = Array.isArray(movies) 
        ? movies
            .filter(m => {
                const search = searchTerm.toLowerCase();
                const genresText = m.genres?.map(g => g.name).join(', ') || m.genre || '';
                const titleMatch = String(m.title).toLowerCase().includes(search);
                const genreMatch = genresText.toLowerCase().includes(search);
                const statusMatch = statusFilter === 'All' || m.status === statusFilter;
                
                return (titleMatch || genreMatch) && statusMatch;
            })
            .sort((a, b) => {
                if (sortBy === 'newest') {
                    const tb = new Date(b.createdAt || b.updatedAt || 0).getTime();
                    const ta = new Date(a.createdAt || a.updatedAt || 0).getTime();
                    return tb - ta;
                }
                if (sortBy === 'oldest') {
                    const tb = new Date(b.createdAt || b.updatedAt || 0).getTime();
                    const ta = new Date(a.createdAt || a.updatedAt || 0).getTime();
                    return ta - tb;
                }
                if (sortBy === 'title-asc') return String(a.title).localeCompare(String(b.title));
                if (sortBy === 'title-desc') return String(b.title).localeCompare(String(a.title));
                return 0;
            })
        : [];

    return (
        <div className="space-y-8 pb-10">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold">Quản lý Phim</h2>
                    <p className="text-gray-400 mt-1">Thêm, sửa và điều chỉnh danh sách phim toàn hệ thống.</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-red-600/20 active:scale-95 group"
                >
                    <PlusCircle size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                    <span>Thêm Phim mới</span>
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm phim theo tên, thể loại..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:border-red-600 text-white"
                    />
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-2 hover:bg-white/10 transition-all">
                        <Filter size={16} className="text-gray-500" />
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-transparent text-sm text-white focus:outline-none cursor-pointer [&>option]:text-gray-900"
                        >
                            <option value="All">Tất cả trạng thái</option>
                            <option value="Now Showing">Now Showing</option>
                            <option value="Coming Soon">Coming Soon</option>
                            <option value="Stopped">Stopped</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-2 hover:bg-white/10 transition-all">
                        <select 
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-transparent text-sm text-white focus:outline-none cursor-pointer [&>option]:text-gray-900"
                        >
                            <option value="newest">Mới nhất</option>
                            <option value="oldest">Cũ nhất</option>
                            <option value="title-asc">Tên (A-Z)</option>
                            <option value="title-desc">Tên (Z-A)</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm shadow-xl">
                {loading ? (
                    <div className="p-20 flex flex-col items-center justify-center space-y-4">
                        <Loader2 className="animate-spin text-red-600" size={40} />
                        <p className="text-gray-500 font-medium">Đang tải dữ liệu...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-gray-400 text-xs uppercase tracking-widest border-b border-white/10 bg-white/[0.02]">
                                    <th className="px-8 py-5 font-semibold">Thông tin Phim</th>
                                    <th className="px-8 py-5 font-semibold">Thời lượng</th>
                                    <th className="px-8 py-5 font-semibold">Thể loại</th>
                                    <th className="px-8 py-5 font-semibold">Trạng thái</th>
                                    <th className="px-8 py-5 font-semibold text-center">Trailer</th>
                                    <th className="px-8 py-5 font-semibold">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredMovies.map((movie, i) => (
                                    <tr key={getMovieDocumentId(movie) || i} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-20 bg-gradient-to-tr from-gray-800 to-gray-700 rounded-xl flex items-center justify-center overflow-hidden border border-white/5 group-hover:border-red-600/30 transition-all shadow-lg">
                                                    {movie.posterUrl || movie.poster ? (
                                                        <img src={movie.posterUrl || movie.poster} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Clapperboard className="text-gray-600" size={24} />
                                                    )}
                                                </div>
                                                <div>
                                                    <span className="font-bold text-lg block group-hover:text-red-500 transition-colors">
                                                        {movie.title}
                                                    </span>
                                                    <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                        <Calendar size={12} /> {movie.releaseDate ? new Date(movie.releaseDate).toLocaleDateString() : 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-gray-400 font-medium">
                                            {movie.duration} phút
                                        </td>
                                        <td className="px-8 py-5 text-gray-400 font-medium">
                                            <div className="flex gap-2 flex-wrap">
                                                {movie.genres?.length
                                                    ? movie.genres.map((g, idx) => (
                                                        <span key={getGenreDocumentId(g) || idx} className="bg-white/5 border border-white/5 px-2 py-0.5 rounded text-[10px]">{g.name}</span>
                                                    ))
                                                    : (movie.genre || '').split(',').filter(Boolean).map((g, idx) => (
                                                        <span key={idx} className="bg-white/5 border border-white/5 px-2 py-0.5 rounded text-[10px]">{g.trim()}</span>
                                                    ))}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${movie.status === 'Now Showing' ? 'bg-green-500/10 text-green-500' :
                                                movie.status === 'Coming Soon' ? 'bg-blue-500/10 text-blue-500' :
                                                    'bg-red-500/10 text-red-500'
                                                }`}>
                                                {movie.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            {movie.trailerUrl ? (
                                                <span className="text-green-400 text-xs font-medium px-2 py-1 bg-green-500/10 rounded-full">
                                                    ✓ Có
                                                </span>
                                            ) : (
                                                <span className="text-gray-500 text-xs font-medium px-2 py-1 bg-white/5 rounded-full">
                                                    Chưa có
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleTrailer(movie)}
                                                    title="Thêm / sửa Trailer"
                                                    className="p-2 hover:bg-purple-500/10 rounded-lg text-gray-400 hover:text-purple-400 transition-all outline-none"
                                                >
                                                    <Video size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(movie)}
                                                    className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all outline-none"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(movie)}
                                                    className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-500 transition-all outline-none"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <MovieModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        movie={editingMovie}
                        onSave={handleSave}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}