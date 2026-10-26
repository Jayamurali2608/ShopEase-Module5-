
const express = require("express");
const router = express.Router();

const {
  getUserProfile,
  updateUserProfile,
} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");

// Get logged-in user's profile
router.get("/profile", protect, getUserProfile);

// Update logged-in user's profile
router.put("/profile", protect, updateUserProfile);

module.exports = router;
