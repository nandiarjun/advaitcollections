import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { settingsAPI } from "../services/api";

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
    fetchBusinessData();
    
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
    const scrollStep = 0.8; // Reduced speed for smoother scrolling
    const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
    
    const scrollInterval = setInterval(() => {
      if (scrollContainer) {
        scrollAmount += scrollStep;
        
        // Reset to start when reached the end
        if (scrollAmount >= maxScroll) {
          scrollAmount = 0;
          // Instant reset without animation for seamless loop
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
    }, 30); // Faster interval for smoother animation

    return () => clearInterval(scrollInterval);
  }, [products]);

  const fetchBusinessData = async () => {
    try {
      const response = await settingsAPI.getSettings();
      if (response.success) {
        const settings = response.settings;
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
    } catch (error) {
      console.error("Error fetching business data:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/products");
      
      const enhancedProducts = res.data.map((product) => ({
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
    } catch (error) {
      console.error("Error fetching products", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort products
  const getFilteredProducts = () => {
    let filtered = [...products];

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      filtered = filtered.filter(p => p.color.name === selectedColor);
    }

    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.sellingRate - b.sellingRate);
        break;
      case "price-high":
        filtered.sort((a, b) => b.sellingRate - a.sellingRate);
        break;
      case "name-asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "stock-high":
        filtered.sort((a, b) => b.quantity - a.quantity);
        break;
      default:
        filtered.sort((a, b) => {
          if (a.quantity > 0 && b.quantity === 0) return -1;
          if (a.quantity === 0 && b.quantity > 0) return 1;
          return a.name.localeCompare(b.name);
        });
    }

    return filtered;
  };

  const filteredProducts = getFilteredProducts();
  const displayedProducts = filteredProducts.slice(0, visibleProducts);

  // Format time for display
  const formatTime = (time) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Get primary contact
  const primaryPhone = businessData.phoneNumbers?.find(p => p.isPrimary) || businessData.phoneNumbers?.[0];
  const primaryEmail = businessData.emails?.find(e => e.isPrimary) || businessData.emails?.[0];

  // Add custom CSS
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      /* Professional Compact Design */
      :root {
        --primary: #2563eb;
        --primary-dark: #1d4ed8;
        --secondary: #4b5563;
        --background: #f5f5f5;
        --surface: #ffffff;
        --text: #111827;
        --text-light: #6b7280;
        --border: #e5e7eb;
        --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
        --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
      }

      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        background: var(--background);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      /* Hero Section - Light Grey */
      .hero-section {
        background: #f0f0f0;
        padding: 2.5rem 0;
        margin-bottom: 2rem;
        border-bottom: 1px solid var(--border);
      }

      .hero-content {
        color: var(--text);
      }

      .hero-title {
        font-size: 2.5rem;
        font-weight: 700;
        margin-bottom: 0.75rem;
        line-height: 1.2;
        color: #1e293b;
      }

      .hero-subtitle {
        font-size: 1.1rem;
        margin-bottom: 1.5rem;
        color: #4b5563;
      }

      /* Horizontal Scroll Container */
      .scroll-container {
        display: flex;
        overflow-x: auto;
        gap: 1rem;
        padding: 0.5rem 0;
        scroll-behavior: smooth;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: thin;
        cursor: grab;
      }

      .scroll-container::-webkit-scrollbar {
        height: 4px;
      }

      .scroll-container::-webkit-scrollbar-track {
        background: #d1d5db;
        border-radius: 4px;
      }

      .scroll-container::-webkit-scrollbar-thumb {
        background: var(--primary);
        border-radius: 4px;
      }

      /* Hero Product Card - 3 cards visible initially */
      .hero-product-card {
        flex: 0 0 calc(33.333% - 0.67rem);
        min-width: 200px;
        background: white;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: var(--shadow);
        transition: transform 0.2s ease;
        border: 1px solid var(--border);
      }

      @media (max-width: 768px) {
        .hero-product-card {
          flex: 0 0 calc(50% - 0.5rem);
          min-width: 160px;
        }
      }

      @media (max-width: 480px) {
        .hero-product-card {
          flex: 0 0 calc(80% - 0.5rem);
          min-width: 140px;
        }
      }

      .hero-product-card:hover {
        transform: translateY(-3px);
        box-shadow: var(--shadow-md);
        border-color: var(--primary);
      }

      .hero-product-image {
        height: 150px;
        overflow: hidden;
      }

      .hero-product-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
      }

      .hero-product-card:hover .hero-product-image img {
        transform: scale(1.05);
      }

      .hero-product-info {
        padding: 0.75rem;
      }

      .hero-product-name {
        font-weight: 600;
        font-size: 0.9rem;
        color: var(--text);
        margin-bottom: 0.25rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .hero-product-price {
        font-size: 1rem;
        font-weight: 600;
        color: var(--primary);
      }

      /* Category Grid */
      .category-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 0.75rem;
        margin: 1.5rem 0;
      }

      .category-card {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 10px;
        padding: 1rem;
        text-align: center;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .category-card:hover {
        border-color: var(--primary);
        box-shadow: var(--shadow);
      }

      .category-icon {
        width: 40px;
        height: 40px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 0.75rem;
        color: white;
        font-size: 1.25rem;
      }

      .category-name {
        font-weight: 500;
        font-size: 0.9rem;
        color: var(--text);
        margin-bottom: 0.25rem;
      }

      .category-count {
        font-size: 0.75rem;
        color: var(--text-light);
      }

      /* Stats Cards - Compact */
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        gap: 1rem;
        margin: 1.5rem 0;
      }

      .stat-card {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 1.25rem;
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .stat-icon {
        width: 48px;
        height: 48px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
      }

      .stat-icon.blue { background: #dbeafe; color: #1e40af; }
      .stat-icon.green { background: #dcfce7; color: #166534; }
      .stat-icon.yellow { background: #fef9c3; color: #854d0e; }

      .stat-info h3 {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--text);
        line-height: 1.2;
      }

      .stat-info p {
        font-size: 0.8rem;
        color: var(--text-light);
      }

      /* Products Grid */
      .products-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: 1.25rem;
        margin: 1.5rem 0;
      }

      .product-card {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 12px;
        overflow: hidden;
        transition: all 0.2s ease;
      }

      .product-card:hover {
        box-shadow: var(--shadow-md);
        border-color: var(--primary);
      }

      .product-image {
        height: 200px;
        overflow: hidden;
        position: relative;
      }

      .product-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
      }

      .product-card:hover .product-image img {
        transform: scale(1.05);
      }

      .product-badge {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        background: var(--primary);
        color: white;
        padding: 0.2rem 0.6rem;
        border-radius: 4px;
        font-size: 0.7rem;
        font-weight: 500;
      }

      .product-info {
        padding: 1rem;
      }

      .product-name {
        font-weight: 600;
        font-size: 1rem;
        color: var(--text);
        margin-bottom: 0.5rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .product-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
        margin-bottom: 0.75rem;
      }

      .product-tag {
        background: #f3f4f6;
        padding: 0.2rem 0.5rem;
        border-radius: 4px;
        font-size: 0.7rem;
        color: var(--text-light);
      }

      .product-price {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.75rem;
      }

      .price {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--primary);
      }

      .stock {
        font-size: 0.8rem;
        color: var(--text-light);
      }

      .stock-bar {
        height: 4px;
        background: #e5e7eb;
        border-radius: 2px;
        overflow: hidden;
        margin-bottom: 0.75rem;
      }

      .stock-fill {
        height: 100%;
        background: var(--primary);
        transition: width 0.3s ease;
      }

      .view-link {
        color: var(--primary);
        text-decoration: none;
        font-size: 0.9rem;
        font-weight: 500;
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
      }

      .view-link:hover {
        color: var(--primary-dark);
      }

      .view-link i {
        font-size: 0.8rem;
        transition: transform 0.2s ease;
      }

      .view-link:hover i {
        transform: translateX(3px);
      }

      /* Business Info - Compact */
      .business-card {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 16px;
        padding: 2rem;
        margin: 2rem 0;
        box-shadow: var(--shadow);
      }

      .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 1.5rem;
      }

      .info-item {
        display: flex;
        gap: 1rem;
      }

      .info-icon {
        width: 40px;
        height: 40px;
        background: #dbeafe;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--primary);
        font-size: 1.25rem;
      }

      .info-content h4 {
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--text);
        margin-bottom: 0.25rem;
      }

      .info-content p, .info-content a {
        font-size: 0.85rem;
        color: var(--text-light);
        text-decoration: none;
      }

      .info-content a:hover {
        color: var(--primary);
        text-decoration: underline;
      }

      .hours-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .hour-item {
        display: flex;
        justify-content: space-between;
        font-size: 0.85rem;
        padding: 0.25rem 0;
        border-bottom: 1px dashed var(--border);
      }

      .hour-item:last-child {
        border-bottom: none;
      }

      .hour-day {
        font-weight: 500;
        color: var(--text);
      }

      .hour-time {
        color: var(--text-light);
      }

      /* See More Button */
      .see-more {
        text-align: center;
        margin: 2rem 0;
      }

      .see-more-btn {
        background: white;
        border: 2px solid var(--primary);
        color: var(--primary);
        padding: 0.6rem 2rem;
        border-radius: 30px;
        font-weight: 500;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.2s ease;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
      }

      .see-more-btn:hover {
        background: var(--primary);
        color: white;
      }

      /* Back to Top */
      .back-to-top {
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        width: 44px;
        height: 44px;
        background: var(--primary);
        color: white;
        border: none;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: var(--shadow-md);
        transition: all 0.2s ease;
        z-index: 1000;
      }

      .back-to-top:hover {
        background: var(--primary-dark);
        transform: translateY(-3px);
      }

      .back-to-top.hidden {
        display: none;
      }

      /* Responsive */
      @media (max-width: 768px) {
        .hero-title {
          font-size: 2rem;
        }
        
        .hero-subtitle {
          font-size: 1rem;
        }
        
        .business-card {
          padding: 1.5rem;
        }
        
        .info-grid {
          grid-template-columns: 1fr;
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
      <section className="hero-section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-5 mb-3 mb-lg-0">
              <div className="hero-content">
                <h1 className="hero-title">{businessData.businessName}</h1>
                <p className="hero-subtitle">{businessData.tagline}</p>
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
                className="scroll-container"
              >
                {/* Duplicate products to create seamless infinite scroll effect */}
                {products.concat(products).map((product, index) => (
                  <Link to={`/product/${product._id}`} key={`${product._id}-${index}`} style={{ textDecoration: 'none' }}>
                    <div className="hero-product-card">
                      <div className="hero-product-image">
                        <img
                          src={product.image || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300&auto=format"}
                          alt={product.name}
                          onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300&auto=format";
                          }}
                        />
                      </div>
                      <div className="hero-product-info">
                        <div className="hero-product-name">{product.name}</div>
                        <div className="hero-product-price">₹{product.sellingRate}</div>
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
          <div className="category-grid">
            {categories.map((category) => (
              <div 
                key={category.id}
                className="category-card"
                onClick={() => setSelectedCategory(category.name)}
              >
                <div className="category-icon" style={{ background: category.color }}>
                  <i className={`bi ${category.icon}`}></i>
                </div>
                <div className="category-name">{category.name}</div>
                <div className="category-count">New styles</div>
              </div>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue">
              <i className="bi bi-box-seam"></i>
            </div>
            <div className="stat-info">
              <h3>{products.reduce((sum, p) => sum + p.quantity, 0)}</h3>
              <p>Total Items</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">
              <i className="bi bi-tags"></i>
            </div>
            <div className="stat-info">
              <h3>{products.length}</h3>
              <p>Products</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon yellow">
              <i className="bi bi-exclamation-triangle"></i>
            </div>
            <div className="stat-info">
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
              <div className="products-grid">
                {displayedProducts.slice(0, 4).map((product) => {
                  const stockStatus = getStockStatus(product.quantity);
                  const isLatest = latestProduct && product._id === latestProduct._id;
                  
                  return (
                    <Link to={`/product/${product._id}`} key={product._id} style={{ textDecoration: 'none' }}>
                      <div className="product-card">
                        <div className="product-image">
                          <img
                            src={product.image || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&auto=format"}
                            alt={product.name}
                            onError={(e) => {
                              e.target.src = "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&auto=format";
                            }}
                          />
                          {isLatest && (
                            <span className="product-badge">
                              <i className="bi bi-stars me-1"></i>
                              New
                            </span>
                          )}
                        </div>
                        
                        <div className="product-info">
                          <h3 className="product-name">{product.name}</h3>
                          
                          <div className="product-tags">
                            <span className="product-tag">
                              <i className="bi bi-rulers me-1"></i>
                              {product.size}
                            </span>
                            <span className="product-tag">
                              <span className="color-dot" style={{ 
                                backgroundColor: product.color.code, 
                                display: 'inline-block', 
                                width: '10px', 
                                height: '10px', 
                                borderRadius: '50%', 
                                marginRight: '4px' 
                              }}></span>
                              {product.color.name}
                            </span>
                            <span className="product-tag">
                              <i className="bi bi-tag me-1"></i>
                              {product.fabric}
                            </span>
                          </div>

                          <div className="product-price">
                            <span className="price">₹{product.sellingRate}</span>
                            <span className="stock">{product.quantity} units</span>
                          </div>

                          <div className="stock-bar">
                            <div 
                              className="stock-fill" 
                              style={{ width: `${getStockPercentage(product.quantity)}%` }}
                            ></div>
                          </div>

                          <span className="view-link">
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
        <section className="business-card">
          <div className="row">
            <div className="col-md-6">
              <h3 className="fs-5 fw-semibold mb-3">Store Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <div className="info-icon">
                    <i className="bi bi-geo-alt"></i>
                  </div>
                  <div className="info-content">
                    <h4>Address</h4>
                    <p>{businessData.address?.fullAddress || `${businessData.address?.street}, ${businessData.address?.city}, ${businessData.address?.state} - ${businessData.address?.pincode}`}</p>
                  </div>
                </div>
                
                <div className="info-item">
                  <div className="info-icon">
                    <i className="bi bi-telephone"></i>
                  </div>
                  <div className="info-content">
                    <h4>Phone</h4>
                    {primaryPhone && (
                      <p><a href={`tel:${primaryPhone.number}`}>{primaryPhone.number}</a></p>
                    )}
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon">
                    <i className="bi bi-envelope"></i>
                  </div>
                  <div className="info-content">
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
              <div className="hours-list">
                {businessData.businessHours && Object.entries(businessData.businessHours).map(([day, hours]) => (
                  <div key={day} className="hour-item">
                    <span className="hour-day text-capitalize">{day}</span>
                    <span className="hour-time">
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
        className={`back-to-top ${!showBackToTop ? 'hidden' : ''}`}
        onClick={scrollToTop}
        aria-label="Back to top"
      >
        <i className="bi bi-arrow-up"></i>
      </button>
    </div>
  );
}

export default Home;