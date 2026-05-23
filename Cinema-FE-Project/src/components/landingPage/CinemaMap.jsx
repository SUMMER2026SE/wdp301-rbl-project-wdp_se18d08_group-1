export default function CinemaMap() {
  const locations = ["Lincoln Square", "West Village VIP", "Brooklyn Heights", "Astoria Boutique"];

  return (
    <section className="px-6 lg:px-20 py-16 text-center">
      <div className="max-w-3xl mx-auto space-y-6">
        <h2 className="text-3xl font-bold">Find Your Cinema</h2>
        <p className="text-slate-400">Our premium theaters are located in the heart of major cities, offering the finest cinematic technology available.</p>
        <div 
          className="w-full h-64 rounded-xl overflow-hidden grayscale contrast-125 opacity-70 mb-8 border border-white/10 bg-cover bg-center" 
          style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBqlr8g9d1pv8333SlSYq_Aiwxk8FJlzKiC0TeJ7MS4c4MIoYj4F8p9ICvoNZYaULw3-acK07nDRuDYPOMfIJeqbjj-od2hs5SQ1CZIk-jXpnUFYNNCxYIiWAMLaSVjiYRCEi8Ns93DLoa4FnUgBjK5c9nMkdiV2okVaQ3LxKYRhNqN2JkrDFcAleBeGfN0kT4GIgrlDUymMWSCZQAR7X7PGBaJ8JBK_Syeae7VNm9BJQ_M3FkhMGAnFTWsJdi63evrtr2PrwKkQA')` }}
        />
        <div className="flex flex-wrap justify-center gap-4">
          {locations.map((loc) => (
            <span key={loc} className="glass-effect px-4 py-2 rounded-full text-sm border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
              {loc}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}