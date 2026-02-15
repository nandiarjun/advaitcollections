import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("adminToken");
  const location = useLocation();

  // If user is NOT logged in → redirect to login
  if (!token) {
    return (
      <Navigate
        to="/admin-login"
        replace
        state={{ from: location }}
      />
    );
  }

  // If logged in → allow access
  return children;
}

export default ProtectedRoute;
