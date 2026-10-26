import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axiosInstance.js";

const banners = [
  {
    label: "SPECIAL OFFER",
    title: "Big Shopping Days",
    subtitle: "Discover amazing products at great prices.",
    offer: "Up to 50% OFF",
    color: "banner-blue",
    icon: "🛍️",
  },
  {
    label: "FASHION SALE",
    title: "Fashion Fiesta",
    subtitle: "Find your favourite styles for every occasion.",
    offer: "Up to 40% OFF",
    color: "banner-pink",
    icon: "👗",
  },
  {
    label: "TECH DEALS",
    title: "Upgrade Your Tech",
    subtitle: "Explore gadgets and everyday technology.",
    offer: "Amazing Deals Available",
    color: "banner-purple",
    icon: "🎧",
  },
];

const categories = [
  { icon: "📱", name: "Mobiles", category: "Mobiles" },
  { icon: "👗", name: "Fashion", category: "Fashion" },
  { icon: "👚", name: "Dresses", category: "Fashion" },
  { icon: "💄", name: "Beauty", category: "Beauty" },
  { icon: "💻", name: "Laptop", category: "Electronics" },
  { icon: "🎧", name: "Electronics", category: "Electronics" },
  { icon: "🛋️", name: "Home", category: "Home" },
  { icon: "📺", name: "Appliances", category: "Appliances" },
  { icon: "🛍️", name: "All Products", category: "" },
];

function Home() {
  const [activeBanner, setActiveBanner] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const banner = banners[activeBanner];

  // Automatically rotate promotional banners
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBanner((previous) => (previous + 1) % banners.length);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  // Fetch products using the shared API configuration
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/products");

        const productData =
          response.data.products ||
          (Array.isArray(response.data) ? response.data : []);

        setProducts(productData);
      } catch (err) {
        console.error("Product loading error:", err);
        setError("Unable to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Toggle wishlist and save it in localStorage
  const toggleWishlist = (product) => {
    const alreadyAdded = wishlist.some(
      (item) => item._id === product._id
    );

    const updatedWishlist = alreadyAdded
      ? wishlist.filter((item) => item._id !== product._id)
      : [...wishlist, product];

    setWishlist(updatedWishlist);

    localStorage.setItem(
      "wishlist",
      JSON.stringify(updatedWishlist)
    );
  };

  const previousBanner = () => {
    setActiveBanner(
      (previous) =>
        (previous - 1 + banners.length) % banners.length
    );
  };

  const nextBanner = () => {
    setActiveBanner(
      (previous) => (previous + 1) % banners.length
    );
  };

  return (
    <main className="shop-home">
      {/* CATEGORY NAVIGATION */}
      <section className="home-categories">
        {categories.map((category) => (
          <Link
            key={category.name}
            to={
              category.category
                ? `/products?category=${encodeURIComponent(
                    category.category
                  )}`
                : "/products"
            }
            className="home-category"
          >
            <span className="category-icon">
              {category.icon}
            </span>

            <span>{category.name}</span>
          </Link>
        ))}
      </section>

      {/* PROMOTIONAL BANNER */}
      <section className={`home-banner ${banner.color}`}>
        <div className="banner-content">
          <span className="banner-label">
            {banner.label}
          </span>

          <h1>{banner.title}</h1>

          <p>{banner.subtitle}</p>

          <h2>{banner.offer}</h2>

          <Link to="/products" className="banner-button">
            Shop Now →
          </Link>
        </div>

        <div className="banner-decoration">
          {banner.icon}
        </div>

        <button
          type="button"
          className="banner-arrow banner-prev"
          onClick={previousBanner}
          aria-label="Previous banner"
        >
          &#10094;
        </button>

        <button
          type="button"
          className="banner-arrow banner-next"
          onClick={nextBanner}
          aria-label="Next banner"
        >
          &#10095;
        </button>

        <div className="banner-dots">
          {banners.map((item, index) => (
            <button
              type="button"
              key={item.title}
              className={
                activeBanner === index ? "active" : ""
              }
              onClick={() => setActiveBanner(index)}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* PRODUCT COLLECTION */}
      <section className="home-product-section">
        <div className="home-section-heading">
          <div>
            <h2>Discover Our Products</h2>
            <p>Find something you'll love.</p>
          </div>

          <Link to="/products">
            View All →
          </Link>
        </div>

        {loading && (
          <p className="page-message">
            Loading products...
          </p>
        )}

        {!loading && error && (
          <p className="error-message">{error}</p>
        )}

        {!loading && !error && products.length === 0 && (
          <p className="page-message">
            No products available right now.
          </p>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="home-product-grid">
            {products.slice(0, 8).map((product) => {
              const isWishlisted = wishlist.some(
                (item) => item._id === product._id
              );

              const stock = Number(
                product.stock ?? product.countInStock ?? 0
              );

              return (
                <article
                  className="home-product-card"
                  key={product._id}
                >
                  {/* Wishlist button */}
                  <button
                    type="button"
                    className="wishlist-heart"
                    onClick={() => toggleWishlist(product)}
                    aria-label={
                      isWishlisted
                        ? "Remove from wishlist"
                        : "Add to wishlist"
                    }
                  >
                    {isWishlisted ? "❤️" : "🤍"}
                  </button>

                  {/* Product image */}
                  <Link
                    to={`/products/${product._id}`}
                    className="home-product-image-link"
                    aria-label={`View ${product.name}`}
                  >
                    <div className="home-product-image">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          loading="lazy"
                        />
                      ) : (
                        <span>🛍️</span>
                      )}
                    </div>
                  </Link>

                  {/* Product information */}
                  <div className="home-product-info">
                    <h3>
                      <Link to={`/products/${product._id}`}>
                        {product.name}
                      </Link>
                    </h3>

                    <p className="home-product-category">
                      {product.category || "General"}
                    </p>

                    <p className="home-product-description">
                      {product.description ||
                        "Explore this product in ShopEase."}
                    </p>

                    <p className="home-product-price">
                      ₹
                      {Number(
                        product.price || 0
                      ).toLocaleString("en-IN")}
                    </p>

                    <p
                      className={
                        stock > 0
                          ? "home-product-stock"
                          : "home-product-stock stock-out"
                      }
                    >
                      {stock > 0
                        ? "✓ In Stock"
                        : "Out of Stock"}
                    </p>

                    <Link
                      to={`/products/${product._id}`}
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

      {/* BOTTOM PROMOTION */}
      <section className="home-promo">
        <div>
          <p>YOUR NEXT FAVOURITE IS WAITING</p>

          <h2>Shop More, Save More!</h2>

          <span>
            Explore our collection and find something you love.
          </span>
        </div>

        <Link to="/products" className="banner-button">
          Explore Products →
        </Link>
      </section>
    </main>
  );
}

export default Home;