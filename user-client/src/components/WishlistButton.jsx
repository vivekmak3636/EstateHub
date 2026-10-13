
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import wishlistService from "../services/wishlistService";
import { useAuth } from "../context/AuthContext";
import "./WishlistButton.css";

const WishlistButton = ({ propertyId, property, className = "" }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const id = propertyId || property?._id;

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const checkWishlist = async () => {
      if (!user || !id) {
        setIsWishlisted(false);
        setChecking(false);
        return;
      }

      try {
        setChecking(true);

        const response = await wishlistService.getWishlist();

        const items = Array.isArray(response)
          ? response
          : response?.wishlist ||
            response?.data?.wishlist ||
            response?.items ||
            response?.data?.items ||
            [];

        const exists = items.some((item) => {
          const savedProperty = item?.property || item;
          const savedId =
            savedProperty?._id || savedProperty?.propertyId;

          return savedId && String(savedId) === String(id);
        });

        if (active) {
          setIsWishlisted(exists);
        }
      } catch (err) {
        console.error(
          "Check wishlist error:",
          err?.response?.data || err
        );
      } finally {
        if (active) {
          setChecking(false);
        }
      }
    };

    checkWishlist();

    return () => {
      active = false;
    };
  }, [user, id]);

  const handleToggle = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!user) {
      navigate("/login");
      return;
    }

    if (!id || loading) return;

    try {
      setLoading(true);
      setError("");

      if (isWishlisted) {
        await wishlistService.removeFromWishlist(id);
        setIsWishlisted(false);
      } else {
        await wishlistService.addToWishlist(id);
        setIsWishlisted(true);
      }
    } catch (err) {
      console.error(
        "Wishlist update error:",
        err?.response?.data || err
      );

      setError(
        err?.response?.data?.message ||
          "Wishlist update થઈ શક્યું નથી. ફરી પ્રયાસ કરો."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`wishlist-button-wrap ${className}`}>
      <button
        type="button"
        className={`wishlist-button ${
          isWishlisted ? "is-wishlisted" : ""
        }`}
        onClick={handleToggle}
        disabled={loading || checking || !id}
        aria-label={
          isWishlisted
            ? "Remove from wishlist"
            : "Add to wishlist"
        }
        aria-pressed={isWishlisted}
        title={
          isWishlisted
            ? "Remove from Wishlist"
            : "Add to Wishlist"
        }
      >
        {loading ? (
          <span className="wishlist-spinner" />
        ) : (
          <span aria-hidden="true">
            {isWishlisted ? "♥" : "♡"}
          </span>
        )}
      </button>

      {error && (
        <span className="wishlist-button-error" role="status">
          {error}
        </span>
      )}
    </div>
  );
};

export default WishlistButton;
