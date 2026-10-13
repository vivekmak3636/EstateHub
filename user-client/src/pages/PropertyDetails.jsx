import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import propertyService from "../services/propertyService";
import Loader from "../components/Loader";
import EnquiryForm from "../components/EnquiryForm";

import "./PropertyDetails.css";

const PropertyDetails = () => {
  const { id } = useParams();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const loadProperty = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await propertyService.getPropertyById(id);

        const data =
          response?.property ||
          response?.data?.property ||
          response?.data ||
          response;

        setProperty(data);
        setActiveImage(0);
      } catch (err) {
        console.error(
          "Property details error:",
          err.response?.data || err.message
        );

        setError(
          err.response?.data?.message ||
            "Unable to load this property."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProperty();
    }
  }, [id]);

  const formatPrice = (price) => {
    if (price === undefined || price === null || price === "") {
      return "Price on request";
    }

    const value = Number(price);

    if (!Number.isFinite(value)) {
      return "Price on request";
    }

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatLocation = (location) => {
    if (typeof location === "string" && location.trim()) {
      return location;
    }

    if (location && typeof location === "object") {
      const parts = [
        location.address,
        location.city,
        location.state,
        location.pincode,
      ].filter(
        (part) =>
          part !== undefined &&
          part !== null &&
          String(part).trim() !== ""
      );

      if (parts.length) {
        return [...new Set(parts.map(String))].join(", ");
      }
    }

    return "Location unavailable";
  };

  const getImages = (item) => {
    const images = Array.isArray(item?.images)
      ? item.images.filter(
          (image) =>
            typeof image === "string" &&
            image.trim() !== ""
        )
      : [];

    if (images.length) {
      return images;
    }

    if (
      typeof item?.image === "string" &&
      item.image.trim()
    ) {
      return [item.image];
    }

    return [];
  };

  const getNumber = (...values) => {
    const value = values.find(
      (item) =>
        item !== undefined &&
        item !== null &&
        item !== ""
    );

    return value ?? null;
  };

  if (loading) {
    return (
      <main className="property-details-page">
        <div className="pdetails-loading">
          <Loader />
        </div>
      </main>
    );
  }

  if (error || !property) {
    return (
      <main className="property-details-page">
        <section className="pdetails-error">
          <div className="pdetails-error-icon">⌂</div>

          <h1>Property Not Available</h1>

          <p>
            {error ||
              "We couldn't find the property you're looking for."}
          </p>

          <Link
            to="/properties"
            className="pdetails-gold-button"
          >
            Browse Properties →
          </Link>
        </section>
      </main>
    );
  }

  const images = getImages(property);
  const bedrooms = getNumber(
    property.bedrooms,
    property.beds
  );
  const bathrooms = getNumber(
    property.bathrooms,
    property.baths
  );
  const area = getNumber(
    property.area,
    property.areaSqFt,
    property.squareFeet
  );

  return (
    <main className="property-details-page">
      {/* HERO */}
      <section className="pdetails-hero">
        <div className="pdetails-hero-overlay">
          <div className="pdetails-container">
            <span className="pdetails-eyebrow">
              ESTATEHUB PROPERTY COLLECTION
            </span>

            <h1>
              Find Your
              <span> Perfect Place</span>
            </h1>

            <p>
              Explore the details, discover the features,
              and take the next step towards your dream property.
            </p>
          </div>
        </div>
      </section>

      <div className="pdetails-container pdetails-main">
        {/* BREADCRUMB */}
        <nav className="pdetails-breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/properties">Properties</Link>
          <span>/</span>
          <span>Details</span>
        </nav>

        {/* TITLE AND PRICE */}
        <section className="pdetails-heading">
          <div>
            <span className="pdetails-type">
              {property.propertyType ||
                property.type ||
                "Property"}
            </span>

            <h2>
              {property.title || "Property Details"}
            </h2>

            <p className="pdetails-location">
              <span>📍</span>
              {formatLocation(property.location)}
            </p>
          </div>

          <div className="pdetails-price-box">
            <small>
              {property.purpose === "rent"
                ? "Rental Price"
                : "Property Price"}
            </small>

            <strong>
              {formatPrice(property.price)}
            </strong>

            {property.purpose === "rent" && (
              <small>Rental terms may apply</small>
            )}
          </div>
        </section>

        {/* IMAGE GALLERY */}
        <section className="pdetails-gallery">
          <div className="pdetails-main-image">
            {images.length > 0 ? (
              <img
                key={images[activeImage]}
                src={images[activeImage]}
                alt={property.title || "Property"}
                onError={(event) => {
                  event.currentTarget.style.visibility =
                    "hidden";
                }}
              />
            ) : (
              <div className="pdetails-no-image">
                <span>⌂</span>
                <p>Property image unavailable</p>
              </div>
            )}

            {property.purpose && (
              <span className="pdetails-purpose">
                {String(property.purpose).toUpperCase()}
              </span>
            )}

            {images.length > 1 && (
              <span className="pdetails-image-count">
                {activeImage + 1} / {images.length}
              </span>
            )}
          </div>

          {images.length > 1 && (
            <div className="pdetails-thumbnails">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  className={
                    activeImage === index
                      ? "pdetails-thumbnail active"
                      : "pdetails-thumbnail"
                  }
                  onClick={() => setActiveImage(index)}
                  aria-label={`View property image ${index + 1}`}
                >
                  <img
                    src={image}
                    alt={`Property view ${index + 1}`}
                  />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* DETAILS AND ENQUIRY */}
        <div className="pdetails-content-grid">
          <div className="pdetails-information">
            <section className="pdetails-card">
              <span className="pdetails-section-label">
                PROPERTY OVERVIEW
              </span>

              <h2>Property Information</h2>

              <div className="pdetails-features">
                <div className="pdetails-feature">
                  <span>⌂</span>
                  <div>
                    <small>Property Type</small>
                    <strong>
                      {property.propertyType ||
                        property.type ||
                        "Not specified"}
                    </strong>
                  </div>
                </div>

                <div className="pdetails-feature">
                  <span>▦</span>
                  <div>
                    <small>Bedrooms</small>
                    <strong>
                      {bedrooms ?? "Not specified"}
                    </strong>
                  </div>
                </div>

                <div className="pdetails-feature">
                  <span>◈</span>
                  <div>
                    <small>Bathrooms</small>
                    <strong>
                      {bathrooms ?? "Not specified"}
                    </strong>
                  </div>
                </div>

                <div className="pdetails-feature">
                  <span>↔</span>
                  <div>
                    <small>Area</small>
                    <strong>
                      {area !== null
                        ? `${area} sq. ft.`
                        : "Not specified"}
                    </strong>
                  </div>
                </div>
              </div>
            </section>

            <section className="pdetails-card">
              <span className="pdetails-section-label">
                ABOUT THIS PROPERTY
              </span>

              <h2>Description</h2>

              <p className="pdetails-description">
                {property.description ||
                  "No additional description is available for this property yet."}
              </p>
            </section>

            <section className="pdetails-card">
              <span className="pdetails-section-label">
                LOCATION
              </span>

              <h2>Property Location</h2>

              <p className="pdetails-location-full">
                📍 {formatLocation(property.location)}
              </p>
            </section>

            <Link
              to="/properties"
              className="pdetails-back-link"
            >
              ← Back to Properties
            </Link>
          </div>

          {/* ENQUIRY SIDEBAR */}
          <aside className="pdetails-sidebar">
            <div className="pdetails-enquiry-card">
              <span className="pdetails-section-label">
                INTERESTED?
              </span>

              <h2>Enquire About This Property</h2>

              <p>
                Send an enquiry to learn more about this listing.
              </p>

              <EnquiryForm propertyId={property._id || property.id} />
            </div>

            <div className="pdetails-help-card">
              <div className="pdetails-help-icon">✉</div>

              <h3>Need Assistance?</h3>

              <p>
                Have questions about this property? Contact
                our team for more information.
              </p>

              <Link
                to="/contact"
                className="pdetails-contact-link"
              >
                Contact Us →
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default PropertyDetails;