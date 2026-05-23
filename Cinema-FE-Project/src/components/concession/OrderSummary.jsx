import React from "react";

export const OrderSummary = ({
  movieTitle,
  posterUrl,
  bookingDetails = [],
  showtime,
  items = [],
  ticketTotal = 0,
  pricing = {},
  total = 0,
  onProceed,

  voucherCode = "",
  onVoucherCodeChange,
  onApplyVoucher,
  onClearVoucher,
  voucherApplied = null,
  voucherError = "",
  applyingVoucher = false,
  subTotal = 0,
  discountAmount = 0,
}) => {
  const formattedShowtime = showtime
    ? `${new Date(showtime).toLocaleDateString()} • ${new Date(showtime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`
    : "-";

  return (
    <aside className="w-full h-full bg-[#0a0a0a]/90 flex flex-col border-l border-white/10">
      {/* Header Phim */}
      <div className="p-6 border-b border-white/10 flex gap-4">
        {posterUrl && (
          <img src={posterUrl} alt={movieTitle} className="w-20 h-28 object-cover rounded-lg shadow-2xl border border-white/10" />
        )}
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-1">{movieTitle || "Unknown Movie"}</h3>
          <p className="text-gray-400 text-sm">
            Seats: {bookingDetails.map((d) => d.seatNumber).join(", ") || "-"}
          </p>
          <p className="text-gray-500 text-[10px] uppercase tracking-wider mt-1">{formattedShowtime}</p>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {/* Ticket */}
        <div className="flex justify-between items-center">
          <span className="text-white font-medium">Tickets</span>
          <span className="text-white font-bold">{ticketTotal.toLocaleString()}₫</span>
        </div>

        {/* Snacks */}
        <div className="pt-4 border-t border-white/10">
          <p className="text-gray-400 text-[10px] uppercase tracking-widest mb-2">Snacks Added</p>
          <div className="space-y-2">
            {items.length > 0 ? (
              items.map((item, index) => (
                <div key={index} className="flex justify-between items-center text-white">
                  <span>
                    {item.name} x{item.quantity}
                  </span>
                  <span className="font-bold">{(item.price * item.quantity).toLocaleString()}₫</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic text-[12px]">No snacks added yet</p>
            )}
          </div>
        </div>

        {/* Voucher moved here */}
        <div className="pt-4 border-t border-white/10">
          <p className="text-gray-400 text-[10px] uppercase tracking-widest mb-2">Voucher</p>

          <div className="flex gap-2">
            <input
              type="text"
              value={voucherCode}
              onChange={(e) => onVoucherCodeChange?.(e.target.value.toUpperCase())}
              placeholder="Nhập mã giảm giá..."
              className="flex-1 rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm outline-none focus:border-red-500/40"
            />
            <button
              type="button"
              onClick={onApplyVoucher}
              disabled={applyingVoucher}
              className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-bold disabled:opacity-50"
            >
              {applyingVoucher ? "..." : "Áp dụng"}
            </button>
          </div>

          {voucherApplied && (
            <div className="mt-2 flex items-center justify-between">
              <p className="text-emerald-400 text-xs">
                Giảm {Number(discountAmount || 0).toLocaleString()}₫
              </p>
              <button
                type="button"
                onClick={onClearVoucher}
                className="text-xs text-slate-300 hover:text-white underline"
              >
                Bỏ mã
              </button>
            </div>
          )}

          {!voucherApplied && voucherError && (
            <p className="mt-2 text-red-400 text-xs">{voucherError}</p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-white/10 bg-[#111]/70">
        <div className="space-y-1 mb-4 text-sm">
          <div className="flex justify-between text-gray-400">
            <span>Tạm tính</span>
            <span>{Number(subTotal || 0).toLocaleString()}₫</span>
          </div>
          <div className="flex justify-between text-emerald-400">
            <span>Giảm voucher</span>
            <span>-{Number(discountAmount || 0).toLocaleString()}₫</span>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-400 uppercase text-xs tracking-widest">Total Payable</span>
          <span className="text-2xl font-bold text-white">{Number(total || 0).toLocaleString()}₫</span>
        </div>

        <button
          onClick={onProceed}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-red-600/20 transition-transform active:scale-95"
        >
          Thanh toán
        </button>
      </div>
    </aside>
  );
};