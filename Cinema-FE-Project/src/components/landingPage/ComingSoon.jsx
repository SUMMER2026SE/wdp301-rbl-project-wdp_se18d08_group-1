import { Calendar, Bell, Play } from "lucide-react";
import { motion } from "framer-motion";

export default function ComingSoon({ movies }) {
    const movie = movies[0];
    if (!movie) return null;

    return (
        <section className="px-6 lg:px-24 py-24 max-w-[1700px] mx-auto">
            <div className="flex items-center gap-4 mb-12 px-2">
                <div className="h-px flex-1 bg-white/10"></div>
                <h2 className="text-2xl font-black tracking-[0.3em] uppercase text-white/40">
                    Coming <span className="text-white">Soon</span>
                </h2>
                <div className="h-px flex-1 bg-white/10"></div>
            </div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative group"
            >
                {/* Main Content Box */}
                <div className="relative flex flex-col lg:flex-row items-center rounded-[3rem] overflow-hidden bg-neutral-900 border border-white/5 min-h-[500px]">
                    
                    {/* Visual Side */}
                    <div className="w-full lg:w-1/2 h-[400px] lg:h-full relative overflow-hidden">
                        <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
                            style={{
                                backgroundImage: `linear-gradient(to right, rgba(10,10,10,1) 0%, rgba(10,10,10,0) 50%), url('${movie.bannerUrl || "/no-banner.jpg"}')`,
                            }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <button className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white scale-90 group-hover:scale-100 transition-all duration-500 hover:bg-primary hover:border-primary">
                                <Play className="w-8 h-8 fill-current" />
                            </button>
                        </div>
                    </div>

                    {/* Info Side */}
                    <div className="flex-1 p-12 lg:p-20 space-y-8">
                        <div className="inline-flex items-center gap-3 bg-primary/10 px-4 py-2 rounded-xl border border-primary/20">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span className="text-primary font-black text-xs tracking-widest uppercase">
                                Arriving: {new Date(movie.releaseDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </span>
                        </div>

                        <h3 className="text-5xl lg:text-7xl font-black text-white tracking-tighter uppercase leading-[0.9]">
                            {movie.title}
                        </h3>

                        <p className="text-slate-400 text-lg leading-relaxed max-w-xl">
                            {movie.description || "The most anticipated cinematic experience of the season is almost here. Prepare for a journey beyond imagination."}
                        </p>

                        <div className="flex flex-wrap gap-4 pt-4">
                            <button className="btn-primary flex items-center gap-3">
                                <Bell className="w-5 h-5" />
                                <span>Remind Me</span>
                            </button>
                            <button className="glass-effect px-10 py-4 rounded-2xl font-black uppercase tracking-tighter text-white hover:bg-white/10 transition-all border border-white/10">
                                View Details
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}