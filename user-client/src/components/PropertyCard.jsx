
import { Link } from "react-router-dom";
import { formatPrice } from "../utils/formatters";
import { useWishlist } from "../context/WishlistContext";

import "./PropertyCard.css";

const FALLBACK_IMAGE =
  "https://placehold.co/600x400/eaf0f5/18324a?text=EstateHub";

const cleanImageUrl = (image) => {
  if (!image || typeof image !== "string") {
    return "";
  }

  const value = image.trim();

  const markdownMatch = value.match(
    /!?\[[^\]]*\]\((https?:\/\/[^)]+)\)/
  );

  if (markdownMatch) {
    return markdownMatch[1];
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return "";
};

const PropertyCard = ({ property }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();

  const propertyId = property?._id || property?.id;

  const image =
    cleanImageUrl(property?.images?.[0]) ||
    cleanImageUrl(property?.image) ||
    FALLBACK_IMAGE;

  const location = [
    property?.location?.city,
    property?.location?.state,
  ]
    .filter(Boolean)
    .join(", ") ||
    property?.location?.address ||
    "Location unavailable";

  const propertyType =
    property?.propertyType ||
    property?.type ||
    "Property";

  const favorite = propertyId
    ? isInWishlist(propertyId)
    : false;

  const handleWishlist = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!propertyId) return;

    try {
      await toggleWishlist(propertyId);
    } catch (error) {
      console.error(
        "Wishlist error:",
        error?.response?.data || error
      );
    }
  };

  return (
    <article className="property-card">
      <div className="property-image-wrapper">
        <Link
          to={`/properties/${propertyId}`}
          className="property-image-link"
        >
          <img
            src={image}
            alt={property?.title || "Property"}
            className="property-image"
            loading="lazy"
            onError={(event) => {
              if (event.currentTarget.src !== FALLBACK_IMAGE) {
                event.currentTarget.src = FALLBACK_IMAGE;
              }
            }}
          />
        </Link>

        <span className="property-type">
          {propertyType}
        </span>

        <button
          type="button"
          className={`property-wishlist-button ${
            favorite ? "active" : ""
          }`}
          onClick={handleWishlist}
          aria-label={
            favorite
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
          aria-pressed={favorite}
          title={
            favorite
              ? "Remove from Wishlist"
              : "Add to Wishlist"
          }
        >
          {favorite ? "♥" : "♡"}
        </button>
      </div>

      <div className="property-card-content">
        <div className="property-price">
          {formatPrice(property?.price)}
        </div>

        <h2 className="property-title">
          {property?.title || "Untitled Property"}
        </h2>

        <p className="property-card-location">
          <span aria-hidden="true">📍</span>
          {location}
        </p>

        <div className="property-details">
          {property?.bedrooms !== undefined && (
            <span>
              <strong>{property.bedrooms}</strong>
              <small>Beds</small>
            </span>
          )}

          {property?.bathrooms !== undefined && (
            <span>
              <strong>{property.bathrooms}</strong>
              <small>Baths</small>
            </span>
          )}

          {property?.area !== undefined && (
            <span>
              <strong>{property.area}</strong>
              <small>sq.ft</small>
            </span>
          )}
        </div>

        <div className="property-card-footer">
          <Link
            to={`/properties/${propertyId}`}
            className="view-property"
          >
            View Property <span>→</span>
          </Link>
        </div>
      </div>
    </article>
  );
};

export default PropertyCard;
