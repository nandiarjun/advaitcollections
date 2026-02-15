import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { settingsAPI } from "../services/api";

function Contact() {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });

  const [formLoading, setFormLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [faqOpen, setFaqOpen] = useState(null);
  const [contactData, setContactData] = useState({
    businessName: "Advait Collections",
    address: {
      street: "123 Fashion Street",
      city: "Bengaluru",
      state: "Karnataka",
      country: "India",
      pincode: "560034",
      fullAddress: "123 Fashion Street, Koramangala, Bengaluru - 560034"
    },
    phoneNumbers: [
      { type: "sales", number: "+91 98765 43210", isPrimary: true },
      { type: "support", number: "+91 98765 43211", isPrimary: false }
    ],
    emails: [
      { type: "general", email: "info@advaitcollections.com", isPrimary: true },
      { type: "support", email: "support@advaitcollections.com", isPrimary: false }
    ],
    socialMedia: {
      facebook: "#",
      instagram: "#",
      twitter: "#",
      youtube: "#",
      whatsapp: "#",
      linkedin: "#"
    },
    businessHours: {
      monday: { open: "10:00", close: "20:00", closed: false },
      tuesday: { open: "10:00", close: "20:00", closed: false },
      wednesday: { open: "10:00", close: "20:00", closed: false },
      thursday: { open: "10:00", close: "20:00", closed: false },
      friday: { open: "10:00", close: "20:00", closed: false },
      saturday: { open: "10:00", close: "18:00", closed: false },
      sunday: { open: "11:00", close: "17:00", closed: true }
    }
  });

  // Fetch contact data from backend
  useEffect(() => {
    fetchContactData();
  }, []);

  const fetchContactData = async () => {
    try {
      setLoading(true);
      const response = await settingsAPI.getSettings();
      
      if (response.success) {
        const settings = response.settings;
        setContactData({
          businessName: settings.businessName || "Advait Collections",
          address: settings.address || contactData.address,
          phoneNumbers: settings.phoneNumbers || contactData.phoneNumbers,
          emails: settings.emails || contactData.emails,
          socialMedia: settings.socialMedia || contactData.socialMedia,
          businessHours: settings.businessHours || contactData.businessHours
        });
      }
    } catch (error) {
      console.error("Error fetching contact data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    
    // Simulate form submission - Replace with actual API call
    setTimeout(() => {
      alert("✅ Message Sent Successfully!\nWe'll get back to you within 24 hours.");
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
      });
      setFormLoading(false);
    }, 1500);
  };

  // FAQ data
  const faqs = [
    {
      question: "What are your store hours?",
      answer: "Our store is open Monday to Saturday. Please check our business hours above for exact timings. We remain closed on Sundays and public holidays."
    },
    {
      question: "Do you offer home delivery?",
      answer: "We currently operate as a showroom-only store. You can visit us to try and purchase items directly. No home delivery service is available at the moment."
    },
    {
      question: "Can I return or exchange items?",
      answer: "Yes, we offer returns and exchanges within 7 days of purchase with original receipt. Items must be unused with tags attached."
    },
    {
      question: "Do you have parking facility?",
      answer: "Yes, we have free parking available for our customers. There's a dedicated parking area behind the store."
    }
  ];

  // Format time for display
  const formatTime = (time) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Get primary phone and email
  const primaryPhone = contactData.phoneNumbers?.find(p => p.isPrimary) || contactData.phoneNumbers?.[0];
  const primaryEmail = contactData.emails?.find(e => e.isPrimary) || contactData.emails?.[0];

  // Add custom CSS
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes slideInLeft {
        from {
          opacity: 0;
          transform: translateX(-30px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes slideInRight {
        from {
          opacity: 0;
          transform: translateX(30px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }

      @keyframes rotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      @keyframes float {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
        100% { transform: translateY(0px); }
      }

      .contact-hero {
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        padding: 100px 0;
        margin-bottom: 60px;
        position: relative;
        overflow: hidden;
      }

      .contact-hero::before {
        content: '';
        position: absolute;
        top: -50%;
        right: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(circle, rgba(255,215,0,0.1) 0%, transparent 50%);
        animation: rotate 30s linear infinite;
      }

      .contact-hero h1 {
        animation: fadeInUp 0.8s ease;
        font-family: 'Playfair Display', serif;
        font-weight: 900;
      }

      .contact-hero p {
        animation: fadeInUp 0.8s ease 0.2s both;
        color: rgba(255,255,255,0.9);
      }

      .info-card {
        background: white;
        border-radius: 20px;
        padding: 35px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        transition: all 0.3s ease;
        height: 100%;
        animation: slideInLeft 0.8s ease;
        border: 1px solid rgba(255,215,0,0.1);
        position: relative;
        overflow: hidden;
      }

      .info-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, #FFD700, #FFA500);
        transform: translateX(-100%);
        transition: transform 0.5s ease;
      }

      .info-card:hover::before {
        transform: translateX(0);
      }

      .info-card:hover {
        transform: translateY(-10px);
        box-shadow: 0 30px 60px rgba(255,215,0,0.2);
      }

      .info-icon {
        width: 70px;
        height: 70px;
        background: linear-gradient(135deg, #1a1a2e, #16213e);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 25px;
        color: #FFD700;
        font-size: 28px;
        transition: all 0.3s ease;
        border: 2px solid #FFD700;
      }

      .info-card:hover .info-icon {
        transform: rotate(360deg) scale(1.1);
        background: linear-gradient(135deg, #16213e, #1a1a2e);
        box-shadow: 0 10px 30px rgba(255,215,0,0.3);
      }

      .contact-detail-item {
        display: flex;
        align-items: flex-start;
        margin-bottom: 25px;
        padding: 15px;
        background: rgba(255,215,0,0.02);
        border-radius: 15px;
        transition: all 0.3s ease;
        border: 1px solid transparent;
      }

      .contact-detail-item:hover {
        background: rgba(255,215,0,0.05);
        border-color: rgba(255,215,0,0.2);
        transform: translateX(10px);
      }

      .contact-detail-icon {
        width: 45px;
        height: 45px;
        background: linear-gradient(135deg, #FFD700, #FFA500);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 15px;
        color: #1a1a2e;
        font-size: 20px;
        transition: all 0.3s ease;
      }

      .contact-detail-item:hover .contact-detail-icon {
        transform: rotate(10deg) scale(1.1);
      }

      .business-hours-card {
        background: linear-gradient(135deg, #1a1a2e, #16213e);
        color: white;
        padding: 25px;
        border-radius: 15px;
        margin-top: 25px;
        border: 1px solid #FFD700;
      }

      .business-hours-item {
        display: flex;
        justify-content: space-between;
        padding: 10px 0;
        border-bottom: 1px solid rgba(255,215,0,0.2);
      }

      .business-hours-item:last-child {
        border-bottom: none;
      }

      .business-hours-item .day {
        font-weight: 500;
        color: rgba(255,255,255,0.8);
      }

      .business-hours-item .time {
        font-weight: 600;
        color: #FFD700;
      }

      .business-hours-item .closed {
        color: #ff6b6b;
        font-weight: 600;
      }

      .social-links {
        display: flex;
        gap: 15px;
        margin-top: 20px;
        flex-wrap: wrap;
      }

      .social-link {
        width: 45px;
        height: 45px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 20px;
        transition: all 0.3s ease;
        text-decoration: none;
        border: 2px solid transparent;
      }

      .social-link:hover {
        transform: translateY(-5px) scale(1.1);
        border-color: #FFD700;
      }

      .social-link.facebook { background: #1877f2; }
      .social-link.instagram { background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888); }
      .social-link.whatsapp { background: #25D366; }
      .social-link.youtube { background: #FF0000; }
      .social-link.twitter { background: #1DA1F2; }
      .social-link.linkedin { background: #0077b5; }

      .contact-form-card {
        background: white;
        border-radius: 20px;
        padding: 40px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        animation: slideInRight 0.8s ease;
        border: 1px solid rgba(255,215,0,0.1);
        position: relative;
        overflow: hidden;
      }

      .contact-form-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, #FFD700, #FFA500);
      }

      .form-control-custom {
        border: 2px solid #e0e0e0;
        border-radius: 12px;
        padding: 12px 15px;
        transition: all 0.3s ease;
        font-size: 1rem;
      }

      .form-control-custom:focus {
        border-color: #FFD700;
        box-shadow: 0 0 0 4px rgba(255,215,0,0.1);
        outline: none;
      }

      .form-label-custom {
        font-weight: 600;
        margin-bottom: 8px;
        color: #1a1a2e;
        font-size: 0.95rem;
      }

      .submit-btn {
        background: linear-gradient(135deg, #1a1a2e, #16213e);
        color: white;
        border: none;
        border-radius: 12px;
        padding: 15px 30px;
        font-weight: 600;
        font-size: 1.1rem;
        transition: all 0.3s ease;
        width: 100%;
        position: relative;
        overflow: hidden;
        border: 1px solid #FFD700;
      }

      .submit-btn:hover:not(:disabled) {
        transform: translateY(-3px);
        box-shadow: 0 15px 30px rgba(255,215,0,0.3);
        background: linear-gradient(135deg, #16213e, #1a1a2e);
      }

      .submit-btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }

      .submit-btn.loading {
        pointer-events: none;
      }

      .submit-btn.loading::after {
        content: '';
        position: absolute;
        width: 20px;
        height: 20px;
        top: 50%;
        left: 50%;
        margin-left: -10px;
        margin-top: -10px;
        border: 2px solid white;
        border-top-color: transparent;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      .map-container {
        border-radius: 20px;
        overflow: hidden;
        box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        margin-top: 50px;
        animation: fadeInUp 0.8s ease;
        border: 2px solid rgba(255,215,0,0.2);
      }

      .map-placeholder {
        background: linear-gradient(135deg, #1a1a2e, #16213e);
        padding: 100px;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s ease;
        color: white;
      }

      .map-placeholder:hover {
        transform: scale(1.02);
        background: linear-gradient(135deg, #16213e, #1a1a2e);
      }

      .map-placeholder i {
        font-size: 48px;
        color: #FFD700;
        margin-bottom: 15px;
        animation: float 3s ease-in-out infinite;
      }

      .faq-section {
        background: linear-gradient(135deg, #f8f9fa, #e9ecef);
        padding: 60px 0;
        border-radius: 30px;
        margin-top: 50px;
      }

      .faq-item {
        background: white;
        border-radius: 15px;
        margin-bottom: 15px;
        overflow: hidden;
        box-shadow: 0 5px 20px rgba(0,0,0,0.05);
        transition: all 0.3s ease;
        border: 1px solid rgba(255,215,0,0.1);
      }

      .faq-item:hover {
        box-shadow: 0 10px 30px rgba(255,215,0,0.1);
        border-color: #FFD700;
      }

      .faq-question {
        padding: 20px 25px;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: white;
        transition: all 0.3s ease;
      }

      .faq-question:hover {
        background: rgba(255,215,0,0.02);
      }

      .faq-question h6 {
        margin: 0;
        font-weight: 600;
        color: #1a1a2e;
        font-size: 1.1rem;
      }

      .faq-question i {
        color: #FFD700;
        transition: transform 0.3s ease;
      }

      .faq-question:hover i {
        transform: scale(1.2);
      }

      .faq-answer {
        padding: 0 25px;
        max-height: 0;
        overflow: hidden;
        transition: all 0.3s ease;
        background: #f8f9fa;
      }

      .faq-answer.open {
        padding: 20px 25px;
        max-height: 200px;
      }

      .faq-answer p {
        margin: 0;
        color: #666;
        line-height: 1.6;
      }

      .floating-social {
        position: fixed;
        bottom: 30px;
        left: 30px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        z-index: 1000;
      }

      .floating-social .social-link {
        width: 50px;
        height: 50px;
        font-size: 22px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
      }

      .loading-spinner {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 60vh;
      }

      .spinner {
        width: 50px;
        height: 50px;
        border: 3px solid #f3f3f3;
        border-top: 3px solid #FFD700;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      @media (max-width: 991px) {
        .contact-hero {
          padding: 60px 0;
        }
        
        .contact-form-card {
          padding: 30px;
        }
      }

      @media (max-width: 768px) {
        .contact-hero h1 {
          font-size: 2.5rem;
        }
        
        .info-card {
          padding: 25px;
        }
        
        .map-placeholder {
          padding: 60px 20px;
        }
        
        .floating-social {
          bottom: 15px;
          left: 15px;
        }
        
        .floating-social .social-link {
          width: 40px;
          height: 40px;
          font-size: 18px;
        }
      }

      @media (max-width: 576px) {
        .contact-hero h1 {
          font-size: 2rem;
        }
        
        .contact-detail-item {
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        
        .contact-detail-icon {
          margin-right: 0;
          margin-bottom: 10px;
        }
        
        .business-hours-item {
          flex-direction: column;
          align-items: center;
          gap: 5px;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const toggleFaq = (index) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="contact-hero text-white">
        <div className="container text-center">
          <h1 className="display-3 fw-bold mb-3">Get in Touch</h1>
          <p className="lead mb-0">We'd love to hear from you. Let us know how we can help.</p>
        </div>
      </section>

      <div className="container mb-5">
        <div className="row g-4">
          {/* Contact Info Section */}
          <div className="col-lg-5">
            <div className="info-card">
              <div className="info-icon">
                <i className="bi bi-geo-alt-fill"></i>
              </div>
              <h3 className="fw-bold mb-4" style={{ color: '#1a1a2e' }}>Visit Our Store</h3>
              
              {/* Address */}
              <div className="contact-detail-item">
                <div className="contact-detail-icon">
                  <i className="bi bi-geo-alt"></i>
                </div>
                <div>
                  <h6 className="fw-bold mb-1">Address</h6>
                  <p className="text-muted mb-0">
                    {contactData.address?.fullAddress || 
                     `${contactData.address?.street || '123 Fashion Street'}, 
                      ${contactData.address?.city || 'Bengaluru'}, 
                      ${contactData.address?.state || 'Karnataka'} - 
                      ${contactData.address?.pincode || '560034'}`
                    }
                  </p>
                </div>
              </div>

              {/* Phone Numbers */}
              <div className="contact-detail-item">
                <div className="contact-detail-icon">
                  <i className="bi bi-telephone"></i>
                </div>
                <div>
                  <h6 className="fw-bold mb-1">Phone Numbers</h6>
                  {contactData.phoneNumbers?.map((phone, index) => (
                    <p key={index} className="text-muted mb-1">
                      <strong className="text-capitalize">{phone.type}:</strong> {phone.number}
                      {phone.isPrimary && <span className="badge bg-warning ms-2">Primary</span>}
                    </p>
                  ))}
                </div>
              </div>

              {/* Emails */}
              <div className="contact-detail-item">
                <div className="contact-detail-icon">
                  <i className="bi bi-envelope"></i>
                </div>
                <div>
                  <h6 className="fw-bold mb-1">Email Addresses</h6>
                  {contactData.emails?.map((email, index) => (
                    <p key={index} className="text-muted mb-1">
                      <strong className="text-capitalize">{email.type}:</strong> {email.email}
                      {email.isPrimary && <span className="badge bg-warning ms-2">Primary</span>}
                    </p>
                  ))}
                </div>
              </div>

              {/* Business Hours */}
              <div className="business-hours-card">
                <h5 className="fw-bold mb-3 d-flex align-items-center">
                  <i className="bi bi-clock me-2" style={{ color: '#FFD700' }}></i>
                  Business Hours
                </h5>
                {Object.entries(contactData.businessHours || {}).map(([day, hours]) => (
                  <div className="business-hours-item" key={day}>
                    <span className="day text-capitalize">{day}</span>
                    {hours.closed ? (
                      <span className="closed">Closed</span>
                    ) : (
                      <span className="time">
                        {formatTime(hours.open)} - {formatTime(hours.close)}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Social Media Links */}
              <div className="mt-4">
                <h6 className="fw-bold mb-3">Follow Us</h6>
                <div className="social-links">
                  {contactData.socialMedia?.facebook && (
                    <a href={contactData.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="social-link facebook">
                      <i className="bi bi-facebook"></i>
                    </a>
                  )}
                  {contactData.socialMedia?.instagram && (
                    <a href={contactData.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="social-link instagram">
                      <i className="bi bi-instagram"></i>
                    </a>
                  )}
                  {contactData.socialMedia?.whatsapp && (
                    <a href={contactData.socialMedia.whatsapp} target="_blank" rel="noopener noreferrer" className="social-link whatsapp">
                      <i className="bi bi-whatsapp"></i>
                    </a>
                  )}
                  {contactData.socialMedia?.youtube && (
                    <a href={contactData.socialMedia.youtube} target="_blank" rel="noopener noreferrer" className="social-link youtube">
                      <i className="bi bi-youtube"></i>
                    </a>
                  )}
                  {contactData.socialMedia?.twitter && (
                    <a href={contactData.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="social-link twitter">
                      <i className="bi bi-twitter-x"></i>
                    </a>
                  )}
                  {contactData.socialMedia?.linkedin && (
                    <a href={contactData.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="social-link linkedin">
                      <i className="bi bi-linkedin"></i>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form Section */}
          <div className="col-lg-7">
            <div className="contact-form-card">
              <h3 className="fw-bold mb-4" style={{ color: '#1a1a2e' }}>
                <i className="bi bi-chat-dots me-2" style={{ color: '#FFD700' }}></i>
                Send Us a Message
              </h3>
              <p className="text-muted mb-4">
                Fill out the form below and we'll get back to you within 24 hours.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label-custom">Your Name *</label>
                    <input
                      type="text"
                      className="form-control form-control-custom"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label-custom">Your Email *</label>
                    <input
                      type="email"
                      className="form-control form-control-custom"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label-custom">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control form-control-custom"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder={primaryPhone?.number || "+91 98765 43210"}
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label-custom">Subject *</label>
                    <input
                      type="text"
                      className="form-control form-control-custom"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Inquiry about products"
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label-custom">Your Message *</label>
                  <textarea
                    className="form-control form-control-custom"
                    rows="5"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us how we can help you..."
                    required
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className={`submit-btn ${formLoading ? 'loading' : ''}`}
                  disabled={formLoading}
                >
                  {formLoading ? 'Sending...' : (
                    <>
                      <i className="bi bi-send me-2"></i>
                      Send Message
                    </>
                  )}
                </button>

                <p className="text-muted small mt-3 text-center">
                  <i className="bi bi-shield-check me-1" style={{ color: '#FFD700' }}></i>
                  Your information is safe with us. We'll never share your details.
                </p>
              </form>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="map-container">
          {!showMap ? (
            <div className="map-placeholder" onClick={() => setShowMap(true)}>
              <i className="bi bi-map"></i>
              <h4 className="mb-2">Click to Load Map</h4>
              <p className="mb-0 opacity-75">View our store location on Google Maps</p>
            </div>
          ) : (
            <iframe
              src={`https://www.google.com/maps?q=${encodeURIComponent(
                contactData.address?.fullAddress || 'Bengaluru, Karnataka'
              )}&output=embed`}
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              title="Store Location"
            ></iframe>
          )}
        </div>

        {/* FAQ Section */}
        <div className="faq-section">
          <div className="container">
            <h2 className="fw-bold text-center mb-5" style={{ color: '#1a1a2e', fontSize: '2.5rem' }}>
              Frequently Asked Questions
            </h2>
            <div className="row justify-content-center">
              <div className="col-lg-8">
                {faqs.map((faq, index) => (
                  <div className="faq-item" key={index}>
                    <div 
                      className="faq-question"
                      onClick={() => toggleFaq(index)}
                    >
                      <h6>{faq.question}</h6>
                      <i className={`bi ${faqOpen === index ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                    </div>
                    <div className={`faq-answer ${faqOpen === index ? 'open' : ''}`}>
                      <p>{faq.answer}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Social Media Icons */}
      <div className="floating-social">
        {contactData.socialMedia?.whatsapp && (
          <a href={contactData.socialMedia.whatsapp} target="_blank" rel="noopener noreferrer" className="social-link whatsapp">
            <i className="bi bi-whatsapp"></i>
          </a>
        )}
        {contactData.socialMedia?.instagram && (
          <a href={contactData.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="social-link instagram">
            <i className="bi bi-instagram"></i>
          </a>
        )}
        {contactData.socialMedia?.facebook && (
          <a href={contactData.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="social-link facebook">
            <i className="bi bi-facebook"></i>
          </a>
        )}
      </div>
    </div>
  );
}

export default Contact;