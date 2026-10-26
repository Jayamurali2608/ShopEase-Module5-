import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../api/axiosInstance.js";

function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  const queryString = searchParams.toString();

  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || ""
  );

  const [categoryInput, setCategoryInput] = useState(
    searchParams.get("category") || ""
  );

  const [minPriceInput, setMinPriceInput] = useState(
    searchParams.get("minPrice") || ""
  );

  const [maxPriceInput, setMaxPriceInput] = useState(
    searchParams.get("maxPrice") || ""
  );

  const getSortOption = (params) => {
    const sortBy = params.get("sortBy") || "createdAt";
    const order = params.get("order") || "desc";

    if (sortBy === "price" && order === "asc") {
      return "price-asc";
    }

    if (sortBy === "price" && order === "desc") {
      return "price-desc";
    }

    if (sortBy === "name" && order === "asc") {
      return "name-asc";
    }

    if (sortBy === "name" && order === "desc") {
      return "name-desc";
    }

    return "createdAt-desc";
  };

  const [sortOption, setSortOption] = useState(
    getSortOption(searchParams)
  );

  // Keep filter fields synchronized with the URL
  useEffect(() => {
    const params = new URLSearchParams(queryString);

    setSearchInput(params.get("search") || "");
    setCategoryInput(params.get("category") || "");
    setMinPriceInput(params.get("minPrice") || "");
    setMaxPriceInput(params.get("maxPrice") || "");
    setSortOption(getSortOption(params));
  }, [queryString]);

  // Fetch filtered and sorted products from the backend API
  useEffect(() => {
    let isActive = true;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams(queryString);

        const allowedParams = [
          "search",
          "category",
          "minPrice",
          "maxPrice",
          "sortBy",
          "order",
        ];

        const apiParams = {};

        allowedParams.forEach((key) => {
          const value = params.get(key);

          if (value !== null && value.trim() !== "") {
            apiParams[key] = value.trim();
          }
        });

        const response = await api.get("/products", {
          params: apiParams,
        });

        const data =
          response.data.products ||
          (Array.isArray(response.data) ? response.data : []);

        if (isActive) {
          setAllProducts(data);
        }
      } catch (err) {
        console.error("Products loading error:", err);

        if (isActive) {
          setAllProducts([]);
          setError(
            err.response?.data?.message ||
              "Unable to load products. Please try again."
          );
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      isActive = false;
    };
  }, [queryString]);

  // Apply search, filters and sorting through URL query parameters
  const handleApplyFilters = (event) => {
    event.preventDefault();

    const minValue = minPriceInput.trim();
    const maxValue = maxPriceInput.trim();

    if (
      (minValue !== "" &&
        (!Number.isFinite(Number(minValue)) ||
          Number(minValue) < 0)) ||
      (maxValue !== "" &&
        (!Number.isFinite(Number(maxValue)) ||
          Number(maxValue) < 0))
    ) {
      setError("Please enter valid non-negative prices.");
      return;
    }

    if (
      minValue !== "" &&
      maxValue !== "" &&
      Number(minValue) > Number(maxValue)
    ) {
      setError(
        "Minimum price cannot be greater than maximum price."
      );
      return;
    }

    const [sortBy, order] = sortOption.split("-");

    const params = {};

    if (searchInput.trim()) {
      params.search = searchInput.trim();
    }

    if (categoryInput) {
      params.category = categoryInput;
    }

    if (minValue !== "") {
      params.minPrice = minValue;
    }

    if (maxValue !== "") {
      params.maxPrice = maxValue;
    }

    params.sortBy = sortBy;
    params.order = order;

    setError("");
    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setCategoryInput("");
    setMinPriceInput("");
    setMaxPriceInput("");
    setSortOption("createdAt-desc");
    setSearchParams({});
  };

  const selectedCategory = searchParams.get("category") || "";
  const currentSearch = searchParams.get("search") || "";

  const pageTitle = selectedCategory
    ? `${selectedCategory} Products`
    : currentSearch
      ? `Search Results for "${currentSearch}"`
      : "Discover Products";

  return (
    <main className="products-page">
      <div className="products-page-heading">
        <div>
          <p className="products-eyebrow">
            SHOPEASE COLLECTION
          </p>

          <h1>{pageTitle}</h1>

          <p className="products-subtitle">
            Find your favourite products at great prices.
          </p>
        </div>

        {(selectedCategory || currentSearch) && (
          <Link
            to="/products"
            className="clear-product-filter"
          >
            Show All Products
          </Link>
        )}
      </div>

      {/* SEARCH, CATEGORY, PRICE AND SORT FILTERS */}
      <form
        onSubmit={handleApplyFilters}
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "end",
          gap: "14px",
          padding: "20px",
          margin: "20px 0",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          backgroundColor: "#ffffff",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            flex: "2 1 200px",
          }}
        >
          <label htmlFor="product-search">
            Search Products
          </label>

          <input
            id="product-search"
            type="search"
            placeholder="Search name or description"
            value={searchInput}
            onChange={(event) =>
              setSearchInput(event.target.value)
            }
            style={filterInputStyle}
          />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            flex: "1 1 150px",
          }}
        >
          <label htmlFor="product-category">
            Category
          </label>

          <select
            id="product-category"
            value={categoryInput}
            onChange={(event) =>
              setCategoryInput(event.target.value)
            }
            style={filterInputStyle}
          >
            <option value="">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Mobiles">Mobiles</option>
            <option value="Fashion">Fashion</option>
            <option value="Beauty">Beauty</option>
            <option value="Home">Home</option>
            <option value="Appliances">Appliances</option>
            <option value="Books">Books</option>
          </select>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            flex: "1 1 100px",
          }}
        >
          <label htmlFor="min-price">
            Min Price (₹)
          </label>

          <input
            id="min-price"
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 500"
            value={minPriceInput}
            onChange={(event) =>
              setMinPriceInput(event.target.value)
            }
            style={filterInputStyle}
          />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            flex: "1 1 100px",
          }}
        >
          <label htmlFor="max-price">
            Max Price (₹)
          </label>

          <input
            id="max-price"
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 5000"
            value={maxPriceInput}
            onChange={(event) =>
              setMaxPriceInput(event.target.value)
            }
            style={filterInputStyle}
          />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            flex: "1 1 170px",
          }}
        >
          <label htmlFor="product-sort">
            Sort By
          </label>

          <select
            id="product-sort"
            value={sortOption}
            onChange={(event) =>
              setSortOption(event.target.value)
            }
            style={filterInputStyle}
          >
            <option value="createdAt-desc">
              Latest Products
            </option>

            <option value="price-asc">
              Price: Low to High
            </option>

            <option value="price-desc">
              Price: High to Low
            </option>

            <option value="name-asc">
              Name: A to Z
            </option>

            <option value="name-desc">
              Name: Z to A
            </option>
          </select>
        </div>

        <button
          type="submit"
          className="shop-button"
          style={{
            minHeight: "42px",
            cursor: "pointer",
          }}
        >
          Apply Filters
        </button>

        <button
          type="button"
          onClick={handleClearFilters}
          className="clear-product-filter"
          style={{
            minHeight: "42px",
            cursor: "pointer",
          }}
        >
          Clear All
        </button>
      </form>

      {loading ? (
        <p className="page-message">
          Loading products...
        </p>
      ) : error ? (
        <p
          className="page-message error-message"
          role="alert"
        >
          {error}
        </p>
      ) : allProducts.length === 0 ? (
        <div className="products-empty-state">
          <span>🛍️</span>

          <h2>No matching products found</h2>

          <p>
            Try changing your search or filters.
          </p>

          <button
            type="button"
            onClick={handleClearFilters}
            className="shop-button"
          >
            View All Products
          </button>
        </div>
      ) : (
        <>
          <div className="products-results-heading">
            <span>
              {allProducts.length} product
              {allProducts.length !== 1 ? "s" : ""} found
            </span>

            <Link to="/" className="back-home-link">
              ← Home
            </Link>
          </div>

          <div className="products-grid">
            {allProducts.map((product) => {
              const stock = Number(
                product.stock ?? product.countInStock ?? 0
              );

              return (
                <article
                  className="product-card"
                  key={product._id}
                >
                  <Link
                    to={`/products/${product._id}`}
                    className="product-card-link"
                    aria-label={`View ${product.name}`}
                  >
                    <div className="product-card-image-wrap">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="product-image"
                          loading="lazy"
                        />
                      ) : (
                        <div className="product-image-placeholder">
                          🛍️
                        </div>
                      )}
                    </div>

                    <div className="product-details">
                      <p className="product-category">
                        {product.category || "General"}
                      </p>

                      <h2>{product.name}</h2>

                      <p className="product-description">
                        {product.description ||
                          "Explore this product in ShopEase."}
                      </p>

                      <p className="product-price">
                        ₹
                        {Number(
                          product.price || 0
                        ).toLocaleString("en-IN")}
                      </p>

                      <p
                        className={
                          stock > 0
                            ? "product-stock"
                            : "product-stock stock-out"
                        }
                      >
                        {stock > 0
                          ? "✓ In Stock"
                          : "Out of Stock"}
                      </p>
                    </div>
                  </Link>

                  <div className="product-card-footer">
                    <Link
                      to={`/products/${product._id}`}
                      className="view-product-button"
                    >
                      View Product →
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </main>
  );
}

const filterInputStyle = {
  width: "100%",
  minHeight: "42px",
  padding: "10px 12px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  backgroundColor: "#ffffff",
  color: "#111827",
  boxSizing: "border-box",
};

export default Products;