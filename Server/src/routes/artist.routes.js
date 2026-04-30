const express = require("express");
const router = express.Router();
const artistController = require("../controllers/artist.controller");
const { protect, authorizeRoles } = require("../midlewares/auth.midleware");

// API tạo nghệ sĩ
// POST /api/artists

router.post(
  "/",
  protect,
  authorizeRoles("admin", "super_admin"),
  artistController.createArtist,
);

// API lấy tất cả nghệ sĩ
// GET/api/artist

router.get("/", artistController.getAllArtists);
router.get("/:artistId", artistController.getArtistDetail);

module.exports = router;
