import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setCart } from "../redux/store.js";

function Cart() {
  const dispatch = useDispatch();

  const cartItems = useSelector((state) => state.cart.items);

  // Sync the existing localStorage cart with Redux
  useEffect(() => {
    const syncCart = () => {
      try {
        const savedCart = JSON.parse(
          localStorage.getItem("cart") || "[]"
        );

        dispatch(setCart(Array.isArray(savedCart) ? savedCart : []));
      } catch {
        dispatch(setCart([]));
      }
    };

    syncCart();

    // Keep the cart updated when other parts of the app change it
    window.addEventListener("cartUpdated", syncCart);

    return () => {
      window.removeEventListener("cartUpdated", syncCart);
    };
  }, [dispatch]);

  // Update Redux and localStorage together
  const updateCart = (updatedItems) => {
    dispatch(setCart(updatedItems));
  };

  const increaseQuantity = (productId) => {
    const updatedItems = cartItems.map((item) =>
      item._id === productId &&
      Number(item.quantity) < Number(item.stock ?? 0)
        ? { ...item, quantity: Number(item.quantity) + 1 }
        : item
    );

    updateCart(updatedItems);
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const decreaseQuantity = (productId) => {
    const updatedItems = cartItems
      .map((item) =>
        item._id === productId
          ? { ...item, quantity: Number(item.quantity) - 1 }
          : item
      )
      .filter((item) => item.quantity > 0);

    updateCart(updatedItems);
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const removeItem = (productId) => {
    const updatedItems = cartItems.filter(
      (item) => item._id !== productId
    );

    updateCart(updatedItems);
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const totalAmount = cartItems.reduce(
    (total, item) =>
      total +
      Number(item.price || 0) * Number(item.quantity || 0),
    0
  );

  return (
    <main className="products-page cart-page">
      <h1>My Shopping Cart</h1>

      <p className="products-subtitle">
        Review the products you want to buy.
      </p>

      <div style={{ marginBottom: "20px" }}>
        <Link to="/" className="shop-button">
          ← Back to Home
        </Link>
      </div>

      {cartItems.length === 0 ? (
        <p className="page-message">
          Your cart is empty. Add some products to get started!
        </p>
      ) : (
        <>
          <div className="cart-list">
            {cartItems.map((item) => (
              <article className="cart-item" key={item._id}>
                <div className="cart-product-image">
                  {item.image ? (
                    <img src={item.image} alt={item.name} />
                  ) : (
                    <span>🛍️</span>
                  )}
                </div>

                <div className="cart-product-details">
                  <h2>{item.name}</h2>

                  <p className="cart-product-price">
                    ₹{Number(item.price || 0).toLocaleString("en-IN")}
                  </p>

                  <p className="cart-product-quantity">
                    Quantity: {item.quantity}
                  </p>

                  <div className="cart-actions">
                    <button
                      type="button"
                      onClick={() => decreaseQuantity(item._id)}
                      aria-label={`Decrease ${item.name} quantity`}
                    >
                      −
                    </button>

                    <span className="cart-quantity-number">
                      {item.quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() => increaseQuantity(item._id)}
                      disabled={
                        Number(item.quantity) >=
                        Number(item.stock ?? 0)
                      }
                      aria-label={`Increase ${item.name} quantity`}
                    >
                      +
                    </button>

                    <button
                      type="button"
                      className="cart-remove-button"
                      onClick={() => removeItem(item._id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <p className="cart-item-total">
                  ₹
                  {(
                    Number(item.price || 0) *
                    Number(item.quantity || 0)
                  ).toLocaleString("en-IN")}
                </p>
              </article>
            ))}
          </div>

          <section className="cart-summary">
            <h2>
              Total: ₹{totalAmount.toLocaleString("en-IN")}
            </h2>

            <Link to="/checkout" className="shop-button">
              Proceed to Checkout
            </Link>
          </section>
        </>
      )}
    </main>
  );
}

export default Cart;