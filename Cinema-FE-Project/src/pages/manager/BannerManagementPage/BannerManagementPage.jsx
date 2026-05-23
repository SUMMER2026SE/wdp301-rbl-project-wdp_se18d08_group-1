import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageIcon, Plus, Trash2, Edit2, Link as LinkIcon, Eye, MoveUp, MoveDown, Loader2, X } from 'lucide-react';
import { managerService } from '../../../services/managerService';

const BannerCard = React.forwardRef(({ banner, onEdit, onDelete }, ref) => (
    <motion.div
        ref={ref}
        layout
        className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden group hover:border-red-600/30 transition-all flex flex-col md:flex-row shadow-xl"
    >
        <div className="md:w-72 h-40 bg-gray-800 relative flex-shrink-0">
            {banner.imageUrl ? (
                <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600"><ImageIcon size={40} /></div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                <span className="text-[10px] bg-red-600 text-white font-black px-2 py-1 rounded-full uppercase tracking-widest">Active</span>
            </div>
        </div>

        <div className="flex-1 p-6 flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-red-500 transition-colors uppercase tracking-tight text-white">
                        {typeof banner.title === 'object' ? banner.title?.title : banner.title}
                    </h3>
                    <div className="flex gap-1 text-gray-600">
                        <button className="p-2 hover:text-white hover:bg-white/5 rounded-lg transition-all"><MoveUp size={16} /></button>
                        <button className="p-2 hover:text-white hover:bg-white/5 rounded-lg transition-all"><MoveDown size={16} /></button>
                    </div>
                </div>
                <p className="text-gray-400 text-sm italic mb-4">
                    "{typeof banner.description === 'object' ? banner.description?.description : banner.description}"
                </p>
                <div className="flex items-center gap-2 text-xs text-red-500 font-bold">
                    <LinkIcon size={14} />
                    <span>{typeof banner.link === 'object' ? banner.link?.url : (banner.link || 'No path set')}</span>
                </div>
            </div>

            <div className="flex gap-3 mt-6">
                <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition-all border border-white/5 text-white">
                    <Eye size={14} /> Preview
                </button>
                <button onClick={() => onEdit(banner)} className="p-2 text-gray-500 hover:text-white transition-all outline-none"><Edit2 size={16} /></button>
                <button onClick={() => onDelete(banner.id)} className="p-2 text-gray-500 hover:text-red-500 transition-all outline-none"><Trash2 size={16} /></button>
            </div>
        </div>
    </motion.div>
));

const BannerModal = ({ isOpen, onClose, banner = null, onSave }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        imageUrl: '',
        linkUrl: '',
        position: 0,
        isActive: true
    });

    useEffect(() => {
        if (banner) {
            setFormData({
                title: banner.title || '',
                description: banner.description || '',
                imageUrl: banner.imageUrl || '',
                linkUrl: banner.linkUrl || banner.link || '',
                position: banner.position || 0,
                isActive: banner.isActive !== undefined ? banner.isActive : true
            });
        } else {
            setFormData({
                title: '',
                description: '',
                imageUrl: '',
                linkUrl: '',
                position: 0,
                isActive: true
            });
        }
    }, [banner]);

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
                className="bg-[#1a0607] border border-white/10 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl"
            >
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                    <h3 className="text-xl font-bold text-white">{banner ? 'Edit Banner' : 'Create Banner'}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form className="p-8 space-y-6" onSubmit={(e) => {
                    e.preventDefault();
                    onSave({
                        ...formData,
                        position: Number(formData.position)
                    });
                }}>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400 font-medium">Title</label>
                                <input
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Banner Title"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-red-600 transition-all text-white"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400 font-medium">Position</label>
                                <input
                                    type="number"
                                    value={formData.position}
                                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-red-600 transition-all text-white"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-gray-400 font-medium">Description</label>
                            <input
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Short promotional text..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-red-600 transition-all text-white"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-gray-400 font-medium">Image Upload</label>
                            <div className="flex gap-4 items-center">
                                {formData.imageUrl && formData.imageUrl.startsWith('data:image') && (
                                    <img src={formData.imageUrl} className="h-12 w-20 object-cover rounded-md border border-white/10" alt="Preview" />
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setFormData({ ...formData, imageUrl: reader.result });
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 focus:outline-none focus:border-red-600 transition-all text-white file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-red-600/20 file:text-red-500 hover:file:bg-red-600/30 text-sm"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400 font-medium">Link URL</label>
                                <input
                                    value={formData.linkUrl}
                                    onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                                    placeholder="/promotions/..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-red-600 transition-all text-white"
                                />
                            </div>
                            <div className="flex items-center gap-2 pt-8">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-5 h-5 accent-red-600"
                                />
                                <label className="text-sm text-gray-400 font-medium">Active Status</label>
                            </div>
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
                            {banner ? 'Save Changes' : 'Upload Banner'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default function BannerManagementPage() {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);

    const fetchBanners = async () => {
        try {
            setLoading(true);
            const response = await managerService.getBanners();
            setBanners(response.data || response);
        } catch (err) {
            console.error(err);
            setBanners([
                { id: 1, title: 'Summer Blockbuster Sale', description: 'Get 50% off on all afternoon screenings during July!', imageUrl: '', link: '/promotions/summer-sale', order: 1 },
                { id: 2, title: 'Avatar: Way of Water', description: 'Experience the magic in 3D IMAX. Tickets selling fast.', imageUrl: '', link: '/movies/avatar-2', order: 2 },
                { id: 3, title: 'Family Membership', description: 'New family plans available now with free popcorn benefits.', imageUrl: '', link: '/membership', order: 3 },
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    const handleCreate = () => {
        setEditingBanner(null);
        setIsModalOpen(true);
    };

    const handleEdit = (banner) => {
        setEditingBanner(banner);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this banner?')) return;
        try {
            await managerService.deleteBanner(id);
            fetchBanners();
        } catch (err) {
            console.error(err);
        }
    };

    const handleSave = async (data) => {
        try {
            if (editingBanner) {
                await managerService.updateBanner(editingBanner.id, data);
            } else {
                await managerService.createBanner(data);
            }
            setIsModalOpen(false);
            fetchBanners();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-8 pb-10">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white">Banner & Slider</h2>
                    <p className="text-gray-400 mt-1">Design and arrange the hero section for the landing page.</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-red-600/20 active:scale-95 group"
                >
                    <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                    <span>Upload New Banner</span>
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {loading ? (
                    <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-red-600" size={40} /></div>
                ) : (
                    banners.map(banner => (
                        <BannerCard
                            key={banner.id || banner._id}
                            banner={banner}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))
                )}
            </div>

            <div
                onClick={handleCreate}
                className="p-8 bg-white/5 border border-white/5 rounded-3xl border-dashed flex flex-col items-center justify-center text-center gap-4 group cursor-pointer hover:bg-red-600/5 hover:border-red-600/20 transition-all"
            >
                <div className="w-16 h-16 bg-red-600/10 rounded-full flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform duration-500">
                    <ImageIcon size={32} />
                </div>
                <div>
                    <h4 className="font-bold text-lg mb-1 text-white">Add Another Slide</h4>
                    <p className="text-sm text-gray-500">Recommended size: 1920x1080px (Max 5MB)</p>
                </div>
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <BannerModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        banner={editingBanner}
                        onSave={handleSave}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
