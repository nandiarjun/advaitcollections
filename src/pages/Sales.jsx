import { useEffect, useState } from "react";
import { productsAPI, salesAPI } from "../services/api";

function Sales() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantitySold, setQuantitySold] = useState("");
  const [customSellingPrice, setCustomSellingPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedProductDetails, setSelectedProductDetails] = useState(null);
  const [recentSales, setRecentSales] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    fetchProducts();
    fetchRecentSales();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await productsAPI.getAllProducts();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to load products");
    }
  };

  const fetchRecentSales = async () => {
    try {
      if (!token) {
        window.location.href = '/admin-login';
        return;
      }
      const data = await salesAPI.getSalesHistory();
      console.log("Recent sales data:", data); // Debug log
      
      // Ensure data is an array and sort by date (newest first)
      const salesArray = Array.isArray(data) ? data : [];
      const sortedSales = salesArray.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setRecentSales(sortedSales.slice(0, 10)); // Get last 10 sales
    } catch (error) {
      console.error("Error fetching recent sales:", error);
      setRecentSales([]);
    }
  };

  const handleProductSelect = (productId) => {
    setSelectedProduct(productId);
    const product = products.find(p => p._id === productId);
    setSelectedProductDetails(product);
    setCustomSellingPrice(product?.sellingRate || "");
    setError(null);
  };

  const validateSale = () => {
    if (!selectedProduct) {
      setError("Please select a product");
      return false;
    }
    if (!quantitySold || quantitySold <= 0) {
      setError("Please enter a valid quantity");
      return false;
    }
    const product = products.find(p => p._id === selectedProduct);
    if (Number(quantitySold) > product.quantity) {
      setError(`Only ${product.quantity} items available in stock`);
      return false;
    }
    return true;
  };

  const handleSell = async (e) => {
    e.preventDefault();
    
    if (!validateSale()) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!token) {
        window.location.href = '/admin-login';
        return;
      }

      const product = products.find(p => p._id === selectedProduct);
      
      const saleData = {
        productId: selectedProduct,
        quantitySold: Number(quantitySold),
      };

      // Only add customSellingPrice if it's different from default
      if (customSellingPrice && Number(customSellingPrice) !== product.sellingRate) {
        saleData.customSellingPrice = Number(customSellingPrice);
      }

      const res = await salesAPI.sellProduct(saleData);

      setSuccess(`✅ Sale Completed Successfully! Remaining Stock: ${res.remainingStock || 0}`);

      // Reset form
      setQuantitySold("");
      setCustomSellingPrice("");
      setSelectedProduct("");
      setSelectedProductDetails(null);
      
      // Refresh both products and recent sales
      await Promise.all([fetchProducts(), fetchRecentSales()]);

      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000);

    } catch (error) {
      console.error("Sale error:", error);
      setError(error.message || "Sale Failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const calculateExpectedProfit = () => {
    if (!selectedProductDetails || !quantitySold) return 0;
    const sellingPrice = Number(customSellingPrice || selectedProductDetails.sellingRate);
    const purchasePrice = selectedProductDetails.purchaseRate;
    return (sellingPrice - purchasePrice) * Number(quantitySold);
  };

  const calculateMargin = (profit, saleValue) => {
    if (!saleValue || saleValue === 0) return '0.0';
    return ((profit / saleValue) * 100).toFixed(1);
  };

  const inStockProducts = products.filter(p => p.quantity > 0);

  return (
    <div className="container-fluid py-4">
      <div className="row g-4">
        {/* Left Column - New Sale Form */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 pt-3">
              <h5 className="mb-0">
                <i className="bi bi-cart-plus me-2 text-success"></i>
                New Sale Transaction
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

              <form onSubmit={handleSell}>
                {/* Product Selection */}
                <div className="mb-4">
                  <label className="form-label fw-semibold">Select Product</label>
                  <select
                    className="form-select form-select-lg"
                    value={selectedProduct}
                    onChange={(e) => handleProductSelect(e.target.value)}
                    required
                  >
                    <option value="">Choose a product...</option>
                    {inStockProducts.map(product => (
                      <option key={product._id} value={product._id}>
                        {product.name} - Stock: {product.quantity} ({formatCurrency(product.sellingRate)}/unit)
                      </option>
                    ))}
                  </select>
                  
                  {inStockProducts.length === 0 && (
                    <div className="alert alert-warning mt-3">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      No products in stock. Please add products first.
                    </div>
                  )}
                </div>

                {/* Product Details Card */}
                {selectedProductDetails && (
                  <div className="card bg-light border-0 mb-4">
                    <div className="card-body">
                      <h6 className="fw-semibold mb-3">Product Details</h6>
                      <div className="row g-3">
                        <div className="col-sm-6">
                          <div className="d-flex align-items-center mb-2">
                            <i className="bi bi-box text-primary me-2"></i>
                            <span><strong>Name:</strong> {selectedProductDetails.name}</span>
                          </div>
                          <div className="d-flex align-items-center mb-2">
                            <i className="bi bi-upc-scan text-primary me-2"></i>
                            <span><strong>Barcode:</strong> {selectedProductDetails.barcode}</span>
                          </div>
                          <div className="d-flex align-items-center">
                            <i className="bi bi-boxes text-primary me-2"></i>
                            <span><strong>Stock:</strong> {selectedProductDetails.quantity}</span>
                          </div>
                        </div>
                        <div className="col-sm-6">
                          <div className="d-flex align-items-center mb-2">
                            <i className="bi bi-cart text-primary me-2"></i>
                            <span><strong>Purchase:</strong> {formatCurrency(selectedProductDetails.purchaseRate)}</span>
                          </div>
                          <div className="d-flex align-items-center mb-2">
                            <i className="bi bi-tag text-primary me-2"></i>
                            <span><strong>Selling:</strong> {formatCurrency(selectedProductDetails.sellingRate)}</span>
                          </div>
                          <div className="d-flex align-items-center">
                            <i className="bi bi-percent text-primary me-2"></i>
                            <span><strong>GST:</strong> {selectedProductDetails.gst}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quantity and Price */}
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Quantity *</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <i className="bi bi-sort-numeric-up"></i>
                      </span>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Enter quantity"
                        min="1"
                        max={selectedProductDetails?.quantity || 1}
                        value={quantitySold}
                        onChange={(e) => setQuantitySold(e.target.value)}
                        required
                      />
                    </div>
                    {selectedProductDetails && (
                      <small className="text-muted">
                        Max available: {selectedProductDetails.quantity}
                      </small>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Selling Price <span className="text-muted fw-normal">(Optional)</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light">₹</span>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Custom price"
                        min="0"
                        step="0.01"
                        value={customSellingPrice}
                        onChange={(e) => setCustomSellingPrice(e.target.value)}
                      />
                    </div>
                    {selectedProductDetails && (
                      <small className="text-muted">
                        Default: {formatCurrency(selectedProductDetails.sellingRate)}
                      </small>
                    )}
                  </div>
                </div>

                {/* Transaction Summary */}
                {selectedProductDetails && quantitySold && (
                  <div className="card bg-primary text-white mb-4">
                    <div className="card-body">
                      <h6 className="fw-semibold mb-3">Transaction Summary</h6>
                      <div className="row g-3">
                        <div className="col-4 text-center">
                          <small className="d-block text-white-50">Sale Amount</small>
                          <h5 className="mb-0">
                            {formatCurrency(
                              Number(customSellingPrice || selectedProductDetails.sellingRate) * Number(quantitySold)
                            )}
                          </h5>
                        </div>
                        <div className="col-4 text-center">
                          <small className="d-block text-white-50">Purchase Cost</small>
                          <h5 className="mb-0">
                            {formatCurrency(selectedProductDetails.purchaseRate * Number(quantitySold))}
                          </h5>
                        </div>
                        <div className="col-4 text-center">
                          <small className="d-block text-white-50">Expected Profit</small>
                          <h5 className="mb-0">
                            {formatCurrency(calculateExpectedProfit())}
                          </h5>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  className="btn btn-success btn-lg w-100"
                  disabled={loading || !selectedProduct || !quantitySold}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Processing Sale...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check2-circle me-2"></i>
                      Complete Sale
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right Column - Recent Transactions */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 pt-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="bi bi-clock-history me-2 text-primary"></i>
                Recent Transactions
              </h5>
              <span className="badge bg-primary">{recentSales.length} sales</span>
            </div>
            <div className="card-body p-0">
              <div className="list-group list-group-flush" style={{ maxHeight: "600px", overflowY: "auto" }}>
                {recentSales.length > 0 ? (
                  recentSales.map((sale, index) => (
                    <div key={sale._id || index} className="list-group-item border-0 border-bottom">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <h6 className="fw-semibold mb-1">
                            {sale.productId?.name || sale.productName || 'Unknown Product'}
                          </h6>
                          <small className="text-muted d-block">
                            <i className="bi bi-clock me-1"></i>
                            {formatDate(sale.createdAt)}
                          </small>
                          <small className="text-muted d-block">
                            <i className="bi bi-upc-scan me-1"></i>
                            Qty: {sale.quantitySold || 0}
                          </small>
                        </div>
                        <div className="text-end">
                          <span className={`badge ${sale.profit >= 0 ? 'bg-success' : 'bg-danger'} mb-1`}>
                            {sale.profit >= 0 ? '+' : ''}{formatCurrency(sale.profit)}
                          </span>
                          <div className="small text-muted">
                            Margin: {calculateMargin(sale.profit, sale.totalSaleValue)}%
                          </div>
                        </div>
                      </div>
                      <div className="d-flex justify-content-between align-items-center small bg-light p-2 rounded">
                        <div>
                          <span className="text-muted">Amount:</span>
                          <strong className="ms-1 text-primary">{formatCurrency(sale.totalSaleValue)}</strong>
                        </div>
                        <div>
                          <span className="text-muted">Purchase:</span>
                          <strong className="ms-1 text-danger">{formatCurrency(sale.totalPurchaseValue)}</strong>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-5">
                    <i className="bi bi-inbox fs-1 text-muted"></i>
                    <p className="text-muted mt-3 fw-semibold">No Sales Yet</p>
                    <p className="text-muted small mb-3">Complete your first sale to see it here</p>
                    <button 
                      className="btn btn-outline-primary btn-sm"
                      onClick={fetchRecentSales}
                    >
                      <i className="bi bi-arrow-repeat me-2"></i>
                      Refresh
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sales;