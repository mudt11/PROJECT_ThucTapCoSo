const express = require("express");
const router = express.Router();
const UserActivity = require("../models/mongo/UserActivity");
const { protect } = require("../midlewares/auth.midleware");

router.post("/", protect, async (req, res) => {
  try {
    const {
      song_id,
      session_id,
      total_listened_time,
      song_duration,
      max_position_reached,
      play_pause_count,
      seek_count,
      exit_reason,
      source,
    } = req.body;

    const user_id = req.user.userId;

    if (!user_id || !song_id || !session_id || !exit_reason) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    await UserActivity.findOneAndUpdate(
      { session_id: session_id },
      {
        user_id,
        song_id,
        total_listened_time,
        song_duration,
        max_position_reached,
        play_pause_count,
        seek_count,
        exit_reason,
        source,
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    );

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Activity error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
