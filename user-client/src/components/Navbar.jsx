import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

const HouseLogo = () => (
  <svg
    className="eh-logo-svg"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M8 22.5L24 8L40 22.5"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12.5 20.5V39H35.5V20.5"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M21 39V28H27V39"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = async () => {
    closeMenu();

    try {
      if (typeof logout === "function") {
        await logout();
      } else {
        localStorage.removeItem("userToken");
        localStorage.removeItem("userUser");
      }

      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navItems = [
    { label: "Home", to: "/" },
    { label: "Properties", to: "/properties" },
    { label: "About", to: "/about" },
    { label: "Contact", to: "/contact" },
  ];

  return (
    <header className="estate-navbar">
      <div className="estate-navbar-container">
        {/* BRAND LOGO */}
        <Link
          to="/"
          className="estate-brand"
          onClick={closeMenu}
          aria-label="EstateHub Home"
        >
          <span className="estate-brand-mark">
            <HouseLogo />
          </span>

          <span className="estate-brand-copy">
            <span className="estate-brand-name">
              Estate<span>Hub</span>
            </span>

            <span className="estate-brand-tagline">
              FIND YOUR PLACE
            </span>
          </span>
        </Link>

        {/* MOBILE MENU BUTTON */}
        <button
          type="button"
          className={`estate-menu-toggle ${
            menuOpen ? "is-open" : ""
          }`}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((previous) => !previous)}
        >
          <span />
          <span />
          <span />
        </button>

        {/* NAVIGATION */}
        <nav
          className={`estate-navigation ${
            menuOpen ? "is-visible" : ""
          }`}
        >
          <div className="estate-nav-links">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `estate-nav-link ${
                    isActive ? "is-active" : ""
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}

            {user && (
              <>
                <NavLink
                  to="/wishlist"
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `estate-nav-link ${
                      isActive ? "is-active" : ""
                    }`
                  }
                >
                  Wishlist
                </NavLink>

                <NavLink
                  to="/dashboard"
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `estate-nav-link ${
                      isActive ? "is-active" : ""
                    }`
                  }
                >
                  Dashboard
                </NavLink>
              </>
            )}
          </div>

          {/* ACCOUNT ACTIONS */}
          <div className="estate-nav-actions">
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="estate-profile-link"
                  onClick={closeMenu}
                >
                  <span className="estate-user-avatar">
                    {(user.name || user.email || "U")
                      .trim()
                      .charAt(0)
                      .toUpperCase()}
                  </span>

                  <span className="estate-profile-label">
                    My Profile
                  </span>
                </Link>

                <button
                  type="button"
                  className="estate-logout-btn"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="estate-login-btn"
                  onClick={closeMenu}
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="estate-register-btn"
                  onClick={closeMenu}
                >
                  Get Started <span aria-hidden="true">→</span>
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;