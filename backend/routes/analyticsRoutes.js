const express = require("express");
const router = express.Router();

const {
  getRecommendations,
} = require("../controllers/analyticsController");

// GET /api/analytics/recommendations
router.get("/recommendations", getRecommendations);

module.exports = router;