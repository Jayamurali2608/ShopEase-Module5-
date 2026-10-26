const User = require("../models/User");

// Get logged-in user's profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(
      req.user.userId
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("Get user profile error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch user profile",
    });
  }
};

// Update logged-in user's profile
const updateUserProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    // Check whether the request includes an allowed field
    if (name === undefined && email === undefined) {
      return res.status(400).json({
        message: "Please provide a name or email to update",
      });
    }

    const updates = {};

    // Validate and update name
    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          message: "Name cannot be empty",
        });
      }

      updates.name = name.trim();
    }

    // Validate and update email
    if (email !== undefined) {
      if (
        typeof email !== "string" ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
      ) {
        return res.status(400).json({
          message: "Please provide a valid email",
        });
      }

      const normalizedEmail = email.trim().toLowerCase();

      // Prevent using another user's email
      const existingUser = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: req.user.userId },
      });

      if (existingUser) {
        return res.status(409).json({
          message: "Email is already in use",
        });
      }

      updates.email = normalizedEmail;
    }

    // Update only the logged-in user's allowed profile fields
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update user profile error:", error.message);

    // Handle duplicate email errors from MongoDB
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email is already in use",
      });
    }

    return res.status(400).json({
      message: "Failed to update profile",
    });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
};