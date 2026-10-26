import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/axiosInstance.js";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [recommendations, setRecommendations] = useState([]);
  const [recommendationsLoading, setRecommendationsLoading] =
    useState(true);
  const [recommendationsError, setRecommendationsError] =
    useState("");

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

  // Fetch selected product
  useEffect(() => {
    let isActive = true;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");
        setProduct(null);
        setQuantity(1);
        setSize("");

        const response = await api.get(`/products/${id}`);

        const productData = response.data.product || response.data;

        if (isActive) {
          setProduct(productData);
        }
      } catch (err) {
        console.error("Product loading error:", err);

        if (isActive) {
          setError(
            "Product details load aagala. Please try again."
          );
          setProduct(null);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      isActive = false;
    };
  }, [id]);

  // Fetch recommendations for the selected product
  useEffect(() => {
    let isActive = true;

    const fetchRecommendations = async () => {
      try {
        setRecommendationsLoading(true);
        setRecommendationsError("");
        setRecommendations([]);

        const response = await api.get(
          "/analytics/recommendations",
          {
            params: {
              productId: id,
            },
          }
        );

        const data = response.data.recommendations;

        if (isActive) {
          setRecommendations(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Recommendation loading error:", err);

        if (isActive) {
          setRecommendationsError(
            "Recommendations are temporarily unavailable."
          );
        }
      } finally {
        if (isActive) {
          setRecommendationsLoading(false);
        }
      }
    };

    if (id) {
      fetchRecommendations();
    }

    return () => {
      isActive = false;
    };
  }, [id]);

  const sizes = Array.isArray(product?.sizes)
    ? product.sizes
    : [];

  const stockValue = product?.stock ?? product?.countInStock;

  const hasNumericStock =
    stockValue !== undefined &&
    stockValue !== null &&
    stockValue !== "" &&
    Number.isFinite(Number(stockValue));

  const stockCount = hasNumericStock
    ? Number(stockValue)
    : null;

  const outOfStock = hasNumericStock && stockCount <= 0;

  const isWishlisted = wishlist.some(
    (item) => item._id === product?._id
  );

  // Add or remove product from wishlist
  const toggleWishlist = () => {
    if (!product) return;

    const updatedWishlist = isWishlisted
      ? wishlist.filter((item) => item._id !== product._id)
      : [...wishlist, product];

    setWishlist(updatedWishlist);

    localStorage.setItem(
      "wishlist",
      JSON.stringify(updatedWishlist)
    );
  };

  // Add product to cart or go directly to checkout
  const addToCart = (buyNow = false) => {
    if (!product) return;

    if (outOfStock) {
      alert("Sorry, this product is out of stock.");
      return;
    }

    if (sizes.length > 0 && !size) {
      alert("Please select a size.");
      return;
    }

    if (hasNumericStock && quantity > stockCount) {
      alert(
        "Selected quantity is greater than available stock."
      );
      return;
    }

    let existingCart = [];

    try {
      const savedCart = JSON.parse(
        localStorage.getItem("cart") || "[]"
      );

      existingCart = Array.isArray(savedCart)
        ? savedCart
        : [];
    } catch {
      existingCart = [];
    }

    const existingIndex = existingCart.findIndex(
      (item) =>
        item._id === product._id &&
        (item.size || "") === size
    );

    const updatedCart =
      existingIndex !== -1
        ? existingCart.map((item, index) =>
            index === existingIndex
              ? {
                  ...item,
                  quantity:
                    Number(item.quantity || 0) + quantity,
                }
              : item
          )
        : [
            ...existingCart,
            {
              ...product,
              quantity,
              ...(size ? { size } : {}),
            },
          ];

    localStorage.setItem(
      "cart",
      JSON.stringify(updatedCart)
    );

    window.dispatchEvent(new Event("cartUpdated"));

    if (buyNow) {
      navigate("/checkout");
    } else {
      alert("Product added to cart!");
    }
  };

  // Loading screen
  if (loading) {
    return (
      <main className="product-details-page">
        <p className="page-message">
          Loading product...
        </p>
      </main>
    );
  }

  // Error screen
  if (error || !product) {
    return (
      <main className="product-details-page">
        <div className="page-message">
          <h2>Product not available</h2>
          <p>{error || "Product not found."}</p>

          <Link to="/" className="shop-button">
            ← Back to Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="product-details-page">
      <div className="product-back-navigation">
        <Link to="/" className="product-back-link">
          ← Back to Home
        </Link>
      </div>

      <div className="product-details-layout">
        {/* LEFT: Product image */}
        <div className="product-detail-image">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name || "Product"}
            />
          ) : (
            <span className="product-image-placeholder">
              🛍️
            </span>
          )}
        </div>

        {/* RIGHT: Product information */}
        <div className="product-detail-info">
          <p className="product-detail-category">
            {product.category || "ShopEase Product"}
          </p>

          <h1>{product.name}</h1>

          <p className="product-detail-price">
            ₹
            {Number(product.price || 0).toLocaleString(
              "en-IN"
            )}
          </p>

          <div className="product-detail-divider" />

          <h3 className="product-description-heading">
            Product Description
          </h3>

          <p className="product-detail-description">
            {product.description || "No description available."}
          </p>

          <div className="product-detail-stock">
            <span className="stock-label">
              Availability:
            </span>

            <span
              className={
                outOfStock ? "stock-out" : "stock-in"
              }
            >
              {outOfStock
                ? "Out of Stock"
                : hasNumericStock
                  ? `${stockCount} available`
                  : "Available"}
            </span>
          </div>

          {/* Size selector */}
          {sizes.length > 0 && (
            <div className="product-size-selector">
              <label htmlFor="product-size">
                Select Size
              </label>

              <select
                id="product-size"
                value={size}
                onChange={(event) =>
                  setSize(event.target.value)
                }
                disabled={outOfStock}
              >
                <option value="">
                  Choose your size
                </option>

                {sizes.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Quantity selector */}
          <div className="product-quantity">
            <span>Quantity</span>

            <div className="product-quantity-controls">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() =>
                  setQuantity((current) =>
                    Math.max(1, current - 1)
                  )
                }
                disabled={quantity <= 1 || outOfStock}
              >
                −
              </button>

              <span className="product-quantity-number">
                {quantity}
              </span>

              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() =>
                  setQuantity((current) => current + 1)
                }
                disabled={
                  outOfStock ||
                  (hasNumericStock &&
                    quantity >= stockCount)
                }
              >
                +
              </button>
            </div>
          </div>

          {/* Purchase buttons */}
          <div className="product-purchase-buttons">
            <button
              type="button"
              onClick={() => addToCart(false)}
              disabled={outOfStock}
            >
              🛒 Add to Cart
            </button>

            <button
              type="button"
              className="buy-now-button"
              onClick={() => addToCart(true)}
              disabled={outOfStock}
            >
              Buy Now
            </button>
          </div>

          {/* Wishlist */}
          <button
            type="button"
            className="product-add-wishlist"
            onClick={toggleWishlist}
          >
            {isWishlisted
              ? "❤️ Remove from Wishlist"
              : "♡ Add to Wishlist"}
          </button>

          {/* Product highlights */}
          <div className="product-service-information">
            <div>
              <span>🚚</span>
              <p>
                Delivery information available at checkout
              </p>
            </div>

            <div>
              <span>🔒</span>
              <p>Secure shopping with ShopEase</p>
            </div>
          </div>
        </div>
      </div>

      {/* YOU MAY ALSO LIKE */}
      <section
        className="home-product-section"
        style={{ marginTop: "48px" }}
      >
        <div className="home-section-heading">
          <div>
            <h2>You May Also Like</h2>
            <p>
              Discover more products you might like.
            </p>
          </div>
        </div>

        {recommendationsLoading && (
          <p className="page-message">
            Loading recommendations...
          </p>
        )}

        {!recommendationsLoading &&
          recommendationsError && (
            <p className="page-message">
              {recommendationsError}
            </p>
          )}

        {!recommendationsLoading &&
          !recommendationsError &&
          recommendations.length === 0 && (
            <p className="page-message">
              No recommendations available right now.
            </p>
          )}

        {!recommendationsLoading &&
          !recommendationsError &&
          recommendations.length > 0 && (
            <div className="home-product-grid">
              {recommendations.map((item) => {
                const itemStock = Number(
                  item.stock ?? item.countInStock ?? 0
                );

                return (
                  <article
                    className="home-product-card"
                    key={item._id}
                  >
                    <Link
                      to={`/products/${item._id}`}
                      className="home-product-image-link"
                      aria-label={`View ${item.name}`}
                    >
                      <div className="home-product-image">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            loading="lazy"
                          />
                        ) : (
                          <span>🛍️</span>
                        )}
                      </div>
                    </Link>

                    <div className="home-product-info">
                      <h3>
                        <Link to={`/products/${item._id}`}>
                          {item.name}
                        </Link>
                      </h3>

                      <p className="home-product-category">
                        {item.category || "General"}
                      </p>

                      <p className="home-product-description">
                        {item.description ||
                          "Explore this product in ShopEase."}
                      </p>

                      <p className="home-product-price">
                        ₹
                        {Number(
                          item.price || 0
                        ).toLocaleString("en-IN")}
                      </p>

                      <p
                        className={
                          itemStock > 0
                            ? "home-product-stock"
                            : "home-product-stock stock-out"
                        }
                      >
                        {itemStock > 0
                          ? "✓ In Stock"
                          : "Out of Stock"}
                      </p>

                      <Link
                        to={`/products/${item._id}`}
                        className="home-view-product"
                      >
                        View Product →
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
      </section>
    </main>
  );
}

export default ProductDetails;