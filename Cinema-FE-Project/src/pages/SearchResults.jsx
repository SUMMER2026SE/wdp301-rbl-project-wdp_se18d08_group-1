import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import MovieGrid from "../components/landingPage/MovieGrid";
import AdvanceFilter, { applyFilters } from "../components/landingPage/AdvanceFilter";
import { movieService } from "../services/movieService";

const SEARCH_LIMIT = 100;

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const q = (searchParams.get("q") || "").trim();

  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch genres once
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL || "https://cinema-ticket-booking-system-3.onrender.com"}/api/genres`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.data) setGenres(data.data);
      })
      .catch(() => { });
  }, []);

  // Fetch movies when query changes
  useEffect(() => {
    if (!q) {
      setMovies([]);
      setError(null);
      return;
    }

    let cancelled = false;
    setDataLoading(true);
    setError(null);

    movieService
      .searchMovies(q, { limit: SEARCH_LIMIT })
      .then((response) => {
        if (cancelled) return;
        const list = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
            ? response
            : [];
        setMovies(list);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(err);
        setError("Không tải được kết quả. Vui lòng thử lại sau.");
        setMovies([]);
      })
      .finally(() => {
        if (!cancelled) setDataLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [q]);

  const filteredMovies = applyFilters(movies, filters);
  const hasFilters = Object.values(filters).some(
    (v) => v && (Array.isArray(v) ? v.length > 0 : v !== 0 && v !== "all" && v !== "default")
  );

  if (!q) {
    return (
      <div className="flex-1 pt-24 px-6 lg:px-20 pb-16">
        <p className="text-slate-400 mb-4">
          Bạn chưa nhập từ khóa. Hãy dùng ô tìm kiếm ở trên để tìm phim.
        </p>
        <Link to="/" className="text-primary font-semibold hover:underline">
          Quay lại trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 pt-24 pb-16">
      <div className="px-6 lg:px-20 mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-100">
            Tìm kiếm phim
          </h1>
          <p className="text-slate-400 mt-2 text-base leading-relaxed">
            {dataLoading && (
              <>
                Đang tìm phim cho từ khóa{" "}
                <span className="text-primary font-medium">&quot;{q}&quot;</span>…
              </>
            )}
            {!dataLoading && filteredMovies.length > 0 && (
              <>
                Tìm thấy{" "}
                <span className="text-slate-200 font-semibold">{filteredMovies.length}</span>{" "}
                {filteredMovies.length === 1 ? "phim" : "bộ phim"}
                {hasFilters ? " (sau lọc)" : ""} cho từ khóa{" "}
                <span className="text-primary font-medium">&quot;{q}&quot;</span>
              </>
            )}
            {!dataLoading && filteredMovies.length === 0 && !error && (
              <>
                Bạn đang tìm:{" "}
                <span className="text-primary font-medium">&quot;{q}&quot;</span>
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

      {/* Advance Filter */}
      <div className="px-6 lg:px-20 mb-4">
        <AdvanceFilter
          genres={genres}
          onFilter={setFilters}
          resultCount={filteredMovies.length}
        />
      </div>

      {dataLoading && (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      )}

      {!dataLoading && error && (
        <p className="text-center text-red-400 px-6">{error}</p>
      )}

      {!dataLoading && !error && (
        <MovieGrid
          movies={filteredMovies}
          sectionTitle={hasFilters ? "Kết quả lọc" : "Các phim liên quan"}
          showViewAllLink={false}
          emptyMessage={
            hasFilters
              ? `Không có phim nào khớp với bộ lọc hiện tại. Thử thay đổi điều kiện lọc nhé.`
              : `Chưa có bộ phim nào chứa "${q}". Bạn thử đổi từ khóa hoặc gõ gần đúng tên phim nhé.`
          }
        />
      )}
    </div>
  );
}
