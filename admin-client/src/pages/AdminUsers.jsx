import { useCallback, useEffect, useMemo, useState } from "react";
import adminService from "../services/adminService";
import "./AdminUsers.css";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionId, setActionId] = useState("");

  let adminUser = null;

  try {
    adminUser = JSON.parse(localStorage.getItem("adminUser") || "null");
  } catch {
    adminUser = null;
  }

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await adminService.getUsers();

      if (response?.success === false) {
        throw new Error(response.message || "Users could not be loaded.");
      }

      const userList =
        response?.users ??
        response?.data?.users ??
        (Array.isArray(response?.data) ? response.data : []);

      setUsers(Array.isArray(userList) ? userList : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "An error occurred while loading users."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const query = search.trim().toLowerCase();

      const matchesSearch =
        !query ||
        [user.name, user.email, user.phone, user.role]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));

      const matchesRole =
        roleFilter === "all" || user.role === roleFilter;

      const blocked = Boolean(user.isBlocked);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "blocked" && blocked) ||
        (statusFilter === "active" && !blocked);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const counts = useMemo(
    () => ({
      total: users.length,
      users: users.filter((user) => user.role === "user").length,
      owners: users.filter(
        (user) => user.role === "owner" || user.role === "agent"
      ).length,
      blocked: users.filter((user) => user.isBlocked).length,
    }),
    [users]
  );

  const toggleBlock = async (user) => {
    const userId = user._id || user.id;

    if (!userId || actionId) return;

    const currentAdminId = String(adminUser?._id || adminUser?.id || "");
    const isSelf = String(userId) === currentAdminId;
    const isAdmin = user.role === "admin";

    if (isSelf || isAdmin) {
      setError("Admin accounts cannot be blocked from this page.");
      return;
    }

    const shouldBlock = !user.isBlocked;

    const confirmed = window.confirm(
      shouldBlock
        ? `શું તમે ${user.name || "આ user"} ને block કરવા માંગો છો?`
        : `શું તમે ${user.name || "આ user"} ને unblock કરવા માંગો છો?`
    );

    if (!confirmed) return;

    setActionId(String(userId));
    setError("");

    try {
      if (shouldBlock) {
        await adminService.blockUser(userId);
      } else {
        await adminService.unblockUser(userId);
      }

      setUsers((previousUsers) =>
        previousUsers.map((item) =>
          String(item._id || item.id) === String(userId)
            ? { ...item, isBlocked: shouldBlock }
            : item
        )
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "User status could not be updated."
      );
    } finally {
      setActionId("");
    }
  };

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

  const getInitial = (name) =>
    String(name || "U").trim().charAt(0).toUpperCase() || "U";

  return (
    <div className="au-page">
      <main className="au-content">
        <section className="au-heading">
          <div>
            <span className="au-eyebrow">ESTATEHUB ADMIN</span>
            <h2>All Users</h2>
            <p>View accounts and control access to the platform.</p>
          </div>

          <button
            type="button"
            className="au-refresh-button"
            onClick={loadUsers}
            disabled={loading}
          >
            ↻ &nbsp; {loading ? "Loading..." : "Refresh"}
          </button>
        </section>

        {error && (
          <div className="au-error" role="alert">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        <section className="au-stats">
          <article className="au-stat-card">
            <span className="au-stat-icon au-icon-navy">♙</span>
            <div>
              <p>Total Accounts</p>
              <strong>{counts.total}</strong>
            </div>
          </article>

          <article className="au-stat-card">
            <span className="au-stat-icon au-icon-gold">U</span>
            <div>
              <p>Regular Users</p>
              <strong>{counts.users}</strong>
            </div>
          </article>

          <article className="au-stat-card">
            <span className="au-stat-icon au-icon-blue">⌂</span>
            <div>
              <p>Owners &amp; Agents</p>
              <strong>{counts.owners}</strong>
            </div>
          </article>

          <article className="au-stat-card">
            <span className="au-stat-icon au-icon-red">!</span>
            <div>
              <p>Blocked Accounts</p>
              <strong>{counts.blocked}</strong>
            </div>
          </article>
        </section>

        <section className="au-list-card">
          <div className="au-list-heading">
            <div>
              <h3>Registered Accounts</h3>
              <p>
                Showing {filteredUsers.length} of {users.length} accounts
              </p>
            </div>
          </div>

          <div className="au-filters">
            <div className="au-search">
              <span>⌕</span>
              <input
                type="search"
                placeholder="Search name, email, phone..."
                aria-label="Search users"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <select
              aria-label="Filter by role"
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="owner">Owner</option>
              <option value="agent">Agent</option>
              <option value="admin">Admin</option>
            </select>

            <select
              aria-label="Filter by account status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>

          {loading ? (
            <div className="au-state">
              <span className="au-spinner" />
              <p>Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="au-state">
              <span className="au-empty-icon">♙</span>
              <h3>No users found</h3>
              <p>Try changing your search or filters.</p>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setRoleFilter("all");
                  setStatusFilter("all");
                }}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="au-table-wrap">
              <table className="au-table">
                <thead>
                  <tr>
                    <th>USER</th>
                    <th>ROLE</th>
                    <th>JOINED</th>
                    <th>STATUS</th>
                    <th>ACTION</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((user) => {
                    const id = String(user._id || user.id || "");
                    const currentAdminId = String(
                      adminUser?._id || adminUser?.id || ""
                    );
                    const isSelf = id !== "" && id === currentAdminId;
                    const isAdmin = user.role === "admin";
                    const busy = actionId === id;

                    return (
                      <tr key={id || user.email}>
                        <td>
                          <div className="au-user-cell">
                            <div className="au-user-avatar">
                              {getInitial(user.name)}
                            </div>
                            <div className="au-user-details">
                              <strong>{user.name || "Unnamed User"}</strong>
                              <span>{user.email || "No email"}</span>
                              {user.phone && <small>{user.phone}</small>}
                            </div>
                          </div>
                        </td>

                        <td>
                          <span
                            className={`au-role au-role-${String(
                              user.role || "user"
                            ).toLowerCase()}`}
                          >
                            {user.role || "user"}
                          </span>
                        </td>

                        <td>{formatDate(user.createdAt)}</td>

                        <td>
                          <span
                            className={`au-status ${
                              user.isBlocked
                                ? "au-status-blocked"
                                : "au-status-active"
                            }`}
                          >
                            <span />
                            {user.isBlocked ? "Blocked" : "Active"}
                          </span>
                        </td>

                        <td>
                          {isAdmin || isSelf ? (
                            <span className="au-protected-label">
                              Protected
                            </span>
                          ) : (
                            <button
                              type="button"
                              className={`au-action-button ${
                                user.isBlocked
                                  ? "au-unblock-button"
                                  : "au-block-button"
                              }`}
                              onClick={() => toggleBlock(user)}
                              disabled={Boolean(actionId)}
                            >
                              {busy
                                ? "Please wait..."
                                : user.isBlocked
                                  ? "Unblock"
                                  : "Block"}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer className="au-footer">
          <span>© {new Date().getFullYear()} EstateHub</span>
          <span>Admin Portal · User Management</span>
        </footer>
      </main>
    </div>
  );
}

export default AdminUsers;