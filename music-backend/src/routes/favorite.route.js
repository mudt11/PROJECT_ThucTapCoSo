const express = require("express");
const router = express.Router();

const favoriteController = require("../controllers/favorite.controller");
const { protect } = require("../midlewares/auth.midleware");

router.post("/:id/like", protect, favoriteController.toggleLikeSong);
router.get("/:id/like-status", protect, favoriteController.getLikeStatus);

module.exports = router;
