import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Star } from "lucide-react";
import { movieService } from "../services/movieService";

export default function AllMoviesPage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    movieService
      .getMovies()
      .then((res) => setMovies(Array.isArray(res?.data) ? res.data : []))
      .catch((e) => setErr(e?.message || "Khong tai duoc danh sach phim"))
      .finally(() => setLoading(false));
  }, []);

  const sortedMovies = useMemo(
    () => [...movies].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)),
    [movies]
  );

  if (loading) {
    return (
      <section className="px-6 lg:px-20 py-12 text-white">
        <p className="text-slate-300">Dang tai danh sach phim...</p>
      </section>
    );
  }

  if (err) {
    return (
      <section className="px-6 lg:px-20 py-12 text-white">
        <p className="text-red-300 font-semibold">Khong the tai du lieu</p>
        <p className="text-slate-400 text-sm mt-1">{err}</p>
      </section>
    );
  }

  return (
    <section className="px-6 lg:px-20 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight border-l-4 border-primary pl-4 text-white">
          All Movies
        </h1>
        <Link to="/" className="text-primary text-sm font-bold inline-flex items-center gap-1 hover:underline">
          <ArrowLeft className="w-4 h-4" />
          Back Home
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {sortedMovies.map((movie) => (
          <div key={movie.UUID} className="group flex flex-col gap-4">
            <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-lg">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{ backgroundImage: `url('${movie.posterUrl || "/no-poster.jpg"}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <Link
                  to={`/movies/${movie.UUID}`}
                  className="block w-full bg-primary text-white py-2 rounded-lg font-bold text-sm text-center"
                >
                  Xem chi tiet
                </Link>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-slate-100 truncate pr-2">{movie.title}</h4>
                <span className="text-yellow-500 text-sm flex items-center gap-0.5">
                  <Star className="w-3 h-3 fill-current" />
                  {movie.rating || "N/A"}
                </span>
              </div>

              <p className="text-slate-500 text-xs">
                {movie.genres?.map((g) => g.name).join(", ") || "Movie"} • {movie.duration}m
              </p>
              <p className="text-slate-400 text-xs mt-1">{movie.status || "Unknown status"}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}