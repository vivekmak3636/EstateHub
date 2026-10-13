const express = require("express");

const {
  createProperty,
  getProperties,
  getPropertyById,
  getMyProperties,
  updateProperty,
  deleteProperty,
} = require("../controllers/propertyController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getProperties);

router.get(
  "/my-properties",
  protect,
  authorize("owner", "agent", "admin"),
  getMyProperties
);

router.get("/:id", getPropertyById);

router.post(
  "/",
  protect,
  authorize("owner", "agent"),
  createProperty
);

router.put(
  "/:id",
  protect,
  authorize("owner", "agent", "admin"),
  updateProperty
);

router.delete(
  "/:id",
  protect,
  authorize("owner", "agent", "admin"),
  deleteProperty
);

module.exports = router;