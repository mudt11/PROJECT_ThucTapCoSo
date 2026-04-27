const express = require("express");
const router = express.Router();
const songController = require("../controllers/song.controller");
const ratingController = require("../controllers/rating.controller");
const {
  protect,
  isAdmin,
  protectAdmin,
} = require("../midlewares/auth.midleware");
const upload = require("../midlewares/upload.midleware");

// tìm kiếm bài hát
router.get("/search", songController.searchSongs);

/* --- ROUTES FOR USER --- */

// lấy danh sách bài hát yêu thích
router.get("/me/favorites", protect, songController.getLikedSongs);

router.get("/:id/like-status", protect, songController.getLikeStatus);
// Like
router.post("/:id/like", protect, songController.likeSong);
// Unlike
router.delete("/:id/like", protect, songController.unlikeSong);
// track list hằng ngày
router.get("/", songController.getSongList);
// tăng view
router.post("/:songId/view", songController.increaseView);
// User rating bài hát
router.post("/rate", protect, ratingController.rateSong);
// Lấy rating của bài hát
router.get("/song/:song_id/summary", ratingController.getSongRatingSummary);

/* --- ROUTES FOR ADMIN --- */

// manage song
router.get("/all", protectAdmin, songController.getAllSongs);
// router.get("/:id", songController.getSongById);

// sửa
router.put("/:id", protectAdmin, songController.updateSongById);
// xóa
router.delete("/:id", protectAdmin, songController.deleteSongById);

// Ẩn hiện
router.patch(
  "/:id/toggle-invisibility",
  protectAdmin,
  songController.toggleSongVisibility,
);

// admin up nhạc
router.post(
  "/",
  protectAdmin,
  upload.fields([
    { name: "audioFile", maxCount: 1 },
    { name: "imageFile", maxCount: 1 },
  ]),
  songController.createSong,
);

// gọi 1 lần để lấy 200 bài
// router.post("/sync", jamendoController.fetchRandomJamendoTracks);

module.exports = router;
