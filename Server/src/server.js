const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const allRoutes = require("./routes/index");
require("dotenv").config();

// Kéo cấu hình MySQL (Sequelize)
const { sequelize, syncDatabase } = require("./models");
// Import hàm kết nối MongoDB
const connectMongoDB = require("./config/mongodb");

const app = express();

// Middleware

// app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://project-web-gamma-neon.vercel.app",
    ],
    credentials: true,
  }),
);

app.set("etag", false);

app.use("/api", allRoutes);

app.get("/", (req, res) => {
  res.send("API Backend");
});

// Đặt "lưới" bắt lỗi ở CUỐI CÙNG
const globalErrorHandler = require("./midlewares/error.midleware");
app.use(globalErrorHandler);
// --- KẾT THÚC THÊM MỚI ---

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`🚀 Server đang test trên port: ${PORT}`);

  try {
    // 1. Kết nối và đồng bộ MySQL
    await sequelize.authenticate();
    console.log(">>> MySQL: Connect successfully <<<");
    await syncDatabase();

    // 2. Kết nối MongoDB
    await connectMongoDB();
  } catch (error) {
    console.error(">>> Lỗi kết nối Database:", error);
  }
});
