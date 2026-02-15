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

  // Fetch business name for navbar
  useEffect(() => {
    fetchBusinessName();
  }, []);

  const fetchBusinessName = async () => {
    try {
      const response = await settingsAPI.getSettings();
      if (response.success) {
        setBusinessName(response.settings.businessName || "Advait Collections");
      }
    } catch (error) {
      console.error("Error fetching business name:", error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/admin-login",
        { email, password }
      );

      localStorage.setItem("adminToken", res.data.token);
      
      // Show success message
      const toast = document.createElement('div');
      toast.className = 'position-fixed top-0 end-0 m-3 p-3 bg-success text-white rounded shadow';
      toast.style.zIndex = '9999';
      toast.style.animation = 'slideIn 0.3s ease';
      toast.innerHTML = `
        <div class="d-flex align-items-center">
          <i class="bi bi-check-circle-fill me-2"></i>
          <div>
            <strong>Login Successful!</strong><br>
            <small>Redirecting to dashboard...</small>
          </div>
        </div>
      `;
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.remove();
        navigate("/admin-dashboard");
      }, 1500);

    } catch (error) {
      // Show error message
      const toast = document.createElement('div');
      toast.className = 'position-fixed top-0 end-0 m-3 p-3 bg-danger text-white rounded shadow';
      toast.style.zIndex = '9999';
      toast.style.animation = 'slideIn 0.3s ease';
      toast.innerHTML = `
        <div class="d-flex align-items-center">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>
          <div>
            <strong>Login Failed!</strong><br>
            <small>Invalid email or password</small>
          </div>
        </div>
      `;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Add custom CSS
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .admin-login-page {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        background: #f5f7fa;
      }

      /* Navbar */
      .login-navbar {
        background: #ffffff;
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        padding: 0.8rem 0;
        border-bottom: 1px solid #eaeaea;
      }

      .login-navbar .container {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .login-navbar-brand {
        display: flex;
        align-items: center;
        text-decoration: none;
        color: #1e293b;
        font-weight: 600;
        font-size: 1.3rem;
      }

      .login-navbar-brand i {
        color: #3b82f6;
        font-size: 1.5rem;
        margin-right: 0.5rem;
      }

      .login-navbar-brand span {
        background: linear-gradient(135deg, #1e293b, #3b82f6);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .login-navbar-links {
        display: flex;
        gap: 1.5rem;
      }

      .login-navbar-links a {
        color: #4b5563;
        text-decoration: none;
        font-size: 0.95rem;
        transition: color 0.2s ease;
        display: flex;
        align-items: center;
        gap: 0.3rem;
      }

      .login-navbar-links a:hover {
        color: #3b82f6;
      }

      .login-navbar-links a i {
        font-size: 0.9rem;
      }

      /* Main Content */
      .login-main {
        flex: 1;
        display: flex;
        align-items: center;
        padding: 2rem 0;
      }

      .login-card {
        background: white;
        border-radius: 20px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.08);
        overflow: hidden;
        animation: fadeIn 0.5s ease;
        border: 1px solid rgba(0,0,0,0.05);
      }

      .login-header {
        background: linear-gradient(135deg, #1e293b, #0f172a);
        color: white;
        padding: 2rem;
        text-align: center;
      }

      .login-header i {
        font-size: 3rem;
        color: #3b82f6;
        background: rgba(255,255,255,0.1);
        width: 80px;
        height: 80px;
        line-height: 80px;
        border-radius: 50%;
        margin-bottom: 1rem;
      }

      .login-header h2 {
        font-size: 1.8rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
      }

      .login-header p {
        color: rgba(255,255,255,0.7);
        font-size: 0.95rem;
      }

      .login-body {
        padding: 2rem;
      }

      .form-group {
        margin-bottom: 1.5rem;
      }

      .form-label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: #1e293b;
        font-size: 0.95rem;
      }

      .input-group {
        position: relative;
      }

      .input-icon {
        position: absolute;
        left: 1rem;
        top: 50%;
        transform: translateY(-50%);
        color: #9ca3af;
        z-index: 10;
      }

      .form-control {
        width: 100%;
        padding: 0.8rem 1rem 0.8rem 2.8rem;
        border: 2px solid #e5e7eb;
        border-radius: 12px;
        font-size: 0.95rem;
        transition: all 0.2s ease;
        background: #f9fafb;
      }

      .form-control:focus {
        outline: none;
        border-color: #3b82f6;
        background: white;
        box-shadow: 0 0 0 4px rgba(59,130,246,0.1);
      }

      .password-toggle {
        position: absolute;
        right: 1rem;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: #9ca3af;
        cursor: pointer;
        z-index: 10;
      }

      .password-toggle:hover {
        color: #3b82f6;
      }

      .login-btn {
        width: 100%;
        padding: 0.9rem;
        background: #3b82f6;
        color: white;
        border: none;
        border-radius: 12px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        margin-top: 1rem;
      }

      .login-btn:hover:not(:disabled) {
        background: #2563eb;
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(59,130,246,0.3);
      }

      .login-btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }

      .login-btn i {
        font-size: 1.1rem;
      }

      .login-footer-text {
        text-align: center;
        margin-top: 1.5rem;
        color: #6b7280;
        font-size: 0.9rem;
      }

      .login-footer-text a {
        color: #3b82f6;
        text-decoration: none;
        font-weight: 500;
      }

      .login-footer-text a:hover {
        text-decoration: underline;
      }

      /* Features */
      .login-features {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
        margin-top: 2rem;
        padding-top: 1.5rem;
        border-top: 1px solid #e5e7eb;
      }

      .feature-item {
        text-align: center;
      }

      .feature-item i {
        font-size: 1.3rem;
        color: #3b82f6;
        margin-bottom: 0.3rem;
      }

      .feature-item span {
        display: block;
        font-size: 0.8rem;
        color: #6b7280;
        font-weight: 500;
      }

      /* Footer */
      .login-footer {
        background: #ffffff;
        border-top: 1px solid #eaeaea;
        padding: 1.5rem 0;
        margin-top: auto;
      }

      .login-footer .container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 1rem;
      }

      .login-footer-copyright {
        color: #6b7280;
        font-size: 0.9rem;
      }

      .login-footer-links {
        display: flex;
        gap: 2rem;
        flex-wrap: wrap;
      }

      .login-footer-links a {
        color: #4b5563;
        text-decoration: none;
        font-size: 0.9rem;
        transition: color 0.2s ease;
      }

      .login-footer-links a:hover {
        color: #3b82f6;
      }

      /* Responsive */
      @media (max-width: 768px) {
        .login-header {
          padding: 1.5rem;
        }
        
        .login-header i {
          width: 60px;
          height: 60px;
          line-height: 60px;
          font-size: 2rem;
        }
        
        .login-header h2 {
          font-size: 1.5rem;
        }
        
        .login-body {
          padding: 1.5rem;
        }
        
        .login-navbar-links {
          gap: 1rem;
        }
        
        .login-footer .container {
          flex-direction: column;
          text-align: center;
        }
        
        .login-footer-links {
          justify-content: center;
          gap: 1.5rem;
        }
      }

      @media (max-width: 576px) {
        .login-features {
          grid-template-columns: 1fr;
          gap: 0.8rem;
        }
        
        .login-navbar-brand span {
          font-size: 1.1rem;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="admin-login-page">
      {/* Navbar */}
      <nav className="login-navbar">
        <div className="container">
          <Link to="/" className="login-navbar-brand">
            <i className="bi bi-layout-three-columns"></i>
            <span>{businessName}</span>
          </Link>
          <div className="login-navbar-links">
            <Link to="/">
              <i className="bi bi-house-door"></i>
              Home
            </Link>
            <Link to="/about">
              <i className="bi bi-info-circle"></i>
              About
            </Link>
            <Link to="/contact">
              <i className="bi bi-envelope"></i>
              Contact
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="login-main">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-5">
              <div className="login-card">
                <div className="login-header">
                  <i className="bi bi-shield-lock"></i>
                  <h2>Admin Login</h2>
                  <p>Access the administration dashboard</p>
                </div>
                <div className="login-body">
                  <form onSubmit={handleLogin}>
                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <div className="input-group">
                        <i className="bi bi-envelope input-icon"></i>
                        <input
                          type="email"
                          className="form-control"
                          placeholder="admin@advait.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Password</label>
                      <div className="input-group">
                        <i className="bi bi-lock input-icon"></i>
                        <input
                          type={showPassword ? "text" : "password"}
                          className="form-control"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          <i className={`bi bi-${showPassword ? 'eye-slash' : 'eye'}`}></i>
                        </button>
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      className="login-btn"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                          Logging in...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-box-arrow-in-right"></i>
                          Login to Dashboard
                        </>
                      )}
                    </button>
                  </form>

                  <div className="login-footer-text">
                    Default login: <strong>admin@advait.com</strong> / <strong>admin123</strong>
                  </div>

                  <div className="login-features">
                    <div className="feature-item">
                      <i className="bi bi-shield-check"></i>
                      <span>Secure Access</span>
                    </div>
                    <div className="feature-item">
                      <i className="bi bi-clock-history"></i>
                      <span>24/7 Access</span>
                    </div>
                    <div className="feature-item">
                      <i className="bi bi-graph-up"></i>
                      <span>Full Control</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="login-footer">
        <div className="container">
          <div className="login-footer-copyright">
            © {new Date().getFullYear()} {businessName}. All rights reserved.
          </div>
          <div className="login-footer-links">
            <Link to="/privacy-policy">Privacy</Link>
            <Link to="/terms-conditions">Terms</Link>
            <Link to="/contact">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default AdminLogin;