const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const {
  signup,
  login,
  updateProfile,
  changePassword,
  updateUserRole,
  getAllUsers ,
} = require("../controllers/authController");

const verifyToken = require("../middleware/verifyToken");
const isAdmin = require("../middleware/isAdmin");

// Public routes
router.post("/signup", signup);
router.post("/login", login);
router.get("/users", verifyToken, isAdmin, getAllUsers);
// Protected routes (if needed)

router.put("/profile", verifyToken, upload.single("avatar"), updateProfile);
router.put("/password", verifyToken, changePassword);
router.put("/users/:id/role", verifyToken, isAdmin, updateUserRole);

module.exports = router;
