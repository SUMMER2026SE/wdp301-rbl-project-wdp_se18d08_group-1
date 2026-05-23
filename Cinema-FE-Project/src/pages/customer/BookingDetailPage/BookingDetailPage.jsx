import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowLeft,
  Receipt,
  Ticket,
  Armchair,
  CalendarDays,
  MapPin,
  Popcorn,
  CheckCircle2,
  XCircle,
  Clock3,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { orderService } from "../../../services/orderService";
import { staffService } from "../../../services/staffService";

export default function BookingDetailPage() {
  const { orderUUID } = useParams();
  const { user } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const isStaff = String(user?.role || "").toLowerCase() === "staff";
  const backPath = isStaff ? "/staff" : "/booking-history";
  const backLabel = isStaff ? "Ve Staff Portal" : "Ve lich su dat ve";

  const statusMeta = useMemo(
    () => ({
      PAID: {
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
        chip: "bg-emerald-500/15 text-emerald-300 border-emerald-400/20",
        label: "Da thanh toan",
      },
      PENDING: {
        icon: <Clock3 className="w-5 h-5 text-sky-300" />,
        chip: "bg-sky-500/15 text-sky-200 border-sky-400/20",
        label: "Dang cho thanh toan",
      },
      CANCELLED: {
        icon: <XCircle className="w-5 h-5 text-amber-400" />,
        chip: "bg-amber-500/15 text-amber-300 border-amber-400/20",
        label: "Da huy",
      },
      FAILED: {
        icon: <AlertTriangle className="w-5 h-5 text-red-400" />,
        chip: "bg-red-500/15 text-red-300 border-red-400/20",
        label: "That bai",
      },
      UNKNOWN: {
        icon: <Clock3 className="w-5 h-5 text-slate-300" />,
        chip: "bg-slate-500/15 text-slate-300 border-slate-400/20",
        label: "Khong xac dinh",
      },
    }),
    []
  );

  useEffect(() => {
    if (!orderUUID) {
      setErr("Thieu ma don hang");
      setLoading(false);
      return;
    }

    setLoading(true);
    setErr("");

    const request = isStaff
      ? staffService.getOrderDetailByUUID(orderUUID)
      : orderService.getBookingDetail(orderUUID);

    Promise.resolve(request)
      .then((data) => setOrder(data))
      .catch((e) => setErr(e?.message || "Khong tai duoc chi tiet don"))
      .finally(() => setLoading(false));
  }, [orderUUID, isStaff]);

  if (loading) {
    return (
      <section className="min-h-screen pt-28 pb-16 px-4 sm:px-6 lg:px-8 text-white">
        <div className="max-w-5xl mx-auto rounded-3xl border border-white/10 bg-black/30 backdrop-blur-xl p-8">
          <div className="flex items-center gap-3 text-slate-300">
            <RefreshCw className="w-4 h-4 animate-spin text-red-400" />
            Dang tai chi tiet don...
          </div>
        </div>
      </section>
    );
  }

  if (err || !order) {
    return (
<section className="min-h-screen pt-28 pb-16 px-4 sm:px-6 lg:px-8 text-white">
        <div className="max-w-5xl mx-auto rounded-3xl border border-red-500/20 bg-red-500/5 p-6">
          <p className="text-red-300 font-semibold">Khong the tai chi tiet don</p>
          <p className="text-sm text-slate-300 mt-2">{err || "Don hang khong ton tai"}</p>
          <div className="mt-4 flex gap-3">
            <Link
              to={backPath}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#E50914] hover:bg-red-600 transition font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              {backLabel}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const meta = statusMeta[order.status] || statusMeta.UNKNOWN;
  const firstTicket = order.tickets?.[0];
  const movie = firstTicket?.showtime?.movie;
  const hall = firstTicket?.showtime?.hall;
  const showtime = firstTicket?.showtime?.startTime
    ? new Date(firstTicket.showtime.startTime).toLocaleString("vi-VN")
    : "N/A";

  const ticketsTotal = (order.tickets || []).reduce((sum, t) => sum + Number(t.price || 0), 0);
  const itemsTotal = (order.items || []).reduce((sum, i) => sum + Number(i.subtotal || 0), 0);

  // Safe QR value: khong bi crash khi order null luc initial render
  const bookingUuid = order?.orderUUID || orderUUID;
  const bookingUrl = bookingUuid
    ? `${window.location.origin}/booking-history/${bookingUuid}`
    : "";

  return (
    <section className="min-h-screen pt-28 pb-16 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-5xl mx-auto">
        <div className="rounded-3xl border border-white/10 bg-black/30 backdrop-blur-xl shadow-[0_25px_80px_rgba(0,0,0,0.45)] overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-white/10 bg-gradient-to-r from-[#E50914]/15 to-transparent">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400 font-semibold">
                  Booking Detail
                </p>
                <h1 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight">
                  Chi tiet don dat ve
                </h1>
                <p className="mt-2 text-sm text-slate-400 font-mono break-all">{order.orderUUID}</p>
              </div>

              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${meta.chip}`}
              >
                {meta.icon}
                <span>{meta.label}</span>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-white/10 bg-black/25 px-4 py-3">
                <p className="text-[11px] uppercase tracking-widest text-slate-500">Phim</p>
<p className="mt-1 font-semibold text-slate-200">{movie?.title || "Unknown movie"}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/25 px-4 py-3">
                <p className="text-[11px] uppercase tracking-widest text-slate-500">Thoi gian dat</p>
                <p className="mt-1 font-semibold text-slate-200">
                  {new Date(order.createdAt).toLocaleString("vi-VN")}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/25 px-4 py-3">
                <p className="text-[11px] uppercase tracking-widest text-slate-500">Suat chieu</p>
                <p className="mt-1 font-semibold text-slate-200 inline-flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-slate-400" />
                  {showtime}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/25 px-4 py-3">
                <p className="text-[11px] uppercase tracking-widest text-slate-500">Rap / Phong</p>
                <p className="mt-1 font-semibold text-slate-200 inline-flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {hall?.name || "N/A"}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
              <div className="px-5 py-4 border-b border-white/10 flex items-center gap-2">
                <Ticket className="w-4 h-4 text-red-400" />
                <h2 className="font-bold">Danh sach ve</h2>
              </div>
              <div className="p-5 space-y-3">
                {(order.tickets || []).map((t) => (
                  <div
                    key={t.ticketUUID}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/25 px-4 py-3"
                  >
                    <div className="text-sm text-slate-300">
                      <p className="font-mono text-xs text-slate-500 mb-1">{t.ticketUUID}</p>
                      <p className="inline-flex items-center gap-2">
                        <Armchair className="w-4 h-4 text-slate-400" />
                        Ghe {t.seatNumber} ({t.seatType})
                      </p>
                    </div>
                    <p className="font-semibold text-white">
                      {Number(t.price || 0).toLocaleString("vi-VN")} đ
                    </p>
                  </div>
                ))}
                {(order.tickets || []).length === 0 && (
                  <p className="text-sm text-slate-500">Khong co ve nao trong don nay.</p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
<div className="px-5 py-4 border-b border-white/10 flex items-center gap-2">
                <Popcorn className="w-4 h-4 text-amber-300" />
                <h2 className="font-bold">Combo / Bap nuoc</h2>
              </div>
              <div className="p-5 space-y-3">
                {(order.items || []).map((item, idx) => (
                  <div
                    key={`${item.concessionName}-${idx}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/25 px-4 py-3"
                  >
                    <p className="text-sm text-slate-300">
                      {item.concessionName} x{item.quantity}
                    </p>
                    <p className="font-semibold text-white">
                      {Number(item.subtotal || 0).toLocaleString("vi-VN")} đ
                    </p>
                  </div>
                ))}
                {(order.items || []).length === 0 && (
                  <p className="text-sm text-slate-500">Khong co combo trong don nay.</p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/25 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Receipt className="w-4 h-4 text-slate-300" />
                <h2 className="font-bold">Tong ket thanh toan</h2>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/25 p-5 mb-4">
                <h2 className="font-bold mb-3">Ma QR ve</h2>
                {bookingUrl ? (
                  <>
                    <div className="bg-white p-3 rounded-xl inline-block">
                      <QRCodeSVG value={bookingUrl} size={180} />
                    </div>
                    {/* <p className="mt-3 text-xs text-slate-400 break-all">{bookingUrl}</p> */}
                  </>
                ) : (
                  <p className="text-sm text-slate-500">Khong tao duoc QR cho don nay.</p>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-300">
                  <span>Tien ve</span>
                  <span>{ticketsTotal.toLocaleString("vi-VN")} đ</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Tien combo</span>
                  <span>{itemsTotal.toLocaleString("vi-VN")} đ</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Voucher</span>
                  <span>{order.voucherCode || "Khong ap dung"}</span>
                </div>
                <div className="h-px bg-white/10 my-2" />
                <div className="flex justify-between text-white font-bold text-base">
                  <span>Tong thanh toan</span>
                  <span>{Number(order.totalAmount || 0).toLocaleString("vi-VN")} đ</span>
</div>
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              <Link
                to={backPath}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/15 hover:bg-white/5 transition font-semibold"
              >
                <ArrowLeft className="w-4 h-4" />
                {backLabel}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
