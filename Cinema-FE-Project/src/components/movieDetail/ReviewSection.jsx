import { useState, useEffect, useCallback } from "react";
import {
  Star,
  MessageSquare,
  Send,
  ChevronDown,
  ChevronUp,
  Loader2,
  Lock,
  LogIn,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { fetchReviewsByMovie, submitReview } from "../../services/reviewService";

function StarRow({ rating, interactive, onChange, size = "md" }) {
  const [hover, setHover] = useState(0);
  const sz = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-8 h-8" };
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          disabled={!interactive}
          className={interactive ? "cursor-pointer hover:scale-110 transition-transform" : ""}
          onClick={() => interactive && onChange?.(s)}
          onMouseEnter={() => interactive && setHover(s)}
          onMouseLeave={() => interactive && setHover(0)}
        >
          <Star
            className={`${sz[size]} ${s <= (hover || rating)
              ? "fill-amber-500 text-amber-500"
              : "text-gray-600"
              }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function ReviewSection({ movieUUID }) {
  const { user, loading: authLoading } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    average: 0,
    total: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [formError, setFormError] = useState(null);

  const isCustomer = user?.role === "customer";
  const canWrite = Boolean(user && isCustomer);
  const isGuest = !user && !authLoading;
  const isLoggedNonCustomer = Boolean(user && !isCustomer);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchReviewsByMovie(movieUUID);
      if (res.success && res.data) {
        setReviews(res.data.reviews || []);
        setStats({
          average: res.data.stats?.averageRating || 0,
          total: res.data.stats?.totalApprovedReviews || 0,
          distribution: res.data.stats?.distribution || {
            5: 0,
            4: 0,
            3: 0,
            2: 0,
            1: 0,
          },
        });
      }
    } catch (e) {
      console.error(e);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [movieUUID]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMsg(null);
    if (!canWrite) return;
    if (rating < 1) {
      setFormError("Chọn số sao (1–5)");
      return;
    }
    if (!comment.trim()) {
      setFormError("Vui lòng nhập nội dung đánh giá");
      return;
    }
    try {
      setSubmitting(true);
      await submitReview({ movieUUID, rating, comment: comment.trim() });
      setRating(0);
      setComment("");
      setShowForm(false);
      setSuccessMsg("Đã gửi! Đánh giá sẽ hiển thị sau khi được duyệt.");
      window.setTimeout(() => setSuccessMsg(null), 6000);
    } catch (err) {
      setFormError(err.message || "Gửi thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-6 py-12 border-t border-white/10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="w-7 h-7 text-primary" />
            Đánh giá phim
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Khách chỉ xem được đánh giá. Chỉ tài khoản khách hàng đăng nhập mới
            được viết nhận xét.
          </p>
        </div>
        {canWrite && (
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="btn-primary inline-flex items-center gap-2 self-start"
          >
            <Send className="w-4 h-4" />
            {showForm ? "Đóng form" : "Viết đánh giá"}
          </button>
        )}
      </div>

      {isGuest && (
        <div className="mb-8 flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
          <Lock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-white">Bạn đang xem với tư cách khách</p>
            <p className="mt-1">
              Bạn có thể đọc đánh giá bên dưới. Để góp ý, hãy{" "}
              <span className="text-primary font-medium">
                đăng nhập bằng tài khoản khách hàng
              </span>{" "}
              (nút <LogIn className="w-3.5 h-3.5 inline align-text-bottom" /> trên
              thanh menu).
            </p>
          </div>
        </div>
      )}

      {isLoggedNonCustomer && (
        <div className="mb-8 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
          <Lock className="w-5 h-5 shrink-0 mt-0.5" />
          <p>
            Tài khoản của bạn không phải khách hàng (ví dụ nhân viên / quản trị),
            nên không thể gửi đánh giá tại đây. Bạn vẫn có thể xem các nhận xét của
            người xem.
          </p>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 rounded-xl border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm text-green-200">
          {successMsg}
        </div>
      )}

      {canWrite && showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-10 rounded-2xl border border-primary/30 bg-white/5 p-6"
        >
          <h3 className="font-semibold mb-4">Đánh giá của bạn</h3>
          <div className="mb-4">
            <p className="text-sm text-slate-400 mb-2">Số sao</p>
            <StarRow rating={rating} interactive onChange={setRating} size="lg" />
          </div>
          <div className="mb-4">
            <label className="text-sm text-slate-400 block mb-2">Nội dung</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary/50"
              placeholder="Chia sẻ cảm nhận về phim (không spoiler quá mức)..."
            />
          </div>
          {formError && (
            <p className="text-sm mb-3 text-red-400">{formError}</p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary disabled:opacity-50"
          >
            {submitting ? "Đang gửi…" : "Gửi đánh giá"}
          </button>
        </form>
      )}

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-4xl font-bold text-center">
              {(stats.average || 0).toFixed(1)}
            </p>
            <div className="flex justify-center my-2">
              <StarRow rating={Math.round(stats.average)} size="md" />
            </div>
            <p className="text-center text-sm text-slate-500">
              {stats.total} lượt đánh giá (đã duyệt)
            </p>
            <p className="text-center text-xs text-slate-600 mt-1">trên 5 điểm</p>
            <div className="mt-6 space-y-2">
              {[5, 4, 3, 2, 1].map((n) => {
                const c = stats.distribution[n] || 0;
                const pct = stats.total ? (c / stats.total) * 100 : 0;
                return (
                  <div key={n} className="flex items-center gap-2 text-xs">
                    <span className="w-3 text-slate-400">{n}</span>
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-6 text-right text-slate-500">{c}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/20 py-16 text-center text-slate-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-40" />
              Chưa có đánh giá nào được duyệt.
            </div>
          ) : (
            <ul className="space-y-4">
              {reviews.map((r) => (
                <ReviewItem key={r.id} review={r} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function ReviewItem({ review }) {
  const [open, setOpen] = useState(false);
  const long = (review.comment?.length || 0) > 220;
  return (
    <li className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-white">{review.userName}</p>
          <div className="flex items-center gap-2 mt-1">
            <StarRow rating={review.rating} size="sm" />
            <span className="text-xs text-slate-500">
              {review.createdAt
                ? new Date(review.createdAt).toLocaleDateString("vi-VN")
                : ""}
            </span>
          </div>
        </div>
      </div>
      <p
        className={`mt-3 text-sm text-slate-300 leading-relaxed ${!open && long ? "line-clamp-3" : ""
          }`}
      >
        {review.comment}
      </p>
      {long && (
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="mt-2 text-xs text-primary flex items-center gap-1"
        >
          {open ? (
            <>
              Thu gọn <ChevronUp className="w-3 h-3" />
            </>
          ) : (
            <>
              Xem thêm <ChevronDown className="w-3 h-3" />
            </>
          )}
        </button>
      )}
    </li>
  );
}
