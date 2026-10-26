
import { useState } from "react";
import { Link } from "react-router-dom";

function Wishlist() {
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("wishlist") || "[]"
      );

      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  const removeFromWishlist = (productId) => {
    const updatedWishlist = wishlist.filter(
      (product) => product._id !== productId
    );

    setWishlist(updatedWishlist);

    localStorage.setItem(
      "wishlist",
      JSON.stringify(updatedWishlist)
    );
  };

  return (
    <main className="wishlist-page">
      <div className="wishlist-heading">
        <div>
          <p className="wishlist-eyebrow">YOUR COLLECTION</p>
          <h1>My Wishlist ❤️</h1>
          <p>Keep your favourite products in one place.</p>
        </div>

        <Link to="/products" className="wishlist-browse-link">
          Continue Shopping →
        </Link>
      </div>

      {wishlist.length === 0 ? (
        <section className="wishlist-empty">
          <span>🤍</span>
          <h2>Your wishlist is empty</h2>
          <p>
            Browse products and tap the heart icon to save your
            favourites here.
          </p>

          <Link to="/products" className="shop-button">
            Explore Products
          </Link>
        </section>
      ) : (
        <>
          <p className="wishlist-count">
            {wishlist.length} saved product
            {wishlist.length !== 1 ? "s" : ""}
          </p>

          <div className="wishlist-grid">
            {wishlist.map((product) => (
              <article
                className="wishlist-card"
                key={product._id}
              >
                <Link
                  to={`/products/${product._id}`}
                  className="wishlist-image-link"
                >
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                    />
                  ) : (
                    <span>🛍️</span>
                  )}
                </Link>

                <div className="wishlist-card-info">
                  <p className="wishlist-category">
                    {product.category || "General"}
                  </p>

                  <Link
                    to={`/products/${product._id}`}
                    className="wishlist-product-name"
                  >
                    {product.name}
                  </Link>

                  <p className="wishlist-price">
                    ₹
                    {Number(
                      product.price || 0
                    ).toLocaleString("en-IN")}
                  </p>

                  <Link
                    to={`/products/${product._id}`}
                    className="wishlist-view-button"
                  >
                    View Product
                  </Link>

                  <button
                    type="button"
                    className="wishlist-remove-button"
                    onClick={() =>
                      removeFromWishlist(product._id)
                    }
                  >
                    Remove from Wishlist
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </main>
  );
}

export default Wishlist;
