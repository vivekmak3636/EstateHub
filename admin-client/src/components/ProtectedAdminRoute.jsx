import { Navigate, Outlet, useLocation } from "react-router-dom";

function ProtectedAdminRoute({ children }) {
  const location = useLocation();
  const token = localStorage.getItem("adminToken");

  let adminUser = null;

  try {
    adminUser = JSON.parse(localStorage.getItem("adminUser") || "null");
  } catch {
    adminUser = null;
  }

  if (!token || adminUser?.role !== "admin") {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children || <Outlet />;
}

export default ProtectedAdminRoute;