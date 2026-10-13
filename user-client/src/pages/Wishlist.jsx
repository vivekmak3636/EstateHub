
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import "./Wishlist.css";

const formatPrice = (price) => {
  if (price === undefined || price === null || price === "") {
    return "Price on request";
  }

  if (
    typeof price === "string" &&
    price.trim() &&
    Number.isNaN(Number(price))
  ) {
    return price;
  }

  const amount = Number(price);

  if (!Number.isFinite(amount)) return "Price on request";

  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }

  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} Lac`;
  }

  return `₹${amount.toLocaleString("en-IN")}`;
};

const formatLocation = (location) => {
  if (!location) return "Location not available";

  if (typeof location === "string") return location;

  return [
    location.address,
    location.city,
    location.state,
  ]
    .filter(Boolean)
    .join(", ") || "Location not available";
};

const getPropertyId = (property) =>
  String(property?._id || property?.id || "");

const getPropertyImage = (property) => {
  const image = property?.images?.[0];

  if (typeof image === "string") return image;

  if (image && typeof image === "object") {
    return image.url || image.secure_url || "";
  }

  return property?.image || property?.imageUrl || "";
};

const Wishlist = () => {
  const { wishlist, loading, toggleWishlist } = useWishlist();

  const [removingId, setRemovingId] = useState("");
  const [notice, setNotice] = useState("");
  const [noticeType, setNoticeType] = useState("success");

  useEffect(() => {
    document.title = "My Wishlist | EstateHub";
  }, []);

  const properties = (wishlist || [])
    .map((item) => item?.property || item)
    .filter(Boolean);

  const handleRemove = async (property) => {
    const id = getPropertyId(property);

    if (!id || removingId) return;

    setRemovingId(id);
    setNotice("");

    try {
      await toggleWishlist(id);
      setNoticeType("success");
      setNotice("Property removed from your wishlist.");
    } catch (error) {
      console.error("Remove wishlist error:", error);
      setNoticeType("error");
      setNotice("Could not remove this property. Please try again.");
    } finally {
      setRemovingId("");
    }
  };

  return (
    <main className="wishlist-page">
      <section className="wishlist-hero">
        <div
          className="wishlist-hero-circle wishlist-hero-circle-one"
          aria-hidden="true"
        />

        <div
          className="wishlist-hero-circle wishlist-hero-circle-two"
          aria-hidden="true"
        />

        <div className="wishlist-hero-inner">
          <span className="wishlist-eyebrow">
            YOUR PERSONAL COLLECTION
          </span>

          <h1 className="wishlist-main-title">
            My <span>Wishlist</span>
          </h1>

          <p className="wishlist-hero-description">
            All the properties you love, together in one place.
          </p>

          <div className="wishlist-count">
            <span className="wishlist-count-heart" aria-hidden="true">
              ♡
            </span>

            <span>
              {properties.length} Saved{" "}
              {properties.length === 1 ? "Property" : "Properties"}
            </span>
          </div>
        </div>

        <div className="wishlist-hero-bottom-line" />
      </section>

      <section className="wishlist-content">
        {notice && (
          <div
            className={`wishlist-notice wishlist-notice-${noticeType}`}
            role="status"
          >
            <span className="wishlist-notice-icon">
              {noticeType === "success" ? "✓" : "!"}
            </span>
            <span>{notice}</span>
          </div>
        )}

        {loading ? (
          <div className="wishlist-state wishlist-empty">
            <div className="wishlist-spinner" />

            <h2>Loading your wishlist...</h2>

            <p>
              Please wait while we fetch your saved properties.
            </p>
          </div>
        ) : properties.length === 0 ? (
          <div className="wishlist-empty">
            <div
              className="wishlist-empty-decoration"
              aria-hidden="true"
            />

            <div className="wishlist-empty-icon">
              <span>♡</span>
            </div>

            <span className="wishlist-empty-eyebrow">
              YOUR COLLECTION STARTS HERE
            </span>

            <h2>Your Wishlist Is Empty</h2>

            <p>
              You haven’t saved any properties yet. Explore our
              listings and save the homes you love.
            </p>

            <Link
              to="/properties"
              className="wishlist-primary-btn"
            >
              <span>Explore Properties</span>
              <span className="wishlist-btn-arrow">→</span>
            </Link>

            <div className="wishlist-empty-footer">
              <span />
              Find a place to call home
              <span />
            </div>
          </div>
        ) : (
          <>
            <div className="wishlist-section-heading">
              <div className="wishlist-heading-copy">
                <span className="wishlist-eyebrow">
                  SAVED FOR LATER
                </span>

                <h2>Your Favorite Properties</h2>

                <p>
                  Your handpicked homes, all in one place.
                </p>
              </div>

              <Link
                to="/properties"
                className="wishlist-browse-link"
              >
                Browse More Properties <span>→</span>
              </Link>
            </div>

            <div className="wishlist-grid">
              {properties.map((property, index) => {
                const id = getPropertyId(property);
                const image = getPropertyImage(property);
                const isRemoving = removingId === id;

                return (
                  <article
                    className={`wishlist-card ${
                      isRemoving ? "wishlist-card-removing" : ""
                    }`}
                    key={id || index}
                    style={{
                      animationDelay: `${Math.min(index * 100, 600)}ms`,
                    }}
                  >
                    <div className="wishlist-image-wrap">
                      {image && (
                        <img
                          src={image}
                          alt={property.title || "Property"}
                          className="wishlist-image"
                          loading="lazy"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                            event.currentTarget.nextElementSibling?.classList.add(
                              "wishlist-fallback-visible"
                            );
                          }}
                        />
                      )}

                      <div
                        className={`wishlist-image-placeholder ${
                          image ? "wishlist-image-fallback" : ""
                        }`}
                      >
                        <span className="wishlist-placeholder-icon">
                          ⌂
                        </span>
                        <p>Property Image</p>
                      </div>

                      <span className="wishlist-saved-label">
                        <span>♥</span> Saved
                      </span>

                      <button
                        type="button"
                        className="wishlist-remove-icon"
                        aria-label="Remove from wishlist"
                        title="Remove from wishlist"
                        disabled={Boolean(removingId) || !id}
                        onClick={() => handleRemove(property)}
                      >
                        {isRemoving ? (
                          <span className="wishlist-remove-loading">
                            …
                          </span>
                        ) : (
                          "×"
                        )}
                      </button>

                      <div className="wishlist-image-shade" />
                    </div>

                    <div className="wishlist-card-body">
                      <div className="wishlist-card-topline">
                        <span className="wishlist-property-type">
                          {property.propertyType ||
                            property.type ||
                            "Property"}
                        </span>

                        {property.purpose && (
                          <span className="wishlist-purpose">
                            {property.purpose}
                          </span>
                        )}
                      </div>

                      <h3>
                        {property.title || "Untitled Property"}
                      </h3>

                      <p className="wishlist-location">
                        <span className="wishlist-location-icon">
                          ⌖
                        </span>
                        <span>
                          {formatLocation(property.location)}
                        </span>
                      </p>

                      <div className="wishlist-card-divider" />

                      <div className="wishlist-price-row">
                        <div>
                          <span className="wishlist-price-label">
                            PROPERTY PRICE
                          </span>

                          <div className="wishlist-price">
                            {formatPrice(property.price)}

                            {property.purpose?.toLowerCase() ===
                              "rent" && (
                              <span className="wishlist-rent-suffix">
                                / month
                              </span>
                            )}
                          </div>
                        </div>

                        <span className="wishlist-price-heart">
                          ♡
                        </span>
                      </div>

                      <div className="wishlist-features">
                        {property.bedrooms != null && (
                          <span>
                            <span className="wishlist-feature-icon">
                              ▦
                            </span>
                            {property.bedrooms} Beds
                          </span>
                        )}

                        {property.bathrooms != null && (
                          <span>
                            <span className="wishlist-feature-icon">
                              ♧
                            </span>
                            {property.bathrooms} Baths
                          </span>
                        )}

                        {(property.area ?? property.areaSqFt) != null && (
                          <span>
                            <span className="wishlist-feature-icon">
                              ↔
                            </span>
                            {property.area ?? property.areaSqFt} Sq.ft
                          </span>
                        )}
                      </div>

                      <div className="wishlist-card-actions">
                        {id ? (
                          <Link
                            to={`/properties/${id}`}
                            className="wishlist-details-btn"
                          >
                            View Details <span>→</span>
                          </Link>
                        ) : (
                          <span className="wishlist-details-btn wishlist-details-disabled">
                            Details Unavailable
                          </span>
                        )}

                        <button
                          type="button"
                          className="wishlist-remove-btn"
                          disabled={Boolean(removingId) || !id}
                          onClick={() => handleRemove(property)}
                        >
                          {isRemoving ? (
                            "Removing..."
                          ) : (
                            <>
                              <span>♡</span> Remove
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>
    </main>
  );
};

export default Wishlist;
