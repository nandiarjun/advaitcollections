import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

function AdminNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("adminToken");
      navigate("/admin-login");
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short'
    });
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      <style jsx="true">{`
        /* Professional Admin Navbar - Clean & Compact */
        .admin-navbar {
          background: #ffffff;
          border-bottom: 1px solid #e5e7eb;
          padding: 0.4rem 1rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.03);
          min-height: 55px;
          z-index: 1030;
        }
        
        /* Brand */
        .admin-brand {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1e293b;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.2rem 0;
          text-decoration: none;
        }
        
        .admin-brand i {
          color: #dc2626;
          font-size: 1.3rem;
        }
        
        .admin-brand span {
          letter-spacing: -0.3px;
        }
        
        /* Date/Time Badge */
        .datetime-badge {
          background: #f8fafc;
          padding: 0.3rem 1rem;
          border-radius: 30px;
          font-size: 0.8rem;
          color: #1e293b;
          display: flex;
          align-items: center;
          gap: 0.8rem;
          margin-left: 1rem;
          border: 1px solid #e2e8f0;
          font-weight: 500;
        }
        
        .datetime-badge i {
          color: #dc2626;
          font-size: 0.8rem;
        }
        
        /* Navigation Links */
        .nav-links {
          display: flex;
          align-items: center;
          gap: 0.2rem;
        }
        
        .nav-link-admin {
          padding: 0.4rem 0.9rem;
          color: #4b5563;
          text-decoration: none;
          font-size: 0.85rem;
          font-weight: 500;
          border-radius: 4px;
          transition: all 0.15s ease;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          white-space: nowrap;
        }
        
        .nav-link-admin i {
          font-size: 0.9rem;
          color: #9ca3af;
          transition: all 0.15s ease;
        }
        
        .nav-link-admin:hover {
          background: #f3f4f6;
          color: #dc2626;
        }
        
        .nav-link-admin:hover i {
          color: #dc2626;
        }
        
        .nav-link-admin.active {
          background: #fee2e2;
          color: #dc2626;
          font-weight: 600;
        }
        
        .nav-link-admin.active i {
          color: #dc2626;
        }
        
        /* Home Link */
        .home-link {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          margin-left: 0.2rem;
        }
        
        .home-link:hover {
          background: #f1f5f9;
          border-color: #dc2626;
        }
        
        /* Logout Button */
        .logout-btn {
          background: #fef2f2;
          border: 1px solid #fee2e2;
          padding: 0.4rem 1rem;
          border-radius: 4px;
          color: #dc2626;
          font-weight: 500;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          transition: all 0.15s ease;
          margin-left: 0.3rem;
          white-space: nowrap;
          cursor: pointer;
        }
        
        .logout-btn:hover {
          background: #dc2626;
          border-color: #dc2626;
          color: white;
        }
        
        .logout-btn:hover i {
          color: white;
        }
        
        .logout-btn i {
          color: #dc2626;
          font-size: 0.9rem;
          transition: all 0.15s ease;
        }
        
        /* Mobile Toggle */
        .navbar-toggler {
          background: transparent;
          border: 1px solid #e2e8f0;
          padding: 0.3rem 0.6rem;
          border-radius: 4px;
          color: #1e293b;
        }
        
        .navbar-toggler i {
          font-size: 1.2rem;
          color: #4b5563;
        }
        
        .navbar-toggler:focus {
          outline: none;
          box-shadow: none;
        }
        
        /* Mobile Menu */
        .nav-links-mobile {
          background: #ffffff;
          padding: 0.8rem;
          border-radius: 6px;
          margin-top: 0.5rem;
          border: 1px solid #e5e7eb;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        
        .nav-links-mobile .nav-link-admin {
          padding: 0.6rem 1rem;
          margin-bottom: 0.2rem;
          font-size: 0.9rem;
        }
        
        .nav-links-mobile .logout-btn {
          margin-left: 0;
          margin-top: 0.5rem;
          width: 100%;
          justify-content: center;
          padding: 0.6rem;
        }
        
        /* Mobile Date/Time Bar */
        .mobile-datetime {
          background: #f8fafc;
          padding: 0.4rem 1rem;
          font-size: 0.75rem;
          color: #1e293b;
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid #e5e7eb;
          font-weight: 500;
          position: fixed;
          top: 55px;
          left: 0;
          right: 0;
          z-index: 1020;
        }
        
        .mobile-datetime span {
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }
        
        .mobile-datetime i {
          color: #dc2626;
          font-size: 0.75rem;
        }
        
        /* Spacers */
        .spacer-desktop {
          height: 55px;
        }
        
        .spacer-mobile {
          height: 90px;
        }
        
        /* Responsive */
        @media (max-width: 991px) {
          .admin-navbar {
            padding: 0.3rem 1rem;
          }
          
          .admin-brand span {
            font-size: 1rem;
          }
        }
        
        @media (max-width: 768px) {
          .admin-brand span {
            display: inline;
            font-size: 0.95rem;
          }
          
          .admin-brand i {
            font-size: 1.2rem;
          }
        }
        
        @media (max-width: 480px) {
          .admin-brand span {
            font-size: 0.9rem;
          }
        }
      `}</style>

      <nav className="navbar navbar-expand-lg admin-navbar fixed-top">
        <div className="container-fluid px-3 px-lg-4">
          {/* Brand */}
          <Link to="/admin-dashboard" className="admin-brand">
            <i className="bi bi-layout-three-columns"></i>
            <span>Advait Admin</span>
          </Link>

          {/* Desktop Date/Time */}
          <div className="datetime-badge d-none d-lg-flex">
            <span><i className="bi bi-calendar3"></i> {formatDate(currentTime)}</span>
            <span><i className="bi bi-clock"></i> {formatTime(currentTime)}</span>
          </div>

          {/* Mobile Toggle */}
          <button
            className="navbar-toggler d-lg-none"
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation"
          >
            <i className={`bi bi-${isMobileMenuOpen ? 'x' : 'list'}`}></i>
          </button>

          {/* Desktop Navigation */}
          <div className="collapse navbar-collapse d-none d-lg-flex justify-content-end">
            <div className="nav-links">
              <Link 
                to="/admin-dashboard"
                className={`nav-link-admin ${isActive('/admin-dashboard') ? 'active' : ''}`}
                title="Dashboard"
              >
                <i className="bi bi-speedometer2"></i>
                Dash
              </Link>

              <Link 
                to="/admin-dashboard/add-product"
                className={`nav-link-admin ${isActive('/admin-dashboard/add-product') ? 'active' : ''}`}
                title="Add Product"
              >
                <i className="bi bi-plus-circle"></i>
                Add
              </Link>

              <Link 
                to="/admin-dashboard/sales"
                className={`nav-link-admin ${isActive('/admin-dashboard/sales') ? 'active' : ''}`}
                title="New Sale"
              >
                <i className="bi bi-cart-check"></i>
                Sale
              </Link>

              

              <Link 
                to="/admin-dashboard/sales-report"
                className={`nav-link-admin ${isActive('/admin-dashboard/sales-report') ? 'active' : ''}`}
                title="Sales Report"
              >
                <i className="bi bi-bar-chart"></i>
                Report
              </Link>

              <Link 
                to="/admin-dashboard/settings"
                className={`nav-link-admin ${isActive('/admin-dashboard/settings') ? 'active' : ''}`}
                title="Settings"
              >
                <i className="bi bi-gear"></i>
                Settings
              </Link>

              <Link 
                to="/"
                className="nav-link-admin home-link"
                target="_blank"
                title="View Website"
              >
                <i className="bi bi-eye"></i>
                Site
              </Link>

              <button
                className="logout-btn"
                onClick={handleLogout}
                title="Logout"
              >
                <i className="bi bi-box-arrow-right"></i>
                Logout
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="d-lg-none w-100">
              <div className="nav-links-mobile">
                <Link 
                  to="/admin-dashboard"
                  className={`nav-link-admin ${isActive('/admin-dashboard') ? 'active' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <i className="bi bi-speedometer2"></i>
                  Dashboard
                </Link>

                <Link 
                  to="/admin-dashboard/add-product"
                  className={`nav-link-admin ${isActive('/admin-dashboard/add-product') ? 'active' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <i className="bi bi-plus-circle"></i>
                  Add Product
                </Link>

                <Link 
                  to="/admin-dashboard/sales"
                  className={`nav-link-admin ${isActive('/admin-dashboard/sales') ? 'active' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <i className="bi bi-cart-check"></i>
                  New Sale
                </Link>

                

                <Link 
                  to="/admin-dashboard/sales-report"
                  className={`nav-link-admin ${isActive('/admin-dashboard/sales-report') ? 'active' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <i className="bi bi-bar-chart"></i>
                  Sales Report
                </Link>

                <Link 
                  to="/admin-dashboard/settings"
                  className={`nav-link-admin ${isActive('/admin-dashboard/settings') ? 'active' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <i className="bi bi-gear"></i>
                  Settings
                </Link>

                <Link 
                  to="/"
                  className="nav-link-admin home-link"
                  target="_blank"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <i className="bi bi-eye"></i>
                  View Website
                </Link>

                <button
                  className="logout-btn"
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <i className="bi bi-box-arrow-right"></i>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Date/Time */}
      <div className="mobile-datetime d-lg-none">
        <span><i className="bi bi-calendar3"></i> {formatDate(currentTime)}</span>
        <span><i className="bi bi-clock"></i> {formatTime(currentTime)}</span>
      </div>

      {/* Spacers */}
      <div className="spacer-desktop d-none d-lg-block"></div>
      <div className="spacer-mobile d-lg-none"></div>
    </>
  );
}

export default AdminNavbar;