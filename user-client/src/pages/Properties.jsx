
import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";

import propertyService from "../services/propertyService";
import { useWishlist } from "../context/WishlistContext";
import SearchBar from "../components/SearchBar";
import Loader from "../components/Loader";

import "./Properties.css";

const normalizePurpose = (value) => {
  const normalized = String(value || "").trim().toLowerCase();

  if (
    ["sale", "buy", "for sale", "sell", "purchase"].includes(normalized)
  ) {
    return "sale";
  }

  if (
    ["rent", "for rent", "rental", "lease", "to rent"].includes(normalized)
  ) {
    return "rent";
  }

  return "";
};

const getPropertyPurpose = (property) => {
  return normalizePurpose(
    property?.purpose || property?.listingType || property?.listingPurpose
  );
};

const Properties = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const { isInWishlist, toggleWishlist } = useWishlist();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [wishlistActionId, setWishlistActionId] = useState("");
  const [wishlistMessage, setWishlistMessage] = useState("");

  const [filters, setFilters] = useState({
    purpose: normalizePurpose(searchParams.get("purpose")),
    type: searchParams.get("type") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    bedrooms: searchParams.get("bedrooms") || "",
  });

  const search = searchParams.get("search") || "";
  const city = searchParams.get("city") || "";

  // Keep filter state synchronized with URL query parameters.
  useEffect(() => {
    setFilters({
      purpose: normalizePurpose(searchParams.get("purpose")),
      type: searchParams.get("type") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      bedrooms: searchParams.get("bedrooms") || "",
    });
  }, [searchParams]);

  const loadProperties = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (search) params.search = search;
      if (city) params.city = city;
      if (filters.type) params.type = filters.type;

      if (filters.purpose) {
        params.purpose = normalizePurpose(filters.purpose);
      }

      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.bedrooms) params.bedrooms = filters.bedrooms;

      const response = await propertyService.getProperties(params);

      const data = Array.isArray(response)
        ? response
        : response?.properties ??
          response?.data?.properties ??
          response?.data ??
          [];

      let results = Array.isArray(data) ? data : [];

      // Apply purpose filtering consistently if the API returns all results.
      if (filters.purpose) {
        results = results.filter(
          (property) => getPropertyPurpose(property) === filters.purpose
        );
      }

      // Apply the remaining filters to the returned results.
      if (filters.type) {
        const selectedType = filters.type.toLowerCase();

        results = results.filter((property) => {
          const propertyType = String(
            property?.propertyType || property?.type || ""
          ).toLowerCase();

          return (
            propertyType === selectedType ||
            propertyType.includes(selectedType)
          );
        });
      }

      if (filters.minPrice !== "") {
        results = results.filter(
          (property) => Number(property?.price) >= Number(filters.minPrice)
        );
      }

      if (filters.maxPrice !== "") {
        results = results.filter(
          (property) => Number(property?.price) <= Number(filters.maxPrice)
        );
      }

      if (filters.bedrooms !== "") {
        results = results.filter(
          (property) =>
            Number(property?.bedrooms) >= Number(filters.bedrooms)
        );
      }

      setProperties(results);
    } catch (err) {
      console.error(
        "Properties loading error:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          "Unable to load properties. Please try again."
      );

      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, [search, city, filters]);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  const handleSearch = (values) => {
    const params = new URLSearchParams();

    const keyword = values?.keyword?.trim();
    const location = (values?.location || values?.city || "").trim();
    const type = (values?.propertyType || values?.type || "").trim();

    if (keyword) params.set("search", keyword);
    if (location) params.set("city", location);
    if (type) params.set("type", type);

    if (filters.purpose) params.set("purpose", filters.purpose);
    if (filters.minPrice) params.set("minPrice", filters.minPrice);
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
    if (filters.bedrooms) params.set("bedrooms", filters.bedrooms);

    setSearchParams(params);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((previous) => ({
      ...previous,
      [name]: name === "purpose" ? normalizePurpose(value) : value,
    }));
  };

  const applyFilters = () => {
    if (
      filters.minPrice !== "" &&
      filters.maxPrice !== "" &&
      Number(filters.minPrice) > Number(filters.maxPrice)
    ) {
      alert("Minimum price maximum price કરતાં વધારે ન હોઈ શકે.");
      return;
    }

    const params = new URLSearchParams(searchParams);

    Object.entries(filters).forEach(([key, value]) => {
      const normalizedValue =
        key === "purpose" ? normalizePurpose(value) : value;

      if (normalizedValue) {
        params.set(key, normalizedValue);
      } else {
        params.delete(key);
      }
    });

    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({
      purpose: "",
      type: "",
      minPrice: "",
      maxPrice: "",
      bedrooms: "",
    });

    setSearchParams({});
  };

  const handleWishlist = async (event, property) => {
    event.preventDefault();
    event.stopPropagation();

    const propertyId = property?._id || property?.id;

    if (!propertyId || wishlistActionId) return;

    const token = localStorage.getItem("userToken");

    if (!token) {
      setWishlistMessage(
        "Please log in to save properties to your wishlist."
      );
      return;
    }

    const alreadySaved = isInWishlist(propertyId);

    setWishlistActionId(String(propertyId));
    setWishlistMessage("");

    try {
      await toggleWishlist(propertyId);

      setWishlistMessage(
        alreadySaved
          ? "Property removed from your wishlist."
          : "Property added to your wishlist."
      );
    } catch (err) {
      console.error(
        "Wishlist update error:",
        err.response?.data || err.message
      );

      setWishlistMessage(
        err.response?.data?.message ||
          "Wishlist update failed. Please try again."
      );
    } finally {
      setWishlistActionId("");
    }
  };

  const formatPrice = (price) => {
    if (price === undefined || price === null || price === "") {
      return "Price on request";
    }

    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice)) {
      return "Price on request";
    }

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(numericPrice);
  };

  const formatLocation = (location) => {
    if (typeof location === "string") {
      return location || "Location unavailable";
    }

    if (location && typeof location === "object") {
      const parts = [location.city, location.state].filter(Boolean);

      return parts.length
        ? [...new Set(parts)].join(", ")
        : location.address || "Location unavailable";
    }

    return "Location unavailable";
  };

  const getImage = (property) => {
    const images = Array.isArray(property?.images) ? property.images : [];

    const firstImage = images.find(
      (image) => typeof image === "string" && image.trim() !== ""
    );

    if (firstImage) return firstImage;

    const objectImage = images.find(
      (image) =>
        image &&
        typeof image === "object" &&
        (image.url || image.secure_url)
    );

    if (objectImage) {
      return objectImage.url || objectImage.secure_url;
    }

    if (typeof property?.image === "string" && property.image.trim()) {
      return property.image;
    }

    return "";
  };

  return (
    <main className="properties-page">
      <section className="properties-hero">
        <div className="properties-hero-overlay">
          <div className="properties-container">
            <motion.span
              className="properties-eyebrow"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              ESTATEHUB PROPERTY COLLECTION
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.1 }}
            >
              Find a Place
              <span> to Call Home</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Explore properties, compare your options, and discover
              a place that fits your lifestyle.
            </motion.p>
          </div>
        </div>
      </section>

      <div className="properties-container properties-main">
        <motion.section
          className="properties-search-panel"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.25 }}
        >
          <div className="properties-section-heading">
            <span className="properties-section-label">
              FIND YOUR PROPERTY
            </span>
            <h2>Start Your Search</h2>
          </div>

          <SearchBar
            onSearch={handleSearch}
            initialValues={{
              keyword: search,
              location: city,
              propertyType: filters.type,
            }}
          />
        </motion.section>

        <motion.section
          className="properties-results-header"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <span className="properties-section-label">
              EXPLORE ESTATEHUB
            </span>

            <h2>Available Properties</h2>

            <p>
              {loading
                ? "Finding properties for you..."
                : `${properties.length} ${
                    properties.length === 1 ? "property" : "properties"
                  } found`}
            </p>
          </div>

          {(search || city) && (
            <button
              type="button"
              className="properties-clear-search"
              onClick={clearFilters}
            >
              Clear Search ✕
            </button>
          )}
        </motion.section>

        {wishlistMessage && (
          <div className="properties-wishlist-message" role="status">
            <span>{wishlistMessage}</span>
            <button
              type="button"
              onClick={() => setWishlistMessage("")}
              aria-label="Dismiss message"
            >
              ×
            </button>
          </div>
        )}

        <div className="properties-layout">
          <motion.aside
            className="properties-filter-panel"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55 }}
          >
            <div className="properties-filter-heading">
              <span className="properties-filter-icon">☷</span>
              <div>
                <h3>Filters</h3>
                <p>Refine your search</p>
              </div>
            </div>

            <div className="properties-filter-field">
              <label htmlFor="purpose">Looking to</label>
              <select
                id="purpose"
                name="purpose"
                value={filters.purpose}
                onChange={handleFilterChange}
              >
                <option value="">Buy or Rent</option>
                <option value="sale">Sale</option>
                <option value="rent">Rent</option>
              </select>
            </div>

            <div className="properties-filter-field">
              <label htmlFor="type">Property Type</label>
              <select
                id="type"
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
              >
                <option value="">All types</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="villa">Villa</option>
                <option value="plot">Plot</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>

            <div className="properties-filter-field">
              <label htmlFor="minPrice">Minimum Price (₹)</label>
              <input
                id="minPrice"
                type="number"
                name="minPrice"
                min="0"
                placeholder="e.g. 1000000"
                value={filters.minPrice}
                onChange={handleFilterChange}
              />
            </div>

            <div className="properties-filter-field">
              <label htmlFor="maxPrice">Maximum Price (₹)</label>
              <input
                id="maxPrice"
                type="number"
                name="maxPrice"
                min="0"
                placeholder="e.g. 5000000"
                value={filters.maxPrice}
                onChange={handleFilterChange}
              />
            </div>

            <div className="properties-filter-field">
              <label htmlFor="bedrooms">Bedrooms</label>
              <select
                id="bedrooms"
                name="bedrooms"
                value={filters.bedrooms}
                onChange={handleFilterChange}
              >
                <option value="">Any</option>
                <option value="1">1+ Bedroom</option>
                <option value="2">2+ Bedrooms</option>
                <option value="3">3+ Bedrooms</option>
                <option value="4">4+ Bedrooms</option>
                <option value="5">5+ Bedrooms</option>
              </select>
            </div>

            <motion.button
              type="button"
              className="properties-apply-button"
              onClick={applyFilters}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              Apply Filters →
            </motion.button>

            <motion.button
              type="button"
              className="properties-reset-button"
              onClick={clearFilters}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              Reset All
            </motion.button>
          </motion.aside>

          <section className="properties-results">
            {loading ? (
              <div className="properties-loader">
                <Loader />
              </div>
            ) : error ? (
              <motion.div
                className="properties-message properties-error"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <span>!</span>
                <h3>Something went wrong</h3>
                <p>{error}</p>
                <button
                  type="button"
                  className="properties-apply-button"
                  onClick={loadProperties}
                >
                  Try Again
                </button>
              </motion.div>
            ) : properties.length === 0 ? (
              <motion.div
                className="properties-message"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="properties-empty-icon">⌂</div>
                <h3>No Properties Found</h3>
                <p>Try changing your search or removing some filters.</p>
                <button
                  type="button"
                  className="properties-apply-button"
                  onClick={clearFilters}
                >
                  Clear All Filters
                </button>
              </motion.div>
            ) : (
              <div className="properties-grid">
                {properties.map((property, index) => {
                  const propertyId = property?._id || property?.id;

                  if (!propertyId) return null;

                  const image = getImage(property);
                  const propertyPath = `/properties/${propertyId}`;
                  const favorite = isInWishlist(propertyId);
                  const busy = wishlistActionId === String(propertyId);
                  const purpose = getPropertyPurpose(property);

                  return (
                    <motion.article
                      key={propertyId}
                      className="properties-card"
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.45,
                        delay: Math.min(index * 0.07, 0.35),
                        ease: "easeOut",
                      }}
                      whileHover={{ y: -5 }}
                    >
                      <div className="properties-card-media">
                        <Link
                          to={propertyPath}
                          className="properties-card-image"
                        >
                          {image ? (
                            <motion.img
                              src={image}
                              alt={property.title || "Property"}
                              loading="lazy"
                              whileHover={{ scale: 1.04 }}
                              transition={{ duration: 0.35 }}
                              onError={(event) => {
                                event.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="properties-image-placeholder">
                              <span>⌂</span>
                              <p>Property Image</p>
                            </div>
                          )}

                          {purpose && (
                            <span className="properties-purpose-badge">
                              {purpose === "sale" ? "SALE" : "RENT"}
                            </span>
                          )}
                        </Link>

                        <button
                          type="button"
                          className={`properties-wishlist-button ${
                            favorite ? "is-favorite" : ""
                          }`}
                          onClick={(event) =>
                            handleWishlist(event, property)
                          }
                          disabled={busy}
                          aria-label={
                            favorite
                              ? "Remove property from wishlist"
                              : "Add property to wishlist"
                          }
                          aria-pressed={favorite}
                          title={
                            favorite
                              ? "Remove from Wishlist"
                              : "Add to Wishlist"
                          }
                        >
                          {busy ? "…" : favorite ? "♥" : "♡"}
                        </button>
                      </div>

                      <div className="properties-card-content">
                        <span className="properties-card-type">
                          {property.propertyType ||
                            property.type ||
                            "Property"}
                        </span>

                        <h3>
                          <Link to={propertyPath}>
                            {property.title || "Untitled Property"}
                          </Link>
                        </h3>

                        <p className="properties-card-location">
                          <span>📍</span>
                          {formatLocation(property.location)}
                        </p>

                        <div className="properties-card-features">
                          {property.bedrooms != null && (
                            <span>▦ {property.bedrooms} Beds</span>
                          )}

                          {property.bathrooms != null && (
                            <span>◈ {property.bathrooms} Baths</span>
                          )}

                          {(property.area != null ||
                            property.areaSqFt != null) && (
                            <span>
                              ↔ {property.area ?? property.areaSqFt} sq.ft.
                            </span>
                          )}
                        </div>

                        <div className="properties-card-footer">
                          <div>
                            <small>Price</small>
                            <strong>{formatPrice(property.price)}</strong>
                          </div>

                          <Link
                            to={propertyPath}
                            className="properties-view-button"
                          >
                            View Details →
                          </Link>
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
};

export default Properties;
