import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { productsAPI } from "../services/api";
import "./AllProductList.css";

function AllProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filterStock, setFilterStock] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    
    const token = localStorage.getItem("adminToken");
    
    if (!token) {
      window.location.href = '/admin-login';
      return;
    }

    try {
      const data = await productsAPI.getAllProducts();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return;
    
    setDeleteLoading(true);
    try {
      await productsAPI.deleteProduct(selectedProduct._id);
      setProducts(products.filter(p => p._id !== selectedProduct._id));
      setShowDeleteModal(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setSelectedProduct(null);
  };

  // Filter and sort products
  const getFilteredProducts = () => {
    let filtered = [...products];

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(term) ||
        product.barcode.toLowerCase().includes(term)
      );
    }

    // Apply stock filter
    if (filterStock === "in-stock") {
      filtered = filtered.filter(p => p.quantity > 10);
    } else if (filterStock === "low-stock") {
      filtered = filtered.filter(p => p.quantity > 0 && p.quantity <= 10);
    } else if (filterStock === "out-of-stock") {
      filtered = filtered.filter(p => p.quantity === 0);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (sortBy === "name") {
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
      } else if (sortBy === "quantity" || sortBy === "purchaseRate" || sortBy === "sellingRate") {
        aVal = Number(a[sortBy]);
        bVal = Number(b[sortBy]);
      }
      
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  };

  const filteredProducts = getFilteredProducts();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  const getStockStatus = (quantity) => {
    if (quantity === 0) return { label: "Out of Stock", class: "out-of-stock", icon: "bi-x-circle" };
    if (quantity <= 10) return { label: "Low Stock", class: "low-stock", icon: "bi-exclamation-triangle" };
    return { label: "In Stock", class: "in-stock", icon: "bi-check-circle" };
  };

  if (loading) {
    return (
      <div className="apl-loading">
        <div className="apl-spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="apl-error">
        <i className="bi bi-exclamation-triangle-fill"></i>
        <h3>Error</h3>
        <p>{error}</p>
        <button className="apl-btn-primary" onClick={fetchProducts}>
          <i className="bi bi-arrow-repeat"></i> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="apl-container">
      {/* Header */}
      <div className="apl-header">
        <div className="apl-title-section">
          <h1>
            <i className="bi bi-boxes"></i>
            All Products
          </h1>
          <p>Total {products.length} products in inventory</p>
        </div>
        <div className="apl-header-actions">
          <Link to="/admin-dashboard" className="apl-back-btn">
            <i className="bi bi-arrow-left"></i> Dashboard
          </Link>
          <Link to="/add-product" className="apl-add-btn">
            <i className="bi bi-plus-lg"></i> Add Product
          </Link>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="apl-filters-bar">
        <div className="apl-search-wrapper">
          <i className="bi bi-search apl-search-icon"></i>
          <input
            type="text"
            className="apl-search-input"
            placeholder="Search by name or barcode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="apl-filter-group">
          {/* View Toggle */}
          <div className="apl-view-toggle">
            <button 
              className={`apl-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <i className="bi bi-grid-3x3-gap-fill"></i>
            </button>
            <button 
              className={`apl-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <i className="bi bi-list-ul"></i>
            </button>
          </div>

          <select 
            className="apl-filter-select"
            value={filterStock}
            onChange={(e) => setFilterStock(e.target.value)}
          >
            <option value="all">All Stock</option>
            <option value="in-stock">In Stock (&gt;10)</option>
            <option value="low-stock">Low Stock (1-10)</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>

          <select 
            className="apl-filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name">Sort by Name</option>
            <option value="quantity">Sort by Stock</option>
            <option value="purchaseRate">Sort by Purchase Price</option>
            <option value="sellingRate">Sort by Selling Price</option>
          </select>

          <button 
            className="apl-sort-order-btn"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            title={sortOrder === "asc" ? "Ascending" : "Descending"}
          >
            <i className={`bi bi-arrow-${sortOrder === "asc" ? "up" : "down"}`}></i>
          </button>

          <button className="apl-refresh-btn" onClick={fetchProducts} title="Refresh">
            <i className="bi bi-arrow-repeat"></i>
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="apl-stats-grid">
        <div className="apl-stat-card">
          <i className="bi bi-box-seam"></i>
          <div className="apl-stat-info">
            <span className="apl-stat-label">Total Products</span>
            <span className="apl-stat-value">{products.length}</span>
          </div>
        </div>
        <div className="apl-stat-card">
          <i className="bi bi-cubes"></i>
          <div className="apl-stat-info">
            <span className="apl-stat-label">Total Stock</span>
            <span className="apl-stat-value">
              {products.reduce((acc, p) => acc + p.quantity, 0)}
            </span>
          </div>
        </div>
        <div className="apl-stat-card">
          <i className="bi bi-exclamation-triangle"></i>
          <div className="apl-stat-info">
            <span className="apl-stat-label">Low Stock</span>
            <span className="apl-stat-value warning">
              {products.filter(p => p.quantity > 0 && p.quantity <= 10).length}
            </span>
          </div>
        </div>
        <div className="apl-stat-card">
          <i className="bi bi-x-circle"></i>
          <div className="apl-stat-info">
            <span className="apl-stat-label">Out of Stock</span>
            <span className="apl-stat-value danger">
              {products.filter(p => p.quantity === 0).length}
            </span>
          </div>
        </div>
      </div>

      {/* Products Display - Grid or List View */}
      {filteredProducts.length > 0 ? (
        viewMode === 'grid' ? (
          /* Grid View */
          <div className="apl-products-grid">
            {filteredProducts.map(product => {
              const stockStatus = getStockStatus(product.quantity);
              const profit = product.sellingRate - product.purchaseRate;
              const profitMargin = ((profit / product.purchaseRate) * 100).toFixed(1);
              
              return (
                <div key={product._id} className="apl-product-card">
                  <div className="apl-card-header">
                    <div className="apl-product-icon">
                      <i className="bi bi-box"></i>
                    </div>
                    <div className={`apl-stock-badge ${stockStatus.class}`}>
                      <i className={`bi ${stockStatus.icon} me-1`}></i>
                      {stockStatus.label}
                    </div>
                  </div>
                  
                  <div className="apl-card-body">
                    <h3 className="apl-product-name">{product.name}</h3>
                    <div className="apl-product-barcode">
                      <i className="bi bi-upc-scan"></i>
                      <span>{product.barcode}</span>
                    </div>
                    
                    <div className="apl-product-details">
                      <div className="apl-detail-row">
                        <span className="apl-detail-label">Stock:</span>
                        <span className={`apl-detail-value ${product.quantity === 0 ? 'danger' : ''}`}>
                          {product.quantity} units
                        </span>
                      </div>
                      <div className="apl-detail-row">
                        <span className="apl-detail-label">Purchase:</span>
                        <span className="apl-detail-value purchase">
                          {formatCurrency(product.purchaseRate)}
                        </span>
                      </div>
                      <div className="apl-detail-row">
                        <span className="apl-detail-label">Selling:</span>
                        <span className="apl-detail-value selling">
                          {formatCurrency(product.sellingRate)}
                        </span>
                      </div>
                      <div className="apl-detail-row">
                        <span className="apl-detail-label">GST:</span>
                        <span className="apl-detail-value">{product.gst || 0}%</span>
                      </div>
                      <div className="apl-detail-row profit">
                        <span className="apl-detail-label">Profit/unit:</span>
                        <span className={`apl-detail-value ${profit >= 0 ? 'success' : 'danger'}`}>
                          {formatCurrency(profit)} ({profitMargin}%)
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="apl-card-footer">
                    <Link 
                      to={`/admin-dashboard/edit-product/${product._id}`} 
                      className="apl-btn-edit"
                      title="Edit Product"
                    >
                      <i className="bi bi-pencil-square"></i>
                      Edit
                    </Link>
                    <button 
                      className="apl-btn-delete"
                      onClick={() => handleDeleteClick(product)}
                      title="Delete Product"
                    >
                      <i className="bi bi-trash3"></i>
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="apl-list-view">
            <table className="apl-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Barcode</th>
                  <th className="text-center">Stock</th>
                  <th className="text-end">Purchase</th>
                  <th className="text-end">Selling</th>
                  <th className="text-end">GST</th>
                  <th className="text-end">Profit/Unit</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => {
                  const stockStatus = getStockStatus(product.quantity);
                  const profit = product.sellingRate - product.purchaseRate;
                  const profitMargin = ((profit / product.purchaseRate) * 100).toFixed(1);
                  
                  return (
                    <tr key={product._id}>
                      <td>
                        <div className="apl-product-cell">
                          <div className="apl-product-icon-small">
                            <i className="bi bi-box"></i>
                          </div>
                          <span className="apl-product-name-list">{product.name}</span>
                        </div>
                      </td>
                      <td>
                        <code className="apl-barcode">{product.barcode}</code>
                      </td>
                      <td className="text-center">
                        <span className={`apl-stock-badge ${stockStatus.class}`}>
                          <i className={`bi ${stockStatus.icon} me-1`}></i>
                          {product.quantity}
                        </span>
                      </td>
                      <td className="text-end apl-text-danger">{formatCurrency(product.purchaseRate)}</td>
                      <td className="text-end apl-text-success">{formatCurrency(product.sellingRate)}</td>
                      <td className="text-end">{product.gst || 0}%</td>
                      <td className="text-end">
                        <span className={profit >= 0 ? 'apl-text-success' : 'apl-text-danger'}>
                          {formatCurrency(profit)} ({profitMargin}%)
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="apl-action-group">
                          <Link 
                            to={`/admin-dashboard/edit-product/${product._id}`} 
                            className="apl-action-btn apl-btn-edit-list"
                            title="Edit Product"
                          >
                            <i className="bi bi-pencil"></i>
                          </Link>
                          <button 
                            className="apl-action-btn apl-btn-delete-list"
                            onClick={() => handleDeleteClick(product)}
                            title="Delete Product"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="apl-empty-state">
          <i className="bi bi-inbox"></i>
          <h3>No Products Found</h3>
          <p>
            {searchTerm || filterStock !== "all" 
              ? "No products match your filters. Try adjusting your search criteria."
              : "You haven't added any products yet."}
          </p>
          {(searchTerm || filterStock !== "all") && (
            <button 
              className="apl-btn-primary"
              onClick={() => {
                setSearchTerm("");
                setFilterStock("all");
              }}
            >
              <i className="bi bi-arrow-repeat"></i> Clear Filters
            </button>
          )}
          {!searchTerm && filterStock === "all" && (
            <Link to="/add-product" className="apl-btn-primary">
              <i className="bi bi-plus-lg"></i> Add Your First Product
            </Link>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedProduct && (
        <div className="apl-modal-overlay">
          <div className="apl-modal">
            <div className="apl-modal-header">
              <i className="bi bi-exclamation-triangle-fill"></i>
              <h3>Delete Product</h3>
            </div>
            <div className="apl-modal-body">
              <p>Are you sure you want to delete <strong>"{selectedProduct.name}"</strong>?</p>
              <p className="apl-modal-warning">This action cannot be undone.</p>
            </div>
            <div className="apl-modal-footer">
              <button 
                className="apl-btn-secondary"
                onClick={handleDeleteCancel}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button 
                className="apl-btn-danger"
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <>
                    <span className="apl-spinner-small"></span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <i className="bi bi-trash3"></i>
                    Delete Product
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AllProductList;