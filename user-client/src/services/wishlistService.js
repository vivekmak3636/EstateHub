import api from "./api";

const addToWishlist = async (propertyId) => {
  const response = await api.post(
    `/wishlist/${propertyId}`
  );

  return response.data;
};

const getWishlist = async () => {
  const response = await api.get("/wishlist");

  return response.data;
};

const removeFromWishlist = async (propertyId) => {
  const response = await api.delete(
    `/wishlist/${propertyId}`
  );

  return response.data;
};

const wishlistService = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
};

export default wishlistService;