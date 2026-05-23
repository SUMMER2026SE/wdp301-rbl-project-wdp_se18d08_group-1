import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import {
    Calendar,
    Plus,
    Filter,
    Clock,
    MapPin,
    AlertCircle,
    Loader2,
    X,
    Layout
} from 'lucide-react';
import { managerService } from '../../../services/managerService';

const CustomSelect = ({ label, options, value, onChange, placeholder, icon: Icon }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedOption = options.find(o => (o._id || o.id) === value);

    return (
        <div className="space-y-2 relative">
            <label className="text-sm text-gray-400 font-medium">{label}</label>
            <div className="relative">
                <div 
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 flex items-center justify-between cursor-pointer hover:border-red-600/50 transition-all text-white"
                >
                    <span className={selectedOption ? "text-white font-medium" : "text-gray-500"}>
                        {selectedOption ? (typeof selectedOption.name === 'object' ? selectedOption.name?.name : selectedOption.name || selectedOption.title) : placeholder}
                    </span>
                    <Clock size={16} className="text-gray-500 rotate-90" />
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
                                {options.length === 0 ? (
                                    <div className="p-4 text-center text-gray-500 text-sm">No options available</div>
                                ) : (
                                    options.map(o => {
                                        const isSelected = (o._id || o.id) === value;
                                        return (
                                            <div 
                                                key={o._id || o.id}
                                                onClick={() => {
                                                    onChange(o._id || o.id);
                                                    setIsOpen(false);
                                                }}
                                                className={`p-4 cursor-pointer hover:bg-white/5 transition-colors ${isSelected ? 'bg-red-600/10' : ''}`}
                                            >
                                                <span className={`text-sm ${isSelected ? 'text-red-500 font-bold' : 'text-gray-300'}`}>
                                                    {typeof o.name === 'object' ? o.name?.name : o.name || o.title} {o.type ? `(${o.type})` : ''}
                                                </span>
                                            </div>
                                        );
                                    })
                                )}
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const ShowtimeModal = ({ isOpen, onClose, onSave, initialData }) => {
    const [movies, setMovies] = useState([]);
    const [halls, setHalls] = useState([]);
    const [formData, setFormData] = useState({
        movieId: '',
        hallId: '',
        startTime: '',
        date: new Date().toISOString().split('T')[0],
        price: '10'
    });

    useEffect(() => {
        if (isOpen) {
            const loadOptions = async () => {
                try {
                    const mRes = await managerService.getMovies();
                    const hRes = await managerService.getHalls();
                    setMovies(mRes.data || mRes);
                    setHalls(hRes.data || hRes);
                } catch (err) { console.error(err); }
            };
            loadOptions();

            if (initialData) {
                const dateObj = new Date(initialData.startTime);
                const year = dateObj.getFullYear();
                const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                const day = String(dateObj.getDate()).padStart(2, '0');
                const hour = String(dateObj.getHours()).padStart(2, '0');
                const minute = String(dateObj.getMinutes()).padStart(2, '0');
                
                setFormData({
                    movieId: initialData.movie?._id || initialData.movie?.id || initialData.movie || '',
                    hallId: initialData.hall?._id || initialData.hall?.id || initialData.hall || '',
                    startTime: `${hour}:${minute}`,
                    date: `${year}-${month}-${day}`,
                    price: initialData.price?.toString() || '10'
                });
            } else {
                setFormData({
                    movieId: '',
                    hallId: '',
                    startTime: '',
                    date: new Date().toISOString().split('T')[0],
                    price: '10'
                });
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        // Construct date using local time values then convert to ISO
        const [year, month, day] = formData.date.split('-').map(Number);
        const [hour, minute] = formData.startTime.split(':').map(Number);
        const localDate = new Date(year, month - 1, day, hour, minute);
        const startTime = localDate.toISOString();

        onSave({
            movieId: formData.movieId,
            hallId: formData.hallId,
            startTime,
            price: parseFloat(formData.price)
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
                className="bg-[#1a0607] border border-white/10 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl"
            >
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                    <h3 className="text-xl font-bold font-display text-white">{initialData ? 'Edit Screening' : 'Schedule New Screening'}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form className="p-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <CustomSelect 
                            label="Select Movie"
                            options={movies}
                            value={formData.movieId}
                            onChange={(val) => setFormData({ ...formData, movieId: val })}
                            placeholder="Choose a movie..."
                        />

                        <CustomSelect 
                            label="Select Theatre / Hall"
                            options={halls}
                            value={formData.hallId}
                            onChange={(val) => setFormData({ ...formData, hallId: val })}
                            placeholder="Choose a hall..."
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400 font-medium">Date</label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-red-600 text-white"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400 font-medium">Start Time</label>
                                <input
                                    type="time"
                                    value={formData.startTime}
                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-red-600 text-white"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-gray-400 font-medium">Ticket Price ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-red-600 text-white"
                                required
                            />
                        </div>
                    </div>

                    <div className="bg-red-600/10 border border-red-600/20 p-4 rounded-2xl flex gap-3 text-red-500">
                        <Layout size={20} className="shrink-0 mt-0.5" />
                        <p className="text-xs leading-relaxed font-medium">
                            System will automatically check for room conflicts and allow 15 minutes for cleanup between sessions.
                        </p>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-bold transition-all text-white active:scale-95">Cancel</button>
                        <button type="submit" className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold shadow-lg shadow-red-600/20 transition-all active:scale-95">{initialData ? 'Update Schedule' : 'Create Schedule'}</button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default function ShowtimeManagementPage() {
    const [showtimes, setShowtimes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [editingShowtime, setEditingShowtime] = useState(null);

    const fetchShowtimes = useCallback(async () => {
        try {
            setLoading(true);
            const response = await managerService.getShowtimes({ date: selectedDate });
            const data = response.data || response;
            setShowtimes(Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : []));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [selectedDate]);

    useEffect(() => {
        fetchShowtimes();
    }, [fetchShowtimes]);

    const handleEdit = (showtime) => {
        setEditingShowtime(showtime);
        setIsModalOpen(true);
    };

    const handleSave = async (data) => {
        try {
            if (editingShowtime) {
                await managerService.updateShowtime(editingShowtime.UUID || editingShowtime._id || editingShowtime.id, data);
                Swal.fire({
                    title: 'Updated!',
                    text: 'Showtime has been updated.',
                    icon: 'success',
                    background: '#1a0607',
                    color: '#fff',
                    confirmButtonColor: '#dc2626'
                });
            } else {
                await managerService.createShowtime(data);
                Swal.fire({
                    title: 'Success!',
                    text: 'Showtime has been created.',
                    icon: 'success',
                    background: '#1a0607',
                    color: '#fff',
                    confirmButtonColor: '#dc2626'
                });
            }
            setIsModalOpen(false);
            setEditingShowtime(null);
            fetchShowtimes();
        } catch (err) {
            console.error(err);
            Swal.fire({
                title: 'Error!',
                text: err.response?.data?.message || 'Failed to save showtime.',
                icon: 'error',
                background: '#1a0607',
                color: '#fff',
                confirmButtonColor: '#dc2626'
            });
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#1a0607',
            confirmButtonText: 'Yes, delete it!',
            background: '#1a0607',
            color: '#fff'
        });

        if (result.isConfirmed) {
            try {
                await managerService.deleteShowtime(id);
                Swal.fire({
                    title: 'Deleted!',
                    text: 'Showtime has been removed.',
                    icon: 'success',
                    background: '#1a0607',
                    color: '#fff',
                    confirmButtonColor: '#dc2626'
                });
                fetchShowtimes();
            } catch (err) {
                console.error(err);
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to delete showtime.',
                    icon: 'error',
                    background: '#1a0607',
                    color: '#fff',
                    confirmButtonColor: '#dc2626'
                });
            }
        }
    };

    const filteredShowtimes = showtimes;

    return (
        <div className="space-y-8 pb-10">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white">Showtime Management</h2>
                    <p className="text-gray-400 mt-1">Schedule and monitor movie screenings across all halls.</p>
                </div>
                <button
                    onClick={() => { setEditingShowtime(null); setIsModalOpen(true); }}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-red-600/20 active:scale-95 group"
                >
                    <Plus size={20} className="group-hover:rotate-180 transition-transform duration-500" />
                    <span>New Showtime</span>
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-1 rounded-2xl overflow-x-auto no-scrollbar max-w-full">
                    {[0, 1, 2, 3, 4, 5].map((offset) => {
                        const date = new Date();
                        date.setDate(date.getDate() + offset);
                        const dateStr = date.toISOString().split('T')[0];
                        const isActive = selectedDate === dateStr;
                        return (
                            <button
                                key={offset}
                                onClick={() => setSelectedDate(dateStr)}
                                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${isActive ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {offset === 0 ? 'Today' : date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                            </button>
                        );
                    })}
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:bg-white/10 hover:text-white transition-all whitespace-nowrap">
                        <MapPin size={18} />
                        <span>Select Branch</span>
                    </button>
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:bg-white/10 hover:text-white transition-all whitespace-nowrap">
                        <Filter size={18} />
                        <span>Format</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <Loader2 className="animate-spin text-red-600" size={40} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredShowtimes.map((show) => {
                        const movieTitle = show.movie?.title || show.movieTitle || 'Unknown Movie';
                        const hallName = show.hall?.name || show.hallName || 'Unknown Hall';
                        const startTime = new Date(show.startTime);
                        const timeStr = startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        const dateStr = startTime.toLocaleDateString();

                        return (
                        <motion.div
                            key={show._id || show.id || show.UUID}
                            whileHover={{ y: -8 }}
                            className="bg-[#1a0607]/60 border border-white/10 rounded-3xl p-6 backdrop-blur-sm relative overflow-hidden group shadow-xl"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />

                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div className="p-3 rounded-2xl bg-gradient-to-tr from-red-600 to-red-400 text-white shadow-lg shadow-red-600/20">
                                    <Clock size={24} />
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest bg-red-500/10 px-2 py-1 rounded">Confirmed</p>
                                    <p className="text-2xl font-black mt-1 text-white">{timeStr}</p>
                                </div>
                            </div>

                            <h3 className="text-lg font-bold mb-4 line-clamp-1 group-hover:text-red-500 transition-colors text-white">
                                {movieTitle}
                            </h3>

                            <div className="space-y-3 relative z-10">
                                <div className="flex items-center gap-3 text-gray-400 text-sm">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                        <MapPin size={14} className="text-red-500" />
                                    </div>
                                    <span className="font-semibold">{hallName}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-400 text-sm">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                        <Calendar size={14} className="text-red-500" />
                                    </div>
                                    <span>{dateStr}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-400 text-sm font-bold text-white">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                        <AlertCircle size={14} className="text-green-500" />
                                    </div>
                                    <span>{show.price} $ / Ticket</span>
                                </div>
                            </div>

                            <div className="mt-8 flex gap-2">
                                <button 
                                    onClick={() => handleEdit(show)}
                                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition-all border border-white/5 text-white"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(show.UUID || show._id || show.id)}
                                    className="px-4 py-3 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-xl transition-all border border-red-600/10"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </motion.div>
                        );
                    })}
                </div>
            )}

            <AnimatePresence>
                {isModalOpen && (
                    <ShowtimeModal 
                        isOpen={isModalOpen} 
                        onClose={() => { setIsModalOpen(false); setEditingShowtime(null); }} 
                        onSave={handleSave} 
                        initialData={editingShowtime}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}