
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import adminService from "../services/adminService";
import "./AdminLogin.css";

function AdminLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
    ) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
    }

    setErrors(newErrors);
    setMessage("");

    if (Object.keys(newErrors).length > 0) return;

    try {
      setLoading(true);

      const response = await adminService.login({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      if (
        !response?.success ||
        !response?.token ||
        response?.user?.role !== "admin"
      ) {
        setMessage("Admin login failed. Please check your credentials.");
        setMessageType("error");
        return;
      }

      localStorage.setItem("adminToken", response.token);
      localStorage.setItem("adminUser", JSON.stringify(response.user));

      setMessage("Login successful. Redirecting to dashboard...");
      setMessageType("success");

      navigate("/dashboard", { replace: true });
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Unable to login. Please check your server connection."
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-login-page">
      <section className="admin-login-brand">
        <Link to="/" className="admin-login-logo">
          <span className="admin-login-logo-icon">E</span>
          <span>
            Estate<span className="brand-gold">Hub</span>
          </span>
        </Link>

        <div className="admin-brand-content">
          <span className="admin-eyebrow">ESTATEHUB ADMINISTRATION</span>

          <h1>
            Manage properties.
            <br />
            Build trust.
          </h1>

          <p>
            Your central workspace for property approvals, user management,
            enquiries and platform operations.
          </p>

          <div className="admin-brand-features">
            <div className="admin-brand-feature">
              <span className="feature-check">✓</span>
              <span>Property approval management</span>
            </div>

            <div className="admin-brand-feature">
              <span className="feature-check">✓</span>
              <span>User and enquiry management</span>
            </div>

            <div className="admin-brand-feature">
              <span className="feature-check">✓</span>
              <span>Centralized admin dashboard</span>
            </div>
          </div>
        </div>

        <p className="admin-brand-footer">
          © {new Date().getFullYear()} EstateHub. All rights reserved.
        </p>
      </section>

      <section className="admin-login-form-section">
        <div className="admin-login-form-wrapper">
          <Link to="/" className="admin-login-mobile-logo">
            <span className="admin-login-logo-icon">E</span>
            <span>
              Estate<span className="brand-gold">Hub</span>
            </span>
          </Link>

          <div className="admin-login-heading">
            <span className="admin-login-badge">ADMIN PORTAL</span>
            <h2>Welcome back</h2>
            <p>Enter your administrator credentials to continue.</p>
          </div>

          <form
            className="admin-login-form"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="admin-form-group">
              <label htmlFor="admin-email">Email address</label>

              <input
                id="admin-email"
                type="email"
                name="email"
                placeholder="admin@example.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="username"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={
                  errors.email ? "admin-email-error" : undefined
                }
                disabled={loading}
              />

              {errors.email && (
                <span id="admin-email-error" className="admin-field-error">
                  {errors.email}
                </span>
              )}
            </div>

            <div className="admin-form-group">
              <label htmlFor="admin-password">Password</label>

              <div className="admin-password-wrapper">
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={
                    errors.password ? "admin-password-error" : undefined
                  }
                  disabled={loading}
                />

                <button
                  type="button"
                  className="admin-show-password"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={loading}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              {errors.password && (
                <span
                  id="admin-password-error"
                  className="admin-field-error"
                >
                  {errors.password}
                </span>
              )}
            </div>

            {message && (
              <div
                className={`admin-login-message ${messageType}`}
                role="status"
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              className="admin-login-submit"
              disabled={loading}
            >
              <span>
                {loading ? "Signing in..." : "Sign in to Admin"}
              </span>
              {!loading && <span aria-hidden="true">→</span>}
            </button>
          </form>

          <div className="admin-login-security-note">
            <span className="admin-security-icon">✓</span>
            <p>
              Restricted access. Only authorized administrators should sign in.
            </p>
          </div>

          <Link to="/" className="admin-back-link">
            <span aria-hidden="true">←</span>
            Back to home
          </Link>
        </div>
      </section>
    </main>
  );
}

export default AdminLogin;
