const Product = require("../models/Product");
const getRecommendations = async (req, res) => {
  try {
    const { productId, category } = req.query;

    let selectedCategory = category || "";

    // If a product ID is provided, use its category
    // to find related products
    if (productId) {
      const selectedProduct = await Product.findById(productId);

      if (!selectedProduct) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      selectedCategory = selectedProduct.category;
    }

    let recommendations = [];

    // Recommend products from the same category
    if (selectedCategory) {
      const filter = {
        category: {
          $regex: `^${String(selectedCategory).replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
          )}$`,
          $options: "i",
        },
      };

      // Do not recommend the selected product itself
      if (productId) {
        filter._id = { $ne: productId };
      }

      recommendations = await Product.find(filter)
        .sort({ createdAt: -1 })
        .limit(6);
    }

    // If there are not enough related products,
    // fill the list with other available products
    if (recommendations.length < 6) {
      const excludedIds = recommendations.map(
        (product) => product._id
      );

      if (productId) {
        excludedIds.push(productId);
      }

      const moreProducts = await Product.find({
        _id: { $nin: excludedIds },
      })
        .sort({ createdAt: -1 })
        .limit(6 - recommendations.length);

      recommendations = [
        ...recommendations,
        ...moreProducts,
      ];
    }

    return res.status(200).json({
      count: recommendations.length,
      recommendations,
      message: "Product recommendations fetched successfully",
    });
  } catch (error) {
    console.error(
      "Recommendation error:",
      error.message
    );

    return res.status(500).json({
      message: "Failed to fetch product recommendations",
    });
  }
};

module.exports = {
  getRecommendations,
};