import { useState } from "react";
import { Link } from "react-router-dom";
import { Monitor } from "lucide-react";

function pad(n) { return String(n).padStart(2, "0"); }

export default function ShowtimeSection({ showtimes, movie }) {
  const [activeDate, setActiveDate] = useState(null);

  // Group by date
  const grouped = {};
  showtimes?.forEach((s) => {
    const date = new Date(s.startTime).toLocaleDateString("en-CA");
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(s);
  });
  const dates = Object.keys(grouped).sort();

  // Auto-select first date
  const displayDate = activeDate && dates.includes(activeDate) ? activeDate : dates[0];

  if (!showtimes?.length) {
    return (
      <div className="max-w-6xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Monitor className="w-6 h-6 text-red-500" />
          Suất chiếu
        </h2>
        <div className="rounded-2xl border border-dashed border-white/20 py-16 text-center text-slate-500">
          <Monitor className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Chưa có suất chiếu nào cho phim này.</p>
          <p className="text-sm mt-1 text-slate-600">Vui lòng quay lại sau.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 pb-16">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Monitor className="w-6 h-6 text-red-500" />
        Suất chiếu
      </h2>

      {/* Date tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {dates.map((date) => {
          const isActive = date === displayDate;
          const d = new Date(date);
          const isToday = date === new Date().toLocaleDateString("en-CA");
          return (
            <button
              key={date}
              onClick={() => setActiveDate(date)}
              className={`shrink-0 flex flex-col items-center px-4 py-3 rounded-xl border transition-all duration-200 min-w-[80px] ${isActive
                  ? "bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/20"
                  : "bg-white/[0.04] border-white/10 text-slate-400 hover:border-white/20 hover:text-white"
                }`}
            >
              <span className="text-[10px] uppercase tracking-wider font-semibold opacity-70">
                {isToday ? "Hôm nay" : d.toLocaleDateString("vi-VN", { weekday: "short" })}
              </span>
              <span className="text-lg font-black leading-none mt-1">{d.getDate()}</span>
              <span className="text-[10px] opacity-70">{d.toLocaleDateString("vi-VN", { month: "short" })}</span>
              {isToday && <div className="w-1.5 h-1.5 rounded-full bg-white mt-1" />}
            </button>
          );
        })}
      </div>

      {/* Showtimes for selected date */}
      {displayDate && (
        <div>
          <p className="text-sm text-slate-500 mb-4 font-medium">
            {new Date(displayDate).toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            {" — "}
            <span className="text-red-400">{grouped[displayDate].length} suất</span>
          </p>
          <div className="flex flex-wrap gap-3">
            {grouped[displayDate].map((s) => {
              const start = new Date(s.startTime);
              const end = new Date(start.getTime() + (movie.duration || 120) * 60000);
              const timeStr = `${pad(start.getHours())}:${pad(start.getMinutes())}`;
              const endStr = `${pad(end.getHours())}:${pad(end.getMinutes())}`;
              const pct = s.totalSeats ? Math.round((s.availableSeats / s.totalSeats) * 100) : 0;
              const seatColor = pct > 50 ? "text-green-400" : pct > 20 ? "text-amber-400" : "text-red-400";
              return (
                <Link
                  key={s.UUID}
                  to={`/booking/${s.UUID}`}
                  className="group flex flex-col items-center justify-center w-28 py-4 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-red-600/15 hover:border-red-600/40 hover:shadow-lg hover:shadow-red-600/10 transition-all duration-200 active:scale-95"
                >
                  <span className="text-xl font-black text-white group-hover:text-red-300 transition-colors">{timeStr}</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">→ {endStr}</span>
                  {(s.hall?.name || s.hallName) && (
                    <span className="text-[10px] text-slate-600 mt-0.5 font-medium">{s.hall?.name || s.hallName}</span>
                  )}
                  <span className={`text-[11px] font-semibold mt-2 ${seatColor}`}>
                    {s.availableSeats}/{s.totalSeats} chỗ
                  </span>
                  <div className="w-16 h-1 bg-white/10 rounded-full mt-1.5 overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${pct > 50 ? "bg-green-500" : pct > 20 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${pct}%` }} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
