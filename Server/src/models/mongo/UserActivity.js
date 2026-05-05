const mongoose = require("mongoose");

const UserActivitySchema = new mongoose.Schema({
  user_id: { type: Number, required: true, index: true },
  song_id: { type: Number, required: true, index: true },

  session_id: { type: String, required: true, index: true },

  event_type: {
    type: String,
    enum: ["start", "pause", "resume", "progress", "seek", "end"],
    required: true,
  },

  listened_delta: { type: Number, default: 0 },
  position: { type: Number, required: true },
  song_duration: { type: Number, required: true },

  source: {
    type: String,
    enum: ["search", "playlist", "recommendation", "radio"],
  },

  createdAt: { type: Date, default: Date.now, index: true },
});

UserActivitySchema.index({ user_id: 1, createdAt: -1 });
UserActivitySchema.index({ song_id: 1, createdAt: -1 });
UserActivitySchema.index({ session_id: 1 });

module.exports = mongoose.model("UserActivity", UserActivitySchema);
