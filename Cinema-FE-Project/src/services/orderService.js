import { API_BASE_URL } from "../config/api";

const BASE_URL = API_BASE_URL;

export const orderService = {
  async getBookingHistory() {
    const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/orders/history`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    const json = await res.json();

    if (!res.ok || !json?.success) {
      throw new Error(json?.message || "Failed to fetch booking history");
    }

    return json.data; // array orders
  },


  async getBookingDetail(orderUUID) {
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/orders/${orderUUID}`, {
      headers: { ...(token && { Authorization: `Bearer ${token}` }) },
    });

    const text = await res.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      throw new Error(`API did not return JSON. Status ${res.status}. URL: ${BASE_URL}/orders/${orderUUID}`);
    }

    if (!res.ok || !json?.success) {
      throw new Error(json?.message || "Failed to fetch booking detail");
    }
    return json.data;
  }
};


