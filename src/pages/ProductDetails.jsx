import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { productsAPI } from "../services/api";

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState("description");

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all products
      const allProducts = await productsAPI.getAllProducts();
      
      // Find the product by ID
      const foundProduct = allProducts.find(p => p._id === id);
      
      if (!foundProduct) {
        setError("Product not found");
        return;
      }

      // Enhanced product with additional details
      const sizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
      const colors = [
        { name: "Black", code: "#000000" },
        { name: "White", code: "#FFFFFF" },
        { name: "Red", code: "#FF0000" },
        { name: "Blue", code: "#0000FF" },
        { name: "Green", code: "#00FF00" },
        { name: "Purple", code: "#800080" }
      ];
      const fabrics = ["Cotton", "Polyester", "Silk", "Linen", "Wool", "Denim"];
      const patterns = ["Solid", "Printed", "Striped", "Checked", "Embroidered"];
      
      // Generate multiple product images
      const productImages = [
        foundProduct.image || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&auto=format",
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format",
        "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=800&auto=format",
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format"
      ];

      const enhancedProduct = {
        ...foundProduct,
        size: sizes[Math.floor(Math.random() * sizes.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        fabric: fabrics[Math.floor(Math.random() * fabrics.length)],
        pattern: patterns[Math.floor(Math.random() * patterns.length)],
        rating: (3.5 + Math.random() * 1.5).toFixed(1),
        reviews: Math.floor(Math.random() * 200) + 20,
        images: productImages,
        description: "Premium quality fabric with elegant design. Perfect for any occasion. Features include comfortable fit, durable stitching, and trendy patterns. This piece is crafted with attention to detail and designed to provide both style and comfort.",
        features: [
          "Premium quality fabric",
          "Comfortable fit",
          "Durable stitching",
          "Trendy design",
          "Easy care instructions",
          "Perfect for all occasions"
        ],
        careInstructions: [
          "Machine wash cold",
          "Do not bleach",
          "Tumble dry low",
          "Iron low heat"
        ]
      };
      
      setProduct(enhancedProduct);
      
      // Get related products (excluding current product)
      const related = allProducts
        .filter(p => p._id !== id)
        .slice(0, 4)
        .map(p => ({
          ...p,
          size: sizes[Math.floor(Math.random() * sizes.length)],
          color: colors[Math.floor(Math.random() * colors.length)],
          rating: (3.5 + Math.random() * 1.5).toFixed(1)
        }));
      
      setRelatedProducts(related);
      
    } catch (error) {
      console.error("Error fetching product:", error);
      setError(error.message || "Failed to load product details");
    } finally {
      setLoading(false);
    }
  };

  const getStockPercentage = (quantity) => {
    const max = 50;
    return Math.min((quantity / max) * 100, 100);
  };

  const getStockStatus = (quantity) => {
    if (quantity <= 0) return { text: 'Out of Stock', class: 'danger', icon: 'bi-x-circle' };
    if (quantity < 10) return { text: 'Low Stock', class: 'warning', icon: 'bi-exclamation-triangle' };
    return { text: 'In Stock', class: 'success', icon: 'bi-check-circle' };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container py-5 text-center">
        <div className="mb-4">
          <i className="bi bi-exclamation-triangle display-1 text-danger"></i>
        </div>
        <h3 className="fw-semibold mb-2">Product Not Found</h3>
        <p className="text-muted mb-4">{error || "The product you're looking for doesn't exist."}</p>
        <div className="d-flex gap-3 justify-content-center">
          <Link to="/" className="btn btn-outline-primary">
            <i className="bi bi-house-door me-2"></i>
            Go Home
          </Link>
          <Link to="/products" className="btn btn-primary">
            <i className="bi bi-grid me-2"></i>
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const stockStatus = getStockStatus(product.quantity);

  return (
    <div className="container py-4">
      {/* Breadcrumb */}
      <nav className="mb-4" aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/" className="text-decoration-none">
              <i className="bi bi-house-door me-1"></i>
              Home
            </Link>
          </li>
          <li className="breadcrumb-item">
            <Link to="/products" className="text-decoration-none">Products</Link>
          </li>
          <li className="breadcrumb-item active text-truncate" style={{ maxWidth: '300px' }}>
            {product.name}
          </li>
        </ol>
      </nav>

      {/* Product Details */}
      <div className="row g-4 mb-5">
        {/* Product Images */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm overflow-hidden mb-3">
            <div className="position-relative" style={{ height: '500px' }}>
              <img
                src={product.images[selectedImage]}
                className="img-fluid w-100 h-100"
                alt={product.name}
                style={{ objectFit: 'cover' }}
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&auto=format";
                }}
              />
              {product.quantity === 0 && (
                <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center">
                  <span className="badge bg-danger p-3 fs-6">Out of Stock</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Thumbnail Images */}
          {product.images.length > 1 && (
            <div className="row g-2">
              {product.images.map((img, index) => (
                <div className="col-3" key={index}>
                  <div 
                    className={`card border-0 shadow-sm overflow-hidden cursor-pointer ${selectedImage === index ? 'border border-primary' : ''}`}
                    style={{ height: '100px', cursor: 'pointer' }}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img
                      src={img}
                      className="img-fluid w-100 h-100"
                      alt={`${product.name} view ${index + 1}`}
                      style={{ objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=200&auto=format";
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="col-lg-6">
          <div className="card border-0 p-4">
            {/* Title and Rating */}
            <div className="mb-3">
              <h1 className="fw-bold mb-2">{product.name}</h1>
              <div className="d-flex align-items-center gap-3">
                <div className="d-flex align-items-center">
                  <div className="text-warning me-2">
                    {'★'.repeat(Math.floor(product.rating))}
                    {'☆'.repeat(5 - Math.floor(product.rating))}
                  </div>
                  <span className="text-muted">({product.reviews} reviews)</span>
                </div>
                <span className={`badge bg-${stockStatus.class} bg-opacity-10 text-${stockStatus.class} px-3 py-2`}>
                  <i className={`bi ${stockStatus.icon} me-1`}></i>
                  {stockStatus.text}
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="mb-4">
              <span className="display-6 fw-bold text-primary">{formatCurrency(product.sellingRate)}</span>
              {product.purchaseRate && (
                <>
                  <span className="text-muted text-decoration-line-through ms-2">
                    {formatCurrency(product.purchaseRate)}
                  </span>
                  <span className="badge bg-success ms-3">
                    {Math.round(((product.purchaseRate - product.sellingRate) / product.purchaseRate) * 100)}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Tabs */}
            <div className="mb-4">
              <ul className="nav nav-tabs border-0">
                <li className="nav-item">
                  <button 
                    className={`nav-link border-0 ${activeTab === 'description' ? 'active bg-light' : ''}`}
                    onClick={() => setActiveTab('description')}
                  >
                    Description
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link border-0 ${activeTab === 'details' ? 'active bg-light' : ''}`}
                    onClick={() => setActiveTab('details')}
                  >
                    Details
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link border-0 ${activeTab === 'care' ? 'active bg-light' : ''}`}
                    onClick={() => setActiveTab('care')}
                  >
                    Care
                  </button>
                </li>
              </ul>

              <div className="tab-content pt-3">
                {activeTab === 'description' && (
                  <div>
                    <p className="text-muted mb-0">{product.description}</p>
                  </div>
                )}

                {activeTab === 'details' && (
                  <div className="row g-3">
                    <div className="col-6">
                      <div className="bg-light p-3 rounded">
                        <small className="text-muted d-block">Size</small>
                        <span className="fw-semibold">{product.size}</span>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="bg-light p-3 rounded">
                        <small className="text-muted d-block">Color</small>
                        <div className="d-flex align-items-center gap-2">
                          <span className="d-inline-block rounded-circle" style={{ 
                            width: '16px', 
                            height: '16px', 
                            backgroundColor: product.color.code,
                            border: '1px solid #ddd'
                          }}></span>
                          <span className="fw-semibold">{product.color.name}</span>
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="bg-light p-3 rounded">
                        <small className="text-muted d-block">Fabric</small>
                        <span className="fw-semibold">{product.fabric}</span>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="bg-light p-3 rounded">
                        <small className="text-muted d-block">Pattern</small>
                        <span className="fw-semibold">{product.pattern}</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'care' && (
                  <div className="bg-light p-3 rounded">
                    <h6 className="fw-semibold mb-2">Care Instructions</h6>
                    <ul className="list-unstyled mb-0">
                      {product.careInstructions.map((instruction, index) => (
                        <li key={index} className="mb-2">
                          <i className="bi bi-check-circle-fill text-success me-2 small"></i>
                          {instruction}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Features */}
            <div className="mb-4">
              <h6 className="fw-semibold mb-2">Key Features</h6>
              <div className="row g-2">
                {product.features.map((feature, index) => (
                  <div className="col-6" key={index}>
                    <div className="d-flex align-items-center">
                      <i className="bi bi-check-lg text-success me-2"></i>
                      <small>{feature}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stock Progress */}
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted">Available Stock</span>
                <span className={`fw-semibold text-${stockStatus.class}`}>
                  {product.quantity} units
                </span>
              </div>
              <div className="progress" style={{ height: '8px' }}>
                <div
                  className={`progress-bar bg-${stockStatus.class}`}
                  style={{ width: `${getStockPercentage(product.quantity)}%` }}
                ></div>
              </div>
            </div>

            {/* Showroom Message */}
            <div className="alert alert-info border-0 bg-light" role="alert">
              <div className="d-flex">
                <i className="bi bi-shop fs-4 me-3"></i>
                <div>
                  <h6 className="fw-semibold mb-1">Showroom Only</h6>
                  <p className="small text-muted mb-0">
                    This item is available for viewing in our showroom. Please visit us to try and purchase.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="d-flex gap-3">
              <Link to="/contact" className="btn btn-primary flex-grow-1">
                <i className="bi bi-envelope me-2"></i>
                Contact for Purchase
              </Link>
              <Link to="/products" className="btn btn-outline-secondary">
                <i className="bi bi-arrow-left"></i>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="fw-bold mb-0">You May Also Like</h3>
            <Link to="/products" className="text-primary text-decoration-none">
              View All <i className="bi bi-arrow-right"></i>
            </Link>
          </div>
          
          <div className="row g-4">
            {relatedProducts.map((item) => (
              <div key={item._id} className="col-6 col-md-3">
                <Link to={`/product/${item._id}`} style={{ textDecoration: 'none' }}>
                  <div className="card h-100 border-0 shadow-sm product-card">
                    <div className="position-relative" style={{ height: '200px', overflow: 'hidden' }}>
                      <img
                        src={item.image || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&auto=format"}
                        className="card-img-top"
                        alt={item.name}
                        style={{ height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&auto=format";
                        }}
                      />
                      {item.quantity < 10 && item.quantity > 0 && (
                        <span className="position-absolute top-0 end-0 m-2 badge bg-warning">
                          Low Stock
                        </span>
                      )}
                    </div>
                    <div className="card-body">
                      <h6 className="card-title text-dark fw-semibold mb-1">{item.name}</h6>
                      <div className="d-flex align-items-center mb-2">
                        <div className="text-warning small me-1">
                          {'★'.repeat(Math.floor(item.rating))}
                        </div>
                        <small className="text-muted">({item.reviews})</small>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-bold text-primary">{formatCurrency(item.sellingRate)}</span>
                        <span className="small text-muted">
                          <i className="bi bi-rulers me-1"></i>
                          {item.size}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Custom CSS for card hover effect */}
      <style jsx="true">{`
        .product-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important;
        }
        .cursor-pointer {
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

export default ProductDetails;