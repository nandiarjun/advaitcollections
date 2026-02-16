import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { settingsAPI } from "../services/api";
import "./Contact.css";

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

  const toggleFaq = (index) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  if (loading) {
    return (
      <div className="cnt-loading">
        <div className="cnt-spinner"></div>
      </div>
    );
  }

  return (
    <div className="cnt-page">
      {/* Hero Section */}
      <section className="cnt-hero">
        <div className="container cnt-text-center">
          <h1 className="cnt-hero-title display-3 fw-bold mb-3">Get in Touch</h1>
          <p className="cnt-hero-subtitle lead mb-0">We'd love to hear from you. Let us know how we can help.</p>
        </div>
      </section>

      <div className="container cnt-mb-5">
        <div className="cnt-row cnt-g-4">
          {/* Contact Info Section */}
          <div className="cnt-col-lg-5">
            <div className="cnt-info-card">
              <div className="cnt-info-icon">
                <i className="bi bi-geo-alt-fill"></i>
              </div>
              <h3 className="cnt-info-title">Visit Our Store</h3>
              
              {/* Address */}
              <div className="cnt-detail-item">
                <div className="cnt-detail-icon">
                  <i className="bi bi-geo-alt"></i>
                </div>
                <div>
                  <h6 className="cnt-detail-title">Address</h6>
                  <p className="cnt-detail-text">
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
              <div className="cnt-detail-item">
                <div className="cnt-detail-icon">
                  <i className="bi bi-telephone"></i>
                </div>
                <div>
                  <h6 className="cnt-detail-title">Phone Numbers</h6>
                  {contactData.phoneNumbers?.map((phone, index) => (
                    <p key={index} className="cnt-detail-text mb-1">
                      <strong className="text-capitalize">{phone.type}:</strong> {phone.number}
                      {phone.isPrimary && <span className="cnt-primary-badge">Primary</span>}
                    </p>
                  ))}
                </div>
              </div>

              {/* Emails */}
              <div className="cnt-detail-item">
                <div className="cnt-detail-icon">
                  <i className="bi bi-envelope"></i>
                </div>
                <div>
                  <h6 className="cnt-detail-title">Email Addresses</h6>
                  {contactData.emails?.map((email, index) => (
                    <p key={index} className="cnt-detail-text mb-1">
                      <strong className="text-capitalize">{email.type}:</strong> {email.email}
                      {email.isPrimary && <span className="cnt-primary-badge">Primary</span>}
                    </p>
                  ))}
                </div>
              </div>

              {/* Business Hours */}
              <div className="cnt-hours-card">
                <h5 className="cnt-hours-title">
                  <i className="bi bi-clock"></i>
                  Business Hours
                </h5>
                {Object.entries(contactData.businessHours || {}).map(([day, hours]) => (
                  <div className="cnt-hours-item" key={day}>
                    <span className="cnt-hours-day">{day}</span>
                    {hours.closed ? (
                      <span className="cnt-hours-closed">Closed</span>
                    ) : (
                      <span className="cnt-hours-time">
                        {formatTime(hours.open)} - {formatTime(hours.close)}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Social Media Links */}
              <div className="cnt-social-section">
                <h6 className="cnt-social-title">Follow Us</h6>
                <div className="cnt-social-links">
                  {contactData.socialMedia?.facebook && (
                    <a href={contactData.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="cnt-social-link facebook">
                      <i className="bi bi-facebook"></i>
                    </a>
                  )}
                  {contactData.socialMedia?.instagram && (
                    <a href={contactData.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="cnt-social-link instagram">
                      <i className="bi bi-instagram"></i>
                    </a>
                  )}
                  {contactData.socialMedia?.whatsapp && (
                    <a href={contactData.socialMedia.whatsapp} target="_blank" rel="noopener noreferrer" className="cnt-social-link whatsapp">
                      <i className="bi bi-whatsapp"></i>
                    </a>
                  )}
                  {contactData.socialMedia?.youtube && (
                    <a href={contactData.socialMedia.youtube} target="_blank" rel="noopener noreferrer" className="cnt-social-link youtube">
                      <i className="bi bi-youtube"></i>
                    </a>
                  )}
                  {contactData.socialMedia?.twitter && (
                    <a href={contactData.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="cnt-social-link twitter">
                      <i className="bi bi-twitter-x"></i>
                    </a>
                  )}
                  {contactData.socialMedia?.linkedin && (
                    <a href={contactData.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="cnt-social-link linkedin">
                      <i className="bi bi-linkedin"></i>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form Section */}
          <div className="cnt-col-lg-7">
            <div className="cnt-form-card">
              <h3 className="cnt-form-title">
                <i className="bi bi-chat-dots"></i>
                Send Us a Message
              </h3>
              <p className="cnt-form-subtitle">
                Fill out the form below and we'll get back to you within 24 hours.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="cnt-row">
                  <div className="cnt-col-md-6 cnt-mb-3">
                    <label className="cnt-form-label">Your Name *</label>
                    <input
                      type="text"
                      className="cnt-form-control"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div className="cnt-col-md-6 cnt-mb-3">
                    <label className="cnt-form-label">Your Email *</label>
                    <input
                      type="email"
                      className="cnt-form-control"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="cnt-row">
                  <div className="cnt-col-md-6 cnt-mb-3">
                    <label className="cnt-form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="cnt-form-control"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder={primaryPhone?.number || "+91 98765 43210"}
                    />
                  </div>

                  <div className="cnt-col-md-6 cnt-mb-3">
                    <label className="cnt-form-label">Subject *</label>
                    <input
                      type="text"
                      className="cnt-form-control"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Inquiry about products"
                      required
                    />
                  </div>
                </div>

                <div className="cnt-mb-4">
                  <label className="cnt-form-label">Your Message *</label>
                  <textarea
                    className="cnt-form-control"
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
                  className={`cnt-submit-btn ${formLoading ? 'loading' : ''}`}
                  disabled={formLoading}
                >
                  {formLoading ? 'Sending...' : (
                    <>
                      <i className="bi bi-send cnt-me-2"></i>
                      Send Message
                    </>
                  )}
                </button>

                <p className="cnt-privacy-note">
                  <i className="bi bi-shield-check cnt-me-1"></i>
                  Your information is safe with us. We'll never share your details.
                </p>
              </form>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="cnt-map-container">
          {!showMap ? (
            <div className="cnt-map-placeholder" onClick={() => setShowMap(true)}>
              <i className="bi bi-map cnt-map-icon"></i>
              <h4 className="cnt-map-title">Click to Load Map</h4>
              <p className="cnt-map-text">View our store location on Google Maps</p>
            </div>
          ) : (
            <iframe
              src={`https://www.google.com/maps?q=${encodeURIComponent(
                contactData.address?.fullAddress || 'Bengaluru, Karnataka'
              )}&output=embed`}
              className="cnt-map-frame"
              allowFullScreen=""
              loading="lazy"
              title="Store Location"
            ></iframe>
          )}
        </div>

        {/* FAQ Section */}
        <div className="cnt-faq-section">
          <div className="container">
            <h2 className="cnt-faq-title">
              Frequently Asked Questions
            </h2>
            <div className="cnt-faq-container">
              {faqs.map((faq, index) => (
                <div className="cnt-faq-item" key={index}>
                  <div 
                    className="cnt-faq-question"
                    onClick={() => toggleFaq(index)}
                  >
                    <h6>{faq.question}</h6>
                    <i className={`bi ${faqOpen === index ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                  </div>
                  <div className={`cnt-faq-answer ${faqOpen === index ? 'open' : ''}`}>
                    <p>{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Social Media Icons */}
      <div className="cnt-floating-social">
        {contactData.socialMedia?.whatsapp && (
          <a href={contactData.socialMedia.whatsapp} target="_blank" rel="noopener noreferrer" className="cnt-social-link whatsapp">
            <i className="bi bi-whatsapp"></i>
          </a>
        )}
        {contactData.socialMedia?.instagram && (
          <a href={contactData.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="cnt-social-link instagram">
            <i className="bi bi-instagram"></i>
          </a>
        )}
        {contactData.socialMedia?.facebook && (
          <a href={contactData.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="cnt-social-link facebook">
            <i className="bi bi-facebook"></i>
          </a>
        )}
      </div>
    </div>
  );
}

export default Contact;