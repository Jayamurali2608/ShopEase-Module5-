const Order = require("../models/Order");

// Create a new order
const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Order items are required",
      });
    }

    if (!shippingAddress || !shippingAddress.trim()) {
      return res.status(400).json({
        message: "Shipping address is required",
      });
    }

    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      const quantity = Number(item.quantity);
      const price = Number(item.price);

      if (
        !item.product ||
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        !Number.isFinite(price) ||
        price < 0
      ) {
        return res.status(400).json({
          message:
            "Each item needs a product ID, valid quantity, and price",
        });
      }

      totalAmount += quantity * price;

      validatedItems.push({
        product: item.product,
        quantity,
        price,
      });
    }

    const order = await Order.create({
      user: req.user.userId,
      items: validatedItems,
      totalAmount,
      shippingAddress: shippingAddress.trim(),
    });

    res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error("Create order error:", error);

    res.status(400).json({
      message: "Failed to create order",
    });
  }
};

// Get orders for the logged-in user
const getOrders = async (req, res) => {
  try {
    const filter =
      req.user.role === "admin" && req.query.all === "true"
        ? {}
        : { user: req.user.userId };

    const orders = await Order.find(filter)
      .populate("user", "name email")
      .populate("items.product", "name price image")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Fetch orders error:", error);

    res.status(500).json({
      message: "Failed to fetch orders",
    });
  }
};

// Get one order by ID
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("items.product", "name price image");

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    const isOwner =
      order.user._id.toString() === req.user.userId;

    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "You are not allowed to view this order",
      });
    }

    res.status(200).json({ order });
  } catch (error) {
    console.error("Fetch order error:", error);

    res.status(400).json({
      message: "Invalid order ID",
    });
  }
};

// Cancel an order (owner only)
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.user.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "You are not allowed to cancel this order",
      });
    }

    if (!["Pending", "Processing"].includes(order.status)) {
      return res.status(400).json({
        message: "Only pending or processing orders can be cancelled",
      });
    }

    order.status = "Cancelled";
    await order.save();

    res.status(200).json({
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    console.error("Cancel order error:", error);

    res.status(400).json({
      message: "Failed to cancel order",
    });
  }
};

// Request a return (owner only)
const requestReturn = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.user.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "You are not allowed to return this order",
      });
    }

    if (order.status !== "Delivered") {
      return res.status(400).json({
        message: "Only delivered orders can be returned",
      });
    }

    if (order.returnStatus !== "Not Requested") {
      return res.status(400).json({
        message: "A return request already exists for this order",
      });
    }

    order.returnStatus = "Requested";
    order.returnRequestedAt = new Date();

    await order.save();

    res.status(200).json({
      message: "Return request submitted successfully",
      order,
    });
  } catch (error) {
    console.error("Return request error:", error);

    res.status(400).json({
      message: "Failed to submit return request",
    });
  }
};

// Update order status (Admin only)
const updateOrder = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status",
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.status(200).json({
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update order error:", error);

    res.status(400).json({
      message: "Failed to update order",
    });
  }
};

// Delete an order (Admin only)
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.status(200).json({
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("Delete order error:", error);

    res.status(400).json({
      message: "Failed to delete order",
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  cancelOrder,
  requestReturn,
  updateOrder,
  deleteOrder,
};