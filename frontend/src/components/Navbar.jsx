import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearCredentials } from "../redux/store.js";

function Navbar() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");

  const handleSearch = (event) => {
    event.preventDefault();

    if (!token) {
      navigate("/login");
      return;
    }

    const searchText = search.trim();

    navigate(
      searchText
        ? `/products?search=${encodeURIComponent(searchText)}`
        : "/products"
    );
  };

  const handleLogout = () => {
    dispatch(clearCredentials());
    navigate("/login", { replace: true });
    window.location.reload();
  };

  return (
    <header className="shop-header">
      <div className="shop-navbar">
        {/* ShopEase Logo */}
        <Link to="/" className="navbar-brand" aria-label="ShopEase Home">
          <span className="navbar-brand-icon">🛍️</span>

          <span className="navbar-brand-copy">
            <span className="navbar-brand-name">
              ShopEase<span className="navbar-brand-dot"></span>
            </span>

            <span className="navbar-brand-tagline">
              Happy shopping!
            </span>
          </span>
        </Link>

        {/* Product Search */}
        {token && (
          <form className="navbar-search" onSubmit={handleSearch}>
            <span className="navbar-search-icon" aria-hidden="true">
              🔍
            </span>

            <input
              type="search"
              placeholder="Search products, brands and more"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search products"
            />

            <button type="submit">Search</button>
          </form>
        )}

        {/* Navigation and Account Buttons */}
        <div className="navbar-actions">
          {token ? (
            <>
              <Link
                to="/wishlist"
                className="navbar-action-btn navbar-wishlist-btn"
              >
                <span aria-hidden="true">♡</span>
                <span>Wishlist</span>
              </Link>

              <Link
                to="/my-orders"
                className="navbar-action-btn navbar-orders-btn"
              >
                <span aria-hidden="true">📦</span>
                <span>My Orders</span>
              </Link>

              <Link
                to="/cart"
                className="navbar-action-btn navbar-cart-btn"
              >
                <span aria-hidden="true">🛒</span>
                <span>Cart</span>
              </Link>

              <button
                type="button"
                className="navbar-action-btn navbar-logout-btn"
                onClick={handleLogout}
              >
                Logout
              </button>

              {/* Contact button beside Logout */}
              <Link
                to="/contact"
                className="navbar-action-btn navbar-contact-btn"
              >
                <span aria-hidden="true">📞</span>
                <span>Contact</span>
              </Link>
            </>
          ) : (
            <Link
              to="/login"
              className="navbar-action-btn navbar-logout-btn"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;