import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

import wishlistService from "../services/wishlistService";

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  const getPropertyId = (item) => {
    const id =
      item?.property?._id ||
      item?.property?.id ||
      item?.propertyId?._id ||
      item?.propertyId ||
      item?._id ||
      item?.id;

    return id ? String(id) : "";
  };

  const loadWishlist = useCallback(async () => {
    const token = localStorage.getItem("userToken");

    if (!token) {
      setWishlist([]);
      return;
    }

    try {
      setLoading(true);

      const response = await wishlistService.getWishlist();

      const data = Array.isArray(response)
        ? response
        : response?.wishlist ||
          response?.data?.wishlist ||
          [];

      setWishlist(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(
        "Load wishlist error:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const isInWishlist = (propertyId) => {
    if (!propertyId) return false;

    const targetId = String(propertyId);

    return wishlist.some(
      (item) => getPropertyId(item) === targetId
    );
  };

  const addToWishlist = async (propertyId) => {
    try {
      const response =
        await wishlistService.addToWishlist(propertyId);

      await loadWishlist();

      return response;
    } catch (error) {
      console.error(
        "Add wishlist error:",
        error.response?.data || error.message
      );
      throw error;
    }
  };

  const removeFromWishlist = async (propertyId) => {
    try {
      const response =
        await wishlistService.removeFromWishlist(propertyId);

      await loadWishlist();

      return response;
    } catch (error) {
      console.error(
        "Remove wishlist error:",
        error.response?.data || error.message
      );
      throw error;
    }
  };

  const toggleWishlist = async (propertyId) => {
    if (isInWishlist(propertyId)) {
      return removeFromWishlist(propertyId);
    }

    return addToWishlist(propertyId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        loadWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error(
      "useWishlist must be used inside WishlistProvider"
    );
  }

  return context;
};