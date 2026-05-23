import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import MovieGrid from "../components/landingPage/MovieGrid";
import AdvanceFilter, { applyFilters } from "../components/landingPage/AdvanceFilter";
import { movieService } from "../services/movieService";

const GENRES_API =
  `${import.meta.env.VITE_BACKEND_URL || "https://cinema-ticket-booking-system-3.onrender.com"}/api/genres`;

export default function MoviesBrowse() {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(GENRES_API)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.data) setGenres(data.data);
      })
      .catch(() => { });
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    movieService
      .getMovies()
      .then((data) => {
        if (cancelled) return;
        const list = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
            ? data
            : [];
        setMovies(list);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(err);
        setError("Không tải được danh sách phim. Vui lòng thử lại sau.");
        setMovies([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredMovies = applyFilters(movies, filters);
  const hasFilters = Object.values(filters).some(
    (v) =>
      v &&
      (Array.isArray(v) ? v.length > 0 : v !== 0 && v !== "all" && v !== "default")
  );

  return (
    <div className="flex-1 pt-24 pb-16">
      <div className="px-6 lg:px-20 mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-100">
            Danh sách phim
          </h1>
          <p className="text-slate-400 mt-2 text-base leading-relaxed">
            {loading && "Đang tải danh sách phim…"}
            {!loading && !error && (
              <>
                Hiển thị{" "}
                <span className="text-slate-200 font-semibold">
                  {filteredMovies.length}
                </span>{" "}
                {filteredMovies.length === 1 ? "phim" : "bộ phim"}
                {hasFilters ? " (sau lọc)" : ""}
                {movies.length > 0 && !hasFilters
                  ? ` trong tổng ${movies.length} bộ phim.`
                  : hasFilters
                    ? ` trên tổng ${movies.length} bộ phim.`
                    : "."}
              </>
            )}
          </p>
        </div>
        <Link
          to="/"
          className="text-sm text-slate-300 hover:text-primary transition-colors shrink-0 mt-1"
        >
          ← Trang chủ
        </Link>
      </div>

      <div className="px-6 lg:px-20 mb-4">
        <AdvanceFilter
          genres={genres}
          onFilter={setFilters}
          resultCount={filteredMovies.length}
        />
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      )}

      {!loading && error && (
        <p className="text-center text-red-400 px-6">{error}</p>
      )}

      {!loading && !error && (
        <MovieGrid
          movies={filteredMovies}
          sectionTitle={hasFilters ? "Kết quả lọc" : "Tất cả phim"}
          showViewAllLink={false}
          emptyMessage={
            hasFilters
              ? "Không có phim nào khớp với bộ lọc hiện tại. Thử thay đổi điều kiện lọc nhé."
              : "Chưa có phim nào trong hệ thống."
          }
        />
      )}
    </div>
  );
}
