const activityService = require("../services/user_activity.service"); 

/**
 * Controller xử lý API POST /api/activity
 */
const logActivity = async (req, res) => {
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

    // validate
    if (!user_id || !song_id || !session_id || !exit_reason) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Gọi xuống tầng Service và truyền data
    await activityService.upsertUserActivity({
      session_id,
      user_id,
      song_id,
      total_listened_time,
      song_duration,
      max_position_reached,
      play_pause_count,
      seek_count,
      exit_reason,
      source,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Activity error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  logActivity,
};