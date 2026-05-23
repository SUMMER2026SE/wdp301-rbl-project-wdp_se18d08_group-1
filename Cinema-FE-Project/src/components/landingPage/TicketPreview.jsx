import { Ticket } from 'lucide-react';

export default function TicketPreview() {
    return (
        <section className="px-6 lg:px-24 -mt-24 relative z-20 mb-20 max-w-[1700px] mx-auto animate-premium-fade">
            <div className="bg-neutral-900/40 backdrop-blur-3xl rounded-[2.5rem] p-4 flex flex-wrap lg:flex-nowrap items-center justify-between gap-8 border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-8 pl-4">
                    <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                        <Ticket className="w-10 h-10" />
                    </div>
                    <div className="space-y-1">
                        <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px]">Upcoming Experience</span>
                        <h3 className="text-2xl font-black text-white uppercase italic">Interstellar: Anniversary</h3>
                        <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Screen 4 (IMAX) • Seat G-14 • 20:30 Tonight</p>
                    </div>
                </div>

                <div className="flex items-center gap-6 pr-4">
                    <div className="text-right hidden sm:block space-y-1">
                        <p className="text-white/20 text-[10px] uppercase font-black tracking-widest leading-none">Access Code</p>
                        <p className="text-white font-mono text-lg font-bold">LX-99420</p>
                    </div>
                    <button className="bg-white text-black px-10 py-5 rounded-2xl font-black uppercase tracking-tighter text-sm hover:scale-105 transition-all active:scale-95">
                        Digital Pass
                    </button>
                </div>
            </div>
        </section>
    );
}
