import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axiosInstance.js";

const EMPTY_FORM = {
  fullName: "",
  mobile: "",
  email: "",
  house: "",
  street: "",
  city: "",
  state: "",
  pincode: "",
  paymentMethod: "Cash on Delivery",
};

const ADDRESS_FIELDS = [
  "fullName",
  "mobile",
  "email",
  "house",
  "street",
  "city",
  "state",
  "pincode",
];

function Checkout() {
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [saveAddress, setSaveAddress] = useState(true);
  const [addressLoadMessage, setAddressLoadMessage] = useState("");

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  // Load saved addresses belonging to the logged-in user
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) return;

    const fetchAddresses = async () => {
      try {
        const response = await api.get("/auth/addresses");

        const addresses = Array.isArray(response.data.addresses)
          ? response.data.addresses
          : [];

        setSavedAddresses(addresses);

        // Automatically select the most recently saved address
        if (addresses.length > 0) {
          const latestAddress = addresses[addresses.length - 1];

          setForm((previous) => ({
            ...previous,
            ...Object.fromEntries(
              ADDRESS_FIELDS.map((field) => [
                field,
                latestAddress[field] || "",
              ])
            ),
          }));

          setSelectedAddressId(String(latestAddress._id));
          setAddressLoadMessage("");
        }
      } catch (err) {
        console.error("Saved address loading error:", err);

        setAddressLoadMessage(
          "Saved addresses could not be loaded. You can still enter a new address."
        );
      }
    };

    fetchAddresses();
  }, []);

  // Read cart contents from localStorage
  let cartItems = [];

  try {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    cartItems = Array.isArray(savedCart) ? savedCart : [];
  } catch {
    cartItems = [];
  }

  const totalAmount = cartItems.reduce(
    (total, item) =>
      total +
      Number(item.price || 0) * Number(item.quantity || 0),
    0
  );

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    // Editing an address means the user is entering a new address
    if (ADDRESS_FIELDS.includes(name)) {
      setSelectedAddressId("");
    }

    setError("");
  };

  // Select an existing saved address
  const handleSelectAddress = (event) => {
    const addressId = event.target.value;
    setSelectedAddressId(addressId);

    if (!addressId) {
      setForm((previous) => ({
        ...EMPTY_FORM,
        paymentMethod: previous.paymentMethod,
      }));

      setError("");
      return;
    }

    const address = savedAddresses.find(
      (item) => String(item._id) === addressId
    );

    if (address) {
      setForm((previous) => ({
        ...previous,
        ...Object.fromEntries(
          ADDRESS_FIELDS.map((field) => [
            field,
            address[field] || "",
          ])
        ),
      }));
    }

    setError("");
  };

  const handleCheckout = async (event) => {
    event.preventDefault();
    setError("");

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    if (cartItems.length === 0) {
      setError("Your cart is empty. Please add a product first.");
      return;
    }

    // Validate cart items
    const invalidCart = cartItems.some(
      (item) =>
        !item._id ||
        !Number.isFinite(Number(item.quantity)) ||
        Number(item.quantity) < 1 ||
        !Number.isFinite(Number(item.price)) ||
        Number(item.price) < 0
    );

    if (invalidCart) {
      setError("Your cart contains invalid items. Please review your cart.");
      return;
    }

    // Validate required delivery details
    const requiredFields = [
      "fullName",
      "mobile",
      "house",
      "street",
      "city",
      "state",
      "pincode",
    ];

    const missingField = requiredFields.some(
      (field) => !String(form[field] || "").trim()
    );

    if (missingField) {
      setError("Please fill in all required delivery details.");
      return;
    }

    if (!/^[0-9]{10}$/.test(form.mobile.trim())) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!/^[0-9]{6}$/.test(form.pincode.trim())) {
      setError("Please enter a valid 6-digit PIN code.");
      return;
    }

    const shippingAddress = [
      form.fullName.trim(),
      `Mobile: ${form.mobile.trim()}`,
      form.email.trim() ? `Email: ${form.email.trim()}` : "",
      form.house.trim(),
      form.street.trim(),
      `${form.city.trim()}, ${form.state.trim()} - ${form.pincode.trim()}`,
    ]
      .filter(Boolean)
      .join(", ");

    setIsSubmitting(true);

    try {
      // Demo payments do not contact any bank or payment gateway.
      // No real payment is processed and no money is deducted.

      // 1. Create the order
      const response = await api.post("/orders", {
        shippingAddress,
        items: cartItems.map((item) => ({
          product: item._id,
          quantity: Number(item.quantity),
          price: Number(item.price),
        })),
      });

      const createdOrder = response.data.order || response.data;

      // 2. Save a new address if requested
      let addressSaved = true;

      if (saveAddress && !selectedAddressId) {
        try {
          const addressResponse = await api.post("/auth/addresses", {
            fullName: form.fullName.trim(),
            mobile: form.mobile.trim(),
            email: form.email.trim(),
            house: form.house.trim(),
            street: form.street.trim(),
            city: form.city.trim(),
            state: form.state.trim(),
            pincode: form.pincode.trim(),
          });

          if (Array.isArray(addressResponse.data.addresses)) {
            setSavedAddresses(addressResponse.data.addresses);
          } else if (addressResponse.data.address) {
            setSavedAddresses((previous) => [
              ...previous,
              addressResponse.data.address,
            ]);
          }

          setAddressLoadMessage("");
        } catch (addressError) {
          console.error("Address save error:", addressError);
          addressSaved = false;
        }
      }

      // 3. Show order confirmation
      setOrderDetails({
        orderId:
          createdOrder._id ||
          createdOrder.id ||
          createdOrder.orderId ||
          "",
        fullName: form.fullName,
        shippingAddress,
        paymentMethod: form.paymentMethod,
        totalAmount,
        addressSaved,
        items: cartItems.map((item) => ({
          name: item.name,
          quantity: Number(item.quantity),
          price: Number(item.price || 0),
          image: item.image || "",
        })),
      });

      localStorage.removeItem("cart");
      window.dispatchEvent(new Event("cartUpdated"));
      setOrderPlaced(true);
    } catch (err) {
      console.error("Checkout error:", err);

      setError(
        err.response?.data?.message ||
          "Checkout failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Order confirmation page
  if (orderPlaced && orderDetails) {
    const isCOD =
      orderDetails.paymentMethod === "Cash on Delivery";

    return (
      <main className="checkout-page">
        <section className="order-success-card">
          <div className="order-success-icon">✓</div>

          <h1>Order Placed Successfully!</h1>

          <p className="order-success-message">
            {isCOD
              ? "Thank you for shopping with ShopEase. Your order has been placed. Please pay when your order is delivered."
              : `Demo Payment Successful! Your ${orderDetails.paymentMethod} demo payment and order were completed successfully. No real payment was processed and no money was deducted.`}
          </p>

          {orderDetails.orderId && (
            <p className="order-number">
              Order ID: <strong>{orderDetails.orderId}</strong>
            </p>
          )}

          {!orderDetails.addressSaved && (
            <p className="error-message">
              Your order was placed, but the address could not be saved
              for next time. You can still use your order confirmation.
            </p>
          )}

          <div className="order-confirmation-details">
            <h2>Order Confirmation</h2>

            <p>
              <strong>Name:</strong> {orderDetails.fullName}
            </p>

            <p>
              <strong>Delivery Address:</strong>{" "}
              {orderDetails.shippingAddress}
            </p>

            <p>
              <strong>Payment:</strong> {orderDetails.paymentMethod}
              {!isCOD && " (Demo)"}
            </p>

            <div className="confirmed-order-items">
              {orderDetails.items.map((item, index) => (
                <div
                  className="confirmed-order-item"
                  key={`${item.name}-${index}`}
                >
                  {item.image ? (
                    <img src={item.image} alt={item.name} />
                  ) : (
                    <span className="confirmed-order-placeholder">
                      🛍️
                    </span>
                  )}

                  <div>
                    <p>{item.name}</p>
                    <small>Quantity: {item.quantity}</small>
                  </div>

                  <strong>
                    ₹
                    {(item.price * item.quantity).toLocaleString("en-IN")}
                  </strong>
                </div>
              ))}
            </div>

            <h3 className="order-confirmation-total">
              Total: ₹
              {orderDetails.totalAmount.toLocaleString("en-IN")}
            </h3>

            <p className="cod-confirmation-note">
              {isCOD
                ? "Please pay when your order is delivered."
                : "Demo transaction only — no real payment was processed and no money was deducted."}
            </p>
          </div>

          <button
            type="button"
            className="continue-shopping-button"
            onClick={() => navigate("/", { replace: true })}
          >
            Continue Shopping
          </button>
        </section>
      </main>
    );
  }

  // Empty cart page
  if (cartItems.length === 0) {
    return (
      <main className="checkout-page">
        <section className="checkout-empty">
          <span>🛒</span>
          <h1>Your cart is empty</h1>
          <p>Add products before proceeding to checkout.</p>

          <Link to="/products" className="shop-button">
            Explore Products
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <div className="checkout-topbar">
        <div>
          <p className="checkout-eyebrow">SHOPEASE CHECKOUT</p>
          <h1>Complete Your Order</h1>
          <p>Delivery details, payment and order summary.</p>
        </div>

        <Link to="/cart" className="checkout-back-link">
          ← Back to Cart
        </Link>
      </div>

      <div className="checkout-layout">
        {/* Delivery address and payment */}
        <form className="checkout-form" onSubmit={handleCheckout}>
          <section className="checkout-section">
            <div className="checkout-section-heading">
              <span className="checkout-step-number">1</span>

              <div>
                <h2>Delivery Address</h2>
                <p>Where should we deliver your order?</p>
              </div>
            </div>

            {savedAddresses.length > 0 && (
              <div className="checkout-field saved-address-field">
                <label htmlFor="savedAddress">
                  Choose a saved address
                </label>

                <select
                  id="savedAddress"
                  value={selectedAddressId}
                  onChange={handleSelectAddress}
                >
                  <option value="">Enter a new address</option>

                  {savedAddresses.map((address) => (
                    <option
                      key={address._id}
                      value={String(address._id)}
                    >
                      {address.fullName} — {address.house}, {address.city}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {addressLoadMessage && (
              <p className="saved-address-hint">
                {addressLoadMessage}
              </p>
            )}

            <div className="address-grid">
              <div className="checkout-field">
                <label htmlFor="fullName">Full Name *</label>
                <input
                  id="fullName"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                  maxLength={80}
                  autoComplete="name"
                  placeholder="Enter your full name"
                />
              </div>

              <div className="checkout-field">
                <label htmlFor="mobile">Mobile Number *</label>
                <input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  title="Enter a valid 10-digit mobile number"
                  value={form.mobile}
                  onChange={handleChange}
                  required
                  autoComplete="tel"
                  placeholder="10-digit number"
                />
              </div>

              <div className="checkout-field address-field-full">
                <label htmlFor="email">Email Address (optional)</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  placeholder="you@example.com"
                />
              </div>

              <div className="checkout-field">
                <label htmlFor="house">House / Flat No. *</label>
                <input
                  id="house"
                  name="house"
                  value={form.house}
                  onChange={handleChange}
                  required
                  maxLength={100}
                  autoComplete="address-line1"
                  placeholder="House or flat number"
                />
              </div>

              <div className="checkout-field">
                <label htmlFor="street">Street / Area *</label>
                <input
                  id="street"
                  name="street"
                  value={form.street}
                  onChange={handleChange}
                  required
                  maxLength={150}
                  autoComplete="address-line2"
                  placeholder="Street or area"
                />
              </div>

              <div className="checkout-field">
                <label htmlFor="city">City *</label>
                <input
                  id="city"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  required
                  maxLength={80}
                  autoComplete="address-level2"
                  placeholder="City"
                />
              </div>

              <div className="checkout-field">
                <label htmlFor="state">State *</label>
                <input
                  id="state"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  required
                  maxLength={80}
                  autoComplete="address-level1"
                  placeholder="State"
                />
              </div>

              <div className="checkout-field">
                <label htmlFor="pincode">PIN Code *</label>
                <input
                  id="pincode"
                  name="pincode"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  title="Enter a valid 6-digit PIN code"
                  value={form.pincode}
                  onChange={handleChange}
                  required
                  autoComplete="postal-code"
                  placeholder="6-digit PIN"
                />
              </div>
            </div>

            <label className="save-address-option">
              <input
                type="checkbox"
                checked={saveAddress}
                onChange={(event) => setSaveAddress(event.target.checked)}
              />
              <span>Save this address to my account</span>
            </label>

            <p className="saved-address-hint">
              Your saved address can be selected the next time you checkout.
            </p>
          </section>

          <div className="checkout-section-divider" />

          {/* Payment options */}
          <section className="checkout-section">
            <div className="checkout-section-heading">
              <span className="checkout-step-number">2</span>

              <div>
                <h2>Payment Method</h2>
                <p>Choose how you would like to pay.</p>
              </div>
            </div>

            <div className="payment-options">
              <label
                className={`payment-option ${
                  form.paymentMethod === "Cash on Delivery"
                    ? "selected"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Cash on Delivery"
                  checked={form.paymentMethod === "Cash on Delivery"}
                  onChange={handleChange}
                />

                <span className="payment-option-icon">💵</span>

                <span className="payment-option-content">
                  <strong>Cash on Delivery</strong>
                  <small>Pay when your order arrives</small>
                </span>

                <span className="payment-option-badge">Available</span>
              </label>

              <label
                className={`payment-option ${
                  form.paymentMethod === "UPI" ? "selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="UPI"
                  checked={form.paymentMethod === "UPI"}
                  onChange={handleChange}
                />

                <span className="payment-option-icon">📱</span>

                <span className="payment-option-content">
                  <strong>UPI</strong>
                  <small>Google Pay, PhonePe, BHIM</small>
                </span>

                <span className="payment-option-badge demo">Demo</span>
              </label>

              <label
                className={`payment-option ${
                  form.paymentMethod === "Card" ? "selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Card"
                  checked={form.paymentMethod === "Card"}
                  onChange={handleChange}
                />

                <span className="payment-option-icon">💳</span>

                <span className="payment-option-content">
                  <strong>Credit / Debit Card</strong>
                  <small>Visa, Mastercard and RuPay</small>
                </span>

                <span className="payment-option-badge demo">Demo</span>
              </label>

              <label
                className={`payment-option ${
                  form.paymentMethod === "Net Banking" ? "selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Net Banking"
                  checked={form.paymentMethod === "Net Banking"}
                  onChange={handleChange}
                />

                <span className="payment-option-icon">🏦</span>

                <span className="payment-option-content">
                  <strong>Net Banking</strong>
                  <small>Pay through your bank</small>
                </span>

                <span className="payment-option-badge demo">Demo</span>
              </label>
            </div>

            {form.paymentMethod !== "Cash on Delivery" && (
              <p className="payment-demo-notice">
                Demo mode only: choosing this option simulates a successful
                payment. No UPI app, bank, or card is contacted, and no money
                will be deducted.
              </p>
            )}
          </section>

          {error && (
            <div className="checkout-error" role="alert">
              <span>⚠️</span>
              <p>{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="checkout-place-order"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? form.paymentMethod === "Cash on Delivery"
                ? "Placing Order..."
                : "Simulating Demo Payment..."
              : form.paymentMethod === "Cash on Delivery"
                ? "Place Order · Cash on Delivery"
                : `Simulate ${form.paymentMethod} Payment`}
          </button>

          <p className="checkout-secure-note">
            🔒 Demo payment only for UPI, cards and net banking. No real
            payment is processed.
          </p>
        </form>

        {/* Order summary */}
        <aside className="checkout-summary">
          <div className="checkout-summary-heading">
            <h2>Order Summary</h2>

            <span>
              {cartItems.length} item{cartItems.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="checkout-summary-items">
            {cartItems.map((item, index) => (
              <div
                className="checkout-summary-item"
                key={`${item._id}-${item.size || ""}-${index}`}
              >
                <div className="checkout-summary-image">
                  {item.image ? (
                    <img src={item.image} alt={item.name} />
                  ) : (
                    <span>🛍️</span>
                  )}
                </div>

                <div className="checkout-summary-product">
                  <strong>{item.name}</strong>

                  {item.size && <small>Size: {item.size}</small>}

                  <small>Qty: {item.quantity}</small>
                </div>

                <strong className="checkout-summary-item-price">
                  ₹
                  {(
                    Number(item.price || 0) *
                    Number(item.quantity || 0)
                  ).toLocaleString("en-IN")}
                </strong>
              </div>
            ))}
          </div>

          <div className="checkout-price-row">
            <span>Subtotal</span>
            <span>₹{totalAmount.toLocaleString("en-IN")}</span>
          </div>

          <div className="checkout-price-row">
            <span>Payment</span>
            <span className="checkout-cod-label">
              {form.paymentMethod === "Cash on Delivery"
                ? "Cash on Delivery"
                : `${form.paymentMethod} (Demo)`}
            </span>
          </div>

          <div className="checkout-summary-total">
            <span>Order Total</span>
            <strong>₹{totalAmount.toLocaleString("en-IN")}</strong>
          </div>

          <p className="checkout-summary-note">
            UPI, card and net banking are demo-only options. They simulate
            success for this project. No real payment is processed and no
            money is deducted.
          </p>

          <div className="checkout-trust-note">
            <span>✓</span>

            <div>
              <strong>ShopEase Checkout</strong>
              <small>
                Your order will be submitted after you confirm the details.
              </small>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default Checkout;