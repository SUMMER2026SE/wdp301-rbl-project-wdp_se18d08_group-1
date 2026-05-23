import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Construction } from 'lucide-react';

export default function GenericManagementPage({ title, description }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-[calc(100vh-12rem)] flex flex-col items-center justify-center text-center space-y-6"
        >
            <div className="w-24 h-24 bg-red-600/10 rounded-full flex items-center justify-center text-red-500 animate-pulse">
                <Construction size={48} />
            </div>
            <div>
                <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                    {title}
                </h2>
                <p className="text-gray-400 mt-2 text-lg max-w-md mx-auto">
                    {description || "We're currently building this module to give you the best management experience."}
                </p>
            </div>
            <button className="flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 px-8 py-3 rounded-2xl transition-all">
                <Settings size={20} />
                <span>Configure Module Settings</span>
            </button>
        </motion.div>
    );
}
