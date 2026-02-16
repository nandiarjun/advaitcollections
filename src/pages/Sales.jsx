import { useEffect, useState } from "react";
import { productsAPI, salesAPI } from "../services/api";
import "./Sales.css";

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
      console.log("Recent sales data:", data);
      
      const salesArray = Array.isArray(data) ? data : [];
      const sortedSales = salesArray.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setRecentSales(sortedSales.slice(0, 10));
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

      if (customSellingPrice && Number(customSellingPrice) !== product.sellingRate) {
        saleData.customSellingPrice = Number(customSellingPrice);
      }

      const res = await salesAPI.sellProduct(saleData);

      setSuccess(`✅ Sale Completed Successfully! Remaining Stock: ${res.remainingStock || 0}`);

      setQuantitySold("");
      setCustomSellingPrice("");
      setSelectedProduct("");
      setSelectedProductDetails(null);
      
      await Promise.all([fetchProducts(), fetchRecentSales()]);

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
    <div className="sls-container">
      <div className="sls-grid">
        {/* Left Column - New Sale Form */}
        <div className="sls-card">
          <div className="sls-card-header">
            <h5 className="sls-card-title">
              <i className="bi bi-cart-plus"></i>
              New Sale Transaction
            </h5>
          </div>
          <div className="sls-card-body">
            {/* Alert Messages */}
            {error && (
              <div className="sls-alert sls-alert-danger">
                <div className="sls-alert-content">
                  <i className="bi bi-exclamation-triangle-fill sls-alert-icon"></i>
                  <span>{error}</span>
                </div>
                <button className="sls-alert-close" onClick={() => setError(null)}>
                  <i className="bi bi-x"></i>
                </button>
              </div>
            )}
            
            {success && (
              <div className="sls-alert sls-alert-success">
                <div className="sls-alert-content">
                  <i className="bi bi-check-circle-fill sls-alert-icon"></i>
                  <span>{success}</span>
                </div>
                <button className="sls-alert-close" onClick={() => setSuccess(null)}>
                  <i className="bi bi-x"></i>
                </button>
              </div>
            )}

            <form onSubmit={handleSell}>
              {/* Product Selection */}
              <div className="sls-form-group">
                <label className="sls-label">Select Product</label>
                <select
                  className="sls-select"
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
                  <div className="sls-warning">
                    <i className="bi bi-exclamation-triangle"></i>
                    <span>No products in stock. Please add products first.</span>
                  </div>
                )}
              </div>

              {/* Product Details Card */}
              {selectedProductDetails && (
                <div className="sls-details-card">
                  <div className="sls-details-body">
                    <h6 className="sls-details-title">Product Details</h6>
                    <div className="sls-details-grid">
                      <div>
                        <div className="sls-detail-item">
                          <i className="bi bi-box sls-detail-icon"></i>
                          <span className="sls-detail-text">
                            <strong>Name:</strong> {selectedProductDetails.name}
                          </span>
                        </div>
                        <div className="sls-detail-item">
                          <i className="bi bi-upc-scan sls-detail-icon"></i>
                          <span className="sls-detail-text">
                            <strong>Barcode:</strong> {selectedProductDetails.barcode}
                          </span>
                        </div>
                        <div className="sls-detail-item">
                          <i className="bi bi-boxes sls-detail-icon"></i>
                          <span className="sls-detail-text">
                            <strong>Stock:</strong> {selectedProductDetails.quantity}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="sls-detail-item">
                          <i className="bi bi-cart sls-detail-icon"></i>
                          <span className="sls-detail-text">
                            <strong>Purchase:</strong> {formatCurrency(selectedProductDetails.purchaseRate)}
                          </span>
                        </div>
                        <div className="sls-detail-item">
                          <i className="bi bi-tag sls-detail-icon"></i>
                          <span className="sls-detail-text">
                            <strong>Selling:</strong> {formatCurrency(selectedProductDetails.sellingRate)}
                          </span>
                        </div>
                        <div className="sls-detail-item">
                          <i className="bi bi-percent sls-detail-icon"></i>
                          <span className="sls-detail-text">
                            <strong>GST:</strong> {selectedProductDetails.gst}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Quantity and Price */}
              <div className="sls-row">
                <div className="sls-input-group">
                  <label className="sls-label">Quantity *</label>
                  <div className="sls-input-wrapper">
                    <span className="sls-input-prefix">
                      <i className="bi bi-sort-numeric-up"></i>
                    </span>
                    <input
                      type="number"
                      className="sls-input"
                      placeholder="Enter quantity"
                      min="1"
                      max={selectedProductDetails?.quantity || 1}
                      value={quantitySold}
                      onChange={(e) => setQuantitySold(e.target.value)}
                      required
                    />
                  </div>
                  {selectedProductDetails && (
                    <small className="sls-input-hint">
                      Max available: {selectedProductDetails.quantity}
                    </small>
                  )}
                </div>

                <div className="sls-input-group">
                  <label className="sls-label">
                    Selling Price <span className="sls-input-hint">(Optional)</span>
                  </label>
                  <div className="sls-input-wrapper">
                    <span className="sls-input-prefix">₹</span>
                    <input
                      type="number"
                      className="sls-input"
                      placeholder="Custom price"
                      min="0"
                      step="0.01"
                      value={customSellingPrice}
                      onChange={(e) => setCustomSellingPrice(e.target.value)}
                    />
                  </div>
                  {selectedProductDetails && (
                    <small className="sls-input-hint">
                      Default: {formatCurrency(selectedProductDetails.sellingRate)}
                    </small>
                  )}
                </div>
              </div>

              {/* Transaction Summary */}
              {selectedProductDetails && quantitySold && (
                <div className="sls-summary-card">
                  <div className="sls-summary-body">
                    <h6 className="sls-summary-title">Transaction Summary</h6>
                    <div className="sls-summary-grid">
                      <div>
                        <span className="sls-summary-label">Sale Amount</span>
                        <h5 className="sls-summary-value">
                          {formatCurrency(
                            Number(customSellingPrice || selectedProductDetails.sellingRate) * Number(quantitySold)
                          )}
                        </h5>
                      </div>
                      <div>
                        <span className="sls-summary-label">Purchase Cost</span>
                        <h5 className="sls-summary-value">
                          {formatCurrency(selectedProductDetails.purchaseRate * Number(quantitySold))}
                        </h5>
                      </div>
                      <div>
                        <span className="sls-summary-label">Expected Profit</span>
                        <h5 className="sls-summary-value">
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
                className="sls-submit-btn"
                disabled={loading || !selectedProduct || !quantitySold}
              >
                {loading ? (
                  <>
                    <span className="sls-spinner"></span>
                    Processing Sale...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check2-circle"></i>
                    Complete Sale
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column - Recent Transactions */}
        <div className="sls-card">
          <div className="sls-transactions-header">
            <div className="sls-transactions-title">
              <i className="bi bi-clock-history sls-primary-icon"></i>
              <h5>Recent Transactions</h5>
            </div>
            <span className="sls-badge">{recentSales.length} sales</span>
          </div>
          <div className="sls-transactions-list">
            {recentSales.length > 0 ? (
              recentSales.map((sale, index) => (
                <div key={sale._id || index} className="sls-transaction-item">
                  <div className="sls-transaction-header">
                    <div>
                      <h6 className="sls-product-name">
                        {sale.productId?.name || sale.productName || 'Unknown Product'}
                      </h6>
                      <div className="sls-transaction-meta">
                        <span className="sls-meta-item">
                          <i className="bi bi-clock"></i>
                          {formatDate(sale.createdAt)}
                        </span>
                        <span className="sls-meta-item">
                          <i className="bi bi-upc-scan"></i>
                          Qty: {sale.quantitySold || 0}
                        </span>
                      </div>
                    </div>
                    <div className="text-end">
                      <span className={`sls-profit-badge ${sale.profit >= 0 ? 'success' : 'danger'}`}>
                        {sale.profit >= 0 ? '+' : ''}{formatCurrency(sale.profit)}
                      </span>
                      <div className={`sls-margin-text ${sale.profit >= 0 ? 'success' : 'danger'}`}>
                        Margin: {calculateMargin(sale.profit, sale.totalSaleValue)}%
                      </div>
                    </div>
                  </div>
                  <div className="sls-transaction-footer">
                    <div className="sls-footer-item">
                      <span className="sls-footer-label">Amount:</span>
                      <span className="sls-footer-value primary">{formatCurrency(sale.totalSaleValue)}</span>
                    </div>
                    <div className="sls-footer-item">
                      <span className="sls-footer-label">Purchase:</span>
                      <span className="sls-footer-value danger">{formatCurrency(sale.totalPurchaseValue)}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="sls-empty-state">
                <i className="bi bi-inbox sls-empty-icon"></i>
                <p className="sls-empty-title">No Sales Yet</p>
                <p className="sls-empty-text">Complete your first sale to see it here</p>
                <button 
                  className="sls-refresh-btn"
                  onClick={fetchRecentSales}
                >
                  <i className="bi bi-arrow-repeat"></i>
                  Refresh
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sales;