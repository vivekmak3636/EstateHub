const express = require("express");

const {
  getDashboard,
  getUsers,
  getAllProperties,
  approveProperty,
  rejectProperty,
  blockUser,
  unblockUser,
  getAllEnquiries,
} = require("../controllers/adminController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

// All routes below require admin authentication.
router.use(protect, authorize("admin"));

// Dashboard
router.get("/dashboard", getDashboard);

// Users
router.get("/users", getUsers);
router.put("/users/:id/block", blockUser);
router.put("/users/:id/unblock", unblockUser);

// Properties
router.get("/properties", getAllProperties);
router.put("/properties/:id/approve", approveProperty);
router.put("/properties/:id/reject", rejectProperty);

// Enquiries
router.get("/enquiries", getAllEnquiries);

module.exports = router;