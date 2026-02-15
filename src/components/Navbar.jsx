import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { settingsAPI } from "../services/api";

function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [navbarData, setNavbarData] = useState({
    businessName: "Advait Collections",
    logo: { url: "", publicId: "" },
    phoneNumbers: [
      { type: "office", number: "+91 9876543210", isPrimary: true }
    ],
    socialMedia: {
      facebook: "",
      instagram: "",
      twitter: "",
      youtube: "",
      whatsapp: "",
      linkedin: "",
      pinterest: ""
    }
  });

  // Fetch navbar data from backend
  useEffect(() => {
    fetchNavbarData();
  }, []);

  const fetchNavbarData = async () => {
    try {
      const response = await settingsAPI.getSettings();
      if (response.success) {
        const settings = response.settings;
        setNavbarData({
          businessName: settings.businessName || "Advait Collections",
          logo: settings.logo || { url: "", publicId: "" },
          phoneNumbers: settings.phoneNumbers?.length > 0 ? settings.phoneNumbers : navbarData.phoneNumbers,
          socialMedia: {
            ...navbarData.socialMedia,
            ...settings.socialMedia
          }
        });
      }
    } catch (error) {
      console.error("Error fetching navbar data:", error);
    }
  };

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Get primary phone
  const primaryPhone = navbarData.phoneNumbers?.find(p => p.isPrimary) || navbarData.phoneNumbers?.[0];

  const isActive = (path) => location.pathname === path;

  // Split business name for display
  const nameParts = navbarData.businessName.split(' ');
  const firstName = nameParts[0]?.toUpperCase() || "ADVAIT";
  const lastName = nameParts.slice(1).join(' ')?.toUpperCase() || "COLLECTIONS";

  return (
    <>
      <style jsx="true">{`
        /* Navbar - Light Grey */
        .navbar-advait {
          background: #f0f0f0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          box-shadow: 0 2px 10px rgba(0,0,0,0.03);
          padding: 0.5rem 0;
          border-bottom: 1px solid #e0e0e0;
        }

        .navbar-advait.scrolled {
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        }

        /* Brand Styles - Logo + Name Together */
        .brand-advait {
          display: flex;
          align-items: center;
          text-decoration: none;
          gap: 12px;
        }

        .brand-logo-img {
          height: 45px;
          width: auto;
          border-radius: 6px;
        }

        .brand-text-container {
          display: flex;
          flex-direction: column;
          line-height: 1.2;
        }

        .brand-advait-main {
          font-size: 1.6rem;
          font-weight: 800;
          color: #1e293b;
          letter-spacing: -0.5px;
          text-transform: uppercase;
          line-height: 1;
        }

        .brand-advait-main span {
          color: #2563eb;
        }

        .brand-advait-sub {
          font-size: 0.8rem;
          font-weight: 700;
          color: #4b5563;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-top: 2px;
        }

        /* Desktop Navigation */
        .nav-links-desktop {
          display: flex;
          align-items: center;
          gap: 0.2rem;
          margin-left: 1.5rem;
        }

        .nav-link-advait {
          padding: 0.5rem 1rem;
          color: #4b5563;
          text-decoration: none;
          font-weight: 500;
          font-size: 0.95rem;
          border-radius: 6px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .nav-link-advait:hover {
          background: #e5e5e5;
          color: #2563eb;
        }

        .nav-link-advait.active {
          background: #e0e0e0;
          color: #2563eb;
          font-weight: 600;
        }

        .nav-link-advait i {
          font-size: 1rem;
        }

        /* Contact Info */
        .contact-info-advait {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          margin-left: 0.8rem;
          padding-left: 0.8rem;
          border-left: 1px solid #d0d0d0;
        }

        .phone-link-advait {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #1e293b;
          text-decoration: none;
          font-weight: 500;
          font-size: 0.9rem;
          padding: 0.4rem 0.8rem;
          border-radius: 6px;
          transition: all 0.2s ease;
          background: #e5e5e5;
        }

        .phone-link-advait:hover {
          background: #d0d0d0;
          color: #2563eb;
        }

        .phone-link-advait i {
          color: #2563eb;
        }

        /* Social Links */
        .social-links-advait {
          display: flex;
          align-items: center;
          gap: 0.2rem;
        }

        .social-link-advait {
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #4b5563;
          text-decoration: none;
          border-radius: 6px;
          transition: all 0.2s ease;
          background: #e5e5e5;
          font-size: 0.95rem;
        }

        .social-link-advait:hover {
          background: #2563eb;
          color: white;
          transform: translateY(-2px);
        }

        /* Individual social media hover colors */
        .social-link-advait.facebook:hover { background: #1877f2; }
        .social-link-advait.instagram:hover { background: #e4405f; }
        .social-link-advait.twitter:hover { background: #1da1f2; }
        .social-link-advait.youtube:hover { background: #ff0000; }
        .social-link-advait.whatsapp:hover { background: #25d366; }
        .social-link-advait.linkedin:hover { background: #0077b5; }
        .social-link-advait.pinterest:hover { background: #bd081c; }

        /* Admin Button */
        .admin-btn-advait {
          background: #1e293b;
          border: none;
          color: white !important;
          font-weight: 500;
          padding: 0.5rem 1.2rem;
          border-radius: 6px;
          margin-left: 0.8rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s ease;
          text-decoration: none;
          font-size: 0.9rem;
        }

        .admin-btn-advait:hover {
          background: #2563eb;
          transform: translateY(-1px);
          box-shadow: 0 4px 10px rgba(37,99,235,0.2);
        }

        /* Mobile Toggle */
        .navbar-toggler-advait {
          background: #e5e5e5;
          border: 1px solid #d0d0d0;
          border-radius: 6px;
          padding: 0.5rem 0.8rem;
          color: #1e293b;
        }

        .navbar-toggler-advait i {
          font-size: 1.2rem;
        }

        /* Mobile Menu */
        .mobile-menu-advait {
          background: #f5f5f5;
          padding: 1rem;
          border-radius: 8px;
          margin-top: 0.5rem;
          border: 1px solid #e0e0e0;
          box-shadow: 0 5px 15px rgba(0,0,0,0.05);
        }

        .nav-link-mobile-advait {
          padding: 0.7rem 1rem;
          color: #4b5563;
          text-decoration: none;
          border-radius: 6px;
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.3rem;
          transition: all 0.2s ease;
        }

        .nav-link-mobile-advait:hover {
          background: #e5e5e5;
          color: #2563eb;
        }

        .nav-link-mobile-advait.active {
          background: #e0e0e0;
          color: #2563eb;
          font-weight: 600;
        }

        .nav-link-mobile-advait i {
          width: 20px;
          color: #2563eb;
        }

        .mobile-contact-advait {
          margin-top: 0.8rem;
          padding-top: 0.8rem;
          border-top: 1px solid #e0e0e0;
        }

        .mobile-phone-advait {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          padding: 0.8rem;
          background: #e5e5e5;
          border-radius: 6px;
          color: #1e293b;
          text-decoration: none;
          margin-bottom: 0.8rem;
        }

        .mobile-phone-advait i {
          color: #2563eb;
        }

        .mobile-social-advait {
          display: flex;
          gap: 0.5rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .mobile-social-advait .social-link-advait {
          width: 38px;
          height: 38px;
        }

        .admin-btn-mobile-advait {
          background: #1e293b;
          color: white;
          padding: 0.7rem;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          text-decoration: none;
          margin-top: 0.8rem;
          font-weight: 500;
        }

        .admin-btn-mobile-advait:hover {
          background: #2563eb;
        }

        /* Body Padding */
        body {
          padding-top: 70px;
        }

        @media (max-width: 768px) {
          body {
            padding-top: 65px;
          }
          
          .brand-advait-main {
            font-size: 1.3rem;
          }
          
          .brand-advait-sub {
            font-size: 0.7rem;
            letter-spacing: 1.5px;
          }
          
          .brand-logo-img {
            height: 35px;
          }
        }

        @media (max-width: 576px) {
          .brand-advait {
            gap: 6px;
          }
        }
      `}</style>

      <nav className={`navbar navbar-expand-lg fixed-top navbar-advait ${scrolled ? 'scrolled' : ''}`}>
        <div className="container">
          {/* Brand with Logo AND Name Together */}
          <Link className="brand-advait" to="/" onClick={() => setIsMobileMenuOpen(false)}>
            {/* Logo - Always show if exists */}
            {navbarData.logo?.url && (
              <img src={navbarData.logo.url} alt={navbarData.businessName} className="brand-logo-img" />
            )}
            
            {/* Business Name - Always show */}
            <div className="brand-text-container">
              <div className="brand-advait-main">
                {firstName}
              </div>
              <div className="brand-advait-sub">
                {lastName}
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="d-none d-lg-flex align-items-center flex-grow-1 justify-content-end">
            <div className="nav-links-desktop">
              <Link to="/" className={`nav-link-advait ${isActive('/') ? 'active' : ''}`}>
                <i className="bi bi-house-door"></i>
                Home
              </Link>
              <Link to="/about" className={`nav-link-advait ${isActive('/about') ? 'active' : ''}`}>
                <i className="bi bi-info-circle"></i>
                About
              </Link>
              <Link to="/contact" className={`nav-link-advait ${isActive('/contact') ? 'active' : ''}`}>
                <i className="bi bi-envelope"></i>
                Contact
              </Link>
              <Link to="/products" className={`nav-link-advait ${isActive('/products') ? 'active' : ''}`}>
                <i className="bi bi-grid"></i>
                Products
              </Link>
            </div>

            {/* Contact Info */}
            <div className="contact-info-advait">
              {primaryPhone && (
                <a href={`tel:${primaryPhone.number}`} className="phone-link-advait">
                  <i className="bi bi-telephone"></i>
                  {primaryPhone.number}
                </a>
              )}

              {/* Social Links */}
              <div className="social-links-advait">
                {navbarData.socialMedia?.facebook && navbarData.socialMedia.facebook !== "#" && (
                  <a href={navbarData.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="social-link-advait facebook">
                    <i className="bi bi-facebook"></i>
                  </a>
                )}
                {navbarData.socialMedia?.instagram && navbarData.socialMedia.instagram !== "#" && (
                  <a href={navbarData.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="social-link-advait instagram">
                    <i className="bi bi-instagram"></i>
                  </a>
                )}
                {navbarData.socialMedia?.twitter && navbarData.socialMedia.twitter !== "#" && (
                  <a href={navbarData.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="social-link-advait twitter">
                    <i className="bi bi-twitter-x"></i>
                  </a>
                )}
                {navbarData.socialMedia?.youtube && navbarData.socialMedia.youtube !== "#" && (
                  <a href={navbarData.socialMedia.youtube} target="_blank" rel="noopener noreferrer" className="social-link-advait youtube">
                    <i className="bi bi-youtube"></i>
                  </a>
                )}
                {navbarData.socialMedia?.whatsapp && navbarData.socialMedia.whatsapp !== "#" && (
                  <a href={navbarData.socialMedia.whatsapp} target="_blank" rel="noopener noreferrer" className="social-link-advait whatsapp">
                    <i className="bi bi-whatsapp"></i>
                  </a>
                )}
                {navbarData.socialMedia?.linkedin && navbarData.socialMedia.linkedin !== "#" && (
                  <a href={navbarData.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="social-link-advait linkedin">
                    <i className="bi bi-linkedin"></i>
                  </a>
                )}
                {navbarData.socialMedia?.pinterest && navbarData.socialMedia.pinterest !== "#" && (
                  <a href={navbarData.socialMedia.pinterest} target="_blank" rel="noopener noreferrer" className="social-link-advait pinterest">
                    <i className="bi bi-pinterest"></i>
                  </a>
                )}
              </div>
            </div>

            {/* Admin Button */}
            <Link to="/admin-login" className="admin-btn-advait">
              <i className="bi bi-shield-lock"></i>
              Admin
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            className="navbar-toggler-advait d-lg-none"
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <i className={`bi bi-${isMobileMenuOpen ? 'x' : 'list'}`}></i>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="container d-lg-none">
            <div className="mobile-menu-advait">
              <Link to="/" className={`nav-link-mobile-advait ${isActive('/') ? 'active' : ''}`}>
                <i className="bi bi-house-door"></i>
                Home
              </Link>
              <Link to="/about" className={`nav-link-mobile-advait ${isActive('/about') ? 'active' : ''}`}>
                <i className="bi bi-info-circle"></i>
                About
              </Link>
              <Link to="/contact" className={`nav-link-mobile-advait ${isActive('/contact') ? 'active' : ''}`}>
                <i className="bi bi-envelope"></i>
                Contact
              </Link>
              <Link to="/products" className={`nav-link-mobile-advait ${isActive('/products') ? 'active' : ''}`}>
                <i className="bi bi-grid"></i>
                Products
              </Link>

              <div className="mobile-contact-advait">
                {primaryPhone && (
                  <a href={`tel:${primaryPhone.number}`} className="mobile-phone-advait">
                    <i className="bi bi-telephone"></i>
                    {primaryPhone.number}
                  </a>
                )}

                <div className="mobile-social-advait">
                  {navbarData.socialMedia?.facebook && navbarData.socialMedia.facebook !== "#" && (
                    <a href={navbarData.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="social-link-advait facebook">
                      <i className="bi bi-facebook"></i>
                    </a>
                  )}
                  {navbarData.socialMedia?.instagram && navbarData.socialMedia.instagram !== "#" && (
                    <a href={navbarData.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="social-link-advait instagram">
                      <i className="bi bi-instagram"></i>
                    </a>
                  )}
                  {navbarData.socialMedia?.twitter && navbarData.socialMedia.twitter !== "#" && (
                    <a href={navbarData.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="social-link-advait twitter">
                      <i className="bi bi-twitter-x"></i>
                    </a>
                  )}
                  {navbarData.socialMedia?.youtube && navbarData.socialMedia.youtube !== "#" && (
                    <a href={navbarData.socialMedia.youtube} target="_blank" rel="noopener noreferrer" className="social-link-advait youtube">
                      <i className="bi bi-youtube"></i>
                    </a>
                  )}
                  {navbarData.socialMedia?.whatsapp && navbarData.socialMedia.whatsapp !== "#" && (
                    <a href={navbarData.socialMedia.whatsapp} target="_blank" rel="noopener noreferrer" className="social-link-advait whatsapp">
                      <i className="bi bi-whatsapp"></i>
                    </a>
                  )}
                  {navbarData.socialMedia?.linkedin && navbarData.socialMedia.linkedin !== "#" && (
                    <a href={navbarData.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="social-link-advait linkedin">
                      <i className="bi bi-linkedin"></i>
                    </a>
                  )}
                  {navbarData.socialMedia?.pinterest && navbarData.socialMedia.pinterest !== "#" && (
                    <a href={navbarData.socialMedia.pinterest} target="_blank" rel="noopener noreferrer" className="social-link-advait pinterest">
                      <i className="bi bi-pinterest"></i>
                    </a>
                  )}
                </div>

                <Link to="/admin-login" className="admin-btn-mobile-advait">
                  <i className="bi bi-shield-lock"></i>
                  Admin Login
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

export default Navbar;