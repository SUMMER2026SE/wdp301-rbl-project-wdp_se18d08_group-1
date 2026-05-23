import { API_BASE_URL } from "../config/api";

const BASE = API_BASE_URL;

function authHeaders() {
  const token = localStorage.getItem("token");
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
}

export async function fetchReviewsByMovie(movieUUID) {
  const res = await fetch(`${BASE}/reviews/movie/${movieUUID}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message || "Không tải được đánh giá");
  return json;
}

export async function submitReview({ movieUUID, rating, comment }) {
  const res = await fetch(`${BASE}/reviews`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ movieUUID, rating, comment }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || "Gửi đánh giá thất bại");
  return json;
}
