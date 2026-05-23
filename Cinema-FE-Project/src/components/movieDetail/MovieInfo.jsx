import { Clock, Calendar, Star, Tag, Film, Info, TrendingUp, Award, Ticket } from "lucide-react";

function formatReleaseDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("vi-VN", { day: "numeric", month: "long", year: "numeric" });
}

export default function MovieInfo({ movie }) {
  const desc = movie.description?.trim() || "Chưa có mô tả chi tiết cho phim này.";

  const stats = [
    { icon: <Clock className="w-5 h-5 text-red-500" />, label: "Thời lượng", value: `${movie.duration} phút` },
    { icon: <Calendar className="w-5 h-5 text-red-500" />, label: "Khởi chiếu", value: formatReleaseDate(movie.releaseDate) },
    { icon: <Star className="w-5 h-5 text-amber-500 fill-current" />, label: "Điểm", value: movie.rating != null ? `${movie.rating} / 5` : "—" },
    { icon: <Film className="w-5 h-5 text-red-500" />, label: "Trạng thái", value: movie.status || "—" },
  ];

  return (
    <section className="max-w-6xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-red-600/15 flex items-center justify-center">
          <Info className="w-5 h-5 text-red-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Giới thiệu phim</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {movie.genres?.map((g) => g.name).join(", ") || "Thông tin chi tiết"}
          </p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <div key={i} className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent p-5 hover:from-white/[0.08] transition-all duration-300 group">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                {s.icon}
              </div>
              <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">{s.label}</p>
            </div>
            <p className="text-lg font-bold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Description + Sidebar */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Description */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-red-500" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Nội dung phim</h3>
          </div>
          <p className="text-slate-300 leading-relaxed whitespace-pre-line text-[15px]">{desc}</p>
        </div>

        {/* Sidebar: Genres + Rating */}
        <div className="space-y-4">
          {movie.genres?.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent p-5">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-4 h-4 text-red-500" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Thể loại</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {movie.genres.map((genre) => (
                  <span key={genre._id || genre.id}
                    className="bg-red-600/15 text-red-400 px-3 py-1.5 rounded-full text-xs font-semibold border border-red-600/20 hover:bg-red-600/25 transition-colors cursor-default">
                    {genre.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Rating Card */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent p-5">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Đánh giá</h3>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-4xl font-black text-amber-400">{movie.rating ?? "—"}</span>
              <div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`w-5 h-5 ${s <= Math.round(movie.rating || 0) ? "text-amber-400 fill-amber-400" : "text-slate-700"}`} />
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-1.5">trên 5 điểm</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-red-600/5 to-transparent p-5">
            <div className="flex items-center gap-2 mb-4">
              <Ticket className="w-4 h-4 text-red-400" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Hành động nhanh</h3>
            </div>
            <button
              onClick={() => document.getElementById("showtimes")?.scrollIntoView({ behavior: "smooth" })}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm font-medium transition-colors border border-red-600/20"
            >
              <Ticket className="w-4 h-4" />
              Đặt vé ngay
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
