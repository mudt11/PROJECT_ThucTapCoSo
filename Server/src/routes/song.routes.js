const express = require("express");
const router = express.Router();
const songController = require("../controllers/song.controller");
const { protect, authorizeRoles } = require("../midlewares/auth.midleware");
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
router.get(
  "/all",
  protect,
  authorizeRoles("admin", "super_admin"),
  songController.getAllSongs,
);
// router.get("/:id", songController.getSongById);

// sửa
router.put(
  "/:id",
  protect,
  authorizeRoles("admin", "super_admin"),
  songController.updateSongById,
);
// xóa
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin", "super_admin"),
  songController.deleteSongById,
);

// Ẩn hiện
router.patch(
  "/:id/toggle-invisibility",
  protect,
  authorizeRoles("admin", "super_admin"),
  songController.toggleSongVisibility,
);

// admin up nhạc
router.post(
  "/",
  protect,
  authorizeRoles("admin", "super_admin"),
  upload.fields([
    { name: "audioFile", maxCount: 1 },
    { name: "imageFile", maxCount: 1 },
  ]),
  songController.createSong,
);

// gọi 1 lần để lấy 200 bài
// router.post("/sync", jamendoController.fetchRandomJamendoTracks);

module.exports = router;
