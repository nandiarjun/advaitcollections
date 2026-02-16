import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../services/api";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Using the authAPI from your centralized api.js with correct endpoint
      const response = await authAPI.adminLogin({ email, password });
      
      // Store token in localStorage if returned
      if (response.token) {
        localStorage.setItem('adminToken', response.token);
      }
      
      // Store user data if needed
      if (response.user) {
        localStorage.setItem('adminUser', JSON.stringify(response.user));
      }
      
      // Show success message
      alert("✅ Login Successful! Redirecting to dashboard...");
      
      // Navigate to admin dashboard
      navigate("/admin-dashboard");

    } catch (error) {
      console.error("Login error:", error);
      
      // Handle different error scenarios
      if (error.response?.status === 404) {
        setError("Login service unavailable. Please check backend connection.");
      } else if (error.response?.status === 401) {
        setError("Invalid email or password");
      } else if (error.response?.status === 400) {
        setError("Please provide both email and password");
      } else if (error.code === 'ERR_NETWORK') {
        setError("Network error. Please check if backend server is running.");
      } else {
        setError(error.response?.data?.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow border-0">
            <div className="card-body p-4">
              
              {/* Header */}
              <div className="text-center mb-4">
                <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-inline-flex p-3 mb-3">
                  <i className="bi bi-shield-lock fs-3"></i>
                </div>
                <h3 className="fw-bold">Admin Login</h3>
                <p className="text-muted small">Access the administration dashboard</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {error}
                  <button type="button" className="btn-close" onClick={() => setError("")}></button>
                </div>
              )}

              <form onSubmit={handleLogin}>
                {/* Email Field */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <i className="bi bi-envelope"></i>
                    </span>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="admin@advait.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="mb-4">
                  <label className="form-label fw-semibold">Password</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <i className="bi bi-lock"></i>
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      <i className={`bi bi-${showPassword ? 'eye-slash' : 'eye'}`}></i>
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button 
                  type="submit" 
                  className="btn btn-primary w-100 py-2 fw-semibold"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Logging in...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-box-arrow-in-right me-2"></i>
                      Login to Dashboard
                    </>
                  )}
                </button>
              </form>

              {/* Default Credentials */}
              <div className="mt-4 p-3 bg-light rounded text-center small">
                <p className="text-muted mb-1">Default credentials:</p>
                <p className="mb-0 fw-semibold">admin@advait.com / admin123</p>
              </div>

              {/* Back to Home Link */}
              <div className="text-center mt-3">
                <Link to="/" className="text-decoration-none small">
                  <i className="bi bi-arrow-left me-1"></i>
                  Back to Home
                </Link>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;