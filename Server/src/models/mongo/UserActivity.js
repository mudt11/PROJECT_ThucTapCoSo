const mongoose = require("mongoose");

const UserActivitySchema = new mongoose.Schema(
  {
    user_id: { type: Number, required: true, index: true }, // Map với MySQL user_id
    song_id: { type: Number, required: true, index: true }, // Map với MySQL song

    action: {
      type: String,
      enum: ["play", "skip", "complete"],
      required: true,
    },

    duration_listened: {
      type: Number,
      required: true,
      comment: "Số giây thực tế user đã nghe",
    },

    completion_rate: {
      type: Number,
      min: 0,
      max: 1,
      comment: "Tỷ lệ hoàn thành = duration_listened / song_duration",
    },

    is_view: {
      type: Boolean,
      default: false,
      comment: "Đánh dấu là 1 lượt nghe hợp lệ (ví dụ: >= 20s)",
    },

    timestamp: { type: Date, default: Date.now, index: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

module.exports = mongoose.model("UserActivity", UserActivitySchema);
