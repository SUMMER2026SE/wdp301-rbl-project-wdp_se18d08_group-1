import { Share2, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto bg-background-dark border-t border-white/5 px-6 lg:px-20 py-12">
      <div className="grid md:grid-cols-4 gap-12 mb-12">
        <div className="col-span-1 space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-600/20">
              <span className="font-black text-2xl italic">S</span>
            </div>
            <h2 className="text-white text-xl font-black uppercase italic tracking-tighter uppercase">FCINEMA</h2>
          </div>
          <p className="text-slate-500 text-sm leading-relaxed font-medium">
            Redefining the cinematic experience with luxury and cutting-edge technology. Experience film as it was meant to be seen.
          </p>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-widest">Discover</h4>
          <ul className="space-y-4 text-sm text-slate-500 font-medium">
            <li><a className="hover:text-primary transition-colors" href="/movies">Movies</a></li>
            <li><a className="hover:text-primary transition-colors" href="/">Showtimes</a></li>
            <li><a className="hover:text-primary transition-colors" href="/">IMAX Experiences</a></li>
            <li><a className="hover:text-primary transition-colors" href="/">Private Hire</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-widest">Support</h4>
          <ul className="space-y-4 text-sm text-slate-500 font-medium">
            <li><a className="hover:text-primary transition-colors" href="/">Help Center</a></li>
            <li><a className="hover:text-primary transition-colors" href="/">Contact Us</a></li>
            <li><a className="hover:text-primary transition-colors" href="/">Terms of Service</a></li>
            <li><a className="hover:text-primary transition-colors" href="/">Privacy Policy</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-widest">Stay Connected</h4>
          <div className="flex gap-4 mb-6">
            <a className="w-12 h-12 rounded-2xl glass-effect flex items-center justify-center hover:bg-primary transition-all border border-white/5 group" href="#">
              <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </a>
            <a className="w-12 h-12 rounded-2xl glass-effect flex items-center justify-center hover:bg-primary transition-all border border-white/5 group" href="#">
              <Mail className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </a>
          </div>
          <p className="text-xs text-slate-600 font-medium">Subscribe for weekly premieres and exclusive offers.</p>
        </div>
      </div>
      <div className="border-t border-white/5 pt-8 text-center text-slate-600 text-[10px] font-black uppercase tracking-widest">
        © 2024 FCINEMA Luxury Cinemas. All Rights Reserved.
      </div>
    </footer>
  );
}
