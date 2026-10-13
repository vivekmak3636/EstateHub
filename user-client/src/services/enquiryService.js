import api from "./api";

const createEnquiry = async (enquiryData) => {
  const response = await api.post(
    "/enquiries",
    enquiryData
  );

  return response.data;
};

const getMyEnquiries = async () => {
  const response = await api.get("/enquiries/my");

  return response.data;
};

const getReceivedEnquiries = async () => {
  const response = await api.get("/enquiries/received");

  return response.data;
};

const updateEnquiryStatus = async (id, status) => {
  const response = await api.put(
    `/enquiries/${id}/status`,
    { status }
  );

  return response.data;
};

const enquiryService = {
  createEnquiry,
  getMyEnquiries,
  getReceivedEnquiries,
  updateEnquiryStatus,
};

export default enquiryService;