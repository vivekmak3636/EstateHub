import api from "./api";

const adminService = {
  // Admin login
  login: async (credentials) => {
    const response = await api.post("/auth/admin/login", credentials);
    return response.data;
  },

  // Dashboard statistics
  getDashboard: async () => {
    const response = await api.get("/admin/dashboard");
    return response.data;
  },

  // Get all properties
  getProperties: async () => {
    const response = await api.get("/admin/properties");
    return response.data;
  },

  // Approve property
  approveProperty: async (id) => {
    const response = await api.put(`/admin/properties/${id}/approve`);
    return response.data;
  },

  // Reject property
  rejectProperty: async (id, rejectionReason) => {
    const response = await api.put(`/admin/properties/${id}/reject`, {
      rejectionReason,
    });
    return response.data;
  },

  // Get all users
  getUsers: async () => {
    const response = await api.get("/admin/users");
    return response.data;
  },

  // Block user
  blockUser: async (id) => {
    const response = await api.put(`/admin/users/${id}/block`);
    return response.data;
  },

  // Unblock user
  unblockUser: async (id) => {
    const response = await api.put(`/admin/users/${id}/unblock`);
    return response.data;
  },

  // Get all enquiries (Admin)
  getEnquiries: async () => {
    const response = await api.get("/admin/enquiries");
    return response.data;
  },

  // Update enquiry status
  updateEnquiryStatus: async (id, status) => {
    const response = await api.put(`/enquiries/${id}/status`, {
      status,
    });
    return response.data;
  },
};

export default adminService;