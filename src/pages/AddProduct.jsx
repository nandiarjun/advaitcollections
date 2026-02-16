import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { productsAPI } from "../services/api";
import "./AddProduct.css";

function AddProduct() {
  const navigate = useNavigate();
  const { id } = useParams(); // For edit mode from URL
  const [formData, setFormData] = useState({
    name: "",
    barcode: "",
    image: "",
    purchaseRate: "",
    sellingRate: "",
    quantity: "",
    gst: 0
  });

  const [products, setProducts] = useState([]);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteWarning, setDeleteWarning] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [salesHistory, setSalesHistory] = useState(null);
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // grid or list

  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    fetchProducts();
  }, []);

  // Check if we're in edit mode from URL
  useEffect(() => {
    if (id) {
      const product = products.find(p => p._id === id);
      if (product) {
        setEditId(product._id);
        setFormData({
          name: product.name,
          barcode: product.barcode,
          image: product.image || "",
          purchaseRate: product.purchaseRate,
          sellingRate: product.sellingRate,
          quantity: product.quantity,
          gst: product.gst || 0
        });
      }
    }
  }, [id, products]);

  const fetchProducts = async () => {
    try {
      setFetchLoading(true);
      setError(null);
      const data = await productsAPI.getAllProducts();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError(error.message || "Failed to load products");
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Product name is required");
      return false;
    }
    if (!formData.purchaseRate || formData.purchaseRate <= 0) {
      setError("Valid purchase rate is required");
      return false;
    }
    if (!formData.sellingRate || formData.sellingRate <= 0) {
      setError("Valid selling rate is required");
      return false;
    }
    if (Number(formData.sellingRate) <= Number(formData.purchaseRate)) {
      setError("Selling rate must be greater than purchase rate");
      return false;
    }
    if (!formData.quantity || formData.quantity < 0) {
      setError("Valid quantity is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!token) {
        window.location.href = '/admin-login';
        return;
      }

      if (editId) {
        // UPDATE
        await productsAPI.updateProduct(editId, formData, token);
        setSuccess("Product Updated Successfully ✅");
      } else {
        // ADD
        await productsAPI.addProduct(formData, token);
        setSuccess("Product Added Successfully ✅");
      }

      resetForm();
      await fetchProducts();

      // Auto-hide success message
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(error.message || "Something went wrong ❌");
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id, force = false) => {
    try {
      const response = await productsAPI.deleteProduct(id, token, force);

      if (response.hasSales) {
        // Show warning modal
        setDeleteWarning(response);
        setProductToDelete(id);
        setShowDeleteModal(true);
        setConfirmChecked(false);
      } else {
        // Successfully deleted
        await fetchProducts();
        setSuccess("Product deleted successfully");
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (error) {
      if (error.hasSales) {
        // Show warning modal
        setDeleteWarning(error);
        setProductToDelete(id);
        setShowDeleteModal(true);
        setConfirmChecked(false);
      } else {
        setError(error.message || "Error deleting product");
      }
    }
  };

  const handleForceDelete = async () => {
    setShowDeleteModal(false);
    setLoading(true);
    
    try {
      await productsAPI.deleteProduct(productToDelete, token, true);
      await fetchProducts();
      setSuccess("Product and all related sales history deleted successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(error.message || "Error deleting product");
    } finally {
      setLoading(false);
      setDeleteWarning(null);
      setProductToDelete(null);
      setConfirmChecked(false);
    }
  };

  const viewSalesHistory = async (productId) => {
    try {
      const response = await productsAPI.getProductSalesHistory(productId, token);
      setSalesHistory(response);
    } catch (error) {
      setError(error.message || "Error fetching sales history");
    }
  };

  const editProduct = (product) => {
    setEditId(product._id);
    setFormData({
      name: product.name,
      barcode: product.barcode,
      image: product.image || "",
      purchaseRate: product.purchaseRate,
      sellingRate: product.sellingRate,
      quantity: product.quantity,
      gst: product.gst || 0
    });
    // Update URL without reload
    navigate(`/admin-dashboard/edit-product/${product._id}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setError(null);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      barcode: "",
      image: "",
      purchaseRate: "",
      sellingRate: "",
      quantity: "",
      gst: 0
    });
    setEditId(null);
    // Navigate back to add product page
    navigate('/admin-dashboard/add-product');
    setError(null);
  };

  const closeModals = () => {
    setShowDeleteModal(false);
    setSalesHistory(null);
    setDeleteWarning(null);
    setProductToDelete(null);
    setConfirmChecked(false);
  };

  // Filter products based on search
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.barcode && product.barcode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Stock status helper
  const getStockStatus = (quantity) => {
    if (quantity === 0) return { label: "Out of Stock", class: "danger", icon: "bi-x-circle" };
    if (quantity <= 10) return { label: "Low Stock", class: "warning", icon: "bi-exclamation-triangle" };
    return { label: "In Stock", class: "success", icon: "bi-check-circle" };
  };

  return (
    <div className="ap-container">
      {/* Delete Warning Modal */}
      {showDeleteModal && deleteWarning && (
        <div className="ap-modal-overlay" onClick={(e) => {
          if (e.target === e.currentTarget) closeModals();
        }}>
          <div className="ap-modal ap-modal-danger">
            <div className="ap-modal-header">
              <i className="bi bi-exclamation-triangle-fill"></i>
              <h3>Warning: Product Has Sales History</h3>
              <button className="ap-modal-close" onClick={closeModals}>
                <i className="bi bi-x"></i>
              </button>
            </div>
            <div className="ap-modal-body">
              <p className="ap-warning-text">
                This product has <span className="ap-badge-danger">{deleteWarning.salesCount}</span> sales records.
              </p>
              <p>Deleting this product will also delete all associated sales history. This action cannot be undone.</p>
              
              <div className="ap-alert-warning">
                <h6>This will delete:</h6>
                <ul>
                  <li>Product details and inventory</li>
                  <li>{deleteWarning.salesCount} sales transactions</li>
                  <li>All profit/loss records for this product</li>
                </ul>
              </div>

              <div className="ap-checkbox">
                <input 
                  type="checkbox" 
                  id="confirmDelete"
                  checked={confirmChecked}
                  onChange={(e) => setConfirmChecked(e.target.checked)}
                />
                <label htmlFor="confirmDelete">
                  I understand this action cannot be undone and want to delete permanently
                </label>
              </div>
            </div>
            <div className="ap-modal-footer">
              <button className="ap-btn-secondary" onClick={closeModals}>
                <i className="bi bi-x-circle"></i>
                Cancel
              </button>
              <button 
                className="ap-btn-danger"
                onClick={handleForceDelete}
                disabled={!confirmChecked}
              >
                <i className="bi bi-trash3-fill"></i>
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sales History Modal */}
      {salesHistory && (
        <div className="ap-modal-overlay" onClick={(e) => {
          if (e.target === e.currentTarget) closeModals();
        }}>
          <div className="ap-modal ap-modal-lg">
            <div className="ap-modal-header ap-modal-header-info">
              <i className="bi bi-clock-history"></i>
              <h3>Sales History ({salesHistory.salesCount} records)</h3>
              <button className="ap-modal-close" onClick={closeModals}>
                <i className="bi bi-x"></i>
              </button>
            </div>
            <div className="ap-modal-body ap-modal-scroll">
              {salesHistory.sales.length > 0 ? (
                <table className="ap-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Quantity</th>
                      <th>Sale Value</th>
                      <th>Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesHistory.sales.map((sale, index) => (
                      <tr key={index}>
                        <td>{formatDate(sale.createdAt)}</td>
                        <td>{sale.quantitySold}</td>
                        <td className="ap-text-success">{formatCurrency(sale.totalSaleValue)}</td>
                        <td className={sale.profit >= 0 ? 'ap-text-success fw-bold' : 'ap-text-danger fw-bold'}>
                          {sale.profit >= 0 ? '+' : ''}{formatCurrency(sale.profit)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="ap-text-center ap-text-muted ap-py-4">No sales history found</p>
              )}
            </div>
            <div className="ap-modal-footer">
              <button className="ap-btn-secondary" onClick={closeModals}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="ap-layout">
        {/* Add/Edit Form Column */}
        <div className="ap-form-column">
          <div className="ap-card">
            <div className="ap-card-header">
              <h5>
                {editId ? (
                  <>
                    <i className="bi bi-pencil-square ap-text-warning"></i>
                    Edit Product
                  </>
                ) : (
                  <>
                    <i className="bi bi-plus-circle ap-text-success"></i>
                    Add New Product
                  </>
                )}
              </h5>
              {/* View All Products Button */}
              <Link to="/admin-dashboard/all-products" className="ap-view-all-btn">
                <i className="bi bi-boxes"></i>
                View All Products
              </Link>
            </div>
            <div className="ap-card-body">
              {/* Alert Messages */}
              {error && (
                <div className="ap-alert ap-alert-danger">
                  <i className="bi bi-exclamation-triangle-fill"></i>
                  <span>{error}</span>
                  <button className="ap-alert-close" onClick={() => setError(null)}>
                    <i className="bi bi-x"></i>
                  </button>
                </div>
              )}
              
              {success && (
                <div className="ap-alert ap-alert-success">
                  <i className="bi bi-check-circle-fill"></i>
                  <span>{success}</span>
                  <button className="ap-alert-close" onClick={() => setSuccess(null)}>
                    <i className="bi bi-x"></i>
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="ap-form-group">
                  <label className="ap-label">Product Name *</label>
                  <input
                    className="ap-input"
                    name="name"
                    placeholder="Enter product name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="ap-form-group">
                  <label className="ap-label">Barcode</label>
                  <div className="ap-input-group">
                    <span className="ap-input-icon">
                      <i className="bi bi-upc-scan"></i>
                    </span>
                    <input
                      className="ap-input"
                      name="barcode"
                      placeholder="Leave empty for auto-generate"
                      value={formData.barcode}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="ap-form-group">
                  <label className="ap-label">Image URL</label>
                  <div className="ap-input-group">
                    <span className="ap-input-icon">
                      <i className="bi bi-image"></i>
                    </span>
                    <input
                      className="ap-input"
                      name="image"
                      placeholder="https://example.com/image.jpg"
                      value={formData.image}
                      onChange={handleChange}
                    />
                  </div>
                  {formData.image && (
                    <div className="ap-image-preview">
                      <img 
                        src={formData.image} 
                        alt="Preview" 
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    </div>
                  )}
                </div>

                <div className="ap-row">
                  <div className="ap-col">
                    <div className="ap-form-group">
                      <label className="ap-label">Purchase Rate (₹) *</label>
                      <div className="ap-input-group">
                        <span className="ap-input-icon">₹</span>
                        <input
                          className="ap-input"
                          name="purchaseRate"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={formData.purchaseRate}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="ap-col">
                    <div className="ap-form-group">
                      <label className="ap-label">Selling Rate (₹) *</label>
                      <div className="ap-input-group">
                        <span className="ap-input-icon">₹</span>
                        <input
                          className="ap-input"
                          name="sellingRate"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={formData.sellingRate}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="ap-row">
                  <div className="ap-col">
                    <div className="ap-form-group">
                      <label className="ap-label">Quantity *</label>
                      <div className="ap-input-group">
                        <span className="ap-input-icon">
                          <i className="bi bi-sort-numeric-up"></i>
                        </span>
                        <input
                          className="ap-input"
                          name="quantity"
                          type="number"
                          min="0"
                          placeholder="0"
                          value={formData.quantity}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="ap-col">
                    <div className="ap-form-group">
                      <label className="ap-label">GST (%)</label>
                      <div className="ap-input-group">
                        <span className="ap-input-icon">
                          <i className="bi bi-percent"></i>
                        </span>
                        <input
                          className="ap-input"
                          name="gst"
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          placeholder="0"
                          value={formData.gst}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {editId && (
                  <div className="ap-alert ap-alert-info">
                    <i className="bi bi-info-circle"></i>
                    Updating product will not affect existing sales
                  </div>
                )}

                <div className="ap-button-group">
                  <button 
                    type="submit" 
                    className={`ap-btn-submit ${editId ? 'ap-btn-warning' : 'ap-btn-success'}`}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="ap-spinner"></span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <i className={`bi ${editId ? "bi-pencil-square" : "bi-plus-circle"}`}></i>
                        {editId ? "Update Product" : "Add Product"}
                      </>
                    )}
                  </button>

                  {editId && (
                    <button
                      type="button"
                      className="ap-btn-cancel"
                      onClick={resetForm}
                    >
                      <i className="bi bi-x-circle"></i>
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Products List Column */}
        <div className="ap-list-column">
          <div className="ap-card">
            <div className="ap-card-header">
              <div className="ap-header-content">
                <h5>
                  <i className="bi bi-box-seam ap-text-primary"></i>
                  Product List
                  <span className="ap-badge-count">
                    {filteredProducts.length}
                  </span>
                </h5>
                <div className="ap-header-actions">
                  {/* View Toggle */}
                  <div className="ap-view-toggle">
                    <button 
                      className={`ap-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                      onClick={() => setViewMode('grid')}
                      title="Grid View"
                    >
                      <i className="bi bi-grid-3x3-gap-fill"></i>
                    </button>
                    <button 
                      className={`ap-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                      onClick={() => setViewMode('list')}
                      title="List View"
                    >
                      <i className="bi bi-list-ul"></i>
                    </button>
                  </div>
                  {/* Search */}
                  <div className="ap-search-wrapper">
                    <div className="ap-input-group">
                      <span className="ap-input-icon">
                        <i className="bi bi-search"></i>
                      </span>
                      <input
                        type="text"
                        className="ap-input ap-input-sm"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="ap-card-body ap-no-padding">
              {fetchLoading ? (
                <div className="ap-loading">
                  <div className="ap-spinner"></div>
                </div>
              ) : (
                <div className="ap-scroll-area">
                  <div className="ap-p-3">
                    {viewMode === 'grid' ? (
                      /* Grid View */
                      <div className="ap-grid">
                        {filteredProducts.map(product => {
                          const profit = product.sellingRate - product.purchaseRate;
                          const profitMargin = ((profit / product.purchaseRate) * 100).toFixed(1);
                          const stockStatus = getStockStatus(product.quantity);
                          
                          return (
                            <div className="ap-grid-item" key={product._id}>
                              <div className="ap-product-card">
                                <div className="ap-product-image">
                                  <img
                                    src={product.image || "https://via.placeholder.com/300x200?text=No+Image"}
                                    alt={product.name}
                                    onError={(e) => {
                                      e.target.src = "https://via.placeholder.com/300x200?text=No+Image";
                                    }}
                                  />
                                </div>
                                <div className="ap-product-info">
                                  <h6 className="ap-product-title">{product.name}</h6>
                                  <p className="ap-product-barcode">
                                    <code>{product.barcode}</code>
                                  </p>
                                  
                                  <div className="ap-badge-group">
                                    <span className="ap-badge ap-badge-primary">
                                      {formatCurrency(product.sellingRate)}
                                    </span>
                                    <span className={`ap-badge ap-badge-${stockStatus.class}`}>
                                      <i className={`bi ${stockStatus.icon}`}></i>
                                      {stockStatus.label}: {product.quantity}
                                    </span>
                                    <span className={`ap-badge ${profit >= 0 ? 'ap-badge-success' : 'ap-badge-danger'}`}>
                                      {profitMargin}% margin
                                    </span>
                                  </div>

                                  <div className="ap-action-group">
                                    <button
                                      className="ap-btn-icon ap-btn-info"
                                      onClick={() => viewSalesHistory(product._id)}
                                      title="View Sales History"
                                    >
                                      <i className="bi bi-clock-history"></i>
                                    </button>
                                    <button
                                      className="ap-btn-icon ap-btn-primary"
                                      onClick={() => editProduct(product)}
                                      title="Edit"
                                    >
                                      <i className="bi bi-pencil"></i>
                                    </button>
                                    <button
                                      className="ap-btn-icon ap-btn-danger"
                                      onClick={() => deleteProduct(product._id)}
                                      title="Delete"
                                    >
                                      <i className="bi bi-trash"></i>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {filteredProducts.length === 0 && (
                          <div className="ap-empty-state">
                            <i className="bi bi-box-seam"></i>
                            <p>No products found</p>
                            {searchTerm && (
                              <button 
                                className="ap-btn-outline-primary ap-btn-sm"
                                onClick={() => setSearchTerm('')}
                              >
                                Clear Search
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      /* List View */
                      <div className="ap-table-responsive">
                        <table className="ap-table ap-table-hover">
                          <thead>
                            <tr>
                              <th>Product</th>
                              <th>Barcode</th>
                              <th className="ap-text-end">Purchase</th>
                              <th className="ap-text-end">Selling</th>
                              <th className="ap-text-center">Stock</th>
                              <th className="ap-text-end">Margin</th>
                              <th className="ap-text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredProducts.map(product => {
                              const profit = product.sellingRate - product.purchaseRate;
                              const profitMargin = ((profit / product.purchaseRate) * 100).toFixed(1);
                              const stockStatus = getStockStatus(product.quantity);
                              
                              return (
                                <tr key={product._id}>
                                  <td>
                                    <div className="ap-product-cell">
                                      <img
                                        src={product.image || "https://via.placeholder.com/40x40?text=No+Image"}
                                        alt={product.name}
                                        onError={(e) => {
                                          e.target.src = "https://via.placeholder.com/40x40?text=No+Image";
                                        }}
                                      />
                                      <span className="ap-product-name">{product.name}</span>
                                    </div>
                                  </td>
                                  <td><code>{product.barcode}</code></td>
                                  <td className="ap-text-end ap-text-danger">{formatCurrency(product.purchaseRate)}</td>
                                  <td className="ap-text-end ap-text-success">{formatCurrency(product.sellingRate)}</td>
                                  <td className="ap-text-center">
                                    <span className={`ap-badge ap-badge-${stockStatus.class} ap-badge-sm`}>
                                      <i className={`bi ${stockStatus.icon}`}></i>
                                      {product.quantity}
                                    </span>
                                  </td>
                                  <td className="ap-text-end">
                                    <span className={`ap-badge ${profit >= 0 ? 'ap-badge-success' : 'ap-badge-danger'} ap-badge-sm`}>
                                      {profitMargin}%
                                    </span>
                                  </td>
                                  <td className="ap-text-center">
                                    <div className="ap-action-group ap-action-group-sm">
                                      <button
                                        className="ap-btn-icon ap-btn-info ap-btn-icon-sm"
                                        onClick={() => viewSalesHistory(product._id)}
                                        title="View Sales History"
                                      >
                                        <i className="bi bi-clock-history"></i>
                                      </button>
                                      <button
                                        className="ap-btn-icon ap-btn-primary ap-btn-icon-sm"
                                        onClick={() => editProduct(product)}
                                        title="Edit"
                                      >
                                        <i className="bi bi-pencil"></i>
                                      </button>
                                      <button
                                        className="ap-btn-icon ap-btn-danger ap-btn-icon-sm"
                                        onClick={() => deleteProduct(product._id)}
                                        title="Delete"
                                      >
                                        <i className="bi bi-trash"></i>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                            {filteredProducts.length === 0 && (
                              <tr>
                                <td colSpan="7" className="ap-text-center ap-py-4">
                                  <i className="bi bi-box-seam ap-empty-icon"></i>
                                  <p className="ap-text-muted">No products found</p>
                                  {searchTerm && (
                                    <button 
                                      className="ap-btn-outline-primary ap-btn-sm"
                                      onClick={() => setSearchTerm('')}
                                    >
                                      Clear Search
                                    </button>
                                  )}
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddProduct;