import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import ReviewSection from "../components/movieDetail/ReviewSection";
import MovieHero from "../components/movieDetail/MovieHero";
import MovieInfo from "../components/movieDetail/MovieInfo";
import ShowtimeSection from "../components/movieDetail/ShowtimeSection";
import VideoPlayer from "../components/movieDetail/VideoPlayer";
import { movieService } from "../services/movieService";

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════════════════ */
export default function MovieDetail() {
  const { uuid } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    if (!uuid) return;
    setLoading(true);
    movieService.getMovieByUUID(uuid)
      .then((res) => setMovie(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [uuid]);

  const scrollToShowtimes = () => {
    document.getElementById("showtimes")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (loading || !movie) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#140405]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-[3px] border-red-600/20 border-t-red-600 rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Đang tải thông tin phim…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#140405] text-white min-h-screen">
      {/* Hero */}
      <MovieHero
        movie={movie}
        onBook={scrollToShowtimes}
        onTrailer={() => setShowTrailer(true)}
      />

      {/* Divider */}
      <div className="max-w-6xl mx-auto px-6"><div className="border-t border-white/10" /></div>

      {/* Info - always visible */}
      <MovieInfo movie={movie} />

      {/* Divider */}
      <div className="max-w-6xl mx-auto px-6"><div className="border-t border-white/10" /></div>

      {/* Showtimes */}
      <div id="showtimes" className="scroll-mt-6">
        <ShowtimeSection showtimes={movie.showtimes} movie={movie} />
      </div>

      {/* Divider */}
      <div className="max-w-6xl mx-auto px-6"><div className="border-t border-white/10" /></div>

      {/* Reviews */}
      <ReviewSection movieUUID={uuid} />

      {/* Trailer modal */}
      <VideoPlayer
        isOpen={showTrailer}
        onClose={() => setShowTrailer(false)}
        videoUrl={movie.trailerUrl}
        title={movie.title}
      />
    </div>
  );
}
