import { getBackendOrigin } from "../config/api";

const API_ROOT = getBackendOrigin();
const BASE_URL = `${API_ROOT}/api/auth`;

export const register = async (userData) => {
  try {
    const response = await fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    let data = {};
    try {
      data = await response.json();
    } catch {
      /* empty body */
    }

    if (!response.ok) {
      const msg =
        data.message ||
        (typeof data === "string" ? data : null) ||
        `Đăng ký thất bại (${response.status})`;
      throw new Error(msg);
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const login = async (userData) => {
  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const verifyEmail = async ({ email, otp }) => {
  try {
    const response = await fetch(`${BASE_URL}/verify-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, otp }),
    });

    let data = {};
    try {
      data = await response.json();
    } catch {
      /* empty */
    }

    if (!response.ok) {
      throw new Error(
        data.message || `Xác thực thất bại (${response.status})`
      );
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const resendVerifyEmail = async (email) => {
  try {
    const response = await fetch(`${BASE_URL}/resend-verify-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Resend failed");
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const requestResetPassword = async (email) => {
  try {
    const response = await fetch(`${BASE_URL}/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Request reset failed");
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const resetPassword = async ({ email, otp, newPassword }) => {
  try {
    const response = await fetch(`${BASE_URL}/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, token: otp, newPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Reset password failed");
    }

    return data;
  } catch (error) {
    throw error;
  }
};
