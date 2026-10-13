import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import propertyService from "../services/propertyService";
import Loader from "../components/Loader";
import { formatPrice } from "../utils/formatters";

import "./MyProperties.css";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1000&q=80";

const MyProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  // LOAD MY PROPERTIES
  const loadProperties = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await propertyService.getMyProperties();

      const data = Array.isArray(response)
        ? response
        : response?.properties || [];

      setProperties(data);
    } catch (err) {
      console.error("My properties error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load your properties."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  // NORMALIZE STATUS
  const getNormalizedStatus = (status) => {
    const normalized = String(status || "pending")
      .trim()
      .toLowerCase();

    if (normalized === "approved") return "approved";
    if (normalized === "rejected") return "rejected";

    return "pending";
  };

  // STATUS CSS CLASS
  const getStatusClass = (status) => {
    const normalized = getNormalizedStatus(status);

    if (normalized === "approved") return "status-approved";
    if (normalized === "rejected") return "status-rejected";

    return "status-pending";
  };

  // STATUS LABEL
  const getStatusText = (status) => {
    const normalized = getNormalizedStatus(status);

    if (normalized === "approved") return "Approved";
    if (normalized === "rejected") return "Rejected";

    return "Pending Approval";
  };

  // PROPERTY IMAGE
  const getImage = (property) => {
    const rawImage =
      property?.images?.[0] || property?.image || "";

    if (typeof rawImage !== "string" || !rawImage.trim()) {
      return FALLBACK_IMAGE;
    }

    let image = rawImage.trim();

    // Support Markdown image/link formats:
    // ![House](https://example.com/house.jpg)
    // [House](https://example.com/house.jpg)
    const markdownMatch = image.match(
      /^!?\[[^\]]*\]\((https?:\/\/[^)\s]+)\)$/i
    );

    if (markdownMatch) {
      image = markdownMatch[1];
    }

    // Avoid invalid image protocols.
    if (!/^https?:\/\//i.test(image)) {
      return FALLBACK_IMAGE;
    }

    return image;
  };

  // PROPERTY LOCATION
  const getLocation = (property) => {
    const location = property?.location;

    if (typeof location === "string") {
      return location.trim() || "Location unavailable";
    }

    return (
      [
        location?.city,
        location?.state,
      ]
        .filter(Boolean)
        .join(", ") ||
      location?.address ||
      "Location unavailable"
    );
  };

  // DELETE PROPERTY
  const handleDelete = async (property) => {
    const propertyId = property?._id;

    if (!propertyId) {
      setError("Unable to identify this property.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${
        property.title || "this property"
      }"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeletingId(propertyId);
      setError("");
      setActionMessage("");

      await propertyService.deleteProperty(propertyId);

      setProperties((currentProperties) =>
        currentProperties.filter(
          (item) => item._id !== propertyId
        )
      );

      setActionMessage("Property deleted successfully.");
    } catch (err) {
      console.error("Delete property error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to delete this property. Please try again."
      );
    } finally {
      setDeletingId("");
    }
  };

  // LOADING
  if (loading) {
    return (
      <main className="my-properties-page">
        <div className="container">
          <Loader />
        </div>
      </main>
    );
  }

  return (
    <main className="my-properties-page">
      <div className="container">
        {/* HEADER */}
        <div className="my-properties-header">
          <div>
            <span className="section-label">ESTATEHUB</span>

            <h1>My Properties</h1>

            <p>
              Manage the properties you have posted on EstateHub.
            </p>
          </div>

          <Link
            to="/post-property"
            className="add-property-button"
          >
            + Post Property
          </Link>
        </div>

        {/* ERROR */}
        {error && (
          <div className="my-properties-error" role="alert">
            <span>{error}</span>

            <button
              type="button"
              onClick={loadProperties}
              className="retry-button"
            >
              Try Again
            </button>
          </div>
        )}

        {/* SUCCESS MESSAGE */}
        {actionMessage && (
          <div className="my-properties-success" role="status">
            {actionMessage}
          </div>
        )}

        {/* PROPERTY SUMMARY */}
        {!error && properties.length > 0 && (
          <div className="my-properties-summary">
            <div>
              <span>Total Properties</span>
              <strong>{properties.length}</strong>
            </div>

            <div>
              <span>Approved</span>
              <strong>
                {
                  properties.filter(
                    (property) =>
                      getNormalizedStatus(property.status) ===
                      "approved"
                  ).length
                }
              </strong>
            </div>

            <div>
              <span>Pending</span>
              <strong>
                {
                  properties.filter(
                    (property) =>
                      getNormalizedStatus(property.status) ===
                      "pending"
                  ).length
                }
              </strong>
            </div>

            <div>
              <span>Rejected</span>
              <strong>
                {
                  properties.filter(
                    (property) =>
                      getNormalizedStatus(property.status) ===
                      "rejected"
                  ).length
                }
              </strong>
            </div>
          </div>
        )}

        {/* EMPTY STATE */}
        {!error && properties.length === 0 && (
          <div className="my-properties-empty">
            <div className="empty-icon">🏠</div>

            <h2>No Properties Yet</h2>

            <p>
              You haven't posted any properties yet.
            </p>

            <Link
              to="/post-property"
              className="add-property-button"
            >
              Post Your First Property
            </Link>
          </div>
        )}

        {/* PROPERTY LIST */}
        {!error && properties.length > 0 && (
          <div className="my-properties-grid">
            {properties.map((property) => {
              const status = getNormalizedStatus(property.status);

              return (
                <article
                  className="my-property-card"
                  key={property._id}
                >
                  {/* IMAGE */}
                  <div className="my-property-image">
                    <img
                      src={getImage(property)}
                      alt={property.title || "Property"}
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = FALLBACK_IMAGE;
                      }}
                    />

                    <span
                      className={`property-status ${getStatusClass(
                        status
                      )}`}
                    >
                      {getStatusText(status)}
                    </span>
                  </div>

                  {/* CONTENT */}
                  <div className="my-property-content">
                    <div className="my-property-price">
                      {formatPrice(property.price)}
                    </div>

                    <h2>
                      {property.title || "Untitled Property"}
                    </h2>

                    <p className="my-property-location">
                      📍 {getLocation(property)}
                    </p>

                    {/* PROPERTY DETAILS */}
                    <div className="my-property-details">
                      <span>
                        <strong>{property.bedrooms ?? 0}</strong>{" "}
                        Beds
                      </span>

                      <span>
                        <strong>{property.bathrooms ?? 0}</strong>{" "}
                        Baths
                      </span>

                      <span>
                        <strong>{property.area ?? 0}</strong>{" "}
                        sq.ft
                      </span>
                    </div>

                    {/* REJECTION REASON */}
                    {status === "rejected" &&
                      property.rejectionReason && (
                        <div className="rejection-message">
                          <strong>Rejection reason:</strong>

                          <span>{property.rejectionReason}</span>
                        </div>
                      )}

                    {/* ACTIONS */}
                    <div className="my-property-actions">
                      {status === "approved" && (
                        <Link
                          to={`/properties/${property._id}`}
                          className="view-button"
                        >
                          View
                        </Link>
                      )}

                      <Link
                        to={`/edit-property/${property._id}`}
                        className="edit-button"
                      >
                        Edit
                      </Link>

                      <button
                        type="button"
                        className="delete-button"
                        onClick={() => handleDelete(property)}
                        disabled={deletingId === property._id}
                      >
                        {deletingId === property._id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
};

export default MyProperties;