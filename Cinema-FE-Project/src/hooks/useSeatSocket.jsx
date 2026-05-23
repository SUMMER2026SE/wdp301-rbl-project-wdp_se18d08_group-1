import { useEffect } from "react";

export default function useSeatSocket(socket, setSeatData, setSelectedSeats) {

  useEffect(() => {
    if (!socket) return;

    const handleSeatUpdate = (data) => {
      console.log("🔥 seat-status-updated:", data);

      setSeatData(prev => ({
        ...prev,
        seats: prev.seats.map(seat => {
          if (data.seatUUIDs.includes(seat.UUID)) {
            return {
              ...seat,
              status: data.status,
              expiresAt: data.expiresAt || seat.expiresAt
            };
          }
          return seat;
        })
      }));

      if (data.status !== "available") {
        setSelectedSeats(prev =>
          prev.filter(id => !data.seatUUIDs.includes(id))
        );
      }
    };

    socket.on("seat-status-updated", handleSeatUpdate);

    return () => {
      socket.off("seat-status-updated", handleSeatUpdate);
    };

  }, [socket]);
}