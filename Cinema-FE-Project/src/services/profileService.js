import axios from "axios";

const API_BASE =
    process.env.BACKEND_URL?.replace(/\/$/, "") || "https://cinema-ticket-booking-system-3.onrender.com";

const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

/** Lấy thông tin profile của user hiện tại */
export const getProfile = async () => {
    // Cache-busting: thêm timestamp vào URL
    const timestamp = Date.now();
    const res = await axios.get(`${API_BASE}/api/auth/me?_=${timestamp}`, {
        headers: {
            ...getAuthHeader(),
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0",
        },
    });
    return res.data;
};

/** Upload avatar (multipart) — ổn định hơn gửi base64 trong JSON */
export const uploadProfileAvatar = async (file) => {
    const fd = new FormData();
    fd.append("avatar", file);
    const res = await axios.post(`${API_BASE}/api/auth/profile/avatar`, fd, {
        headers: {
            ...getAuthHeader(),
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
    });
    return res.data;
};

/** Cập nhật thông tin profile */
export const updateProfile = async (data) => {
    const res = await axios.put(`${API_BASE}/api/auth/profile`, data, {
        headers: {
            ...getAuthHeader(),
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0",
        },
    });
    return res.data;
};

/** Đổi mật khẩu */
export const changePassword = async ({ currentPassword, newPassword }) => {
    const res = await axios.put(
        `${API_BASE}/api/auth/change-password`,
        { currentPassword, newPassword },
        { headers: getAuthHeader() }
    );
    return res.data;
};
