
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import propertyService from "../services/propertyService";
import "./Home.css";

// Reusable animation settings
const pageVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const fadeUpVariants = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

// Format property price
const formatPrice = (price, purpose) => {
  if (price === undefined || price === null || price === "") {
    return "Price on request";
  }

  const amount = Number(price);

  if (!Number.isFinite(amount)) {
    return String(price);
  }

  let formatted;

  if (amount >= 10000000) {
    formatted = `₹${(amount / 10000000).toFixed(2)} Cr`;
  } else if (amount >= 100000) {
    formatted = `₹${(amount / 100000).toFixed(2)} Lac`;
  } else {
    formatted = `₹${amount.toLocaleString("en-IN")}`;
  }

  return String(purpose).toLowerCase() === "rent"
    ? `${formatted}/month`
    : formatted;
};

// Get property image
const getPropertyImage = (property) => {
  const firstImage = property?.images?.[0];

  if (typeof firstImage === "string") {
    return firstImage;
  }

  if (firstImage && typeof firstImage === "object") {
    return firstImage.url || firstImage.secure_url || "";
  }

  return property?.image || property?.imageUrl || "";
};

// Format property location
const getLocation = (location) => {
  if (!location) {
    return "Location unavailable";
  }

  if (typeof location === "string") {
    return location;
  }

  return (
    [location.address, location.city, location.state]
      .filter(Boolean)
      .join(", ") || "Location unavailable"
  );
};

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Detect user role
  const role = String(
    user?.role || user?.userRole || user?.user?.role || ""
  ).toLowerCase();

  // Only owners and agents can upload properties
  const canPostProperty =
    Boolean(user) && ["owner", "agent"].includes(role);

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [propertyError, setPropertyError] = useState(false);

  const [searchData, setSearchData] = useState({
    keyword: "",
    type: "",
    purpose: "Buy",
  });

  // Load featured properties
  useEffect(() => {
    document.title = "EstateHub | Find Your Dream Home";

    let active = true;

    const loadFeaturedProperties = async () => {
      try {
        setLoading(true);
        setPropertyError(false);

        const response = await propertyService.getProperties({
          page: 1,
          limit: 6,
        });

        const data = response?.data ?? response;

        const list = Array.isArray(data)
          ? data
          : data?.properties || data?.data?.properties || [];

        if (active) {
          setProperties(list.slice(0, 6));
          console.log(list);
          
        }
      } catch (error) {
        console.error("Featured properties loading error:", error);

        if (active) {
          setPropertyError(true);
          setProperties([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadFeaturedProperties();

    return () => {
      active = false;
    };
  }, []);

  // Handle search inputs
  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setSearchData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Navigate to filtered properties
  const handleSearch = (event) => {
    event.preventDefault();

    const params = new URLSearchParams();
    const keyword = searchData.keyword.trim();

    if (keyword) {
      params.set("search", keyword);
    }

    if (searchData.type) {
      params.set("type", searchData.type);
    }

    if (searchData.purpose) {
      params.set("purpose", searchData.purpose.toLowerCase());
    }

    navigate(`/properties?${params.toString()}`);
  };

  return (
    <main className="home-page">
      {/* HERO */}
      <section className="home-hero">
        <div className="home-hero-overlay" />

        <div className="home-hero-inner">
          <motion.div
            className="home-hero-content"
            variants={pageVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.span
              className="home-eyebrow"
              variants={fadeUpVariants}
            >
              FIND A PLACE TO CALL HOME
            </motion.span>

            <motion.h1 variants={fadeUpVariants}>
              Your Dream Home.
              <br />
              <span>Your Next Chapter.</span>
            </motion.h1>

            <motion.p variants={fadeUpVariants}>
              Discover beautiful homes, modern apartments and investment
              opportunities with EstateHub.
            </motion.p>

            {/* ROLE-BASED HERO BUTTONS */}
            <motion.div
              className="home-hero-buttons"
              variants={fadeUpVariants}
            >
              {canPostProperty ? (
                <Link
                  to="/post-property"
                  className="home-btn home-btn-gold"
                >
                  + Upload Property <span>→</span>
                </Link>
              ) : (
                <Link
                  to="/properties"
                  className="home-btn home-btn-gold"
                >
                  Explore Properties <span>→</span>
                </Link>
              )}

              <Link
                to="/about"
                className="home-btn home-btn-outline"
              >
                About EstateHub
              </Link>
            </motion.div>

            <motion.div
              className="home-trust-row"
              variants={fadeUpVariants}
            >
              <div>
                <span className="home-trust-icon">⌂</span>
                <span>Find Your Home</span>
              </div>

              <div>
                <span className="home-trust-icon">◇</span>
                <span>Explore Opportunities</span>
              </div>

              <div>
                <span className="home-trust-icon">✓</span>
                <span>Easy Enquiries</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* PROPERTY SEARCH */}
        <div className="home-search-wrap">
          <motion.form
            className="home-search-box"
            onSubmit={handleSearch}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.65,
              delay: 0.3,
              ease: "easeOut",
            }}
          >
            <div className="home-search-heading">
              <h2>Find Your Perfect Property</h2>
              <p>Search listings to match your lifestyle.</p>
            </div>

            <div className="home-search-fields">
              <div className="home-search-field home-purpose-field">
                <label htmlFor="home-purpose">Looking to</label>

                <select
                  id="home-purpose"
                  name="purpose"
                  value={searchData.purpose}
                  onChange={handleInputChange}
                >
                  <option value="Buy">Buy</option>
                  <option value="Rent">Rent</option>
                </select>
              </div>

              <div className="home-search-field">
                <label htmlFor="home-keyword">
                  Location or keyword
                </label>

                <input
                  id="home-keyword"
                  name="keyword"
                  value={searchData.keyword}
                  onChange={handleInputChange}
                  placeholder="City, area or property name"
                />
              </div>

              <div className="home-search-field">
                <label htmlFor="home-type">Property type</label>

                <select
                  id="home-type"
                  name="type"
                  value={searchData.type}
                  onChange={handleInputChange}
                >
                  <option value="">All Types</option>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="villa">Villa</option>
                  <option value="plot">Plot</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>

              <button type="submit" className="home-search-button">
                <span>⌕</span> Search
              </button>
            </div>
          </motion.form>
        </div>
      </section>

      {/* FEATURED PROPERTIES */}
      <section className="home-featured section-container">
        <motion.div
          className="home-section-heading"
          variants={fadeUpVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div>
            <span className="home-section-label">
              HANDPICKED FOR YOU
            </span>

            <h2>Featured Properties</h2>

            <p>
              Explore properties that could be your next perfect place.
            </p>
          </div>

          <Link to="/properties" className="home-view-all">
            View All Properties <span>→</span>
          </Link>
        </motion.div>

        {loading ? (
          <div className="home-message">
            <div className="home-spinner" />
            <p>Finding properties for you...</p>
          </div>
        ) : propertyError ? (
          <div className="home-message">
            <h3>Properties could not be loaded</h3>
            <p>Please check your connection and try again.</p>

            <button
              type="button"
              className="home-retry-button"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        ) : properties.length === 0 ? (
          <div className="home-message">
            <h3>New properties are coming soon!</h3>
            <p>
              Explore our listings to discover available properties.
            </p>

            <Link to="/properties" className="home-btn home-btn-dark">
              Browse Properties
            </Link>
          </div>
        ) : (
          <div className="home-property-grid">
            {properties.map((property, index) => {
              const id = property._id || property.id;
              const image = getPropertyImage(property);
              const propertyPath = id
                ? `/properties/${id}`
                : "/properties";

              return (
                <motion.article
                  className="home-property-card"
                  key={id || index}
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ delay: index * 0.07 }}
                  whileHover={{ y: -5 }}
                >
                  <Link
                    to={propertyPath}
                    className="home-property-image-wrap"
                  >
                    {image ? (
                      <img
                        className="home-property-image"
                        src={image}
                        alt={property.title || "Property"}
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";

                          event.currentTarget.parentElement.classList.add(
                            "home-image-error"
                          );
                        }}
                      />
                    ) : (
                      <div className="home-property-placeholder">
                        <span>⌂</span>
                        <p>Property image unavailable</p>
                      </div>
                    )}

                    <span className="home-property-badge">
                      {property.purpose || "Property"}
                    </span>
                  </Link>

                  <div className="home-property-body">
                    <span className="home-property-type">
                      {property.propertyType ||
                        property.type ||
                        "Real Estate"}
                    </span>

                    <h3>
                      <Link to={propertyPath}>
                        {property.title || "Beautiful Property"}
                      </Link>
                    </h3>

                    <p className="home-property-location">
                      <span>⌖</span> {getLocation(property.location)}
                    </p>

                    <div className="home-property-features">
                      {property.bedrooms != null && (
                        <span>🛏 {property.bedrooms} Beds</span>
                      )}

                      {property.bathrooms != null && (
                        <span>♧ {property.bathrooms} Baths</span>
                      )}

                      {(property.area || property.areaSqFt) != null && (
                        <span>
                          ▧ {property.area || property.areaSqFt} Sq.ft
                        </span>
                      )}
                    </div>

                    <div className="home-property-footer">
                      <strong>
                        {formatPrice(property.price, property.purpose)}
                      </strong>

                      <Link
                        to={propertyPath}
                        className="home-property-details"
                      >
                        Details →
                      </Link>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </section>

      {/* PROPERTY PURPOSE */}
<section className="home-purpose-section">
  <div className="section-container">
    <motion.div
      className="home-centered-heading"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6 }}
    >
      <span className="home-section-label">
        YOUR PROPERTY JOURNEY
      </span>

      <h2>What Are You Looking For?</h2>
      <p>Choose the option that works best for you.</p>
    </motion.div>

    <div className="home-purpose-grid">
      <motion.div
        className="home-purpose-card home-buy-card"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.4 }}
        onClick={() => navigate("/properties?purpose=buy")}
        style={{ cursor: "pointer" }}
      >
        <div className="home-purpose-icon">⌂</div>
        <span>FIND YOUR PLACE</span>
        <h3>Buy a Property</h3>
        <p>
          Discover a home where your next chapter begins.
        </p>
        <strong>Explore Homes →</strong>
      </motion.div>

      <motion.div
        className="home-purpose-card home-rent-card"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        onClick={() => navigate("/properties?purpose=rent")}
        style={{ cursor: "pointer" }}
      >
        <div className="home-purpose-icon">◇</div>
        <span>FLEXIBLE LIVING</span>
        <h3>Rent a Property</h3>
        <p>
          Find a comfortable space that fits your lifestyle.
        </p>
        <strong>Explore Rentals →</strong>
      </motion.div>
    </div>
  </div>
</section>
      {/* WHY ESTATEHUB */}
      <section className="home-why-section section-container">
        <motion.div
          className="home-why-image"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
        >
          <img
            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=85"
            alt="Modern home with a beautiful interior"
            loading="lazy"
          />

          <div className="home-image-caption">
            <span>YOUR DREAM HOME</span>
            <strong>Start your search today.</strong>
          </div>
        </motion.div>

        <motion.div
          className="home-why-content"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
        >
          <span className="home-section-label">WHY ESTATEHUB</span>

          <h2>A Better Way to Find Your Next Property</h2>

          <p>
            Your property journey should feel simple and exciting.
            EstateHub helps you explore listings and connect with the
            right opportunities.
          </p>

          <div className="home-benefit-list">
            <div className="home-benefit">
              <span className="home-benefit-icon">✓</span>

              <div>
                <h3>Explore Multiple Options</h3>
                <p>
                  Browse properties that match your needs and preferences.
                </p>
              </div>
            </div>

            <div className="home-benefit">
              <span className="home-benefit-icon">⌕</span>

              <div>
                <h3>Search Made Simple</h3>
                <p>
                  Find listings using keywords and property categories.
                </p>
              </div>
            </div>

            <div className="home-benefit">
              <span className="home-benefit-icon">♡</span>

              <div>
                <h3>Save Your Favorites</h3>
                <p>
                  Keep your preferred properties together in your wishlist.
                </p>
              </div>
            </div>
          </div>

          <Link to="/about" className="home-btn home-btn-dark">
            Discover EstateHub <span>→</span>
          </Link>
        </motion.div>
      </section>

      {/* ROLE-BASED PROPERTY CTA */}
      <motion.section
        className="home-owner-section"
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="home-owner-inner">
          <div>
            <span className="home-section-label">
              {canPostProperty
                ? "FOR PROPERTY OWNERS"
                : "EXPLORE ESTATEHUB"}
            </span>

            <h2>
              {canPostProperty
                ? "Ready to List Your Property?"
                : "Find Your Perfect Property."}
            </h2>

            <p>
              {canPostProperty
                ? "Share your property with people searching for their next home."
                : "Explore available homes, apartments and properties that match your needs."}
            </p>
          </div>

          {canPostProperty ? (
            <Link
              to="/post-property"
              className="home-owner-button"
            >
              + Upload Property <span>→</span>
            </Link>
          ) : (
            <Link
              to="/properties"
              className="home-owner-button"
            >
              Explore Properties <span>→</span>
            </Link>
          )}
        </div>
      </motion.section>
    </main>
  );
};

export default Home;
