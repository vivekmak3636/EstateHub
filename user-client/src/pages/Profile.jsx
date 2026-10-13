import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./Profile.css";

const Profile = () => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      const storedUser = JSON.parse(
        localStorage.getItem("userUser") || "null"
      );

      const currentUser = user || storedUser;

      if (currentUser && active) {
        setFormData({
          name: currentUser.name || "",
          email: currentUser.email || "",
          phone: currentUser.phone || "",
          address:
            typeof currentUser.address === "string"
              ? currentUser.address
              : currentUser.address?.street || "",
        });
      }

      try {
        const response = await api.get("/users/profile");
        const profile =
          response.data?.user ||
          response.data?.data ||
          response.data;

        if (active && profile && typeof profile === "object") {
          setFormData({
            name: profile.name || currentUser?.name || "",
            email: profile.email || currentUser?.email || "",
            phone: profile.phone || currentUser?.phone || "",
            address:
              typeof profile.address === "string"
                ? profile.address
                : profile.address?.street ||
                  (typeof currentUser?.address === "string"
                    ? currentUser.address
                    : currentUser?.address?.street || ""),
          });
        }
      } catch (err) {
        // Stored user information remains visible if this endpoint is unavailable.
        console.error("Profile loading error:", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setSaving(true);

    try {
      const response = await api.put("/users/profile", formData);
      const updatedUser =
        response.data?.user ||
        response.data?.data ||
        {};

      const storedUser = JSON.parse(
        localStorage.getItem("userUser") || "{}"
      );

      localStorage.setItem(
        "userUser",
        JSON.stringify({
          ...storedUser,
          ...updatedUser,
          ...formData,
        })
      );

      setMessage("Profile updated successfully!");
    } catch (err) {
      console.error("Profile update error:", err);

      setError(
        err.response?.data?.message ||
          "Profile update failed. Please check your backend API."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="profile-page">
        <div className="profile-loading">Loading profile...</div>
      </main>
    );
  }

  return (
    <main className="profile-page">
      <section className="profile-hero">
        <div className="profile-hero-content">
          <span className="profile-eyebrow">
            ESTATEHUB ACCOUNT
          </span>

          <h1>My Profile</h1>

          <p>
            Manage your personal information and account details.
          </p>
        </div>
      </section>

      <section className="profile-container">
        {/* PROFILE SIDEBAR */}
        <aside className="profile-sidebar">
          <div className="profile-avatar">
            {formData.name.trim().charAt(0).toUpperCase() || "U"}
          </div>

          <h2>{formData.name || "Your Name"}</h2>

          <p className="profile-sidebar-email">
            {formData.email || "Your email address"}
          </p>

          <div className="profile-sidebar-divider" />

          <Link
            to="/profile"
            className="profile-menu-item active"
          >
            <span>♙</span>
            Personal Information
          </Link>

          <Link
            to="/dashboard"
            className="profile-menu-item"
          >
            <span>⌂</span>
            My Dashboard
          </Link>
        </aside>

        {/* PERSONAL INFORMATION */}
        <section className="profile-form-card">
          <div className="profile-card-heading">
            <div>
              <span className="profile-eyebrow">
                ACCOUNT SETTINGS
              </span>

              <h2>Personal Information</h2>

              <p>
                Keep your contact information up to date.
              </p>
            </div>

            <span className="profile-heading-icon">✎</span>
          </div>

          {message && (
            <div className="profile-alert success" role="status">
              {message}
            </div>
          )}

          {error && (
            <div className="profile-alert error" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="profile-form-grid">
              <div className="profile-field">
                <label htmlFor="profile-name">
                  Full Name
                </label>

                <input
                  id="profile-name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="profile-field">
                <label htmlFor="profile-email">
                  Email Address
                </label>

                <input
                  id="profile-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="profile-field">
                <label htmlFor="profile-phone">
                  Phone Number
                </label>

                <input
                  id="profile-phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="profile-field profile-field-full">
                <label htmlFor="profile-address">
                  Address
                </label>

                <textarea
                  id="profile-address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter your address"
                  rows="3"
                />
              </div>
            </div>

            <div className="profile-form-footer">
              <p>
                Your information helps us provide a better experience.
              </p>

              <button
                type="submit"
                className="profile-save-btn"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </section>
      </section>
    </main>
  );
};

export default Profile;