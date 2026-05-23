const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

// Passport must be required BEFORE googleAuth config runs
const passport = require("passport");
require("./modules/auth/config/passport");

const { connectMongo } = require("./mongo");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const ApiResponse = require("./utils/ApiResponse");

// ── Disk storage cho avatar ────────────────────────────────────────────────
const UPLOADS_DIR = path.join(__dirname, "..", "uploads", "avatars");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    cb(null, `avatar_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`);
  },
});
const uploadAvatarMulter = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith("image/")) return cb(null, true);
    cb(new Error("Chỉ chấp nhận file ảnh"));
  },
}).single("avatar");

// Controllers
const AuthController = require("./modules/auth/controllers/AuthController");
const GoogleAuthController = require("./modules/auth/controllers/GoogleAuthController");
const ProfileController = require("./modules/auth/controllers/ProfileController");

const app = express();

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

app.use(express.json({ limit: "50mb" }));
app.use(cors());
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(passport.initialize());
// session: false in passport strategies, so no passport.session() needed

// ── Serve upload files (avatars, posters, banners) ───────────────────
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// Middlewares
const authenticate = require("./middlewares/authenticate");
const authorize = require("./middlewares/roleMiddlewares");
const { UserRole } = require("./modules/auth/models/User");

// Controllers instance
const auth = new AuthController();
const googleAuth = require("./modules/auth/controllers/GoogleAuthController");
const profile = new ProfileController();

// --- Auth ---
app.post("/api/auth/register", (req, res) => auth.register(req, res));
app.post("/api/auth/verify-email", (req, res) => auth.verifyEmail(req, res));
app.post("/api/auth/resend-verify-email", (req, res) => auth.resendVerifyEmail(req, res));
app.post("/api/auth/login", (req, res) => auth.login(req, res));
app.post("/api/auth/forgot-password", (req, res) => auth.forgotPassword(req, res));
app.post("/api/auth/reset-password", (req, res) => auth.resetPassword(req, res));

// --- Profile (Authenticated) ---
app.get("/api/auth/me", require("./middlewares/authenticate"), (req, res) => profile.getProfile(req, res));
app.put("/api/auth/profile", require("./middlewares/authenticate"), (req, res) =>
  profile.updateProfile(req, res)
);
app.post("/api/auth/profile/avatar", require("./middlewares/authenticate"), (req, res) => {
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
app.put("/api/auth/change-password", require("./middlewares/authenticate"), (req, res) => profile.changePassword(req, res));

// --- Google OAuth ---
app.get("/api/auth/google", (req, res, next) => googleAuth.initiate(req, res, next));
app.get("/api/auth/google/callback", (req, res, next) => googleAuth.callback(req, res, next));
app.get("/api/auth/google/verify", require("./middlewares/authenticate"), (req, res) => googleAuth.verifyToken(req, res));


// --- Health Check ---
app.get("/", (_req, res) =>
  res.json({ status: "ok", message: "Photo API running" })
);

module.exports = app;
