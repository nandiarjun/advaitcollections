import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { productsAPI } from "../services/api";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSize, setSelectedSize] = useState("all");
  const [selectedColor, setSelectedColor] = useState("all");
  const [selectedFabric, setSelectedFabric] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  
  // Pagination
  const [visibleProducts, setVisibleProducts] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);

  // Categories
  const categories = [
    { id: 1, name: "Men's Wear", icon: "bi-person-standing" },
    { id: 2, name: "Women's Wear", icon: "bi-person-standing-dress" },
    { id: 3, name: "Kids Wear", icon: "bi-emoji-smile" },
    { id: 4, name: "Winter Wear", icon: "bi-snow" },
    { id: 5, name: "Footwear", icon: "bi-shoe-prints" },
    { id: 6, name: "Accessories", icon: "bi-gem" }
  ];

  const sizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
  
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

  const fabrics = ["Cotton", "Polyester", "Silk", "Linen", "Wool", "Denim", "Nylon", "Rayon"];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productsAPI.getAllProducts();
      
      // Enhance products with additional attributes for demo
      const enhancedProducts = data.map((product) => ({
        ...product,
        category: categories[Math.floor(Math.random() * categories.length)].name,
        size: sizes[Math.floor(Math.random() * sizes.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        fabric: fabrics[Math.floor(Math.random() * fabrics.length)],
        rating: (3.5 + Math.random() * 1.5).toFixed(1),
        reviews: Math.floor(Math.random() * 100) + 10
      }));
      
      setProducts(enhancedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError(error.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  // Filter products
  const getFilteredProducts = () => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.fabric?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Size filter
    if (selectedSize !== "all") {
      filtered = filtered.filter(p => p.size === selectedSize);
    }

    // Color filter
    if (selectedColor !== "all") {
      filtered = filtered.filter(p => p.color.name === selectedColor);
    }

    // Fabric filter
    if (selectedFabric !== "all") {
      filtered = filtered.filter(p => p.fabric === selectedFabric);
    }

    // Price range filter
    filtered = filtered.filter(p => 
      p.sellingRate >= priceRange.min && p.sellingRate <= priceRange.max
    );

    // Sorting
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
      case "name-desc":
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "stock":
        filtered.sort((a, b) => b.quantity - a.quantity);
        break;
      default:
        // Featured - in stock first, then by rating
        filtered.sort((a, b) => {
          if (a.quantity > 0 && b.quantity === 0) return -1;
          if (a.quantity === 0 && b.quantity > 0) return 1;
          return b.rating - a.rating;
        });
    }

    return filtered;
  };

  const filteredProducts = getFilteredProducts();
  const displayedProducts = filteredProducts.slice(0, visibleProducts);

  const getStockPercentage = (quantity) => {
    const max = 50;
    return Math.min((quantity / max) * 100, 100);
  };

  const getStockStatus = (quantity) => {
    if (quantity <= 0) return { text: 'Out of Stock', class: 'danger' };
    if (quantity < 10) return { text: 'Low Stock', class: 'warning' };
    return { text: 'In Stock', class: 'success' };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const clearAllFilters = () => {
    setSelectedCategory("all");
    setSelectedSize("all");
    setSelectedColor("all");
    setSelectedFabric("all");
    setSearchTerm("");
    setSortBy("featured");
    setPriceRange({ min: 0, max: 10000 });
    setVisibleProducts(12);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading amazing products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5 text-center">
        <i className="bi bi-exclamation-triangle display-1 text-danger"></i>
        <h3 className="mt-3">Oops! Something went wrong</h3>
        <p className="text-muted">{error}</p>
        <button className="btn btn-primary mt-3" onClick={fetchProducts}>
          <i className="bi bi-arrow-repeat me-2"></i>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Header with Stats */}
      <div className="row align-items-center mb-4">
        <div className="col-md-8">
          <h1 className="fw-bold mb-2">Our Collection</h1>
          <p className="text-muted mb-0">
            Discover {filteredProducts.length} amazing products
          </p>
        </div>
        <div className="col-md-4">
          <div className="d-flex gap-2 justify-content-md-end">
            <div className="bg-light rounded p-2 px-3">
              <small className="text-muted">In Stock</small>
              <h6 className="mb-0">{products.filter(p => p.quantity > 0).length}</h6>
            </div>
            <div className="bg-light rounded p-2 px-3">
              <small className="text-muted">Categories</small>
              <h6 className="mb-0">{categories.length}</h6>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Row */}
      <div className="row g-3 mb-4">
        <div className="col-lg-3 col-md-6">
          <div className="input-group">
            <span className="input-group-text bg-white">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="col-lg-2 col-md-6">
          <select
            className="form-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="col-lg-2 col-md-6">
          <select
            className="form-select"
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
          >
            <option value="all">All Sizes</option>
            {sizes.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>

        <div className="col-lg-2 col-md-6">
          <select
            className="form-select"
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
          >
            <option value="all">All Colors</option>
            {colors.map(color => (
              <option key={color.name} value={color.name}>{color.name}</option>
            ))}
          </select>
        </div>

        <div className="col-lg-2 col-md-6">
          <select
            className="form-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
            <option value="rating">Top Rated</option>
            <option value="stock">Stock: High to Low</option>
          </select>
        </div>

        <div className="col-lg-1 col-md-6">
          <button
            className="btn btn-outline-secondary w-100"
            onClick={clearAllFilters}
            title="Clear all filters"
          >
            <i className="bi bi-arrow-repeat"></i>
          </button>
        </div>
      </div>

      {/* Active Filters */}
      {(selectedCategory !== "all" || selectedSize !== "all" || selectedColor !== "all" || searchTerm) && (
        <div className="mb-4">
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <small className="text-muted me-2">Active filters:</small>
            {selectedCategory !== "all" && (
              <span className="badge bg-light text-dark py-2 px-3">
                {selectedCategory}
                <button 
                  className="btn-close btn-close-sm ms-2" 
                  style={{ fontSize: '0.5rem' }}
                  onClick={() => setSelectedCategory("all")}
                ></button>
              </span>
            )}
            {selectedSize !== "all" && (
              <span className="badge bg-light text-dark py-2 px-3">
                Size: {selectedSize}
                <button 
                  className="btn-close btn-close-sm ms-2" 
                  style={{ fontSize: '0.5rem' }}
                  onClick={() => setSelectedSize("all")}
                ></button>
              </span>
            )}
            {selectedColor !== "all" && (
              <span className="badge bg-light text-dark py-2 px-3">
                Color: {selectedColor}
                <button 
                  className="btn-close btn-close-sm ms-2" 
                  style={{ fontSize: '0.5rem' }}
                  onClick={() => setSelectedColor("all")}
                ></button>
              </span>
            )}
            {searchTerm && (
              <span className="badge bg-light text-dark py-2 px-3">
                Search: "{searchTerm}"
                <button 
                  className="btn-close btn-close-sm ms-2" 
                  style={{ fontSize: '0.5rem' }}
                  onClick={() => setSearchTerm("")}
                ></button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Results count */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <span className="text-muted">
          Showing {displayedProducts.length} of {filteredProducts.length} products
        </span>
        <div className="btn-group btn-group-sm">
          <button 
            className={`btn ${visibleProducts === 12 ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setVisibleProducts(12)}
          >
            12
          </button>
          <button 
            className={`btn ${visibleProducts === 24 ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setVisibleProducts(24)}
          >
            24
          </button>
          <button 
            className={`btn ${visibleProducts === 48 ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setVisibleProducts(48)}
          >
            48
          </button>
        </div>
      </div>

      {/* Products Grid */}
      {displayedProducts.length > 0 ? (
        <>
          <div className="row g-4">
            {displayedProducts.map((product) => {
              const stockStatus = getStockStatus(product.quantity);
              return (
                <div key={product._id} className="col-6 col-md-4 col-lg-3">
                  <Link to={`/product/${product._id}`} style={{ textDecoration: 'none' }}>
                    <div className="card h-100 border-0 shadow-sm product-card">
                      <div className="position-relative" style={{ height: '220px', overflow: 'hidden' }}>
                        <img
                          src={product.image || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&auto=format"}
                          className="card-img-top"
                          alt={product.name}
                          style={{ height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&auto=format";
                          }}
                        />
                        {product.quantity < 10 && product.quantity > 0 && (
                          <span className="position-absolute top-0 end-0 m-2 badge bg-warning">
                            Low Stock
                          </span>
                        )}
                        {product.quantity === 0 && (
                          <span className="position-absolute top-0 end-0 m-2 badge bg-danger">
                            Out of Stock
                          </span>
                        )}
                      </div>
                      <div className="card-body">
                        <h6 className="card-title text-dark fw-semibold mb-1">{product.name}</h6>
                        
                        {/* Rating */}
                        <div className="d-flex align-items-center mb-2">
                          <div className="text-warning small me-1">
                            {'★'.repeat(Math.floor(product.rating))}
                            {'☆'.repeat(5 - Math.floor(product.rating))}
                          </div>
                          <small className="text-muted">({product.reviews})</small>
                        </div>

                        {/* Tags */}
                        <div className="d-flex flex-wrap gap-1 mb-2">
                          <span className="badge bg-light text-dark">{product.size}</span>
                          <span className="badge bg-light text-dark">
                            <span className="d-inline-block rounded-circle me-1" style={{ 
                              width: '10px', 
                              height: '10px', 
                              backgroundColor: product.color.code 
                            }}></span>
                            {product.color.name}
                          </span>
                          <span className="badge bg-light text-dark">{product.fabric}</span>
                        </div>

                        {/* Price and Stock */}
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="fw-bold text-primary fs-5">
                            {formatCurrency(product.sellingRate)}
                          </span>
                          <span className={`small text-${stockStatus.class}`}>
                            {product.quantity} left
                          </span>
                        </div>

                        {/* Stock Progress */}
                        <div className="progress" style={{ height: '4px' }}>
                          <div
                            className={`progress-bar bg-${stockStatus.class}`}
                            style={{ width: `${getStockPercentage(product.quantity)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Load More Button */}
          {filteredProducts.length > visibleProducts && (
            <div className="text-center mt-5">
              <button
                className="btn btn-outline-primary btn-lg px-5"
                onClick={() => setVisibleProducts(prev => prev + 12)}
              >
                Load More Products
                <i className="bi bi-arrow-down ms-2"></i>
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-5">
          <div className="mb-4">
            <i className="bi bi-emoji-frown display-1 text-muted"></i>
          </div>
          <h4 className="fw-semibold mb-2">No Products Found</h4>
          <p className="text-muted mb-4">We couldn't find any products matching your criteria.</p>
          <button
            className="btn btn-primary px-4"
            onClick={clearAllFilters}
          >
            <i className="bi bi-arrow-repeat me-2"></i>
            Clear All Filters
          </button>
        </div>
      )}

      {/* Add custom CSS for card hover effect */}
      <style jsx="true">{`
        .product-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important;
        }
      `}</style>
    </div>
  );
}

export default Products;