const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// User Signup
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please provide name, email, and password",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Signup successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);

    res.status(500).json({
      message: "Signup failed",
    });
  }
};

// User Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide email and password",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: "Authentication configuration error",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Login failed",
    });
  }
};

// Get logged-in user's details
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "-password"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      user,
    });
  } catch (error) {
    console.error("Get user error:", error);

    res.status(500).json({
      message: "Failed to fetch user details",
    });
  }
};

// Get saved addresses for the logged-in user
const getSavedAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "savedAddresses"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      addresses: user.savedAddresses || [],
    });
  } catch (error) {
    console.error("Get saved addresses error:", error);

    res.status(500).json({
      message: "Failed to fetch saved addresses",
    });
  }
};

// Save a new address for the logged-in user
const addSavedAddress = async (req, res) => {
  try {
    const {
      fullName,
      mobile,
      email,
      house,
      street,
      city,
      state,
      pincode,
    } = req.body;

    if (
      !fullName?.trim() ||
      !mobile?.trim() ||
      !house?.trim() ||
      !street?.trim() ||
      !city?.trim() ||
      !state?.trim() ||
      !pincode?.trim()
    ) {
      return res.status(400).json({
        message: "Please provide all required address details",
      });
    }

    if (!/^[0-9]{10}$/.test(mobile.trim())) {
      return res.status(400).json({
        message: "Enter a valid 10-digit mobile number",
      });
    }

    if (!/^[0-9]{6}$/.test(pincode.trim())) {
      return res.status(400).json({
        message: "Enter a valid 6-digit PIN code",
      });
    }

    if (
      email?.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      return res.status(400).json({
        message: "Enter a valid email address",
      });
    }

    // Only modify the user identified by the verified login token.
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const newAddress = {
      fullName: fullName.trim(),
      mobile: mobile.trim(),
      email: email?.trim().toLowerCase() || "",
      house: house.trim(),
      street: street.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
    };

    user.savedAddresses.push(newAddress);

    await user.save();

    const savedAddress =
      user.savedAddresses[user.savedAddresses.length - 1];

    res.status(201).json({
      message: "Address saved successfully",
      address: savedAddress,
      addresses: user.savedAddresses,
    });
  } catch (error) {
    console.error("Save address error:", error);

    res.status(500).json({
      message: "Failed to save address",
    });
  }
};

module.exports = {
  signup,
  login,
  getMe,
  getSavedAddresses,
  addSavedAddress,
};
