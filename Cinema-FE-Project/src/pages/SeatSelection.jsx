import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { seatService } from "../services/seatService";
import useSeatSocket from "../hooks/useSeatSocket";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

export default function SeatSelection({ socket, onNext, savedSeats }) {
    const { uuid } = useParams();
    const [scale, setScale] = useState(1);
    const [seatData, setSeatData] = useState({
        movie: null,
        showtime: null,
        hall: null,
        seats: [],
        pricing: {}
    });
    const [selectedSeats, setSelectedSeats] = useState([]);

    const gridRef = useRef(null);

    useEffect(() => {
        const gridEl = gridRef.current;
        if (!gridEl) return;

        const handleWheelNative = (e) => {
            if (e.ctrlKey) {
                e.preventDefault();
                const delta = e.deltaY > 0 ? -0.1 : 0.1;
                setScale(prev => Math.min(Math.max(0.3, prev + delta), 2.5));
            }
        };

        gridEl.addEventListener('wheel', handleWheelNative, { passive: false });
        return () => gridEl.removeEventListener('wheel', handleWheelNative);
    }, []);

    const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 2.5));
    const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.3));
    const resetZoom = () => setScale(1);

    useSeatSocket(socket, setSeatData, setSelectedSeats);

    useEffect(() => {
        if (!uuid) return;

        seatService.getSeatsByShowtime(uuid)
            .then((payload) => {
                console.log("🪑 Payload từ API:", payload); // 🔥 log toàn bộ payload
                console.log("🪑 Chỉ seats:", payload.seats); // 🔥 log riêng mảng seats

                const sortedSeats = [...payload.seats].sort((a, b) =>
                    a.seatNumber.localeCompare(b.seatNumber, undefined, { numeric: true })
                );

                console.log("🪑 Seats đã sort:", sortedSeats); // 🔥 log sau khi sort

                setSeatData({
                    movie: payload.movie,
                    showtime: payload.showtime,
                    hall: payload.hall,
                    seats: sortedSeats,
                    pricing: payload.pricing || {}
                });

            })
            .catch(err => console.error("❌ [API] Lỗi fetch:", err));

    }, [uuid]);

    const resetSelection = () => {
        setSelectedSeats([]);
        console.log("🧹 Đã xóa toàn bộ ghế đã chọn");
    };

    const toggleSeat = (seat) => {
        if (seat.status !== "available") return;
        setSelectedSeats(prev =>
            prev.includes(seat.UUID) ? prev.filter(id => id !== seat.UUID) : [...prev, seat.UUID]
        );
    };

    const handleContinue = async () => {
        if (selectedSeats.length === 0) {
            alert("Trung ơi, chọn ít nhất 1 ghế mới đi tiếp được nhé!");
            return;
        }

        try {
            console.log("⏳ Đang gửi yêu cầu giữ ghế...");

            // 1. Gọi API holdSeats từ service
            const response = await seatService.holdSeats(uuid, selectedSeats);

            // Log kiểm tra
            console.log("✅ [BACKEND LOG] Ghế đã được giữ thành công:", response.data);
            console.log("⏰ Thời gian hết hạn:", new Date(response.data.expiresAt).toLocaleTimeString());

            // 2. Lấy chi tiết ghế đã chọn
            const selectedSeatsDetails = seatData.seats.filter(s => selectedSeats.includes(s.UUID));

            // 3. Gộp tất cả dữ liệu vào 1 object duy nhất
            const bookingDataForConcession = {
                selectedSeats,             // UUID các ghế
                details: selectedSeatsDetails, // chi tiết ghế
                totalPrice: calculateTotal(),  // tổng tiền vé
                pricing: seatData.pricing,     // bảng giá
                movie: seatData.movie,
                showtime: seatData.showtime,
                holdExpiresAt: response.data.expiresAt
            };

            // 4. Gọi callback onNext với 1 object duy nhất
            onNext(bookingDataForConcession);

        } catch (error) {
            console.error("❌ [API ERROR] Lỗi giữ ghế:", error.message);

            // Nâng cấp alert lên Swal cho Trung nè
            Swal.fire({
                title: 'GHẾ ĐÃ CÓ CHỦ!',
                text: 'Rất tiếc, một số ghế Trung chọn vừa có người khác nhanh tay giữ mất rồi. Trung vui lòng chọn lại ghế khác nhé!',
                icon: 'error',
                background: '#111',
                color: '#fff',
                confirmButtonColor: '#E50914',
                confirmButtonText: 'CHỌN LẠI NGAY',
                showClass: {
                    popup: 'animate__animated animate__shakeX' // Hiệu ứng rung nếu Trung có cài animate.css
                },
                backdrop: `rgba(0,0,0,0.8)`, // Làm tối nền phía sau để tập trung vào thông báo
                allowOutsideClick: false,
            });
        }
    };
    const calculateTotal = () => {
        return selectedSeats.reduce((total, seatUUID) => {
            const seat = seatData.seats.find(s => s.UUID === seatUUID);
            if (!seat) return total;
            const price = seatData.pricing[seat.type] || 0;
            return total + price;
        }, 0);
    };

    const groupedSeats = seatData.seats.reduce((acc, seat) => {
        const row = seat.seatNumber.charAt(0);
        if (!acc[row]) acc[row] = [];
        acc[row].push(seat);
        return acc;
    }, {});

    return (
        // Thêm pt-20 (80px) hoặc pt-[20px] tùy ý bạn để né Header
        <div className="bg-[#050505] text-white min-h-screen font-sans selection:bg-red-500 relative pb-40 pt-[40px]">

            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-red-900/5 blur-[120px] pointer-events-none"></div>

            <div className="max-w-6xl mx-auto relative z-10 px-4 py-6 md:py-10">

                {/* HEADER TRONG TRANG */}
                <div className="flex justify-between items-start mb-10 border-b border-white/5 pb-6">
                    <div className="flex-1">
                        <h1 className="text-2xl md:text-4xl font-black tracking-tighter uppercase leading-tight">
                            {seatData.movie?.title || "NETFLIX CINEMA"}
                        </h1>
                        <div className="flex items-center gap-3 mt-2 text-[10px] md:text-xs">
                            <span className="bg-red-600 text-white px-2 py-0.5 rounded font-black">4K</span>
                            <p className="text-gray-500 tracking-widest uppercase font-bold">
                                {seatData.hall?.name} • {seatData.movie?.duration} MIN
                            </p>
                        </div>
                    </div>
                    <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/10 text-right">
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Suất chiếu</p>
                        <p className="font-mono text-red-500 font-bold text-sm md:text-lg uppercase">
                            {seatData.showtime ? new Date(seatData.showtime.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}
                        </p>
                    </div>
                </div>

                {/* SCREEN */}
                <div className="relative mb-24 flex flex-col items-center">
                    <div className="w-[85%] h-[5px] bg-gradient-to-r from-transparent via-[#E50914] to-transparent rounded-full shadow-[0_12px_45px_rgba(229,9,20,0.5)]"></div>
                    <p className="mt-6 text-white-800 text-[10px] tracking-[2em] uppercase font-black ml-[2em]">Màn Hình</p>
                </div>

                {/* SEAT GRID CONTAINER */}
                <div
                    ref={gridRef}
                    className="w-full h-[600px] bg-black/20 rounded-[3rem] border border-white/5 overflow-hidden relative cursor-grab active:cursor-grabbing select-none flex items-center justify-center"
                >
                    {/* Zoom Controls */}
                    <div className="absolute right-8 top-8 z-30 flex flex-col gap-2 bg-[#111]/90 backdrop-blur-2xl p-2.5 rounded-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                        <button onClick={zoomIn} title="Phóng to" className="p-3 hover:bg-white/10 rounded-xl transition-colors text-white border border-white/5"><ZoomIn size={22}/></button>
                        <button onClick={zoomOut} title="Thu nhỏ" className="p-3 hover:bg-white/10 rounded-xl transition-colors text-white border border-white/5"><ZoomOut size={22}/></button>
                        <button onClick={resetZoom} title="Mặc định" className="p-3 hover:bg-white/10 rounded-xl transition-colors text-white border border-white/5"><RotateCcw size={22}/></button>
                    </div>

                    <motion.div
                        drag
                        dragConstraints={gridRef}
                        dragElastic={0.1}
                        dragMomentum={true}
                        animate={{ scale }}
                        initial={{ scale: 0.8 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="p-10 flex flex-col gap-5 md:gap-7 origin-center cursor-grab active:cursor-grabbing"
                    >
                        {Object.entries(groupedSeats).map(([rowLabel, rowSeats]) => (
                            <div key={rowLabel} className="flex items-center justify-center gap-4 md:gap-8">
                                <div className="w-4 text-white-700 font-black text-xs">{rowLabel}</div>
                                <div className="flex gap-2.5 md:gap-4">
                                    {rowSeats.map((seat) => {
                                        const isSelected = selectedSeats.includes(seat.UUID);
                                        const isSold = seat.status === "sold";
                                        const isLockedByOthers = ["held", "pending", "booked", "sold"].includes(seat.status);
                                        const isCouple = seat.type === "COUPLE";

                                        return (
                                            <button
                                                key={seat.UUID}
                                                onClick={() => toggleSeat(seat)}
                                                disabled={isLockedByOthers}
                                                className={`
                                            relative transition-all duration-300 flex items-center justify-center rounded-xl

                                            ${isCouple ? 'w-24 md:w-36 h-12 md:h-16' : 'w-11 h-11 md:w-16 md:h-16'} 

                                            ${isSold ? 'bg-[#1a1a1a] opacity-10 cursor-not-allowed' : 'cursor-pointer shadow-xl'}

                                            ${isSelected
                                                        ? 'bg-[#E50914] scale-110 z-10 shadow-[0_0_25px_rgba(229,9,20,0.5)]'
                                                        : 'bg-[#181818]'
                                                    }
                                            ${isLockedByOthers
                                                        ? 'bg-neutral-900 opacity-30 cursor-not-allowed grayscale'
                                                        : 'cursor-pointer shadow-xl'}        

                                            ${!isSelected && !isSold && seat.type === 'VIP' ? 'border-b-4 border-yellow-500' : ''}

                                            ${!isSelected && !isSold && seat.type === 'COUPLE' ? 'border-b-4 border-pink-500' : ''}

                                            ${!isSelected && !isSold && seat.type === 'NORMAL' ? 'border border-white/5 hover:border-white/20' : ''}
                                            `}
                                            >
                                                <div className="flex flex-col items-center">
                                                    <span className={`text-[11px] md:text-sm font-black ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                                                        {seat.seatNumber}
                                                    </span>
                                                    {!isSelected && !isSold && (
                                                        <span className="text-[7px] md:text-[8px] text-gray-600 mt-1">
                                                            {(seatData.pricing[seat.type] / 1000)}k
                                                        </span>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="w-4 text-white-700 font-black text-xs text-right">{rowLabel}</div>
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* LEGEND - GIỜ LÀ 1 PHẦN CỦA FLOW TRANG */}
                <div className="flex flex-wrap justify-center gap-6 py-8 px-6 bg-white/[0.02] border border-white/5 rounded-[2.5rem] backdrop-blur-xl mb-10">
                    <LegendItem type="available" label="Ghế Thường" price={seatData.pricing.NORMAL} />
                    <LegendItem type="vip" label="Hạng VIP" price={seatData.pricing.VIP} />
                    <LegendItem type="couple" label="Ghế Đôi" price={seatData.pricing.COUPLE} />
                    <LegendItem type="selected" label="Đang chọn" />
                    <LegendItem type="sold" label="Đã bán" />
                </div>

                {/* PAYMENT BAR - CHỈ CẦN MỘT CÁI DUY NHẤT */}
                <div className={`fixed bottom-0 left-0 w-full p-4 md:p-8 transition-all duration-500 z-50 ${selectedSeats.length > 0 ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
                    <div className="max-w-6xl mx-auto bg-[#111]/90 backdrop-blur-3xl border border-white/10 p-5 md:p-6 rounded-[2.5rem] shadow-[0_-20px_50px_rgba(0,0,0,0.5)] flex flex-col lg:flex-row items-center justify-between gap-6">

                        {/* VÙNG CHI TIẾT GHẾ */}
                        <div className="flex flex-wrap items-center gap-4 md:gap-8 w-full lg:w-auto">
                            {/* Badge số lượng ghế */}
                            <div className="w-14 h-14 bg-[#E50914] rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg shrink-0">
                                {selectedSeats.length}
                            </div>

                            {/* Danh sách các loại ghế đã chọn - Chia tầng */}
                            <div className="flex flex-wrap gap-6 border-l border-white/10 pl-6">
                                {['NORMAL', 'VIP', 'COUPLE'].map((type) => {
                                    const seatsOfType = seatData.seats.filter(
                                        s => selectedSeats.includes(s.UUID) && s.type === type
                                    );

                                    // Nếu không có ghế loại này thì không render
                                    if (seatsOfType.length === 0) return null;

                                    return (
                                        <div key={type} className="flex flex-col min-w-[80px]">
                                            <p className={`text-[10px] font-black uppercase tracking-widest ${type === 'VIP' ? 'text-yellow-500' :
                                                type === 'COUPLE' ? 'text-pink-500' : 'text-gray-500'
                                                }`}>
                                                {type === 'NORMAL' ? 'Thường' : type === 'VIP' ? 'Hạng VIP' : 'Ghế Đôi'}
                                            </p>
                                            <p className="text-white font-bold text-sm md:text-base leading-tight">
                                                {seatsOfType.map(s => s.seatNumber).join(", ")}
                                            </p>
                                            <p className="text-[11px] font-mono text-gray-500 mt-1 italic">
                                                {seatsOfType.length} x {seatData.pricing[type]?.toLocaleString()}₫
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* VÙNG TỔNG TIỀN VÀ NÚT ACTION */}
                        <div className="flex items-center justify-between lg:justify-end gap-10 w-full lg:w-auto border-t lg:border-t-0 lg:border-l border-white/10 pt-4 lg:pt-0 lg:pl-10">
                            <div className="text-right">
                                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Tổng thanh toán</p>
                                <p className="text-2xl md:text-4xl font-black text-white leading-none italic">
                                    {calculateTotal().toLocaleString()}
                                    <span className="text-[#E50914] text-sm ml-1 not-italic font-bold text-[16px]">₫</span>
                                </p>
                            </div>
                            <div className="flex gap-3">
                                {/* NÚT RESET */}
                                <button
                                    onClick={resetSelection}
                                    className="group bg-white/5 hover:bg-white/10 text-white p-4 md:p-5 rounded-2xl transition-all border border-white/10 active:scale-95"
                                    title="Xóa tất cả"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6 text-gray-400 group-hover:text-white">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                                    </svg>
                                </button>

                                {/* NÚT TIẾP TỤC */}
                                <button onClick={handleContinue} className="bg-[#E50914] hover:bg-red-700 active:scale-95 text-white px-8 md:px-14 py-4 md:py-5 rounded-2xl font-black text-sm md:text-lg transition-all shadow-xl shadow-red-600/10 uppercase tracking-tighter flex-1 lg:flex-none">
                                    Tiếp tục
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}

function LegendItem({ type, label, price }) {
    const styles = {
        available: "bg-[#181818] border border-white/10",
        vip: "bg-[#181818] border-b-4 border-yellow-600",
        couple: "bg-[#181818] border-b-4 border-pink-600 w-8",
        selected: "bg-[#E50914] shadow-[0_0_15px_rgba(229,9,20,0.4)]",
        sold: "bg-[#1a1a1a] opacity-20"
    };

    return (
        <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
            <div className={`h-4 w-4 rounded-md shrink-0 ${styles[type]}`}></div>
            <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-tighter text-gray-400 font-black leading-none">
                    {label}
                </span>
                {price && (
                    <span className="text-[12px] text-white font-mono font-bold mt-1">
                        {price.toLocaleString()}<span className="text-[10px] text-red-500 ml-0.5">₫</span>
                    </span>
                )}
            </div>
        </div>
    );
}