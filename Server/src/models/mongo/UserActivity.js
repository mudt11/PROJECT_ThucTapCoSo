const mongoose = require("mongoose");

const UserActivitySchema = new mongoose.Schema({
  user_id: { type: Number, required: true, index: true },
  song_id: { type: Number, required: true, index: true },

  session_id: { type: String, required: true, index: true },

  // Dữ liệu tóm tắt phiên nghe nhạc
  total_listened_time: { type: Number, default: 0 }, // Tổng số giây đã nghe
  song_duration: { type: Number, required: true }, // Độ dài bài hát
  max_position_reached: { type: Number, default: 0 }, // Giây xa nhất mà user nghe tới

  // Hành vi tương tác
  play_pause_count: { type: Number, default: 0 }, // Số lần bấm dừng/phát
  seek_count: { type: Number, default: 0 }, // Số lần tua nhạc

  // Lý do kết thúc session này
  exit_reason: {
    type: String,
    enum: ["ended", "skipped", "tab_closed"],
    required: true,
  },

  source: {
    type: String,
    enum: ["search", "playlist", "recommendation", "radio"],
  },
  createdAt: { type: Date, default: Date.now, index: true },
});

module.exports = mongoose.model("UserActivity", UserActivitySchema);
