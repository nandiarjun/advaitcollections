import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("adminToken");

  // If no token, redirect to admin login
  if (!token) {
    return <Navigate to="/admin-login" replace />;
  }

  // If token exists, show the protected content
  return children;
}

export default ProtectedRoute;