import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import {
    Armchair,
    Plus,
    Loader2,
    Grid3X3,
    X,
    Layout,
    Save,
    Trash2,
    Edit2,
    Search,
    Monitor,
    RotateCcw,
    Type
} from 'lucide-react';
import { managerService } from '../../../services/managerService';

const getHallId = (h) => h?.UUID || h?._id || h?.id || "";

const SeatLayoutModal = ({ isOpen, onClose, hall }) => {
    const hallId = getHallId(hall);
    const [rows, setRows] = useState(10);
    const [cols, setCols] = useState(12);
    const [grid, setGrid] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedType, setSelectedType] = useState('NORMAL');
    const [saving, setSaving] = useState(false);
    const [scale, setScale] = useState(0.8);
    const gridRef = useRef(null);

    const [rowMode, setRowMode] = useState(false);

    useEffect(() => {
        const fetchLayout = async () => {
            if (!hallId) return;
            try {
                setLoading(true);
                const response = await managerService.getSeatLayout(hallId);
                const payload = response.data || response || {};

                const newGrid = {};
                let maxR = 10;
                let maxC = 12;

                // Handle nested matrix structure (from newest BE updates)
                if (Array.isArray(payload.matrix)) {
                    payload.matrix.forEach(rowItem => {
                        const r = Number(rowItem.row || 0);
                        maxR = Math.max(maxR, r);
                        (rowItem.seats || []).forEach(s => {
                            const c = Number(s.col || 0);
                            maxC = Math.max(maxC, c);
                            newGrid[`${r}-${c}`] = s.type || 'NORMAL';
                        });
                    });
                } 
                // Handle flat seats array (legacy)
                else {
                    const actualSeatsArr = payload.seats || (payload.data && payload.data.seats) || [];
                    if (Array.isArray(actualSeatsArr)) {
                        actualSeatsArr.forEach(s => {
                            const r = parseInt(s.row, 10);
                            const c = parseInt(s.col, 10);
                            if (!isNaN(r) && !isNaN(c)) {
                                newGrid[`${r}-${c}`] = s.type || 'NORMAL';
                                if (r > maxR) maxR = r;
                                if (c > maxC) maxC = c;
                            }
                        });
                    }
                }

                setGrid(newGrid);
                setRows(maxR || 10);
                setCols(maxC || 12);
            } catch (err) {
                console.error("fetchLayout failure:", err);
                setGrid({});
            } finally {
                setLoading(false);
            }
        };
        if (isOpen) fetchLayout();
    }, [isOpen, hallId]);

    if (!isOpen || !hall) return null;

    const getSeatColor = (type) => {
        switch (type) {
            case 'NORMAL': return 'bg-white/10 border-white/20 text-gray-400';
            case 'VIP': return 'bg-amber-500 border-amber-400 text-white shadow-lg shadow-amber-500/20';
            case 'COUPLE': return 'bg-pink-600 border-pink-500 text-white shadow-lg shadow-pink-600/20';
            default: return 'bg-transparent border-white/5 text-gray-800';
        }
    };

    const toggleSeat = (r, c) => {
        if (rowMode) {
            toggleRow(r);
            return;
        }
        const key = `${r}-${c}`;
        const newGrid = { ...grid };
        if (newGrid[key]) {
            delete newGrid[key];
        } else {
            newGrid[key] = selectedType;
        }
        setGrid(newGrid);
    };

    const toggleRow = (r) => {
        const newGrid = { ...grid };
        const rowKeys = Object.keys(newGrid).filter(k => k.split('-')[0] === String(r));

        if (rowKeys.length > 0) {
            for (let c = 1; c <= cols; c++) {
                delete newGrid[`${r}-${c}`];
            }
        } else {
            for (let c = 1; c <= cols; c++) {
                newGrid[`${r}-${c}`] = selectedType;
            }
        }
        setGrid(newGrid);
    };

    const zoomIn = () => setScale(prev => Math.min(prev + 0.1, 2));
    const zoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.3));
    const resetZoom = () => setScale(0.8);

    const handleSave = async () => {
        setSaving(true);
        try {
            const seats = Object.entries(grid).map(([key, type]) => {
                const [r, c] = key.split('-').map(Number);
                return { row: r, col: c, type };
            });
            await managerService.setSeatLayout(hallId, { seats });
            Swal.fire({
                title: 'Thành công!',
                text: 'Đã cập nhật sơ đồ ghế.',
                icon: 'success',
                background: '#1a0607',
                color: '#fff',
                confirmButtonColor: '#dc2626'
            });
            onClose();
        } catch (err) {
            Swal.fire({
                title: 'Lỗi!',
                text: 'Không thể lưu sơ đồ ghế.',
                icon: 'error',
                background: '#1a0607',
                color: '#fff',
                confirmButtonColor: '#dc2626'
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed inset-y-0 right-0 w-full max-w-5xl bg-[#0a0203] border-l border-white/10 z-[70] shadow-2xl flex flex-col"
        >
            <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                <div>
                    <h3 className="text-2xl font-bold text-white">
                        {hall.name} - Sơ đồ ghế
                    </h3>
                    <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 font-bold uppercase">Hàng:</span>
                            <input type="number" value={rows} onChange={e => setRows(Math.max(1, parseInt(e.target.value) || 1))} className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:border-red-600 outline-none" />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 font-bold uppercase">Cột:</span>
                            <input type="number" value={cols} onChange={e => setCols(Math.max(1, parseInt(e.target.value) || 1))} className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:border-red-600 outline-none" />
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-full transition-colors text-white">
                    <X size={24} />
                </button>
            </div>

            <div className="flex-1 overflow-hidden relative bg-[#050505] custom-scrollbar border-y border-white/5">
                {loading ? (
                    <div className="h-full flex items-center justify-center">
                        <Loader2 className="animate-spin text-red-600" size={40} />
                    </div>
                ) : (
                    <div ref={gridRef} className="w-full h-full relative cursor-grab active:cursor-grabbing flex items-center justify-center overflow-hidden">
                        <div className="absolute right-8 top-8 z-[80] flex flex-col gap-2 bg-[#1a0607]/90 backdrop-blur-xl p-2 rounded-2xl border border-white/10 shadow-2xl">
                            <button onClick={zoomIn} title="Phóng to" className="p-2.5 hover:bg-white/10 rounded-xl transition-colors text-white border border-white/5"><Plus size={18}/></button>
                            <button onClick={zoomOut} title="Thu nhỏ" className="p-2.5 hover:bg-white/10 rounded-xl transition-colors text-white border border-white/5"><X size={18}/></button>
                            <button onClick={resetZoom} title="Mặc định" className="p-2.5 hover:bg-white/10 rounded-xl transition-colors text-white border border-white/5"><RotateCcw size={18}/></button>
                        </div>

                        <motion.div 
                            drag
                            dragConstraints={gridRef}
                            animate={{ scale }}
                            initial={{ scale: 0.8 }}
                            className="p-32 flex flex-col items-center origin-center"
                        >
                            <div className="w-full max-w-2xl h-8 bg-gradient-to-b from-red-600/20 to-transparent rounded-lg mb-20 relative flex items-center justify-center border-t border-red-600/30">
                                <p className="text-[10px] uppercase font-black tracking-[1em] text-red-500 flex items-center gap-2"><Monitor size={12}/> Màn Hình</p>
                            </div>

                            <div className="flex flex-col gap-3 min-w-max pb-10">
                                {Array.from({ length: rows }).map((_, r) => {
                                    const rowLabel = String.fromCharCode(65 + r);
                                    return (
                                    <div key={r} className="flex gap-4 items-center group/row">
                                        <button 
                                            type="button"
                                            onClick={() => toggleRow(r + 1)}
                                            title={`Chọn cả hàng ${rowLabel}`}
                                            className="w-10 h-10 flex items-center justify-center text-xs font-black text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all uppercase"
                                        >
                                            {rowLabel}
                                        </button>
                                        <div className="flex gap-2">
                                            {Array.from({ length: cols }).map((_, c) => {
                                                const rowNum = r + 1;
                                                const colNum = c + 1;
                                                const type = grid[`${rowNum}-${colNum}`];
                                                return (
                                                    <button
                                                        key={c}
                                                        type="button"
                                                        onClick={() => toggleSeat(rowNum, colNum)}
                                                        className={`w-9 h-9 rounded-xl border transition-all duration-200 flex items-center justify-center group ${getSeatColor(type)} hover:scale-110 active:scale-90 ${rowMode ? 'hover:bg-red-500/20' : ''}`}
                                                        title={`${rowLabel}${colNum}${rowMode ? ' (Click to toggle row)' : ''}`}
                                                    >
                                                        <Armchair size={14} className="group-hover:rotate-12 transition-transform" />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <span className="w-10 text-xs font-black text-gray-600 uppercase text-center opacity-40">{rowLabel}</span>
                                    </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>

            <div className="p-8 bg-white/[0.02] border-t border-white/10 shrink-0">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex gap-4">
                        {[
                            { id: 'NORMAL', label: 'Thường', color: 'bg-white/10', border: 'border-white/20' },
                            { id: 'VIP', label: 'VIP', color: 'bg-amber-500', border: 'border-amber-400' },
                            { id: 'COUPLE', label: 'Đôi', color: 'bg-pink-600', border: 'border-pink-500' },
                        ].map(t => (
                            <button
                                key={t.id}
                                onClick={() => setSelectedType(t.id)}
                                className={`flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all ${selectedType === t.id ? 'bg-red-600/10 border-red-600 text-white' : 'bg-transparent border-white/5 text-gray-500 hover:bg-white/5'}`}
                            >
                                <div className={`w-4 h-4 rounded-lg ${t.color} ${t.border} border shadow-inner`} />
                                <span className="text-xs font-black uppercase tracking-widest">{t.label}</span>
                            </button>
                        ))}
                    </div>
                    <div className="text-xs text-gray-400 font-bold flex items-center gap-6">
                        <button 
                            onClick={() => setRowMode(!rowMode)}
                            className={`flex items-center gap-2 px-4 py-2 border rounded-xl transition-all ${rowMode ? 'bg-red-600 border-red-500 text-white' : 'bg-white/5 border-white/10 text-gray-500'}`}
                        >
                            <Layout size={14} /> Chế độ chọn cả hàng: {rowMode ? 'BẬT' : 'TẮT'}
                        </button>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setGrid({})}
                        className="flex-1 py-5 bg-white/5 hover:bg-red-500/10 hover:text-red-500 rounded-3xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 text-gray-500 border border-white/5"
                    >
                        <Trash2 size={20} /> Xóa sơ đồ
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-[2] py-5 bg-red-600 hover:bg-red-700 text-white rounded-3xl font-black uppercase tracking-[0.2em] shadow-xl shadow-red-600/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
                    >
                        {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        Lưu ({Object.keys(grid).length} ghế)
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

const HallModal = ({ isOpen, onClose, hall = null, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        type: 'Standard',
        capacity: 0,
    });

    useEffect(() => {
        if (hall) {
            setFormData({
                name: hall.name || '',
                type: hall.type || 'Standard',
                capacity: hall.capacity || 0,
            });
        }
    }, [hall]);

    if (!isOpen) return null;

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
                className="bg-[#1a0607] border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                    <h3 className="text-xl font-bold text-white">{hall ? 'Cập nhật Phòng chiếu' : 'Thêm Phòng chiếu mới'}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form className="p-8 space-y-6" onSubmit={(e) => {
                    e.preventDefault();
                    onSave(formData);
                }}>
                    <div className="space-y-2">
                        <label className="text-sm text-gray-400 font-medium">Tên Phòng</label>
                        <input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="VD: Cinema 01"
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-red-600 transition-all text-white"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400 font-medium">Loại Phòng</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-red-600 text-white cursor-pointer select-none [&>option]:text-black"
                            >
                                <option value="Standard">Standard</option>
                                <option value="IMAX">IMAX</option>
                                <option value="Gold Class">Gold Class</option>
                                <option value="4DX">4DX</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400 font-medium">Sức chứa (Ghế)</label>
                            <input
                                type="number"
                                value={formData.capacity}
                                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                                placeholder="0"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-red-600 transition-all text-white"
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/10 flex gap-4">
                        <button type="button" onClick={onClose} className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-bold transition-all">Hủy</button>
                        <button type="submit" className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold shadow-lg shadow-red-600/20 transition-all">
                            {hall ? 'Lưu Thay đổi' : 'Tạo Phòng'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default function HallManagementPage() {
    const [halls, setHalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLayoutOpen, setIsLayoutOpen] = useState(false);
    const [editingHall, setEditingHall] = useState(null);
    const [selectedHall, setSelectedHall] = useState(null);

    const fetchHalls = useCallback(async () => {
        try {
            setLoading(true);
            const response = await managerService.getHalls();
            setHalls(response.data || response);
        } catch (err) {
            console.error(err);
            setHalls([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHalls();
    }, [fetchHalls]);

    const handleCreate = () => {
        setEditingHall(null);
        setIsModalOpen(true);
    };

    const handleEdit = (hall) => {
        setEditingHall(hall);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!id) return;
        const result = await Swal.fire({
            title: 'Xóa phòng chiếu?',
            text: "Hành động này không thể hoàn tác!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#1a0607',
            confirmButtonText: 'Xóa ngay',
            background: '#1a0607',
            color: '#fff'
        });

        if (result.isConfirmed) {
            try {
                await managerService.deleteHall(id);
                Swal.fire({
                    title: 'Đã xóa!',
                    text: 'Phòng chiếu đã được loại bỏ.',
                    icon: 'success',
                    background: '#1a0607',
                    color: '#fff',
                    confirmButtonColor: '#dc2626'
                });
                fetchHalls();
            } catch (err) {
                console.error(err);
                Swal.fire({
                    title: 'Lỗi!',
                    text: 'Không thể xóa phòng chiếu.',
                    icon: 'error',
                    background: '#1a0607',
                    color: '#fff',
                    confirmButtonColor: '#dc2626'
                });
            }
        }
    };

    const handleSave = async (data) => {
        try {
            if (editingHall) {
                await managerService.updateHall(getHallId(editingHall), data);
            } else {
                await managerService.createHall(data);
            }
            setIsModalOpen(false);
            fetchHalls();
            Swal.fire({
                title: 'Thành công!',
                text: 'Thông tin phòng chiếu đã được cập nhật.',
                icon: 'success',
                background: '#1a0607',
                color: '#fff',
                confirmButtonColor: '#dc2626'
            });
        } catch (err) {
            console.error(err);
            Swal.fire({
                title: 'Lỗi!',
                text: 'Có lỗi xảy ra khi lưu.',
                icon: 'error',
                background: '#1a0607',
                color: '#fff',
                confirmButtonColor: '#dc2626'
            });
        }
    };

    const filteredHalls = Array.isArray(halls) ? halls.filter(h =>
        h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.type.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    return (
        <div className="space-y-8 pb-10 text-white">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight">Cấu hình Phòng chiếu</h2>
                    <p className="text-gray-400 mt-1">Quản lý không gian, sơ đồ ghế và loại phòng chiếu.</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-red-600/20 active:scale-95 group"
                >
                    <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                    <span>Thêm Phòng mới</span>
                </button>
            </div>

            <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input
                    type="text"
                    placeholder="Tìm kiếm theo tên hoặc loại phòng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-3xl py-4 pl-14 pr-6 focus:outline-none focus:border-red-600/50 transition-all font-medium text-lg"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-64 bg-white/5 border border-white/10 rounded-3xl animate-pulse" />
                        ))
                    ) : filteredHalls.map((hall) => (
                        <motion.div
                            key={getHallId(hall)}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-[#1a0607] border border-white/10 rounded-[2rem] p-8 hover:border-red-600/30 transition-all group relative overflow-hidden flex flex-col justify-between"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Grid3X3 size={100} />
                            </div>

                            <div className="relative">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-4 bg-red-600/10 rounded-2xl text-red-600">
                                        <Layout size={28} />
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEdit(hall)} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"><Edit2 size={16} /></button>
                                        <button onClick={() => handleDelete(getHallId(hall))} className="p-3 bg-white/5 hover:bg-red-600/10 text-gray-400 hover:text-red-500 rounded-xl transition-colors"><Trash2 size={16} /></button>
                                    </div>
                                </div>

                                <h3 className="text-2xl font-black mb-2 uppercase tracking-wide group-hover:text-red-500 transition-colors">{hall.name}</h3>
                                <div className="flex gap-3 mb-8">
                                    <span className="px-3 py-1 bg-red-600 text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-red-600/20">{hall.type}</span>
                                    <span className="px-3 py-1 bg-white/5 text-[10px] font-black uppercase tracking-widest rounded-lg text-gray-400 border border-white/5">{hall.capacity} Ghế</span>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    setSelectedHall(hall);
                                    setIsLayoutOpen(true);
                                }}
                                className="w-full py-4 bg-white/5 hover:bg-red-600 text-white rounded-2xl font-bold transition-all border border-white/10 hover:border-red-600 flex items-center justify-center gap-2 group/btn active:scale-95"
                            >
                                <Armchair size={18} className="group-hover/btn:rotate-12 transition-transform" />
                                <span>Chỉnh sửa sơ đồ ghế</span>
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <HallModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        hall={editingHall}
                        onSave={handleSave}
                    />
                )}
                {isLayoutOpen && (
                    <SeatLayoutModal
                        key={getHallId(selectedHall) || 'new-layout'}
                        isOpen={isLayoutOpen}
                        onClose={() => setIsLayoutOpen(false)}
                        hall={selectedHall}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}