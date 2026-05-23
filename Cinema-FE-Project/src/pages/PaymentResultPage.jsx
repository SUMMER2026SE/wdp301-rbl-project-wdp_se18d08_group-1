import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  Clock3,
  AlertTriangle,
  RefreshCw,
  ArrowLeft,
  Receipt,
} from "lucide-react";
import { paymentService } from "../services/paymentService";

export default function PaymentResultPage() {
  const [params] = useSearchParams();

  const orderCode = params.get("orderCode");
  const cancelFlag = (params.get("cancel") || "").toLowerCase();
  const canceledFlag = (params.get("canceled") || "").toLowerCase();
  const statusParam = (params.get("status") || "").toUpperCase();

  // Ho tro nhieu kieu query param do payOS/BE tra ve
  const canceled =
    cancelFlag === "true" ||
    canceledFlag === "true" ||
    statusParam === "CANCELLED";

  const [status, setStatus] = useState("PENDING");
  const [message, setMessage] = useState("Dang kiem tra trang thai thanh toan...");
  const [loading, setLoading] = useState(true);

  const statusMeta = useMemo(() => {
    switch (status) {
      case "PAID":
        return {
          icon: <CheckCircle2 className="w-6 h-6 text-emerald-400" />,
          chip: "bg-emerald-500/15 text-emerald-300 border-emerald-400/20",
          title: "Thanh toan thanh cong",
          text: "Ve cua ban da duoc xac nhan. Chuc ban xem phim vui ve!",
        };
      case "CANCELLED":
        return {
          icon: <XCircle className="w-6 h-6 text-amber-400" />,
          chip: "bg-amber-500/15 text-amber-300 border-amber-400/20",
          title: "Don thanh toan da huy",
          text: "Ban co the quay lai va thanh toan lai bat cu luc nao.",
        };
      case "FAILED":
        return {
          icon: <AlertTriangle className="w-6 h-6 text-red-400" />,
          chip: "bg-red-500/15 text-red-300 border-red-400/20",
          title: "Thanh toan that bai",
          text: "Co loi xay ra trong qua trinh xu ly thanh toan.",
        };
      default:
        return {
          icon: <Clock3 className="w-6 h-6 text-sky-300" />,
          chip: "bg-sky-500/15 text-sky-200 border-sky-400/20",
          title: "Dang xu ly thanh toan",
          text: "He thong dang doi ket qua tu cong thanh toan.",
        };
    }
  }, [status]);

  useEffect(() => {
    if (!orderCode) {
      setStatus("FAILED");
      setMessage("Thieu orderCode trong URL.");
      setLoading(false);
      return;
    }

    let timer = null;
    let stopped = false;
    let cancelSent = false;
    const startedAt = Date.now();

    const run = async () => {
      try {
        // Neu user huy o payOS => goi API cancel 1 lan de chot trang thai
        if (canceled && !cancelSent && typeof paymentService.cancelPayment === "function") {
          await paymentService.cancelPayment(orderCode);
          cancelSent = true;
        }

        const s = await paymentService.getPaymentStatus(orderCode);
        setStatus(s.status);

        if (s.status === "PAID") {
          setMessage("Giao dich da thanh cong. Don hang: " + (s.orderUUID || "N/A"));
          setLoading(false);
          return;
        }

        if (s.status === "CANCELLED") {
          setMessage("Giao dich da bi huy.");
          setLoading(false);
          return;
        }

        if (s.status === "FAILED") {
          setMessage(s.failReason || "Giao dich that bai.");
          setLoading(false);
          return;
        }

        // PENDING: poll toi da 60 giay
        if (Date.now() - startedAt > 60000) {
          setStatus("FAILED");
          setMessage("Qua thoi gian cho ket qua. Vui long kiem tra lai lich su don hang.");
          setLoading(false);
          return;
        }

        if (!stopped) timer = setTimeout(run, 2500);
      } catch (e) {
        setStatus("FAILED");
        setMessage(e?.message || "Khong the kiem tra trang thai thanh toan.");
        setLoading(false);
      }
    };

    run();

    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
    };
  }, [orderCode, canceled]);

  return (
    <section className="min-h-screen pt-28 pb-16 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-3xl mx-auto">
        <div className="rounded-3xl border border-white/10 bg-black/30 backdrop-blur-xl shadow-[0_25px_80px_rgba(0,0,0,0.45)] overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-white/10 bg-gradient-to-r from-[#E50914]/15 to-transparent">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400 font-semibold">
                  Payment Result
                </p>
                <h1 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight">
                  Ket qua thanh toan
                </h1>
              </div>

              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${statusMeta.chip}`}
              >
                {statusMeta.icon}
                <span>{status}</span>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-center gap-3 mb-3">
                <Receipt className="w-5 h-5 text-slate-300" />
                <h2 className="text-lg font-bold">{statusMeta.title}</h2>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">{statusMeta.text}</p>
              <p className="mt-3 text-sm text-slate-400">{message}</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-white/10 bg-black/25 px-4 py-3">
                <p className="text-[11px] uppercase tracking-widest text-slate-500">Order Code</p>
                <p className="mt-1 font-mono text-sm text-slate-200 break-all">{orderCode || "N/A"}</p>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/25 px-4 py-3">
                <p className="text-[11px] uppercase tracking-widest text-slate-500">Trang thai</p>
                <p className="mt-1 font-semibold text-slate-200">{status}</p>
              </div>
            </div>

            {loading && (
              <div className="flex items-center gap-3 text-slate-300 text-sm">
                <RefreshCw className="w-4 h-4 animate-spin text-red-400" />
                Dang dong bo ket qua tu he thong thanh toan...
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#E50914] hover:bg-red-600 transition font-semibold"
              >
                <ArrowLeft className="w-4 h-4" />
                Ve trang chu
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}