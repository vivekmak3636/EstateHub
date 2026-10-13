
const express = require("express");
const router = express.Router();

const {
  createEnquiry,
  getMyEnquiries,
  getReceivedEnquiries,
  markEnquiryAsRead,
  updateEnquiryStatus,
} = require("../controllers/enquiryController");

const { protect, authorize } = require("../middleware/authMiddleware");

// Create a new enquiry
router.post(
  "/",
  protect,
  authorize("user", "owner", "agent"),
  createEnquiry
);

// Get enquiries sent by the logged-in user
router.get("/my", protect, getMyEnquiries);

// Get enquiries received by owner, agent, or admin
router.get(
  "/received",
  protect,
  authorize("owner", "agent", "admin"),
  getReceivedEnquiries
);

// Mark an enquiry as read
router.patch(
  "/:id/read",
  protect,
  authorize("owner", "agent", "admin"),
  markEnquiryAsRead
);

// Update enquiry status
router.put(
  "/:id/status",
  protect,
  authorize("owner", "agent", "admin"),
  updateEnquiryStatus
);

module.exports = router;
