import React, { useEffect, useState } from 'react';
import { BarChart3, Download, Loader2 } from 'lucide-react';
import { adminService } from '../../../services/adminService';
import { formatVND } from '../../../utils/format';

export default function RevenueReportsPage() {
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('movie');
    const [movieData, setMovieData] = useState([]);
    const [cinemaData, setCinemaData] = useState([]);
    const [error, setError] = useState(null);
    const [exporting, setExporting] = useState(false);

    const fetchAll = async () => {
        try {
            setLoading(true);
            const [movieRes, cinemaRes] = await Promise.all([
                adminService.getMovieRevenue(),
                adminService.getCinemaRevenue()
            ]);
            setMovieData(movieRes?.data || []);
            setCinemaData(cinemaRes?.data || []);
        } catch (err) {
            setError('Không tải được báo cáo');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            setExporting(true);
            const blob = await adminService.exportMovieRevenue();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'movie-revenue.xlsx';
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            setError('Xuất file thất bại');
        } finally {
            setExporting(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-red-600" size={40} />
            </div>
        );
    }

    const tabs = [
        { id: 'movie', label: 'Doanh thu theo Phim' },
        { id: 'cinema', label: 'Doanh thu theo Rạp' },
    ];

    const data = tab === 'movie' ? movieData : cinemaData;
    const cols = tab === 'movie'
        ? [{ key: 'title', label: 'Phim' }, { key: 'tickets', label: 'Số vé' }, { key: 'revenue', label: 'Doanh thu', format: formatVND }]
        : [{ key: 'branchName', label: 'Chi nhánh' }, { key: 'tickets', label: 'Số vé' }, { key: 'revenue', label: 'Doanh thu', format: formatVND }];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Báo cáo Doanh thu</h2>
                    <p className="text-gray-400 text-sm mt-1">Thống kê theo phim và theo chi nhánh rạp.</p>
                </div>
                {tab === 'movie' && (
                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 rounded-lg text-sm font-medium"
                    >
                        {exporting ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                        Xuất Excel
                    </button>
                )}
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className="flex gap-2 border-b border-white/10 pb-4">
                {tabs.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.id ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-gray-400 text-sm border-b border-white/10">
                            {cols.map((c) => (
                                <th key={c.key} className="px-6 py-4 font-medium">{c.label}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, i) => (
                            <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                                {cols.map((c) => (
                                    <td key={c.key} className="px-6 py-4">
                                        {c.format ? c.format(row[c.key] || 0) : row[c.key] ?? '—'}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        {data.length === 0 && (
                            <tr>
                                <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                                    Chưa có dữ liệu
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
