import { createContext, useContext, useEffect, useState } from "react";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [adminUser, setAdminUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("adminUser") || "null");
    } catch {
      return null;
    }
  });

  const [adminToken, setAdminToken] = useState(
    () => localStorage.getItem("adminToken") || ""
  );

  const isAuthenticated = Boolean(
    adminToken && adminUser?.role === "admin"
  );

  useEffect(() => {
    if (adminToken && adminUser?.role === "admin") {
      localStorage.setItem("adminToken", adminToken);
      localStorage.setItem("adminUser", JSON.stringify(adminUser));
    } else {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
    }
  }, [adminToken, adminUser]);

  const login = (token, user) => {
    if (!token || user?.role !== "admin") {
      throw new Error("Valid admin credentials are required.");
    }

    localStorage.setItem("adminToken", token);
    localStorage.setItem("adminUser", JSON.stringify(user));
    setAdminToken(token);
    setAdminUser(user);
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    setAdminToken("");
    setAdminUser(null);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        adminToken,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error("useAdminAuth must be used inside AdminAuthProvider.");
  }

  return context;
}

export default AdminAuthContext;