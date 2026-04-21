const mongoose = require("mongoose");

const RecommendationSchema = new mongoose.Schema(
  {
    user_id: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },

    recommended_song_ids: { type: [Number], default: [] },

    model_version: {
      type: String,
      default: "v1.0",
      comment: "Phiên bản của mô hình AI đã tạo ra gợi ý này",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Recommendation", RecommendationSchema);
