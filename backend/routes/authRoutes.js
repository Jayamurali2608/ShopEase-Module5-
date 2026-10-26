
const express = require("express");
const router = express.Router();

const {
  signup,
  login,
  getMe,
  getSavedAddresses,
  addSavedAddress,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

// Signup
router.post("/signup", signup);

// Login
router.post("/login", login);

// Get logged-in user's details
router.get("/me", protect, getMe);

// Get saved addresses for the logged-in user
router.get("/addresses", protect, getSavedAddresses);

// Save a new address for the logged-in user
router.post("/addresses", protect, addSavedAddress);

module.exports = router;
