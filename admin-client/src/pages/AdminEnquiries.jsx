import { useCallback, useEffect, useMemo, useState } from "react";
import adminService from "../services/adminService";
import "./AdminEnquiries.css";

function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchEnquiries = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await adminService.getEnquiries();

      if (response?.success === false) {
        throw new Error(response.message || "Failed to load enquiries.");
      }

      const list =
        response?.enquiries ||
        response?.data?.enquiries ||
        (Array.isArray(response?.data) ? response.data : []);

      setEnquiries(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load enquiries."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  const handleStatusChange = async (id, status) => {
    if (!id || updatingId) return;

    const previous = enquiries.find(
      (enquiry) => String(enquiry._id) === String(id)
    );

    if (!previous || previous.status === status) return;

    try {
      setUpdatingId(String(id));
      setError("");
      setNotice("");

      const response = await adminService.updateEnquiryStatus(id, status);

      if (response?.success === false) {
        throw new Error(response.message || "Failed to update enquiry status.");
      }

      setEnquiries((current) =>
        current.map((enquiry) =>
          String(enquiry._id) === String(id)
            ? { ...enquiry, status }
            : enquiry
        )
      );

      setNotice("Enquiry status updated successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update enquiry status."
      );
    } finally {
      setUpdatingId("");
    }
  };

  const filteredEnquiries = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return enquiries.filter((enquiry) => {
      const matchesSearch = [
        enquiry.name,
        enquiry.email,
        enquiry.phone,
        enquiry.property?.title,
        enquiry.message,
        enquiry.user?.name,
        enquiry.user?.email,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(searchText));

      const matchesStatus =
        statusFilter === "all" || enquiry.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [enquiries, search, statusFilter]);

  const counts = useMemo(
    () => ({
      total: enquiries.length,
      pending: enquiries.filter((item) => item.status === "pending").length,
      contacted: enquiries.filter((item) => item.status === "contacted").length,
      closed: enquiries.filter((item) => item.status === "closed").length,
    }),
    [enquiries]
  );

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "—";

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatPrice = (price) => {
    if (price === undefined || price === null || price === "") return "";

    const amount = Number(price);

    return Number.isFinite(amount)
      ? `₹${amount.toLocaleString("en-IN")}`
      : String(price);
  };

  const getStatusClass = (status) => {
    if (status === "contacted") return "enquiry-status-contacted";
    if (status === "closed") return "enquiry-status-closed";
    return "enquiry-status-pending";
  };

  return (
    <div className="admin-enquiries-page">
      <main className="enquiries-content">
        <section className="enquiries-page-heading">
          <div>
            <span className="enquiries-eyebrow">ESTATEHUB ADMIN</span>
            <h1>Enquiries Management</h1>
            <p>Manage property enquiries and follow up with interested users.</p>
          </div>

          <button
            type="button"
            className="enquiries-refresh-btn"
            onClick={fetchEnquiries}
            disabled={loading || Boolean(updatingId)}
          >
            ↻ {loading ? "Loading..." : "Refresh"}
          </button>
        </section>

        {error && (
          <div className="enquiries-alert enquiries-alert-error" role="alert">
            <span>{error}</span>
            <button type="button" onClick={() => setError("")} aria-label="Dismiss error">
              ×
            </button>
          </div>
        )}

        {notice && (
          <div className="enquiries-alert enquiries-alert-success" role="status">
            <span>{notice}</span>
            <button type="button" onClick={() => setNotice("")} aria-label="Dismiss message">
              ×
            </button>
          </div>
        )}

        <section className="enquiries-stats">
          <button
            type="button"
            className={`enquiry-stat-card ${statusFilter === "all" ? "enquiry-stat-active" : ""}`}
            onClick={() => setStatusFilter("all")}
          >
            <span className="enquiry-stat-icon enquiry-icon-navy">✉</span>
            <span className="enquiry-stat-label">Total Enquiries</span>
            <strong>{counts.total}</strong>
            <small>All received enquiries</small>
          </button>

          <button
            type="button"
            className={`enquiry-stat-card ${statusFilter === "pending" ? "enquiry-stat-active" : ""}`}
            onClick={() => setStatusFilter("pending")}
          >
            <span className="enquiry-stat-icon enquiry-icon-gold">◷</span>
            <span className="enquiry-stat-label">Pending</span>
            <strong>{counts.pending}</strong>
            <small>Awaiting follow-up</small>
          </button>

          <button
            type="button"
            className={`enquiry-stat-card ${statusFilter === "contacted" ? "enquiry-stat-active" : ""}`}
            onClick={() => setStatusFilter("contacted")}
          >
            <span className="enquiry-stat-icon enquiry-icon-blue">↗</span>
            <span className="enquiry-stat-label">Contacted</span>
            <strong>{counts.contacted}</strong>
            <small>Follow-up initiated</small>
          </button>

          <button
            type="button"
            className={`enquiry-stat-card ${statusFilter === "closed" ? "enquiry-stat-active" : ""}`}
            onClick={() => setStatusFilter("closed")}
          >
            <span className="enquiry-stat-icon enquiry-icon-green">✓</span>
            <span className="enquiry-stat-label">Closed</span>
            <strong>{counts.closed}</strong>
            <small>Completed enquiries</small>
          </button>
        </section>

        <section className="enquiries-list-card">
          <div className="enquiries-list-heading">
            <div>
              <h2>All Enquiries</h2>
              <p>
                Showing {filteredEnquiries.length} of {enquiries.length} enquiries
              </p>
            </div>
          </div>

          <div className="enquiries-filters">
            <div className="enquiries-search">
              <span>⌕</span>
              <input
                type="search"
                placeholder="Search name, email, phone or property..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search enquiries"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter enquiries by status"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="contacted">Contacted</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {loading ? (
            <div className="enquiries-state">
              <span className="enquiries-spinner" />
              <p>Loading enquiries...</p>
            </div>
          ) : filteredEnquiries.length === 0 ? (
            <div className="enquiries-state">
              <span className="enquiries-empty-icon">✉</span>
              <h3>No enquiries found</h3>
              <p>Try changing your search or status filter.</p>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                }}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="enquiries-table-wrapper">
              <table className="enquiries-table">
                <thead>
                  <tr>
                    <th>USER</th>
                    <th>PROPERTY</th>
                    <th>MESSAGE</th>
                    <th>DATE</th>
                    <th>STATUS</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredEnquiries.map((enquiry) => {
                    const id = String(enquiry._id);
                    const status = enquiry.status || "pending";

                    return (
                      <tr key={id}>
                        <td>
                          <div className="enquiry-user-cell">
                            <div className="enquiry-user-avatar">
                              {String(
                                enquiry.name || enquiry.user?.name || "U"
                              )
                                .trim()
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div className="enquiry-user-info">
                              <strong>
                                {enquiry.name || enquiry.user?.name || "Unknown"}
                              </strong>
                              <span>
                                {enquiry.email || enquiry.user?.email || "—"}
                              </span>
                              <small>
                                {enquiry.phone || enquiry.user?.phone || "—"}
                              </small>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="enquiry-property-info">
                            <strong>
                              {enquiry.property?.title || "Property unavailable"}
                            </strong>
                            {enquiry.property?.price != null && (
                              <span>{formatPrice(enquiry.property.price)}</span>
                            )}
                          </div>
                        </td>

                        <td>
                          <div className="enquiry-message">
                            {enquiry.message || "No message provided"}
                          </div>
                        </td>

                        <td className="enquiry-date">
                          {formatDate(enquiry.createdAt)}
                        </td>

                        <td>
                          <div className="enquiry-status-cell">
                            <span className={`enquiry-status-badge ${getStatusClass(status)}`}>
                              {status}
                            </span>

                            <select
                              className="enquiry-status-select"
                              value={status}
                              disabled={Boolean(updatingId)}
                              onChange={(event) =>
                                handleStatusChange(id, event.target.value)
                              }
                              aria-label={`Update enquiry status for ${enquiry.name || "user"}`}
                            >
                              <option value="pending">Pending</option>
                              <option value="contacted">Contacted</option>
                              <option value="closed">Closed</option>
                            </select>

                            {updatingId === id && (
                              <small className="enquiry-updating">Updating...</small>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer className="enquiries-footer">
          <span>© {new Date().getFullYear()} EstateHub</span>
          <span>Admin Portal · Enquiries</span>
        </footer>
      </main>
    </div>
  );
}

export default AdminEnquiries;