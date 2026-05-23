import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import { 
    Calendar, Clock, Loader2, Save, MapPin, Film, AlertCircle, DollarSign
} from 'lucide-react';
import { managerService } from '../../../services/managerService';

const SEAT_TYPES = [
    { type: 'NORMAL', label: 'Standard Seat', desc: 'Base price for regular seating.' },
    { type: 'VIP', label: 'VIP Seat', desc: 'Premium pricing for VIP rows.' },
    { type: 'COUPLE', label: 'Couple Seat', desc: 'Pricing for two-person sofa seats.' }
];

export default function PricingManagementPage() {
    const [showtimes, setShowtimes] = useState([]);
    const [loadingShowtimes, setLoadingShowtimes] = useState(true);
    
    // Master-detail state
    const [selectedShowtime, setSelectedShowtime] = useState(null);
    const [pricingRules, setPricingRules] = useState({
        NORMAL: '',
        VIP: '',
        COUPLE: ''
    });
    const [saving, setSaving] = useState(false);
    const [loadingRules, setLoadingRules] = useState(false);

    const fetchShowtimes = useCallback(async () => {
        try {
            setLoadingShowtimes(true);
            const res = await managerService.getShowtimes();
            setShowtimes(res.data || res);
        } catch (err) {
            console.error("Failed to fetch showtimes", err);
        } finally {
            setLoadingShowtimes(false);
        }
    }, []);

    useEffect(() => {
        fetchShowtimes();
    }, [fetchShowtimes]);

    const handleSelectShowtime = async (st) => {
        setSelectedShowtime(st);
        setPricingRules({ NORMAL: '', VIP: '', COUPLE: '' });
        setLoadingRules(true);
        try {
            const res = await managerService.getPricingRules(st.UUID || st._id || st.id);
            const rules = res.data || res;
            if (Array.isArray(rules)) {
                const temp = { NORMAL: '', VIP: '', COUPLE: '' };
                rules.forEach(r => {
                    temp[r.seatType] = r.price;
                });
                setPricingRules(temp);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingRules(false);
        }
    };

    const handleSave = async () => {
        try {
            const payload = {
                showtimeId: selectedShowtime.UUID || selectedShowtime._id || selectedShowtime.id,
                rules: [
                    { seatType: 'NORMAL', price: Number(pricingRules.NORMAL || 0) },
                    { seatType: 'VIP', price: Number(pricingRules.VIP || 0) },
                    { seatType: 'COUPLE', price: Number(pricingRules.COUPLE || 0) },
                ]
            };
            
            await managerService.setPricingRules(payload);

            Swal.fire({
                title: 'Saved!',
                text: 'Pricing rules updated for this showtime successfully.',
                icon: 'success',
                background: '#1a0607',
                color: '#fff',
                confirmButtonColor: '#dc2626'
            });
        } catch (err) {
            Swal.fire({
                title: 'Error!',
                text: err?.response?.data?.message || 'Failed to save rules.',
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
        <div className="space-y-8 pb-10 flex flex-col h-[calc(100vh-100px)]">
            <div className="flex justify-between items-center shrink-0">
                <div>
                    <h2 className="text-3xl font-bold">Showtime Pricing rules</h2>
                    <p className="text-gray-400 mt-1">Configure individual ticket prices for every showtime separately.</p>
                </div>
                <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-2 text-blue-500">
                    <AlertCircle size={16} />
                    <span className="text-xs font-bold uppercase">Dynamic Pricing Required</span>
                </div>
            </div>

            <div className="flex gap-8 flex-1 grow min-h-0 overflow-hidden">
                {/* Left Panel: Showtime List */}
                <div className="w-1/3 bg-white/5 border border-white/10 rounded-3xl flex flex-col overflow-hidden">
                    <div className="p-5 border-b border-white/10 bg-white/[0.02]">
                        <h3 className="font-bold text-gray-200 uppercase tracking-widest text-xs">Select a Showtime</h3>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2">
                        {loadingShowtimes ? (
                            <div className="flex justify-center p-10"><Loader2 className="animate-spin text-red-600" size={30} /></div>
                        ) : showtimes.length === 0 ? (
                            <div className="text-center text-sm text-gray-500 p-10">No active showtimes available.</div>
                        ) : (
                            showtimes.map(st => (
                                <div 
                                    key={st.UUID || st._id || st.id}
                                    onClick={() => handleSelectShowtime(st)}
                                    className={`p-4 rounded-2xl cursor-pointer border transition-all ${(selectedShowtime?.UUID || selectedShowtime?._id || selectedShowtime?.id) === (st.UUID || st._id || st.id) ? 'bg-red-600/10 border-red-600 shadow-md' : 'bg-[#140405] border-white/5 hover:border-white/20'}`}
                                >
                                    <div className="flex gap-3 items-start">
                                        <div className="w-12 h-16 bg-gray-900 rounded-lg overflow-hidden shrink-0">
                                            {st.movie?.posterUrl ? (
                                                <img src={st.movie.posterUrl} className="w-full h-full object-cover" alt="" />
                                            ) : (
                                                <Film className="w-full h-full p-3 text-gray-700" />
                                            )}
                                        </div>
                                        <div>
                                            <p className={`font-bold text-sm line-clamp-1 mb-1 ${(selectedShowtime?._id || selectedShowtime?.id) === (st._id || st.id) ? 'text-red-500' : 'text-gray-200'}`}>{st.movie?.title}</p>
                                            <div className="text-xs text-gray-500 space-y-1">
                                                <p className="flex items-center gap-1"><Calendar size={12} /> {new Date(st.startTime).toLocaleDateString()}</p>
                                                <p className="flex items-center gap-1"><Clock size={12} /> {new Date(st.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                                <p className="flex items-center gap-1"><MapPin size={12} /> {st.hall?.name}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Panel: Rules Editor */}
                <div className="flex-1 bg-white/5 border border-white/10 rounded-3xl flex flex-col overflow-hidden relative backdrop-blur-sm shadow-xl p-8">
                    {!selectedShowtime ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                            <DollarSign size={60} className="mb-4 text-white/10" />
                            <p className="text-lg font-bold">Select a showtime</p>
                            <p className="text-sm">Choose a schedule from the left to configure tickets.</p>
                        </div>
                    ) : loadingRules ? (
                        <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-red-600" size={40} /></div>
                    ) : (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col h-full">
                            <div className="mb-8 p-6 bg-red-600/5 rounded-2xl border border-red-600/10">
                                <h3 className="text-xl font-black text-red-500">{selectedShowtime.movie?.title}</h3>
                                <p className="text-gray-300 mt-2 flex gap-4 text-sm font-medium">
                                    <span className="flex items-center gap-1"><Calendar size={16} className="text-gray-500"/> {new Date(selectedShowtime.startTime).toLocaleDateString()}</span>
                                    <span className="flex items-center gap-1"><Clock size={16} className="text-gray-500"/> {new Date(selectedShowtime.startTime).toLocaleTimeString()}</span>
                                    <span className="flex items-center gap-1"><MapPin size={16} className="text-gray-500"/> {selectedShowtime.hall?.name}</span>
                                </p>
                            </div>

                            <div className="space-y-6 flex-1">
                                {SEAT_TYPES.map(seat => (
                                    <div key={seat.type} className="flex gap-6 items-center p-5 bg-[#140405] rounded-3xl border border-white/5">
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-200 text-lg">{seat.label}</h4>
                                            <p className="text-sm text-gray-500">{seat.desc}</p>
                                        </div>
                                        <div className="w-1/3 relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₫</div>
                                            <input
                                                type="number"
                                                value={pricingRules[seat.type] || ''}
                                                onChange={(e) => setPricingRules({...pricingRules, [seat.type]: e.target.value})}
                                                placeholder="0"
                                                className="w-full bg-[#0a0203] border border-white/10 group-hover:border-white/30 rounded-xl py-4 pl-10 pr-4 text-lg font-black focus:outline-none focus:border-red-600 transition-all text-white"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 flex justify-end">
                                <button 
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-red-600/20 active:scale-95 disabled:opacity-50"
                                >
                                    {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                                    <span>Save Pricing Rules</span>
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}