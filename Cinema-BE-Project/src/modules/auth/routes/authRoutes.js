const express = require("express");
const router = express.Router();

const authenticate = require("../../../middlewares/authenticate");
const ApiResponse = require("../../../utils/ApiResponse");

const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Controllers
const AuthController = require("../../../modules/auth/controllers/AuthController");
const googleAuth = require("../../../modules/auth/controllers/GoogleAuthController");
const ProfileController = require("../../../modules/auth/controllers/ProfileController");

const auth = new AuthController();
const profile = new ProfileController();

// ── Upload avatar config ────────────────────────────────────────────────
const UPLOADS_DIR = path.join(__dirname, "..", "..", "uploads", "avatars");

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";

    cb(
      null,
      `avatar_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2)}${ext}`
    );
  },
});

const uploadAvatarMulter = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype?.startsWith("image/")) {
      return cb(null, true);
    }

    cb(new Error("Chỉ chấp nhận file ảnh"));
  },
}).single("avatar");

// ================= AUTH =================
router.post("/register", (req, res) => auth.register(req, res));

router.post("/verify-email", (req, res) =>
  auth.verifyEmail(req, res)
);

router.post("/resend-verify-email", (req, res) =>
  auth.resendVerifyEmail(req, res)
);

router.post("/login", (req, res) => auth.login(req, res));

router.post("/forgot-password", (req, res) =>
  auth.forgotPassword(req, res)
);

router.post("/reset-password", (req, res) =>
  auth.resetPassword(req, res)
);

// ================= PROFILE =================
router.get("/me", authenticate, (req, res) =>
  profile.getProfile(req, res)
);

router.put("/profile", authenticate, (req, res) =>
  profile.updateProfile(req, res)
);

router.post("/profile/avatar", authenticate, (req, res) => {
  uploadAvatarMulter(req, res, (err) => {
    if (err) {
      const msg =
        err.code === "LIMIT_FILE_SIZE"
          ? "Ảnh tối đa 5MB"
          : err.message || "Upload thất bại";

      return ApiResponse.error(res, msg, 400);
    }

    profile.uploadAvatar(req, res);
  });
});

router.put("/change-password", authenticate, (req, res) =>
  profile.changePassword(req, res)
);

// ================= GOOGLE AUTH =================
router.get("/google", (req, res, next) =>
  googleAuth.initiate(req, res, next)
);

router.get("/google/callback", (req, res, next) =>
  googleAuth.callback(req, res, next)
);

router.get("/google/verify", authenticate, (req, res) =>
  googleAuth.verifyToken(req, res)
);

module.exports = router;