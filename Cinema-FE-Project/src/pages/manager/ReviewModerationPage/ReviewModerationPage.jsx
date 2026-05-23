import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import { MessageSquare, ThumbsUp, Search, Filter, Loader2, Star, AlertCircle, Trash2, EyeOff } from 'lucide-react';
import { managerService } from '../../../services/managerService';

const ReviewCard = React.forwardRef(({ review, onModerate, onDelete }, ref) => {
    // Robustly handle different field names (user vs userId, fullName vs name, comment vs content)
    const userName = typeof review.user === 'object' ? (review.user?.fullName || review.user?.name) : (review.userName || 'Anonymous');
    const movieTitle = typeof review.movie === 'object' ? review.movie?.title : (review.movieTitle || 'Unknown Movie');
    const comment = review.comment || review.content || '';
    
    return (
    <motion.div
        ref={ref}
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-all flex flex-col gap-6"
    >
        <div className="flex justify-between items-start">
            <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-white font-bold text-lg">
                    {userName[0]}
                </div>
                <div>
                    <h4 className="font-bold text-gray-200">{userName}</h4>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map(s => (
                                <Star key={s} size={12} className={s <= review.rating ? 'fill-amber-500 text-amber-500' : 'text-gray-700'} />
                            ))}
                        </div>
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none">• {review.date || new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter ${review.status?.toLowerCase() === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                    review.status?.toLowerCase() === 'approved' ? 'bg-green-500/10 text-green-500' :
                        'bg-red-500/10 text-red-500'
                    }`}>
                    {review.status}
                </span>
                <button
                    onClick={() => onDelete(review._id || review.id)}
                    className="p-1.5 text-gray-600 hover:text-red-500 transition-colors rounded-lg hover:bg-white/5"
                    title="Delete Review"
                >
                    <Trash2 size={14} />
                </button>
            </div>
        </div>

        <div className="flex-1">
            <p className="text-xs text-red-500 font-bold uppercase tracking-widest mb-2">Movie: {movieTitle}</p>
            <p className="text-sm text-gray-400 leading-relaxed italic">"{comment}"</p>
        </div>

        {review.status === 'Pending' && (
            <div className="flex gap-3 pt-4 border-t border-white/5">
                <button
                    onClick={() => onModerate(review._id || review.id, 'APPROVED')}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white rounded-xl text-xs font-bold transition-all border border-green-500/20"
                >
                    <ThumbsUp size={14} /> Approve
                </button>
                <button
                    onClick={() => onModerate(review._id || review.id, 'HIDDEN')}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl text-xs font-bold transition-all border border-red-500/20"
                >
                    <EyeOff size={14} /> Hide
                </button>
            </div>
        )}
    </motion.div>
    );
});

export default function ReviewModerationPage() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Pending');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    const fetchReviews = useCallback(async () => {
        try {
            setLoading(true);
            const response = await managerService.getReviews({ status: activeTab });
            const data = response.data || response;
            setReviews(Array.isArray(data.reviews) ? data.reviews : (Array.isArray(data) ? data : []));
        } catch (err) {
            console.error(err);
            setReviews([]);
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const handleModerate = async (id, action) => {
        try {
            await managerService.moderateReview(id, action);
            Swal.fire({
                title: 'Moderated!',
                text: `Review has been ${action.toLowerCase()}.`,
                icon: 'success',
                background: '#1a0607',
                color: '#fff',
                confirmButtonColor: '#dc2626'
            });
            setReviews(prev => prev.filter(r => (r._id || r.id) !== id));
        } catch (err) {
            console.error(err);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to moderate review.',
                icon: 'error',
                background: '#1a0607',
                color: '#fff',
                confirmButtonColor: '#dc2626'
            });
        }
    };

    const handleDeleteReview = async (id) => {
        const result = await Swal.fire({
            title: 'Delete this review?',
            text: "This action cannot be undone.",
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
                await managerService.deleteReview(id);
                Swal.fire({
                    title: 'Deleted!',
                    text: 'Review has been removed.',
                    icon: 'success',
                    background: '#1a0607',
                    color: '#fff',
                    confirmButtonColor: '#dc2626'
                });
                setReviews(prev => prev.filter(r => (r._id || r.id) !== id));
            } catch (err) {
                console.error(err);
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to delete review.',
                    icon: 'error',
                    background: '#1a0607',
                    color: '#fff',
                    confirmButtonColor: '#dc2626'
                });
            }
        }
    };

    const filteredReviews = (Array.isArray(reviews) ? reviews : [])
        .filter(r => {
            const user = (typeof r.userId === 'object' ? r.userId?.name : r.userName) || 'Anonymous';
            const movie = (typeof r.movieId === 'object' ? r.movieId?.title : r.movieTitle) || 'Unknown Movie';
            const comment = r.comment || '';
            const search = searchTerm.toLowerCase();
            return (user.toLowerCase().includes(search) || movie.toLowerCase().includes(search) || comment.toLowerCase().includes(search));
        })
        .sort((a, b) => {
            const dateA = new Date(a.date || a.createdAt);
            const dateB = new Date(b.date || b.createdAt);
            if (sortBy === 'newest') return dateB - dateA;
            if (sortBy === 'oldest') return dateA - dateB;
            if (sortBy === 'rating-high') return b.rating - a.rating;
            if (sortBy === 'rating-low') return a.rating - b.rating;
            return 0;
        });

    return (
        <div className="space-y-8 pb-10 text-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-bold">Review Moderation</h2>
                    <p className="text-gray-400 mt-1">Manage user comments and maintain community standards.</p>
                </div>
                <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/5">
                    {['Pending', 'Approved', 'Hidden'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => {
                                setActiveTab(tab);
                                setSearchTerm('');
                            }}
                            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-gray-500 hover:text-white'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search by user, movie or comment..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-red-600/50 transition-all text-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-2 hover:bg-white/10 transition-all">
                        <Filter size={16} className="text-gray-500" />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-transparent text-sm text-white focus:outline-none cursor-pointer [&>option]:text-gray-900"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="rating-high">Highest Rating</option>
                            <option value="rating-low">Lowest Rating</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3">
                    {loading ? (
                        <div className="h-64 flex justify-center items-center">
                            <Loader2 className="animate-spin text-red-600" size={40} />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <AnimatePresence mode="popLayout">
                                {filteredReviews.map(review => (
                                    <ReviewCard
                                        key={review._id || review.id}
                                        review={review}
                                        onModerate={handleModerate}
                                        onDelete={handleDeleteReview}
                                    />
                                ))}
                            </AnimatePresence>
                            {filteredReviews.length === 0 && (
                                <div className="col-span-full py-20 text-center text-gray-500 bg-white/5 border border-white/10 border-dashed rounded-3xl">
                                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <MessageSquare size={32} className="opacity-20" />
                                    </div>
                                    <p className="font-bold text-xl mb-1">No reviews found</p>
                                    <p className="text-sm">Try adjusting your filters or search terms.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <AlertCircle size={18} className="text-amber-500" /> Moderation Policy
                        </h3>
                        <ul className="space-y-4 text-xs text-gray-400">
                            <li className="flex gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1 shrink-0" />
                                <span>Hide reviews containing profanity or vulgar language.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1 shrink-0" />
                                <span>Mask spoilers for new releases (30 days from premiere).</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1 shrink-0" />
                                <span>Report toxic users to System Admin for account review.</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-gradient-to-tr from-gray-900 to-gray-800 border border-white/10 rounded-3xl p-8 text-center group">
                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-red-600/10 transition-colors">
                            <Star className="text-amber-500 fill-amber-500" size={32} />
                        </div>
                        <h4 className="text-lg font-bold mb-2">Top Contributor</h4>
                        <p className="text-sm text-gray-500 mb-6">User "Sarah C." has provided 42 constructive reviews this month.</p>
                        <button className="text-xs font-black text-white hover:text-red-500 transition-colors">Reward User</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
