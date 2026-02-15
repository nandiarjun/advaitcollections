import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { settingsAPI } from "../services/api";

function Footer() {
  const [footerData, setFooterData] = useState({
    businessName: "Advait Collections",
    tagline: "Premium Garments & Fashion Accessories",
    description: "Advait Collection is your destination for premium sarees and fashionable dresses. We bring handpicked designs, rich fabrics, and contemporary styles that celebrate grace, tradition, and everyday elegance.",
    logo: { url: "", publicId: "" },
    favicon: { url: "", publicId: "" },
    address: {
      street: "Huduko, Jalanagar",
      city: "Vijayapura",
      state: "Karnataka",
      country: "India",
      pincode: "560034",
      fullAddress: "Advait Collections Huduko, Jalanagar, Vijayapura- 560034"
    },
    phoneNumbers: [
      { type: "mobile", number: "8152853260", isPrimary: true }
    ],
    emails: [
      { type: "general", email: "nandiarjun97@gmail.com", isPrimary: true }
    ],
    socialMedia: {
      facebook: "#",
      instagram: "#",
      twitter: "#",
      youtube: "#",
      whatsapp: "#",
      linkedin: "#",
      pinterest: "#"
    },
    footer: {
      copyright: "© {year} {businessName}. All rights reserved.",
      showNewsletter: true,
      quickLinks: [
        { title: "Home", url: "/" },
        { title: "Products", url: "/products" },
        { title: "Contact", url: "/contact" },
        { title: "About", url: "/about" }
      ],
      paymentMethods: ["visa", "mastercard", "rupay", "upi", "amex"]
    }
  });

  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  // Fetch footer data from backend
  useEffect(() => {
    fetchFooterData();
  }, []);

  const fetchFooterData = async () => {
    try {
      setLoading(true);
      const response = await settingsAPI.getSettings();
      
      if (response.success) {
        const settings = response.settings;
        setFooterData(prev => ({
          ...prev,
          businessName: settings.businessName || prev.businessName,
          tagline: settings.tagline || prev.tagline,
          description: settings.description || prev.description,
          logo: settings.logo || prev.logo,
          favicon: settings.favicon || prev.favicon,
          address: {
            ...prev.address,
            ...settings.address,
            fullAddress: settings.address?.fullAddress || 
              `${settings.address?.street || prev.address.street}, ${settings.address?.city || prev.address.city}, ${settings.address?.state || prev.address.state} - ${settings.address?.pincode || prev.address.pincode}`.trim()
          },
          phoneNumbers: settings.phoneNumbers?.length > 0 ? settings.phoneNumbers : prev.phoneNumbers,
          emails: settings.emails?.length > 0 ? settings.emails : prev.emails,
          socialMedia: {
            ...prev.socialMedia,
            ...settings.socialMedia
          },
          footer: {
            ...prev.footer,
            ...settings.footer,
            quickLinks: settings.footer?.quickLinks && settings.footer.quickLinks.length > 0 
              ? settings.footer.quickLinks 
              : prev.footer.quickLinks,
            paymentMethods: settings.footer?.paymentMethods || prev.footer.paymentMethods
          }
        }));
      }
    } catch (error) {
      console.error("Error fetching footer data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get primary contact info
  const primaryPhone = footerData.phoneNumbers?.find(p => p.isPrimary) || footerData.phoneNumbers?.[0];
  const primaryEmail = footerData.emails?.find(e => e.isPrimary) || footerData.emails?.[0];

  // Format copyright text
  const getCopyrightText = () => {
    let text = footerData.footer.copyright || "© {year} {businessName}. All rights reserved.";
    text = text.replace("{year}", currentYear);
    text = text.replace("{businessName}", footerData.businessName);
    return text;
  };

  // Get full address for display
  const getFullAddress = () => {
    if (footerData.address?.fullAddress) {
      return footerData.address.fullAddress;
    }
    const parts = [
      footerData.address?.street,
      footerData.address?.city,
      footerData.address?.state,
      footerData.address?.pincode
    ].filter(Boolean);
    return parts.join(', ') || 'Karnataka, India';
  };

  // Split business name for display
  const nameParts = footerData.businessName.split(' ');
  const firstName = nameParts[0]?.toUpperCase() || "ADVAIT";
  const lastName = nameParts.slice(1).join(' ')?.toUpperCase() || "COLLECTIONS";

  // Quick Links - Always ensure we have the 4 links
  const quickLinks = [
    { title: "Home", url: "/" },
    { title: "Products", url: "/products" },
    { title: "Contact", url: "/contact" },
    { title: "About", url: "/about" }
  ];

  // Add custom CSS
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      /* Footer - Dark Grey with White Fonts */
      .aft-footer {
        background: #0c0f15;
        color: #ffffff;
        border-top: 1px solid #2a2e35;
        padding: 3rem 0 1.5rem;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      .aft-container {
        max-width: 1320px;
        margin: 0 auto;
        padding: 0 1rem;
      }

      /* Brand Section - All White */
      .aft-brand {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1.2rem;
      }

      .aft-logo-img {
        height: 50px;
        width: auto;
        border-radius: 6px;
      }

      .aft-brand-text {
        display: flex;
        flex-direction: column;
      }

      .aft-brand-main {
        font-size: 1.6rem;
        font-weight: 800;
        color: #ffffff;
        letter-spacing: -0.5px;
        text-transform: uppercase;
        line-height: 1.1;
      }

      .aft-brand-sub {
        font-size: 0.8rem;
        font-weight: 600;
        color: #ffffff;
        letter-spacing: 2px;
        text-transform: uppercase;
        margin-top: 2px;
        opacity: 0.9;
      }

      .aft-tagline {
        color: #ffffff;
        font-size: 0.9rem;
        margin-bottom: 0.8rem;
        opacity: 0.9;
      }

      .aft-description {
        color: #ffffff;
        font-size: 0.85rem;
        margin-bottom: 1.5rem;
        line-height: 1.6;
        opacity: 0.9;
      }

      /* Headings - All White */
      .aft-heading {
        font-size: 1rem;
        font-weight: 600;
        color: #ffffff;
        margin-bottom: 1.2rem;
        position: relative;
        padding-bottom: 0.5rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .aft-heading::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 30px;
        height: 2px;
        background: #3b82f6;
      }

      /* Quick Links - Single Column */
      .aft-quick-links {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .aft-quick-links li {
        margin-bottom: 0.7rem;
      }

      .aft-quick-links a {
        color: #ffffff;
        text-decoration: none;
        transition: all 0.2s ease;
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.9rem;
        opacity: 0.9;
      }

      .aft-quick-links a:hover {
        color: #3b82f6;
        transform: translateX(4px);
        opacity: 1;
      }

      .aft-quick-links a i {
        font-size: 0.75rem;
        opacity: 0;
        transition: all 0.2s ease;
        color: #3b82f6;
      }

      .aft-quick-links a:hover i {
        opacity: 1;
        transform: translateX(3px);
      }

      /* Contact Info - All White */
      .aft-contact-item {
        display: flex;
        align-items: flex-start;
        gap: 0.8rem;
        margin-bottom: 1rem;
        color: #ffffff;
        font-size: 0.85rem;
        opacity: 0.9;
      }

      .aft-contact-item:hover {
        opacity: 1;
      }

      .aft-contact-item i {
        font-size: 0.95rem;
        color: #3b82f6;
        min-width: 20px;
        margin-top: 0.2rem;
      }

      .aft-contact-label {
        font-size: 0.65rem;
        color: #ffffff;
        display: block;
        margin-bottom: 0.1rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        opacity: 0.7;
      }

      .aft-contact-value {
        color: #ffffff;
        line-height: 1.4;
      }

      .aft-contact-link {
        color: #ffffff;
        text-decoration: none;
      }

      .aft-contact-link:hover {
        color: #3b82f6;
      }

      /* Social Links */
      .aft-social {
        display: flex;
        gap: 0.5rem;
        margin-top: 1rem;
        flex-wrap: wrap;
      }

      .aft-social-icon {
        width: 36px;
        height: 36px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        font-size: 1rem;
        transition: all 0.2s ease;
        text-decoration: none;
        background: #1a1e26;
        border: 1px solid #2a2f38;
      }

      .aft-social-icon:hover {
        transform: translateY(-2px);
        color: white;
        border-color: transparent;
      }

      .aft-social-icon.facebook:hover { background: #1877f2; }
      .aft-social-icon.instagram:hover { background: #e4405f; }
      .aft-social-icon.twitter:hover { background: #1da1f2; }
      .aft-social-icon.youtube:hover { background: #ff0000; }
      .aft-social-icon.whatsapp:hover { background: #25d366; }
      .aft-social-icon.linkedin:hover { background: #0077b5; }
      .aft-social-icon.pinterest:hover { background: #bd081c; }

      /* Payment Methods */
      .aft-payment {
        margin-top: 1rem;
      }

      .aft-payment-label {
        font-size: 0.7rem;
        color: #ffffff;
        display: block;
        margin-bottom: 0.5rem;
        text-transform: uppercase;
        opacity: 0.7;
      }

      .aft-payment-icons {
        display: flex;
        gap: 0.8rem;
        flex-wrap: wrap;
      }

      .aft-payment-icon {
        font-size: 1.5rem;
        color: #ffffff;
        transition: all 0.2s ease;
        opacity: 0.7;
      }

      .aft-payment-icon:hover {
        color: #3b82f6;
        transform: scale(1.1);
        opacity: 1;
      }

      /* Newsletter */
      .aft-newsletter {
        background: #1a1e26;
        padding: 1.2rem;
        border-radius: 8px;
        border: 1px solid #2a2f38;
      }

      .aft-newsletter p {
        color: #ffffff;
        font-size: 0.8rem;
        margin-bottom: 0.8rem;
        opacity: 0.9;
      }

      .aft-newsletter-input {
        background: #0c0f15;
        border: 1px solid #2a2f38;
        border-radius: 6px;
        padding: 0.6rem 0.8rem;
        color: white;
        width: 100%;
        font-size: 0.85rem;
      }

      .aft-newsletter-input:focus {
        outline: none;
        border-color: #3b82f6;
      }

      .aft-newsletter-btn {
        background: #3b82f6;
        border: none;
        border-radius: 6px;
        padding: 0.6rem;
        color: white;
        font-size: 0.85rem;
        font-weight: 500;
        cursor: pointer;
        width: 100%;
        margin-top: 0.6rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.4rem;
        transition: all 0.2s ease;
      }

      .aft-newsletter-btn:hover {
        background: #2563eb;
      }

      .aft-newsletter-note {
        color: #ffffff;
        font-size: 0.7rem;
        margin-top: 0.6rem;
        display: flex;
        align-items: center;
        gap: 0.4rem;
        opacity: 0.7;
      }

      /* Divider */
      .aft-divider {
        border: none;
        border-top: 1px solid #2a2f38;
        margin: 2rem 0 1.2rem;
      }

      /* Copyright - All White */
      .aft-copyright {
        text-align: center;
      }

      .aft-copyright-text {
        color: #ffffff;
        font-size: 0.8rem;
        margin-bottom: 0.8rem;
        opacity: 0.8;
      }

      .aft-bottom-links {
        display: flex;
        justify-content: center;
        gap: 1.5rem;
        margin: 0.8rem 0;
        flex-wrap: wrap;
      }

      .aft-bottom-links a {
        color: #ffffff;
        text-decoration: none;
        font-size: 0.75rem;
        transition: color 0.2s ease;
        text-transform: uppercase;
        opacity: 0.7;
      }

      .aft-bottom-links a:hover {
        color: #3b82f6;
        opacity: 1;
      }

      .aft-developer {
        color: #ffffff;
        font-size: 0.75rem;
        opacity: 0.7;
      }

      .aft-developer a {
        color: #3b82f6;
        text-decoration: none;
      }

      .aft-developer a:hover {
        text-decoration: underline;
      }

      .aft-developer i {
        color: #ef4444;
        margin: 0 0.2rem;
      }

      /* Back to Top */
      .aft-back-top {
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 42px;
        height: 42px;
        background: #3b82f6;
        color: white;
        border: none;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 1000;
      }

      .aft-back-top:hover {
        background: #2563eb;
        transform: translateY(-3px);
      }

      .aft-back-top.hidden {
        display: none;
      }

      /* Responsive */
      @media (max-width: 992px) {
        .aft-footer {
          padding: 2.5rem 0 1.2rem;
        }
      }

      @media (max-width: 768px) {
        .aft-heading {
          margin-top: 1rem;
        }
        
        .aft-social {
          justify-content: flex-start;
        }
        
        .aft-payment-icons {
          justify-content: flex-start;
        }
        
        .aft-bottom-links {
          gap: 1rem;
        }
      }

      @media (max-width: 576px) {
        .aft-brand {
          flex-direction: column;
          text-align: center;
          gap: 0.5rem;
        }
        
        .aft-brand-text {
          align-items: center;
        }
        
        .aft-social {
          justify-content: center;
        }
        
        .aft-payment-icons {
          justify-content: center;
        }
        
        .aft-quick-links {
          text-align: center;
        }
        
        .aft-quick-links a {
          justify-content: center;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) {
    return (
      <footer className="aft-footer">
        <div className="aft-container text-center py-4">
          <div className="spinner-border text-primary" style={{ width: '1.8rem', height: '1.8rem' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <>
      <footer className="aft-footer">
        <div className="aft-container">
          <div className="row g-4">
            {/* Brand Column */}
            <div className="col-lg-4 col-md-6">
              <div className="aft-brand">
                {footerData.logo?.url ? (
                  <img 
                    src={footerData.logo.url} 
                    alt={footerData.businessName}
                    className="aft-logo-img"
                  />
                ) : (
                  <div className="aft-logo-placeholder" style={{width: '50px', height: '50px', background: '#1a1e26', borderRadius: '6px'}}></div>
                )}
                <div className="aft-brand-text">
                  <div className="aft-brand-main">
                    {firstName}
                  </div>
                  <div className="aft-brand-sub">
                    {lastName}
                  </div>
                </div>
              </div>
              <div className="aft-tagline">{footerData.tagline}</div>
              <p className="aft-description">{footerData.description}</p>
              
              {/* Social Links */}
              <div className="aft-social">
                {footerData.socialMedia?.facebook && footerData.socialMedia.facebook !== "#" && (
                  <a href={footerData.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="aft-social-icon facebook">
                    <i className="bi bi-facebook"></i>
                  </a>
                )}
                {footerData.socialMedia?.instagram && footerData.socialMedia.instagram !== "#" && (
                  <a href={footerData.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="aft-social-icon instagram">
                    <i className="bi bi-instagram"></i>
                  </a>
                )}
                {footerData.socialMedia?.twitter && footerData.socialMedia.twitter !== "#" && (
                  <a href={footerData.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="aft-social-icon twitter">
                    <i className="bi bi-twitter-x"></i>
                  </a>
                )}
                {footerData.socialMedia?.youtube && footerData.socialMedia.youtube !== "#" && (
                  <a href={footerData.socialMedia.youtube} target="_blank" rel="noopener noreferrer" className="aft-social-icon youtube">
                    <i className="bi bi-youtube"></i>
                  </a>
                )}
                {footerData.socialMedia?.whatsapp && footerData.socialMedia.whatsapp !== "#" && (
                  <a href={footerData.socialMedia.whatsapp} target="_blank" rel="noopener noreferrer" className="aft-social-icon whatsapp">
                    <i className="bi bi-whatsapp"></i>
                  </a>
                )}
                {footerData.socialMedia?.linkedin && footerData.socialMedia.linkedin !== "#" && (
                  <a href={footerData.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="aft-social-icon linkedin">
                    <i className="bi bi-linkedin"></i>
                  </a>
                )}
                {footerData.socialMedia?.pinterest && footerData.socialMedia.pinterest !== "#" && (
                  <a href={footerData.socialMedia.pinterest} target="_blank" rel="noopener noreferrer" className="aft-social-icon pinterest">
                    <i className="bi bi-pinterest"></i>
                  </a>
                )}
              </div>
            </div>

            {/* Quick Links - Single Column (Home, Products, Contact, About) */}
            <div className="col-lg-2 col-md-6">
              <h5 className="aft-heading">Quick Links</h5>
              <ul className="aft-quick-links">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <Link to={link.url}>
                      {link.title}
                      <i className="bi bi-arrow-right"></i>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Column */}
            <div className="col-lg-3 col-md-6">
              <h5 className="aft-heading">Contact Us</h5>
              
              {/* Address */}
              <div className="aft-contact-item">
                <i className="bi bi-geo-alt"></i>
                <div>
                  <span className="aft-contact-label">Address</span>
                  <span className="aft-contact-value">{getFullAddress()}</span>
                </div>
              </div>
              
              {/* Email */}
              {primaryEmail && (
                <div className="aft-contact-item">
                  <i className="bi bi-envelope"></i>
                  <div>
                    <span className="aft-contact-label">Email</span>
                    <a href={`mailto:${primaryEmail.email}`} className="aft-contact-link">
                      {primaryEmail.email}
                    </a>
                  </div>
                </div>
              )}

              {/* Phone */}
              {primaryPhone && (
                <div className="aft-contact-item">
                  <i className="bi bi-telephone"></i>
                  <div>
                    <span className="aft-contact-label">Phone</span>
                    <a href={`tel:${primaryPhone.number}`} className="aft-contact-link">
                      {primaryPhone.number}
                    </a>
                  </div>
                </div>
              )}

              {/* Payment Methods */}
              {footerData.footer.paymentMethods && footerData.footer.paymentMethods.length > 0 && (
                <div className="aft-payment">
                  <span className="aft-payment-label">We Accept</span>
                  <div className="aft-payment-icons">
                    {footerData.footer.paymentMethods.includes('visa') && (
                      <i className="bi bi-credit-card-2-front aft-payment-icon" title="Visa"></i>
                    )}
                    {footerData.footer.paymentMethods.includes('mastercard') && (
                      <i className="bi bi-credit-card aft-payment-icon" title="Mastercard"></i>
                    )}
                    {footerData.footer.paymentMethods.includes('rupay') && (
                      <i className="bi bi-bank aft-payment-icon" title="RuPay"></i>
                    )}
                    {footerData.footer.paymentMethods.includes('upi') && (
                      <i className="bi bi-phone aft-payment-icon" title="UPI"></i>
                    )}
                    {footerData.footer.paymentMethods.includes('amex') && (
                      <i className="bi bi-credit-card-2-back aft-payment-icon" title="American Express"></i>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Newsletter */}
            {footerData.footer.showNewsletter && (
              <div className="col-lg-3 col-md-6">
                <h5 className="aft-heading">Updates</h5>
                <div className="aft-newsletter">
                  <p>Subscribe for new arrivals & offers</p>
                  <input 
                    type="email" 
                    className="aft-newsletter-input" 
                    placeholder="Your email"
                  />
                  <button className="aft-newsletter-btn">
                    <i className="bi bi-send"></i>
                    Subscribe
                  </button>
                  <div className="aft-newsletter-note">
                    <i className="bi bi-shield-check"></i>
                    No spam, unsubscribe anytime
                  </div>
                </div>
              </div>
            )}
          </div>

          <hr className="aft-divider" />

          {/* Copyright */}
          <div className="aft-copyright">
            <p className="aft-copyright-text">
              {getCopyrightText()}
            </p>
            <div className="aft-bottom-links">
              <Link to="/privacy">Privacy</Link>
              <Link to="/terms">Terms</Link>
              <Link to="/returns">Returns</Link>
              <Link to="/shipping">Shipping</Link>
              <Link to="/faq">FAQ</Link>
            </div>
            <p className="aft-developer">
              Developed with <i className="bi bi-heart-fill"></i> by{' '}
              <a href="https://nandisofttech.com" target="_blank" rel="noopener noreferrer">
                Nandi Softech Solutions
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* Back to Top Button */}
      <button 
        className={`aft-back-top ${!showBackToTop ? 'hidden' : ''}`}
        onClick={scrollToTop}
        aria-label="Back to top"
      >
        <i className="bi bi-arrow-up"></i>
      </button>
    </>
  );
}

export default Footer;