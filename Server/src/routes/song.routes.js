const express = require("express");
const router = express.Router();
const songController = require("../controllers/song.controller");
const {
  protect,
  isAdmin,
  protectAdmin,
} = require("../midlewares/auth.midleware");
const upload = require("../midlewares/upload.midleware");

// tìm kiếm bài hát
router.get("/search", songController.searchSongs);

/* --- ROUTES FOR USER --- */

// track list hằng ngày
router.get("/", songController.getSongList);
// tăng view
router.post("/:songId/view", songController.increaseView);

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
