const express = require("express");

const {
  addWishlist,
  getWishlist,
  removeWishlist,
} = require("../controllers/wishlistController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/:propertyId",
  protect,
  addWishlist
);

router.get(
  "/",
  protect,
  getWishlist
);

router.delete(
  "/:propertyId",
  protect,
  removeWishlist
);

module.exports = router;