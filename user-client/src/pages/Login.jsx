import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      await login(
        formData.email.trim(),
        formData.password
      );

      const redirectPath =
        location.state?.from || "/";

      navigate(redirectPath, {
        replace: true,
      });
    } catch (err) {
      console.error("Login error:", err);

      setError(
        err.response?.data?.message ||
          "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">

      <section className="login-section">

        <div className="login-container">

          {/* Left Side */}
          <div className="login-info">

            <span className="login-label">
              WELCOME TO ESTATEHUB
            </span>

            <h1>
              Find a place
              <br />
              <span>you'll love.</span>
            </h1>

            <p>
              Sign in to manage your properties,
              save your favourites and connect with
              property owners.
            </p>

            <div className="login-features">

              <div className="login-feature">
                <span>✓</span>
                <p>Explore verified properties</p>
              </div>

              <div className="login-feature">
                <span>✓</span>
                <p>Save properties to your wishlist</p>
              </div>

              <div className="login-feature">
                <span>✓</span>
                <p>List and manage your properties</p>
              </div>

            </div>

          </div>

          {/* Login Card */}
          <div className="login-card">

            <div className="login-card-header">

              <div className="login-logo">
                <span>E</span>
              </div>

              <div>
                <h2>Welcome Back</h2>

                <p>
                  Login to your EstateHub account
                </p>
              </div>

            </div>

            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>

              <div className="login-form-group">

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

              <div className="login-form-group">

                <label htmlFor="password">
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />

              </div>

              <button
                type="submit"
                className="btn btn-primary login-submit"
                disabled={loading}
              >
                {loading
                  ? "Signing In..."
                  : "Sign In"}
              </button>

            </form>

            <div className="login-divider">
              <span>New to EstateHub?</span>
            </div>

            <Link
              to="/register"
              className="register-link"
            >
              Create an Account
              <span>→</span>
            </Link>

          </div>

        </div>

      </section>

    </main>
  );
};

export default Login;