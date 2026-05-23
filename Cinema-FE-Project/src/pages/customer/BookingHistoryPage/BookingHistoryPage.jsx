import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Receipt,
  Ticket,
  Popcorn,
  CalendarDays,
  MapPin,
  Armchair,
  Clock3,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import { orderService } from "../../../services/orderService";

export default function BookingHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    orderService
      .getBookingHistory()
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch((e) => setErr(e?.message || "Khong tai duoc lich su dat ve"))
      .finally(() => setLoading(false));
  }, []);

  const statusMeta = useMemo(
    () => ({
      PAID: {
        icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
        chip: "bg-emerald-500/15 text-emerald-300 border-emerald-400/20",
        label: "Da thanh toan",
      },
      PENDING: {
        icon: <Clock3 className="w-4 h-4 text-sky-300" />,
        chip: "bg-sky-500/15 text-sky-200 border-sky-400/20",
        label: "Dang cho thanh toan",
      },
      CANCELLED: {
        icon: <XCircle className="w-4 h-4 text-amber-400" />,
        chip: "bg-amber-500/15 text-amber-300 border-amber-400/20",
        label: "Da huy",
      },
      FAILED: {
        icon: <AlertTriangle className="w-4 h-4 text-red-400" />,
        chip: "bg-red-500/15 text-red-300 border-red-400/20",
        label: "That bai",
      },
      UNKNOWN: {
        icon: <Clock3 className="w-4 h-4 text-slate-300" />,
        chip: "bg-slate-500/15 text-slate-300 border-slate-400/20",
        label: "Khong xac dinh",
      },
    }),
    []
  );

  if (loading) {
    return (
      <section className="min-h-screen pt-28 pb-16 px-4 sm:px-6 lg:px-8 text-white">
        <div className="max-w-5xl mx-auto rounded-3xl border border-white/10 bg-black/30 backdrop-blur-xl p-8">
          <div className="flex items-center gap-3 text-slate-300">
            <RefreshCw className="w-4 h-4 animate-spin text-red-400" />
            Dang tai lich su dat ve...
          </div>
        </div>
      </section>
    );
  }

  if (err) {
    return (
      <section className="min-h-screen pt-28 pb-16 px-4 sm:px-6 lg:px-8 text-white">
        <div className="max-w-5xl mx-auto rounded-3xl border border-red-500/20 bg-red-500/5 p-6">
          <p className="text-red-300 font-semibold">Khong the tai du lieu</p>
          <p className="text-sm text-slate-300 mt-2">{err}</p>
          <div className="mt-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#E50914] hover:bg-red-600 transition font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              Ve trang chu
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen pt-28 pb-16 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-5xl mx-auto">
        <div className="rounded-3xl border border-white/10 bg-black/30 backdrop-blur-xl shadow-[0_25px_80px_rgba(0,0,0,0.45)] overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-white/10 bg-gradient-to-r from-[#E50914]/15 to-transparent">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400 font-semibold">
                  Cinema
                </p>
                <h1 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight">
                  Booking History
                </h1>
              </div>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 hover:bg-white/5 transition text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Trang chu
              </Link>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-5">
            {orders.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">
                <Receipt className="w-6 h-6 mx-auto text-slate-400 mb-3" />
                <p className="font-semibold">Ban chua co don dat ve nao</p>
                <p className="text-sm text-slate-400 mt-1">
                  Dat ve lan dau de lich su hien thi tai day.
                </p>
              </div>
            ) : (
              orders.map((order) => {
                const meta = statusMeta[order.status] || statusMeta.UNKNOWN;
                const seats = order.tickets?.map((t) => t.seatNumber).filter(Boolean) || [];
                const firstTicket = order.tickets?.[0];
                const movieTitle = firstTicket?.showtime?.movie?.title || "Unknown movie";
                const hallName = firstTicket?.showtime?.hall?.name || "N/A";
                const showtime = firstTicket?.showtime?.startTime
                  ? new Date(firstTicket.showtime.startTime).toLocaleString("vi-VN")
                  : "N/A";

                return (
                  <article
                    key={order.orderUUID}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden"
                  >
                    <div className="p-5 border-b border-white/10 flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <p className="text-[11px] uppercase tracking-widest text-slate-500">
                          Ma don
                        </p>
                        <p className="font-mono text-sm text-slate-200 break-all">
                          {order.orderUUID}
                        </p>
                        <p className="text-sm text-slate-400 mt-1">
                          {new Date(order.createdAt).toLocaleString("vi-VN")}
                        </p>
                      </div>

                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${meta.chip}`}
                      >
                        {meta.icon}
                        <span>{meta.label}</span>
                      </div>
                    </div>

                    <div className="p-5 grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="flex items-center gap-2 text-slate-200">
                          <Ticket className="w-4 h-4 text-red-400" />
                          <span className="font-semibold">{movieTitle}</span>
                        </p>
                        <p className="flex items-center gap-2 text-sm text-slate-400">
                          <CalendarDays className="w-4 h-4" />
                          {showtime}
                        </p>
                        <p className="flex items-center gap-2 text-sm text-slate-400">
                          <MapPin className="w-4 h-4" />
                          {hallName}
                        </p>
                        <p className="flex items-center gap-2 text-sm text-slate-400">
                          <Armchair className="w-4 h-4" />
                          Ghe: {seats.length ? seats.join(", ") : "N/A"}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="rounded-xl border border-white/10 bg-black/25 px-4 py-3">
                          <p className="text-[11px] uppercase tracking-widest text-slate-500">
                            Tong thanh toan
                          </p>
                          <p className="mt-1 text-lg font-bold text-white">
                            {Number(order.totalAmount || 0).toLocaleString("vi-VN")} đ
                          </p>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-black/25 px-4 py-3">
                          <p className="text-[11px] uppercase tracking-widest text-slate-500 mb-1">
                            Bap nuoc
                          </p>
                          {order.items?.length ? (
                            <ul className="text-sm text-slate-300 space-y-1">
                              {order.items.map((item, idx) => (
                                <li key={`${item.concessionName}-${idx}`} className="flex justify-between gap-3">
                                  <span className="inline-flex items-center gap-2">
                                    <Popcorn className="w-3.5 h-3.5 text-amber-300" />
                                    {item.concessionName} x{item.quantity}
                                  </span>
                                  <span>{Number(item.subtotal || 0).toLocaleString("vi-VN")} đ</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-slate-500">Khong co combo/bap nuoc</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="px-5 pb-5">
                      <Link
                        to={`/booking-history/${order.orderUUID}`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 hover:bg-white/5 text-sm font-semibold transition"
                      >
                        Xem chi tiết
                      </Link>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
}