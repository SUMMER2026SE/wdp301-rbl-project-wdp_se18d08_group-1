import { Ticket, Copy, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

const vouchers = [
  {
    id: 1,
    code: "FCINEMA20",
    description: "20% OFF on all IMAX tickets",
    expiry: "Valid until Dec 31",
    type: "Discount"
  },
  {
    id: 2,
    code: "POPCORNFREE",
    description: "Free large popcorn with 2 tickets",
    expiry: "Valid for weekends",
    type: "Gift"
  },
  {
    id: 3,
    code: "VIPACCESS",
    description: "Buy 1 Get 1 for VIP Lounge",
    expiry: "Limited time offer",
    type: "Special"
  }
];

export default function Vouchers() {
  const [copiedId, setCopiedId] = useState(null);

  const copyToClipboard = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section className="px-6 lg:px-20 py-16 border-t border-white/5">
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-3xl font-bold tracking-tight border-l-4 border-primary pl-4">Exclusive Vouchers</h2>
        <p className="text-slate-400 text-sm hidden sm:block">Click to copy your rewards</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {vouchers.map((voucher) => (
          <div
            key={voucher.id}
            className="relative glass-effect p-6 rounded-xl border border-dashed border-white/20 flex flex-col gap-4 group hover:border-primary/50 transition-all cursor-pointer"
            onClick={() => copyToClipboard(voucher.code, voucher.id)}
          >
            <div className="flex justify-between items-start">
              <div className="bg-primary/20 p-2 rounded-lg text-primary">
                <Ticket className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-white/5 px-2 py-1 rounded">
                {voucher.type}
              </span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">{voucher.code}</h3>
              <p className="text-slate-300 text-sm">{voucher.description}</p>
            </div>
            <div className="flex justify-between items-center mt-2 pt-4 border-t border-white/5">
              <span className="text-xs text-slate-500">{voucher.expiry}</span>
              <div className="flex items-center gap-2 text-primary">
                {copiedId === voucher.id ? (
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-500">
                    <CheckCircle2 className="w-3 h-3" /> Copied
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-bold group-hover:underline">
                    <Copy className="w-3 h-3" /> Copy
                  </span>
                )}
              </div>
            </div>
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-background-dark rounded-full border-r border-white/10" />
            <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-background-dark rounded-full border-l border-white/10" />
          </div>
        ))}
      </div>
    </section>
  );
}
