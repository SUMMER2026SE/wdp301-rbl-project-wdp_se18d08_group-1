import { Clock, Calendar, Star, Play, Ticket } from "lucide-react";

function formatReleaseDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("vi-VN", { day: "numeric", month: "long", year: "numeric" });
}

export default function MovieHero({ movie, onBook, onTrailer }) {
  return (
    <div className="relative w-full min-h-[380px] lg:min-h-[480px] overflow-hidden">
      {/* Banner bg */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{ backgroundImage: `url(${movie.bannerUrl || movie.posterUrl || "/no-banner.jpg"})` }}
      />
      {/* Layered gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#140405]/95 via-[#140405]/70 to-[#140405]/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#140405] via-transparent to-[#140405]/30" />
      {/* Decorative glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

      <div className="relative max-w-6xl mx-auto min-h-[380px] lg:min-h-[480px] flex flex-col lg:flex-row items-center lg:items-end gap-0 lg:gap-8 p-6 lg:p-10 pb-8">
        {/* Poster */}
        <div className="hidden lg:flex flex-col items-center shrink-0">
          <div className="relative">
            <img
              src={movie.posterUrl || "/no-poster.jpg"}
              alt=""
              className="w-48 xl:w-56 rounded-2xl shadow-2xl shadow-black/60 transition-transform duration-500 hover:scale-[1.03]"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 w-full">
          {/* Genres */}
          {movie.genres?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {movie.genres.slice(0, 3).map((g) => (
                <span key={g._id || g.id} className="text-[11px] font-semibold uppercase tracking-wider text-red-400 border border-red-400/30 px-2.5 py-0.5 rounded-full">
                  {g.name}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl lg:text-5xl xl:text-6xl font-black text-white leading-tight tracking-tight mb-4">
            {movie.title}
          </h1>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-6 text-sm text-slate-300">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-red-500" />
              {movie.duration} phút
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-red-500" />
              {formatReleaseDate(movie.releaseDate)}
            </span>
            {movie.rating != null && (
              <span className="flex items-center gap-1.5 font-bold text-amber-400">
                <Star className="w-4 h-4 fill-current" />
                {movie.rating}
                <span className="text-slate-400 font-normal font-medium text-xs">/5</span>
              </span>
            )}
            {movie.showtimes?.length > 0 && (
              <span className="flex items-center gap-1.5 text-green-400">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                {movie.showtimes.length} suất chiếu
              </span>
            )}
          </div>

          {/* Description (short) */}
          {movie.description && (
            <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 mb-6 max-w-2xl">
              {movie.description}
            </p>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            {movie.trailerUrl && (
              <button
                onClick={onTrailer}
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold text-sm border border-white/20 transition-all duration-200 hover:scale-[1.02]"
              >
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                </div>
                Xem Trailer
              </button>
            )}
            <button
              onClick={onBook}
              className="inline-flex items-center gap-2.5 px-7 py-3 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-600/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Ticket className="w-4 h-4" />
              Đặt vé ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
