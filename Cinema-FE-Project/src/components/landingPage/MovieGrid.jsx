import { useState } from "react";
import { Star, ArrowRight, Play, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import VideoPlayer from "../movieDetail/VideoPlayer";

export default function MovieGrid({
    movies,
    sectionTitle = "Now Showing",
    showViewAllLink = true,
    emptyMessage,
}) {
    const [trailer, setTrailer] = useState(null);

    if (movies.length === 0 && emptyMessage) {
        return (sectionTitle && 
            <section className="px-6 lg:px-24 py-20 max-w-[1700px] mx-auto overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold tracking-tight border-l-4 border-primary pl-4 text-white">
                        {sectionTitle}
                    </h2>
                </div>
                <p className="text-slate-400 text-center py-12">{emptyMessage}</p>
            </section>
        );
    }

    return (
        <section className="px-6 lg:px-24 py-20 max-w-[1700px] mx-auto overflow-hidden">
            <div className="flex items-end justify-between mb-16 px-2">
                <div className="space-y-2">
                    <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px]">What's Playing</span>
                    <h2 className="text-4xl lg:text-6xl font-black tracking-tighter uppercase text-white">
                        {sectionTitle.split(' ')[0]} <span className="text-primary text-glow">{sectionTitle.split(' ').slice(1).join(' ')}</span>
                    </h2>
                </div>

                {showViewAllLink && (
                    <Link to="/movies" className="group flex items-center gap-3 text-white/40 hover:text-white transition-all text-sm font-bold uppercase tracking-widest pb-2">
                        See All <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </Link>
                )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 lg:gap-12">
                {movies.map((movie, idx) => (
                    <motion.div 
                        key={movie.UUID || movie._id || movie.id || idx} 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: idx * 0.05 }}
                        className="group relative flex flex-col gap-6"
                    >
                        <div className="relative aspect-[2.8/4] rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5 bg-neutral-900">
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                style={{
                                    backgroundImage: `url('${movie.posterUrl || movie.poster || "/no-poster.jpg"}')`,
                                }}
                            />
                            
                            <div className="movie-card-glow" />

                            {/* Trailer Preview Button */}
                            {movie.trailerUrl && (
                                <button
                                    type="button"
                                    onClick={() => setTrailer({ url: movie.trailerUrl, title: movie.title })}
                                    className="absolute top-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white shadow-xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:bg-red-600 hover:border-red-500"
                                >
                                    <Play className="h-4 w-4 fill-current ml-0.5" />
                                </button>
                            )}

                            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center p-8 gap-4">
                                <Link
                                    to={`/movies/${movie.UUID || movie._id}`}
                                    className="w-full bg-white text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-center transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 flex items-center justify-center gap-2"
                                >
                                    <Play className="w-4 h-4 fill-black" />
                                    Book Now
                                </Link>
                                <Link
                                    to={`/movies/${movie.UUID || movie._id}`}
                                    className="w-full bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-center border border-white/10 transform translate-y-8 group-hover:translate-y-0 transition-all duration-500 delay-75"
                                >
                                    Details
                                </Link>
                            </div>

                            <div className="absolute top-6 left-6 glass-effect px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-white/20">
                                <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                                <span className="text-white text-[11px] font-black">{movie.rating || "5"}</span>
                            </div>
                        </div>

                        <div className="space-y-3 px-2">
                            <h4 className="text-xl font-black text-white leading-tight uppercase tracking-tighter group-hover:text-primary transition-colors line-clamp-2">
                                {movie.title}
                            </h4>

                            <div className="flex flex-wrap items-center gap-3 text-white/40 text-[10px] uppercase font-bold tracking-widest">
                                <span className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded">
                                    <Calendar className="w-3 h-3" />
                                    {movie.duration}m
                                </span>
                                {movie.genres?.slice(0, 2).map((g, i) => (
                                    <span key={g._id || i}>{g.name}</span>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <VideoPlayer
                isOpen={Boolean(trailer)}
                onClose={() => setTrailer(null)}
                videoUrl={trailer?.url}
                title={trailer?.title}
            />
        </section>
    );
}