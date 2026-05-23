import { PlayCircle, Info, ChevronRight } from 'lucide-react';
import { motion } from "framer-motion"

export default function Hero() {
  const heroImage = "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=2059";

  return (
    <section className="relative w-full h-[85vh] overflow-hidden">
      {/* Background Image with Parallax-like feel */}
      <div 
        className="absolute inset-0 bg-cover bg-center animate-premium-fade" 
        style={{ 
          backgroundImage: `linear-gradient(to top, #050505 0%, rgba(5,5,5,0.7) 30%, rgba(5,5,5,0) 100%), 
                            linear-gradient(to right, #050505 0%, rgba(5,5,5,0.8) 20%, rgba(5,5,5,0) 50%),
                            url('${heroImage}')` 
        }}
      />

      {/* Hero Content */}
      <div className="relative h-full flex flex-col justify-center px-6 lg:px-24 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="space-y-8"
        >
          <div className="flex items-center gap-4">
            <span className="bg-red-600 text-white px-4 py-1 rounded-md text-[10px] font-black uppercase tracking-[0.2em]">Live Now</span>
            <div className="h-px w-20 bg-white/20"></div>
            <span className="text-white/60 text-xs font-bold uppercase tracking-widest">Premium Large Format</span>
          </div>

          <h1 className="text-white text-6xl lg:text-9xl font-black leading-[0.9] tracking-tighter uppercase italic">
            Beyond <br/> <span className="text-primary text-glow">The Screen</span>
          </h1>

          <p className="text-slate-300 text-lg md:text-xl max-w-xl leading-relaxed font-medium">
            Immerse yourself in 4K laser projection and Dolby Atmos sound. 
            The next generation of cinema is here.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <button className="btn-primary flex items-center gap-3">
              <PlayCircle className="w-5 h-5 fill-white" />
              <span>Book Tickets</span>
            </button>
            <button className="glass-effect px-10 py-4 rounded-2xl font-black uppercase tracking-tighter text-white hover:bg-white/10 transition-all border border-white/10 flex items-center gap-2">
              <Info className="w-5 h-5" />
              <span>Explore VIP</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Subtle Bottom Accent */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent"></div>
    </section>
  );
}
