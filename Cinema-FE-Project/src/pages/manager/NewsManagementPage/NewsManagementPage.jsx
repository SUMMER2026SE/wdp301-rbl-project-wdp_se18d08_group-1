import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Newspaper, Plus, Search, Calendar, User, Edit2, Trash2, Loader2, Link as LinkIcon, FileText, X, Filter } from 'lucide-react';
import { managerService } from '../../../services/managerService';

const NewsCard = React.forwardRef(({ post, onEdit, onDelete }, ref) => (
    <motion.div
        ref={ref}
        layout
        className="bg-[#1a0607]/40 border border-white/10 rounded-3xl overflow-hidden group hover:bg-white/5 transition-all shadow-xl"
    >
        <div className="h-48 bg-gray-800 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-[#140405] to-transparent z-10" />
            <div className="absolute top-4 left-4 z-20">
                <span className="text-[10px] bg-red-600 text-white font-black px-3 py-1 rounded-full uppercase tracking-widest">Promotion</span>
            </div>
            {(post.thumbnailUrl || post.imageUrl) ? (
                <img src={post.thumbnailUrl || post.imageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-700 bg-white/5"><FileText size={48} /></div>
            )}
        </div>

        <div className="p-6 space-y-4">
            <div className="flex items-center gap-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                <span className="flex items-center gap-1"><Calendar size={12} className="text-red-500" /> {typeof post.createdAt === 'object' ? 'Recently' : (post.date || 'Oct 24, 2023')}</span>
                <span className="flex items-center gap-1"><User size={12} className="text-red-500" /> {typeof post.author === 'object' ? post.author?.name : (post.author || 'Admin')}</span>
            </div>

            <h3 className="text-xl font-bold group-hover:text-red-500 transition-colors line-clamp-2">
                {typeof post.title === 'object' ? post.title?.title : post.title}
            </h3>
            <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed italic">
                "{typeof post.summary === 'object' ? post.summary?.summary : (post.summary || 'No summary available for this post.')}"
            </p>

            <div className="pt-4 flex justify-between items-center border-t border-white/5">
                <button className="text-[10px] font-black uppercase tracking-[0.2em] text-white hover:text-red-500 transition-colors">Read Full Article</button>
                <div className="flex gap-2">
                    <button onClick={() => onEdit(post)} className="p-2 text-gray-600 hover:text-white rounded-lg transition-all"><Edit2 size={16} /></button>
                    <button onClick={() => onDelete(post.id)} className="p-2 text-gray-600 hover:text-red-500 rounded-lg transition-all"><Trash2 size={16} /></button>
                </div>
            </div>
        </div>
    </motion.div>
));

const NewsModal = ({ isOpen, onClose, post = null, onSave }) => {
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        thumbnailUrl: '',
        type: 'NEWS',
        status: 'DRAFT'
    });

    useEffect(() => {
        if (post) {
            setFormData({
                title: post.title || '',
                content: post.content || '',
                thumbnailUrl: post.thumbnailUrl || '',
                type: post.type || 'NEWS',
                status: post.status || 'DRAFT'
            });
        } else {
            setFormData({
                title: '',
                content: '',
                thumbnailUrl: '',
                type: 'NEWS',
                status: 'DRAFT'
            });
        }
    }, [post]);

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
                className="bg-[#1a0607] border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
            >
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                    <h3 className="text-xl font-bold text-white">{post ? 'Edit News Post' : 'Create News Post'}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form className="p-8 space-y-6" onSubmit={(e) => {
                    e.preventDefault();
                    onSave(formData);
                }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400 font-medium">Title</label>
                            <input
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Post Title"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-red-600 transition-all text-white"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400 font-medium">Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-red-600 text-white [&>option]:text-gray-900"
                            >
                                <option value="NEWS">News</option>
                                <option value="PROMOTION">Promotion</option>
                                <option value="EVENT">Event</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-gray-400 font-medium">Content</label>
                        <textarea
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            rows={6}
                            placeholder="Full article content..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-red-600 transition-all resize-none text-white"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400 font-medium">Thumbnail Upload</label>
                            <div className="flex gap-4 items-center">
                                {formData.thumbnailUrl && formData.thumbnailUrl.startsWith('data:image') && (
                                    <img src={formData.thumbnailUrl} className="h-12 w-20 object-cover rounded-md border border-white/10" alt="Preview" />
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setFormData({ ...formData, thumbnailUrl: reader.result });
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 focus:outline-none focus:border-red-600 transition-all text-white file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-red-600/20 file:text-red-500 hover:file:bg-red-600/30 text-sm"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400 font-medium">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-red-600 text-white [&>option]:text-gray-900"
                            >
                                <option value="DRAFT">Draft</option>
                                <option value="PUBLISHED">Published</option>
                                <option value="ARCHIVED">Archived</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/10 flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-bold transition-all text-white"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold shadow-lg shadow-red-600/20 transition-all"
                        >
                            {post ? 'Save Changes' : 'Create Article'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default function NewsManagementPage() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    const fetchNews = async () => {
        try {
            setLoading(true);
            const response = await managerService.getNews();
            setNews(response.data || response);
        } catch (err) {
            console.error(err);
            setNews([
                { id: 1, title: 'Opening Special: 20% Off Tickets!', summary: 'Join us for our grand opening week and enjoy massive discounts on all releases.', author: 'Mgr. Dat', date: 'Oct 20, 2023' },
                { id: 2, title: 'New IMAX Screenings Available', summary: 'Experience movies like never before with our state-of-the-art IMAX technology.', author: 'Admin Châu', date: 'Oct 15, 2023' },
                { id: 3, title: 'Popcorn Combo Deals', summary: 'Check out our new family combos available at the concession stand.', author: 'Mgr. Dat', date: 'Oct 12, 2023' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, []);

    const handleCreate = () => {
        setEditingPost(null);
        setIsModalOpen(true);
    };

    const handleEdit = (post) => {
        setEditingPost(post);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this news?')) return;
        try {
            await managerService.deleteNews(id);
            fetchNews();
        } catch (err) {
            console.error(err);
        }
    };

    const handleSave = async (data) => {
        try {
            if (editingPost) {
                await managerService.updateNews(editingPost.id, data);
            } else {
                await managerService.createNews(data);
            }
            setIsModalOpen(false);
            fetchNews();
        } catch (err) {
            console.error(err);
        }
    };

    const filteredNews = news
        .filter(n => {
            const title = typeof n.title === 'object' ? n.title?.title : n.title;
            const summary = typeof n.summary === 'object' ? n.summary?.summary : n.summary;
            const search = searchTerm.toLowerCase();
            return (title?.toLowerCase().includes(search) || summary?.toLowerCase().includes(search));
        })
        .sort((a, b) => {
            if (sortBy === 'newest') return new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt);
            if (sortBy === 'oldest') return new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt);
            return 0;
        });

    return (
        <div className="space-y-8 pb-10">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white">News & Promotions</h2>
                    <p className="text-gray-400 mt-1">Create and manage content for the news section and home promotions.</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-red-600/20 active:scale-95 group"
                >
                    <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                    <span>Write New Post</span>
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search articles by title or summary..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:border-red-600 text-white"
                    />
                </div>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-1">
                    <Filter size={16} className="text-gray-500" />
                    <select
                        className="bg-transparent py-2 text-sm focus:outline-none text-white [&>option]:text-gray-900 cursor-pointer"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-red-600" size={40} /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredNews.map(n => (
                        <NewsCard
                            key={n.id || n._id}
                            post={n}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}

                    <motion.button
                        onClick={handleCreate}
                        whileHover={{ y: -5 }}
                        className="border-2 border-dashed border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-4 text-gray-500 hover:text-red-500 hover:border-red-600/30 hover:bg-red-600/5 transition-all group"
                    >
                        <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-700 flex items-center justify-center group-hover:border-red-600/50 transition-colors">
                            <Plus size={32} />
                        </div>
                        <p className="font-bold uppercase tracking-widest text-[10px]">Create Draft</p>
                    </motion.button>
                </div>
            )}

            <AnimatePresence>
                {isModalOpen && (
                    <NewsModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        post={editingPost}
                        onSave={handleSave}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
