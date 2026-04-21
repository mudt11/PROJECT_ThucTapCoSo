const mongoose = require("mongoose");

const SongDetailsSchema = new mongoose.Schema(
  {
    song_id: {
      type: Number,
      required: true,
      unique: true,
      index: true,
      // ID này phải map chính xác với song_id trong MySQL
    },
    lyrics: { type: String, default: "" },
    keywords: { type: [String], default: [] },
    genres: { type: [String], default: [] },
    mood: { type: String, default: "" },
    artist_names: { type: [String], default: [], index: true },
    vector_embedding: {
      type: [Number],
      // Mảng chứa các giá trị float biểu diễn đặc trưng âm nhạc
      default: [],
    },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  },
);

module.exports = mongoose.model("SongDetails", SongDetailsSchema);
