import { useState, useEffect } from "react";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";

const STATUS_OPTIONS = ["Tất cả", "Now Showing", "Coming Soon"];

/** Dropdown năm cố định: 2000 → 2026 */
const YEAR_OPTIONS = Array.from({ length: 2026 - 2000 + 1 }, (_, i) => ({
  label: String(2026 - i),
  value: 2026 - i,
}));

const DURATION_OPTIONS = [
  { label: "Tất cả", value: "all" },
  { label: "Ngắn (< 90 phút)", value: "short" },
  { label: "Trung bình (90–120 phút)", value: "medium" },
  { label: "Dài (> 120 phút)", value: "long" },
];

const SORT_OPTIONS = [
  { label: "Mặc định", value: "default" },
  { label: "⭐ Rating cao → thấp", value: "rating_desc" },
  { label: "⭐ Rating thấp → cao", value: "rating_asc" },
  { label: "🔤 A → Z", value: "title_asc" },
  { label: "🔤 Z → A", value: "title_desc" },
  { label: "📅 Mới nhất", value: "date_desc" },
  { label: "📅 Cũ nhất", value: "date_asc" },
  { label: "⏱ Dài → ngắn", value: "duration_desc" },
  { label: "⏱ Ngắn → dài", value: "duration_asc" },
];

function ActiveTag({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/20 border border-primary/40 text-primary text-xs font-medium">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="hover:text-white transition-colors"
        aria-label={`Bỏ lọc ${label}`}
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

export default function AdvanceFilter({
  genres = [],
  onFilter,
  resultCount,
}) {
  const [open, setOpen] = useState(false);

  // Filter state
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState(STATUS_OPTIONS[0]);
  const [selectedDuration, setSelectedDuration] = useState(DURATION_OPTIONS[0]);
  const [sortBy, setSortBy] = useState(SORT_OPTIONS[0]);
  const [selectedYear, setSelectedYear] = useState("");

  const hasActiveFilters =
    selectedGenres.length > 0 ||
    selectedStatus !== STATUS_OPTIONS[0] ||
    selectedDuration.value !== "all" ||
    selectedYear !== "";

  const toggleGenre = (genreId) => {
    setSelectedGenres((prev) =>
      prev.includes(genreId)
        ? prev.filter((id) => id !== genreId)
        : [...prev, genreId]
    );
  };

  const clearAll = () => {
    setSelectedGenres([]);
    setSelectedStatus(STATUS_OPTIONS[0]);
    setSelectedDuration(DURATION_OPTIONS[0]);
    setSortBy(SORT_OPTIONS[0]);
    setSelectedYear("");
  };

  // Build filter object and notify parent
  useEffect(() => {
    if (!onFilter) return;
    onFilter({
      genres: selectedGenres,
      status: selectedStatus,
      duration: selectedDuration.value,
      sortBy: sortBy.value,
      year: selectedYear ? Number(selectedYear) : null,
    });
  }, [selectedGenres, selectedStatus, selectedDuration, sortBy, selectedYear]);

  return (
    <div className="w-full">
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
          open || hasActiveFilters
            ? "bg-primary/20 border-primary/50 text-primary"
            : "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600"
        }`}
      >
        <SlidersHorizontal className="w-4 h-4" />
        Lọc nâng cao
        {hasActiveFilters && (
          <span className="ml-1 w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">
            {selectedGenres.length +
              (selectedStatus !== STATUS_OPTIONS[0] ? 1 : 0) +
              (selectedDuration.value !== "all" ? 1 : 0) +
              (selectedYear ? 1 : 0)}
          </span>
        )}
        <ChevronDown
          className={`w-4 h-4 ml-1 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Panel */}
      {open && (
        <div className="mt-3 p-5 bg-slate-800 border border-slate-700 rounded-xl shadow-xl space-y-6 animate-fadeIn">
          {/* Row 1: Genre */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Thể loại
            </h4>
            <div className="flex flex-wrap gap-2">
              {genres.length === 0 && (
                <span className="text-slate-500 text-xs">Đang tải thể loại…</span>
              )}
              {genres.map((genre) => (
                <button
                  key={genre._id}
                  type="button"
                  onClick={() => toggleGenre(genre._id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    selectedGenres.includes(genre._id)
                      ? "bg-primary/25 border-primary/60 text-primary"
                      : "bg-slate-700/50 border-slate-600 text-slate-300 hover:border-slate-500"
                  }`}
                >
                  {genre.name}
                </button>
              ))}
            </div>
          </div>

          {/* Row 2: Status */}
          <div className="flex flex-wrap gap-8">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Trạng thái
              </h4>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedStatus(s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      selectedStatus === s
                        ? "bg-primary/25 border-primary/60 text-primary"
                        : "bg-slate-700/50 border-slate-600 text-slate-300 hover:border-slate-500"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Row 3: Duration + Year */}
          <div className="flex flex-wrap gap-8">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Thời lượng
              </h4>
              <div className="flex flex-wrap gap-2">
                {DURATION_OPTIONS.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setSelectedDuration(d)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      selectedDuration.value === d.value
                        ? "bg-primary/25 border-primary/60 text-primary"
                        : "bg-slate-700/50 border-slate-600 text-slate-300 hover:border-slate-500"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Năm phát hành
              </h4>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-slate-700 border border-slate-600 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary"
              >
                <option value="">Tất cả</option>
                {YEAR_OPTIONS.map((y) => (
                  <option key={y.value} value={y.value}>
                    {y.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Sắp xếp theo
              </h4>
              <select
                value={sortBy.value}
                onChange={(e) =>
                  setSortBy(SORT_OPTIONS.find((s) => s.value === e.target.value) || SORT_OPTIONS[0])
                }
                className="bg-slate-700 border border-slate-600 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary"
              >
                {SORT_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-700">
            <div className="flex flex-wrap gap-2">
              {hasActiveFilters && (
                <>
                  {selectedGenres.map((id) => {
                    const g = genres.find((g) => g._id === id);
                    return g ? (
                      <ActiveTag
                        key={id}
                        label={g.name}
                        onRemove={() => toggleGenre(id)}
                      />
                    ) : null;
                  })}
                  {selectedStatus !== STATUS_OPTIONS[0] && (
                    <ActiveTag
                      label={selectedStatus}
                      onRemove={() => setSelectedStatus(STATUS_OPTIONS[0])}
                    />
                  )}
                  {selectedDuration.value !== "all" && (
                    <ActiveTag
                      label={selectedDuration.label}
                      onRemove={() => setSelectedDuration(DURATION_OPTIONS[0])}
                    />
                  )}
                  {selectedYear && (
                    <ActiveTag
                      label={`Năm ${selectedYear}`}
                      onRemove={() => setSelectedYear("")}
                    />
                  )}
                </>
              )}
            </div>
            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-slate-400 hover:text-white transition-colors ml-auto"
            >
              Xóa tất cả
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Pure filter function (usable anywhere) ─────────────────────────────────
export function applyFilters(movies, filters) {
  if (!movies || !Array.isArray(movies)) return [];

  let result = [...movies];

  // Genre
  if (filters.genres && filters.genres.length > 0) {
    result = result.filter((m) => {
      const movieGenreIds = (m.genres || []).map((g) =>
        typeof g === "object" ? g._id : g
      );
      return filters.genres.some((fid) => movieGenreIds.includes(fid));
    });
  }

  // Status
  if (filters.status && filters.status !== "Tất cả") {
    result = result.filter((m) => m.status === filters.status);
  }

  // Duration
  if (filters.duration && filters.duration !== "all") {
    result = result.filter((m) => {
      const d = m.duration || 0;
      if (filters.duration === "short") return d < 90;
      if (filters.duration === "medium") return d >= 90 && d <= 120;
      if (filters.duration === "long") return d > 120;
      return true;
    });
  }

  // Year
  if (filters.year) {
    result = result.filter((m) => {
      if (!m.releaseDate) return false;
      return new Date(m.releaseDate).getFullYear() === filters.year;
    });
  }

  // Sort
  if (filters.sortBy && filters.sortBy !== "default") {
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case "rating_desc": return (b.rating || 0) - (a.rating || 0);
        case "rating_asc":  return (a.rating || 0) - (b.rating || 0);
        case "title_asc":   return (a.title || "").localeCompare(b.title || "");
        case "title_desc":  return (b.title || "").localeCompare(a.title || "");
        case "date_desc":   return new Date(b.releaseDate || 0) - new Date(a.releaseDate || 0);
        case "date_asc":    return new Date(a.releaseDate || 0) - new Date(b.releaseDate || 0);
        case "duration_desc": return (b.duration || 0) - (a.duration || 0);
        case "duration_asc":  return (a.duration || 0) - (b.duration || 0);
        default: return 0;
      }
    });
  }

  return result;
}
