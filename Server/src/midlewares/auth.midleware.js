const jwt = require("jsonwebtoken");
const { User } = require("../models");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware bảo vệ USER routes
// Đọc cookie "accessToken", kiểm tra scope === "user"
const protect = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      (req.headers.authorization?.startsWith("Bearer")
        ? req.headers.authorization.split(" ")[1]
        : null);

    if (!token) {
      return res.status(401).json({ message: "Không tìm thấy token!" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // Chặn admin token dùng vào user routes
    if (decoded.scope !== "user") {
      return res.status(403).json({ message: "Không có quyền truy cập!" });
    }

    req.user = decoded;

    next();
  } catch (error) {
    console.error("Lỗi khi xác minh JWT:", error);
    return res.status(401).json({ message: "Token không hợp lệ!" });
  }
};

// Middleware kiểm tra role (dùng sau protect hoặc protectAdmin)
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Can't access!" });
    }

    next();
  };
};

// Middleware bảo vệ ADMIN routes
// Đọc cookie "adminAccessToken", kiểm tra scope === "admin"
const protectAdmin = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken_admin;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // Chặn user token dùng vào admin routes
    if (decoded.scope !== "admin") {
      return res
        .status(403)
        .json({ message: "Token không hợp lệ cho admin!" });
    }

    if (!["admin", "super_admin"].includes(decoded.role)) {
      return res.status(403).json({ message: "Không có quyền truy cập!" });
    }

    req.user = decoded;

    next();
  } catch (err) {
    console.error("Lỗi xác minh admin token:", err);
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = { protect, authorizeRoles, protectAdmin };
