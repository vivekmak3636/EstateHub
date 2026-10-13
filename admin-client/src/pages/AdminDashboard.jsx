import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import adminService from "../services/adminService";
import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  let adminUser = null;

  try {
    adminUser = JSON.parse(localStorage.getItem("adminUser") || "null");
  } catch {
    adminUser = null;
  }

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [dashboardResponse, propertiesResponse] = await Promise.all([
          adminService.getDashboard(),
          adminService.getProperties(),
        ]);

        if (!active) return;

        setDashboard(
          dashboardResponse.dashboard ||
            dashboardResponse.stats ||
            dashboardResponse.data ||
            dashboardResponse
        );

        const propertyList =
          propertiesResponse.properties ||
          propertiesResponse.data?.properties ||
          propertiesResponse.data ||
          [];

        setProperties(Array.isArray(propertyList) ? propertyList.slice(0, 5) : []);
      } catch (err) {
        if (!active) return;

        setError(
          err.response?.data?.message ||
            "Dashboard data could not be loaded from the server."
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const getCount = (keys) => {
    for (const key of keys) {
      const value = dashboard?.[key];
      if (typeof value === "number") return value;
    }
    return 0;
  };

  const totalProperties = getCount([
    "totalProperties",
    "propertiesCount",
    "propertyCount",
    "properties",
  ]);

  const totalUsers = getCount([
    "totalUsers",
    "usersCount",
    "userCount",
    "users",
  ]);

  const pendingProperties = getCount([
    "pendingProperties",
    "pendingApprovals",
    "pendingCount",
  ]);

  const totalEnquiries = getCount([
    "totalEnquiries",
    "enquiriesCount",
    "enquiryCount",
    "enquiries",
  ]);

  const formatPrice = (price) => {
    if (price === undefined || price === null || price === "") return "—";

    const amount = Number(price);

    return Number.isFinite(amount)
      ? `₹${amount.toLocaleString("en-IN")}`
      : price;
  };

  const getPropertyName = (property) =>
    property.title || property.name || "Untitled Property";

  const getPropertyLocation = (property) => {
    if (typeof property.location === "string") return property.location;

    if (property.location && typeof property.location === "object") {
      return [
        property.location.address,
        property.location.city,
        property.location.state,
      ]
        .filter(Boolean)
        .join(", ") || "Location not available";
    }

    return (
      [property.city, property.state].filter(Boolean).join(", ") ||
      "Location not available"
    );
  };

  const getPropertyImage = (property) => {
    if (Array.isArray(property.images) && property.images.length > 0) {
      const firstImage = property.images[0];

      return typeof firstImage === "string"
        ? firstImage
        : firstImage?.url || firstImage?.secure_url || "";
    }

    return typeof property.image === "string" ? property.image : "";
  };

  const getPropertyStatus = (property) =>
    String(property.status || property.approvalStatus || "pending");

  const getStatusClass = (status) => {
    const normalized = status.toLowerCase();

    if (normalized === "approved" || normalized === "active") {
      return "ad-status-approved";
    }

    if (normalized === "rejected") {
      return "ad-status-rejected";
    }

    return "ad-status-pending";
  };

  return (
    <div className="ad-dashboard">
      <main className="ad-content">
        <section className="ad-welcome-banner">
          <div>
            <span className="ad-banner-label">ESTATEHUB OVERVIEW</span>
            <h2>Good to see you, {adminUser?.name || "Admin"}!</h2>
            <p>
              Here's what's happening with your real estate platform today.
            </p>
          </div>

          <div className="ad-banner-decoration" aria-hidden="true">
            ⌂
          </div>
        </section>

        {error && (
          <div className="ad-dashboard-error">
            {error}
            <button type="button" onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        )}

        <section className="ad-stats-grid">
          <article className="ad-stat-card">
            <div className="ad-stat-top">
              <span>Total Properties</span>
              <span className="ad-stat-icon navy">⌂</span>
            </div>
            <strong>
              {loading ? "..." : totalProperties.toLocaleString("en-IN")}
            </strong>
            <p>All listed properties</p>
          </article>

          <article className="ad-stat-card">
            <div className="ad-stat-top">
              <span>Registered Users</span>
              <span className="ad-stat-icon gold">♙</span>
            </div>
            <strong>
              {loading ? "..." : totalUsers.toLocaleString("en-IN")}
            </strong>
            <p>Accounts on the platform</p>
          </article>

          <article className="ad-stat-card">
            <div className="ad-stat-top">
              <span>Pending Approvals</span>
              <span className="ad-stat-icon orange">◷</span>
            </div>
            <strong>
              {loading ? "..." : pendingProperties.toLocaleString("en-IN")}
            </strong>
            <p>Awaiting admin review</p>
          </article>

          <article className="ad-stat-card">
            <div className="ad-stat-top">
              <span>Total Enquiries</span>
              <span className="ad-stat-icon green">✉</span>
            </div>
            <strong>
              {loading ? "..." : totalEnquiries.toLocaleString("en-IN")}
            </strong>
            <p>Property enquiries received</p>
          </article>
        </section>

        <section className="ad-properties-section">
          <div className="ad-section-heading">
            <div>
              <h2>Recent Properties</h2>
              <p>Latest properties submitted on EstateHub</p>
            </div>

            <button
              type="button"
              className="ad-view-all"
              onClick={() => navigate("/properties")}
            >
              View all <span>→</span>
            </button>
          </div>

          <div className="ad-table-wrapper">
            <table className="ad-properties-table">
              <thead>
                <tr>
                  <th>PROPERTY</th>
                  <th>TYPE</th>
                  <th>PRICE</th>
                  <th>STATUS</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4">Loading properties...</td>
                  </tr>
                ) : properties.length === 0 ? (
                  <tr>
                    <td colSpan="4">No properties found.</td>
                  </tr>
                ) : (
                  properties.map((property) => {
                    const status = getPropertyStatus(property);
                    const image = getPropertyImage(property);

                    return (
                      <tr key={property._id || property.id}>
                        <td>
                          <div className="ad-property-cell">
                            {image ? (
                              <img
                                src={image}
                                alt={getPropertyName(property)}
                                onError={(event) => {
                                  event.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="ad-property-image-placeholder">
                                ⌂
                              </div>
                            )}

                            <div>
                              <strong>{getPropertyName(property)}</strong>
                              <span>{getPropertyLocation(property)}</span>
                            </div>
                          </div>
                        </td>

                        <td>
                          {property.type || property.propertyType || "—"}
                        </td>

                        <td className="ad-property-price">
                          {formatPrice(property.price)}
                        </td>

                        <td>
                          <span
                            className={`ad-status ${getStatusClass(status)}`}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="ad-approval-banner">
          <div className="ad-approval-icon">✓</div>

          <div>
            <h3>Property approval center</h3>
            <p>
              Review submitted properties before they become publicly visible.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/properties")}
          >
            Review Properties →
          </button>
        </section>

        <footer className="ad-footer">
          <span>© {new Date().getFullYear()} EstateHub</span>
          <span>Admin Dashboard</span>
        </footer>
      </main>
    </div>
  );
}

export default AdminDashboard;