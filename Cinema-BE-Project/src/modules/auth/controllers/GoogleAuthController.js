const passport = require("../config/passport");
const ApiResponse = require("../../../utils/ApiResponse");

class GoogleAuthController {
  // Initiate Google OAuth
  initiate(req, res, next) {
    passport.authenticate("google", {
      session: false,
      scope: ["profile", "email"],
    })(req, res, next);
  }

  // Handle Google callback — sau khi Google trả về, gọi success để redirect có token
  callback(req, res, next) {
    const frontend = process.env.FRONTEND_URL || "http://localhost:4200";
    const failUrl = `${frontend.replace(/\/$/, "")}/?error=google_auth_failed`;

    passport.authenticate(
      "google",
      { session: false, failureRedirect: failUrl },
      (err, payload) => {
        if (err) return next(err);
        if (!payload) return res.redirect(failUrl);
        req.user = payload;
        return this.success(req, res);
      }
    )(req, res, next);
  }

  // Process successful authentication
  success(req, res) {
    if (!req.user) {
      return ApiResponse.error(res, "Google authentication failed", 400);
    }

    const { user, token } = req.user;
    const userObj = user.toObject();
    delete userObj.password;

    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:4200";
    const redirectUrl = `${frontendUrl}/auth/google/success?token=${token}&userId=${user._id}`;

    return res.redirect(redirectUrl);
  }

  // API endpoint for frontend to verify token
  async verifyToken(req, res) {
    try {
      const { User } = require("../models/User");
      const user = await User.findById(req.user.id).select("-password");

      if (!user) {
        return ApiResponse.error(res, "User not found", 404);
      }

      return ApiResponse.success(res, { user }, "User verified");
    } catch (error) {
      return ApiResponse.error(res, error.message, 500);
    }
  }
}

module.exports = new GoogleAuthController();
