import { Navigate, Route, Routes } from "react-router-dom";

import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProperties from "./pages/AdminProperties";
import AdminUsers from "./pages/AdminUsers";
import AdminEnquiries from "./pages/AdminEnquiries";
import AdminProfile from "./pages/AdminProfile";
import PropertyReview from "./pages/PropertyReview";
import NotFound from "./pages/NotFound";

import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import AdminLayout from "./components/AdminLayout";

import "./App.css";

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/dashboard" replace />}
      />

      <Route path="/login" element={<AdminLogin />} />

      <Route element={<ProtectedAdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<AdminDashboard />} />

          <Route path="/properties" element={<AdminProperties />} />

          <Route
            path="/properties/:id/review"
            element={<PropertyReview />}
          />

          <Route path="/users" element={<AdminUsers />} />

          <Route path="/enquiries" element={<AdminEnquiries />} />

          <Route path="/profile" element={<AdminProfile />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;