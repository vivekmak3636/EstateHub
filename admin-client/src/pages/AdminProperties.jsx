import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import adminService from "../services/adminService";
import "./AdminProperties.css";

const getPropertyTitle = (property) =>
  property.title ||
  property.propertyName ||
  property.name ||
  "Untitled Property";

const getPropertyLocation = (property) => {
  if (typeof property.location === "string") return property.location;

  if (property.location && typeof property.location === "object") {
    return [
      property.location.address,
      property.location.city,
      property.location.state,
    ]
      .filter(Boolean)
      .join(", ");
  }

  return (
    [property.address, property.city, property.state]
      .filter(Boolean)
      .join(", ") || "Location not provided"
  );
};

const getPropertyPrice = (property) => {
  const price = property.price ?? property.expectedPrice;

  if (price === undefined || price === null || price === "") {
    return "Price unavailable";
  }

  const numericPrice = Number(price);

  if (!Number.isFinite(numericPrice)) return String(price);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(numericPrice);
};

const getPropertyImage = (property) => {
  const images = property.images;

  if (Array.isArray(images) && images.length > 0) {
    const first = images[0];

    if (typeof first === "string") return first;
    if (first?.url) return first.url;
    if (first?.secure_url) return first.secure_url;
  }

  if (typeof property.image === "string") return property.image;
  if (property.image?.url) return property.image.url;

  return "";
};

function AdminProperties() {
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [rejectingProperty, setRejectingProperty] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const loadProperties = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await adminService.getProperties();

      if (response?.success === false) {
        throw new Error(response.message || "Unable to load properties.");
      }

      const list =
        response?.properties ||
        response?.data?.properties ||
        (Array.isArray(response?.data) ? response.data : null);

      if (!Array.isArray(list)) {
        throw new Error("Unexpected properties response from server.");
      }

      setProperties(list);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load properties."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  const counts = useMemo(() => {
    const getStatus = (property) =>
      String(property.status || property.approvalStatus || "pending").toLowerCase();

    return {
      all: properties.length,
      pending: properties.filter((p) => getStatus(p) === "pending").length,
      approved: properties.filter((p) => getStatus(p) === "approved").length,
      rejected: properties.filter((p) => getStatus(p) === "rejected").length,
    };
  }, [properties]);

  const filteredProperties = useMemo(() => {
    const term = search.trim().toLowerCase();

    return properties.filter((property) => {
      const status = String(
        property.status || property.approvalStatus || "pending"
      ).toLowerCase();

      const matchesStatus = filter === "all" || status === filter;

      const ownerName =
        typeof property.owner === "object" ? property.owner?.name || "" : "";

      const matchesSearch = [
        getPropertyTitle(property),
        getPropertyLocation(property),
        ownerName,
        property.type,
        property.propertyType,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));

      return matchesStatus && matchesSearch;
    });
  }, [properties, filter, search]);

  const handleApprove = async (property) => {
    const id = property._id || property.id;
    if (!id || busyId) return;

    if (!window.confirm(`Approve "${getPropertyTitle(property)}"?`)) return;

    try {
      setBusyId(String(id));
      setError("");
      setNotice("");

      const response = await adminService.approveProperty(id);

      if (response?.success === false) {
        throw new Error(response.message || "Unable to approve property.");
      }

      setProperties((current) =>
        current.map((item) =>
          String(item._id || item.id) === String(id)
            ? {
                ...item,
                status: "approved",
                approvalStatus: "approved",
                rejectionReason: "",
              }
            : item
        )
      );

      setNotice("Property approved successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Approval failed."
      );
    } finally {
      setBusyId("");
    }
  };

  const handleReject = async (event) => {
    event.preventDefault();

    if (!rejectingProperty || busyId) return;

    const id = rejectingProperty._id || rejectingProperty.id;

    if (!id || !rejectionReason.trim()) {
      setError("Please enter a rejection reason.");
      return;
    }

    try {
      setBusyId(String(id));
      setError("");
      setNotice("");

      const response = await adminService.rejectProperty(
        id,
        rejectionReason.trim()
      );

      if (response?.success === false) {
        throw new Error(response.message || "Unable to reject property.");
      }

      setProperties((current) =>
        current.map((item) =>
          String(item._id || item.id) === String(id)
            ? {
                ...item,
                status: "rejected",
                approvalStatus: "rejected",
                rejectionReason: rejectionReason.trim(),
              }
            : item
        )
      );

      setNotice("Property rejected successfully.");
      setRejectingProperty(null);
      setRejectionReason("");
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Rejection failed."
      );
    } finally {
      setBusyId("");
    }
  };

  const closeRejectDialog = () => {
    if (busyId) return;

    setRejectingProperty(null);
    setRejectionReason("");
  };

  const getStatusClass = (status) => {
    if (status === "approved") return "ap-status-approved";
    if (status === "rejected") return "ap-status-rejected";
    return "ap-status-pending";
  };

  return (
    <div className="ap-page">
      <main className="ap-content">
        <section className="ap-page-heading">
          <div>
            <span className="ap-eyebrow">ESTATEHUB ADMIN</span>
            <h1>Properties Management</h1>
            <p>Review and manage properties submitted to EstateHub.</p>
          </div>

          <button
            type="button"
            className="ap-refresh-button"
            onClick={loadProperties}
            disabled={loading || Boolean(busyId)}
          >
            ↻ {loading ? "Loading..." : "Refresh"}
          </button>
        </section>

        <section className="ap-stats">
          {[
            { key: "all", label: "All Properties", count: counts.all },
            { key: "pending", label: "Pending", count: counts.pending },
            { key: "approved", label: "Approved", count: counts.approved },
            { key: "rejected", label: "Rejected", count: counts.rejected },
          ].map((item) => (
            <button
              type="button"
              key={item.key}
              className={`ap-stat-card ${
                filter === item.key ? "ap-stat-active" : ""
              }`}
              onClick={() => setFilter(item.key)}
            >
              <span>{item.label}</span>
              <strong>{item.count}</strong>
            </button>
          ))}
        </section>

        <section className="ap-list-card">
          <div className="ap-list-heading">
            <div>
              <h2>Property Listings</h2>
              <p>{filteredProperties.length} properties found</p>
            </div>
          </div>

          <div className="ap-toolbar">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search property, location or owner..."
              aria-label="Search properties"
            />

            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              aria-label="Filter by status"
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {error && (
            <div className="ap-alert ap-alert-error" role="alert">
              <span>{error}</span>
              <button type="button" onClick={() => setError("")}>
                ×
              </button>
            </div>
          )}

          {notice && (
            <div className="ap-alert ap-alert-success" role="status">
              <span>{notice}</span>
              <button type="button" onClick={() => setNotice("")}>
                ×
              </button>
            </div>
          )}

          {loading ? (
            <div className="ap-state">
              <span className="ap-spinner" />
              <p>Loading properties...</p>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="ap-state">
              <div className="ap-empty-icon">⌂</div>
              <h3>No properties found</h3>
              <p>Try another search or status filter.</p>
            </div>
          ) : (
            <div className="ap-table-wrapper">
              <table className="ap-table">
                <thead>
                  <tr>
                    <th>PROPERTY</th>
                    <th>OWNER</th>
                    <th>PRICE</th>
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProperties.map((property) => {
                    const id = String(property._id || property.id || "");
                    const status = String(
                      property.status || property.approvalStatus || "pending"
                    ).toLowerCase();

                    const owner =
                      typeof property.owner === "object"
                        ? property.owner
                        : null;

                    const image = getPropertyImage(property);

                    return (
                      <tr key={id}>
                        <td>
                          <div className="ap-property">
                            {image ? (
                              <img
                                src={image}
                                alt={getPropertyTitle(property)}
                                onError={(event) => {
                                  event.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="ap-image-placeholder">⌂</div>
                            )}

                            <div>
                              <strong>{getPropertyTitle(property)}</strong>
                              <span>{getPropertyLocation(property)}</span>
                              {property.propertyType && (
                                <small>{property.propertyType}</small>
                              )}
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="ap-owner">
                            <strong>{owner?.name || "Unknown owner"}</strong>
                            <span>{owner?.email || "No email available"}</span>
                          </div>
                        </td>

                        <td className="ap-price">
                          {getPropertyPrice(property)}
                        </td>

                        <td>
                          <span className={`ap-status ${getStatusClass(status)}`}>
                            {status}
                          </span>
                        </td>

                        <td>
                          <div className="ap-actions">
                            <button
                              type="button"
                              className="ap-review-button"
                              onClick={() =>
                                navigate(`/properties/${id}/review`)
                              }
                            >
                              Review
                            </button>

                            {status !== "approved" && (
                              <button
                                type="button"
                                className="ap-approve-button"
                                disabled={Boolean(busyId)}
                                onClick={() => handleApprove(property)}
                              >
                                {busyId === id ? "Please wait..." : "Approve"}
                              </button>
                            )}

                            {status !== "rejected" && (
                              <button
                                type="button"
                                className="ap-reject-button"
                                disabled={Boolean(busyId)}
                                onClick={() => {
                                  setError("");
                                  setRejectingProperty(property);
                                  setRejectionReason("");
                                }}
                              >
                                Reject
                              </button>
                            )}
                          </div>

                          {property.rejectionReason && (
                            <p className="ap-rejection-reason">
                              Reason: {property.rejectionReason}
                            </p>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {rejectingProperty && (
        <div
          className="ap-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeRejectDialog();
          }}
        >
          <section
            className="ap-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ap-modal-title"
          >
            <button
              type="button"
              className="ap-modal-close"
              onClick={closeRejectDialog}
              disabled={Boolean(busyId)}
              aria-label="Close dialog"
            >
              ×
            </button>

            <span className="ap-modal-label">PROPERTY REVIEW</span>
            <h2 id="ap-modal-title">Reject Property</h2>

            <p className="ap-modal-description">
              Enter a reason so the property owner knows what needs to be fixed.
            </p>

            {error && (
              <div className="ap-alert ap-alert-error" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleReject}>
              <label htmlFor="ap-rejection-reason">Rejection reason</label>

              <textarea
                id="ap-rejection-reason"
                rows={4}
                maxLength={500}
                value={rejectionReason}
                onChange={(event) => setRejectionReason(event.target.value)}
                placeholder="Explain why this property cannot be approved..."
                required
              />

              <span className="ap-character-count">
                {rejectionReason.length}/500 characters
              </span>

              <div className="ap-modal-actions">
                <button
                  type="button"
                  className="ap-cancel-button"
                  onClick={closeRejectDialog}
                  disabled={Boolean(busyId)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="ap-confirm-reject"
                  disabled={Boolean(busyId) || !rejectionReason.trim()}
                >
                  {busyId ? "Rejecting..." : "Confirm Rejection"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default AdminProperties;