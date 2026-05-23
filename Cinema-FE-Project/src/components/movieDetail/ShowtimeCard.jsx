import { Link } from "react-router-dom";

export default function ShowtimeCard({ showtime }) {
  const time = new Date(showtime.startTime).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const isActive = String(showtime?.status || "").toLowerCase() === "active";

  const baseClass =
    "px-4 py-3 rounded-lg text-center min-w-[90px] transition";
  const activeClass = "bg-gray-800 hover:bg-red-600 cursor-pointer";
  const disabledClass =
    "bg-gray-800/50 text-gray-500 cursor-not-allowed pointer-events-none opacity-60";

  // Nếu không active thì vẫn hiển thị giờ chiếu nhưng không cho bấm
  if (!isActive) {
    return (
      <div
        className={`${baseClass} ${disabledClass}`}
        title={`Showtime ${showtime?.status || "Unavailable"} - khong the dat ve`}
        aria-disabled="true"
      >
        <div className="text-lg font-semibold">{time}</div>
        <div className="text-xs text-gray-400">
          {showtime.availableSeats}/{showtime.totalSeats} chỗ
        </div>
        <div className="text-[10px] mt-1 uppercase tracking-wide">
          {showtime?.status || "Unavailable"}
        </div>
      </div>
    );
  }

  return (
    <Link
      to={`/booking/${showtime.UUID}`}
      className={`${baseClass} ${activeClass}`}
      title="Dat ve"
    >
      <div className="text-lg font-semibold">{time}</div>
      <div className="text-xs text-gray-300">
        {showtime.availableSeats}/{showtime.totalSeats} chỗ
      </div>
    </Link>
  );
}