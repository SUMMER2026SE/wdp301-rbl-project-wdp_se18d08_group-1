import { API_BASE_URL } from "../config/api";

const BASE_URL = API_BASE_URL;

export const voucherService = {
  async applyVoucher({ code, totalAmount }) {
    const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/vouchers/apply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ code, totalAmount }),
    });

    const json = await res.json();
    if (!res.ok || !json?.success) {
      throw new Error(json?.message || "Apply voucher failed");
    }

    return json.data; // { originalAmount, discountAmount, finalAmount }
  },
};