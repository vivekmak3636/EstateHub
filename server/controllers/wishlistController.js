const Wishlist = require("../models/Wishlist");
const Property = require("../models/Property");

const addWishlist = async (req, res) => {
  try {
    const property =
      await Property.findById(
        req.params.propertyId
      );

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found.",
      });
    }

    const existing =
      await Wishlist.findOne({
        user: req.user._id,
        property: property._id,
      });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Property already in wishlist.",
      });
    }

    const wishlist =
      await Wishlist.create({
        user: req.user._id,
        property: property._id,
      });

    res.status(201).json({
      success: true,
      message: "Added to wishlist.",
      wishlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getWishlist = async (req, res) => {
  try {
    const wishlist =
      await Wishlist.find({
        user: req.user._id,
      })
        .populate("property")
        .sort({ createdAt: -1 });

    res.json({
      success: true,
      wishlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const removeWishlist = async (req, res) => {
  try {
    const deleted =
      await Wishlist.findOneAndDelete({
        user: req.user._id,
        property: req.params.propertyId,
      });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Wishlist item not found.",
      });
    }

    res.json({
      success: true,
      message: "Removed from wishlist.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  addWishlist,
  getWishlist,
  removeWishlist,
};