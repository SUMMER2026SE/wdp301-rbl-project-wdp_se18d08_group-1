// ProfileTab.jsx
import { useEffect, useState } from "react";
import { staffService } from "../../../services/staffService";
import {
    User,
    Mail,
    ShieldCheck,
    Calendar,
    IdCard,
    MapPin,
    CircleDot
} from "lucide-react";

export default function ProfileTab() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        staffService.getProfile()
            .then(data => {
                setProfile(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#E50914]"></div>
            </div>
        );
    }

    if (!profile) return <p className="text-gray-400">Không tìm thấy thông tin hồ sơ.</p>;

    return (
        <div className="animate-fadeIn space-y-8">
            {/* Header Profile */}
            <div className="flex flex-col md:flex-row items-center gap-8 pb-8 border-b border-white/10">
                <div className="relative group">
                    <div className="w-32 h-32 bg-gradient-to-tr from-[#E50914] to-[#45070a] rounded-full flex items-center justify-center shadow-2xl border-4 border-[#181818]">
                        <User size={64} className="text-white group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="absolute bottom-2 right-2 bg-green-500 w-5 h-5 rounded-full border-4 border-[#181818]" title="Đang hoạt động"></div>
                </div>

                <div className="text-center md:text-left space-y-2">
                    <div className="flex flex-col md:flex-row items-center gap-3">
                        <h2 className="text-4xl font-black tracking-tight">{profile.fullName || "Nhân viên FCINEMA"}</h2>
                        <span className="flex items-center gap-1 bg-[#E50914] text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider">
                            <ShieldCheck size={12} /> {profile.role || "Staff"}
                        </span>
                    </div>
                    <p className="text-gray-400 flex items-center justify-center md:justify-start gap-2 text-sm font-medium">
                        <CircleDot size={14} className="text-[#E50914]" />
                        Chịu trách nhiệm vận hành rạp chiếu
                    </p>
                </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email Card */}
                <div className="bg-[#232323] p-5 rounded-lg border border-white/5 flex items-center gap-4 hover:bg-[#2b2b2b] transition-colors group">
                    <div className="w-12 h-12 rounded-md bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-[#E50914] transition-colors">
                        <Mail size={22} />
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Email liên hệ</p>
                        <p className="text-white font-medium">{profile.email}</p>
                    </div>
                </div>

                {/* ID Card */}
                <div className="bg-[#232323] p-5 rounded-lg border border-white/5 flex items-center gap-4 hover:bg-[#2b2b2b] transition-colors group">
                    <div className="w-12 h-12 rounded-md bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-[#E50914] transition-colors">
                        <IdCard size={22} />
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Mã định danh</p>
                        <p className="text-white font-mono">{profile._id ? `#${profile._id.slice(-8).toUpperCase()}` : "N/A"}</p>
                    </div>
                </div>

                {/* Date Card */}
                <div className="bg-[#232323] p-5 rounded-lg border border-white/5 flex items-center gap-4 hover:bg-[#2b2b2b] transition-colors group">
                    <div className="w-12 h-12 rounded-md bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-[#E50914] transition-colors">
                        <Calendar size={22} />
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Ngày gia nhập</p>
                        <p className="text-white font-medium">
                            {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('vi-VN') : "Đang cập nhật"}
                        </p>
                    </div>
                </div>

                {/* Location/Branch Card */}
                <div className="bg-[#232323] p-5 rounded-lg border border-white/5 flex items-center gap-4 hover:bg-[#2b2b2b] transition-colors group">
                    <div className="w-12 h-12 rounded-md bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-[#E50914] transition-colors">
                        <MapPin size={22} />
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Chi nhánh rạp</p>
                        <p className="text-white font-medium">{profile.branchName || "FCINEMA Cinema"}</p>
                    </div>
                </div>
            </div>

            {/* Footer Info */}
            <div className="mt-6 p-4 bg-[#E50914]/5 border border-[#E50914]/20 rounded-md text-xs text-gray-400">
                <p>Ghi chú: Thông tin hồ sơ của bạn được bảo mật bởi hệ thống quản trị FCINEMA. Liên hệ quản lý nếu cần thay đổi thông tin cá nhân.</p>
            </div>
        </div>
    );
}