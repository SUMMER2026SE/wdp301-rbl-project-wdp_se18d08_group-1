import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Search, Edit2, Trash2, X,
    Utensils, Coffee, Box,
    Loader2, Popcorn, Package, FileImage
} from 'lucide-react';
import Swal from 'sweetalert2';
import { managerService } from '../../../services/managerService';
import { formatVND } from '../../../utils/format';

const ConcessionModal = ({ isOpen, onClose, item = null, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        category: 'Food',
        price: '',
        description: '',
        status: 'Available',
        imageUrl: ''
    });

    useEffect(() => {
        if (item) {
            setFormData({
                name: item.name || '',
                category: item.type || item.category || 'Food',
                price: item.price || '',
                description: item.description || '',
                status: item.status || 'Available',
                imageUrl: item.imageUrl || ''
            });
        }
    }, [item]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...formData, type: formData.category, price: Number(formData.price) });
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
                className="bg-[#1a0607] border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                    <h3 className="text-xl font-bold text-white">{item ? 'Edit Product' : 'Add New Product'}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form className="p-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div className="flex gap-6 items-start">
                            <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex items-center justify-center relative group shrink-0">
                                {formData.imageUrl ? (
                                    <img src={formData.imageUrl} alt="preview" className="w-full h-full object-cover" />
                                ) : (
                                    <FileImage size={32} className="text-gray-600" />
                                )}
                                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                    <Plus size={20} className="text-white" />
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => setFormData({...formData, imageUrl: reader.result});
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                </label>
                            </div>
                            <div className="flex-1 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400 font-medium">Product Name</label>
                                    <input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-red-600 text-white"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400 font-medium">Category</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-red-600 text-white [&>option]:text-gray-900"
                                        >
                                            <option value="Food">Food</option>
                                            <option value="Drink">Drink</option>
                                            <option value="Combo">Combo</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400 font-medium">Price ($)</label>
                                        <input
                                            type="number"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-red-600 text-white"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-gray-400 font-medium">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-red-600 text-white min-h-[100px] resize-none"
                                placeholder="Describe the item..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-gray-400 font-medium">Status</label>
                            <div className="flex gap-4">
                                {['Available', 'Out of Stock'].map(s => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, status: s })}
                                        className={`flex-1 py-3 rounded-xl border transition-all text-xs font-bold ${formData.status === s ? 'bg-red-600/10 border-red-600 text-white' : 'bg-white/5 border-white/10 text-gray-500'}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-bold transition-all text-white active:scale-95">Cancel</button>
                        <button type="submit" className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold shadow-lg shadow-red-600/20 transition-all active:scale-95">
                            {item ? 'Save Changes' : 'Create Product'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default function ConcessionManagementPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const categories = [
        { id: 'All', label: 'All Items', icon: Package },
        { id: 'Food', label: 'Food', icon: Popcorn },
        { id: 'Drink', label: 'Drinks', icon: Coffee },
        { id: 'Combo', label: 'Combos', icon: Utensils },
    ];

    const fetchConcessions = useCallback(async () => {
        try {
            setLoading(true);
            const response = await managerService.getConcessions();
            // Robust data handling
            const data = response.data || response;
            setItems(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchConcessions();
    }, [fetchConcessions]);

    const handleSave = async (data) => {
        try {
            if (editingItem) {
                await managerService.updateConcession(editingItem._id || editingItem.id, data);
            } else {
                await managerService.createConcession(data);
            }
            setIsModalOpen(false);
            fetchConcessions();
            Swal.fire({
                title: 'Success!',
                text: 'Product has been saved.',
                icon: 'success',
                background: '#1a0607',
                color: '#fff',
                confirmButtonColor: '#dc2626'
            });
        } catch (err) {
            Swal.fire({
                title: 'Error!',
                text: 'Failed to save product.',
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
            text: "This item will be permanently removed.",
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
                await managerService.deleteConcession(id);
                fetchConcessions();
                Swal.fire({
                    title: 'Deleted!',
                    text: 'Item has been removed.',
                    icon: 'success',
                    background: '#1a0607',
                    color: '#fff',
                    confirmButtonColor: '#dc2626'
                });
            } catch (err) {
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to delete item.',
                    icon: 'error',
                    background: '#1a0607',
                    color: '#fff',
                    confirmButtonColor: '#dc2626'
                });
            }
        }
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const categoryValue = item.type || item.category || 'Food';
        const matchesCategory = activeCategory === 'All' || categoryValue === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const getStockStatus = (qty) => {
        if (qty <= 0) return { label: 'Out of Stock', color: 'text-red-500 bg-red-500/10' };
        if (qty <= 10) return { label: 'Low Stock', color: 'text-amber-500 bg-amber-500/10' };
        return { label: 'In Stock', color: 'text-green-500 bg-green-500/10' };
    };

    const getIcon = (type) => {
        switch (type) {
            case 'Food': return <Popcorn size={20} />;
            case 'Drink': return <Coffee size={20} />;
            case 'Combo': return <Utensils size={20} />;
            default: return <Package size={20} />;
        }
    };

    return (
        <div className="space-y-8 pb-10">
            <div className="flex justify-between items-center text-white">
                <div>
                    <h2 className="text-3xl font-bold">Concession Management</h2>
                    <p className="text-gray-400 mt-1">Manage food, drinks, and special combos.</p>
                </div>
                <button
                    onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-red-600/20 active:scale-95 group"
                >
                    <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                    <span>Add New Product</span>
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-1 rounded-2xl overflow-x-auto no-scrollbar max-w-full">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeCategory === cat.id ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <cat.icon size={16} />
                            <span>{cat.label}</span>
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:border-red-600/50 transition-all text-white"
                    />
                </div>
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <Loader2 className="animate-spin text-red-600" size={40} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredItems.map((item) => (
                        <motion.div
                            key={item._id || item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-[#1a0607]/60 border border-white/10 rounded-3xl overflow-hidden group hover:border-red-600/30 transition-all shadow-xl backdrop-blur-sm"
                        >
                            <div className="aspect-square relative overflow-hidden bg-white/5">
                                {item.imageUrl ? (
                                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" title={item.name} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-700">
                                        {getIcon(item.type || item.category)}
                                    </div>
                                )}
                                <div className="absolute top-4 left-4">
                                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider ${getStockStatus(item.stockQuantity).color}`}>
                                        {getStockStatus(item.stockQuantity).label}
                                    </span>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg text-white group-hover:text-red-500 transition-colors line-clamp-1">{item.name}</h3>
                                    <span className="text-red-500 font-bold">{formatVND(item.price)}</span>
                                </div>
                                <p className="text-gray-500 text-xs line-clamp-2 mb-6 h-8">{item.description || 'No description available'}</p>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => { setEditingItem(item); setIsModalOpen(true); }}
                                        className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition-all border border-white/5 text-white flex items-center justify-center gap-2"
                                    >
                                        <Edit2 size={14} /> Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item._id || item.id)}
                                        className="px-4 py-3 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-xl transition-all border border-red-600/10"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {filteredItems.length === 0 && (
                        <div className="col-span-full py-20 text-center text-gray-500">
                            <Box size={48} className="mx-auto mb-4 opacity-20" />
                            <p>No products found matching your criteria.</p>
                        </div>
                    )}
                </div>
            )}

            <AnimatePresence>
                {isModalOpen && (
                    <ConcessionModal
                        isOpen={isModalOpen}
                        onClose={() => { setIsModalOpen(false); setEditingItem(null); }}
                        item={editingItem}
                        onSave={handleSave}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
