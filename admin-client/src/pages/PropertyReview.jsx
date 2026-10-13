import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import adminService from "../services/adminService";
import "./PropertyReview.css";

function PropertyReview() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    let active = true;

    const loadProperty = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await adminService.getProperties();
        const properties =
          response.properties ||
          response.data?.properties ||
          response.data ||
          [];

        const found = Array.isArray(properties)
          ? properties.find((item) => String(item._id) === String(id))
          : null;

        if (!active) return;

        if (!found) {
          setError("Property not found.");
        } else {
          setProperty(found);
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message || "Unable to load property details."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProperty();

    return () => {
      active = false;
    };
  }, [id]);

  const handleApprove = async () => {
    try {
      setProcessing(true);
      setError("");
      await adminService.approveProperty(id);
      navigate("/properties");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to approve property.");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError("Please enter a rejection reason.");
      return;
    }

    try {
      setProcessing(true);
      setError("");
      await adminService.rejectProperty(id, rejectionReason.trim());
      navigate("/properties");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to reject property.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="property-review-page">
        <p className="property-review-message">Loading property...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="property-review-page">
        <button
          type="button"
          className="property-review-back"
          onClick={() => navigate("/properties")}
        >
          Back to Properties
        </button>
        <p className="property-review-error">
          {error || "Property not found."}
        </p>
      </div>
    );
  }

  const images = Array.isArray(property.images)
    ? property.images
        .map((image) =>
          typeof image === "string" ? image : image?.url || image?.secure_url
        )
        .filter(Boolean)
    : [];

  const location =
    typeof property.location === "string"
      ? property.location
      : [
          property.location?.address,
          property.location?.city,
          property.location?.state,
        ]
          .filter(Boolean)
          .join(", ");

  return (
    <div className="property-review-page">
      <div className="property-review-header">
        <div>
          <button
            type="button"
            className="property-review-back"
            onClick={() => navigate("/properties")}
          >
            ← Back to Properties
          </button>
          <h1>Property Review</h1>
          <p>Review the submitted property before making a decision.</p>
        </div>

        <span className="property-review-status">
          {property.status || property.approvalStatus || "Pending"}
        </span>
      </div>

      {error && <div className="property-review-error">{error}</div>}

      <div className="property-review-layout">
        <section className="property-review-card">
          {images.length > 0 ? (
            <img
              className="property-review-image"
              src={images[0]}
              alt={property.title || "Property"}
            />
          ) : (
            <div className="property-review-image-placeholder">
              No property image available
            </div>
          )}

          <div className="property-review-body">
            <h2>{property.title || "Untitled Property"}</h2>
            <p className="property-review-location">
              {location || "Location not available"}
            </p>

            <div className="property-review-price">
              ₹{Number(property.price || 0).toLocaleString("en-IN")}
            </div>

            <div className="property-review-info-grid">
              <div>
                <span>Property Type</span>
                <strong>{property.type || property.propertyType || "—"}</strong>
              </div>
              <div>
                <span>Listing Type</span>
                <strong>{property.listingType || property.purpose || "—"}</strong>
              </div>
              <div>
                <span>Bedrooms</span>
                <strong>{property.bedrooms ?? "—"}</strong>
              </div>
              <div>
                <span>Bathrooms</span>
                <strong>{property.bathrooms ?? "—"}</strong>
              </div>
              <div>
                <span>Area</span>
                <strong>
                  {property.area ? `${property.area} sq. ft.` : "—"}
                </strong>
              </div>
            </div>

            <h3>Description</h3>
            <p className="property-review-description">
              {property.description || "No description provided."}
            </p>

            <h3>Submitted By</h3>
            <p className="property-review-description">
              {property.owner?.name ||
                property.user?.name ||
                property.createdBy?.name ||
                "Owner information unavailable"}
            </p>
          </div>
        </section>

        <aside className="property-review-actions-card">
          <h2>Review Decision</h2>
          <p>Check the property details before approving or rejecting it.</p>

          <button
            type="button"
            className="property-review-approve"
            onClick={handleApprove}
            disabled={processing}
          >
            {processing ? "Processing..." : "Approve Property"}
          </button>

          <div className="property-review-reject-section">
            <label htmlFor="rejectionReason">Rejection Reason</label>
            <textarea
              id="rejectionReason"
              rows="4"
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
              placeholder="Enter reason for rejection..."
            />

            <button
              type="button"
              className="property-review-reject"
              onClick={handleReject}
              disabled={processing}
            >
              {processing ? "Processing..." : "Reject Property"}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default PropertyReview;