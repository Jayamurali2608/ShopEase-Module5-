import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axiosInstance.js";

function MyOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionFeedback, setActionFeedback] = useState(null);
  const [actionInProgress, setActionInProgress] = useState("");

  // Fetch orders for the logged-in user
  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await api.get("/orders");

        setOrders(
          Array.isArray(response.data.orders)
            ? response.data.orders
            : []
        );
      } catch (err) {
        console.error("My Orders loading error:", err);

        if (err.response?.status === 401) {
          setError("Your session has expired. Please log in again.");
        } else {
          setError(
            err.response?.data?.message ||
              "Unable to load your orders. Please try again."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Cancel an eligible order
  const handleCancelOrder = async (order) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmed) return;

    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }

    setActionInProgress(`${order._id}-cancel`);
    setActionFeedback(null);

    try {
      const response = await api.post(
        `/orders/${order._id}/cancel`,
        {}
      );

      setOrders((previousOrders) =>
        previousOrders.map((item) =>
          item._id === order._id
            ? { ...item, ...response.data.order }
            : item
        )
      );

      setActionFeedback({
        orderId: order._id,
        type: "success",
        message: "Order cancelled successfully.",
      });
    } catch (err) {
      if (err.response?.status === 401) {
        setActionFeedback({
          orderId: order._id,
          type: "error",
          message: "Your session has expired. Please log in again.",
        });
      } else {
        setActionFeedback({
          orderId: order._id,
          type: "error",
          message:
            err.response?.data?.message ||
            "Could not cancel this order. Please try again.",
        });
      }
    } finally {
      setActionInProgress("");
    }
  };

  // Submit a return request for a delivered order
  const handleReturnOrder = async (order) => {
    const confirmed = window.confirm(
      "Do you want to submit a return request for this order?"
    );

    if (!confirmed) return;

    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }

    setActionInProgress(`${order._id}-return`);
    setActionFeedback(null);

    try {
      const response = await api.post(
        `/orders/${order._id}/return`,
        {}
      );

      setOrders((previousOrders) =>
        previousOrders.map((item) =>
          item._id === order._id
            ? { ...item, ...response.data.order }
            : item
        )
      );

      setActionFeedback({
        orderId: order._id,
        type: "success",
        message: "Return request submitted successfully.",
      });
    } catch (err) {
      if (err.response?.status === 401) {
        setActionFeedback({
          orderId: order._id,
          type: "error",
          message: "Your session has expired. Please log in again.",
        });
      } else {
        setActionFeedback({
          orderId: order._id,
          type: "error",
          message:
            err.response?.data?.message ||
            "Could not submit your return request. Please try again.",
        });
      }
    } finally {
      setActionInProgress("");
    }
  };

  // Loading screen
  if (loading) {
    return (
      <main className="my-orders-page">
        <p className="my-orders-message">Loading your orders...</p>
      </main>
    );
  }

  return (
    <main className="my-orders-page">
      <div className="my-orders-header">
        <div>
          <p className="my-orders-eyebrow">SHOPEASE</p>
          <h1>My Orders</h1>
          <p>View your purchases and track your order status.</p>
        </div>

        <Link to="/products" className="my-orders-shop-button">
          Continue Shopping
        </Link>
      </div>

      {error && (
        <div className="my-orders-error" role="alert">
          {error}
        </div>
      )}

      {!error && orders.length === 0 && (
        <section className="my-orders-empty">
          <div className="my-orders-empty-icon">🛍️</div>
          <h2>No orders yet</h2>
          <p>
            Your orders will appear here after you complete a purchase.
          </p>

          <Link to="/products" className="my-orders-shop-button">
            Explore Products
          </Link>
        </section>
      )}

      {orders.length > 0 && (
        <section className="my-orders-list">
          <div className="my-orders-count">
            {orders.length} order{orders.length !== 1 ? "s" : ""} found
          </div>

          {orders.map((order) => {
            const status = order.status || "Pending";
            const returnStatus =
              order.returnStatus || "Not Requested";

            const canCancel = ["Pending", "Processing"].includes(status);

            const canReturn =
              status === "Delivered" &&
              returnStatus === "Not Requested";

            const cancelLoading =
              actionInProgress === `${order._id}-cancel`;

            const returnLoading =
              actionInProgress === `${order._id}-return`;

            return (
              <article className="my-order-card" key={order._id}>
                {/* Order ID and status */}
                <div className="my-order-top">
                  <div>
                    <span className="my-order-label">ORDER ID</span>
                    <strong className="my-order-id">
                      {order._id}
                    </strong>
                  </div>

                  <span
                    className={`my-order-status ${status
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                  >
                    {status}
                  </span>
                </div>

                {/* Date and total */}
                <div className="my-order-meta">
                  <p>
                    <span>Order Date</span>
                    <strong>{formatDate(order.createdAt)}</strong>
                  </p>

                  <p>
                    <span>Total Amount</span>
                    <strong>
                      ₹
                      {Number(order.totalAmount || 0).toLocaleString(
                        "en-IN"
                      )}
                    </strong>
                  </p>
                </div>

                {/* Product list and actual product images */}
                <div className="my-order-products">
                  <h3>Items in this order</h3>

                  {(order.items || []).map((item, index) => (
                    <div
                      className="my-order-product"
                      key={`${
                        item.product?._id || item.product || "item"
                      }-${index}`}
                    >
                      <div className="my-order-product-icon">
                        {item.product?.image ? (
                          <img
                            src={item.product.image}
                            alt={item.product.name || "Product"}
                            loading="lazy"
                          />
                        ) : (
                          <span>📦</span>
                        )}
                      </div>

                      <div className="my-order-product-info">
                        <strong>
                          {item.product?.name || "Product"}
                        </strong>
                        <span>Quantity: {item.quantity}</span>
                      </div>

                      <strong className="my-order-product-price">
                        ₹
                        {(
                          Number(item.price || 0) *
                          Number(item.quantity || 0)
                        ).toLocaleString("en-IN")}
                      </strong>
                    </div>
                  ))}
                </div>

                {/* Delivery address */}
                <div className="my-order-address">
                  <h3>Delivery Address</h3>
                  <p>
                    {order.shippingAddress || "Address unavailable"}
                  </p>
                </div>

                {/* Cancel and Return actions */}
                <div className="my-order-actions">
                  {canCancel && (
                    <button
                      type="button"
                      className="my-order-cancel-button"
                      onClick={() => handleCancelOrder(order)}
                      disabled={Boolean(actionInProgress)}
                    >
                      {cancelLoading
                        ? "Cancelling..."
                        : "Cancel Order"}
                    </button>
                  )}

                  {canReturn && (
                    <button
                      type="button"
                      className="my-order-return-button"
                      onClick={() => handleReturnOrder(order)}
                      disabled={Boolean(actionInProgress)}
                    >
                      {returnLoading
                        ? "Submitting..."
                        : "Return Order"}
                    </button>
                  )}

                  {status === "Cancelled" && (
                    <span className="my-order-action-status cancelled">
                      This order has been cancelled.
                    </span>
                  )}

                  {status === "Shipped" && (
                    <span className="my-order-action-status">
                      Your order has been shipped.
                    </span>
                  )}

                  {status === "Delivered" &&
                    returnStatus !== "Not Requested" && (
                      <span className="my-order-action-status">
                        Return Status: {returnStatus}
                      </span>
                    )}
                </div>

                {/* Action feedback */}
                {actionFeedback?.orderId === order._id && (
                  <p
                    className={`my-order-feedback ${actionFeedback.type}`}
                    role="status"
                  >
                    {actionFeedback.message}
                  </p>
                )}
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}

export default MyOrders;