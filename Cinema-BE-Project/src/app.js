const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const passport = require("passport");
const path = require("path");

require("dotenv").config();
require("./modules/auth/config/passport");

const app = express();

// Routes
const authRoutes = require("./modules/auth/routes/authRoutes");

// Middlewares
app.use(express.json({ limit: "50mb" }));

app.use(cors());

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(passport.initialize());

// Logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Static files
app.use(
  "/uploads",
  express.static(path.join(__dirname, "..", "uploads"))
);

// Routes
app.use("/api/auth", authRoutes);

// Health check
app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    message: "Photo API running",
  });
});

module.exports = app;