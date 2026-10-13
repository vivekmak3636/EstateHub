
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import { useAuth } from "../context/AuthContext";
import propertyService from "../services/propertyService";
import enquiryService from "../services/enquiryService";
import "./Dashboard.css";

const easeOut = [0.22, 1, 0.36, 1];

const heroVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: easeOut },
  },
};

const cardContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.12,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.48, ease: easeOut },
  },
};

const Dashboard = () => {
  const { user } = useAuth();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const [unreadEnquiries, setUnreadEnquiries] = useState(0);
  const [enquiriesLoading, setEnquiriesLoading] = useState(true);

  // Read the current logged-in user.
  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("userUser") || "null");
    } catch {
      return null;
    }
  })();

  const currentUser = user || storedUser;

  const userRole = String(currentUser?.role || "")
    .trim()
    .toLowerCase();

  const displayName =
    currentUser?.name?.trim()?.split(" ")[0] || "there";

  const canManageProperties = ["owner", "agent"].includes(userRole);

  // Load properties belonging to the logged-in owner/agent.
  useEffect(() => {
    let active = true;

    const loadProperties = async () => {
      if (!canManageProperties) {
        setProperties([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const response = await propertyService.getMyProperties();
        const data = response?.data ?? response;

        const propertyList = Array.isArray(data)
          ? data
          : data?.properties || data?.data?.properties || [];

        if (active) {
          setProperties(propertyList);
        }
      } catch (error) {
        console.error("Dashboard properties loading error:", error);

        if (active) {
          setProperties([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadProperties();

    return () => {
      active = false;
    };
  }, [canManageProperties]);

  // Load unread enquiry count and refresh it every 15 seconds.
  useEffect(() => {
    let active = true;
    let intervalId;

    const loadUnreadEnquiries = async () => {
      if (!canManageProperties) {
        if (active) {
          setUnreadEnquiries(0);
          setEnquiriesLoading(false);
        }
        return;
      }

      try {
        const response =
          await enquiryService.getReceivedEnquiries();

        if (!active) return;

        const enquiries = Array.isArray(response?.enquiries)
          ? response.enquiries
          : [];

        const count =
          typeof response?.unreadCount === "number"
            ? response.unreadCount
            : enquiries.filter(
                (enquiry) => enquiry.isRead !== true
              ).length;

        setUnreadEnquiries(count);
      } catch (error) {
        console.error(
          "Dashboard enquiry notification error:",
          error
        );
      } finally {
        if (active) {
          setEnquiriesLoading(false);
        }
      }
    };

    loadUnreadEnquiries();

    if (canManageProperties) {
      intervalId = setInterval(loadUnreadEnquiries, 15000);
    }

    return () => {
      active = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [canManageProperties]);

  const quickLinks = [
    {
      title: "Browse Properties",
      description:
        "Explore homes, apartments and properties that match your needs.",
      icon: "⌕",
      link: "/properties",
      button: "Explore Properties",
      visible: true,
    },
    {
      title: "My Wishlist",
      description:
        "Find your saved properties whenever you need them.",
      icon: "♡",
      link: "/wishlist",
      button: "View Wishlist",
      visible: true,
    },
    {
      title: "My Enquiries",
      description: canManageProperties
        ? "View enquiries received for your property listings."
        : "Keep track of your property enquiries and conversations.",
      icon: "✉",
      link: "/my-enquiries",
      button: "View Enquiries",
      visible: true,
      notificationCount: canManageProperties ? unreadEnquiries : 0,
    },
    {
      title: "My Properties",
      description:
        "Manage the properties you have listed on EstateHub.",
      icon: "⌂",
      link: "/my-properties",
      button: "Manage Properties",
      visible: canManageProperties,
    },
    {
      title: "Upload Property",
      description:
        "List a new property and connect with potential buyers or tenants.",
      icon: "＋",
      link: "/post-property",
      button: "Upload Property",
      visible: canManageProperties,
    },
    {
      title: "My Profile",
      description:
        "Update your personal details and contact information.",
      icon: "♙",
      link: "/profile",
      button: "Edit Profile",
      visible: true,
    },
  ];

  return (
    <main className="dashboard-page">
      {/* HERO */}
      <motion.section
        className="dashboard-hero"
        variants={heroVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="dashboard-hero-inner">
          <motion.div
            className="dashboard-welcome"
            initial={{ opacity: 0, x: -28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, delay: 0.12, ease: easeOut }}
          >
            <span className="dashboard-eyebrow">
              ESTATEHUB · YOUR SPACE
            </span>

            <h1>
              Welcome back, <span>{displayName}!</span>
            </h1>

            <p>
              {canManageProperties
                ? "Manage your property listings, explore opportunities and keep everything organised in one place."
                : "Find your dream property and manage everything from your personal dashboard."}
            </p>

            <motion.div
              className="dashboard-hero-actions"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.3 }}
            >
              <Link
                to={canManageProperties ? "/my-properties" : "/properties"}
                className="dashboard-primary-btn"
              >
                {canManageProperties
                  ? "Manage My Properties"
                  : "Explore Properties"}
                <span aria-hidden="true">→</span>
              </Link>

              {canManageProperties && (
                <Link
                  to="/post-property"
                  className="dashboard-secondary-btn"
                >
                  + Upload Property
                </Link>
              )}
            </motion.div>
          </motion.div>

          <motion.div
            className="dashboard-hero-decoration"
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: easeOut }}
          >
            <motion.div
              className="dashboard-house-icon"
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              ⌂
            </motion.div>

            <div className="dashboard-decoration-caption">
              <span>YOUR NEXT CHAPTER</span>
              <strong>Starts at home.</strong>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* DASHBOARD CONTENT */}
      <section className="dashboard-content">
        <motion.div
          className="dashboard-section-heading"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: easeOut }}
        >
          <span className="dashboard-eyebrow">QUICK ACCESS</span>
          <h2>Your Dashboard</h2>
          <p>
            Everything you need, conveniently organised in one place.
          </p>
        </motion.div>

        {/* PROPERTY SUMMARY */}
        {canManageProperties && (
          <motion.div
            className="dashboard-property-summary"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: easeOut }}
          >
            <div>
              <span className="dashboard-summary-label">
                MY LISTINGS
              </span>

              <h3>{loading ? "Loading..." : properties.length}</h3>

              <p>
                {loading
                  ? "Fetching your properties..."
                  : properties.length === 1
                  ? "Property in your listing"
                  : "Properties in your listing"}
              </p>
            </div>

            <Link
              to="/my-properties"
              className="dashboard-summary-link"
            >
              View All →
            </Link>
          </motion.div>
        )}

        {/* QUICK ACCESS CARDS */}
        <motion.div
          className="dashboard-action-grid"
          variants={cardContainerVariants}
          initial="hidden"
          animate="visible"
        >
          {quickLinks
            .filter((item) => item.visible)
            .map((item) => (
              <motion.article
                className="dashboard-action-card"
                key={item.title}
                variants={cardVariants}
                whileHover={{
                  y: -7,
                  transition: { duration: 0.2 },
                }}
                whileTap={{ scale: 0.99 }}
              >
                <motion.div
                  className="dashboard-action-icon"
                  whileHover={{
                    scale: 1.1,
                    rotate: -5,
                    transition: { duration: 0.2 },
                  }}
                >
                  {item.icon}
                </motion.div>

                <div className="dashboard-card-title-row">
                  <h3>{item.title}</h3>

                  {item.title === "My Enquiries" &&
                    canManageProperties &&
                    unreadEnquiries > 0 && (
                      <span
                        className="dashboard-enquiry-badge"
                        aria-label={`${unreadEnquiries} unread enquiries`}
                      >
                        {unreadEnquiries} New
                      </span>
                    )}
                </div>

                <p>{item.description}</p>

                {item.title === "My Enquiries" &&
                  canManageProperties &&
                  enquiriesLoading && (
                    <span className="dashboard-enquiry-loading">
                      Checking new enquiries...
                    </span>
                  )}

                <Link
                  to={item.link}
                  className="dashboard-action-link"
                >
                  {item.button}
                  <span aria-hidden="true">→</span>
                </Link>
              </motion.article>
            ))}
        </motion.div>

        {/* BOTTOM CTA */}
        <motion.section
          className="dashboard-cta"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: easeOut }}
        >
          <div>
            <span className="dashboard-eyebrow">
              {canManageProperties
                ? "GROW WITH ESTATEHUB"
                : "YOUR NEXT MOVE"}
            </span>

            <h2>
              {canManageProperties
                ? "Ready to list another property?"
                : "Your dream home could be one click away."}
            </h2>

            <p>
              {canManageProperties
                ? "Add your next listing and help more people find their perfect place."
                : "Explore our property listings and discover a place that feels like home."}
            </p>
          </div>

          <Link
            to={canManageProperties ? "/post-property" : "/properties"}
            className="dashboard-cta-btn"
          >
            {canManageProperties
              ? "Upload Property"
              : "Browse Properties"}
            <span aria-hidden="true">→</span>
          </Link>
        </motion.section>
      </section>
    </main>
  );
};

export default Dashboard;
