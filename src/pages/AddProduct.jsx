import { useState, useEffect } from "react";
import { productsAPI } from "../services/api";

function AddProduct() {
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

  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    fetchProducts();
  }, []);

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

  return (
    <div className="container-fluid py-4">
      {/* Delete Warning Modal */}
      {showDeleteModal && deleteWarning && (
        <div 
          className="modal show d-block" 
          style={{ backgroundColor: "rgba(0,0,0,0.5)", position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1050 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModals();
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  Warning: Product Has Sales History
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={closeModals}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <p className="fw-bold text-danger mb-3">
                  This product has <span className="badge bg-danger">{deleteWarning.salesCount}</span> sales records.
                </p>
                <p>Deleting this product will also delete all associated sales history. This action cannot be undone.</p>
                
                <div className="alert alert-warning mt-3">
                  <h6 className="mb-2">This will delete:</h6>
                  <ul className="mb-0 small">
                    <li>Product details and inventory</li>
                    <li>{deleteWarning.salesCount} sales transactions</li>
                    <li>All profit/loss records for this product</li>
                  </ul>
                </div>

                <div className="form-check mt-3">
                  <input 
                    type="checkbox" 
                    className="form-check-input" 
                    id="confirmDelete"
                    checked={confirmChecked}
                    onChange={(e) => setConfirmChecked(e.target.checked)}
                  />
                  <label className="form-check-label fw-bold" htmlFor="confirmDelete">
                    I understand this action cannot be undone and want to delete permanently
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={closeModals}
                >
                  <i className="bi bi-x-circle me-2"></i>
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={handleForceDelete}
                  disabled={!confirmChecked}
                >
                  <i className="bi bi-trash3-fill me-2"></i>
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sales History Modal */}
      {salesHistory && (
        <div 
          className="modal show d-block" 
          style={{ backgroundColor: "rgba(0,0,0,0.5)", position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1050 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModals();
          }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-info text-white">
                <h5 className="modal-title">
                  <i className="bi bi-clock-history me-2"></i>
                  Sales History ({salesHistory.salesCount} records)
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={closeModals}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body" style={{ maxHeight: "400px", overflowY: "auto" }}>
                {salesHistory.sales.length > 0 ? (
                  <table className="table table-sm table-hover">
                    <thead className="table-light">
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
                          <td>{formatCurrency(sale.totalSaleValue)}</td>
                          <td className={sale.profit >= 0 ? 'text-success fw-bold' : 'text-danger fw-bold'}>
                            {sale.profit >= 0 ? '+' : ''}{formatCurrency(sale.profit)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-center text-muted py-4">No sales history found</p>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={closeModals}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="row g-4">
        {/* Add/Edit Form Column */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 pt-3">
              <h5 className="mb-0">
                {editId ? (
                  <>
                    <i className="bi bi-pencil-square text-warning me-2"></i>
                    Edit Product
                  </>
                ) : (
                  <>
                    <i className="bi bi-plus-circle text-success me-2"></i>
                    Add New Product
                  </>
                )}
              </h5>
            </div>
            <div className="card-body">
              {/* Alert Messages */}
              {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {error}
                  <button type="button" className="btn-close" onClick={() => setError(null)}></button>
                </div>
              )}
              
              {success && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                  <i className="bi bi-check-circle-fill me-2"></i>
                  {success}
                  <button type="button" className="btn-close" onClick={() => setSuccess(null)}></button>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Product Name *</label>
                  <input
                    className="form-control"
                    name="name"
                    placeholder="Enter product name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Barcode</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <i className="bi bi-upc-scan"></i>
                    </span>
                    <input
                      className="form-control"
                      name="barcode"
                      placeholder="Leave empty for auto-generate"
                      value={formData.barcode}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Image URL</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <i className="bi bi-image"></i>
                    </span>
                    <input
                      className="form-control"
                      name="image"
                      placeholder="https://example.com/image.jpg"
                      value={formData.image}
                      onChange={handleChange}
                    />
                  </div>
                  {formData.image && (
                    <div className="mt-2">
                      <img 
                        src={formData.image} 
                        alt="Preview" 
                        style={{ height: '50px', width: '50px', objectFit: 'cover' }}
                        className="rounded border"
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    </div>
                  )}
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">Purchase Rate (₹) *</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light">₹</span>
                      <input
                        className="form-control"
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

                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">Selling Rate (₹) *</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light">₹</span>
                      <input
                        className="form-control"
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

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">Quantity *</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <i className="bi bi-sort-numeric-up"></i>
                      </span>
                      <input
                        className="form-control"
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

                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">GST (%)</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <i className="bi bi-percent"></i>
                      </span>
                      <input
                        className="form-control"
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

                {editId && (
                  <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    Updating product will not affect existing sales
                  </div>
                )}

                <div className="d-grid gap-2">
                  <button 
                    type="submit" 
                    className={`btn ${editId ? "btn-warning" : "btn-success"} btn-lg`}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <i className={`bi ${editId ? "bi-pencil-square" : "bi-plus-circle"} me-2`}></i>
                        {editId ? "Update Product" : "Add Product"}
                      </>
                    )}
                  </button>

                  {editId && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={resetForm}
                    >
                      <i className="bi bi-x-circle me-2"></i>
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Products List Column */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 pt-3">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="bi bi-box-seam text-primary me-2"></i>
                  Product List
                  <span className="badge bg-primary bg-opacity-10 text-primary ms-2">
                    {filteredProducts.length}
                  </span>
                </h5>
                <div style={{ width: "250px" }}>
                  <div className="input-group">
                    <span className="input-group-text bg-light">
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
              </div>
            </div>
            <div className="card-body p-0">
              {fetchLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <div style={{ maxHeight: "600px", overflowY: "auto" }}>
                  <div className="p-3">
                    <div className="row g-3">
                      {filteredProducts.map(product => {
                        const profit = product.sellingRate - product.purchaseRate;
                        const profitMargin = ((profit / product.purchaseRate) * 100).toFixed(1);
                        
                        return (
                          <div className="col-md-6" key={product._id}>
                            <div className="card h-100 border-0 shadow-sm product-card">
                              <div className="row g-0">
                                <div className="col-4">
                                  <img
                                    src={product.image || "https://via.placeholder.com/300x200?text=No+Image"}
                                    alt={product.name}
                                    className="img-fluid rounded-start h-100"
                                    style={{ objectFit: "cover", height: "120px", width: "100%" }}
                                    onError={(e) => {
                                      e.target.src = "https://via.placeholder.com/300x200?text=No+Image";
                                    }}
                                  />
                                </div>
                                <div className="col-8">
                                  <div className="card-body p-2">
                                    <h6 className="card-title mb-1 text-truncate fw-semibold">
                                      {product.name}
                                    </h6>
                                    <p className="card-text small mb-1">
                                      <code className="text-muted">{product.barcode}</code>
                                    </p>
                                    
                                    <div className="d-flex flex-wrap gap-1 mb-2">
                                      <span className="badge bg-primary bg-opacity-10 text-primary">
                                        {formatCurrency(product.sellingRate)}
                                      </span>
                                      <span className={`badge ${product.quantity > 0 ? 'bg-success' : 'bg-danger'} bg-opacity-10 text-${product.quantity > 0 ? 'success' : 'danger'}`}>
                                        Stock: {product.quantity}
                                      </span>
                                      <span className={`badge ${profit >= 0 ? 'bg-success' : 'bg-danger'} bg-opacity-10 text-${profit >= 0 ? 'success' : 'danger'}`}>
                                        {profitMargin}% margin
                                      </span>
                                    </div>

                                    <div className="d-flex gap-1">
                                      <button
                                        className="btn btn-sm btn-outline-info"
                                        onClick={() => viewSalesHistory(product._id)}
                                        title="View Sales History"
                                      >
                                        <i className="bi bi-clock-history"></i>
                                      </button>
                                      <button
                                        className="btn btn-sm btn-outline-primary"
                                        onClick={() => editProduct(product)}
                                        title="Edit"
                                      >
                                        <i className="bi bi-pencil"></i>
                                      </button>
                                      <button
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => deleteProduct(product._id)}
                                        title="Delete"
                                      >
                                        <i className="bi bi-trash"></i>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {filteredProducts.length === 0 && (
                        <div className="col-12 text-center py-5">
                          <i className="bi bi-box-seam display-1 text-muted"></i>
                          <p className="text-muted mt-3">No products found</p>
                          {searchTerm && (
                            <button 
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => setSearchTerm('')}
                            >
                              Clear Search
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS */}
      <style jsx="true">{`
        .product-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .product-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.1) !important;
        }
      `}</style>
    </div>
  );
}

export default AddProduct;