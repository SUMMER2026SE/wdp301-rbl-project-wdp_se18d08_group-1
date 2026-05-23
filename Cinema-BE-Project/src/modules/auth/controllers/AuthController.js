// auth.controller.js
const AuthService = require("../services/AuthService");
const ApiResponse = require("../../../utils/ApiResponse");

const authService = new AuthService();

class AuthController {
  async register(req, res) {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "").trim();
    const fullName = req.body.fullName != null ? String(req.body.fullName).trim() : "";

    if (!email || !password) {
      return ApiResponse.error(res, "Vui lòng nhập email và mật khẩu", 400);
    }

    try {
      const result = await authService.register({ email, password, fullName });
      return ApiResponse.success(res, result, "Register successfully", 201);
    } catch (e) {
      return ApiResponse.error(res, e.message, 400);
    }
  }

  async verifyEmail(req, res) {
    const email = String(req.body.email || "").trim().toLowerCase();
    const otp = String(req.body.otp || "").trim();

    if (!email || !otp) {
      return ApiResponse.error(res, "Email và mã OTP là bắt buộc", 400);
    }

    try {
      const result = await authService.verifyEmail({ email, otp });
      return ApiResponse.success(res, result, "Verify successfully");
    } catch (e) {
      return ApiResponse.error(res, e.message, 400);
    }
  }

  async resendVerifyEmail(req, res) {
    const email = String(req.body.email || "").trim().toLowerCase();

    if (!email) {
      return ApiResponse.error(res, "Vui lòng nhập email", 400);
    }

    try {
      const result = await authService.resendVerifyEmail(email);
      return ApiResponse.success(res, result, "OTP resent");
    } catch (e) {
      return ApiResponse.error(res, e.message, 400);
    }
  }

  async login(req, res) {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "").trim();

    if (!email || !password) {
      return ApiResponse.error(res, "Vui lòng nhập email và mật khẩu", 400);
    }

    try {
      const result = await authService.login({ email, password });
      return ApiResponse.success(res, result, "Login successfully");
    } catch (e) {
      return ApiResponse.error(res, e.message, 401);
    }
  }

  async forgotPassword(req, res) {
    const { email } = req.body;

    if (!email) {
      return ApiResponse.error(res, "Email is required", 400);
    }

    try {
      const result = await authService.forgotPassword(email);
      return ApiResponse.success(res, result, "OTP sent to email");
    } catch (e) {
      return ApiResponse.error(res, e.message, 400);
    }
  }

  async resetPassword(req, res) {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return ApiResponse.error(res, "Email, token and newPassword are required", 400);
    }

    try {
      const result = await authService.resetPassword({ email, token, newPassword });
      return ApiResponse.success(res, result, "Password reset successfully");
    } catch (e) {
      return ApiResponse.error(res, e.message, 400);
    }
  }
}

module.exports = AuthController;
