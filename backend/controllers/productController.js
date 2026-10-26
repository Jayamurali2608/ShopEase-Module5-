const Product = require("../models/Product");
const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Get all products with Search, Filter, and Sort
const getProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      sortBy,
      order,
    } = req.query;

    const filter = {};

    // Search by product name or description
    if (typeof search === "string" && search.trim()) {
      const searchText = escapeRegex(search.trim());

      filter.$or = [
        { name: { $regex: searchText, $options: "i" } },
        { description: { $regex: searchText, $options: "i" } },
      ];
    }

    // Filter by category
    if (typeof category === "string" && category.trim()) {
      const categoryText = escapeRegex(category.trim());

      filter.category = {
        $regex: `^${categoryText}$`,
        $options: "i",
      };
    }

    // Validate and filter by price
    const hasMinPrice = minPrice !== undefined;
    const hasMaxPrice = maxPrice !== undefined;

    if (hasMinPrice || hasMaxPrice) {
      const minimum = hasMinPrice ? Number(minPrice) : undefined;
      const maximum = hasMaxPrice ? Number(maxPrice) : undefined;

      if (
        (hasMinPrice &&
          (!Number.isFinite(minimum) || minimum < 0)) ||
        (hasMaxPrice &&
          (!Number.isFinite(maximum) || maximum < 0))
      ) {
        return res.status(400).json({
          message: "Price filters must be valid non-negative numbers",
        });
      }

      if (
        hasMinPrice &&
        hasMaxPrice &&
        minimum > maximum
      ) {
        return res.status(400).json({
          message: "Minimum price cannot exceed maximum price",
        });
      }

      filter.price = {};

      if (hasMinPrice) {
        filter.price.$gte = minimum;
      }

      if (hasMaxPrice) {
        filter.price.$lte = maximum;
      }
    }

    // Allow sorting only by approved fields
    const allowedSortFields = [
      "price",
      "name",
      "createdAt",
    ];

    const field = allowedSortFields.includes(sortBy)
      ? sortBy
      : "createdAt";

    const direction = order === "asc" ? 1 : -1;

    const products = await Product.find(filter).sort({
      [field]: direction,
    });

    return res.status(200).json({
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get products error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch products",
    });
  }
};

// Get single product by ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.status(200).json({ product });
  } catch (error) {
    return res.status(400).json({
      message: "Invalid product ID",
    });
  }
};

// Create product
const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      image,
      stock,
    } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof description !== "string" ||
      !description.trim() ||
      price === undefined ||
      price === null ||
      price === "" ||
      !Number.isFinite(Number(price)) ||
      Number(price) < 0 ||
      typeof category !== "string" ||
      !category.trim()
    ) {
      return res.status(400).json({
        message:
          "Valid name, description, price, and category are required",
      });
    }

    const product = await Product.create({
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      category: category.trim(),
      image,
      stock,
    });

    return res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Create product error:", error.message);

    return res.status(400).json({
      message: "Failed to create product",
    });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    // Prevent invalid prices from being saved
    if (
      req.body.price !== undefined &&
      (
        req.body.price === "" ||
        !Number.isFinite(Number(req.body.price)) ||
        Number(req.body.price) < 0
      )
    ) {
      return res.status(400).json({
        message: "Price must be a valid non-negative number",
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Update product error:", error.message);

    return res.status(400).json({
      message: "Failed to update product",
    });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(
      req.params.id
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    return res.status(400).json({
      message: "Failed to delete product",
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};