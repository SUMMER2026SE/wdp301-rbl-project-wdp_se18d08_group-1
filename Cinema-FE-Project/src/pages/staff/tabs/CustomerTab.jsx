// CustomerTab.jsx
import { useState } from "react";
import { staffService } from "../../../services/staffService";
import {
    Search,
    User,
    Mail,
    Phone,
    Calendar,
    CreditCard,
    Star,
    ShieldCheck,
    History,
    Ticket,
    ShoppingBag
} from "lucide-react";

export default function CustomerTab() {
    const [phone, setPhone] = useState("");
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleLookup = async () => {
        if (!phone) return;
        setLoading(true);
        try {
            const customerData = await staffService.lookupCustomer(phone);
            console.log("FULL CUSTOMER:", customerData);
            console.log("ORDERS:", customerData.orders);

            setCustomer(customerData); // dùng thẳng object trả về
        } catch (err) {
            console.error(err);
            setCustomer(null);
            alert("Không tìm thấy khách hàng!");
        }
        setLoading(false);
    };
    return (
        <div className="space-y-10 animate-fadeIn pb-10">
            {/* Search Header */}
            <div className="max-w-xl">
                <h3 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
                    <Search className="text-[#E50914]" /> Tra cứu thành viên
                </h3>
                <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center text-gray-400 group-focus-within:text-[#E50914] transition-colors pointer-events-none">
                        <Phone size={20} />
                    </div>
                    <input
                        type="text"
                        placeholder="Nhập số điện thoại khách hàng..."
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                        className="w-full bg-[#2F2F2F] border-2 border-transparent focus:border-[#E50914]/50 text-white pl-12 pr-36 py-4 rounded-2xl outline-none transition-all shadow-2xl placeholder:text-gray-500"
                    />
                    <button
                        onClick={handleLookup}
                        disabled={loading}
                        className="absolute right-2 top-2 bottom-2 bg-[#E50914] hover:bg-[#b20710] text-white px-6 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
                    >
                        {loading ? "Đang quét..." : "Tìm kiếm"}
                    </button>
                </div>
            </div>

            {customer ? (
                <div className="space-y-8 animate-slideUp">
                    {/* Top Section: Card & Basic Stats */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* VIP Membership Card */}
                        <div className="lg:col-span-1">
                            <div className="relative overflow-hidden aspect-[1.6/1] bg-gradient-to-br from-[#1a1a1a] to-[#000] rounded-3xl border border-white/10 p-6 shadow-2xl flex flex-col justify-between">
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#E50914]/20 blur-[50px] rounded-full"></div>
                                <div className="flex justify-between items-start z-10">
                                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                                        <Star className="text-[#E50914] fill-[#E50914]" size={24} />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black tracking-widest text-white/40 uppercase">Membership</p>
                                        <span className="text-[#E50914] font-black italic text-lg">FCINEMA</span>
                                    </div>
                                </div>
                                <div className="z-10">
                                    <h4 className="text-white text-2xl font-black tracking-wide mb-1 uppercase leading-tight">
                                        {customer.fullName}
                                    </h4>
                                    <p className="text-gray-500 text-xs font-mono tracking-tighter uppercase">
                                        ID: {customer._id?.slice(-12)}
                                    </p>
                                </div>
                                <div className="flex justify-between items-end z-10 border-t border-white/5 pt-4">
                                    <span className="bg-[#E50914] text-white text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-wider">
                                        {customer.role === 'customer' ? 'Premium Member' : customer.role}
                                    </span>
                                    <ShieldCheck className="text-green-500" size={20} />
                                </div>
                            </div>
                        </div>

                        {/* Stats Info */}
                        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-[#232323] p-6 rounded-3xl border border-white/5 flex items-center gap-6">
                                <div className="w-14 h-14 rounded-2xl bg-[#E50914]/10 flex items-center justify-center text-[#E50914]">
                                    <ShoppingBag size={28} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">Tổng đơn hàng</p>
                                    <p className="text-3xl font-black text-white">{customer.orders?.length || 0}</p>
                                </div>
                            </div>
                            <div className="bg-[#232323] p-6 rounded-3xl border border-white/5 flex items-center gap-6">
                                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                    <Calendar size={28} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">Ngày gia nhập</p>
                                    <p className="text-lg font-bold text-white">
                                        {new Date(customer.createdAt).toLocaleDateString('vi-VN')}
                                    </p>
                                </div>
                            </div>
                            <div className="md:col-span-2 bg-[#232323] p-6 rounded-3xl border border-white/5 flex flex-wrap gap-8">
                                <div className="flex items-center gap-4">
                                    <Mail className="text-gray-500" size={18} />
                                    <p className="text-sm text-white font-medium">{customer.email}</p>
                                </div>
                                <div className="flex items-center gap-4 border-l border-white/10 pl-8">
                                    <Phone className="text-gray-500" size={18} />
                                    <p className="text-sm text-white font-medium">{customer.phoneNumber}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* NEW: Recent Orders Section */}
                    <div className="space-y-4">
                        <h4 className="text-xl font-bold text-white flex items-center gap-2">
                            <History size={20} className="text-[#E50914]" /> Lịch sử giao dịch gần đây
                        </h4>
                        <div className="grid grid-cols-1 gap-4">
                            {customer.orders?.length > 0 ? (
                                customer.orders.map((order) => (
                                    <div key={order._id} className="bg-[#1a1a1a] border border-white/5 p-5 rounded-2xl flex flex-wrap items-center justify-between hover:bg-[#222] transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-gray-400">
                                                <Ticket size={24} />
                                            </div>
                                            <div>
                                                <p className="text-white font-bold">Đơn hàng #{order._id.slice(-6).toUpperCase()}</p>
                                                <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-8 items-center mt-4 sm:mt-0 w-full sm:w-auto justify-between">
                                            <div className="text-right">
                                                <p className="text-[10px] text-gray-500 uppercase font-bold">Số lượng vé</p>
                                                <p className="text-white font-bold">{order.tickets?.length || 0}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] text-gray-500 uppercase font-bold">Tổng tiền</p>
                                                <p className="text-[#E50914] font-black">{order.totalAmount?.toLocaleString()}đ</p>
                                            </div>
                                            <div className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-wider border border-green-500/20">
                                                {order.status}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 italic text-sm">Khách hàng chưa có giao dịch nào.</p>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                !loading && (
                    <div className="py-24 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[2rem] bg-white/[0.01]">
                        <div className="flex items-center justify-center w-20 h-20 bg-white/5 rounded-full mb-6 text-gray-600 border border-white/5">
                            <User size={40} />
                        </div>
                        <h4 className="text-white font-bold text-xl tracking-tight">Hệ thống sẵn sàng</h4>
                        <p className="text-gray-500 max-w-xs mx-auto mt-2 text-center px-6">
                            Nhập số điện thoại để kiểm tra quyền lợi và lịch sử đơn hàng của khách hàng.
                        </p>
                    </div>
                )
            )}
        </div>
    );
}