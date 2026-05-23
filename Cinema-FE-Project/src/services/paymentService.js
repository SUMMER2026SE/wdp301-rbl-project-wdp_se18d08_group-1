import { API_BASE_URL } from "../config/api";

const BASE_URL = API_BASE_URL;

export const paymentService = {
  async createPayOSLink(checkoutToken) {
    const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/payment/payos/create-link`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ checkoutToken }),
    });

    const json = await res.json();
    if (!res.ok || !json?.success) {
      throw new Error(json?.message || "Create payment link failed");
    }

    return json.data;
  },

  async getPaymentStatus(orderCode) {
    const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/payment/payos/${orderCode}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    const json = await res.json();
    if (!res.ok || !json?.success) {
      throw new Error(json?.message || "Get payment status failed");
    }

    return json.data;
  },

  async cancelPayment(orderCode) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/payment/payos/${orderCode}/cancel`, {
    method: "POST",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  const json = await res.json();
  if (!res.ok || !json?.success) {
    throw new Error(json?.message || "Cancel payment failed");
  }

  return json.data;
},
};