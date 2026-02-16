import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { productsAPI, settingsAPI } from "../services/api";

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [businessLoading, setBusinessLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSize, setSelectedSize] = useState("all");
  const [selectedColor, setSelectedColor] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [latestProduct, setLatestProduct] = useState(null);
  const [visibleProducts, setVisibleProducts] = useState(8);

  // Dynamic business data (fetched from API)
  const [businessData, setBusinessData] = useState({
    businessName: "Advait Collections",
    tagline: "Premium Garments & Fashion Accessories",
    address: {
      fullAddress: "123 Fashion Street, Andheri West, Mumbai - 400053"
    },
    phoneNumbers: [
      { type: "office", number: "+91 98765 43210", isPrimary: true }
    ],
    emails: [
      { type: "general", email: "contact@advaitcollections.com", isPrimary: true }
    ],
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

  // Clothing categories with updated colors
  const categories = [
    { id: 1, name: "Men's Wear", icon: "bi-person-standing", color: "#2563eb", lightColor: "#dbeafe" },
    { id: 2, name: "Women's Wear", icon: "bi-person-standing-dress", color: "#db2777", lightColor: "#fce7f3" },
    { id: 3, name: "Kids Wear", icon: "bi-emoji-smile", color: "#ea580c", lightColor: "#ffedd5" },
    { id: 4, name: "Winter Wear", icon: "bi-snow", color: "#0891b2", lightColor: "#cffafe" },
    { id: 5, name: "Footwear", icon: "bi-shoe-prints", color: "#65a30d", lightColor: "#ecfccb" },
    { id: 6, name: "Accessories", icon: "bi-gem", color: "#9333ea", lightColor: "#f3e8ff" }
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

  // Auto scroll for hero products
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

  const fetchBusinessData = async () => {
    try {
      setBusinessLoading(true);
      const response = await settingsAPI.getSettings();
      
      if (response.success && response.settings) {
        const settings = response.settings;
        setBusinessData({
          businessName: settings.businessName || "Advait Collections",
          tagline: settings.tagline || "Premium Garments & Fashion Accessories",
          description: settings.description || "",
          logo: settings.logo || { url: "", publicId: "" },
          address: {
            fullAddress: settings.address?.fullAddress || 
              `${settings.address?.street || '123 Fashion Street'}, ${settings.address?.city || 'Andheri West'}, ${settings.address?.state || 'Mumbai'} - ${settings.address?.pincode || '400053'}`
          },
          phoneNumbers: settings.phoneNumbers?.length > 0 ? settings.phoneNumbers : businessData.phoneNumbers,
          emails: settings.emails?.length > 0 ? settings.emails : businessData.emails,
          socialMedia: settings.socialMedia || {},
          businessHours: settings.businessHours || businessData.businessHours
        });
      }
    } catch (error) {
      console.log("Using default business data");
    } finally {
      setBusinessLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
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
    } catch (error) {
      console.error("Error fetching products:", error);
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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getStockStatus = (quantity) => {
    if (quantity <= 0) return { text: 'Out of Stock', class: 'danger', bg: 'bg-danger' };
    if (quantity < 10) return { text: 'Low Stock', class: 'warning', bg: 'bg-warning' };
    return { text: 'In Stock', class: 'success', bg: 'bg-success' };
  };

  const getStockPercentage = (quantity) => {
    const max = 50;
    return Math.min((quantity / max) * 100, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading amazing products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      {/* Hero Section with Gradient */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="container mx-auto px-4 py-16 md:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                {businessData.businessName}
              </h1>
              <p className="text-xl text-blue-100 max-w-lg">
                {businessData.tagline}
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium border border-white/20">
                  <i className="bi bi-shop"></i>
                  Showroom Only
                </span>
                <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium border border-white/20">
                  <i className="bi bi-clock"></i>
                  {formatTime(businessData.businessHours?.monday?.open)} - {formatTime(businessData.businessHours?.monday?.close)}
                </span>
              </div>
            </div>

            {/* Right Content - Horizontal Scrolling Cards */}
            <div className="relative">
              <div 
                ref={scrollContainerRef}
                className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {products.length > 0 ? (
                  products.concat(products).map((product, index) => (
                    <Link 
                      to={`/product/${product._id}`} 
                      key={`${product._id}-${index}`} 
                      className="flex-none w-64 group"
                    >
                      <div className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                        <div className="h-48 overflow-hidden">
                          <img
                            src={product.image || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&auto=format"}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                              e.target.src = "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&auto=format";
                            }}
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-800 mb-1 truncate">{product.name}</h3>
                          <p className="text-xl font-bold text-blue-600">₹{product.sellingRate}</p>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-white">No products available</p>
                  </div>
                )}
              </div>
              <div className="absolute top-0 right-0 bottom-0 w-24 bg-gradient-to-l from-blue-700 to-transparent pointer-events-none"></div>
              <div className="mt-4 text-right">
                <Link to="/products" className="inline-flex items-center gap-2 text-white hover:text-blue-200 transition-colors">
                  View All Products <i className="bi bi-arrow-right"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Categories Section */}
        <section className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Shop by Category</h2>
            <Link to="/products" className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-2">
              View All <i className="bi bi-arrow-right"></i>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <div 
                key={category.id}
                className="group cursor-pointer"
                onClick={() => setSelectedCategory(category.name)}
              >
                <div 
                  className="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
                  style={{ backgroundColor: category.lightColor }}
                >
                  <div 
                    className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ backgroundColor: category.color }}
                  >
                    <i className={`bi ${category.icon} text-white text-2xl`}></i>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-1">{category.name}</h3>
                  <p className="text-xs text-gray-500">New styles</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 rounded-xl p-3">
                  <i className="bi bi-box-seam text-3xl"></i>
                </div>
                <div>
                  <p className="text-blue-100 text-sm">Total Items</p>
                  <p className="text-3xl font-bold">{products.reduce((sum, p) => sum + p.quantity, 0)}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 rounded-xl p-3">
                  <i className="bi bi-tags text-3xl"></i>
                </div>
                <div>
                  <p className="text-green-100 text-sm">Products</p>
                  <p className="text-3xl font-bold">{products.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 rounded-xl p-3">
                  <i className="bi bi-exclamation-triangle text-3xl"></i>
                </div>
                <div>
                  <p className="text-orange-100 text-sm">Low Stock</p>
                  <p className="text-3xl font-bold">{products.filter(p => p.quantity > 0 && p.quantity < 10).length}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Featured Products</h2>
            <Link to="/products" className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-2">
              View All <i className="bi bi-arrow-right"></i>
            </Link>
          </div>

          {displayedProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {displayedProducts.slice(0, 4).map((product) => {
                  const stockStatus = getStockStatus(product.quantity);
                  const isLatest = latestProduct && product._id === latestProduct._id;
                  
                  return (
                    <Link to={`/product/${product._id}`} key={product._id} className="group">
                      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <div className="relative h-64 overflow-hidden">
                          <img
                            src={product.image || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&auto=format"}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                              e.target.src = "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&auto=format";
                            }}
                          />
                          {isLatest && (
                            <span className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                              <i className="bi bi-stars mr-1"></i>
                              New
                            </span>
                          )}
                        </div>
                        
                        <div className="p-5">
                          <h3 className="font-semibold text-gray-800 mb-2">{product.name}</h3>
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            <span className="bg-gray-100 px-2 py-1 rounded-md text-xs text-gray-600">
                              {product.size}
                            </span>
                            <span className="bg-gray-100 px-2 py-1 rounded-md text-xs text-gray-600 flex items-center gap-1">
                              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: product.color.code }}></span>
                              {product.color.name}
                            </span>
                            <span className="bg-gray-100 px-2 py-1 rounded-md text-xs text-gray-600">
                              {product.fabric}
                            </span>
                          </div>

                          <div className="flex justify-between items-center mb-3">
                            <span className="text-2xl font-bold text-blue-600">₹{product.sellingRate}</span>
                            <span className={`text-sm ${stockStatus.class === 'success' ? 'text-green-600' : stockStatus.class === 'warning' ? 'text-orange-600' : 'text-red-600'}`}>
                              {product.quantity} units
                            </span>
                          </div>

                          <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4">
                            <div 
                              className={`h-1.5 rounded-full ${stockStatus.bg}`}
                              style={{ width: `${getStockPercentage(product.quantity)}%` }}
                            ></div>
                          </div>

                          <span className="inline-flex items-center gap-1 text-blue-600 group-hover:gap-2 transition-all">
                            View Details <i className="bi bi-arrow-right"></i>
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              <div className="text-center mt-8">
                <Link 
                  to="/products" 
                  className="inline-flex items-center gap-2 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-3 rounded-full font-semibold transition-all duration-300"
                >
                  Browse All Products <i className="bi bi-arrow-right"></i>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
              <i className="bi bi-emoji-frown text-5xl text-gray-400"></i>
              <p className="text-gray-500 mt-3">No products found</p>
            </div>
          )}
        </section>

        {/* Business Info Card */}
        <section className="mb-12">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="grid md:grid-cols-2">
              {/* Store Information */}
              <div className="p-8 text-white">
                <h3 className="text-2xl font-bold mb-6">Store Information</h3>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="bg-white/10 rounded-lg p-2 h-fit">
                      <i className="bi bi-geo-alt text-blue-400"></i>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Address</p>
                      <p className="font-medium">{businessData.address?.fullAddress}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="bg-white/10 rounded-lg p-2 h-fit">
                      <i className="bi bi-telephone text-blue-400"></i>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Phone</p>
                      {primaryPhone && (
                        <a href={`tel:${primaryPhone.number}`} className="font-medium hover:text-blue-400 transition-colors">
                          {primaryPhone.number}
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="bg-white/10 rounded-lg p-2 h-fit">
                      <i className="bi bi-envelope text-blue-400"></i>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Email</p>
                      {primaryEmail && (
                        <a href={`mailto:${primaryEmail.email}`} className="font-medium hover:text-blue-400 transition-colors">
                          {primaryEmail.email}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Store Hours */}
              <div className="bg-white/5 p-8 text-white">
                <h3 className="text-2xl font-bold mb-6">Store Hours</h3>
                <div className="space-y-3">
                  {Object.entries(businessData.businessHours).map(([day, hours]) => (
                    <div key={day} className="flex justify-between items-center border-b border-white/10 pb-2 last:border-0">
                      <span className="capitalize font-medium">{day}</span>
                      <span className="text-gray-300">
                        {hours.closed ? 'Closed' : `${formatTime(hours.open)} - ${formatTime(hours.close)}`}
                      </span>
                    </div>
                  ))}
                </div>
                <hr className="my-6 border-white/10" />
                <p className="text-sm text-gray-400 flex items-start gap-2">
                  <i className="bi bi-info-circle text-blue-400 mt-1"></i>
                  Visit our showroom to try and purchase items
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-blue-50 w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center">
              <i className="bi bi-shop text-blue-600 text-xl"></i>
            </div>
            <h6 className="font-semibold text-gray-800">Showroom Only</h6>
            <p className="text-xs text-gray-500 mt-1">Try before buy</p>
          </div>

          <div className="bg-white rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-green-50 w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center">
              <i className="bi bi-rulers text-green-600 text-xl"></i>
            </div>
            <h6 className="font-semibold text-gray-800">Free Fitting</h6>
            <p className="text-xs text-gray-500 mt-1">In-store trials</p>
          </div>

          <div className="bg-white rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-purple-50 w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center">
              <i className="bi bi-award text-purple-600 text-xl"></i>
            </div>
            <h6 className="font-semibold text-gray-800">Premium Quality</h6>
            <p className="text-xs text-gray-500 mt-1">100% genuine</p>
          </div>

          <div className="bg-white rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-orange-50 w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center">
              <i className="bi bi-person-badge text-orange-600 text-xl"></i>
            </div>
            <h6 className="font-semibold text-gray-800">Expert Staff</h6>
            <p className="text-xs text-gray-500 mt-1">Fashion consultants</p>
          </div>
        </section>
      </div>

      {/* Back to Top Button */}
      <button 
        className={`fixed bottom-8 right-8 w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:shadow-xl ${!showBackToTop ? 'opacity-0 invisible' : 'opacity-100 visible'}`}
        onClick={scrollToTop}
        aria-label="Back to top"
      >
        <i className="bi bi-arrow-up"></i>
      </button>
    </div>
  );
}

export default Home;