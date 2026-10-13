import api from "./api";

const getProperties = async (params = {}) => {
  const response = await api.get("/properties", {
    params,
  });

  return response.data;
};

const getPropertyById = async (id) => {
  const response = await api.get(`/properties/${id}`);

  return response.data;
};

const getMyProperties = async () => {
  const response = await api.get("/properties/my-properties");

  return response.data;
};

const createProperty = async (propertyData) => {
  const response = await api.post("/properties", propertyData);

  return response.data;
};

const updateProperty = async (id, propertyData) => {
  const response = await api.put(
    `/properties/${id}`,
    propertyData
  );

  return response.data;
};

const deleteProperty = async (id) => {
  const response = await api.delete(`/properties/${id}`);

  return response.data;
};

const propertyService = {
  getProperties,
  getPropertyById,
  getMyProperties,
  createProperty,
  updateProperty,
  deleteProperty,
};

export default propertyService;