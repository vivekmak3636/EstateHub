import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminProfile.css";

function AdminProfile() {
  const navigate = useNavigate();

  const [admin, setAdmin] = useState({
    name: "",
    email: "",
    role: "admin",
  });

  useEffect(() => {
    try {
      const savedAdmin = localStorage.getItem("adminUser");

      if (savedAdmin) {
        const parsedAdmin = JSON.parse(savedAdmin);

        setAdmin({
          name: parsedAdmin.name || "",
          email: parsedAdmin.email || "",
          role: parsedAdmin.role || "admin",
        });
      }
    } catch (error) {
      console.error("Unable to load admin profile:", error);
    }
  }, []);

  const initials = admin.name
    ? admin.name
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "A";

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/login", { replace: true });
  };

  return (
    <main className="admin-profile-page">
      <header className="admin-profile-header">
        <div>
          <span className="admin-profile-eyebrow">
            ESTATEHUB ADMINISTRATION
          </span>
          <h1>My Profile</h1>
          <p>Manage and view your administrator account information.</p>
        </div>

        <div className="admin-profile-header-icon" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
          </svg>
        </div>
      </header>

      <section className="admin-profile-layout">
        <article className="admin-profile-card">
          <div className="admin-profile-cover">
            <span className="admin-profile-badge">
              <span className="admin-profile-badge-dot" />
              Administrator Account
            </span>
            <div className="admin-profile-cover-pattern" />
          </div>

          <div className="admin-profile-avatar-wrapper">
            <div className="admin-profile-avatar">{initials}</div>
            <span
              className="admin-profile-online"
              title="Signed-in account"
            />
          </div>

          <div className="admin-profile-identity">
            <h2>{admin.name || "Admin"}</h2>
            <p className="admin-profile-email">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" />
              </svg>
              {admin.email || "Email not available"}
            </p>

            <span className="admin-profile-role">
              {admin.role.toUpperCase()}
            </span>
          </div>

          <div className="admin-profile-card-divider" />

          <div className="admin-profile-card-footer">
            <div className="admin-profile-footer-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <div>
              <strong>Administrator Access</strong>
              <p>EstateHub administration panel</p>
            </div>
          </div>
        </article>

        <article className="admin-profile-details">
          <div className="admin-profile-details-heading">
            <div>
              <span className="admin-profile-section-label">
                ACCOUNT SETTINGS
              </span>
              <h2>Account Information</h2>
              <p>Details associated with your current account.</p>
            </div>

            <div className="admin-profile-details-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="3" />
                <path d="m19.4 15 .1.1 1.4 1.1-1.5 2.6-1.7-.7a8 8 0 0 1-1.7 1l-.3 1.9h-3l-.3-1.9a8 8 0 0 1-1.7-1l-1.7.7-1.5-2.6 1.4-1.1a8 8 0 0 1 0-2l-1.4-1.1 1.5-2.6 1.7.7a8 8 0 0 1 1.7-1l.3-1.9h3l.3 1.9a8 8 0 0 1 1.7 1l1.7-.7 1.5 2.6-1.4 1.1a8 8 0 0 1 0 2Z" />
              </svg>
            </div>
          </div>

          <div className="admin-profile-fields">
            <div className="admin-profile-field">
              <label htmlFor="admin-profile-name">Full Name</label>
              <div className="admin-profile-field-value">
                <span className="admin-profile-field-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
                  </svg>
                </span>
                <span id="admin-profile-name">
                  {admin.name || "Not available"}
                </span>
              </div>
            </div>

            <div className="admin-profile-field">
              <label htmlFor="admin-profile-email">Email Address</label>
              <div className="admin-profile-field-value">
                <span className="admin-profile-field-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="m3 7 9 6 9-6" />
                  </svg>
                </span>
                <span
                  id="admin-profile-email"
                  className="admin-profile-value-text"
                >
                  {admin.email || "Not available"}
                </span>
              </div>
            </div>

            <div className="admin-profile-field">
              <label>Account Role</label>
              <div className="admin-profile-field-value">
                <span className="admin-profile-field-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </span>
                <span>Administrator</span>
              </div>
            </div>
          </div>

          <div className="admin-profile-security-note">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 11v5m0-8h.01" />
            </svg>
            <p>
              Your profile details are read from the currently saved admin
              account.
            </p>
          </div>

          <div className="admin-profile-actions">
            <button
              type="button"
              className="admin-profile-logout"
              onClick={handleLogout}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M10 17l5-5-5-5" />
                <path d="M15 12H3" />
                <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
              </svg>
              Logout
            </button>
          </div>
        </article>
      </section>
    </main>
  );
}

export default AdminProfile;