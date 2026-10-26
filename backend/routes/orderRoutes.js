const express = require("express");
const router = express.Router();

const {
  createOrder,
  getOrders,
  getOrderById,
  cancelOrder,
  requestReturn,
  updateOrder,
  deleteOrder,
} = require("../controllers/orderController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

// Create a new order (logged-in users)
router.post("/", protect, createOrder);

// Get orders
router.get("/", protect, getOrders);

// Cancel an order (owner only)
router.post("/:id/cancel", protect, cancelOrder);

// Request a return (owner only)
router.post("/:id/return", protect, requestReturn);

// Get one order by ID
router.get("/:id", protect, getOrderById);

// Update order status (Admin only)
router.put("/:id", protect, adminOnly, updateOrder);

// Delete an order (Admin only)
router.delete("/:id", protect, adminOnly, deleteOrder);

module.exports = router;