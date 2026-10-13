const User = require("../models/User");
const Property = require("../models/Property");
const Enquiry = require("../models/Enquiry");

// ==================== ADMIN DASHBOARD ====================
const getDashboard = async (req, res) => {
  try {
    const [
      totalUsers,
      totalOwners,
      totalProperties,
      pendingProperties,
      approvedProperties,
      totalEnquiries,
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: { $in: ["owner", "agent"] } }),
      Property.countDocuments(),
      Property.countDocuments({ status: "pending" }),
      Property.countDocuments({ status: "approved" }),
      Enquiry.countDocuments(),
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalOwners,
        totalProperties,
        pendingProperties,
        approvedProperties,
        totalEnquiries,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== GET ALL USERS ====================
const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== GET ALL PROPERTIES ====================
const getAllProperties = async (req, res) => {
  try {
    const properties = await Property.find()
      .populate("owner", "name email phone role")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      properties,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== APPROVE PROPERTY ====================
const approveProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      {
        status: "approved",
        rejectionReason: "",
      },
      { new: true, runValidators: true }
    );

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found.",
      });
    }

    res.json({
      success: true,
      message: "Property approved.",
      property,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== REJECT PROPERTY ====================
const rejectProperty = async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    const property = await Property.findByIdAndUpdate(
      req.params.id,
      {
        status: "rejected",
        rejectionReason: rejectionReason || "Property rejected.",
      },
      { new: true, runValidators: true }
    );

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found.",
      });
    }

    res.json({
      success: true,
      message: "Property rejected.",
      property,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== BLOCK USER ====================
const blockUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked: true },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin accounts cannot be blocked here.",
      });
    }

    res.json({
      success: true,
      message: "User blocked.",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== UNBLOCK USER ====================
const unblockUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked: false },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin accounts cannot be changed here.",
      });
    }

    res.json({
      success: true,
      message: "User unblocked.",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== GET ALL ENQUIRIES ====================
const getAllEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find()
      .populate("property", "title price images location")
      .populate("user", "name email phone")
      .populate("owner", "name email phone")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      enquiries,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getDashboard,
  getUsers,
  getAllProperties,
  approveProperty,
  rejectProperty,
  blockUser,
  unblockUser,
  getAllEnquiries,
};