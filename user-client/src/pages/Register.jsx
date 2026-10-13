import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import "./Register.css";

const Register = () => {
  const navigate = useNavigate();
  const { register} = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "user",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
  event.preventDefault();

  setError("");
  setSuccess("");

  if (formData.password !== formData.confirmPassword) {
    setError("Passwords do not match.");
    return;
  }

  if (formData.password.length < 6) {
    setError("Password must be at least 6 characters.");
    return;
  }

  try {
    setLoading(true);

    await register({
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      password: formData.password,
      role: formData.role,
    });

    setSuccess("Account created successfully.");

    navigate("/", {
      replace: true,
    });
  } catch (err) {
    console.error("Registration error:", err);

    setError(
      err.response?.data?.message ||
        err.message ||
        "Unable to create account. Please try again."
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <main className="register-page">
      <section className="register-section">
        <div className="register-container">
          {/* Left Side */}
          <div className="register-info">
            <span className="register-label">
              JOIN ESTATEHUB
            </span>

            <h1>
              Your next
              <br />
              <span>home awaits.</span>
            </h1>

            <p>
              Create your EstateHub account and
              discover properties that match your
              lifestyle and budget.
            </p>

            <div className="register-features">
              <div className="register-feature">
                <div className="feature-icon">✓</div>
                <div>
                  <h3>Find Your Property</h3>
                  <p>
                    Explore properties for sale and
                    rent.
                  </p>
                </div>
              </div>

              <div className="register-feature">
                <div className="feature-icon">✓</div>
                <div>
                  <h3>Save Your Favourites</h3>
                  <p>
                    Keep your favourite properties
                    in one place.
                  </p>
                </div>
              </div>

              <div className="register-feature">
                <div className="feature-icon">✓</div>
                <div>
                  <h3>List Your Property</h3>
                  <p>
                    Owners and agents can list their
                    properties.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Register Card */}
          <div className="register-card">
            <div className="register-card-header">
              <div className="register-logo">
                <span>E</span>
              </div>

              <div>
                <h2>Create Account</h2>
                <p>
                  Join EstateHub today
                </p>
              </div>
            </div>

            {error && (
              <div className="register-error">
                {error}
              </div>
            )}

            {success && (
              <div className="register-success">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="register-form-group">
                <label htmlFor="name">
                  Full Name
                </label>

                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  required
                />
              </div>

              <div className="register-form-row">
                <div className="register-form-group">
                  <label htmlFor="email">
                    Email Address
                  </label>

                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="register-form-group">
                  <label htmlFor="phone">
                    Phone Number
                  </label>

                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    autoComplete="tel"
                    required
                  />
                </div>
              </div>

              <div className="register-form-group">
                <label htmlFor="role">
                  Account Type
                </label>

                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="user">
                    User / Buyer
                  </option>

                  <option value="owner">
                    Property Owner
                  </option>

                  <option value="agent">
                    Agent
                  </option>
                </select>
              </div>

              <div className="register-form-row">
                <div className="register-form-group">
                  <label htmlFor="password">
                    Password
                  </label>

                  <input
                    id="password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimum 6 characters"
                    autoComplete="new-password"
                    required
                  />
                </div>

                <div className="register-form-group">
                  <label htmlFor="confirmPassword">
                    Confirm Password
                  </label>

                  <input
                    id="confirmPassword"
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat password"
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary register-submit"
                disabled={loading}
              >
                {loading
                  ? "Creating Account..."
                  : "Create Account"}
              </button>
            </form>

            <div className="register-divider">
              <span>Already have an account?</span>
            </div>

            <Link
              to="/login"
              className="login-link"
            >
              Sign In
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Register;