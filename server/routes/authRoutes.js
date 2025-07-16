const express = require("express");
const router = express.Router();

const {
  signup,
  login,
  updateProfile,
  changePassword,
  updateUserRole,
} = require("../controllers/authController");

const verifyToken = require("../middleware/verifyToken");
const isAdmin = require("../middleware/isAdmin");

// Public routes
router.post("/signup", signup);
router.post("/login", login);

// Protected routes (if needed)
router.put("/profile", verifyToken, updateProfile);
router.put("/password", verifyToken, changePassword);
router.put("/users/:id/role", verifyToken, isAdmin, updateUserRole);

module.exports = router;
