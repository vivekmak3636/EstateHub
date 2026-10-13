
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import enquiryService from "../services/enquiryService";
import Loader from "../components/Loader";

import "./MyEnquiry.css";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=900&q=80";

const MyEnquiry = () => {
  const { user, loading: authLoading } = useAuth();

  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Support common API response formats.
  const getEnquiryArray = (response) => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.enquiries)) return response.enquiries;
    if (Array.isArray(response?.data?.enquiries)) {
      return response.data.enquiries;
    }
    if (Array.isArray(response?.data)) return response.data;

    return [];
  };

  // Load enquiries sent by the logged-in user.
  const loadEnquiries = useCallback(async () => {
    if (!user) {
      setEnquiries([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await enquiryService.getMyEnquiries();

      // Debug logs: check these in browser DevTools Console.
      console.log("My Enquiries API Response:", response);

      const enquiryList = getEnquiryArray(response);

      console.log("Enquiry List:", enquiryList);

      setEnquiries(enquiryList);
    } catch (err) {
      console.error("My enquiries error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load your enquiries. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    loadEnquiries();
  }, [authLoading, loadEnquiries]);

  const getProperty = (enquiry) => {
    if (
      enquiry?.property &&
      typeof enquiry.property === "object"
    ) {
      return enquiry.property;
    }

    return {};
  };

  const getImage = (property) => {
    const firstImage =
      property?.images?.[0] || property?.image;

    if (typeof firstImage !== "string" || !firstImage.trim()) {
      return FALLBACK_IMAGE;
    }

    const value = firstImage.trim();

    // Also support image URLs stored as Markdown links.
    const markdownMatch = value.match(
      /^\[.*?\]\((https?:\/\/[^)]+)\)$/
    );

    const imageUrl = markdownMatch ? markdownMatch[1] : value;

    if (/^https?:\/\//i.test(imageUrl)) {
      return imageUrl;
    }

    return FALLBACK_IMAGE;
  };

  const getLocation = (property) => {
    const location = property?.location;

    if (typeof location === "string" && location.trim()) {
      return location;
    }

    if (location && typeof location === "object") {
      const parts = [location.city, location.state].filter(Boolean);

      if (parts.length) return parts.join(", ");
      if (location.address) return location.address;
    }

    return "Location unavailable";
  };

  const formatPrice = (price) => {
    if (
      price === undefined ||
      price === null ||
      price === "" ||
      !Number.isFinite(Number(price))
    ) {
      return "Price unavailable";
    }

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(price));
  };

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatus = (enquiry) =>
    String(enquiry?.status || enquiry?.enquiryStatus || "pending")
      .toLowerCase();

  const getStatusLabel = (status) => {
    const labels = {
      pending: "Pending",
      new: "New",
      contacted: "Contacted",
      in_progress: "In Progress",
      "in-progress": "In Progress",
      replied: "Replied",
      resolved: "Resolved",
      closed: "Closed",
      approved: "Approved",
      rejected: "Rejected",
    };

    return (
      labels[status] ||
      status.replace(/[_-]/g, " ").replace(/\b\w/g, (char) =>
        char.toUpperCase()
      )
    );
  };

  if (authLoading || loading) {
    return (
      <main className="my-enquiry-page">
        <div className="my-enquiry-container">
          <Loader />
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="my-enquiry-page">
        <div className="my-enquiry-container">
          <div className="my-enquiry-empty">
            <div className="my-enquiry-empty-icon">✉</div>
            <h2>Please log in</h2>
            <p>Log in to view your property enquiries.</p>

            <Link to="/login" className="my-enquiry-primary-button">
              Go to Login
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="my-enquiry-page">
      <div className="my-enquiry-container">
        <header className="my-enquiry-header">
          <div>
            <span className="my-enquiry-eyebrow">
              ESTATEHUB ACCOUNT
            </span>

            <h1>My Enquiries</h1>

            <p>Track the property enquiries you have submitted.</p>
          </div>

          <Link
            to="/properties"
            className="my-enquiry-primary-button"
          >
            Browse Properties →
          </Link>
        </header>

        <section className="my-enquiry-summary">
          <div className="my-enquiry-summary-icon">✉</div>

          <div>
            <span>Total Enquiries</span>
            <strong>{enquiries.length}</strong>
          </div>
        </section>

        {error && (
          <div className="my-enquiry-error" role="alert">
            <p>{error}</p>

            <button
              type="button"
              onClick={loadEnquiries}
              disabled={loading}
            >
              Try Again
            </button>
          </div>
        )}

        {!error && enquiries.length === 0 && (
          <div className="my-enquiry-empty">
            <div className="my-enquiry-empty-icon">🏡</div>

            <h2>No Enquiries Yet</h2>

            <p>
              You have not sent any property enquiries yet.
              Explore properties and contact an owner when you
              find something you like.
            </p>

            <Link
              to="/properties"
              className="my-enquiry-primary-button"
            >
              Explore Properties
            </Link>
          </div>
        )}

        {!error && enquiries.length > 0 && (
          <section className="my-enquiry-list">
            {enquiries.map((enquiry, index) => {
              const property = getProperty(enquiry);
              const status = getStatus(enquiry);

              const propertyId =
                typeof enquiry?.property === "string"
                  ? enquiry.property
                  : property?._id || property?.id;

              const enquiryId =
                enquiry?._id || enquiry?.id || index;

              const message =
                enquiry?.message ||
                enquiry?.enquiryMessage ||
                enquiry?.description ||
                "";

              return (
                <article
                  className="my-enquiry-card"
                  key={enquiryId}
                >
                  <div className="my-enquiry-image">
                    <img
                      src={getImage(property)}
                      alt={property?.title || "Property"}
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = FALLBACK_IMAGE;
                      }}
                    />
                  </div>

                  <div className="my-enquiry-content">
                    <div className="my-enquiry-card-top">
                      <span
                        className={`my-enquiry-status status-${status.replace(
                          /[^a-z0-9_-]/g,
                          ""
                        )}`}
                      >
                        {getStatusLabel(status)}
                      </span>

                      <span className="my-enquiry-date">
                        {formatDate(
                          enquiry?.createdAt || enquiry?.date
                        )}
                      </span>
                    </div>

                    <h2>
                      {property?.title ||
                        enquiry?.propertyTitle ||
                        "Property Enquiry"}
                    </h2>

                    <p className="my-enquiry-location">
                      📍 {getLocation(property)}
                    </p>

                    <p className="my-enquiry-price">
                      {formatPrice(property?.price)}
                    </p>

                    {message && (
                      <div className="my-enquiry-message">
                        <strong>Your Message</strong>
                        <p>{message}</p>
                      </div>
                    )}

                    {enquiry?.reply && (
                      <div className="my-enquiry-reply">
                        <strong>Reply</strong>
                        <p>{enquiry.reply}</p>
                      </div>
                    )}

                    {propertyId && (
                      <Link
                        to={`/properties/${propertyId}`}
                        className="my-enquiry-view-link"
                      >
                        View Property →
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
};

export default MyEnquiry;
