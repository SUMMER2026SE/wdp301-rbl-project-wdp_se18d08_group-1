// authenticate.js
const jwt = require("jsonwebtoken");
const ApiResponse = require("../utils/ApiResponse");
const { UserRole } = require("../modules/auth/models/User");

const JWT_SECRET = process.env.JWT_SECRET || "cinema_secret";

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return ApiResponse.error(res, "Unauthorized", 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // gán user vào req.user
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role, // role đã là string từ JWT
    };
    console.log("req.user set:", req.user);

    next();
  } catch (err) {
    console.error("JWT verify error:", err);
    return ApiResponse.error(res, "Invalid token", 401);
  }
};

module.exports = authenticate;