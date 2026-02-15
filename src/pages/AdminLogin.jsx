import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { settingsAPI } from "../services/api";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [businessName, setBusinessName] = useState("Advait Collections");

  const navigate = useNavigate();

  // ================= CHECK IF ALREADY LOGGED IN =================
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      navigate("/admin-dashboard");
    }
  }, [navigate]);

  // ================= FETCH BUSINESS NAME =================
  useEffect(() => {
    fetchBusinessName();
  }, []);

  const fetchBusinessName = async () => {
    try {
      const response = await settingsAPI.getSettings();
      if (response?.success) {
        setBusinessName(response.settings?.businessName || "Advait Collections");
      }
    } catch (error) {
      console.log("Business name fetch failed");
    }
  };

  // ================= HANDLE LOGIN =================
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/admin-login`,
        { email, password }
      );

      localStorage.setItem("adminToken", res.data.token);

      navigate("/admin-dashboard");

    } catch (error) {
      alert("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">

      {/* Simple Navbar */}
      <nav className="login-navbar">
        <div className="container d-flex justify-content-between align-items-center">
          <Link to="/" className="login-navbar-brand">
            {businessName}
          </Link>
          <div>
            <Link to="/" className="me-3">Home</Link>
            <Link to="/about" className="me-3">About</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </div>
      </nav>

      {/* Login Form */}
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-5">
            <div className="card shadow p-4">

              <h3 className="text-center mb-4">Admin Login</h3>

              <form onSubmit={handleLogin}>

                <input
                  type="email"
                  className="form-control mb-3"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <div className="position-relative mb-3">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-sm position-absolute end-0 top-0 mt-1 me-2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Login"}
                </button>

              </form>

              <div className="text-center mt-3 text-muted">
                Default: admin@advait.com / admin123
              </div>

            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default AdminLogin;
