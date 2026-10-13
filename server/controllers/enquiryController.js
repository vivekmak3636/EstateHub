
const Enquiry = require("../models/Enquiry");
const Property = require("../models/Property");

const createEnquiry = async (req, res) => {
  try {
    const { propertyId, name, email, phone, message } = req.body;

    if (!propertyId || !name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required enquiry details.",
      });
    }

    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found.",
      });
    }

    // Property owner is the recipient of this enquiry.
    if (!property.owner) {
      return res.status(400).json({
        success: false,
        message: "This property has no assigned owner.",
      });
    }

    const enquiry = await Enquiry.create({
      user: req.user._id,
      property: property._id,
      owner: property.owner,
      name,
      email,
      phone,
      message,
      status: "pending",
      isRead: false,
    });

    return res.status(201).json({
      success: true,
      message: "Enquiry sent successfully.",
      enquiry,
    });
  } catch (error) {
    console.error("Create enquiry error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create enquiry.",
    });
  }
};

const getMyEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find({
      user: req.user._id,
    })
      .populate("property", "title price images location")
      .populate("owner", "name email phone")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      enquiries,
    });
  } catch (error) {
    console.error("Get my enquiries error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load your enquiries.",
    });
  }
};

const getReceivedEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find({
      owner: req.user._id,
    })
      .populate("property", "title price images location")
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });

    const unreadCount = await Enquiry.countDocuments({
      owner: req.user._id,
      $or: [
        { isRead: false },
        { isRead: { $exists: false } },
      ],
    });

    return res.json({
      success: true,
      enquiries,
      unreadCount,
    });
  } catch (error) {
    console.error("Get received enquiries error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load received enquiries.",
    });
  }
};

const markEnquiryAsRead = async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found.",
      });
    }

    const isAdmin = req.user.role === "admin";
    const isOwner =
      enquiry.owner.toString() === req.user._id.toString();

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to read this enquiry.",
      });
    }

    enquiry.isRead = true;
    await enquiry.save();

    return res.json({
      success: true,
      message: "Enquiry marked as read.",
      enquiry,
    });
  } catch (error) {
    console.error("Mark enquiry read error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update enquiry.",
    });
  }
};

const updateEnquiryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["pending", "contacted", "closed"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid enquiry status.",
      });
    }

    const enquiry = await Enquiry.findById(req.params.id);

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found.",
      });
    }

    const isAdmin = req.user.role === "admin";
    const isOwner =
      enquiry.owner.toString() === req.user._id.toString();

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized.",
      });
    }

    enquiry.status = status;
    await enquiry.save();

    return res.json({
      success: true,
      message: "Enquiry status updated.",
      enquiry,
    });
  } catch (error) {
    console.error("Update enquiry status error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update enquiry status.",
    });
  }
};

module.exports = {
  createEnquiry,
  getMyEnquiries,
  getReceivedEnquiries,
  markEnquiryAsRead,
  updateEnquiryStatus,
};
