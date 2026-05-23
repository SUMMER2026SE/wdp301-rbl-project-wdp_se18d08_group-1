import { API_BASE_URL } from "../config/api";

const BASE_URL = API_BASE_URL;

export const seatService = {

  async getSeatsByShowtime(uuid) {

    const res = await fetch(
      `${BASE_URL}/seat/showtimes/showtimeUuid/${uuid}/seats`
    );

    if (!res.ok) {
      throw new Error("Failed to fetch seats");
    }

    const json = await res.json();

    return json.data; // chỉ trả data
  },

  async holdSeats(showtimeUUID, seatUUIDs) {

    const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/seat/hold`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: JSON.stringify({
        showtimeUUID,
        seatUUIDs
      })
    });

    if (!res.ok) {
      throw new Error("Failed to hold seats");
    }

    return res.json();
  },

  async checkoutPreview({ showtimeUUID, seatUUIDs, concessions = [], voucherUUID = null, voucherCode = null }) {
    const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/seat/checkout/preview`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({
        showtimeUUID,
        seatUUIDs,
        concessions,
        voucherUUID,
        voucherCode,
      }),
    });

    const json = await res.json();
    if (!res.ok || !json?.success) {
      throw new Error(json?.message || "Checkout preview failed");
    }

    return json.data; // có checkoutToken
  }

};
