import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { settingsAPI } from "../services/api";

function About() {
  const [loading, setLoading] = useState(true);
  const [aboutData, setAboutData] = useState({
    businessName: "Advait Collections",
    tagline: "Redefining Fashion",
    description: "",
    story: "",
    vision: "",
    mission: "",
    foundedYear: 2015,
    teamMembers: [],
    coreValues: [],
    stats: {
      years: "8+",
      customers: "50K+",
      products: "10K+",
      brands: "100+"
    },
    address: {},
    socialMedia: {},
    emails: [],
    phoneNumbers: []
  });

  // Fetch about data from backend
  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    try {
      setLoading(true);
      
      // Fetch settings (contains all about content)
      const response = await settingsAPI.getSettings();
      
      if (response.success) {
        const settings = response.settings;
        
        // Calculate years in business
        const foundedYear = settings.aboutContent?.foundedYear || 2015;
        const currentYear = new Date().getFullYear();
        const yearsInBusiness = currentYear - foundedYear;
        
        setAboutData({
          businessName: settings.businessName || "Advait Collections",
          tagline: settings.tagline || "Redefining Fashion",
          description: settings.description || "",
          story: settings.aboutContent?.story || "Founded in 2015, Advait Collections started with a simple mission: to provide high-quality, fashionable clothing at affordable prices. What began as a small shop in Koramangala has now grown into one of the city's most beloved garment stores.",
          vision: settings.aboutContent?.vision || "To become a leading garments retailer known for quality, affordability, and trust.",
          mission: settings.aboutContent?.mission || "To provide the latest fashion styles with excellent customer service and transparent pricing.",
          foundedYear: foundedYear,
          teamMembers: settings.aboutContent?.teamMembers || [],
          coreValues: settings.aboutContent?.coreValues || [],
          stats: {
            years: `${yearsInBusiness}+`,
            customers: settings.aboutContent?.customers || "50K+",
            products: settings.aboutContent?.products || "10K+",
            brands: settings.aboutContent?.brands || "100+"
          },
          address: settings.address || {},
          socialMedia: settings.socialMedia || {},
          emails: settings.emails || [],
          phoneNumbers: settings.phoneNumbers || []
        });
      }
    } catch (error) {
      console.error("Error fetching about data:", error);
    } finally {
      setLoading(false);
    }
  };

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

      @keyframes fadeInLeft {
        from {
          opacity: 0;
          transform: translateX(-30px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes fadeInRight {
        from {
          opacity: 0;
          transform: translateX(30px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes scaleIn {
        from {
          opacity: 0;
          transform: scale(0.9);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      @keyframes float {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
        100% { transform: translateY(0px); }
      }

      @keyframes rotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      .about-hero {
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        padding: 100px 0;
        margin-bottom: 60px;
        position: relative;
        overflow: hidden;
      }

      .about-hero::before {
        content: '';
        position: absolute;
        top: -50%;
        right: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(circle, rgba(255,215,0,0.1) 0%, transparent 50%);
        animation: rotate 30s linear infinite;
      }

      .about-hero h1 {
        animation: fadeInUp 0.8s ease;
        font-family: 'Playfair Display', serif;
        font-weight: 900;
      }

      .about-hero p {
        animation: fadeInUp 0.8s ease 0.2s both;
        color: rgba(255,255,255,0.9);
      }

      .story-image {
        border-radius: 20px;
        overflow: hidden;
        box-shadow: 0 30px 60px rgba(0,0,0,0.3);
        animation: fadeInLeft 0.8s ease;
        transition: all 0.3s ease;
        border: 1px solid rgba(255,215,0,0.2);
      }

      .story-image:hover {
        transform: scale(1.02);
        box-shadow: 0 40px 80px rgba(255,215,0,0.2);
      }

      .story-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.5s ease;
      }

      .story-image:hover img {
        transform: scale(1.1);
      }

      .story-content {
        animation: fadeInRight 0.8s ease;
      }

      .story-content h2 {
        font-family: 'Playfair Display', serif;
        font-weight: 800;
        color: #1a1a2e;
      }

      .feature-card {
        background: white;
        border-radius: 20px;
        padding: 30px;
        text-align: center;
        box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        transition: all 0.3s ease;
        height: 100%;
        animation: scaleIn 0.6s ease;
        border: 1px solid rgba(255,215,0,0.1);
        position: relative;
        overflow: hidden;
      }

      .feature-card::before {
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

      .feature-card:hover::before {
        transform: translateX(0);
      }

      .feature-card:hover {
        transform: translateY(-10px);
        box-shadow: 0 30px 60px rgba(255,215,0,0.2);
      }

      .feature-icon {
        width: 80px;
        height: 80px;
        background: linear-gradient(135deg, #FFD700, #FFA500);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 20px;
        color: #1a1a2e;
        font-size: 32px;
        transition: all 0.3s ease;
      }

      .feature-card:hover .feature-icon {
        transform: rotate(360deg) scale(1.1);
        box-shadow: 0 10px 30px rgba(255,215,0,0.4);
      }

      .milestone-card {
        background: white;
        border-radius: 20px;
        padding: 30px;
        text-align: center;
        box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        transition: all 0.3s ease;
        height: 100%;
        position: relative;
        overflow: hidden;
      }

      .milestone-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, #FFD700, #FFA500);
      }

      .milestone-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 30px 60px rgba(255,215,0,0.2);
      }

      .milestone-number {
        font-size: 3rem;
        font-weight: 800;
        background: linear-gradient(135deg, #1a1a2e, #16213e);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 10px;
      }

      .team-card {
        background: white;
        border-radius: 20px;
        overflow: hidden;
        box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        transition: all 0.3s ease;
        height: 100%;
        border: 1px solid rgba(255,215,0,0.1);
      }

      .team-card:hover {
        transform: translateY(-10px);
        box-shadow: 0 30px 60px rgba(255,215,0,0.2);
      }

      .team-image {
        width: 100%;
        height: 300px;
        object-fit: cover;
        transition: transform 0.5s ease;
      }

      .team-card:hover .team-image {
        transform: scale(1.1);
      }

      .team-info {
        padding: 20px;
        text-align: center;
      }

      .team-social {
        display: flex;
        justify-content: center;
        gap: 15px;
        margin-top: 15px;
      }

      .team-social a {
        width: 35px;
        height: 35px;
        border-radius: 50%;
        background: #f0f0f0;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #1a1a2e;
        transition: all 0.3s ease;
        text-decoration: none;
      }

      .team-social a:hover {
        background: linear-gradient(135deg, #FFD700, #FFA500);
        color: #1a1a2e;
        transform: translateY(-3px);
      }

      .testimonial-card {
        background: white;
        border-radius: 20px;
        padding: 30px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        position: relative;
        margin: 20px 0;
        border: 1px solid rgba(255,215,0,0.1);
      }

      .testimonial-card::before {
        content: '"';
        position: absolute;
        top: -20px;
        left: 30px;
        font-size: 80px;
        color: #FFD700;
        opacity: 0.2;
        font-family: serif;
      }

      .testimonial-author {
        display: flex;
        align-items: center;
        margin-top: 20px;
      }

      .testimonial-author img {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        margin-right: 15px;
        object-fit: cover;
        border: 2px solid #FFD700;
      }

      .value-badge {
        background: linear-gradient(135deg, #1a1a2e, #16213e);
        color: white;
        padding: 10px 25px;
        border-radius: 50px;
        display: inline-block;
        font-weight: 500;
        margin: 5px;
        transition: all 0.3s ease;
        border: 1px solid #FFD700;
      }

      .value-badge:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 25px rgba(255,215,0,0.3);
        background: linear-gradient(135deg, #16213e, #1a1a2e);
      }

      .stats-section {
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        padding: 80px 0;
        color: white;
        margin: 60px 0;
      }

      .stat-item {
        text-align: center;
        animation: float 3s ease-in-out infinite;
      }

      .stat-number {
        font-size: 3.5rem;
        font-weight: 800;
        margin-bottom: 10px;
        color: #FFD700;
      }

      .cta-section {
        background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);
        padding: 80px 0;
        text-align: center;
      }

      .cta-button {
        background: linear-gradient(135deg, #1a1a2e, #16213e);
        color: white;
        border: none;
        padding: 15px 40px;
        border-radius: 50px;
        font-size: 1.1rem;
        font-weight: 600;
        transition: all 0.3s ease;
        text-decoration: none;
        display: inline-block;
        border: 1px solid #FFD700;
      }

      .cta-button:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 30px rgba(255,215,0,0.4);
        color: white;
        background: linear-gradient(135deg, #16213e, #1a1a2e);
      }

      .timeline-item {
        position: relative;
        padding-left: 30px;
        margin-bottom: 30px;
        border-left: 2px solid #FFD700;
      }

      .timeline-year {
        font-weight: 700;
        color: #FFD700;
        margin-bottom: 5px;
        font-size: 1.2rem;
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

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      @media (max-width: 768px) {
        .about-hero {
          padding: 60px 0;
        }
        
        .stat-number {
          font-size: 2.5rem;
        }
        
        .team-image {
          height: 250px;
        }
        
        .about-hero h1 {
          font-size: 2.5rem;
        }
      }

      @media (max-width: 576px) {
        .about-hero h1 {
          font-size: 2rem;
        }
        
        .cta-button {
          display: block;
          margin: 10px 0;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Default core values if none from backend
  const defaultCoreValues = [
    { title: "Integrity", icon: "bi-shield-check" },
    { title: "Quality", icon: "bi-gem" },
    { title: "Customer First", icon: "bi-people" },
    { title: "Innovation", icon: "bi-lightbulb" },
    { title: "Transparency", icon: "bi-eye" },
    { title: "Sustainability", icon: "bi-tree" }
  ];

  // Default team members if none from backend
  const defaultTeamMembers = [
    {
      name: "Rajesh Kumar",
      position: "Founder & CEO",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&auto=format",
      bio: "20+ years in fashion retail industry"
    },
    {
      name: "Priya Sharma",
      position: "Creative Director",
      image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=500&auto=format",
      bio: "Award-winning fashion designer"
    },
    {
      name: "Amit Patel",
      position: "Store Manager",
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&auto=format",
      bio: "Ensuring customer satisfaction"
    }
  ];

  // Default testimonials
  const testimonials = [
    {
      text: "Best quality fabrics I've found in Bangalore. The staff is very helpful and the collection is amazing!",
      author: "Sneha Reddy",
      role: "Regular Customer",
      image: "https://images.unsplash.com/photo-1494790108777-466d3a05f5b9?w=500&auto=format"
    },
    {
      text: "Great variety of traditional wear. Prices are reasonable and quality is top notch.",
      author: "Vikram Mehta",
      role: "Fashion Blogger",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&auto=format"
    }
  ];

  // Get primary email for contact
  const primaryEmail = aboutData.emails?.find(e => e.isPrimary) || aboutData.emails?.[0];

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero text-white">
        <div className="container text-center">
          <h1 className="display-3 fw-bold mb-3">{aboutData.businessName}</h1>
          <p className="lead mb-0">{aboutData.tagline}</p>
        </div>
      </section>

      {/* Story Section */}
      <div className="container mb-5">
        <div className="row align-items-center g-5">
          <div className="col-lg-6">
            <div className="story-image">
              <img
                src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&auto=format"
                alt="Our Store"
                className="img-fluid"
              />
            </div>
          </div>
          <div className="col-lg-6">
            <div className="story-content">
              <h2 className="fw-bold mb-4" style={{ fontSize: "2.5rem" }}>
                Our Story
              </h2>
              <p className="lead text-muted mb-4">
                From a small boutique to {aboutData.address?.city || "Bangalore"}'s most trusted garments retailer
              </p>
              <p className="mb-3">
                {aboutData.story}
              </p>
              
              {/* Vision & Mission */}
              <div className="row mt-4">
                <div className="col-md-6">
                  <div className="p-3 bg-light rounded">
                    <h5 className="fw-bold text-warning mb-2">Our Vision</h5>
                    <p className="mb-0 text-muted">{aboutData.vision}</p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="p-3 bg-light rounded">
                    <h5 className="fw-bold text-warning mb-2">Our Mission</h5>
                    <p className="mb-0 text-muted">{aboutData.mission}</p>
                  </div>
                </div>
              </div>
              
              {/* Timeline */}
              <div className="mt-4">
                <h5 className="fw-bold mb-3">Our Journey</h5>
                <div className="timeline-item">
                  <div className="timeline-year">{aboutData.foundedYear}</div>
                  <p className="mb-0">Opened first store in {aboutData.address?.city || "Koramangala"}</p>
                </div>
                <div className="timeline-item">
                  <div className="timeline-year">{aboutData.foundedYear + 3}</div>
                  <p className="mb-0">Expanded to women's ethnic wear collection</p>
                </div>
                <div className="timeline-item">
                  <div className="timeline-year">{aboutData.foundedYear + 6}</div>
                  <p className="mb-0">Launched kids wear collection</p>
                </div>
                <div className="timeline-item">
                  <div className="timeline-year">{new Date().getFullYear() - 1}</div>
                  <p className="mb-0">Recognized as Best Local Retailer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-3 col-6">
              <div className="stat-item">
                <div className="stat-number">{aboutData.stats.years}</div>
                <p className="mb-0">Years of Excellence</p>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="stat-item">
                <div className="stat-number">{aboutData.stats.customers}</div>
                <p className="mb-0">Happy Customers</p>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="stat-item">
                <div className="stat-number">{aboutData.stats.products}</div>
                <p className="mb-0">Products</p>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="stat-item">
                <div className="stat-number">{aboutData.stats.brands}</div>
                <p className="mb-0">Brands</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <div className="container py-5">
        <h2 className="fw-bold text-center mb-5" style={{ fontSize: "2.2rem", color: "#1a1a2e" }}>
          Why Choose Us
        </h2>
        <div className="row g-4">
          <div className="col-md-4">
            <div className="feature-card">
              <div className="feature-icon">
                <i className="bi bi-gem"></i>
              </div>
              <h4 className="fw-bold mb-3">Premium Quality</h4>
              <p className="text-muted mb-0">
                We source only the finest fabrics and materials to ensure durability and comfort.
              </p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="feature-card">
              <div className="feature-icon">
                <i className="bi bi-tags"></i>
              </div>
              <h4 className="fw-bold mb-3">Affordable Prices</h4>
              <p className="text-muted mb-0">
                Direct sourcing from manufacturers allows us to offer competitive prices.
              </p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="feature-card">
              <div className="feature-icon">
                <i className="bi bi-star"></i>
              </div>
              <h4 className="fw-bold mb-3">Expert Stylists</h4>
              <p className="text-muted mb-0">
                Our team of fashion consultants helps you find the perfect outfit.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="container py-5">
        <h2 className="fw-bold text-center mb-5" style={{ fontSize: "2.2rem", color: "#1a1a2e" }}>
          Our Core Values
        </h2>
        <div className="row justify-content-center">
          <div className="col-lg-8 text-center">
            {(aboutData.coreValues.length > 0 ? aboutData.coreValues : defaultCoreValues).map((value, index) => (
              <span key={index} className="value-badge">
                <i className={`bi ${value.icon || 'bi-check-circle-fill'} me-2`}></i>
                {value.title || value}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="container py-5">
        <h2 className="fw-bold text-center mb-5" style={{ fontSize: "2.2rem", color: "#1a1a2e" }}>
          Meet Our Team
        </h2>
        <div className="row g-4">
          {(aboutData.teamMembers.length > 0 ? aboutData.teamMembers : defaultTeamMembers).map((member, index) => (
            <div className="col-md-4" key={index}>
              <div className="team-card">
                <img
                  src={member.image?.url || member.image || "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&auto=format"}
                  className="team-image"
                  alt={member.name}
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&auto=format";
                  }}
                />
                <div className="team-info">
                  <h5 className="fw-bold mb-1">{member.name}</h5>
                  <p className="text-warning mb-2">{member.position}</p>
                  <p className="text-muted small">{member.bio}</p>
                  <div className="team-social">
                    {aboutData.socialMedia?.linkedin && (
                      <a href={aboutData.socialMedia.linkedin} target="_blank" rel="noopener noreferrer">
                        <i className="bi bi-linkedin"></i>
                      </a>
                    )}
                    {aboutData.socialMedia?.twitter && (
                      <a href={aboutData.socialMedia.twitter} target="_blank" rel="noopener noreferrer">
                        <i className="bi bi-twitter-x"></i>
                      </a>
                    )}
                    <a href={`mailto:${primaryEmail?.email || "contact@advait.com"}`}>
                      <i className="bi bi-envelope"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="container py-5">
        <h2 className="fw-bold text-center mb-5" style={{ fontSize: "2.2rem", color: "#1a1a2e" }}>
          What Our Customers Say
        </h2>
        <div className="row">
          {testimonials.map((testimonial, index) => (
            <div className="col-md-6" key={index}>
              <div className="testimonial-card">
                <p className="mb-4">{testimonial.text}</p>
                <div className="testimonial-author">
                  <img src={testimonial.image} alt={testimonial.author} />
                  <div>
                    <h6 className="fw-bold mb-1">{testimonial.author}</h6>
                    <small className="text-muted">{testimonial.role}</small>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2 className="fw-bold mb-4" style={{ fontSize: "2.5rem", color: "#1a1a2e" }}>
            Ready to Explore Our Collection?
          </h2>
          <p className="lead mb-4 text-muted">
            Visit our store or browse our catalog online
          </p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Link to="/" className="cta-button">
              <i className="bi bi-shop me-2"></i>
              Browse Collection
            </Link>
            <Link to="/contact" className="cta-button">
              <i className="bi bi-envelope me-2"></i>
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <div className="container py-5">
        <h4 className="fw-bold text-center mb-4" style={{ color: "#1a1a2e" }}>Brands We Work With</h4>
        <div className="row justify-content-center align-items-center g-4">
          <div className="col-4 col-md-2">
            <img 
              src="https://via.placeholder.com/150x50?text=Brand+1" 
              alt="Brand"
              className="img-fluid opacity-50 hover-opacity-100 transition"
              style={{ filter: "grayscale(100%)", transition: "all 0.3s ease" }}
              onMouseEnter={(e) => e.target.style.filter = "grayscale(0%)"}
              onMouseLeave={(e) => e.target.style.filter = "grayscale(100%)"}
            />
          </div>
          <div className="col-4 col-md-2">
            <img 
              src="https://via.placeholder.com/150x50?text=Brand+2" 
              alt="Brand"
              className="img-fluid opacity-50"
              style={{ filter: "grayscale(100%)", transition: "all 0.3s ease" }}
              onMouseEnter={(e) => e.target.style.filter = "grayscale(0%)"}
              onMouseLeave={(e) => e.target.style.filter = "grayscale(100%)"}
            />
          </div>
          <div className="col-4 col-md-2">
            <img 
              src="https://via.placeholder.com/150x50?text=Brand+3" 
              alt="Brand"
              className="img-fluid opacity-50"
              style={{ filter: "grayscale(100%)", transition: "all 0.3s ease" }}
              onMouseEnter={(e) => e.target.style.filter = "grayscale(0%)"}
              onMouseLeave={(e) => e.target.style.filter = "grayscale(100%)"}
            />
          </div>
          <div className="col-4 col-md-2">
            <img 
              src="https://via.placeholder.com/150x50?text=Brand+4" 
              alt="Brand"
              className="img-fluid opacity-50"
              style={{ filter: "grayscale(100%)", transition: "all 0.3s ease" }}
              onMouseEnter={(e) => e.target.style.filter = "grayscale(0%)"}
              onMouseLeave={(e) => e.target.style.filter = "grayscale(100%)"}
            />
          </div>
          <div className="col-4 col-md-2">
            <img 
              src="https://via.placeholder.com/150x50?text=Brand+5" 
              alt="Brand"
              className="img-fluid opacity-50"
              style={{ filter: "grayscale(100%)", transition: "all 0.3s ease" }}
              onMouseEnter={(e) => e.target.style.filter = "grayscale(0%)"}
              onMouseLeave={(e) => e.target.style.filter = "grayscale(100%)"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;