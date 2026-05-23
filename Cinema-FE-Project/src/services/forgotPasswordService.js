import axios from "axios";

const API_BASE =
    process.env.BACKEND_URL?.replace(/\/$/, "") || "https://cinema-ticket-booking-system-3.onrender.com";

/** Gửi email yêu cầu reset mật khẩu */
export const requestResetPassword = async (email) => {
    const res = await axios.post(`${API_BASE}/api/auth/forgot-password`, { email });
    return res.data;
};

/** Xác nhận OTP + đặt lại mật khẩu mới */
export const resetPassword = async ({ email, otp, newPassword }) => {
    const res = await axios.post(`${API_BASE}/api/auth/reset-password`, {
        email,
        token: otp,
        newPassword,
    });
    return res.data;
};
