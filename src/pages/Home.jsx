import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { productsAPI, settingsAPI } from "../services/api";
import "./Home.css";

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSize, setSelectedSize] = useState("all");
  const [selectedColor, setSelectedColor] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [latestProduct, setLatestProduct] = useState(null);
  const [visibleProducts, setVisibleProducts] = useState(8);

  const [businessData, setBusinessData] = useState({
    businessName: "Advait Collections",
    tagline: "Premium Garments & Fashion Accessories",
    description: "",
    logo: { url: "", publicId: "" },
    address: {
      street: "123 Fashion Street",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      pincode: "400053",
      fullAddress: "123 Fashion Street, Andheri West, Mumbai - 400053"
    },
    phoneNumbers: [
      { type: "office", number: "+91 98765 43210", isPrimary: true }
    ],
    emails: [
      { type: "general", email: "contact@advaitcollections.com", isPrimary: true }
    ],
    socialMedia: {},
    businessHours: {
      monday: { open: "10:00", close: "21:00", closed: false },
      tuesday: { open: "10:00", close: "21:00", closed: false },
      wednesday: { open: "10:00", close: "21:00", closed: false },
      thursday: { open: "10:00", close: "21:00", closed: false },
      friday: { open: "10:00", close: "21:00", closed: false },
      saturday: { open: "10:00", close: "21:00", closed: false },
      sunday: { open: "11:00", close: "19:00", closed: false }
    }
  });

  const scrollContainerRef = useRef(null);

  // Clothing categories
  const categories = [
    { id: 1, name: "Men's Wear", icon: "bi-person-standing", color: "#4A90E2" },
    { id: 2, name: "Women's Wear", icon: "bi-person-standing-dress", color: "#E84C3D" },
    { id: 3, name: "Kids Wear", icon: "bi-emoji-smile", color: "#F1C40F" },
    { id: 4, name: "Winter Wear", icon: "bi-snow", color: "#3498DB" },
    { id: 5, name: "Footwear", icon: "bi-shoe-prints", color: "#E67E22" },
    { id: 6, name: "Accessories", icon: "bi-gem", color: "#9B59B6" }
  ];

  // Available sizes
  const sizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

  // Available colors
  const colors = [
    { name: "Black", code: "#000000" },
    { name: "White", code: "#FFFFFF" },
    { name: "Red", code: "#FF0000" },
    { name: "Blue", code: "#0000FF" },
    { name: "Green", code: "#00FF00" },
    { name: "Yellow", code: "#FFFF00" },
    { name: "Purple", code: "#800080" },
    { name: "Pink", code: "#FFC0CB" }
  ];

  useEffect(() => {
    fetchProducts();
    fetchBusiness();
    
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto scroll for hero products - continuous smooth scrolling
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer || products.length === 0) return;

    let scrollAmount = 0;
    const scrollStep = 0.8;
    const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
    
    const scrollInterval = setInterval(() => {
      if (scrollContainer) {
        scrollAmount += scrollStep;
        
        if (scrollAmount >= maxScroll) {
          scrollAmount = 0;
          scrollContainer.scrollTo({
            left: 0,
            behavior: 'instant'
          });
        } else {
          scrollContainer.scrollTo({
            left: scrollAmount,
            behavior: 'smooth'
          });
        }
      }
    }, 30);

    return () => clearInterval(scrollInterval);
  }, [products]);

  const fetchBusiness = async () => {
    try {
      const res = await settingsAPI.getSettings();
      if (res.success && res.settings) {
        const settings = res.settings;
        setBusinessData({
          businessName: settings.businessName || "Advait Collections",
          tagline: settings.tagline || "Premium Garments & Fashion Accessories",
          description: settings.description || "",
          logo: settings.logo || { url: "", publicId: "" },
          address: settings.address || businessData.address,
          phoneNumbers: settings.phoneNumbers?.length > 0 ? settings.phoneNumbers : businessData.phoneNumbers,
          emails: settings.emails?.length > 0 ? settings.emails : businessData.emails,
          socialMedia: settings.socialMedia || {},
          businessHours: settings.businessHours || businessData.businessHours
        });
      }
    } catch {
      console.log("Using default business data");
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await productsAPI.getAllProducts();
      
      const enhancedProducts = data.map((product) => ({
        ...product,
        category: categories[Math.floor(Math.random() * categories.length)].name,
        size: sizes[Math.floor(Math.random() * sizes.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        fabric: ["Cotton", "Polyester", "Silk", "Linen", "Wool", "Denim"][Math.floor(Math.random() * 6)]
      }));
      
      setProducts(enhancedProducts);
      
      if (enhancedProducts.length > 0) {
        setLatestProduct(enhancedProducts[enhancedProducts.length - 1]);
      }
    } catch (err) {
      console.log("Using empty products (API issue)");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort products
  const getFilteredProducts = () => {
    let filtered = [...products];

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.fabric?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (selectedSize !== "all") {
      filtered = filtered.filter(p => p.size === selectedSize);
    }

    if (selectedColor !== "all") {
      filtered = filtered.filter(p => p.color?.name === selectedColor);
    }

    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.sellingRate - b.sellingRate);
        break;
      case "price-high":
        filtered.sort((a, b) => b.sellingRate - a.sellingRate);
        break;
      case "name-asc":
        filtered.sort((a, b) => a.name?.localeCompare(b.name));
        break;
      case "stock-high":
        filtered.sort((a, b) => b.quantity - a.quantity);
        break;
      default:
        filtered.sort((a, b) => {
          if (a.quantity > 0 && b.quantity === 0) return -1;
          if (a.quantity === 0 && b.quantity > 0) return 1;
          return a.name?.localeCompare(b.name);
        });
    }

    return filtered;
  };

  const filteredProducts = getFilteredProducts();
  const displayedProducts = filteredProducts.slice(0, visibleProducts);

  const primaryPhone =
    businessData.phoneNumbers?.find((p) => p.isPrimary) ||
    businessData.phoneNumbers?.[0];

  const primaryEmail =
    businessData.emails?.find((e) => e.isPrimary) ||
    businessData.emails?.[0];

  const formatTime = (time) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getStockStatus = (quantity) => {
    if (quantity <= 0) return { text: 'Out of Stock', class: 'danger' };
    if (quantity < 10) return { text: 'Low Stock', class: 'warning' };
    return { text: 'In Stock', class: 'success' };
  };

  const getStockPercentage = (quantity) => {
    const max = 50;
    return Math.min((quantity / max) * 100, 100);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" style={{ width: "2.5rem", height: "2.5rem" }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Hero Section - Light Grey with Auto-Scrolling Cards */}
      <section className="home-hero-section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-5 mb-3 mb-lg-0">
              <div className="home-hero-content">
                <h1 className="home-hero-title">{businessData.businessName}</h1>
                <p className="home-hero-subtitle">{businessData.tagline}</p>
                <div className="d-flex gap-2 flex-wrap">
                  <span className="badge bg-dark text-white py-2 px-3 rounded-pill">
                    <i className="bi bi-shop me-2"></i>
                    Showroom Only
                  </span>
                  <span className="badge bg-dark text-white py-2 px-3 rounded-pill">
                    <i className="bi bi-clock me-2"></i>
                    {formatTime(businessData.businessHours?.monday?.open)} - {formatTime(businessData.businessHours?.monday?.close)}
                  </span>
                </div>
              </div>
            </div>
            <div className="col-lg-7">
              <div 
                ref={scrollContainerRef}
                className="home-scroll-container"
              >
                {/* Duplicate products to create seamless infinite scroll effect */}
                {products.concat(products).map((product, index) => (
                  <Link to={`/product/${product._id}`} key={`${product._id}-${index}`} style={{ textDecoration: 'none' }}>
                    <div className="home-hero-product-card">
                      <div className="home-hero-product-image">
                        <img
                          src={product.image || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300&auto=format"}
                          alt={product.name}
                          onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300&auto=format";
                          }}
                        />
                      </div>
                      <div className="home-hero-product-info">
                        <div className="home-hero-product-name">{product.name}</div>
                        <div className="home-hero-product-price">₹{product.sellingRate}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="text-end mt-2">
                <Link to="/products" className="text-dark text-decoration-none small">
                  View All Products <i className="bi bi-arrow-right"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        {/* Categories */}
        <section>
          <h2 className="fs-4 fw-semibold mb-3">Shop by Category</h2>
          <div className="home-category-grid">
            {categories.map((category) => (
              <div 
                key={category.id}
                className="home-category-card"
                onClick={() => setSelectedCategory(category.name)}
              >
                <div className="home-category-icon" style={{ background: category.color }}>
                  <i className={`bi ${category.icon}`}></i>
                </div>
                <div className="home-category-name">{category.name}</div>
                <div className="home-category-count">New styles</div>
              </div>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="home-stats-grid">
          <div className="home-stat-card">
            <div className="home-stat-icon blue">
              <i className="bi bi-box-seam"></i>
            </div>
            <div className="home-stat-info">
              <h3>{products.reduce((sum, p) => sum + (p.quantity || 0), 0)}</h3>
              <p>Total Items</p>
            </div>
          </div>
          <div className="home-stat-card">
            <div className="home-stat-icon green">
              <i className="bi bi-tags"></i>
            </div>
            <div className="home-stat-info">
              <h3>{products.length}</h3>
              <p>Products</p>
            </div>
          </div>
          <div className="home-stat-card">
            <div className="home-stat-icon yellow">
              <i className="bi bi-exclamation-triangle"></i>
            </div>
            <div className="home-stat-info">
              <h3>{products.filter(p => p.quantity > 0 && p.quantity < 10).length}</h3>
              <p>Low Stock</p>
            </div>
          </div>
        </section>

        {/* Products */}
        <section>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="fs-4 fw-semibold mb-0">Featured Products</h2>
            <Link to="/products" className="text-primary text-decoration-none small">
              View All <i className="bi bi-arrow-right"></i>
            </Link>
          </div>

          {displayedProducts.length > 0 ? (
            <>
              <div className="home-products-grid">
                {displayedProducts.slice(0, 4).map((product) => {
                  const stockStatus = getStockStatus(product.quantity);
                  const isLatest = latestProduct && product._id === latestProduct._id;
                  
                  return (
                    <Link to={`/product/${product._id}`} key={product._id} style={{ textDecoration: 'none' }}>
                      <div className="home-product-card">
                        <div className="home-product-image">
                          <img
                            src={product.image || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&auto=format"}
                            alt={product.name}
                            onError={(e) => {
                              e.target.src = "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&auto=format";
                            }}
                          />
                          {isLatest && (
                            <span className="home-product-badge">
                              <i className="bi bi-stars me-1"></i>
                              New
                            </span>
                          )}
                        </div>
                        
                        <div className="home-product-info">
                          <h3 className="home-product-name">{product.name}</h3>
                          
                          <div className="home-product-tags">
                            <span className="home-product-tag">
                              <i className="bi bi-rulers me-1"></i>
                              {product.size}
                            </span>
                            <span className="home-product-tag">
                              <span className="home-color-dot" style={{ 
                                backgroundColor: product.color?.code || '#000'
                              }}></span>
                              {product.color?.name || 'N/A'}
                            </span>
                            <span className="home-product-tag">
                              <i className="bi bi-tag me-1"></i>
                              {product.fabric}
                            </span>
                          </div>

                          <div className="home-product-price">
                            <span className="home-price">₹{product.sellingRate}</span>
                            <span className="home-stock">{product.quantity || 0} units</span>
                          </div>

                          <div className="home-stock-bar">
                            <div 
                              className="home-stock-fill" 
                              style={{ width: `${getStockPercentage(product.quantity || 0)}%` }}
                            ></div>
                          </div>

                          <span className="home-view-link">
                            View Details <i className="bi bi-arrow-right"></i>
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              <div className="text-center mt-3">
                <Link to="/products" className="btn btn-outline-primary btn-sm px-4">
                  Browse All Products <i className="bi bi-arrow-right ms-2"></i>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-5 bg-white rounded border">
              <i className="bi bi-emoji-frown display-4 text-muted"></i>
              <p className="text-muted mt-2">No products found</p>
            </div>
          )}
        </section>

        {/* Business Info */}
        <section className="home-business-card">
          <div className="row">
            <div className="col-md-6">
              <h3 className="fs-5 fw-semibold mb-3">Store Information</h3>
              <div className="home-info-grid">
                <div className="home-info-item">
                  <div className="home-info-icon">
                    <i className="bi bi-geo-alt"></i>
                  </div>
                  <div className="home-info-content">
                    <h4>Address</h4>
                    <p>{businessData.address?.fullAddress || `${businessData.address?.street || ''}, ${businessData.address?.city || ''}, ${businessData.address?.state || ''} - ${businessData.address?.pincode || ''}`}</p>
                  </div>
                </div>
                
                <div className="home-info-item">
                  <div className="home-info-icon">
                    <i className="bi bi-telephone"></i>
                  </div>
                  <div className="home-info-content">
                    <h4>Phone</h4>
                    {primaryPhone && (
                      <p><a href={`tel:${primaryPhone.number}`}>{primaryPhone.number}</a></p>
                    )}
                  </div>
                </div>

                <div className="home-info-item">
                  <div className="home-info-icon">
                    <i className="bi bi-envelope"></i>
                  </div>
                  <div className="home-info-content">
                    <h4>Email</h4>
                    {primaryEmail && (
                      <p><a href={`mailto:${primaryEmail.email}`}>{primaryEmail.email}</a></p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <h3 className="fs-5 fw-semibold mb-3">Store Hours</h3>
              <div className="home-hours-list">
                {businessData.businessHours && Object.entries(businessData.businessHours).map(([day, hours]) => (
                  <div key={day} className="home-hour-item">
                    <span className="home-hour-day text-capitalize">{day}</span>
                    <span className="home-hour-time">
                      {hours.closed ? 'Closed' : `${formatTime(hours.open)} - ${formatTime(hours.close)}`}
                    </span>
                  </div>
                ))}
              </div>
              <hr className="my-3" />
              <p className="small text-muted mb-0">
                <i className="bi bi-info-circle me-2"></i>
                Visit our showroom to try and purchase items
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="row g-3 py-4">
          <div className="col-6 col-md-3">
            <div className="text-center">
              <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-inline-flex p-2 mb-2">
                <i className="bi bi-shop fs-5"></i>
              </div>
              <h6 className="fs-7 fw-semibold">Showroom Only</h6>
              <small className="text-muted d-block">Try before buy</small>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="text-center">
              <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-inline-flex p-2 mb-2">
                <i className="bi bi-rulers fs-5"></i>
              </div>
              <h6 className="fs-7 fw-semibold">Free Fitting</h6>
              <small className="text-muted d-block">In-store trials</small>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="text-center">
              <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-inline-flex p-2 mb-2">
                <i className="bi bi-award fs-5"></i>
              </div>
              <h6 className="fs-7 fw-semibold">Premium Quality</h6>
              <small className="text-muted d-block">100% genuine</small>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="text-center">
              <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-inline-flex p-2 mb-2">
                <i className="bi bi-person-badge fs-5"></i>
              </div>
              <h6 className="fs-7 fw-semibold">Expert Staff</h6>
              <small className="text-muted d-block">Fashion consultants</small>
            </div>
          </div>
        </section>
      </div>

      {/* Back to Top */}
      <button 
        className={`home-back-to-top ${!showBackToTop ? 'hidden' : ''}`}
        onClick={scrollToTop}
        aria-label="Back to top"
      >
        <i className="bi bi-arrow-up"></i>
      </button>
    </div>
  );
}

export default Home;