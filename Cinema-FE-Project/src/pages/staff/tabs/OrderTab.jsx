import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { staffService } from "../../../services/staffService";
import {
  Search,
  Ticket,
  Calendar,
  Clock,
  Armchair,
  Coffee,
  QrCode,
  Info,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

export default function OrderTab() {
  const [orderId, setOrderId] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLookup = async () => {
    if (!orderId.trim()) return;
    setLoading(true);
    try {
      const response = await staffService.lookupOrder(orderId.trim());
      setData(response);
    } catch (err) {
      console.error(err);
      setData(null);
      alert("Không tìm thấy đơn hàng hoặc mã đơn không hợp lệ!");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = () => {
    const orderUUID = data?.order?.UUID;
    if (!orderUUID) {
      alert("Đơn hàng chưa có UUID để xem chi tiết.");
      return;
    }
    navigate(`/booking-history/${orderUUID}`);
  };

  return (
    <div className="space-y-8 animate-fadeIn text-white">
      {/* Search Bar Section */}
      <div className="max-w-xl">
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <Ticket className="text-[#E50914]" /> Kiểm tra vé & Đơn hàng
        </h3>
        <div className="relative flex items-center group">
          <div className="absolute left-4 text-gray-400 group-focus-within:text-[#E50914] transition-colors">
            <Search size={20} />
          </div>
          <input
            type="text"
            placeholder="Nhập ID đơn hàng (e.g. 69bfe...)"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLookup()}
            className="w-full bg-[#2F2F2F] border-none text-white pl-12 pr-36 py-4 rounded-xl focus:ring-2 focus:ring-[#E50914]/50 outline-none transition-all shadow-lg"
          />
          <button
            onClick={handleLookup}
            disabled={loading}
            className="absolute right-2 bg-[#E50914] hover:bg-[#b20710] text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? "Đang tìm..." : "Tra cứu"}
          </button>
        </div>
      </div>

      {/* Ticket Result Section */}
      {data ? (
        <div className="max-w-3xl animate-slideUp">
          <div className="relative bg-[#232323] rounded-2xl overflow-hidden border border-white/5 shadow-2xl flex flex-col md:flex-row">
            {/* Left Part: Ticket Info */}
            <div className="flex-1 p-8 border-b md:border-b-0 md:border-r border-dashed border-white/10 relative">
              {/* Header: Phim & Phòng */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1 pr-4">
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest mb-2 inline-block ${
                      data.order?.status === "PAID"
                        ? "bg-green-500/20 text-green-500"
                        : "bg-yellow-500/20 text-yellow-500"
                    }`}
                  >
                    {data.order?.status || "PENDING"}
                  </span>
                  <h4 className="text-2xl font-black leading-tight uppercase text-white">
                    {data.tickets?.[0]?.showtime?.movie?.title ||
                      "PHIM CHƯA XÁC ĐỊNH"}
                  </h4>
                </div>
                <div className="text-right min-w-[80px]">
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-tighter">
                    Phòng chiếu
                  </p>
                  <p className="text-white font-black text-xl">
                    {data.tickets?.[0]?.showtime?.hall?.name || "N/A"}
                  </p>
                </div>
              </div>

              {/* Grid Info: Ngày & Giờ mua */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#E50914]">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold text-nowrap">
                      Ngày mua
                    </p>
                    <p className="text-sm font-bold text-white">
                      {data.order?.createdAt
                        ? new Date(data.order.createdAt).toLocaleDateString(
                            "vi-VN"
                          )
                        : "---"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#E50914]">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold text-nowrap">
                      Giờ mua
                    </p>
                    <p className="text-sm font-bold text-white">
                      {data.order?.createdAt
                        ? new Date(data.order.createdAt).toLocaleTimeString(
                            "vi-VN",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )
                        : "--:--"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Danh sách Ghế */}
              <div className="p-4 bg-black/30 rounded-xl border border-white/5 mb-6">
                <p className="text-[10px] text-gray-500 uppercase font-bold mb-3 flex items-center gap-2">
                  <Armchair size={14} /> Ghế ngồi ({data.tickets?.length || 0})
                </p>
                <div className="flex flex-wrap gap-3">
                  {data.tickets?.map((t, idx) => (
                    <div
                      key={idx}
                      className="bg-white/5 p-2 rounded border border-white/10 min-w-[70px] text-center"
                    >
                      <span className="text-lg font-black text-white block leading-none mb-1">
                        {t.seat?.seatNumber ||
                          (typeof t.seat === "string"
                            ? t.seat.slice(-3).toUpperCase()
                            : "N/A")}
                      </span>
                      <span
                        className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${
                          t.seat?.type === "VIP"
                            ? "text-yellow-500 bg-yellow-500/10"
                            : "text-blue-400 bg-blue-400/10"
                        }`}
                      >
                        {t.seat?.type || "NORMAL"}
                      </span>
                      <p className="text-[9px] text-gray-400 mt-1 font-medium">
                        {Number(t.price || 0).toLocaleString()}₫
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Danh sách Snacks & Combo */}
              <div className="space-y-1">
                <p className="text-[10px] text-gray-500 uppercase font-bold flex items-center gap-2">
                  <Coffee size={14} /> Snacks & Combo đã mua
                </p>
                <p className="text-sm text-gray-300 italic">
                  {data.orderItems?.length > 0
                    ? data.orderItems
                        .map(
                          (i) =>
                            `${i.concession?.name || "Combo"} (x${i.quantity})`
                        )
                        .join(", ")
                    : "Không kèm combo bắp nước"}
                </p>
              </div>

              {/* Nút xem chi tiết sang BookingDetailPage */}
              <div className="mt-6">
                <button
                  onClick={handleViewDetail}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 hover:bg-white/5 text-sm font-semibold transition"
                >
                  <ExternalLink size={14} />
                  Xem chi tiết
                </button>
              </div>

              {/* Răng cưa giả lập vé */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-[#141414] rounded-full hidden md:block" />
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-[#141414] rounded-full hidden md:block" />
            </div>

            {/* Right Part: QR & Payment Info */}
            <div className="w-full md:w-72 bg-[#1c1c1c] p-8 flex flex-col justify-between items-center">
              <div className="text-center w-full">
                <div className="bg-white p-3 rounded-xl inline-block mb-4 shadow-xl">
                  <QrCode size={120} className="text-black" />
                </div>
                <p className="text-[10px] text-gray-500 font-mono mb-6 break-all bg-black/20 p-2 rounded">
                  ID: {data.order?._id}
                </p>

                <div className="text-left w-full space-y-4 border-t border-white/5 pt-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle2
                      size={18}
                      className={
                        data.order?.status === "PAID"
                          ? "text-green-500"
                          : "text-yellow-500"
                      }
                    />
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-bold">
                        Thanh toán
                      </p>
                      <p className="text-xs text-gray-300 font-bold">
                        {data.order?.channel || "ONLINE"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Info size={18} className="text-blue-400" />
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-bold">
                        Khách hàng
                      </p>
                      <p className="text-xs text-gray-200 truncate max-w-[150px]">
                        {data.order?.user?.email || "Khách vãng lai"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center w-full bg-white/5 p-4 rounded-xl border border-white/5">
                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1 tracking-widest">
                  Tổng cộng
                </p>
                <p className="text-3xl font-black text-[#E50914]">
                  {Number(data.order?.totalAmount || 0).toLocaleString()}₫
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        !loading && (
          <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.01]">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/5 rounded-full mb-6 text-gray-700">
              <QrCode size={40} />
            </div>
            <h4 className="text-white font-bold text-lg">Sẵn sàng kiểm tra</h4>
            <p className="text-gray-500 max-w-xs mx-auto mt-2 text-sm">
              Nhập mã định danh từ hệ thống hoặc quét mã trên vé của khách để
              truy xuất nhanh.
            </p>
          </div>
        )
      )}
    </div>
  );
}