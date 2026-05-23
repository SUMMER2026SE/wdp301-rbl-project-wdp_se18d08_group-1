import { motion } from "framer-motion";

export default function Promotions() {
    return (
        <section className="px-6 lg:px-24 py-24 bg-neutral-900/20 max-w-[1700px] mx-auto rounded-[4rem] mb-20">
            <div className="grid md:grid-cols-2 gap-12">
                {[
                    {
                        title: "Gourmet Tuesday",
                        desc: "50% OFF on all premium snack platters and artisan beverages.",
                        btn: "Claim Offer",
                        img: "https://images.unsplash.com/photo-1594909122845-11bcd439b4f2?auto=format&fit=crop&q=80&w=1470"
                    },
                    {
                        title: "Elite Membership",
                        desc: "Unlimited movies, private lounge access, and zero booking fees.",
                        btn: "Join Elite",
                        img: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&q=80&w=1470"
                    }
                ].map((promo, idx) => (
                    <motion.div 
                        key={idx}
                        whileHover={{ y: -10 }}
                        className="relative h-[400px] rounded-[3rem] overflow-hidden group cursor-pointer border border-white/5 shadow-2xl"
                    >
                        <div 
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110" 
                            style={{ backgroundImage: `linear-gradient(to top, #050505 0%, rgba(5,5,5,0.4) 50%, transparent 100%), url('${promo.img}')` }}
                        />
                        <div className="absolute inset-0 p-12 flex flex-col justify-end gap-2">
                            <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px]">Exclusive Offer</span>
                            <h3 className="text-4xl lg:text-5xl font-black text-white tracking-tighter uppercase italic">{promo.title}</h3>
                            <p className="text-white/60 max-w-sm mb-6 text-sm font-medium leading-relaxed">{promo.desc}</p>
                            <div>
                                <button className="bg-white text-black px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
                                    {promo.btn}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
