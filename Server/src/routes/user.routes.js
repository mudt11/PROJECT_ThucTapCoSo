const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const upload = require("../midlewares/upload.midleware");

const { protect, authorizeRoles } = require("../midlewares/auth.midleware");

/* --- ROUTES FOR USER --- */

router.get("/me", protect, userController.getUserProfile);
// Cập nhật thông tin user
router.put("/me", protect, userController.updateUserProfile);
router.post(
  "/avatar",
  protect,
  upload.single("avatar"),
  userController.uploadAvatar,
);

router.post("/change-password", protect, userController.changeUserPassword);

/* --- ROUTES FOR ADMIN --- */

router.get(
  "/admin/me",
  protect,
  authorizeRoles("admin", "super_admin"),
  userController.getCurrentAdmin,
);

// router.post("/:id/promote", protect, isAdmin, userController.promoteUser);

// router.post("/:id/demote", protect, isAdmin, userController.demoteAdminToUser);

// lấy danh sách user
router.get(
  "/",
  protect,
  authorizeRoles("admin", "super_admin"),
  userController.getAllUsers,
);
// lấy danh sách admin
router.get(
  "/admins",
  protect,
  authorizeRoles("admin", "super_admin"),
  userController.getAllAdmins,
);

// Lấy thông tin user theo ID
router.get(
  "/profile/:id",
  protect,
  authorizeRoles("admin", "super_admin"),
  userController.getUserProfileByAdmin,
);
// Cập nhật thông tin user theo ID
router.put(
  "/profile/:id",
  protect,
  authorizeRoles("admin", "super_admin"),
  userController.updateUserById,
);
// Xóa user
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin", "super_admin"),
  userController.deleteUserById,
);

// Thêm mới tài khoản admin, *** cần xem lại chức năng này, phải để super duyệt
router.post(
  "/admin/new",
  protect,
  authorizeRoles("admin", "super_admin"),
  userController.addNewAdmin,
);

// Reset password
router.put(
  "/:id/reset-password",
  protect,
  authorizeRoles("admin", "super_admin"),
  userController.resetUserPassword,
);

module.exports = router;
