import React, { useState, useEffect } from "react";
import { ProgressBar } from "../../../components/concession/ProgressBar";
import { HeroSnackCard } from "../../../components/concession/HeroSnackCard";
import { SnackCard } from "../../../components/concession/SnackCard";
import { OrderSummary } from "../../../components/concession/OrderSummary";
import { concessionService } from "../../../services/concessionService";
import { voucherService } from "../../../services/voucherService";
import Swal from 'sweetalert2';

const ConcessionPage = ({ bookingData, onNext, onBack }) => {
  const [snacks, setSnacks] = useState([]);
  const [addedSnacks, setAddedSnacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [selectedSeats, setSelectedSeats] = useState(
    bookingData?.details?.map(s => s.UUID) || []
  );

  useEffect(() => {
    if (bookingData?.details) {
      setSelectedSeats(bookingData.details.map(s => s.UUID));
    }
  }, [bookingData]);

  // Voucher states
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherApplied, setVoucherApplied] = useState(null);
  const [voucherError, setVoucherError] = useState("");
  const [applyingVoucher, setApplyingVoucher] = useState(false);

  // Log dữ liệu ghế và vé
  useEffect(() => {
    if (bookingData) {
      console.log("🎬 [CONCESSION LOG] Dữ liệu từ trang ghế truyền sang:");
      console.log("- Suất chiếu UUID:", bookingData.showtime?.UUID);
      console.log("- Ghế đã chọn:", bookingData.details?.map((s) => s.seatNumber).join(", "));
      console.log("- Tổng tiền vé:", bookingData.totalPrice?.toLocaleString(), "₫");
      console.log("- Thời hạn giữ ghế (expiresAt):", bookingData.holdExpiresAt);
    }
  }, [bookingData]);

  // Đồng hồ đếm ngược giữ ghế
  useEffect(() => {
    if (!bookingData?.holdExpiresAt) return;

    const timer = setInterval(() => {
      const now = Date.now();
      const expiresAt = new Date(bookingData.holdExpiresAt).getTime();
      const distance = expiresAt - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft("00:00");

        // THAY THẾ ALERT BẰNG SWEETALERT2
        Swal.fire({
          title: 'HẾT THỜI GIAN GIỮ GHẾ!',
          text: 'Phiên giao dịch của bạn đã hết hạn. Vui lòng chọn lại ghế.',
          icon: 'warning',
          background: '#111', // Nền tối hợp với app
          color: '#fff',      // Chữ trắng
          confirmButtonColor: '#E50914', // Màu đỏ Netflix/Cinema
          confirmButtonText: 'QUAY LẠI',
          allowOutsideClick: false, // Ép người dùng phải bấm nút
        }).then((result) => {
          if (result.isConfirmed) {
            onBack();
          }
        });

      } else {
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(`${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [bookingData, onBack]);

  // Lấy danh sách snack từ API
  useEffect(() => {
    concessionService
      .getAll()
      .then((res) => {
        const items = res.data.map((item) => ({
          ...item,
          id: item._id,
          price: Number(item.price),
          quantity: 0,
        }));
        setSnacks(items);
      })
      .catch((err) => {
        console.error("❌ Lỗi fetch bắp nước:", err);
        setError("Không thể tải danh sách bắp nước.");
      })
      .finally(() => setLoading(false));
  }, []);

  // Phân loại snacks
  const categories = {
    combos: snacks.filter((s) => s.type === "Combo"),
    foods: snacks.filter((s) => s.type === "Food"),
    drinks: snacks.filter((s) => s.type === "Drink"),
    others: snacks.filter((s) => !["Combo", "Food", "Drink"].includes(s.type)),
  };

  const updateQuantity = (snackId, delta) => {
    setAddedSnacks((prev) => {
      const existingItem = prev.find((item) => item.id === snackId);

      if (existingItem) {
        const newQuantity = existingItem.quantity + delta;
        if (newQuantity <= 0) {
          return prev.filter((item) => item.id !== snackId);
        }
        return prev.map((item) =>
          item.id === snackId ? { ...item, quantity: newQuantity } : item
        );
      }

      if (delta > 0) {
        const snackData = snacks.find((s) => s.id === snackId);
        if (snackData) return [...prev, { ...snackData, quantity: 1 }];
      }

      return prev;
    });
  };

  const getItemQuantity = (id) => {
    const item = addedSnacks.find((s) => s.id === id);
    return item ? item.quantity : 0;
  };

  // Tổng tiền (khai báo đúng thứ tự)
  const ticketTotal = Number(bookingData?.totalPrice || 0);
  const snacksTotal = addedSnacks.reduce(
    (sum, s) => sum + Number(s.price) * Number(s.quantity),
    0
  );
  const subTotal = ticketTotal + snacksTotal;
  const discountAmount = Number(voucherApplied?.discountAmount || 0);
  const totalPayable = Math.max(subTotal - discountAmount, 0);

  // Reset voucher khi giỏ thay đổi
  useEffect(() => {
    setVoucherApplied(null);
    setVoucherError("");
  }, [ticketTotal, snacksTotal]);

  const handleApplyVoucher = async () => {
    try {
      setApplyingVoucher(true);
      setVoucherError("");

      const code = voucherCode.trim();
      if (!code) throw new Error("Vui lòng nhập mã voucher.");
      if (subTotal <= 0) throw new Error("Không có gì để áp dụng voucher.");

      const result = await voucherService.applyVoucher({
        code,
        totalAmount: subTotal,
      });

      setVoucherApplied(result);
    } catch (err) {
      setVoucherApplied(null);
      setVoucherError(err.message || "Không thể áp dụng voucher.");
    } finally {
      setApplyingVoucher(false);
    }
  };

  const clearVoucher = () => {
    setVoucherApplied(null);
    setVoucherError("");
    setVoucherCode("");
  };

  const handlePayment = () => {
    if (!onNext) return;

    const snacksPayload = addedSnacks
      .filter((s) => s.quantity > 0)
      .map((s) => ({
        id: s.id,
        UUID: s.UUID,
        name: s.name,
        quantity: s.quantity,
        price: s.price,
      }));

    onNext({
      ...bookingData,
      selectedSeats,
      snacks: snacksPayload,
      snacksTotal,
      subtotal: subTotal,
      discountAmount,
      finalTotal: totalPayable,
      voucherCode: voucherApplied ? voucherCode.trim() : null,
      voucherUUID: null,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="font-black text-sm tracking-widest uppercase">Đang chuẩn bị bắp nước...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#050505] text-white font-sans">

      {/* Đồng hồ đếm ngược */}
      <div
        style={{ paddingTop: '80px' }}
        className="bg-red-600/10 border-b border-red-600/20 py-2 text-center backdrop-blur-md"
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-500">
          Ghế của bạn được giữ trong:
          <span className="text-white font-mono text-sm ml-2">{timeLeft}</span>
        </p>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        <div className="absolute top-0 left-1/4 w-full h-[500px] bg-red-900/5 blur-[120px] pointer-events-none" />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar scroll-smooth">
          <ProgressBar currentStep={2} />

          <div className="max-w-6xl mx-auto mt-10">
            <div className="mb-10">
              <h2 className="text-3xl font-black uppercase tracking-tighter border-l-8 border-red-600 pl-4">
                Tiếp sức xem phim
              </h2>
              {error && <p className="mt-3 text-red-400 text-sm">{error}</p>}
            </div>

            {/* Combo */}
            {categories.combos.length > 0 && (
              <section className="mb-12">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600 mb-6 flex items-center gap-4">
                  <span>Combo Khuyến Mãi</span>
                  <div className="h-[1px] flex-1 bg-red-600/20" />
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-6">
                  {categories.combos.map((combo) => (
                    <HeroSnackCard
                      key={combo.id}
                      {...combo}
                      quantity={getItemQuantity(combo.id)}
                      onAdd={() => updateQuantity(combo.id, 1)}
                      onRemove={() => updateQuantity(combo.id, -1)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Foods */}
            {categories.foods.length > 0 && (
              <section className="mb-12">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-6 flex items-center gap-4">
                  <span>Bắp & Đồ ăn</span>
                  <div className="h-[1px] flex-1 bg-white/10" />
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {categories.foods.map((snack) => (
                    <SnackCard
                      key={snack.id}
                      {...snack}
                      quantity={getItemQuantity(snack.id)}
                      onAdd={() => updateQuantity(snack.id, 1)}
                      onRemove={() => updateQuantity(snack.id, -1)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Drinks */}
            {categories.drinks.length > 0 && (
              <section className="mb-24 lg:mb-12">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 mb-6 flex items-center gap-4">
                  <span>Nước giải khát</span>
                  <div className="h-[1px] flex-1 bg-blue-500/20" />
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {categories.drinks.map((snack) => (
                    <SnackCard
                      key={snack.id}
                      {...snack}
                      quantity={getItemQuantity(snack.id)}
                      onAdd={() => updateQuantity(snack.id, 1)}
                      onRemove={() => updateQuantity(snack.id, -1)}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        </main>

        {/* Sidebar */}
        <aside className="hidden lg:block w-[400px] border-l border-white/5 bg-[#0a0a0a]/50 backdrop-blur-2xl">
          <OrderSummary
            items={addedSnacks}
            ticketTotal={ticketTotal}
            total={totalPayable}
            onProceed={handlePayment}
            bookingDetails={bookingData?.details || []}
            pricing={bookingData?.pricing || {}}
            movieTitle={bookingData?.movie?.title || "Unknown Movie"}
            posterUrl={bookingData?.movie?.posterUrl}
            showtime={bookingData?.showtime?.startTime}
            voucherCode={voucherCode}
            onVoucherCodeChange={setVoucherCode}
            onApplyVoucher={handleApplyVoucher}
            onClearVoucher={clearVoucher}
            voucherApplied={voucherApplied}
            voucherError={voucherError}
            applyingVoucher={applyingVoucher}
            subTotal={subTotal}
            discountAmount={discountAmount}
          />
        </aside>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full p-4 bg-[#111]/95 backdrop-blur-2xl border-t border-white/10 z-50">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <div>
            <p className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">Tổng cộng</p>
            <p className="text-xl font-black text-white italic">
              {totalPayable.toLocaleString()}
              <span className="text-red-600 not-italic ml-1 text-sm">₫</span>
            </p>
            {discountAmount > 0 && (
              <p className="text-emerald-400 text-xs mt-1">Đã giảm {discountAmount.toLocaleString()}₫</p>
            )}
          </div>
          <button
            onClick={handlePayment}
            className="bg-[#E50914] px-10 py-3.5 rounded-2xl font-black uppercase text-sm shadow-lg shadow-red-600/20 active:scale-95 transition-transform"
          >
            Thanh toán
          </button>
        </div>
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default ConcessionPage;