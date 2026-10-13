import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "./AdminLayout.css";

const menuItems = [
  { label: "Dashboard", icon: "▦", path: "/dashboard" },
  { label: "Properties", icon: "⌂", path: "/properties" },
  { label: "Users", icon: "♙", path: "/users" },
  { label: "Enquiries", icon: "✉", path: "/enquiries" },
  { label: "Admin Profile", icon: "◎", path: "/profile" },
];

function AdminLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  let adminUser = null;

  try {
    adminUser = JSON.parse(localStorage.getItem("adminUser") || "null");
  } catch {
    adminUser = null;
  }

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/login", { replace: true });
  };

  return (
    <div className="admin-layout">
      {sidebarOpen && (
        <button
          type="button"
          className="admin-layout-overlay"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`admin-layout-sidebar ${
          sidebarOpen ? "admin-layout-sidebar-open" : ""
        }`}
      >
        <NavLink
          to="/dashboard"
          className="admin-layout-brand"
          onClick={() => setSidebarOpen(false)}
        >
          <span className="admin-layout-brand-icon">E</span>
          <span>
            Estate<span className="admin-layout-brand-gold">Hub</span>
          </span>
        </NavLink>

        <p className="admin-layout-menu-label">MAIN MENU</p>

        <nav className="admin-layout-navigation">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/dashboard"}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `admin-layout-nav-link ${
                  isActive ? "admin-layout-nav-active" : ""
                }`
              }
            >
              <span className="admin-layout-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-layout-sidebar-bottom">
          <div className="admin-layout-help">
            <span className="admin-layout-help-icon">?</span>
            <div>
              <strong>Need help?</strong>
              <p>Manage your platform</p>
            </div>
          </div>

          <button
            type="button"
            className="admin-layout-logout"
            onClick={handleLogout}
          >
            <span>↪</span> Logout
          </button>
        </div>
      </aside>

      <div className="admin-layout-main">
        <header className="admin-layout-topbar">
          <button
            type="button"
            className="admin-layout-menu-toggle"
            aria-label="Open sidebar"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>

          <div className="admin-layout-topbar-title">
            <span className="admin-layout-live">
              <span /> Admin Portal
            </span>
          </div>

          <button
            type="button"
            className="admin-layout-profile"
            onClick={() => navigate("/profile")}
          >
            <span className="admin-layout-avatar">
              {(adminUser?.name || "A").charAt(0).toUpperCase()}
            </span>
            <span className="admin-layout-profile-info">
              <strong>{adminUser?.name || "Administrator"}</strong>
              <span>Administrator</span>
            </span>
          </button>
        </header>

        <main className="admin-layout-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;